import "server-only";
import type { ChildrenWish, EducationLevel, Gender, MaritalStatus, MarriageTimeline, Prisma, RelocationPreference } from "@prisma/client";
import { db } from "@/lib/db";
import { distanceKm } from "@/lib/constants/geo";
import { EDUCATION_ORDER } from "@/lib/constants/options";
import { computeCompatibility, type CompatibilityResult } from "@/lib/matching/engine";
import {
  badgesOf,
  canSeePhotos,
  getBlockedIds,
  profileWithRelations,
  toCardData,
  toMatchPreference,
  toMatchProfile,
  type ProfileFull,
} from "@/lib/profile/queries";
import type { ProfileCardData } from "@/lib/profile/types";
import { ageFromDate, birthDateRangeForAges, pairKey } from "@/lib/utils";

const CANDIDATE_POOL = 400;

export function oppositeGender(g: Gender): Gender {
  return g === "MALE" ? "FEMALE" : "MALE";
}

export async function loadViewer(userId: string): Promise<ProfileFull | null> {
  return db.profile.findUnique({ where: { userId }, include: profileWithRelations });
}

/** Filtre de base : profils visibles, actifs, e-mail vérifié, onboarding terminé, non bloqués. */
async function baseWhere(viewer: ProfileFull): Promise<Prisma.ProfileWhereInput> {
  const blocked = await getBlockedIds(viewer.userId);
  return {
    userId: { notIn: [viewer.userId, ...blocked] },
    gender: oppositeGender(viewer.gender),
    isVisible: true,
    user: { status: "ACTIVE", emailVerifiedAt: { not: null }, onboardingStep: { gte: 6 } },
  };
}

async function matchedIdsOf(userId: string): Promise<Set<string>> {
  const matches = await db.match.findMany({
    where: { status: "ACTIVE", OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  return new Set(matches.map((m) => (m.userAId === userId ? m.userBId : m.userAId)));
}

function score(viewer: ProfileFull, other: ProfileFull): CompatibilityResult {
  const vAge = ageFromDate(viewer.dateOfBirth);
  const oAge = ageFromDate(other.dateOfBirth);
  return computeCompatibility(
    toMatchProfile(viewer, Boolean(viewer.user.identityVerifiedAt)),
    toMatchPreference(viewer.user.preference, vAge),
    toMatchProfile(other, Boolean(other.user.identityVerifiedAt)),
    toMatchPreference(other.user.preference, oAge),
  );
}

function distanceBetween(a: ProfileFull, b: ProfileFull): number | null {
  if (a.latitude === null || a.longitude === null || b.latitude === null || b.longitude === null) return null;
  return Math.round(distanceKm({ lat: a.latitude, lng: a.longitude }, { lat: b.latitude, lng: b.longitude }));
}

function toCards(viewer: ProfileFull, profiles: ProfileFull[], matched: Set<string>): ProfileCardData[] {
  return profiles.map((p) => {
    const result = score(viewer, p);
    return toCardData(p, {
      score: result.score,
      reasons: result.reasons,
      distanceKm: distanceBetween(viewer, p),
      photosAllowed: canSeePhotos({ viewerId: viewer.userId, ownerId: p.userId, visibility: p.photoVisibility, isMatched: matched.has(p.userId) }),
    });
  });
}

function rank(cards: ProfileCardData[], profiles: Map<string, ProfileFull>): ProfileCardData[] {
  const now = Date.now();
  // Le boost Premium n'altère jamais le score affiché : il départage seulement l'ordre.
  const boost = (id: string) => ((profiles.get(id)?.boostedUntil?.getTime() ?? 0) > now ? 3 : 0);
  return cards.sort((a, b) => (b.score ?? 0) + boost(b.userId) - ((a.score ?? 0) + boost(a.userId)));
}

/** Suggestions de profils compatibles (hors profils déjà traités : demande envoyée ou « passer »). */
export async function getCompatibilities(userId: string, opts: { limit?: number; offset?: number; minScore?: number } = {}) {
  const viewer = await loadViewer(userId);
  if (!viewer) return { cards: [] as ProfileCardData[], total: 0 };
  const pref = toMatchPreference(viewer.user.preference, ageFromDate(viewer.dateOfBirth));
  const { earliest, latest } = birthDateRangeForAges(Math.max(18, pref.ageMin - 3), pref.ageMax + 3);
  const acted = await db.like.findMany({ where: { fromUserId: userId }, select: { toUserId: true } });

  const base = await baseWhere(viewer);
  const profiles = await db.profile.findMany({
    where: {
      AND: [base, { userId: { notIn: acted.map((a) => a.toUserId) } }, { dateOfBirth: { gte: earliest, lte: latest } }],
    },
    include: profileWithRelations,
    orderBy: { user: { lastActiveAt: { sort: "desc", nulls: "last" } } },
    take: CANDIDATE_POOL,
  });
  const matched = await matchedIdsOf(userId);
  const byId = new Map(profiles.map((p) => [p.userId, p]));
  const ranked = rank(toCards(viewer, profiles, matched), byId).filter((c) => (c.score ?? 0) >= (opts.minScore ?? 0));
  const offset = opts.offset ?? 0;
  return { cards: ranked.slice(offset, offset + (opts.limit ?? 12)), total: ranked.length };
}

export type SearchFilters = {
  ageMin?: number;
  ageMax?: number;
  country?: string;
  city?: string;
  distanceKm?: number;
  maritalStatuses?: MaritalStatus[];
  children?: "with" | "without";
  profession?: string;
  minEducation?: EducationLevel;
  languages?: string[];
  values?: string[];
  marriageTimeline?: MarriageTimeline;
  wantsChildren?: ChildrenWish;
  relocation?: RelocationPreference;
  verifiedOnly?: boolean;
  sort?: "compatibility" | "recent";
};

/** Filtres réservés au plan Premium (recherche avancée). */
export const ADVANCED_FILTER_KEYS: (keyof SearchFilters)[] = [
  "distanceKm",
  "profession",
  "minEducation",
  "values",
  "marriageTimeline",
  "wantsChildren",
  "relocation",
  "verifiedOnly",
];

export async function searchProfiles(userId: string, filters: SearchFilters, opts: { maxResults: number; page: number; pageSize: number }) {
  const viewer = await loadViewer(userId);
  if (!viewer) return { cards: [] as ProfileCardData[], total: 0 };

  const and: Prisma.ProfileWhereInput[] = [await baseWhere(viewer)];
  if (filters.ageMin || filters.ageMax) {
    const { earliest, latest } = birthDateRangeForAges(filters.ageMin ?? 18, filters.ageMax ?? 99);
    and.push({ dateOfBirth: { gte: earliest, lte: latest } });
  }
  if (filters.country) and.push({ country: filters.country });
  if (filters.city) and.push({ city: { equals: filters.city, mode: "insensitive" } });
  if (filters.maritalStatuses?.length) and.push({ maritalStatus: { in: filters.maritalStatuses } });
  if (filters.children === "with") and.push({ childrenCount: { gt: 0 } });
  if (filters.children === "without") and.push({ childrenCount: 0 });
  if (filters.profession) and.push({ profession: { contains: filters.profession, mode: "insensitive" } });
  if (filters.minEducation) and.push({ educationLevel: { in: EDUCATION_ORDER.slice(EDUCATION_ORDER.indexOf(filters.minEducation)) } });
  if (filters.languages?.length) and.push({ languages: { hasSome: filters.languages } });
  if (filters.values?.length) and.push({ values: { hasSome: filters.values } });
  if (filters.marriageTimeline) and.push({ marriageTimeline: filters.marriageTimeline });
  if (filters.wantsChildren) and.push({ wantsChildren: filters.wantsChildren });
  if (filters.relocation) and.push({ relocation: filters.relocation });
  if (filters.verifiedOnly) and.push({ user: { identityVerifiedAt: { not: null } } });

  let profiles = await db.profile.findMany({
    where: { AND: and },
    include: profileWithRelations,
    orderBy: { user: { lastActiveAt: { sort: "desc", nulls: "last" } } },
    take: Math.min(CANDIDATE_POOL, opts.maxResults * 3),
  });

  if (filters.distanceKm && viewer.latitude !== null) {
    profiles = profiles.filter((p) => {
      const d = distanceBetween(viewer, p);
      return d !== null && d <= filters.distanceKm!;
    });
  }

  const matched = await matchedIdsOf(userId);
  const byId = new Map(profiles.map((p) => [p.userId, p]));
  let cards = toCards(viewer, profiles, matched);
  cards = filters.sort === "recent" ? cards : rank(cards, byId);
  cards = cards.slice(0, opts.maxResults);
  const start = (opts.page - 1) * opts.pageSize;
  return { cards: cards.slice(start, start + opts.pageSize), total: cards.length };
}

/** Compatibilité détaillée entre l'utilisateur courant et un profil consulté. */
export async function getPairCompatibility(viewerId: string, targetId: string) {
  const [viewer, target] = await Promise.all([loadViewer(viewerId), loadViewer(targetId)]);
  if (!viewer || !target || viewer.gender === target.gender) return null;
  return score(viewer, target);
}

/** Profil complet visible par un membre, ou null s'il n'est pas accessible. */
export async function getViewableProfile(viewerId: string, targetId: string, viewerIsAdmin = false) {
  const target = await loadViewer(targetId);
  if (!target) return null;
  if (viewerId !== targetId && !viewerIsAdmin) {
    if (target.user.status !== "ACTIVE" || !target.isVisible || target.user.onboardingStep < 6) return null;
    const blocked = await getBlockedIds(viewerId);
    if (blocked.has(targetId)) return null;
  }
  const [a, b] = pairKey(viewerId, targetId);
  const match = await db.match.findUnique({ where: { userAId_userBId: { userAId: a, userBId: b } }, include: { conversation: true } });
  const isMatched = match?.status === "ACTIVE";
  return {
    profile: target,
    badges: badgesOf(target.user),
    isMatched,
    conversationId: isMatched ? (match?.conversation?.id ?? null) : null,
    photosAllowed: canSeePhotos({ viewerId, ownerId: targetId, visibility: target.photoVisibility, isMatched, viewerIsAdmin }),
  };
}

/** Cartes de profils pour une liste d'utilisateurs donnée (demandes, favoris…), dans l'ordre fourni. */
export async function getCardsForUsers(viewerId: string, userIds: string[]): Promise<ProfileCardData[]> {
  if (userIds.length === 0) return [];
  const viewer = await loadViewer(viewerId);
  if (!viewer) return [];
  const blocked = await getBlockedIds(viewerId);
  const profiles = await db.profile.findMany({
    where: { userId: { in: userIds.filter((id) => !blocked.has(id)) }, user: { status: { in: ["ACTIVE", "SUSPENDED"] } } },
    include: profileWithRelations,
  });
  const matched = await matchedIdsOf(viewerId);
  const cards = toCards(viewer, profiles, matched);
  return userIds.map((id) => cards.find((c) => c.userId === id)).filter((c): c is ProfileCardData => Boolean(c));
}
