"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { dummyVerify, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroyAllSessions, destroyCurrentSession, getSessionUser } from "@/lib/auth/session";
import { consumeToken, sendEmailVerification, sendPasswordReset } from "@/lib/auth/tokens";
import { findCity } from "@/lib/constants/geo";
import { flagUser } from "@/lib/matching/requests";
import { notify } from "@/lib/notifications/service";
import { verifyCaptcha } from "@/lib/security/captcha";
import { hashIp } from "@/lib/security/crypto";
import { LIMITS, rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";
import { getSiteSettings } from "@/lib/settings";
import { safeRedirectPath } from "@/lib/security/sanitize";
import { formToObject, validationError, type FormState } from "@/lib/validation/form";
import { emailSchema, loginSchema, passwordSchema, signupSchema } from "@/lib/validation/schemas";

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
/** Au-delà de ce nombre d'inscriptions depuis une même IP en 24 h, le compte est signalé à la modération. */
const MULTI_ACCOUNT_THRESHOLD = 3;

export async function signupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await getSiteSettings()).registrationOpen) return { ok: false, message: "Les inscriptions sont momentanément fermées. Merci de réessayer prochainement." };
  const ip = await getClientIp();
  const ipHash = hashIp(ip);
  const limit = await rateLimit(`signup:${ipHash ?? "unknown"}`, LIMITS.signupPerIp.limit, LIMITS.signupPerIp.windowSec);
  if (!limit.ok) return { ok: false, message: "Trop de créations de compte depuis cette connexion. Réessayez plus tard." };
  if (!(await verifyCaptcha(fd.get("cf-turnstile-response") as string | null, ip))) return { ok: false, message: "Vérification anti-robot échouée. Réessayez." };

  const parsed = signupSchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const exists = await db.user.findFirst({ where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] }, select: { id: true } });
  if (exists) return { ok: false, message: "Impossible de créer un compte avec ces informations. Si vous avez déjà un compte, connectez-vous ou réinitialisez votre mot de passe." };

  const city = findCity(data.country, data.city);
  const user = await db.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
      signupIpHash: ipHash,
      termsAcceptedAt: new Date(),
      onboardingStep: 2,
      profile: {
        create: {
          displayName: data.displayName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          country: data.country,
          city: city?.name ?? data.city,
          latitude: city?.lat,
          longitude: city?.lng,
          languages: [],
          values: [],
          familyValues: [],
        },
      },
      subscription: { create: { plan: "FREE" } },
    },
  });

  if (ipHash) {
    const sameIp = await db.user.count({ where: { signupIpHash: ipHash, createdAt: { gte: new Date(Date.now() - 86400_000) } } });
    if (sameIp > MULTI_ACCOUNT_THRESHOLD) await flagUser(user.id, "FRAUD", `Création de nombreux comptes : ${sameIp} inscriptions depuis la même connexion en 24 h.`);
  }

  await sendEmailVerification(user.id, user.email);
  await audit({ actorId: user.id, action: "auth.signup", targetType: "user", targetId: user.id });
  await createSession(user.id);
  redirect("/inscription/etape/2");
}

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error, "Identifiants invalides.");
  const { email, password } = parsed.data;
  const ip = await getClientIp();

  const limit = await rateLimit(`login:${hashIp(ip) ?? "unknown"}:${email}`, LIMITS.login.limit, LIMITS.login.windowSec);
  if (!limit.ok) return { ok: false, message: `Trop de tentatives. Réessayez dans ${Math.ceil(limit.retryAfterSec / 60)} minutes.` };

  const user = await db.user.findUnique({ where: { email } });
  const generic = "E-mail ou mot de passe incorrect.";
  if (!user || user.status === "DELETED") {
    await dummyVerify(password);
    return { ok: false, message: generic };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, message: "Compte temporairement verrouillé après plusieurs échecs. Réessayez plus tard ou réinitialisez votre mot de passe." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLoginCount + 1;
    const lock = failed >= MAX_FAILED_LOGINS;
    await db.user.update({ where: { id: user.id }, data: { failedLoginCount: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null } });
    if (lock) {
      await audit({ actorId: user.id, action: "auth.locked", targetType: "user", targetId: user.id });
      await notify({ userId: user.id, type: "SECURITY_ALERT", title: "Tentatives de connexion échouées", body: "Plusieurs tentatives de connexion ont échoué. Votre compte a été verrouillé 15 minutes par précaution. Si ce n'était pas vous, changez votre mot de passe." });
    }
    return { ok: false, message: generic };
  }
  if (user.status === "BANNED") return { ok: false, message: "Ce compte a été fermé suite à une décision de modération." };

  await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastActiveAt: new Date() } });
  await resetRateLimit(`login:${hashIp(ip) ?? "unknown"}:${email}`);
  await createSession(user.id);
  await audit({ actorId: user.id, action: "auth.login", targetType: "user", targetId: user.id });
  redirect(safeRedirectPath(fd.get("next") as string | null));
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  await destroyCurrentSession();
  if (user) await audit({ actorId: user.id, action: "auth.logout" });
  redirect("/");
}

export async function requestPasswordResetAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(fd.get("email"));
  if (!parsed.success) return { ok: false, errors: { email: ["Adresse e-mail invalide"] } };
  const ip = await getClientIp();
  const limit = await rateLimit(`reset:${hashIp(ip) ?? "unknown"}`, LIMITS.passwordReset.limit, LIMITS.passwordReset.windowSec);
  if (limit.ok) {
    const user = await db.user.findUnique({ where: { email: parsed.data } });
    if (user && user.status !== "DELETED" && user.status !== "BANNED") await sendPasswordReset(user.id, user.email);
  }
  // Réponse identique que le compte existe ou non (anti-énumération).
  return { ok: true, message: "Si un compte est associé à cette adresse, un e-mail de réinitialisation vient d'être envoyé." };
}

export async function resetPasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get("token") ?? "");
  const password = passwordSchema.safeParse(fd.get("password"));
  if (!password.success) return { ok: false, errors: { password: password.error.issues.map((i) => i.message) } };
  if (fd.get("password") !== fd.get("confirm")) return { ok: false, errors: { confirm: ["Les mots de passe ne correspondent pas"] } };
  const record = await consumeToken("PASSWORD_RESET", token);
  if (!record) return { ok: false, message: "Lien invalide ou expiré. Faites une nouvelle demande." };

  await db.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(password.data), failedLoginCount: 0, lockedUntil: null } });
  await destroyAllSessions(record.userId);
  await audit({ actorId: record.userId, action: "auth.password_reset", targetType: "user", targetId: record.userId });
  await notify({ userId: record.userId, type: "SECURITY_ALERT", title: "Mot de passe modifié", body: "Votre mot de passe vient d'être réinitialisé. Toutes vos sessions ont été déconnectées. Si ce n'était pas vous, contactez-nous immédiatement." });
  return { ok: true, message: "Mot de passe mis à jour. Vous pouvez vous connecter." };
}

export async function resendVerificationAction(): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: "Session expirée." };
  if (user.emailVerifiedAt) return { ok: true, message: "Votre e-mail est déjà vérifié." };
  const limit = await rateLimit(`verify-email:${user.id}`, 3, 3600);
  if (!limit.ok) return { ok: false, message: "Veuillez patienter avant de redemander un e-mail." };
  await sendEmailVerification(user.id, user.email);
  return { ok: true, message: "Un nouvel e-mail de confirmation vient d'être envoyé." };
}
