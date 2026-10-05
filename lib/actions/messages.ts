"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { AuthError, requireApiUser } from "@/lib/auth/guards";
import { planFeatures } from "@/lib/billing/plans";
import { attachmentsAllowed, deleteConversationForUser, getConversationContext, sendMessage, type SendResult } from "@/lib/messages/service";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { MAX_ATTACHMENT_BYTES, sniffImageType, storeImage } from "@/lib/storage";
import { TRUSTED_CONTACT_RELATION_LABELS } from "@/lib/constants/options";

export async function sendMessageAction(conversationId: string, body: string, confirmContact = false): Promise<SendResult> {
  try {
    const user = await requireApiUser();
    return await sendMessage({ userId: user.id, conversationId, body, confirmContact });
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error(err);
    return { ok: false, error: "Le message n'a pas pu être envoyé." };
  }
}

/** Envoi d'une image (Premium, après un minimum d'échanges, ré-encodée sans métadonnées). */
export async function sendAttachmentAction(conversationId: string, fd: FormData): Promise<SendResult> {
  try {
    const user = await requireApiUser();
    if (!planFeatures(user.subscription).attachments) return { ok: false, error: "Le partage d'images est réservé à l'offre Premium." };
    const ctx = await getConversationContext(user.id, conversationId);
    if (!ctx?.canWrite) return { ok: false, error: "Conversation fermée." };
    if (!(await attachmentsAllowed(conversationId))) return { ok: false, error: "Le partage d'images est possible après quelques échanges de messages." };
    const limit = await rateLimit(`attach:${user.id}`, LIMITS.attachments.limit, LIMITS.attachments.windowSec);
    if (!limit.ok) return { ok: false, error: "Trop d'images envoyées. Réessayez plus tard." };

    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Aucun fichier." };
    if (file.size > MAX_ATTACHMENT_BYTES) return { ok: false, error: "Image trop volumineuse (3 Mo maximum)." };
    const buf = Buffer.from(await file.arrayBuffer());
    if (!sniffImageType(buf)) return { ok: false, error: "Seules les images JPEG, PNG ou WebP sont acceptées." };
    const stored = await storeImage("attachments", buf, 1280);
    return await sendMessage({ userId: user.id, conversationId, body: String(fd.get("caption") ?? ""), confirmContact: true, attachmentKeys: [{ key: stored.key, mimeType: "image/webp", size: stored.size }] });
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    console.error(err);
    return { ok: false, error: "L'image n'a pas pu être envoyée." };
  }
}

export async function deleteConversationAction(conversationId: string): Promise<{ ok: boolean }> {
  const user = await requireApiUser();
  const ok = await deleteConversationForUser(user.id, conversationId);
  revalidatePath("/espace/messages");
  return { ok };
}

/** Partage volontaire des coordonnées de la personne de confiance (wali) dans une conversation. */
export async function shareTrustedContactAction(conversationId: string): Promise<SendResult> {
  const user = await requireApiUser();
  const contact = await db.trustedContact.findUnique({ where: { userId: user.id } });
  if (!contact) return { ok: false, error: "Vous n'avez pas encore déclaré de personne de confiance." };
  const parts = [`${contact.name} (${TRUSTED_CONTACT_RELATION_LABELS[contact.relation]})`, contact.email, contact.phone].filter(Boolean);
  return sendMessage({ userId: user.id, conversationId, body: `Je souhaite impliquer ma personne de confiance dans notre démarche. Voici ses coordonnées : ${parts.join(" · ")}`, confirmContact: true });
}
