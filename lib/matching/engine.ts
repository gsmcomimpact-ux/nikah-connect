/**
 * Moteur de compatibilité NIKAH CONNECT.
 *
 * Le score est calculé dans les deux sens (A→B et B→A) puis combiné par une
 * moyenne géométrique : une compatibilité n'est élevée que si elle l'est pour
 * les deux personnes. Le score est un indicateur d'affinité déclarée ; il ne
 * prédit ni ne garantit la réussite d'une relation.
 *
 * Module pur (sans accès base de données) pour être testable unitairement.
 */
import type {
  ChildrenWish,
  CompatibilityImportance,
  EducationLevel,
  MaritalStatus,
  MarriageTimeline,
  PartnerChildrenAcceptance,
  RelocationPreference,
  ReligionImportance,
} from "@prisma/client";
import { distanceKm } from "@/lib/constants/geo";
import { EDUCATION_ORDER, MARRIAGE_TIMELINE_ORDER, RELIGION_IMPORTANCE_ORDER } from "@/lib/constants/options";

export type MatchProfile = {
  userId: string;
  age: number;
  country: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  maritalStatus: MaritalStatus | null;
  childrenCount: number;
  educationLevel: EducationLevel | null;
  languages: string[];
  values: string[];
  familyValues: string[];
  interests: string[];
  religionImportance: ReligionImportance | null;
  religiousCompatibility: CompatibilityImportance | null;
  seeksMarriage: boolean;
  wantsChildren: ChildrenWish | null;
  acceptsPartnerChildren: PartnerChildrenAcceptance | null;
  relocation: RelocationPreference | null;
  marriageTimeline: MarriageTimeline | null;
  verified: boolean;
};

export type MatchPreference = {
  ageMin: number;
  ageMax: number;
  countries: string[];
  cities: string[];
  maxDistanceKm: number | null;
  maritalStatuses: MaritalStatus[];
  acceptsChildren: PartnerChildrenAcceptance | null;
  minEducation: EducationLevel | null;
  languages: string[];
  religionImportances: ReligionImportance[];
  wantsChildren: ChildrenWish | null;
  relocation: RelocationPreference | null;
  verifiedOnly: boolean;
};

export type Dimension =
  | "geography"
  | "age"
  | "marriage"
  | "values"
  | "family"
  | "children"
  | "education"
  | "languages"
  | "interests"
  | "preferences";

/** Pondérations (total = 100). Ajustables sans toucher au reste du code. */
export const WEIGHTS: Record<Dimension, number> = {
  geography: 12,
  age: 12,
  marriage: 16,
  values: 15,
  family: 10,
  children: 12,
  education: 5,
  languages: 7,
  interests: 5,
  preferences: 6,
};

export const DIMENSION_LABELS: Record<Dimension, string> = {
  geography: "Proximité géographique",
  age: "Tranche d'âge",
  marriage: "Projet matrimonial",
  values: "Valeurs",
  family: "Vision de la famille",
  children: "Projet d'enfants",
  education: "Niveau d'études",
  languages: "Langues",
  interests: "Centres d'intérêt",
  preferences: "Préférences déclarées",
};

export type CompatibilityResult = {
  /** Score global réciproque, 0 – 100. */
  score: number;
  /** Détail par dimension (0 – 1), moyenne des deux directions. */
  breakdown: Record<Dimension, number>;
  /** Raisons lisibles expliquant la compatibilité. */
  reasons: string[];
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0.5; // information manquante : neutre
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 0.5 : inter / union;
}

function overlapCount(a: string[], b: string[]): number {
  const sb = new Set(b);
  return a.filter((x) => sb.has(x)).length;
}

function rankDistance<T>(order: T[], a: T | null, b: T | null): number | null {
  if (a === null || b === null) return null;
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (ia < 0 || ib < 0) return null;
  return Math.abs(ia - ib);
}

function openToMove(p: MatchProfile): boolean {
  return p.relocation === "OPEN_TO_ABROAD" || p.relocation === "PREFER_ABROAD" || p.relocation === "FLEXIBLE";
}

// ---------------------------------------------------------------------------
//  Scores directionnels : « dans quelle mesure B correspond à ce que A recherche ».
// ---------------------------------------------------------------------------

function geographyScore(a: MatchProfile, pa: MatchPreference, b: MatchProfile): number {
  let base: number;
  if (a.country === b.country && a.city.toLowerCase() === b.city.toLowerCase()) base = 1;
  else if (a.country === b.country) base = 0.8;
  else base = openToMove(a) || openToMove(b) ? 0.55 : 0.2;

  if (pa.countries.length > 0) base = pa.countries.includes(b.country) ? Math.max(base, 0.85) : base * 0.5;
  if (pa.maxDistanceKm && a.latitude !== null && a.longitude !== null && b.latitude !== null && b.longitude !== null) {
    const d = distanceKm({ lat: a.latitude, lng: a.longitude }, { lat: b.latitude, lng: b.longitude });
    if (d > pa.maxDistanceKm) base *= clamp01(1 - (d - pa.maxDistanceKm) / Math.max(pa.maxDistanceKm, 100));
  }
  return clamp01(base);
}

function ageScore(pa: MatchPreference, b: MatchProfile): number {
  if (b.age >= pa.ageMin && b.age <= pa.ageMax) return 1;
  const gap = b.age < pa.ageMin ? pa.ageMin - b.age : b.age - pa.ageMax;
  return clamp01(1 - gap * 0.2);
}

function marriageScore(a: MatchProfile, b: MatchProfile): number {
  const seeks = a.seeksMarriage && b.seeksMarriage ? 1 : a.seeksMarriage === b.seeksMarriage ? 0.6 : 0.1;
  const diff = rankDistance(MARRIAGE_TIMELINE_ORDER, a.marriageTimeline, b.marriageTimeline);
  const timeline = diff === null ? 0.6 : 1 - diff / 3;
  return clamp01(seeks * 0.6 + timeline * 0.4);
}

function valuesScore(a: MatchProfile, pa: MatchPreference, b: MatchProfile): number {
  const shared = jaccard(a.values, b.values);
  let religion = 0.6;
  const diff = rankDistance(RELIGION_IMPORTANCE_ORDER, a.religionImportance, b.religionImportance);
  if (diff !== null) {
    // Plus la compatibilité religieuse est importante pour A, plus l'écart pèse.
    const severity = a.religiousCompatibility === "ESSENTIAL" ? 0.4 : a.religiousCompatibility === "FLEXIBLE" ? 0.12 : 0.25;
    religion = clamp01(1 - diff * severity);
  }
  if (pa.religionImportances.length > 0 && b.religionImportance) {
    religion = pa.religionImportances.includes(b.religionImportance) ? Math.max(religion, 0.9) : religion * 0.6;
  }
  return clamp01(shared * 0.55 + religion * 0.45);
}

function familyScore(a: MatchProfile, pa: MatchPreference, b: MatchProfile): number {
  const shared = jaccard(a.familyValues, b.familyValues);
  let relocation = 0.7;
  if (a.relocation && b.relocation) {
    if (a.relocation === b.relocation || a.relocation === "FLEXIBLE" || b.relocation === "FLEXIBLE") relocation = 1;
    else if (
      (a.relocation === "STAY_IN_COUNTRY" && b.relocation === "PREFER_ABROAD") ||
      (a.relocation === "PREFER_ABROAD" && b.relocation === "STAY_IN_COUNTRY")
    )
      relocation = a.country === b.country ? 0.2 : 0.5;
    else relocation = 0.7;
  }
  if (pa.relocation && b.relocation && pa.relocation === b.relocation) relocation = Math.max(relocation, 0.9);
  return clamp01(shared * 0.6 + relocation * 0.4);
}

function childrenScore(a: MatchProfile, pa: MatchPreference, b: MatchProfile): number {
  let wish = 0.6;
  if (a.wantsChildren && b.wantsChildren) {
    if (a.wantsChildren === b.wantsChildren) wish = 1;
    else if (a.wantsChildren === "OPEN" || b.wantsChildren === "OPEN") wish = 0.7;
    else wish = 0; // oui / non : incompatibilité forte
  }
  if (pa.wantsChildren && b.wantsChildren && pa.wantsChildren !== "OPEN" && b.wantsChildren !== "OPEN") {
    wish = pa.wantsChildren === b.wantsChildren ? Math.max(wish, 0.9) : Math.min(wish, 0.2);
  }
  // A accepte-t-il les enfants existants de B ?
  let existing = 1;
  const acceptance = pa.acceptsChildren ?? a.acceptsPartnerChildren;
  if (b.childrenCount > 0) existing = acceptance === "NO" ? 0 : acceptance === "DEPENDS" ? 0.6 : 1;
  return clamp01(wish * 0.6 + existing * 0.4);
}

function educationScore(a: MatchProfile, pa: MatchPreference, b: MatchProfile): number {
  if (pa.minEducation && b.educationLevel) {
    return EDUCATION_ORDER.indexOf(b.educationLevel) >= EDUCATION_ORDER.indexOf(pa.minEducation) ? 1 : 0.3;
  }
  const diff = rankDistance(EDUCATION_ORDER, a.educationLevel, b.educationLevel);
  return diff === null ? 0.6 : clamp01(1 - diff * 0.15);
}

function languagesScore(a: MatchProfile, pa: MatchPreference, b: MatchProfile): number {
  const common = overlapCount(a.languages, b.languages);
  let s = common >= 2 ? 1 : common === 1 ? 0.85 : 0;
  if (pa.languages.length > 0) s = overlapCount(pa.languages, b.languages) > 0 ? Math.max(s, 0.9) : s * 0.5;
  return clamp01(s);
}

function preferencesScore(pa: MatchPreference, b: MatchProfile): number {
  const checks: number[] = [];
  if (pa.maritalStatuses.length > 0 && b.maritalStatus) checks.push(pa.maritalStatuses.includes(b.maritalStatus) ? 1 : 0);
  if (pa.cities.length > 0) checks.push(pa.cities.some((c) => c.toLowerCase() === b.city.toLowerCase()) ? 1 : 0.4);
  if (pa.verifiedOnly) checks.push(b.verified ? 1 : 0);
  if (checks.length === 0) return 0.8;
  return checks.reduce((x, y) => x + y, 0) / checks.length;
}

function directional(a: MatchProfile, pa: MatchPreference, b: MatchProfile): Record<Dimension, number> {
  return {
    geography: geographyScore(a, pa, b),
    age: ageScore(pa, b),
    marriage: marriageScore(a, b),
    values: valuesScore(a, pa, b),
    family: familyScore(a, pa, b),
    children: childrenScore(a, pa, b),
    education: educationScore(a, pa, b),
    languages: languagesScore(a, pa, b),
    interests: jaccard(a.interests, b.interests),
    preferences: preferencesScore(pa, b),
  };
}

function weighted(d: Record<Dimension, number>): number {
  let total = 0;
  for (const key of Object.keys(WEIGHTS) as Dimension[]) total += WEIGHTS[key] * d[key];
  return total; // 0 – 100
}

function buildReasons(a: MatchProfile, b: MatchProfile, br: Record<Dimension, number>): string[] {
  const reasons: string[] = [];
  if (a.seeksMarriage && b.seeksMarriage && br.marriage >= 0.75) reasons.push("Projet matrimonial similaire");
  if (overlapCount(a.values, b.values) >= 2) reasons.push("Valeurs personnelles communes");
  if (br.family >= 0.7) reasons.push("Valeurs familiales proches");
  if (br.children >= 0.85) reasons.push("Projets d'enfants compatibles");
  const common = overlapCount(a.languages, b.languages);
  if (common >= 1) reasons.push(common >= 2 ? "Plusieurs langues en commun" : "Même langue parlée");
  if (a.country === b.country && a.city.toLowerCase() === b.city.toLowerCase()) reasons.push("Même ville");
  else if (a.country === b.country) reasons.push("Même pays");
  if (overlapCount(a.interests, b.interests) >= 2) reasons.push("Centres d'intérêt partagés");
  if (br.age >= 1 && br.preferences >= 0.8) reasons.push("Préférences réciproques respectées");
  if (br.education >= 0.85) reasons.push("Parcours d'études compatibles");
  return reasons.slice(0, 5);
}

/**
 * Calcule la compatibilité réciproque entre deux profils.
 * Le score combiné est la moyenne géométrique des deux scores directionnels.
 */
export function computeCompatibility(
  a: MatchProfile,
  pa: MatchPreference,
  b: MatchProfile,
  pb: MatchPreference,
): CompatibilityResult {
  const ab = directional(a, pa, b);
  const ba = directional(b, pb, a);
  const sAB = weighted(ab);
  const sBA = weighted(ba);
  const score = Math.round(Math.sqrt(sAB * sBA));

  const breakdown = {} as Record<Dimension, number>;
  for (const key of Object.keys(WEIGHTS) as Dimension[]) breakdown[key] = (ab[key] + ba[key]) / 2;

  return { score: Math.max(0, Math.min(100, score)), breakdown, reasons: buildReasons(a, b, breakdown) };
}

/** Préférences par défaut si l'utilisateur n'a encore rien défini. */
export function defaultPreference(age: number): MatchPreference {
  return {
    ageMin: Math.max(18, age - 8),
    ageMax: age + 10,
    countries: [],
    cities: [],
    maxDistanceKm: null,
    maritalStatuses: [],
    acceptsChildren: null,
    minEducation: null,
    languages: [],
    religionImportances: [],
    wantsChildren: null,
    relocation: null,
    verifiedOnly: false,
  };
}
