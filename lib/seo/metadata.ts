import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

/** Métadonnées standard d'une page publique : title, description, canonical, Open Graph. */
export function pageMetadata({ title, description, path, noIndex = false }: { title: string; description: string; path: string; noIndex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${siteConfig.name}`, description, url: path, siteName: siteConfig.name, locale: siteConfig.locale, type: "website" },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export const PRIVATE_METADATA: Metadata = { robots: { index: false, follow: false } };
