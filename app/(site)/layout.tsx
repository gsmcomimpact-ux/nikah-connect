import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSiteSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const { announcement } = await getSiteSettings();
  return (
    <>
      {announcement && <div className="bg-gold px-4 py-2 text-center text-sm font-medium text-ink">{announcement}</div>}
      <SiteHeader />
      <main id="contenu">{children}</main>
      <SiteFooter />
    </>
  );
}
