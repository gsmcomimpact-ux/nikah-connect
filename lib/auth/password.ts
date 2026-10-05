import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | null = null;

/** Vérification factice pour égaliser le temps de réponse quand l'e-mail n'existe pas (anti-énumération). */
export async function dummyVerify(password: string): Promise<false> {
  dummyHash ??= bcrypt.hash("nikah-connect-dummy-password", COST);
  await bcrypt.compare(password, await dummyHash);
  return false;
}
