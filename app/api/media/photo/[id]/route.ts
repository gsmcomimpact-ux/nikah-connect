import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/guards";
import { canSeePhotos, isBlockedBetween } from "@/lib/profile/queries";
import { readFileByKey } from "@/lib/storage";
import { pairKey } from "@/lib/utils";

/** Les photos ne sont jamais publiques : chaque accès vérifie les règles de visibilité choisies par leur propriétaire. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const { id } = await ctx.params;
  const photo = await db.photo.findUnique({ where: { id }, include: { user: { select: { status: true, profile: { select: { photoVisibility: true } } } } } });
  if (!photo) return new NextResponse(null, { status: 404 });

  const isOwner = photo.userId === user.id;
  const isAdmin = hasRole(user, "MODERATOR");
  if (!isOwner && !isAdmin) {
    if (photo.status !== "APPROVED" || photo.user.status !== "ACTIVE" || (await isBlockedBetween(user.id, photo.userId))) return new NextResponse(null, { status: 404 });
    const [a, b] = pairKey(user.id, photo.userId);
    const match = await db.match.findUnique({ where: { userAId_userBId: { userAId: a, userBId: b } }, select: { status: true } });
    const allowed = canSeePhotos({ viewerId: user.id, ownerId: photo.userId, visibility: photo.user.profile?.photoVisibility ?? "HIDDEN", isMatched: match?.status === "ACTIVE" });
    if (!allowed) return new NextResponse(null, { status: 404 });
  }
  const data = await readFileByKey(photo.storageKey);
  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=600", "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff" },
  });
}
