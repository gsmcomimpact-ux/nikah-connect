import { describe, expect, it } from "vitest";
import { computeCompatibility, defaultPreference, WEIGHTS, type MatchPreference, type MatchProfile } from "@/lib/matching/engine";

const base: MatchProfile = {
  userId: "a",
  age: 30,
  country: "NE",
  city: "Niamey",
  latitude: 13.512,
  longitude: 2.112,
  maritalStatus: "SINGLE",
  childrenCount: 0,
  educationLevel: "MASTER",
  languages: ["fr", "ha"],
  values: ["foi", "famille", "honnetete"],
  familyValues: ["education_enfants", "proche_famille"],
  interests: ["lecture", "coran"],
  religionImportance: "VERY_IMPORTANT",
  religiousCompatibility: "IMPORTANT",
  seeksMarriage: true,
  wantsChildren: "YES",
  acceptsPartnerChildren: "DEPENDS",
  relocation: "FLEXIBLE",
  marriageTimeline: "WITHIN_1_YEAR",
  verified: false,
};
const pref = (over: Partial<MatchPreference> = {}): MatchPreference => ({ ...defaultPreference(30), ...over });

describe("moteur de compatibilité", () => {
  it("les pondérations totalisent 100", () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("des profils très proches obtiennent un score élevé avec des raisons", () => {
    const r = computeCompatibility(base, pref(), { ...base, userId: "b", age: 28 }, pref());
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.reasons).toContain("Projet matrimonial similaire");
    expect(r.reasons.some((x) => x.includes("langue"))).toBe(true);
    expect(r.reasons.length).toBeLessThanOrEqual(5);
  });

  it("le score est symétrique", () => {
    const b: MatchProfile = { ...base, userId: "b", age: 35, country: "FR", city: "Paris", latitude: 48.85, longitude: 2.35, languages: ["fr"] };
    const ab = computeCompatibility(base, pref(), b, pref({ ageMin: 25, ageMax: 32 }));
    const ba = computeCompatibility(b, pref({ ageMin: 25, ageMax: 32 }), base, pref());
    expect(ab.score).toBe(ba.score);
  });

  it("un désaccord fort sur les enfants pénalise nettement", () => {
    const close = computeCompatibility(base, pref(), { ...base, userId: "b" }, pref());
    const far = computeCompatibility(base, pref(), { ...base, userId: "b", wantsChildren: "NO" }, pref());
    expect(close.score - far.score).toBeGreaterThanOrEqual(5);
  });

  it("le refus des enfants existants est pris en compte", () => {
    const withKids = { ...base, userId: "b", childrenCount: 2 };
    const accepting = computeCompatibility(base, pref({ acceptsChildren: "YES" }), withKids, pref());
    const refusing = computeCompatibility(base, pref({ acceptsChildren: "NO" }), withKids, pref());
    expect(accepting.score).toBeGreaterThan(refusing.score);
  });

  it("une tranche d'âge non respectée réduit le score", () => {
    const inRange = computeCompatibility(base, pref({ ageMin: 25, ageMax: 32 }), { ...base, userId: "b", age: 30 }, pref());
    const outRange = computeCompatibility(base, pref({ ageMin: 25, ageMax: 32 }), { ...base, userId: "b", age: 45 }, pref());
    expect(inRange.score).toBeGreaterThan(outRange.score);
  });

  it("le score reste dans [0, 100] même avec des informations manquantes", () => {
    const empty: MatchProfile = { ...base, userId: "c", languages: [], values: [], familyValues: [], interests: [], religionImportance: null, religiousCompatibility: null, wantsChildren: null, acceptsPartnerChildren: null, relocation: null, marriageTimeline: null, educationLevel: null, maritalStatus: null, latitude: null, longitude: null };
    const r = computeCompatibility(empty, pref(), empty, pref());
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
