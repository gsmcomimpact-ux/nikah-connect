import "server-only";

/**
 * Accès centralisé aux variables d'environnement côté serveur.
 * Aucune clé secrète ne doit être écrite en dur dans le code.
 */
function read(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

const isProd = process.env.NODE_ENV === "production";

export const env = {
  isProd,
  appUrl: read("APP_URL", "http://localhost:3000").replace(/\/$/, ""),
  ipHashSecret: read("IP_HASH_SECRET", isProd ? undefined : "dev-ip-hash-secret"),
  documentEncryptionKey: read("DOCUMENT_ENCRYPTION_KEY", isProd ? undefined : "0".repeat(64)),
  storageDir: read("STORAGE_DIR", "./storage"),
  email: {
    provider: read("EMAIL_PROVIDER", "console") as "console" | "resend",
    from: read("EMAIL_FROM", "NIKAH CONNECT <no-reply@example.com>"),
    resendApiKey: process.env.RESEND_API_KEY ?? "",
  },
  sms: {
    provider: read("SMS_PROVIDER", "console") as "console" | "twilio",
    twilioSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    twilioToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    twilioFrom: process.env.TWILIO_FROM_NUMBER ?? "",
  },
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
  payment: {
    provider: read("PAYMENT_PROVIDER", "none") as "none" | "stripe",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    stripePricePremiumMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
  },
} as const;
