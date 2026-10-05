"use server";

import { db } from "@/lib/db";
import { verifyCaptcha } from "@/lib/security/captcha";
import { hashIp } from "@/lib/security/crypto";
import { LIMITS, rateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/request";
import { formToObject, validationError, type FormState } from "@/lib/validation/form";
import { contactSchema } from "@/lib/validation/schemas";

export async function contactAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (fd.get("website")) return { ok: true, message: "Merci, votre message a bien été envoyé." }; // pot de miel anti-robots
  const ip = await getClientIp();
  const limit = await rateLimit(`contact:${hashIp(ip) ?? "unknown"}`, LIMITS.contact.limit, LIMITS.contact.windowSec);
  if (!limit.ok) return { ok: false, message: "Trop de messages envoyés. Réessayez plus tard." };
  if (!(await verifyCaptcha(fd.get("cf-turnstile-response") as string | null, ip))) return { ok: false, message: "Vérification anti-robot échouée." };
  const parsed = contactSchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error);
  await db.contactMessage.create({ data: parsed.data });
  return { ok: true, message: "Merci, votre message a bien été envoyé. Nous vous répondrons sous 48 h ouvrées." };
}
