import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { env } from "@/lib/config/env";
import { decryptBuffer, encryptBuffer, randomToken } from "@/lib/security/crypto";

/**
 * Stockage de fichiers hors du dossier public.
 *  - photos/      : photos de profil ré-encodées (métadonnées EXIF/GPS supprimées)
 *  - attachments/ : pièces jointes de messagerie (images uniquement)
 *  - private/     : documents d'identité chiffrés (AES-256-GCM), séparés du reste
 * Les fichiers ne sont servis qu'à travers des routes API contrôlant les droits.
 * Pour un stockage objet (S3, R2…), remplacez l'implémentation de ce module.
 */
type Bucket = "photos" | "attachments" | "private";

const root = () => path.resolve(process.cwd(), env.storageDir);

function resolveKey(key: string): string {
  if (!/^(photos|attachments|private)\/[A-Za-z0-9_-]+\.(webp|bin)$/.test(key)) throw new Error("Clé de stockage invalide");
  return path.join(root(), key);
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;

/** Vérifie la signature binaire réelle (ne pas faire confiance au type MIME déclaré). */
export function sniffImageType(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export function sniffDocumentType(buf: Buffer): string | null {
  if (buf.length > 4 && buf.toString("ascii", 0, 5) === "%PDF-") return "application/pdf";
  return sniffImageType(buf);
}

/** Ré-encode une image en WebP (supprime les métadonnées, limite la taille). */
export async function storeImage(bucket: Exclude<Bucket, "private">, input: Buffer, maxSide = 1200) {
  const image = sharp(input, { limitInputPixels: 40_000_000 }).rotate();
  const output = await image.resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const key = `${bucket}/${randomToken(18)}.webp`;
  await mkdir(path.join(root(), bucket), { recursive: true });
  await writeFile(resolveKey(key), output.data, { mode: 0o600 });
  return { key, width: output.info.width, height: output.info.height, size: output.info.size };
}

export async function storeEncrypted(input: Buffer): Promise<string> {
  const key = `private/${randomToken(18)}.bin`;
  await mkdir(path.join(root(), "private"), { recursive: true, mode: 0o700 });
  await writeFile(resolveKey(key), encryptBuffer(input), { mode: 0o600 });
  return key;
}

export async function readFileByKey(key: string): Promise<Buffer> {
  const data = await readFile(resolveKey(key));
  return key.startsWith("private/") ? decryptBuffer(data) : data;
}

export async function deleteFileByKey(key: string | null | undefined): Promise<void> {
  if (!key) return;
  try {
    await unlink(resolveKey(key));
  } catch {
    /* fichier déjà absent */
  }
}
