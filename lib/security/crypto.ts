import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/config/env";

/** Jeton aléatoire cryptographiquement sûr (base64url). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Code numérique à 6 chiffres (OTP SMS). */
export function randomOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Hachage SHA-256 d'un jeton : seuls les hachages sont stockés en base. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Hachage HMAC d'une adresse IP : permet la détection d'abus sans stocker l'IP en clair. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHmac("sha256", env.ipHashSecret).update(ip).digest("hex").slice(0, 32);
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function encryptionKey(): Buffer {
  const key = Buffer.from(env.documentEncryptionKey, "hex");
  if (key.length !== 32) throw new Error("DOCUMENT_ENCRYPTION_KEY doit contenir 64 caractères hexadécimaux");
  return key;
}

/** Chiffrement AES-256-GCM (format : iv[12] | tag[16] | données). Utilisé pour les pièces d'identité. */
export function encryptBuffer(plain: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]);
}

export function decryptBuffer(payload: Buffer): Buffer {
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const data = payload.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
