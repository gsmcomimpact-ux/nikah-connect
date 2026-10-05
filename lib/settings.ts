import "server-only";
import { db } from "@/lib/db";

export type SiteSettings = { registrationOpen: boolean; announcement: string; supportEmail: string };
const DEFAULTS: SiteSettings = { registrationOpen: true, announcement: "", supportEmail: "" };

/** Paramètres modifiables depuis l'administration (table site_settings). */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.siteSetting.findMany();
    const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULTS, ...values } as SiteSettings;
  } catch {
    return DEFAULTS;
  }
}
