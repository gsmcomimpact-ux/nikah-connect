import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { COUNTRIES } from "@/lib/constants/geo";
import { BLOG_CATEGORY_SLUGS } from "@/lib/constants/options";
import { LEGAL_PAGES } from "@/lib/content/legal";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  const staticPaths = ["", "/comment-ca-marche", "/pourquoi-nous", "/profils", "/temoignages", "/conseils", "/a-propos", "/tarifs", "/securite", "/contact", "/inscription", "/rencontre-musulmane"];
  const posts = await db.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }).catch(() => []);
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...COUNTRIES.map((c) => ({ url: `${base}/rencontre-musulmane-${c.seoSlug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...Object.values(BLOG_CATEGORY_SLUGS).map((s) => ({ url: `${base}/conseils/categorie/${s}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${base}/conseils/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...LEGAL_PAGES.map((p) => ({ url: `${base}/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
