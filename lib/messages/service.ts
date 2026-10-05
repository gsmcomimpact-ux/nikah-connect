import "server-only";
import { db } from "@/lib/db";
import { notify } from "@/lib/notifications/service";
import { flagUser } from "@/lib/matching/requests";
import { analyzeContent, FLAG_THRESHOLD, type RiskSignal } from "@/lib/security/scam-detection";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { cleanText } from "@/lib/security/sanitize";
import { isBlockedBetween } from "@/lib/profile/queries";

export const MAX_MESSAGE_LENGTH = 2000;
/** Seuil d'envoi vers des conversations distinctes en 10 min au-delà duquel un envoi massif est suspecté. */
const MASS_MESSAGING_CONVERSATIONS = 8;
/** Les pièces jointes ne sont permises qu'après un minimum d'échanges. */
export const ATTACHMENT_MIN_MESSAGES = 10;

export type SendResult =
  | { ok: true; messageId: string; warning?: string }
  | { ok: false; error: string; needsConfirmation?: boolean; signals?: RiskSignal[] };

export async function listConversations(userId: string) {
  const participations = await db.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          match: { select: { status: true } },
          participants: { include: { user: { select: { id: true, status: true, profile: { select: { displayName: true } } } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, where: { status: "VISIBLE" } },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
  });

  const visible = participations.filter((p) => !p.deletedAt || p.conversation.lastMessageAt > p.deletedAt);
  return Promise.all(
    visible.map(async (p) => {
      const other = p.conversation.participants.find((x) => x.userId !== userId)?.user;
      const since = [p.lastReadAt, p.deletedAt].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] ?? undefined;
      const unread = await db.message.count({
        where: { conversationId: p.conversationId, status: "VISIBLE", senderId: { not: userId }, NOT: { senderId: null }, ...(since ? { createdAt: { gt: since } } : {}) },
      });
      return {
        id: p.conversationId,
        otherUserId: other?.id ?? null,
        otherName: other && other.status !== "DELETED" ? (other.profile?.displayName ?? "Membre") : "Membre supprimé",
        lastMessage: p.conversation.messages[0] ?? null,
        lastMessageAt: p.conversation.lastMessageAt,
        unread,
        active: p.conversation.match?.status === "ACTIVE",
      };
    }),
  );
}

export async function totalUnreadMessages(userId: string): Promise<number> {
  const conversations = await listConversations(userId);
  return conversations.reduce((sum, c) => sum + c.unread, 0);
}

/** Vérifie qu'un utilisateur participe à la conversation et retourne son contexte. */
export async function getConversationContext(userId: string, conversationId: string) {
  const participant = await db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    include: {
      conversation: {
        include: {
          match: true,
          participants: { include: { user: { select: { id: true, status: true, profile: { select: { displayName: true, photoVisibility: true } } } } } },
        },
      },
    },
  });
  if (!participant) return null;
  const other = participant.conversation.participants.find((p) => p.userId !== userId)?.user ?? null;
  const blocked = other ? await isBlockedBetween(userId, other.id) : true;
  const canWrite = participant.conversation.match?.status === "ACTIVE" && other?.status === "ACTIVE" && !blocked;
  return { participant, other, blocked, canWrite };
}

export async function getMessages(userId: string, conversationId: string, after?: Date) {
  const ctx = await getConversationContext(userId, conversationId);
  if (!ctx) return null;
  const since = ctx.participant.deletedAt;
  const messages = await db.message.findMany({
    where: {
      conversationId,
      // Un message masqué par la modération reste visible pour son auteur avec un indicateur.
      OR: [{ status: "VISIBLE" }, { senderId: userId }],
      ...(since || after ? { createdAt: { gt: [since, after].filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0]! } } : {}),
    },
    include: { attachments: { select: { id: true, mimeType: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  await db.conversationParticipant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() } });
  return { ctx, messages };
}

export async function sendMessage(params: { userId: string; conversationId: string; body: string; confirmContact?: boolean; attachmentKeys?: { key: string; mimeType: string; size: number }[] }): Promise<SendResult> {
  const { userId, conversationId } = params;
  const ctx = await getConversationContext(userId, conversationId);
  if (!ctx) return { ok: false, error: "Conversation introuvable." };
  if (!ctx.canWrite) return { ok: false, error: "Cette conversation est fermée." };

  const body = cleanText(params.body, MAX_MESSAGE_LENGTH);
  if (!body && !params.attachmentKeys?.length) return { ok: false, error: "Le message est vide." };

  const limit = await rateLimit(`msg:${userId}`, LIMITS.messages.limit, LIMITS.messages.windowSec);
  if (!limit.ok) return { ok: false, error: `Vous envoyez beaucoup de messages. Réessayez dans ${Math.ceil(limit.retryAfterSec / 60)} min.` };

  const analysis = analyzeContent(body);
  if (analysis.containsContactInfo && !params.confirmContact) {
    return {
      ok: false,
      needsConfirmation: true,
      signals: analysis.signals,
      error: "Votre message semble contenir des coordonnées personnelles. Nous recommandons de ne les partager qu'une fois la confiance établie. Confirmez-vous l'envoi ?",
    };
  }

  const flagged = analysis.riskScore >= FLAG_THRESHOLD;
  const message = await db.message.create({
    data: {
      conversationId,
      senderId: userId,
      body,
      flagged,
      flagReasons: analysis.signals,
      attachments: params.attachmentKeys?.length
        ? { create: params.attachmentKeys.map((a) => ({ storageKey: a.key, mimeType: a.mimeType, sizeBytes: a.size })) }
        : undefined,
    },
  });
  await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: message.createdAt } });

  if (flagged) {
    const reason = analysis.signals.includes("MONEY_REQUEST") ? "MONEY_REQUEST" : "SCAM";
    await flagUser(userId, reason, `Message à risque détecté (${analysis.signals.join(", ")}).`, message.id);
  }
  await detectMassMessaging(userId, body);

  if (ctx.other) {
    const link = `/espace/messages/${conversationId}`;
    const pending = await db.notification.findFirst({ where: { userId: ctx.other.id, type: "NEW_MESSAGE", link, readAt: null } });
    if (!pending) {
      const sender = await db.profile.findUnique({ where: { userId }, select: { displayName: true } });
      // Le contenu du message n'est jamais copié dans la notification.
      await notify({ userId: ctx.other.id, type: "NEW_MESSAGE", title: "Nouveau message", body: `${sender?.displayName ?? "Un membre"} vous a écrit.`, link });
    }
  }

  return {
    ok: true,
    messageId: message.id,
    warning: flagged ? "Rappel de sécurité : ne demandez jamais d'argent et ne partagez jamais d'informations bancaires." : undefined,
  };
}

/** Détecte l'envoi d'un même message à de nombreuses personnes en peu de temps. */
async function detectMassMessaging(userId: string, body: string) {
  const since = new Date(Date.now() - 10 * 60_000);
  const recent = await db.message.findMany({ where: { senderId: userId, createdAt: { gte: since } }, select: { conversationId: true, body: true } });
  const conversations = new Set(recent.map((m) => m.conversationId));
  const identical = new Set(recent.filter((m) => m.body === body && body.length > 20).map((m) => m.conversationId));
  if (conversations.size >= MASS_MESSAGING_CONVERSATIONS || identical.size >= 4) {
    await flagUser(userId, "SPAM", `Envoi massif détecté : ${conversations.size} conversations en 10 min (${identical.size} messages identiques).`);
  }
}

export async function deleteConversationForUser(userId: string, conversationId: string): Promise<boolean> {
  const res = await db.conversationParticipant.updateMany({ where: { conversationId, userId }, data: { deletedAt: new Date() } });
  return res.count > 0;
}

/** Règles d'accès aux pièces jointes (images uniquement, après un minimum d'échanges). */
export async function attachmentsAllowed(conversationId: string): Promise<boolean> {
  const counts = await db.message.groupBy({ by: ["senderId"], where: { conversationId, senderId: { not: null } }, _count: true });
  const total = counts.reduce((s, c) => s + c._count, 0);
  return counts.length >= 2 && total >= ATTACHMENT_MIN_MESSAGES;
}
