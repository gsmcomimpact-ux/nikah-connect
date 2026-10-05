"use server";

import { revalidatePath } from "next/cache";
import { BlogCategory, ReportStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { deleteAccount } from "@/lib/account/lifecycle";
import { requireApiAdmin } from "@/lib/auth/guards";
import { destroyAllSessions } from "@/lib/auth/session";
import { notify } from "@/lib/notifications/service";
import { cleanLine, cleanText } from "@/lib/security/sanitize";
import { deleteFileByKey } from "@/lib/storage";
import { formToObject, validationError, checkbox, type FormState } from "@/lib/validation/form";

// ------------------------------------------------------------------ Utilisateurs

export async function suspendUserAction(userId: string, fd: FormData): Promise<void> {
  const admin = await requireApiAdmin("MODERATOR");
  const days = Math.min(365, Math.max(1, Number(fd.get("days")) || 7));
  const reason = cleanLine(String(fd.get("reason") ?? ""), 300) || "Non-respect des règles communautaires";
  const target = await db.user.findUnique({ where: { id: userId }, include: { adminUser: true } });
  if (!target || target.adminUser) return; // un administrateur ne peut pas être suspendu ici
  await db.user.update({ where: { id: userId }, data: { status: "SUSPENDED", suspendedUntil: new Date(Date.now() + days * 86400_000), suspensionReason: reason } });
  await audit({ actorId: admin.id, action: "admin.user_suspend", targetType: "user", targetId: userId, metadata: { days, reason } });
  await notify({ userId, type: "SECURITY_ALERT", title: "Compte suspendu", body: `Votre compte est suspendu pour ${days} jour(s). Motif : ${reason}` });
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function banUserAction(userId: string, fd: FormData): Promise<void> {
  const admin = await requireApiAdmin("ADMIN");
  const reason = cleanLine(String(fd.get("reason") ?? ""), 300) || "Manquement grave aux règles";
  const target = await db.user.findUnique({ where: { id: userId }, include: { adminUser: true } });
  if (!target || target.adminUser) return;
  await db.user.update({ where: { id: userId }, data: { status: "BANNED", suspensionReason: reason, suspendedUntil: null } });
  await db.profile.updateMany({ where: { userId }, data: { isVisible: false } });
  await db.match.updateMany({ where: { OR: [{ userAId: userId }, { userBId: userId }], status: "ACTIVE" }, data: { status: "ENDED", endedAt: new Date() } });
  await destroyAllSessions(userId);
  await audit({ actorId: admin.id, action: "admin.user_ban", targetType: "user", targetId: userId, metadata: { reason } });
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function reactivateUserAction(userId: string): Promise<void> {
  const admin = await requireApiAdmin("ADMIN");
  await db.user.update({ where: { id: userId }, data: { status: "ACTIVE", suspendedUntil: null, suspensionReason: null } });
  await audit({ actorId: admin.id, action: "admin.user_reactivate", targetType: "user", targetId: userId });
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function verifyIdentityManuallyAction(userId: string): Promise<void> {
  const admin = await requireApiAdmin("ADMIN");
  await db.user.update({ where: { id: userId }, data: { identityVerifiedAt: new Date() } });
  await audit({ actorId: admin.id, action: "admin.identity_verify_manual", targetType: "user", targetId: userId });
  await notify({ userId, type: "PROFILE_VERIFIED", title: "Profil vérifié", body: "Votre identité a été vérifiée. Le badge « Profil vérifié » est désormais visible sur votre profil.", link: "/espace/parametres/verification" });
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function grantPremiumAction(userId: string, fd: FormData): Promise<void> {
  const admin = await requireApiAdmin("ADMIN");
  const days = Math.min(730, Math.max(1, Number(fd.get("days")) || 30));
  const end = new Date(Date.now() + days * 86400_000);
  await db.subscription.upsert({ where: { userId }, create: { userId, plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd: end, provider: "manual" }, update: { plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd: end, provider: "manual" } });
  await audit({ actorId: admin.id, action: "admin.premium_grant", targetType: "user", targetId: userId, metadata: { days } });
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

export async function adminDeleteUserAction(userId: string): Promise<void> {
  const admin = await requireApiAdmin("SUPER_ADMIN");
  if (userId === admin.id) return;
  await audit({ actorId: admin.id, action: "admin.user_delete", targetType: "user", targetId: userId });
  await deleteAccount(userId);
  revalidatePath("/admin/utilisateurs");
}

export async function setAdminRoleAction(userId: string, fd: FormData): Promise<void> {
  const admin = await requireApiAdmin("SUPER_ADMIN");
  const role = String(fd.get("role") ?? "");
  if (userId === admin.id) return;
  if (role === "NONE") await db.adminUser.deleteMany({ where: { userId } });
  else if (role === "MODERATOR" || role === "ADMIN" || role === "SUPER_ADMIN")
    await db.adminUser.upsert({ where: { userId }, create: { userId, role, createdById: admin.id }, update: { role } });
  await audit({ actorId: admin.id, action: "admin.role_set", targetType: "user", targetId: userId, metadata: { role } });
  revalidatePath(`/admin/utilisateurs/${userId}`);
}

// ------------------------------------------------------------------ Signalements & contenus

export async function handleReportAction(reportId: string, fd: FormData): Promise<void> {
  const admin = await requireApiAdmin("MODERATOR");
  const status = z.enum(ReportStatus).catch("RESOLVED").parse(fd.get("status"));
  const resolution = cleanText(String(fd.get("resolution") ?? ""), 1000) || null;
  const report = await db.report.update({ where: { id: reportId }, data: { status, resolution, handledById: admin.id, handledAt: new Date() } });
  if (fd.get("hideMessage") === "on" && report.messageId) await db.message.update({ where: { id: report.messageId }, data: { status: "HIDDEN" } });
  await audit({ actorId: admin.id, action: "admin.report_handle", targetType: "report", targetId: reportId, metadata: { status } });
  if (report.reporterId && (status === "RESOLVED" || status === "DISMISSED")) {
    await notify({ userId: report.reporterId, type: "REPORT_HANDLED", title: "Signalement traité", body: "Merci pour votre vigilance. Votre signalement a été examiné par l'équipe de modération et les mesures appropriées ont été prises." });
  }
  revalidatePath("/admin/signalements");
}

export async function hideMessageAction(messageId: string, hidden: boolean): Promise<void> {
  const admin = await requireApiAdmin("MODERATOR");
  await db.message.update({ where: { id: messageId }, data: { status: hidden ? "HIDDEN" : "VISIBLE", ...(hidden ? {} : { flagged: false }) } });
  await audit({ actorId: admin.id, action: hidden ? "admin.message_hide" : "admin.message_restore", targetType: "message", targetId: messageId });
  revalidatePath("/admin/messages");
}

export async function moderatePhotoAction(photoId: string, approve: boolean): Promise<void> {
  const admin = await requireApiAdmin("MODERATOR");
  const photo = await db.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;
  if (approve) await db.photo.update({ where: { id: photoId }, data: { status: "APPROVED" } });
  else {
    await db.photo.update({ where: { id: photoId }, data: { status: "REJECTED", isPrimary: false } });
    await deleteFileByKey(photo.storageKey);
    await notify({ userId: photo.userId, type: "SYSTEM", title: "Photo refusée", body: "Une de vos photos n'a pas été validée car elle ne respecte pas les règles communautaires (pudeur, visage identifiable, pas de texte ni de coordonnées).", link: "/espace/profil#photos" });
  }
  await audit({ actorId: admin.id, action: approve ? "admin.photo_approve" : "admin.photo_reject", targetType: "photo", targetId: photoId });
  revalidatePath("/admin/photos");
}

// ------------------------------------------------------------------ Vérifications d'identité

export async function reviewVerificationAction(requestId: string, fd: FormData): Promise<void> {
  const admin = await requireApiAdmin("ADMIN");
  const approve = fd.get("decision") === "approve";
  const reason = cleanLine(String(fd.get("reason") ?? ""), 300) || null;
  const req = await db.verificationRequest.findUnique({ where: { id: requestId } });
  if (!req || req.status !== "PENDING") return;

  // Minimisation : les documents sont supprimés dès la décision prise.
  await Promise.all([deleteFileByKey(req.documentKey), deleteFileByKey(req.selfieKey)]);
  await db.verificationRequest.update({
    where: { id: requestId },
    data: { status: approve ? "APPROVED" : "REJECTED", rejectionReason: approve ? null : reason, reviewedById: admin.id, reviewedAt: new Date(), documentKey: null, selfieKey: null },
  });
  if (approve) await db.user.update({ where: { id: req.userId }, data: { identityVerifiedAt: new Date() } });
  await audit({ actorId: admin.id, action: approve ? "admin.verification_approve" : "admin.verification_reject", targetType: "verification", targetId: requestId });
  await notify(
    approve
      ? { userId: req.userId, type: "PROFILE_VERIFIED", title: "Profil vérifié", body: "Votre identité a été vérifiée. Le badge « Profil vérifié » est désormais visible.", link: "/espace/parametres/verification" }
      : { userId: req.userId, type: "VERIFICATION_REJECTED", title: "Vérification non aboutie", body: `Votre demande de vérification n'a pas pu être validée${reason ? ` : ${reason}` : "."} Vous pouvez soumettre une nouvelle demande.`, link: "/espace/parametres/verification" },
  );
  revalidatePath("/admin/verifications");
}

// ------------------------------------------------------------------ Blog

const blogSchema = z.object({
  title: z.string().transform((s) => cleanLine(s, 160)).pipe(z.string().min(5, "Titre trop court")),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules, chiffres et tirets)").max(120),
  excerpt: z.string().transform((s) => cleanText(s, 300)).pipe(z.string().min(20, "Résumé trop court")),
  content: z.string().transform((s) => cleanText(s, 50000)).pipe(z.string().min(100, "Contenu trop court")),
  category: z.enum(BlogCategory),
  authorName: z.string().transform((s) => cleanLine(s, 80)).pipe(z.string().min(2)),
  seoTitle: z.string().transform((s) => cleanLine(s, 70)).optional(),
  seoDescription: z.string().transform((s) => cleanLine(s, 170)).optional(),
  published: checkbox,
});

export async function saveBlogPostAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireApiAdmin("ADMIN");
  const parsed = blogSchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error);
  const d = parsed.data;
  const id = String(fd.get("id") ?? "");
  const readingMinutes = Math.max(1, Math.round(d.content.split(/\s+/).length / 220));
  const conflict = await db.blogPost.findFirst({ where: { slug: d.slug, ...(id ? { NOT: { id } } : {}) } });
  if (conflict) return { ok: false, errors: { slug: ["Ce slug est déjà utilisé"] } };
  const data = { ...d, seoTitle: d.seoTitle || null, seoDescription: d.seoDescription || null, readingMinutes };
  if (id) {
    const existing = await db.blogPost.findUnique({ where: { id } });
    await db.blogPost.update({ where: { id }, data: { ...data, publishedAt: d.published ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt } });
  } else {
    await db.blogPost.create({ data: { ...data, publishedAt: d.published ? new Date() : null } });
  }
  await audit({ actorId: admin.id, action: id ? "admin.blog_update" : "admin.blog_create", targetType: "blog_post", metadata: { slug: d.slug } });
  revalidatePath("/conseils", "layout");
  revalidatePath("/admin/blog");
  return { ok: true, message: "Article enregistré." };
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  const admin = await requireApiAdmin("ADMIN");
  await db.blogPost.delete({ where: { id } });
  await audit({ actorId: admin.id, action: "admin.blog_delete", targetType: "blog_post", targetId: id });
  revalidatePath("/conseils", "layout");
  revalidatePath("/admin/blog");
}

// ------------------------------------------------------------------ Contact & paramètres

export async function markContactHandledAction(id: string): Promise<void> {
  const admin = await requireApiAdmin("MODERATOR");
  await db.contactMessage.update({ where: { id }, data: { handled: true } });
  await audit({ actorId: admin.id, action: "admin.contact_handled", targetType: "contact", targetId: id });
  revalidatePath("/admin/contact");
}

export async function saveSiteSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireApiAdmin("SUPER_ADMIN");
  const settings = {
    registrationOpen: fd.get("registrationOpen") === "on",
    announcement: cleanLine(String(fd.get("announcement") ?? ""), 240),
    supportEmail: cleanLine(String(fd.get("supportEmail") ?? ""), 160),
  };
  await db.$transaction(Object.entries(settings).map(([key, value]) => db.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } })));
  await audit({ actorId: admin.id, action: "admin.settings_update", metadata: settings });
  revalidatePath("/", "layout");
  return { ok: true, message: "Paramètres enregistrés." };
}
