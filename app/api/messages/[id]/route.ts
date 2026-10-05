import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/messages/service";

/** Récupération des messages (utilisée par le rafraîchissement périodique de la conversation). */
export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const { id } = await ctx.params;
  const afterParam = request.nextUrl.searchParams.get("after");
  const after = afterParam ? new Date(afterParam) : undefined;
  const result = await getMessages(user.id, id, after && !Number.isNaN(after.getTime()) ? after : undefined);
  if (!result) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({
    canWrite: result.ctx.canWrite,
    messages: result.messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      hidden: m.status === "HIDDEN",
      attachments: m.attachments.map((a) => `/api/media/attachment/${a.id}`),
    })),
  });
}
