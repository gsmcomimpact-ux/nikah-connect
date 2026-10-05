/**
 * Détection heuristique de contenus à risque (arnaques, demandes d'argent,
 * liens suspects, partage de coordonnées). Ces signaux ne bloquent pas
 * automatiquement un utilisateur : ils alimentent avertissements et modération.
 */

export type RiskSignal = "MONEY_REQUEST" | "BANKING_INFO" | "SUSPICIOUS_LINK" | "CONTACT_INFO" | "OFF_PLATFORM";

export type ContentAnalysis = {
  signals: RiskSignal[];
  /** 0 – 100 */
  riskScore: number;
  containsContactInfo: boolean;
};

const MONEY_PATTERNS: RegExp[] = [
  /\b(western\s*union|moneygram|ria\s+money|world\s*remit|wave\s+money|orange\s*money|mtn\s*(mobile\s*)?money|moov\s*money|airtel\s*money|mobile\s*money|m-?pesa)\b/i,
  /\b(envoie|envoyer|envoyez|transf[eé]rer|transf[eé]rez|pr[eê]ter|pr[eê]te|d[eé]panne[rz]?)\b[^.!?\n]{0,40}\b(argent|sous|fric|euros?|francs?|fcfa|cfa|dollars?|\$|€)/i,
  /\b(j'ai|jai)\s+besoin\s+(d'|de\s+l')?argent\b/i,
  /\b(frais\s+(de\s+)?(visa|douane|hôpital|hopital|voyage|billet|dossier))\b/i,
  /\b(carte\s+cadeau|gift\s*card|coupon\s+(pcs|transcash|neosurf)|pcs\s+mastercard|transcash|neosurf)\b/i,
  /\b(bitcoin|btc|usdt|crypto(monnaie)?s?|binance)\b/i,
  /\bsend\s+(me\s+)?money\b/i,
];

const BANKING_PATTERNS: RegExp[] = [
  /\b(iban|bic|swift|rib|num[eé]ro\s+de\s+(carte|compte)|code\s+(pin|cvv|cvc)|cvv|cryptogramme)\b/i,
  /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b/, // format IBAN
  /\b(?:\d[ -]?){13,19}\b/, // numéro de carte potentiel
];

const LINK_PATTERN = /\b((?:https?:\/\/|www\.)[^\s<>"]+|[a-z0-9-]+\.(?:xyz|top|click|link|ru|tk|ml|ga|cf|gq|work|zip|mov)\b[^\s]*)/i;
const SHORTENER_PATTERN = /\b(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rb\.gy|shorturl\.at)\b/i;
const EMAIL_PATTERN = /[a-z0-9._%+-]+\s?(@|\(at\)|\[at\])\s?[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_PATTERN = /(?:\+|00)?\d[\d\s.\-()]{7,}\d/;
const OFF_PLATFORM_PATTERN = /\b(whats\s?app|telegram|signal|snap(chat)?|insta(gram)?|facebook|messenger|imo|viber|tiktok)\b/i;

export function analyzeContent(text: string): ContentAnalysis {
  const signals = new Set<RiskSignal>();
  const normalized = text.normalize("NFKC");

  if (MONEY_PATTERNS.some((p) => p.test(normalized))) signals.add("MONEY_REQUEST");
  if (BANKING_PATTERNS.some((p) => p.test(normalized))) signals.add("BANKING_INFO");
  if (LINK_PATTERN.test(normalized) || SHORTENER_PATTERN.test(normalized)) signals.add("SUSPICIOUS_LINK");
  const containsContactInfo = EMAIL_PATTERN.test(normalized) || PHONE_PATTERN.test(normalized);
  if (containsContactInfo) signals.add("CONTACT_INFO");
  if (OFF_PLATFORM_PATTERN.test(normalized)) signals.add("OFF_PLATFORM");

  const weights: Record<RiskSignal, number> = {
    MONEY_REQUEST: 60,
    BANKING_INFO: 50,
    SUSPICIOUS_LINK: 30,
    CONTACT_INFO: 10,
    OFF_PLATFORM: 10,
  };
  const riskScore = Math.min(100, [...signals].reduce((sum, s) => sum + weights[s], 0));
  return { signals: [...signals], riskScore, containsContactInfo };
}

/** Un message est « signalé » (visible par la modération) au-delà de ce seuil. */
export const FLAG_THRESHOLD = 50;

export const SAFETY_TIPS = [
  "Ne transférez jamais d'argent à une personne rencontrée sur la plateforme.",
  "Ne communiquez jamais vos informations bancaires ni vos codes.",
  "Méfiez-vous des histoires urgentes (maladie, frais de visa, douane, billet d'avion).",
  "Gardez vos échanges sur la plateforme tant que la confiance n'est pas établie.",
  "Signalez tout comportement suspect : notre équipe de modération intervient rapidement.",
] as const;
