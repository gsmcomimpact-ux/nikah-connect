"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { deleteAccount } from "@/lib/account/lifecycle";
import { requireApiUser } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { destroyAllSessions, destroyCurrentSession } from "@/lib/auth/session";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/auth/tokens";
import { createCheckout } from "@/lib/billing/provider";
import { notify } from "@/lib/notifications/service";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { MAX_DOCUMENT_BYTES, sniffDocumentType, storeEncrypted } from "@/lib/storage";
import type { FormState } from "@/lib/validation/form";
import { passwordSchema, phoneSchema } from "@/lib/validation/schemas";

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser({ allowSuspended: true });
  const current = String(fd.get("current") ?? "");
  const next = passwordSchema.safeParse(fd.get("password"));
  if (!next.success) return { ok: false, errors: { password: next.error.issues.map((i) => i.message) } };
  if (fd.get("password") !== fd.get("confirm")) return { ok: false, errors: { confirm: ["Les mots de passe ne correspondent pas"] } };
  const limit = await rateLimit(`pwd-change:${user.id}`, 5, 3600);
  if (!limit.ok) return { ok: false, message: "Trop de tentatives. Réessayez plus tard." };
  if (!(await verifyPassword(current, user.passwordHash))) return { ok: false, errors: { current: ["Mot de passe actuel incorrect"] } };

  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next.data) } });
  await destroyAllSessions(user.id, true);
  await audit({ actorId: user.id, action: "auth.password_change" });
  await notify({ userId: user.id, type: "SECURITY_ALERT", title: "Mot de passe modifié", body: "Votre mot de passe a été modifié. Vos autres sessions ont été déconnectées." });
  return { ok: true, message: "Mot de passe modifié. Vos autres appareils ont été déconnectés." };
}

export async function revokeSessionAction(sessionId: string): Promise<void> {
  const user = await requireApiUser({ allowSuspended: true });
  await db.session.deleteMany({ where: { id: sessionId, userId: user.id } });
  await audit({ actorId: user.id, action: "auth.session_revoke", targetId: sessionId });
  revalidatePath("/espace/parametres/securite");
}

export async function revokeOtherSessionsAction(): Promise<void> {
  const user = await requireApiUser({ allowSuspended: true });
  await destroyAllSessions(user.id, true);
  await audit({ actorId: user.id, action: "auth.sessions_revoke_all" });
  revalidatePath("/espace/parametres/securite");
}

export async function sendPhoneCodeAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const phone = phoneSchema.safeParse(fd.get("phone"));
  if (!phone.success) return { ok: false, errors: { phone: phone.error.issues.map((i) => i.message) } };
  const taken = await db.user.findFirst({ where: { phone: phone.data, NOT: { id: user.id } }, select: { id: true } });
  if (taken) return { ok: false, errors: { phone: ["Ce numéro ne peut pas être utilisé."] } };
  const limit = await rateLimit(`otp:${user.id}`, LIMITS.otp.limit, LIMITS.otp.windowSec);
  if (!limit.ok) return { ok: false, message: "Trop de codes demandés. Réessayez dans une heure." };
  await sendPhoneOtp(user.id, phone.data);
  return { ok: true, message: "Un code à 6 chiffres vient d'être envoyé par SMS." };
}

export async function verifyPhoneCodeAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const code = String(fd.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, errors: { code: ["Le code comporte 6 chiffres"] } };
  const result = await verifyPhoneOtp(user.id, code);
  if (result === "ok") {
    await audit({ actorId: user.id, action: "auth.phone_verified" });
    revalidatePath("/espace", "layout");
    return { ok: true, message: "Numéro de téléphone vérifié." };
  }
  return { ok: false, message: result === "invalid" ? "Code incorrect." : result === "locked" ? "Trop d'essais. Demandez un nouveau code." : "Code expiré. Demandez un nouveau code." };
}

/** Dépôt d'une pièce d'identité : stockée chiffrée, visible uniquement par les administrateurs autorisés, supprimée après décision. */
export async function submitIdentityAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  if (user.identityVerifiedAt) return { ok: true, message: "Votre identité est déjà vérifiée." };
  const pending = await db.verificationRequest.findFirst({ where: { userId: user.id, status: "PENDING" } });
  if (pending) return { ok: false, message: "Une demande est déjà en cours d'examen." };
  const limit = await rateLimit(`identity:${user.id}`, 3, 24 * 3600);
  if (!limit.ok) return { ok: false, message: "Trop de demandes aujourd'hui." };

  const documentType = String(fd.get("documentType") ?? "");
  if (!["CNI", "PASSEPORT", "PERMIS", "TITRE_SEJOUR"].includes(documentType)) return { ok: false, errors: { documentType: ["Type de document requis"] } };
  const files: Buffer[] = [];
  for (const key of ["document", "selfie"]) {
    const f = fd.get(key);
    if (!(f instanceof File) || f.size === 0) return { ok: false, errors: { [key]: ["Fichier requis"] } };
    if (f.size > MAX_DOCUMENT_BYTES) return { ok: false, errors: { [key]: ["Fichier trop volumineux (8 Mo maximum)"] } };
    const buf = Buffer.from(await f.arrayBuffer());
    if (!sniffDocumentType(buf)) return { ok: false, errors: { [key]: ["Format accepté : JPEG, PNG, WebP ou PDF"] } };
    files.push(buf);
  }
  const [documentKey, selfieKey] = await Promise.all(files.map((b) => storeEncrypted(b)));
  const req = await db.verificationRequest.create({ data: { userId: user.id, documentType, documentKey, selfieKey } });
  await audit({ actorId: user.id, action: "verification.submit", targetType: "verification", targetId: req.id });
  revalidatePath("/espace/parametres/verification");
  return { ok: true, message: "Merci ! Vos documents ont été transmis de façon chiffrée. Ils seront examinés sous 72 h puis supprimés après décision." };
}

export async function deleteAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser({ allowSuspended: true });
  if (fd.get("confirmation") !== "SUPPRIMER") return { ok: false, errors: { confirmation: ["Saisissez SUPPRIMER pour confirmer"] } };
  if (!(await verifyPassword(String(fd.get("password") ?? ""), user.passwordHash))) return { ok: false, errors: { password: ["Mot de passe incorrect"] } };
  await audit({ actorId: user.id, action: "account.delete", targetType: "user", targetId: user.id });
  await deleteAccount(user.id);
  await destroyCurrentSession();
  redirect("/?compte=supprime");
}

export async function startCheckoutAction(): Promise<FormState> {
  const user = await requireApiUser();
  const res = await createCheckout({ userId: user.id, email: user.email });
  if ("url" in res) redirect(res.url);
  return { ok: false, message: res.error };
}
