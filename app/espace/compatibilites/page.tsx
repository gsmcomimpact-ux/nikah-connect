import { Sparkles } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileActions } from "@/components/profile/profile-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Alert } from "@/components/ui/alert";
import { requireUser } from "@/lib/auth/guards";
import { getRelationStatuses } from "@/lib/profile/relations";
import { getCompatibilities } from "@/lib/matching/candidates";

export const metadata = { title: "Mes compatibilités" };
const PAGE_SIZE = 12;

export default async function CompatibilitiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { cards, total } = await getCompatibilities(user.id, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const relations = await getRelationStatuses(user.id, cards.map((c) => c.userId));

  return (
    <>
      <PageTitle
        title="Mes compatibilités"
        description="Des profils proposés selon vos critères, vos valeurs et votre projet de vie."
        actions={
          <ButtonLink href="/espace/profil/preferences" variant="outline" size="sm">
            Mes préférences
          </ButtonLink>
        }
      />
      <Alert tone="info" className="mb-5">
        Le pourcentage reflète la proximité de vos réponses (projet matrimonial, valeurs, famille, préférences réciproques). Il ne garantit pas la réussite d'une relation : c'est un point de départ pour la discussion.
      </Alert>
      {cards.length === 0 ? (
        <EmptyState icon={Sparkles} title="Pas de nouvelle suggestion" description="Vous avez parcouru toutes les suggestions actuelles. Revenez bientôt ou élargissez vos préférences." action={<ButtonLink href="/espace/recherche">Lancer une recherche</ButtonLink>} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {cards.map((c) => (
              <ProfileCard key={c.userId} profile={c} actions={<ProfileActions targetId={c.userId} compact initialStatus={relations.get(c.userId)?.status} conversationId={relations.get(c.userId)?.conversationId} />} />
            ))}
          </div>
          <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/espace/compatibilites" />
        </>
      )}
    </>
  );
}
