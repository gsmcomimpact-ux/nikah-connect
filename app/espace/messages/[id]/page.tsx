import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { ChatWindow } from "@/components/messages/chat-window";
import { ConversationActions } from "@/components/messages/conversation-actions";
import { requireUser } from "@/lib/auth/guards";
import { planFeatures } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { attachmentsAllowed, getMessages } from "@/lib/messages/service";

export const metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const result = await getMessages(user.id, id);
  if (!result) notFound();
  const { ctx, messages } = result;
  const other = ctx.other;
  const otherName = other && other.status !== "DELETED" ? (other.profile?.displayName ?? "Membre") : "Membre supprimé";
  const [canAttach, trusted] = await Promise.all([
    planFeatures(user.subscription).attachments ? attachmentsAllowed(id) : Promise.resolve(false),
    db.trustedContact.findUnique({ where: { userId: user.id }, select: { id: true } }),
  ]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/espace/messages" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white" aria-label="Retour aux conversations">
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <Avatar name={otherName} size="sm" />
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">{otherName}</h1>
            {other && other.status === "ACTIVE" && (
              <Link href={`/espace/membres/${other.id}`} className="text-xs text-primary hover:underline">
                Voir le profil
              </Link>
            )}
          </div>
        </div>
        <ConversationActions conversationId={id} otherUserId={other?.id ?? null} active={ctx.canWrite} />
      </div>
      <ChatWindow
        conversationId={id}
        currentUserId={user.id}
        otherUserId={other?.id ?? null}
        otherName={otherName}
        initialCanWrite={ctx.canWrite}
        canAttach={canAttach}
        hasTrustedContact={Boolean(trusted)}
        initialMessages={messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          hidden: m.status === "HIDDEN",
          attachments: m.attachments.map((a) => `/api/media/attachment/${a.id}`),
        }))}
      />
    </div>
  );
}
