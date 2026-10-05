import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";
import { env } from "@/lib/config/env";
import { hashIp, hashToken, randomToken } from "@/lib/security/crypto";
import { getClientIp, getUserAgent } from "@/lib/security/request";

export const SESSION_COOKIE = env.isProd ? "__Host-nc_session" : "nc_session";
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const RENEW_THRESHOLD_MS = 7 * 24 * 3600 * 1000;

/** Crée une session en base (seul le hachage du jeton est stocké) et pose le cookie httpOnly. */
export async function createSession(userId: string): Promise<void> {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: await getUserAgent(),
      ipHash: hashIp(await getClientIp()),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string, exceptCurrent = false): Promise<void> {
  let keepHash: string | undefined;
  if (exceptCurrent) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    keepHash = token ? hashToken(token) : undefined;
  }
  await db.session.deleteMany({ where: { userId, ...(keepHash ? { NOT: { tokenHash: keepHash } } : {}) } });
}

export async function currentSessionHash(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

/**
 * Utilisateur courant (mis en cache pour la durée de la requête).
 * Retourne null si la session est absente, expirée, ou si le compte n'est plus actif.
 */
export const getSessionUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          profile: { select: { displayName: true, gender: true } },
          adminUser: { select: { role: true } },
          subscription: { select: { plan: true, status: true, currentPeriodEnd: true } },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  const user = session.user;

  // Levée automatique d'une suspension arrivée à échéance.
  if (user.status === "SUSPENDED" && user.suspendedUntil && user.suspendedUntil < new Date()) {
    await db.user.update({ where: { id: user.id }, data: { status: "ACTIVE", suspendedUntil: null, suspensionReason: null } });
    user.status = "ACTIVE";
  }
  if (user.status === "BANNED" || user.status === "DELETED") return null;

  // Prolongation glissante + activité (au plus une écriture par heure).
  const now = Date.now();
  if (now - session.lastUsedAt.getTime() > 3600_000) {
    const renew = session.expiresAt.getTime() - now < SESSION_TTL_MS - RENEW_THRESHOLD_MS;
    await db.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date(), ...(renew ? { expiresAt: new Date(now + SESSION_TTL_MS) } : {}) },
    });
    await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  }
  return user;
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
