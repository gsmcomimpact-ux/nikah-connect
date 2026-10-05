import { describe, expect, it } from "vitest";
import { analyzeContent, FLAG_THRESHOLD } from "@/lib/security/scam-detection";

describe("détection anti-arnaque", () => {
  it("détecte une demande d'argent via un service de transfert", () => {
    const r = analyzeContent("Peux-tu m'envoyer 200 euros par Western Union ? C'est urgent pour mon visa.");
    expect(r.signals).toContain("MONEY_REQUEST");
    expect(r.riskScore).toBeGreaterThanOrEqual(FLAG_THRESHOLD);
  });

  it("détecte le mobile money et les frais de douane", () => {
    expect(analyzeContent("Fais-moi un dépôt Orange Money").signals).toContain("MONEY_REQUEST");
    expect(analyzeContent("je dois payer des frais de douane").signals).toContain("MONEY_REQUEST");
  });

  it("détecte les informations bancaires", () => {
    expect(analyzeContent("Donne-moi ton IBAN et ton code CVV").signals).toContain("BANKING_INFO");
  });

  it("détecte les coordonnées (téléphone, e-mail)", () => {
    expect(analyzeContent("Appelle-moi au +227 90 12 34 56").containsContactInfo).toBe(true);
    expect(analyzeContent("écris-moi : prenom.nom@gmail.com").containsContactInfo).toBe(true);
  });

  it("détecte les liens raccourcis", () => {
    expect(analyzeContent("regarde bit.ly/abc123").signals).toContain("SUSPICIOUS_LINK");
  });

  it("ne signale pas un message ordinaire", () => {
    const r = analyzeContent("Assalamou alaykoum, merci pour votre message. Quelles sont vos priorités pour le foyer ?");
    expect(r.signals).toEqual([]);
    expect(r.riskScore).toBe(0);
  });
});
