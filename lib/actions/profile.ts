"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireApiUser } from "@/lib/auth/guards";
import { findCity } from "@/lib/constants/geo";
import { refreshCompleteness } from "@/lib/profile/queries";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { cleanLine } from "@/lib/security/sanitize";
import { deleteFileByKey, MAX_PHOTO_BYTES, sniffImageType, storeImage } from "@/lib/storage";
import { formToObject, validationError, type FormState } from "@/lib/validation/form";
import { aboutSchema, privacySchema, trustedContactSchema } from "@/lib/validation/schemas";

const MAX_PHOTOS = 6;

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function updateAboutAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const raw = formToObject(fd, ["familyValues", "interests"]);
  const extra = String(fd.get("customInterests") ?? "")
    .split(",")
    .map((s) => cleanLine(s, 40))
    .filter((s) => s.length >= 2);
  raw.interests = [...(raw.interests as string[]), ...extra];
  const parsed = aboutSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error);
  const d = parsed.data;
  const city = findCity(d.country, d.city);

  // Centres d'intérêt : association aux entrées existantes, création des nouvelles.
  const interestIds: string[] = [];
  for (const label of d.interests) {
    const slug = slugify(label);
    if (!slug) continue;
    const interest = await db.interest.upsert({ where: { slug }, create: { slug, label: cleanLine(label, 40), category: "Autre" }, update: {} });
    interestIds.push(interest.id);
  }

  await db.$transaction([
    db.profile.update({
      where: { userId: user.id },
      data: {
        displayName: d.displayName,
        country: d.country,
        city: city?.name ?? d.city,
        latitude: city?.lat ?? null,
        longitude: city?.lng ?? null,
        bio: d.bio ?? null,
        familyVision: d.familyVision ?? null,
        familyValues: d.familyValues,
      },
    }),
    db.profileInterest.deleteMany({ where: { profileId: user.id } }),
    db.profileInterest.createMany({ data: [...new Set(interestIds)].map((interestId) => ({ profileId: user.id, interestId })) }),
  ]);
  await refreshCompleteness(user.id);
  revalidatePath("/espace", "layout");
  return { ok: true, message: "Votre profil a été mis à jour." };
}

export async function uploadPhotoAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const limit = await rateLimit(`upload:${user.id}`, LIMITS.uploads.limit, LIMITS.uploads.windowSec);
  if (!limit.ok) return { ok: false, message: "Trop d'envois. Réessayez plus tard." };
  const count = await db.photo.count({ where: { userId: user.id, status: { not: "REJECTED" } } });
  if (count >= MAX_PHOTOS) return { ok: false, message: `Vous pouvez publier ${MAX_PHOTOS} photos au maximum.` };

  const file = fd.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Sélectionnez une image." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, message: "Image trop volumineuse (4 Mo maximum)." };
  const buf = Buffer.from(await file.arrayBuffer());
  if (!sniffImageType(buf)) return { ok: false, message: "Format non accepté. Utilisez JPEG, PNG ou WebP." };

  try {
    const stored = await storeImage("photos", buf);
    await db.photo.create({ data: { userId: user.id, storageKey: stored.key, width: stored.width, height: stored.height, isPrimary: count === 0, status: "PENDING" } });
  } catch {
    return { ok: false, message: "Image illisible ou corrompue." };
  }
  await refreshCompleteness(user.id);
  revalidatePath("/espace/profil");
  return { ok: true, message: "Photo envoyée. Elle sera visible après validation par la modération (métadonnées de localisation supprimées)." };
}

export async function deletePhotoAction(photoId: string): Promise<void> {
  const user = await requireApiUser();
  const photo = await db.photo.findFirst({ where: { id: photoId, userId: user.id } });
  if (!photo) return;
  await db.photo.delete({ where: { id: photo.id } });
  await deleteFileByKey(photo.storageKey);
  if (photo.isPrimary) {
    const next = await db.photo.findFirst({ where: { userId: user.id, status: { not: "REJECTED" } }, orderBy: { createdAt: "asc" } });
    if (next) await db.photo.update({ where: { id: next.id }, data: { isPrimary: true } });
  }
  await refreshCompleteness(user.id);
  revalidatePath("/espace", "layout");
}

export async function setPrimaryPhotoAction(photoId: string): Promise<void> {
  const user = await requireApiUser();
  const photo = await db.photo.findFirst({ where: { id: photoId, userId: user.id } });
  if (!photo) return;
  await db.$transaction([
    db.photo.updateMany({ where: { userId: user.id }, data: { isPrimary: false } }),
    db.photo.update({ where: { id: photo.id }, data: { isPrimary: true } }),
  ]);
  revalidatePath("/espace", "layout");
}

export async function updatePrivacyAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const parsed = privacySchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error);
  await db.$transaction([
    db.profile.update({ where: { userId: user.id }, data: { photoVisibility: parsed.data.photoVisibility, isVisible: parsed.data.isVisible } }),
    db.user.update({ where: { id: user.id }, data: { emailNotifications: parsed.data.emailNotifications } }),
  ]);
  await audit({ actorId: user.id, action: "privacy.update", metadata: parsed.data });
  revalidatePath("/espace", "layout");
  return { ok: true, message: "Vos paramètres de confidentialité ont été enregistrés." };
}

export async function saveTrustedContactAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const parsed = trustedContactSchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error);
  const data = { ...parsed.data, email: parsed.data.email ?? null, phone: parsed.data.phone ?? null };
  await db.trustedContact.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
  await audit({ actorId: user.id, action: "trusted_contact.save" });
  revalidatePath("/espace/parametres/personne-de-confiance");
  return { ok: true, message: "Votre personne de confiance a été enregistrée. Ses coordonnées ne sont jamais affichées publiquement." };
}

export async function deleteTrustedContactAction(): Promise<void> {
  const user = await requireApiUser();
  await db.trustedContact.deleteMany({ where: { userId: user.id } });
  await audit({ actorId: user.id, action: "trusted_contact.delete" });
  revalidatePath("/espace/parametres/personne-de-confiance");
}
