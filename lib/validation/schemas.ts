import { z } from "zod";
import {
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
import { COUNTRY_BY_CODE } from "@/lib/constants/geo";
import { FAMILY_VALUE_LABELS, LANGUAGE_LABELS, VALUE_LABELS } from "@/lib/constants/options";
import { analyzeContent } from "@/lib/security/scam-detection";
import { cleanLine, cleanText } from "@/lib/security/sanitize";
import { ageFromDate } from "@/lib/utils";
import { checkbox, optional } from "@/lib/validation/form";

const text = (max: number) => z.string().transform((s) => cleanText(s, max));
const line = (min: number, max: number, label: string) =>
  z
    .string()
    .transform((s) => cleanLine(s, max))
    .pipe(z.string().min(min, `${label} : ${min} caractères minimum`).max(max));

const noContactInfo = (s: string | undefined) => !s || !analyzeContent(s).containsContactInfo;
const CONTACT_MSG = "Pour votre sécurité, n'indiquez pas de téléphone, d'e-mail ni de lien dans votre profil.";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Adresse e-mail invalide").max(160));

export const passwordSchema = z
  .string()
  .min(10, "10 caractères minimum")
  .max(128, "128 caractères maximum")
  .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), "Le mot de passe doit contenir des lettres et des chiffres")
  .refine((p) => !/^(.)\1+$/.test(p), "Mot de passe trop simple");

export const phoneSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s.\-()]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Format international attendu, ex. +227 90 00 00 00"));

const countrySchema = z.string().refine((c) => COUNTRY_BY_CODE.has(c), "Pays non pris en charge");
const languagesSchema = z.array(z.string().refine((l) => l in LANGUAGE_LABELS, "Langue invalide")).max(8);
const valuesSchema = z.array(z.string().refine((v) => v in VALUE_LABELS, "Valeur invalide")).max(6, "6 valeurs maximum");
const familyValuesSchema = z.array(z.string().refine((v) => v in FAMILY_VALUE_LABELS, "Valeur invalide")).max(5, "5 valeurs maximum");

export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide")
  .transform((s) => new Date(`${s}T00:00:00.000Z`))
  .refine((d) => !Number.isNaN(d.getTime()), "Date invalide")
  .refine((d) => ageFromDate(d) >= 18, "Vous devez avoir au moins 18 ans pour vous inscrire")
  .refine((d) => ageFromDate(d) <= 99, "Date invalide");

// --- Inscription : étape 1 (compte) ---
export const signupSchema = z.object({
  displayName: line(2, 40, "Prénom ou pseudonyme").refine((s) => /^[\p{L}][\p{L}\s'’-]*$/u.test(s), "Lettres uniquement (pas de chiffres ni de symboles)"),
  email: emailSchema,
  phone: optional(phoneSchema),
  password: passwordSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: z.enum(Gender, "Merci d'indiquer votre sexe"),
  country: countrySchema,
  city: line(2, 80, "Ville"),
  acceptTerms: checkbox.refine((v) => v, "Vous devez accepter les conditions d'utilisation et la politique de confidentialité"),
});

// --- Étape 2 : informations personnelles ---
export const personalSchema = z.object({
  maritalStatus: z.enum(MaritalStatus, "Champ requis"),
  childrenCount: z.coerce.number().int().min(0).max(15),
  profession: line(2, 80, "Profession"),
  educationLevel: z.enum(EducationLevel, "Champ requis"),
  languages: languagesSchema.min(1, "Sélectionnez au moins une langue"),
});

// --- Étape 3 : profil religieux (entièrement facultatif) ---
export const religiousSchema = z.object({
  religionImportance: optional(z.enum(ReligionImportance)),
  religiousPractice: optional(z.enum(ReligiousPractice)),
  values: valuesSchema,
  marriageVision: optional(text(600)).refine(noContactInfo, CONTACT_MSG),
  religiousCompatibility: optional(z.enum(CompatibilityImportance)),
});

// --- Étape 4 : projet matrimonial ---
export const marriageSchema = z.object({
  seeksMarriage: z.enum(["yes", "no"], "Champ requis").transform((v) => v === "yes"),
  wantsChildren: z.enum(ChildrenWish, "Champ requis"),
  acceptsPartnerChildren: z.enum(PartnerChildrenAcceptance, "Champ requis"),
  relocation: z.enum(RelocationPreference, "Champ requis"),
  marriageTimeline: z.enum(MarriageTimeline, "Champ requis"),
});

// --- Étape 5 : préférences ---
export const preferenceSchema = z
  .object({
    ageMin: z.coerce.number().int().min(18).max(99),
    ageMax: z.coerce.number().int().min(18).max(99),
    countries: z.array(countrySchema).max(10),
    cities: z.array(z.string().transform((s) => cleanLine(s, 80))).max(10),
    maxDistanceKm: optional(z.coerce.number().int().min(5).max(20000)),
    maritalStatuses: z.array(z.enum(MaritalStatus)),
    acceptsChildren: optional(z.enum(PartnerChildrenAcceptance)),
    minEducation: optional(z.enum(EducationLevel)),
    languages: languagesSchema,
    religionImportances: z.array(z.enum(ReligionImportance)),
    wantsChildren: optional(z.enum(ChildrenWish)),
    relocation: optional(z.enum(RelocationPreference)),
    verifiedOnly: checkbox,
  })
  .refine((p) => p.ageMin <= p.ageMax, { message: "L'âge minimum doit être inférieur à l'âge maximum", path: ["ageMax"] });

// --- Édition du profil (présentation) ---
export const aboutSchema = z.object({
  displayName: signupSchema.shape.displayName,
  country: countrySchema,
  city: line(2, 80, "Ville"),
  bio: optional(text(1500)).refine(noContactInfo, CONTACT_MSG),
  familyVision: optional(text(800)).refine(noContactInfo, CONTACT_MSG),
  familyValues: familyValuesSchema,
  interests: z.array(z.string().max(60)).max(12, "12 centres d'intérêt maximum"),
});

export const privacySchema = z.object({
  photoVisibility: z.enum(PhotoVisibility),
  isVisible: checkbox,
  emailNotifications: checkbox,
});

export const trustedContactSchema = z
  .object({
    name: line(2, 80, "Nom"),
    relation: z.enum(TrustedContactRelation),
    email: optional(emailSchema),
    phone: optional(phoneSchema),
    showIndicator: checkbox,
  })
  .refine((v) => v.email || v.phone, { message: "Indiquez au moins un moyen de contact", path: ["email"] });

export const reportSchema = z.object({
  reportedUserId: z.string().min(1).max(40),
  messageId: optional(z.string().max(40)),
  reason: z.enum(ReportReason, "Choisissez un motif"),
  details: optional(text(1000)),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis").max(128),
});

export const contactSchema = z.object({
  name: line(2, 80, "Nom"),
  email: emailSchema,
  subject: line(3, 120, "Objet"),
  body: text(3000).pipe(z.string().min(20, "Message trop court (20 caractères minimum)")),
});
