import type { EducationLevel, Gender, MaritalStatus } from "@prisma/client";

export type VerificationBadges = { email: boolean; phone: boolean; identity: boolean };

/** Données minimales affichées sur une carte de profil (jamais de coordonnées personnelles). */
export type ProfileCardData = {
  userId: string;
  displayName: string;
  gender: Gender;
  age: number;
  city: string;
  country: string;
  profession: string | null;
  educationLevel: EducationLevel | null;
  maritalStatus: MaritalStatus | null;
  languages: string[];
  seeksMarriage: boolean;
  photoUrl: string | null;
  badges: VerificationBadges;
  hasTrustedContact: boolean;
  score: number | null;
  reasons: string[];
  distanceKm: number | null;
  lastActiveAt: Date | null;
};
