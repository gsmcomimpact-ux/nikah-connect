import Link from "next/link";
import { HeartHandshake, Inbox, Send } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { ProfileCard } from "@/components/profile/profile-card";
import { RespondButtons, WithdrawButton } from "@/components/profile/request-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getCardsForUsers } from "@/lib/matching/candidates";
import { cn, formatRelative } from "@/lib/utils";

export const metadata = { title: "Mes demandes" };

const TABS = [
  { key: "recues", label: "Reçues" },
  { key: "envoyees", label: "Envoyées" },
  { key: "mutuelles", label: "Compatibilités mutuelles" },
] as const;

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const user = await requireUser();
  const { onglet } = await searchParams;
  const tab = TABS.find((t) => t.key === onglet)?.key ?? "recues";

  let content: React.ReactNode;
  if (tab === "recues") {
    const likes = await db.like.findMany({ where: { toUserId: user.id, type: "INTEREST", status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 60 });
    const cards = await getCardsForUsers(user.id, likes.map((l) => l.fromUserId));
    content = cards.length ? (
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((c) => {
          const like = likes.find((l) => l.fromUserId === c.userId)!;
          return (
            <div key={like.id} className="flex flex-col gap-2">
              {like.note && <blockquote className="rounded-xl border-l-4 border-gold bg-white px-4 py-3 text-sm italic text-gray-700">« {like.note} »</blockquote>}
              <ProfileCard profile={c} actions={<RespondButtons likeId={like.id} />} />
              <p className="text-right text-xs text-gray-500">Reçue {formatRelative(like.createdAt)}</p>
            </div>
          );
        })}
      </div>
    ) : (
      <EmptyState icon={Inbox} title="Aucune demande en attente" description="Les demandes que vous recevrez apparaîtront ici. Un profil complet attire davantage de demandes sérieuses." action={<ButtonLink href="/espace/profil" variant="outline">Compléter mon profil</ButtonLink>} />
    );
  } else if (tab === "envoyees") {
    const likes = await db.like.findMany({ where: { fromUserId: user.id, type: "INTEREST", status: { in: ["PENDING", "DECLINED"] } }, orderBy: { createdAt: "desc" }, take: 60 });
    const cards = await getCardsForUsers(user.id, likes.map((l) => l.toUserId));
    content = cards.length ? (
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((c) => {
          const like = likes.find((l) => l.toUserId === c.userId)!;
          return (
            <ProfileCard
              key={like.id}
              profile={c}
              actions={
                like.status === "PENDING" ? (
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs text-gray-500">En attente · {formatRelative(like.createdAt)}</span>
                    <WithdrawButton likeId={like.id} />
                  </div>
                ) : (
                  // Par discrétion, un refus est présenté comme « sans suite ».
                  <span className="text-xs text-gray-500">Sans suite</span>
                )
              }
            />
          );
        })}
      </div>
    ) : (
      <EmptyState icon={Send} title="Aucune demande envoyée" description="Lorsqu'un profil vous intéresse, envoyez-lui une demande respectueuse." action={<ButtonLink href="/espace/compatibilites">Voir mes compatibilités</ButtonLink>} />
    );
  } else {
    const matches = await db.match.findMany({ where: { status: "ACTIVE", OR: [{ userAId: user.id }, { userBId: user.id }] }, include: { conversation: { select: { id: true } } }, orderBy: { createdAt: "desc" } });
    const otherIds = matches.map((m) => (m.userAId === user.id ? m.userBId : m.userAId));
    const cards = await getCardsForUsers(user.id, otherIds);
    content = cards.length ? (
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((c) => {
          const m = matches.find((x) => x.userAId === c.userId || x.userBId === c.userId)!;
          return <ProfileCard key={m.id} profile={c} actions={m.conversation ? <ButtonLink href={`/espace/messages/${m.conversation.id}`} size="sm" className="flex-1">Échanger</ButtonLink> : null} />;
        })}
      </div>
    ) : (
      <EmptyState icon={HeartHandshake} title="Pas encore de compatibilité mutuelle" description="Lorsque l'intérêt est réciproque, vous pourrez échanger ici en toute sécurité." />
    );
  }

  return (
    <>
      <PageTitle title="Mes demandes" description="Les intérêts reçus, envoyés et réciproques." />
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-sm" aria-label="Type de demandes">
        {TABS.map((t) => (
          <Link key={t.key} href={`/espace/demandes?onglet=${t.key}`} aria-current={tab === t.key ? "page" : undefined} className={cn("flex-1 whitespace-nowrap rounded-full px-4 py-2 text-center text-sm font-medium", tab === t.key ? "bg-primary text-cream" : "text-gray-600 hover:text-primary")}>
            {t.label}
          </Link>
        ))}
      </nav>
      {content}
    </>
  );
}
