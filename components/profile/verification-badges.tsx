import { BadgeCheck, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationBadges as Badges } from "@/lib/profile/types";

export function VerificationBadges({ badges, compact = false }: { badges: Badges; compact?: boolean }) {
  if (!badges.email && !badges.phone && !badges.identity) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.identity && (
        <Badge tone="gold" title="Identité vérifiée par l'équipe de modération">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {compact ? "Vérifié" : "Profil vérifié"}
        </Badge>
      )}
      {!compact && badges.email && (
        <Badge tone="green" title="Adresse e-mail confirmée">
          <Mail className="h-3.5 w-3.5" aria-hidden /> E-mail vérifié
        </Badge>
      )}
      {!compact && badges.phone && (
        <Badge tone="green" title="Numéro de téléphone confirmé">
          <Phone className="h-3.5 w-3.5" aria-hidden /> Téléphone vérifié
        </Badge>
      )}
    </div>
  );
}
