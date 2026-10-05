import "server-only";
import type { Prisma, Preference, Profile } from "@prisma/client";
import { db } from "@/lib/db";
import { ageFromDate, pairKey } from "@/lib/utils";
import { defaultPreference, type MatchPreference, type MatchProfile } from "@/lib/matching/engine";
import type { ProfileCardData, VerificationBadges } from "@/lib/profile/types";

/** Relations chargées pour construire une carte ou un profil complet. */
export const profileWithRelations = {
  interests: { include: { interest: true } },
  user: {
    select: {
      id: true,
      status: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
      identityVerifiedAt: true,
      lastActiveAt: true,
      onboardingStep: true,
      preference: true,
      photos: { where: { status: "APPROVED" as const }, orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }] },
      trustedContact: { select: { showIndicator: true } },
    },
  },
} satisfies Prisma.ProfileInclude;

export type ProfileFull = Prisma.ProfileGetPayload<{ include: typeof profileWithRelations }>;

export function badgesOf(u: { emailVerifiedAt: Date | null; phoneVerifiedAt: Date | null; identityVerifiedAt: Date | null }): VerificationBadges {
  return { email: Boolean(u.emailVerifiedAt), phone: Boolean(u.phoneVerifiedAt), identity: Boolean(u.identityVerifiedAt) };
}

export function toMatchProfile(p: Profile & { interests: { interest: { slug: string } }[] }, verified: boolean): MatchProfile {
  return {
    userId: p.userId,
    age: ageFromDate(p.dateOfBirth),
    country: p.country,
    city: p.city,
    latitude: p.latitude,
    longitude: p.longitude,
    maritalStatus: p.maritalStatus,
    childrenCount: p.childrenCount,
    educationLevel: p.educationLevel,
    languages: p.languages,
    values: p.values,
    familyValues: p.familyValues,
    interests: p.interests.map((i) => i.interest.slug),
    religionImportance: p.religionImportance,
    religiousCompatibility: p.religiousCompatibility,
    seeksMarriage: p.seeksMarriage,
    wantsChildren: p.wantsChildren,
    acceptsPartnerChildren: p.acceptsPartnerChildren,
    relocation: p.relocation,
    marriageTimeline: p.marriageTimeline,
    verified,
  };
}

export function toMatchPreference(pref: Preference | null, age: number): MatchPreference {
  if (!pref) return defaultPreference(age);
  return {
    ageMin: pref.ageMin,
    ageMax: pref.ageMax,
    countries: pref.countries,
    cities: pref.cities,
    maxDistanceKm: pref.maxDistanceKm,
    maritalStatuses: pref.maritalStatuses,
    acceptsChildren: pref.acceptsChildren,
    minEducation: pref.minEducation,
    languages: pref.languages,
    religionImportances: pref.religionImportances,
    wantsChildren: pref.wantsChildren,
    relocation: pref.relocation,
    verifiedOnly: pref.verifiedOnly,
  };
}

/** Identifiants des utilisateurs bloqués dans un sens ou dans l'autre. */
export async function getBlockedIds(userId: string): Promise<Set<string>> {
  const blocks = await db.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  return new Set(blocks.map((b) => (b.blockerId === userId ? b.blockedId : b.blockerId)));
}

export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const count = await db.block.count({ where: { OR: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] } });
  return count > 0;
}

export async function getActiveMatch(a: string, b: string) {
  const [userAId, userBId] = pairKey(a, b);
  return db.match.findFirst({ where: { userAId, userBId, status: "ACTIVE" }, include: { conversation: true } });
}

/** Règle de visibilité des photos selon le choix de leur propriétaire. */
export function canSeePhotos(params: { viewerId: string | null; ownerId: string; visibility: Profile["photoVisibility"]; isMatched: boolean; viewerIsAdmin?: boolean }): boolean {
  if (params.viewerIsAdmin || params.viewerId === params.ownerId) return true;
  if (!params.viewerId) return false;
  if (params.visibility === "HIDDEN") return false;
  if (params.visibility === "MATCHES_ONLY") return params.isMatched;
  return true;
}

export function toCardData(
  p: ProfileFull,
  opts: { score?: number | null; reasons?: string[]; distanceKm?: number | null; photosAllowed: boolean },
): ProfileCardData {
  const photo = opts.photosAllowed ? p.user.photos[0] : undefined;
  return {
    userId: p.userId,
    displayName: p.displayName,
    gender: p.gender,
    age: ageFromDate(p.dateOfBirth),
    city: p.city,
    country: p.country,
    profession: p.profession,
    educationLevel: p.educationLevel,
    maritalStatus: p.maritalStatus,
    languages: p.languages,
    seeksMarriage: p.seeksMarriage,
    photoUrl: photo ? `/api/media/photo/${photo.id}` : null,
    badges: badgesOf(p.user),
    hasTrustedContact: Boolean(p.user.trustedContact?.showIndicator),
    score: opts.score ?? null,
    reasons: opts.reasons ?? [],
    distanceKm: opts.distanceKm ?? null,
    lastActiveAt: p.user.lastActiveAt,
  };
}

/** Taux de complétion du profil (0 – 100), affiché pour guider l'utilisateur. */
export function computeCompleteness(p: Partial<Profile>, extras: { photos: number; interests: number; hasPreference: boolean }): number {
  const checks = [
    Boolean(p.displayName),
    Boolean(p.city && p.country),
    Boolean(p.maritalStatus),
    Boolean(p.profession),
    Boolean(p.educationLevel),
    (p.languages?.length ?? 0) > 0,
    (p.bio?.length ?? 0) >= 80,
    Boolean(p.religionImportance),
    (p.values?.length ?? 0) >= 2,
    Boolean(p.marriageVision),
    Boolean(p.wantsChildren),
    Boolean(p.marriageTimeline),
    Boolean(p.familyVision),
    (p.familyValues?.length ?? 0) > 0,
    extras.interests >= 3,
    extras.photos > 0,
    extras.hasPreference,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function refreshCompleteness(userId: string): Promise<number> {
  const p = await db.profile.findUnique({ where: { userId }, include: { _count: { select: { interests: true } } } });
  if (!p) return 0;
  const [photos, pref] = await Promise.all([
    db.photo.count({ where: { userId, status: { not: "REJECTED" } } }),
    db.preference.findUnique({ where: { userId }, select: { userId: true } }),
  ]);
  const completeness = computeCompleteness(p, { photos, interests: p._count.interests, hasPreference: Boolean(pref) });
  await db.profile.update({ where: { userId }, data: { completeness } });
  return completeness;
}
