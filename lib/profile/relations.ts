import "server-only";
import { db } from "@/lib/db";
import { pairKey } from "@/lib/utils";

export type RelationStatus = "none" | "sent" | "matched" | "received";

/** Statut de la relation entre l'utilisateur et une liste de profils (pour l'affichage des boutons). */
export async function getRelationStatuses(userId: string, targetIds: string[]): Promise<Map<string, { status: RelationStatus; conversationId: string | null; favorite: boolean }>> {
  const result = new Map<string, { status: RelationStatus; conversationId: string | null; favorite: boolean }>();
  if (targetIds.length === 0) return result;
  const [likes, matches, favorites] = await Promise.all([
    db.like.findMany({ where: { type: "INTEREST", status: { in: ["PENDING", "ACCEPTED"] }, OR: [{ fromUserId: userId, toUserId: { in: targetIds } }, { toUserId: userId, fromUserId: { in: targetIds } }] } }),
    db.match.findMany({
      where: { status: "ACTIVE", OR: targetIds.map((t) => { const [a, b] = pairKey(userId, t); return { userAId: a, userBId: b }; }) },
      include: { conversation: { select: { id: true } } },
    }),
    db.favorite.findMany({ where: { userId, targetId: { in: targetIds } }, select: { targetId: true } }),
  ]);
  const favs = new Set(favorites.map((f) => f.targetId));
  for (const id of targetIds) {
    const match = matches.find((m) => m.userAId === id || m.userBId === id);
    let status: RelationStatus = "none";
    if (match) status = "matched";
    else if (likes.some((l) => l.fromUserId === userId && l.toUserId === id && l.status === "PENDING")) status = "sent";
    else if (likes.some((l) => l.fromUserId === id && l.status === "PENDING")) status = "received";
    result.set(id, { status, conversationId: match?.conversation?.id ?? null, favorite: favs.has(id) });
  }
  return result;
}
