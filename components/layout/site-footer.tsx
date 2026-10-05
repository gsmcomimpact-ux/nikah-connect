import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GeometricPattern } from "@/components/brand/geometric-pattern";
import { FOOTER_NAV } from "@/lib/config/navigation";
import { siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  const columns = [
    { title: "Plateforme", items: FOOTER_NAV.plateforme },
    { title: "Confiance", items: FOOTER_NAV.confiance },
    { title: "Informations légales", items: FOOTER_NAV.legal },
  ];
  return (
    <footer className="relative overflow-hidden bg-ink text-cream/80">
      <GeometricPattern className="text-gold" opacity={0.05} />
      <div className="container-page relative grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{siteConfig.tagline}. Des rencontres respectueuses, des profils vérifiés et une vie privée protégée.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-gold">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.</p>
          <p>Ne transférez jamais d'argent à une personne rencontrée en ligne.</p>
        </div>
      </div>
    </footer>
  );
}
