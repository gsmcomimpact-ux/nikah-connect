/**
 * Libellés français de toutes les valeurs énumérées.
 * Source unique utilisée par les formulaires, les filtres et l'affichage.
 */
import type {
  BlogCategory,
  ChildrenWish,
  CompatibilityImportance,
  EducationLevel,
  Gender,
  MaritalStatus,
  MarriageTimeline,
  PartnerChildrenAcceptance,
  PhotoVisibility,
  RelocationPreference,
  ReligionImportance,
  ReligiousPractice,
  ReportReason,
  TrustedContactRelation,
} from "@prisma/client";

export type Option<T extends string = string> = { value: T; label: string };

function toOptions<T extends string>(labels: Record<T, string>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const GENDER_LABELS: Record<Gender, string> = { MALE: "Homme", FEMALE: "Femme" };

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  SINGLE: "Célibataire",
  DIVORCED: "Divorcé(e)",
  WIDOWED: "Veuf / veuve",
};

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  NONE: "Sans diplôme",
  PRIMARY: "Primaire",
  SECONDARY: "Secondaire / Bac",
  VOCATIONAL: "Formation professionnelle",
  BACHELOR: "Licence / Bachelor",
  MASTER: "Master",
  DOCTORATE: "Doctorat",
};
export const EDUCATION_ORDER: EducationLevel[] = [
  "NONE",
  "PRIMARY",
  "SECONDARY",
  "VOCATIONAL",
  "BACHELOR",
  "MASTER",
  "DOCTORATE",
];

export const RELIGION_IMPORTANCE_LABELS: Record<ReligionImportance, string> = {
  ESSENTIAL: "Au centre de ma vie",
  VERY_IMPORTANT: "Très importante",
  IMPORTANT: "Importante",
  MODERATE: "Présente, à mon rythme",
  PREFER_NOT_SAY: "Je préfère ne pas répondre",
};
export const RELIGION_IMPORTANCE_ORDER: ReligionImportance[] = [
  "ESSENTIAL",
  "VERY_IMPORTANT",
  "IMPORTANT",
  "MODERATE",
];

export const RELIGIOUS_PRACTICE_LABELS: Record<ReligiousPractice, string> = {
  REGULAR: "Pratique régulière",
  MODERATE: "Pratique modérée",
  LEARNING: "En cheminement / en apprentissage",
  PREFER_NOT_SAY: "Je préfère ne pas répondre",
};

export const COMPATIBILITY_IMPORTANCE_LABELS: Record<CompatibilityImportance, string> = {
  ESSENTIAL: "Essentielle",
  IMPORTANT: "Importante",
  FLEXIBLE: "Ouverte / flexible",
};

export const CHILDREN_WISH_LABELS: Record<ChildrenWish, string> = {
  YES: "Oui, je souhaite des enfants",
  NO: "Non",
  OPEN: "Ouvert(e) / à discuter",
};

export const PARTNER_CHILDREN_LABELS: Record<PartnerChildrenAcceptance, string> = {
  YES: "Oui",
  NO: "Non",
  DEPENDS: "À discuter",
};

export const RELOCATION_LABELS: Record<RelocationPreference, string> = {
  STAY_IN_COUNTRY: "Rester dans mon pays",
  OPEN_TO_ABROAD: "Ouvert(e) à l'étranger",
  PREFER_ABROAD: "Je préfère vivre à l'étranger",
  FLEXIBLE: "Flexible",
};

export const MARRIAGE_TIMELINE_LABELS: Record<MarriageTimeline, string> = {
  WITHIN_6_MONTHS: "Dans les 6 mois",
  WITHIN_1_YEAR: "Dans l'année",
  WITHIN_2_YEARS: "D'ici 2 ans",
  NO_RUSH: "Sans précipitation, quand ce sera la bonne personne",
};
export const MARRIAGE_TIMELINE_ORDER: MarriageTimeline[] = [
  "WITHIN_6_MONTHS",
  "WITHIN_1_YEAR",
  "WITHIN_2_YEARS",
  "NO_RUSH",
];

export const PHOTO_VISIBILITY_LABELS: Record<PhotoVisibility, string> = {
  MEMBERS: "Visible par les membres connectés",
  MATCHES_ONLY: "Visible uniquement en cas de compatibilité mutuelle",
  HIDDEN: "Masquée",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  FAKE_PROFILE: "Faux profil",
  DISRESPECT: "Comportement irrespectueux",
  HARASSMENT: "Harcèlement",
  SPAM: "Spam",
  INAPPROPRIATE_CONTENT: "Contenu inapproprié",
  SCAM: "Tentative d'arnaque",
  MONEY_REQUEST: "Demande d'argent",
  FRAUD: "Comportement frauduleux",
  OTHER: "Autre",
};

export const TRUSTED_CONTACT_RELATION_LABELS: Record<TrustedContactRelation, string> = {
  PARENT: "Parent",
  FAMILY_MEMBER: "Membre de la famille",
  GUARDIAN: "Tuteur / wali",
  CHOSEN_COMPANION: "Accompagnateur choisi",
};

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  PREPARER_MARIAGE: "Préparer son mariage",
  COMPATIBILITE: "Compatibilité",
  COMMUNICATION: "Communication",
  FAMILLE: "Famille",
  VIE_CONJUGALE: "Vie conjugale",
  SECURITE_EN_LIGNE: "Sécurité en ligne",
  RENCONTRES_MUSULMANES: "Conseils pour les rencontres musulmanes",
};
export const BLOG_CATEGORY_SLUGS: Record<BlogCategory, string> = {
  PREPARER_MARIAGE: "preparer-son-mariage",
  COMPATIBILITE: "compatibilite",
  COMMUNICATION: "communication",
  FAMILLE: "famille",
  VIE_CONJUGALE: "vie-conjugale",
  SECURITE_EN_LIGNE: "securite-en-ligne",
  RENCONTRES_MUSULMANES: "rencontres-musulmanes",
};

/** Valeurs personnelles proposées (clés stables, libellés affichés). */
export const VALUE_LABELS = {
  foi: "Foi et spiritualité",
  famille: "Famille",
  honnetete: "Honnêteté",
  respect: "Respect mutuel",
  bienveillance: "Bienveillance",
  patience: "Patience",
  generosite: "Générosité",
  savoir: "Recherche du savoir",
  travail: "Sens du travail",
  humilite: "Humilité",
  fidelite: "Fidélité",
  communication: "Communication",
  pudeur: "Pudeur",
  entraide: "Entraide et solidarité",
} as const;
export type ValueKey = keyof typeof VALUE_LABELS;

/** Valeurs familiales proposées. */
export const FAMILY_VALUE_LABELS = {
  proche_famille: "Proximité avec la famille élargie",
  education_enfants: "Éducation des enfants",
  partage_taches: "Partage des responsabilités",
  vie_simple: "Vie simple et sereine",
  ambition_pro: "Ambition professionnelle des deux conjoints",
  transmission: "Transmission des valeurs",
  hospitalite: "Hospitalité",
  stabilite: "Stabilité du foyer",
} as const;
export type FamilyValueKey = keyof typeof FAMILY_VALUE_LABELS;

export const LANGUAGE_LABELS = {
  fr: "Français",
  ar: "Arabe",
  en: "Anglais",
  ha: "Haoussa",
  wo: "Wolof",
  ff: "Peul / Fulfulde",
  bm: "Bambara",
  dje: "Zarma / Djerma",
  mos: "Mooré",
  dyu: "Dioula",
  ber: "Amazigh / Berbère",
  tr: "Turc",
  ur: "Ourdou",
  so: "Somali",
  sw: "Swahili",
  es: "Espagnol",
  de: "Allemand",
} as const;
export type LanguageCode = keyof typeof LANGUAGE_LABELS;

export const genderOptions = toOptions(GENDER_LABELS);
export const maritalStatusOptions = toOptions(MARITAL_STATUS_LABELS);
export const educationOptions = toOptions(EDUCATION_LABELS);
export const religionImportanceOptions = toOptions(RELIGION_IMPORTANCE_LABELS);
export const religiousPracticeOptions = toOptions(RELIGIOUS_PRACTICE_LABELS);
export const compatibilityImportanceOptions = toOptions(COMPATIBILITY_IMPORTANCE_LABELS);
export const childrenWishOptions = toOptions(CHILDREN_WISH_LABELS);
export const partnerChildrenOptions = toOptions(PARTNER_CHILDREN_LABELS);
export const relocationOptions = toOptions(RELOCATION_LABELS);
export const marriageTimelineOptions = toOptions(MARRIAGE_TIMELINE_LABELS);
export const photoVisibilityOptions = toOptions(PHOTO_VISIBILITY_LABELS);
export const reportReasonOptions = toOptions(REPORT_REASON_LABELS);
export const trustedContactRelationOptions = toOptions(TRUSTED_CONTACT_RELATION_LABELS);
export const blogCategoryOptions = toOptions(BLOG_CATEGORY_LABELS);
export const valueOptions = toOptions(VALUE_LABELS as Record<ValueKey, string>);
export const familyValueOptions = toOptions(FAMILY_VALUE_LABELS as Record<FamilyValueKey, string>);
export const languageOptions = toOptions(LANGUAGE_LABELS as Record<LanguageCode, string>);

export function labelOf<T extends string>(labels: Record<T, string>, value: T | null | undefined): string {
  if (!value) return "Non renseigné";
  return labels[value] ?? value;
}

export function languageLabel(code: string): string {
  return (LANGUAGE_LABELS as Record<string, string>)[code] ?? code;
}
