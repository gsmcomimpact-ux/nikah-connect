import "server-only";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { planFeatures } from "@/lib/billing/plans";
import { notify } from "@/lib/notifications/service";
import { analyzeContent, FLAG_THRESHOLD } from "@/lib/security/scam-detection";
import { rateLimit } from "@/lib/security/rate-limit";
import { cleanText } from "@/lib/security/sanitize";
import { getPairCompatibility } from "@/lib/matching/candidates";
import { isBlockedBetween } from "@/lib/profile/queries";
import { pairKey, startOfDay } from "@/lib/utils";

export type ActionResult = { ok: true; message?: string; matched?: boolean; conversationId?: string } | { ok: false; error: string };

/** Seuil au-delà duquel un volume de demandes déclenche un signalement automatique. */
const MASS_REQUEST_THRESHOLD = { limit: 25, windowSec: 3600 };

async function eligibleTarget(fromId: string, toId: string): Promise<string | null> {
  if (fromId === toId) return "Action impossible sur votre propre profil.";
  const [from, to] = await Promise.all([
    db.profile.findUnique({ where: { userId: fromId }, select: { gender: true } }),
    db.profile.findUnique({ where: { userId: toId }, select: { gender: true, isVisible: true, user: { select: { status: true, onboardingStep: true } } } }),
  ]);
  if (!from || !to || to.user.status !== "ACTIVE" || !to.isVisible || to.user.onboardingStep < 6) return "Ce profil n'est pas disponible.";
  if (from.gender === to.gender) return "Ce profil n'est pas disponible.";
  if (await isBlockedBetween(fromId, toId)) return "Ce profil n'est pas disponible.";
  return null;
}

/** Crée la compatibilité mutuelle et la conversation associée (idempotent). */
async function createMutualMatch(u1: string, u2: string): Promise<string> {
  const [userAId, userBId] = pairKey(u1, u2);
  const compat = await getPairCompatibility(u1, u2);
  return db.$transaction(async (tx) => {
    const match = await tx.match.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId, score: compat?.score ?? 0 },
      update: { status: "ACTIVE", endedAt: null },
    });
    const existing = await tx.conversation.findUnique({ where: { matchId: match.id } });
    if (existing) {
      await tx.conversationParticipant.updateMany({ where: { conversationId: existing.id }, data: { deletedAt: null } });
      return existing.id;
    }
    const conv = await tx.conversation.create({
      data: {
        matchId: match.id,
        participants: { create: [{ userId: userAId }, { userId: userBId }] },
        messages: {
          create: {
            senderId: null,
            body: "Compatibilité mutuelle ! Vous pouvez désormais échanger dans le respect. Rappel : ne transférez jamais d'argent et gardez vos échanges sur la plateforme tant que la confiance n'est pas établie.",
          },
        },
      },
    });
    return conv.id;
  });
}

export async function sendInterest(fromId: string, toId: string, rawNote?: string): Promise<ActionResult> {
  const problem = await eligibleTarget(fromId, toId);
  if (problem) return { ok: false, error: problem };

  const existing = await db.like.findUnique({ where: { fromUserId_toUserId: { fromUserId: fromId, toUserId: toId } } });
  if (existing?.type === "INTEREST" && existing.status !== "WITHDRAWN") return { ok: false, error: "Vous avez déjà envoyé une demande à ce profil." };

  // Quota quotidien selon l'abonnement.
  const sub = await db.subscription.findUnique({ where: { userId: fromId } });
  const plan = planFeatures(sub);
  const sentToday = await db.like.count({ where: { fromUserId: fromId, type: "INTEREST", createdAt: { gte: startOfDay() } } });
  if (sentToday >= plan.dailyRequests) {
    return { ok: false, error: `Vous avez atteint votre limite de ${plan.dailyRequests} demandes aujourd'hui.${plan.plan === "FREE" ? " Passez à Premium pour en envoyer davantage." : ""}` };
  }

  // Détection de comportements massifs (envoi de demandes en rafale).
  const burst = await rateLimit(`mass-requests:${fromId}`, MASS_REQUEST_THRESHOLD.limit, MASS_REQUEST_THRESHOLD.windowSec);
  if (!burst.ok) {
    await flagUser(fromId, "SPAM", "Volume anormal de demandes envoyées en moins d'une heure.");
    return { ok: false, error: "Trop de demandes en peu de temps. Merci de patienter." };
  }

  const note = rawNote ? cleanText(rawNote, 300) : undefined;
  if (note) {
    const analysis = analyzeContent(note);
    if (analysis.containsContactInfo) return { ok: false, error: "Par sécurité, ne partagez pas vos coordonnées dans une demande." };
    if (analysis.riskScore >= FLAG_THRESHOLD) {
      await flagUser(fromId, analysis.signals.includes("MONEY_REQUEST") ? "MONEY_REQUEST" : "SCAM", `Contenu à risque dans une demande : ${analysis.signals.join(", ")}`);
      return { ok: false, error: "Votre message contient des éléments non autorisés (argent, liens ou informations bancaires)." };
    }
  }

  const reverse = await db.like.findUnique({ where: { fromUserId_toUserId: { fromUserId: toId, toUserId: fromId } } });
  if (reverse?.type === "INTEREST" && reverse.status === "PENDING") {
    await db.like.upsert({
      where: { fromUserId_toUserId: { fromUserId: fromId, toUserId: toId } },
      create: { fromUserId: fromId, toUserId: toId, type: "INTEREST", status: "ACCEPTED", note },
      update: { type: "INTEREST", status: "ACCEPTED", note, createdAt: new Date() },
    });
    await db.like.update({ where: { id: reverse.id }, data: { status: "ACCEPTED" } });
    const conversationId = await createMutualMatch(fromId, toId);
    await notifyMutual(fromId, toId, conversationId);
    return { ok: true, matched: true, conversationId, message: "Compatibilité mutuelle ! Vous pouvez maintenant échanger." };
  }

  await db.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: fromId, toUserId: toId } },
    create: { fromUserId: fromId, toUserId: toId, type: "INTEREST", status: "PENDING", note },
    update: { type: "INTEREST", status: "PENDING", note, createdAt: new Date() },
  });
  const sender = await db.profile.findUnique({ where: { userId: fromId }, select: { displayName: true } });
  await notify({
    userId: toId,
    type: "REQUEST_RECEIVED",
    title: "Nouvelle demande reçue",
    body: `${sender?.displayName ?? "Un membre"} a manifesté son intérêt pour votre profil.`,
    link: "/espace/demandes",
  });
  return { ok: true, message: "Demande envoyée. Vous serez notifié(e) en cas de réponse." };
}

async function notifyMutual(a: string, b: string, conversationId: string) {
  const profiles = await db.profile.findMany({ where: { userId: { in: [a, b] } }, select: { userId: true, displayName: true } });
  const name = (id: string) => profiles.find((p) => p.userId === id)?.displayName ?? "Un membre";
  await Promise.all([
    notify({ userId: a, type: "REQUEST_ACCEPTED", title: "Compatibilité mutuelle", body: `Vous et ${name(b)} avez manifesté un intérêt réciproque.`, link: `/espace/messages/${conversationId}` }),
    notify({ userId: b, type: "REQUEST_ACCEPTED", title: "Compatibilité mutuelle", body: `Vous et ${name(a)} avez manifesté un intérêt réciproque.`, link: `/espace/messages/${conversationId}` }),
  ]);
}

export async function passProfile(fromId: string, toId: string): Promise<ActionResult> {
  if (fromId === toId) return { ok: false, error: "Action impossible." };
  const existing = await db.like.findUnique({ where: { fromUserId_toUserId: { fromUserId: fromId, toUserId: toId } } });
  if (existing?.type === "INTEREST" && existing.status === "ACCEPTED") return { ok: false, error: "Vous êtes déjà en compatibilité mutuelle avec ce profil." };
  await db.like.upsert({
    where: { fromUserId_toUserId: { fromUserId: fromId, toUserId: toId } },
    create: { fromUserId: fromId, toUserId: toId, type: "PASS", status: "DECLINED" },
    update: { type: "PASS", status: "DECLINED" },
  });
  return { ok: true, message: "Profil passé. Il ne vous sera plus suggéré." };
}

/** Réponse à une demande reçue. */
export async function respondToRequest(userId: string, likeId: string, accept: boolean): Promise<ActionResult> {
  const like = await db.like.findUnique({ where: { id: likeId } });
  if (!like || like.toUserId !== userId || like.type !== "INTEREST" || like.status !== "PENDING") return { ok: false, error: "Demande introuvable ou déjà traitée." };

  if (!accept) {
    await db.like.update({ where: { id: likeId }, data: { status: "DECLINED" } });
    return { ok: true, message: "Demande déclinée avec discrétion. L'autre personne n'est pas notifiée." };
  }
  const problem = await eligibleTarget(userId, like.fromUserId);
  if (problem) return { ok: false, error: problem };

  await db.$transaction([
    db.like.update({ where: { id: likeId }, data: { status: "ACCEPTED" } }),
    db.like.upsert({
      where: { fromUserId_toUserId: { fromUserId: userId, toUserId: like.fromUserId } },
      create: { fromUserId: userId, toUserId: like.fromUserId, type: "INTEREST", status: "ACCEPTED" },
      update: { type: "INTEREST", status: "ACCEPTED" },
    }),
  ]);
  const conversationId = await createMutualMatch(userId, like.fromUserId);
  await notifyMutual(userId, like.fromUserId, conversationId);
  return { ok: true, matched: true, conversationId, message: "Demande acceptée : compatibilité mutuelle !" };
}

export async function withdrawRequest(userId: string, likeId: string): Promise<ActionResult> {
  const like = await db.like.findUnique({ where: { id: likeId } });
  if (!like || like.fromUserId !== userId || like.status !== "PENDING") return { ok: false, error: "Demande introuvable." };
  await db.like.update({ where: { id: likeId }, data: { status: "WITHDRAWN" } });
  return { ok: true, message: "Demande retirée." };
}

/** Met fin à une compatibilité mutuelle : la conversation devient en lecture seule. */
export async function endMatch(userId: string, otherId: string): Promise<ActionResult> {
  const [userAId, userBId] = pairKey(userId, otherId);
  const match = await db.match.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
  if (!match || match.status !== "ACTIVE") return { ok: false, error: "Aucune compatibilité active." };
  await db.match.update({ where: { id: match.id }, data: { status: "ENDED", endedAt: new Date() } });
  await db.like.updateMany({ where: { OR: [{ fromUserId: userId, toUserId: otherId }, { fromUserId: otherId, toUserId: userId }] }, data: { status: "WITHDRAWN" } });
  return { ok: true, message: "L'échange a été clôturé." };
}

/** Signalement automatique (source SYSTEM), dédoublonné sur 24 h. */
export async function flagUser(userId: string, reason: "SPAM" | "SCAM" | "MONEY_REQUEST" | "FRAUD", details: string, messageId?: string) {
  const recent = await db.report.findFirst({
    where: { reportedUserId: userId, source: "SYSTEM", reason, status: { in: ["OPEN", "IN_REVIEW"] }, createdAt: { gte: new Date(Date.now() - 86400_000) } },
  });
  if (recent) return;
  await db.report.create({ data: { reportedUserId: userId, reason, details, source: "SYSTEM", messageId } });
  await audit({ action: "system.auto_report", targetType: "user", targetId: userId, metadata: { reason, details } });
}
