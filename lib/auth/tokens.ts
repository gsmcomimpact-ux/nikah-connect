import "server-only";
import type { TokenType } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/config/env";
import { hashToken, randomOtp, randomToken } from "@/lib/security/crypto";
import { sendEmail, sendSms } from "@/lib/notifications/channels";

const TTL: Record<TokenType, number> = { EMAIL_VERIFY: 48 * 3600_000, PASSWORD_RESET: 3600_000, PHONE_OTP: 10 * 60_000 };

async function issue(userId: string, type: TokenType, token: string, target?: string) {
  await db.verificationToken.deleteMany({ where: { userId, type, usedAt: null } });
  await db.verificationToken.create({ data: { userId, type, target, tokenHash: hashToken(type === "PHONE_OTP" ? `${userId}:${token}` : token), expiresAt: new Date(Date.now() + TTL[type]) } });
}

export async function sendEmailVerification(userId: string, email: string) {
  const token = randomToken(32);
  await issue(userId, "EMAIL_VERIFY", token, email);
  await sendEmail(email, "Confirmez votre adresse e-mail", `Bienvenue !\n\nPour confirmer votre adresse e-mail, ouvrez ce lien (valable 48 h) :\n${env.appUrl}/api/auth/verify-email?token=${token}\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez ce message.`);
}

export async function sendPasswordReset(userId: string, email: string) {
  const token = randomToken(32);
  await issue(userId, "PASSWORD_RESET", token, email);
  await sendEmail(email, "Réinitialisation de votre mot de passe", `Une demande de réinitialisation de mot de passe a été effectuée.\n\nOuvrez ce lien (valable 1 h) :\n${env.appUrl}/reinitialiser-mot-de-passe?token=${token}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.`);
}

export async function sendPhoneOtp(userId: string, phone: string) {
  const code = randomOtp();
  await issue(userId, "PHONE_OTP", code, phone);
  await sendSms(phone, `Votre code de vérification : ${code}. Il expire dans 10 minutes. Ne le communiquez à personne.`);
}

/** Consomme un jeton (usage unique). Retourne le jeton valide ou null. */
export async function consumeToken(type: Exclude<TokenType, "PHONE_OTP">, token: string) {
  const record = await db.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) return null;
  const updated = await db.verificationToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: new Date() } });
  return updated.count === 1 ? record : null;
}

export async function verifyPhoneOtp(userId: string, code: string): Promise<"ok" | "invalid" | "expired" | "locked"> {
  const record = await db.verificationToken.findFirst({ where: { userId, type: "PHONE_OTP", usedAt: null }, orderBy: { createdAt: "desc" } });
  if (!record || record.expiresAt < new Date()) return "expired";
  if (record.attempts >= 5) return "locked";
  if (record.tokenHash !== hashToken(`${userId}:${code}`)) {
    await db.verificationToken.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return "invalid";
  }
  await db.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  await db.user.update({ where: { id: userId }, data: { phoneVerifiedAt: new Date(), phone: record.target ?? undefined } });
  return "ok";
}
