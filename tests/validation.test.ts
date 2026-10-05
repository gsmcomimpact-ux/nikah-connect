import { describe, expect, it } from "vitest";
import { cleanText, safeRedirectPath } from "@/lib/security/sanitize";
import { aboutSchema, passwordSchema, preferenceSchema, signupSchema } from "@/lib/validation/schemas";
import { ageFromDate, birthDateRangeForAges } from "@/lib/utils";

const validSignup = {
  displayName: "Amina",
  email: "Amina@Example.com ",
  password: "motdepasse2026",
  dateOfBirth: "1995-04-12",
  gender: "FEMALE",
  country: "NE",
  city: "Niamey",
  acceptTerms: "on",
};

describe("validation", () => {
  it("accepte une inscription valide et normalise l'e-mail", () => {
    const r = signupSchema.safeParse(validSignup);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("amina@example.com");
  });

  it("refuse les mineurs", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 17);
    expect(signupSchema.safeParse({ ...validSignup, dateOfBirth: d.toISOString().slice(0, 10) }).success).toBe(false);
  });

  it("exige l'acceptation des conditions", () => {
    expect(signupSchema.safeParse({ ...validSignup, acceptTerms: undefined }).success).toBe(false);
  });

  it("refuse un mot de passe faible", () => {
    expect(passwordSchema.safeParse("court1").success).toBe(false);
    expect(passwordSchema.safeParse("seulementdeslettres").success).toBe(false);
  });

  it("refuse les coordonnées dans la présentation", () => {
    const r = aboutSchema.safeParse({ displayName: "Amina", country: "NE", city: "Niamey", bio: "Contactez-moi au +227 90 12 34 56", familyValues: [], interests: [] });
    expect(r.success).toBe(false);
  });

  it("vérifie la cohérence de la tranche d'âge", () => {
    const r = preferenceSchema.safeParse({ ageMin: "40", ageMax: "30", countries: [], cities: [], maritalStatuses: [], languages: [], religionImportances: [] });
    expect(r.success).toBe(false);
  });

  it("nettoie les caractères de contrôle et limite la longueur", () => {
    expect(cleanText("  bonjour\u0000‮  ", 100)).toBe("bonjour");
    expect(cleanText("a".repeat(50), 10)).toHaveLength(10);
  });

  it("empêche les redirections ouvertes", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/espace");
    expect(safeRedirectPath("https://evil.com")).toBe("/espace");
    expect(safeRedirectPath("/espace/messages")).toBe("/espace/messages");
  });

  it("calcule correctement l'âge et les bornes de dates", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    expect(ageFromDate(new Date("1996-10-06T00:00:00Z"), now)).toBe(29);
    expect(ageFromDate(new Date("1996-10-05T00:00:00Z"), now)).toBe(30);
    const { earliest, latest } = birthDateRangeForAges(25, 30, now);
    expect(ageFromDate(latest, now)).toBe(25);
    expect(ageFromDate(earliest, now)).toBe(30);
  });
});
