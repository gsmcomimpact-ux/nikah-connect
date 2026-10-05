import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageTitle } from "@/components/layout/page-title";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/guards";
import { listConversations } from "@/lib/messages/service";
import { cn, formatRelative } from "@/lib/utils";

export const metadata = { title: "Mes conversations" };

export default async function ConversationsPage() {
  const user = await requireUser();
  const conversations = await listConversations(user.id);
  return (
    <>
      <PageTitle title="Mes conversations" description="Les échanges s'ouvrent uniquement en cas de compatibilité mutuelle." />
      {conversations.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="Aucune conversation" description="Lorsqu'un intérêt est réciproque, une conversation sécurisée s'ouvre ici." action={<ButtonLink href="/espace/compatibilites">Découvrir des profils</ButtonLink>} />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/espace/messages/${c.id}`} className="flex items-center gap-4 px-4 py-4 transition hover:bg-cream/60 sm:px-5">
                <Avatar name={c.otherName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("truncate font-medium", c.unread > 0 ? "text-ink" : "text-ink/80")}>{c.otherName}</p>
                    {!c.active && <Badge>Clôturée</Badge>}
                  </div>
                  <p className={cn("truncate text-sm", c.unread > 0 ? "font-medium text-ink" : "text-gray-500")}>
                    {c.lastMessage ? (c.lastMessage.senderId === null ? "Message de la plateforme" : c.lastMessage.senderId === user.id ? `Vous : ${c.lastMessage.body || "Image"}` : c.lastMessage.body || "Image") : "Aucun message"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">{formatRelative(c.lastMessageAt)}</span>
                  {c.unread > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-ink">{c.unread}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
