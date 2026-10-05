import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/espace", "/admin", "/api", "/inscription/etape", "/reinitialiser-mot-de-passe"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
