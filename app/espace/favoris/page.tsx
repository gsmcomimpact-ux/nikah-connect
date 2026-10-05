import { Star } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileActions } from "@/components/profile/profile-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { getCardsForUsers } from "@/lib/matching/candidates";
import { getRelationStatuses } from "@/lib/profile/relations";

export const metadata = { title: "Mes favoris" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const favs = await db.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const cards = await getCardsForUsers(user.id, favs.map((f) => f.targetId));
  const relations = await getRelationStatuses(user.id, cards.map((c) => c.userId));
  return (
    <>
      <PageTitle title="Mes favoris" description="Les profils que vous avez mis de côté. Vos favoris sont privés." />
      {cards.length === 0 ? (
        <EmptyState icon={Star} title="Aucun favori" description="Ajoutez des profils en favori pour les retrouver facilement." action={<ButtonLink href="/espace/compatibilites">Voir mes compatibilités</ButtonLink>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {cards.map((c) => (
            <ProfileCard key={c.userId} profile={c} actions={<ProfileActions targetId={c.userId} compact initialStatus={relations.get(c.userId)?.status} conversationId={relations.get(c.userId)?.conversationId} />} />
          ))}
        </div>
      )}
    </>
  );
}
