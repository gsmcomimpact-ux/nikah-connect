import { notFound } from "next/navigation";
import { BookOpen, Briefcase, Globe2, Heart, MapPin, Users } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafetyNotice } from "@/components/ui/safety-notice";
import { CompatibilityMeter } from "@/components/profile/compatibility-meter";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ReportDialog } from "@/components/profile/report-dialog";
import { BlockButton } from "@/components/profile/block-button";
import { VerificationBadges } from "@/components/profile/verification-badges";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { countryName } from "@/lib/constants/geo";
import {
  CHILDREN_WISH_LABELS,
  COMPATIBILITY_IMPORTANCE_LABELS,
  EDUCATION_LABELS,
  FAMILY_VALUE_LABELS,
  labelOf,
  languageLabel,
  MARITAL_STATUS_LABELS,
  MARRIAGE_TIMELINE_LABELS,
  PARTNER_CHILDREN_LABELS,
  RELIGION_IMPORTANCE_LABELS,
  RELIGIOUS_PRACTICE_LABELS,
  RELOCATION_LABELS,
  VALUE_LABELS,
} from "@/lib/constants/options";
import { DIMENSION_LABELS, type Dimension } from "@/lib/matching/engine";
import { getPairCompatibility, getViewableProfile } from "@/lib/matching/candidates";
import { getRelationStatuses } from "@/lib/profile/relations";
import { ageFromDate, formatRelative, startOfDay } from "@/lib/utils";

export const metadata = { title: "Profil" };

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-ink sm:text-right">{value || "Non renseigné"}</dd>
    </div>
  );
}

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const data = await getViewableProfile(user.id, id);
  if (!data) notFound();
  const { profile: p, badges, photosAllowed } = data;
  const isSelf = user.id === id;

  if (!isSelf) {
    await db.profileView.upsert({
      where: { viewerId_viewedId_day: { viewerId: user.id, viewedId: id, day: startOfDay() } },
      create: { viewerId: user.id, viewedId: id, day: startOfDay() },
      update: {},
    });
  }
  const [compat, relations] = await Promise.all([isSelf ? null : getPairCompatibility(user.id, id), getRelationStatuses(user.id, [id])]);
  const rel = relations.get(id);
  const photos = photosAllowed ? p.user.photos : [];
  const age = ageFromDate(p.dateOfBirth);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0 sm:p-0">
        <div className="h-16 bg-gradient-to-r from-primary to-primary-light" />
        <div className="-mt-12 flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-start sm:gap-5 sm:px-8">
          <Avatar name={p.displayName} photoUrl={photos[0] ? `/api/media/photo/${photos[0].id}` : null} size="xl" className="border-4 border-white" />
          <div className="flex-1 sm:pt-14">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {p.displayName}, {age} ans
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-primary-light" aria-hidden /> {p.city}, {countryName(p.country)}
              {p.user.lastActiveAt && <span className="ml-2 text-gray-400">· actif(ve) {formatRelative(p.user.lastActiveAt)}</span>}
            </p>
            <div className="mt-2">
              <VerificationBadges badges={badges} />
            </div>
          </div>
          {compat && (
            <div className="flex items-center gap-3 sm:pt-12">
              <CompatibilityMeter score={compat.score} size="lg" />
              <span className="text-sm font-medium text-primary">compatible</span>
            </div>
          )}
        </div>
        {!isSelf && (
          <div className="border-t border-gray-100 px-5 py-4 sm:px-8">
            <ProfileActions targetId={id} initialStatus={rel?.status} initialFavorite={rel?.favorite} conversationId={rel?.conversationId} />
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {p.bio && (
            <Card>
              <CardTitle>Présentation</CardTitle>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">{p.bio}</p>
            </Card>
          )}

          <Card>
            <CardTitle>En bref</CardTitle>
            <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-gold" aria-hidden /> {p.profession ?? "Profession non renseignée"}</li>
              <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-gold" aria-hidden /> {labelOf(EDUCATION_LABELS, p.educationLevel)}</li>
              <li className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-gold" aria-hidden /> {p.languages.map(languageLabel).join(", ") || "—"}</li>
              <li className="flex items-center gap-2"><Heart className="h-4 w-4 text-gold" aria-hidden /> {labelOf(MARITAL_STATUS_LABELS, p.maritalStatus)}{p.childrenCount > 0 ? ` · ${p.childrenCount} enfant(s)` : ""}</li>
              {p.user.trustedContact?.showIndicator && (
                <li className="flex items-center gap-2 sm:col-span-2"><Users className="h-4 w-4 text-gold" aria-hidden /> Souhaite impliquer une personne de confiance (famille / wali) dans sa démarche</li>
              )}
            </ul>
            {p.interests.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-ink">Centres d'intérêt</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.interests.map((i) => (
                    <Badge key={i.interestId}>{i.interest.label}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>Valeurs et spiritualité</CardTitle>
            {p.values.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.values.map((v) => (
                  <Badge key={v} tone="green">{(VALUE_LABELS as Record<string, string>)[v] ?? v}</Badge>
                ))}
              </div>
            )}
            <dl className="mt-3 divide-y divide-gray-100">
              <Row label="Place de la religion" value={p.religionImportance ? RELIGION_IMPORTANCE_LABELS[p.religionImportance] : null} />
              <Row label="Pratique" value={p.religiousPractice ? RELIGIOUS_PRACTICE_LABELS[p.religiousPractice] : null} />
              <Row label="Compatibilité religieuse recherchée" value={p.religiousCompatibility ? COMPATIBILITY_IMPORTANCE_LABELS[p.religiousCompatibility] : null} />
            </dl>
            {p.marriageVision && (
              <div className="mt-3">
                <h3 className="text-sm font-semibold">Vision du mariage</h3>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-700">{p.marriageVision}</p>
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>Projet matrimonial et famille</CardTitle>
            <dl className="mt-3 divide-y divide-gray-100">
              <Row label="Relation orientée vers le mariage" value={p.seeksMarriage ? "Oui" : "Pas pour le moment"} />
              <Row label="Horizon souhaité" value={p.marriageTimeline ? MARRIAGE_TIMELINE_LABELS[p.marriageTimeline] : null} />
              <Row label="Souhait d'enfants" value={p.wantsChildren ? CHILDREN_WISH_LABELS[p.wantsChildren] : null} />
              <Row label="Accepte une personne ayant des enfants" value={p.acceptsPartnerChildren ? PARTNER_CHILDREN_LABELS[p.acceptsPartnerChildren] : null} />
              <Row label="Lieu de vie" value={p.relocation ? RELOCATION_LABELS[p.relocation] : null} />
            </dl>
            {p.familyValues.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.familyValues.map((v) => (
                  <Badge key={v} tone="gold">{(FAMILY_VALUE_LABELS as Record<string, string>)[v] ?? v}</Badge>
                ))}
              </div>
            )}
            {p.familyVision && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{p.familyVision}</p>}
          </Card>

          {p.user.preference && (
            <Card>
              <CardTitle>Ce que {p.displayName} recherche</CardTitle>
              <dl className="mt-3 divide-y divide-gray-100">
                <Row label="Tranche d'âge" value={`${p.user.preference.ageMin} – ${p.user.preference.ageMax} ans`} />
                <Row label="Pays" value={p.user.preference.countries.map(countryName).join(", ") || "Tous"} />
                <Row label="Langues" value={p.user.preference.languages.map(languageLabel).join(", ") || "Indifférent"} />
              </dl>
            </Card>
          )}

          {photos.length > 1 && (
            <Card>
              <CardTitle>Photos</CardTitle>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((ph) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={ph.id} src={`/api/media/photo/${ph.id}`} alt={`Photo de ${p.displayName}`} className="aspect-square rounded-xl object-cover" loading="lazy" />
                ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          {compat && (
            <Card>
              <CardTitle className="text-lg">Pourquoi cette compatibilité ?</CardTitle>
              {compat.reasons.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
                  {compat.reasons.map((r) => (
                    <li key={r}>✓ {r}</li>
                  ))}
                </ul>
              )}
              <div className="mt-4 space-y-2">
                {(Object.keys(compat.breakdown) as Dimension[]).map((d) => (
                  <div key={d}>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{DIMENSION_LABELS[d]}</span>
                      <span>{Math.round(compat.breakdown[d] * 100)} %</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary-light" style={{ width: `${Math.round(compat.breakdown[d] * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-gray-500">Ce score mesure la proximité de vos réponses. Il ne garantit en aucun cas la réussite d'une relation.</p>
            </Card>
          )}
          <SafetyNotice compact />
          {!isSelf && (
            <div className="flex flex-wrap gap-2">
              <ReportDialog reportedUserId={id} />
              <BlockButton targetId={id} name={p.displayName} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
