import Link from "next/link";
import { Lock, Search, SlidersHorizontal } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileActions } from "@/components/profile/profile-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Alert } from "@/components/ui/alert";
import { Button, buttonClass } from "@/components/ui/button";
import { Checkbox, ChipGroup, Field, Input, Select } from "@/components/ui/field";
import { requireUser } from "@/lib/auth/guards";
import { getRelationStatuses } from "@/lib/profile/relations";
import { planFeatures } from "@/lib/billing/plans";
import { COUNTRIES } from "@/lib/constants/geo";
import {
  childrenWishOptions,
  educationOptions,
  GENDER_LABELS,
  languageOptions,
  maritalStatusOptions,
  marriageTimelineOptions,
  relocationOptions,
  valueOptions,
} from "@/lib/constants/options";
import { ADVANCED_FILTER_KEYS, oppositeGender, searchProfiles, type SearchFilters } from "@/lib/matching/candidates";
import { parseSearchFilters } from "@/lib/validation/search";

export const metadata = { title: "Recherche de profils" };
const PAGE_SIZE = 12;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const params = await searchParams;
  const plan = planFeatures(user.subscription);
  const parsed = parseSearchFilters(params);
  const filters: SearchFilters = { ...parsed };
  let gated = false;
  if (!plan.advancedFilters) {
    for (const key of ADVANCED_FILTER_KEYS) {
      const v = filters[key];
      if (v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0)) gated = true;
      delete filters[key];
    }
  }
  const page = Math.max(1, Number(params.page) || 1);
  const submitted = Object.keys(params).some((k) => k !== "page");
  const { cards, total } = await searchProfiles(user.id, filters, { maxResults: plan.searchResultsMax, page, pageSize: PAGE_SIZE });
  const relations = await getRelationStatuses(user.id, cards.map((c) => c.userId));
  const lookingFor = user.profile ? GENDER_LABELS[oppositeGender(user.profile.gender)] : "";
  const adv = plan.advancedFilters;

  const AdvancedLabel = ({ children }: { children: string }) => (
    <span className="inline-flex items-center gap-1">
      {children} {!adv && <Lock className="h-3 w-3 text-gold" aria-label="Premium" />}
    </span>
  );

  return (
    <>
      <PageTitle title="Recherche de profils" description={`Profils de : ${lookingFor === "Homme" ? "hommes" : "femmes"}. Affinez selon vos critères.`} />
      <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
        <details className="group rounded-2xl border border-gray-200 bg-white lg:open:block" open>
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium lg:hidden">
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filtres
            </span>
          </summary>
          <form method="get" className="space-y-4 px-5 pb-5 lg:pt-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Âge min." htmlFor="ageMin">
                <Input id="ageMin" name="ageMin" type="number" min={18} max={99} defaultValue={parsed.ageMin} />
              </Field>
              <Field label="Âge max." htmlFor="ageMax">
                <Input id="ageMax" name="ageMax" type="number" min={18} max={99} defaultValue={parsed.ageMax} />
              </Field>
            </div>
            <Field label="Sexe" htmlFor="gender" hint="Les profils proposés sont ceux du sexe opposé.">
              <Input id="gender" value={lookingFor} disabled readOnly />
            </Field>
            <Field label="Pays" htmlFor="country">
              <Select id="country" name="country" placeholder="Tous les pays" options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} defaultValue={parsed.country ?? ""} />
            </Field>
            <Field label="Ville" htmlFor="city">
              <Input id="city" name="city" defaultValue={parsed.city} maxLength={80} />
            </Field>
            <Field label="Situation matrimoniale">
              <ChipGroup name="maritalStatuses" options={maritalStatusOptions} defaultValues={parsed.maritalStatuses} />
            </Field>
            <Field label="Enfants" htmlFor="children">
              <Select id="children" name="children" placeholder="Indifférent" options={[{ value: "without", label: "Sans enfant" }, { value: "with", label: "Avec enfant(s)" }]} defaultValue={parsed.children ?? ""} />
            </Field>
            <Field label="Langues">
              <ChipGroup name="languages" options={languageOptions.slice(0, 10)} defaultValues={parsed.languages} />
            </Field>

            <fieldset disabled={!adv} className="space-y-4 border-t border-gray-200 pt-4 disabled:opacity-60">
              <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                Filtres avancés {!adv && <Link href="/espace/abonnement" className="text-xs font-normal text-gold underline">Premium</Link>}
              </legend>
              <Field label="Distance max. (km)" htmlFor="distanceKm">
                <Input id="distanceKm" name="distanceKm" type="number" min={5} defaultValue={adv ? parsed.distanceKm : undefined} />
              </Field>
              <Field label="Profession" htmlFor="profession">
                <Input id="profession" name="profession" defaultValue={adv ? parsed.profession : undefined} />
              </Field>
              <Field label="Niveau d'études minimum" htmlFor="minEducation">
                <Select id="minEducation" name="minEducation" placeholder="Indifférent" options={educationOptions} defaultValue={adv ? (parsed.minEducation ?? "") : ""} />
              </Field>
              <Field label="Valeurs">
                <ChipGroup name="values" options={valueOptions} defaultValues={adv ? (parsed.values ?? []) : []} />
              </Field>
              <Field label="Horizon du mariage" htmlFor="marriageTimeline">
                <Select id="marriageTimeline" name="marriageTimeline" placeholder="Indifférent" options={marriageTimelineOptions} defaultValue={adv ? (parsed.marriageTimeline ?? "") : ""} />
              </Field>
              <Field label="Souhait d'enfants" htmlFor="wantsChildren">
                <Select id="wantsChildren" name="wantsChildren" placeholder="Indifférent" options={childrenWishOptions} defaultValue={adv ? (parsed.wantsChildren ?? "") : ""} />
              </Field>
              <Field label="Préférences familiales (lieu de vie)" htmlFor="relocation">
                <Select id="relocation" name="relocation" placeholder="Indifférent" options={relocationOptions} defaultValue={adv ? (parsed.relocation ?? "") : ""} />
              </Field>
              <Checkbox name="verifiedOnly" label={<AdvancedLabel>Profils vérifiés uniquement</AdvancedLabel>} defaultChecked={adv && parsed.verifiedOnly} />
            </fieldset>

            <Field label="Trier par" htmlFor="sort">
              <Select id="sort" name="sort" options={[{ value: "compatibility", label: "Compatibilité" }, { value: "recent", label: "Activité récente" }]} defaultValue={parsed.sort ?? "compatibility"} />
            </Field>
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit">Appliquer les filtres</Button>
              <Link href="/espace/recherche" className={buttonClass("ghost", "md")}>
                Réinitialiser les filtres
              </Link>
            </div>
          </form>
        </details>

        <section aria-live="polite">
          {gated && (
            <Alert tone="warning" className="mb-4">
              Certains filtres avancés sont réservés à l'offre Premium et n'ont pas été appliqués. <Link href="/espace/abonnement" className="underline">Découvrir Premium</Link>
            </Alert>
          )}
          <p className="mb-4 text-sm text-gray-600">
            {total} profil{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
            {!adv && total >= plan.searchResultsMax && ` (limité à ${plan.searchResultsMax} résultats avec l'offre gratuite)`}
          </p>
          {cards.length === 0 ? (
            <EmptyState icon={Search} title={submitted ? "Aucun profil ne correspond" : "Aucun profil disponible"} description="Essayez d'élargir la tranche d'âge, le pays ou de retirer certains filtres." />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {cards.map((c) => (
                  <ProfileCard key={c.userId} profile={c} actions={<ProfileActions targetId={c.userId} compact initialStatus={relations.get(c.userId)?.status} conversationId={relations.get(c.userId)?.conversationId} />} />
                ))}
              </div>
              <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/espace/recherche" query={params} />
            </>
          )}
        </section>
      </div>
    </>
  );
}
