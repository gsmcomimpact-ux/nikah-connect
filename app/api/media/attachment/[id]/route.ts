import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/guards";
import { readFileByKey } from "@/lib/storage";

/** Pièce jointe accessible uniquement aux participants de la conversation (et à la modération). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const { id } = await ctx.params;
  const attachment = await db.messageAttachment.findUnique({ where: { id }, include: { message: { select: { conversationId: true, status: true, senderId: true } } } });
  if (!attachment) return new NextResponse(null, { status: 404 });
  const participant = await db.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId: attachment.message.conversationId, userId: user.id } } });
  const allowed = hasRole(user, "MODERATOR") || (participant && (attachment.message.status === "VISIBLE" || attachment.message.senderId === user.id));
  if (!allowed) return new NextResponse(null, { status: 404 });
  const data = await readFileByKey(attachment.storageKey);
  return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": attachment.mimeType, "Cache-Control": "private, max-age=600", "X-Content-Type-Options": "nosniff" } });
}
