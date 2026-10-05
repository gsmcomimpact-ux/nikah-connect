import "server-only";
import { env } from "@/lib/config/env";

/**
 * Vérification Cloudflare Turnstile.
 * Si TURNSTILE_SECRET_KEY n'est pas configurée, le CAPTCHA est désactivé
 * (pratique en développement) — configurez-la en production.
 */
export function captchaEnabled(): boolean {
  return Boolean(env.turnstileSecret);
}

export async function verifyCaptcha(token: string | null | undefined, ip?: string | null): Promise<boolean> {
  if (!captchaEnabled()) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: env.turnstileSecret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
