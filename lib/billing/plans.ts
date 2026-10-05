import type { Plan } from "@prisma/client";

/**
 * Règles du modèle freemium. Modifiez ici les quotas et avantages.
 * Les prix sont indicatifs : aucun paiement réel n'est effectué
 * tant qu'un fournisseur n'est pas configuré (voir lib/billing/provider.ts).
 */
export type PlanFeatures = {
  label: string;
  priceLabel: string;
  dailyRequests: number;
  searchResultsMax: number;
  advancedFilters: boolean;
  profileStats: boolean;
  seeWhoViewed: boolean;
  visibilityBoost: boolean;
  attachments: boolean;
  highlights: string[];
};

export const PLANS: Record<Plan, PlanFeatures> = {
  FREE: {
    label: "Essentiel",
    priceLabel: "Gratuit",
    dailyRequests: 5,
    searchResultsMax: 24,
    advancedFilters: false,
    profileStats: false,
    seeWhoViewed: false,
    visibilityBoost: false,
    attachments: false,
    highlights: [
      "Création de profil complet",
      "Recherche par critères essentiels",
      "Consultation des profils",
      "5 demandes par jour",
      "Messagerie après compatibilité mutuelle",
    ],
  },
  PREMIUM: {
    label: "Premium",
    priceLabel: "9,90 € / mois",
    dailyRequests: 30,
    searchResultsMax: 120,
    advancedFilters: true,
    profileStats: true,
    seeWhoViewed: true,
    visibilityBoost: true,
    attachments: true,
    highlights: [
      "Recherche avancée et tous les filtres",
      "30 demandes par jour",
      "Visibilité améliorée de votre profil",
      "Statistiques de profil et visites",
      "Partage de photos dans la messagerie",
      "Soutien au développement d'une plateforme sûre",
    ],
  },
};

export function effectivePlan(sub: { plan: Plan; status: string; currentPeriodEnd: Date | null } | null | undefined): Plan {
  if (!sub || sub.plan === "FREE") return "FREE";
  if (sub.status !== "ACTIVE" && sub.status !== "CANCELED") return "FREE";
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return "FREE";
  return sub.plan;
}

export function planFeatures(sub: Parameters<typeof effectivePlan>[0]): PlanFeatures & { plan: Plan } {
  const plan = effectivePlan(sub);
  return { ...PLANS[plan], plan };
}
