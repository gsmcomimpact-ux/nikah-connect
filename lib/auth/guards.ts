import "server-only";
import type { AdminRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403 = 401,
  ) {
    super(message);
  }
}

/** Pages : redirige vers la connexion si l'utilisateur n'est pas authentifié. */
export async function requireUser(options: { allowIncompleteOnboarding?: boolean; allowSuspended?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  if (!options.allowSuspended && user.status === "SUSPENDED") redirect("/espace/compte-suspendu");
  if (!options.allowIncompleteOnboarding && user.onboardingStep < 6) redirect(`/inscription/etape/${user.onboardingStep}`);
  return user;
}

/** Actions et API : lève une erreur au lieu de rediriger. */
export async function requireApiUser(options: { allowSuspended?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Authentification requise", 401);
  if (!options.allowSuspended && user.status === "SUSPENDED") throw new AuthError("Compte suspendu", 403);
  return user;
}

const ROLE_RANK: Record<AdminRole, number> = { MODERATOR: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export function hasRole(user: SessionUser | null, min: AdminRole): boolean {
  const role = user?.adminUser?.role;
  return Boolean(role && ROLE_RANK[role] >= ROLE_RANK[min]);
}

export async function requireAdmin(min: AdminRole = "MODERATOR"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin");
  if (!hasRole(user, min)) redirect("/espace");
  return user;
}

export async function requireApiAdmin(min: AdminRole = "MODERATOR"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Authentification requise", 401);
  if (!hasRole(user, min)) throw new AuthError("Accès refusé", 403);
  return user;
}
