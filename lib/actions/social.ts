"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { AuthError, requireApiUser } from "@/lib/auth/guards";
import { endMatch, passProfile, respondToRequest, sendInterest, withdrawRequest, type ActionResult } from "@/lib/matching/requests";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { reportSchema } from "@/lib/validation/schemas";

async function guard<T extends ActionResult>(fn: (userId: string) => Promise<T>): Promise<ActionResult> {
  try {
    const user = await requireApiUser();
    if (user.onboardingStep < 6) return { ok: false, error: "Terminez d'abord votre inscription." };
    return await fn(user.id);
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error(err);
    return { ok: false, error: "Une erreur est survenue. Réessayez." };
  }
}

const id = (v: unknown) => (typeof v === "string" && /^[a-z0-9]{10,40}$/i.test(v) ? v : "");

export async function sendInterestAction(targetId: string, note?: string): Promise<ActionResult> {
  return guard(async (userId) => {
    const res = await sendInterest(userId, id(targetId), note);
    revalidatePath("/espace", "layout");
    return res;
  });
}

export async function passAction(targetId: string): Promise<ActionResult> {
  return guard(async (userId) => passProfile(userId, id(targetId)));
}

export async function respondToRequestAction(likeId: string, accept: boolean): Promise<ActionResult> {
  return guard(async (userId) => {
    const res = await respondToRequest(userId, id(likeId), accept);
    revalidatePath("/espace", "layout");
    return res;
  });
}

export async function withdrawRequestAction(likeId: string): Promise<ActionResult> {
  return guard(async (userId) => {
    const res = await withdrawRequest(userId, id(likeId));
    revalidatePath("/espace/demandes");
    return res;
  });
}

export async function endMatchAction(otherId: string): Promise<ActionResult> {
  return guard(async (userId) => {
    const res = await endMatch(userId, id(otherId));
    revalidatePath("/espace", "layout");
    return res;
  });
}

export async function toggleFavoriteAction(targetId: string): Promise<ActionResult & { favorite?: boolean }> {
  return guard(async (userId) => {
    const target = id(targetId);
    if (!target || target === userId) return { ok: false, error: "Action impossible." };
    const existing = await db.favorite.findUnique({ where: { userId_targetId: { userId, targetId: target } } });
    if (existing) {
      await db.favorite.delete({ where: { userId_targetId: { userId, targetId: target } } });
      revalidatePath("/espace/favoris");
      return { ok: true, message: "Retiré de vos favoris." };
    }
    const count = await db.favorite.count({ where: { userId } });
    if (count >= 200) return { ok: false, error: "Vous avez atteint le nombre maximal de favoris." };
    await db.favorite.create({ data: { userId, targetId: target } });
    revalidatePath("/espace/favoris");
    return { ok: true, message: "Ajouté à vos favoris." };
  });
}

export async function blockUserAction(targetId: string): Promise<ActionResult> {
  return guard(async (userId) => {
    const target = id(targetId);
    if (!target || target === userId) return { ok: false, error: "Action impossible." };
    await db.block.upsert({ where: { blockerId_blockedId: { blockerId: userId, blockedId: target } }, create: { blockerId: userId, blockedId: target }, update: {} });
    // Le blocage met fin à toute compatibilité et retire les demandes en cours.
    await endMatch(userId, target).catch(() => undefined);
    await db.like.updateMany({ where: { OR: [{ fromUserId: userId, toUserId: target }, { fromUserId: target, toUserId: userId }], status: "PENDING" }, data: { status: "WITHDRAWN" } });
    await db.favorite.deleteMany({ where: { OR: [{ userId, targetId: target }, { userId: target, targetId: userId }] } });
    await audit({ actorId: userId, action: "user.block", targetType: "user", targetId: target });
    revalidatePath("/espace", "layout");
    return { ok: true, message: "Membre bloqué. Vous ne verrez plus ce profil et il ne pourra plus vous contacter." };
  });
}

export async function unblockUserAction(targetId: string): Promise<ActionResult> {
  return guard(async (userId) => {
    await db.block.deleteMany({ where: { blockerId: userId, blockedId: id(targetId) } });
    revalidatePath("/espace/parametres/confidentialite");
    return { ok: true, message: "Membre débloqué." };
  });
}

export async function reportAction(input: { reportedUserId: string; reason: string; details?: string; messageId?: string; alsoBlock?: boolean }): Promise<ActionResult> {
  return guard(async (userId) => {
    const parsed = reportSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Signalement invalide." };
    const d = parsed.data;
    if (d.reportedUserId === userId) return { ok: false, error: "Action impossible." };
    const limit = await rateLimit(`report:${userId}`, LIMITS.reports.limit, LIMITS.reports.windowSec);
    if (!limit.ok) return { ok: false, error: "Trop de signalements envoyés aujourd'hui." };

    if (d.messageId) {
      // On ne peut signaler qu'un message reçu dans l'une de ses conversations.
      const msg = await db.message.findFirst({ where: { id: d.messageId, senderId: d.reportedUserId, conversation: { participants: { some: { userId } } } } });
      if (!msg) return { ok: false, error: "Message introuvable." };
    }
    const target = await db.user.findUnique({ where: { id: d.reportedUserId }, select: { id: true } });
    if (!target) return { ok: false, error: "Membre introuvable." };

    const report = await db.report.create({ data: { reporterId: userId, reportedUserId: d.reportedUserId, reason: d.reason, details: d.details, messageId: d.messageId } });
    await audit({ actorId: userId, action: "report.create", targetType: "report", targetId: report.id, metadata: { reason: d.reason } });
    if (input.alsoBlock) await blockUserAction(d.reportedUserId);
    return { ok: true, message: "Merci. Votre signalement a été transmis à l'équipe de modération, qui le traitera en toute confidentialité." };
  });
}
