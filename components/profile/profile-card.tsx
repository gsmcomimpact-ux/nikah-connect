import Link from "next/link";
import { BookOpen, Briefcase, Globe2, HeartHandshake, MapPin, Users } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { ButtonLink } from "@/components/ui/button";
import { CompatibilityMeter } from "@/components/profile/compatibility-meter";
import { VerificationBadges } from "@/components/profile/verification-badges";
import { countryName } from "@/lib/constants/geo";
import { EDUCATION_LABELS, languageLabel } from "@/lib/constants/options";
import type { ProfileCardData } from "@/lib/profile/types";
import type { ReactNode } from "react";

/**
 * Carte profil sobre : l'avatar reste discret, l'accent est mis sur le
 * projet de vie, les valeurs et la compatibilité.
 */
export function ProfileCard({ profile, actions, href }: { profile: ProfileCardData; actions?: ReactNode; href?: string }) {
  const link = href ?? `/espace/membres/${profile.userId}`;
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,20,0.04)] transition hover:border-gold/60 hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar name={profile.displayName} photoUrl={profile.photoUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold text-ink">
            <Link href={link} className="hover:text-primary">
              {profile.displayName}, {profile.age} ans
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-light" aria-hidden />
            <span className="truncate">
              {profile.city}, {countryName(profile.country)}
              {profile.distanceKm !== null && profile.distanceKm > 0 && <span className="text-gray-400"> · {profile.distanceKm} km</span>}
            </span>
          </p>
          <div className="mt-2">
            <VerificationBadges badges={profile.badges} compact />
          </div>
        </div>
        {profile.score !== null && <CompatibilityMeter score={profile.score} size="sm" />}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-gray-700">
        {profile.profession && (
          <li className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gold" aria-hidden /> {profile.profession}
          </li>
        )}
        {profile.educationLevel && (
          <li className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" aria-hidden /> {EDUCATION_LABELS[profile.educationLevel]}
          </li>
        )}
        {profile.languages.length > 0 && (
          <li className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-gold" aria-hidden /> {profile.languages.slice(0, 3).map(languageLabel).join(" / ")}
          </li>
        )}
        {profile.seeksMarriage && (
          <li className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-gold" aria-hidden /> Projet matrimonial sérieux
          </li>
        )}
        {profile.hasTrustedContact && (
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gold" aria-hidden /> Souhaite impliquer une personne de confiance
          </li>
        )}
      </ul>

      {profile.reasons.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted/70 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Pourquoi cette compatibilité ?</p>
          <ul className="mt-1 space-y-0.5 text-xs text-gray-700">
            {profile.reasons.slice(0, 3).map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <ButtonLink href={link} variant="outline" size="sm" className="flex-1">
          Voir le profil
        </ButtonLink>
        {actions}
      </div>
    </article>
  );
}
