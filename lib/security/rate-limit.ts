import "server-only";
import { db } from "@/lib/db";

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

/**
 * Limitation de débit à fenêtre fixe, stockée dans PostgreSQL
 * (fonctionne avec plusieurs instances de l'application).
 * L'opération est atomique grâce à un UPSERT.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const now = new Date();
  const windowStartThreshold = new Date(now.getTime() - windowSec * 1000);
  const rows = await db.$queryRaw<{ count: number; window_start: Date }[]>`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${key}, 1, ${now})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < ${windowStartThreshold} THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < ${windowStartThreshold} THEN ${now} ELSE rate_limits.window_start END
    RETURNING count, window_start`;
  const row = rows[0];
  if (!row) return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  const count = Number(row.count);
  const retryAfterSec = Math.max(0, Math.ceil((row.window_start.getTime() + windowSec * 1000 - now.getTime()) / 1000));
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSec };
}

export async function resetRateLimit(key: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key } });
}

/** Nettoyage périodique des fenêtres expirées (appelé de manière opportuniste). */
export async function purgeExpiredRateLimits(): Promise<void> {
  await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 2 * 86400_000) } } });
}

export const LIMITS = {
  login: { limit: 10, windowSec: 15 * 60 },
  signupPerIp: { limit: 5, windowSec: 24 * 3600 },
  passwordReset: { limit: 5, windowSec: 3600 },
  messages: { limit: 40, windowSec: 10 * 60 },
  attachments: { limit: 10, windowSec: 3600 },
  reports: { limit: 20, windowSec: 24 * 3600 },
  otp: { limit: 5, windowSec: 3600 },
  contact: { limit: 5, windowSec: 3600 },
  uploads: { limit: 20, windowSec: 3600 },
} as const;
