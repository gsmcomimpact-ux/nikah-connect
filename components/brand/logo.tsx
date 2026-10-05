import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/** Emblème : arche (porte du foyer) + étoile à huit branches. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("h-9 w-9", className)}>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="var(--brand-primary)" />
      <path d="M12 31V19a8 8 0 0 1 16 0v12" fill="none" stroke="var(--brand-gold)" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 10.5l1.6 3.4 3.4 1.6-3.4 1.6L20 20.5l-1.6-3.4-3.4-1.6 3.4-1.6z" fill="var(--brand-gold)" />
      <path d="M9 31h22" stroke="var(--brand-cream)" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} — accueil`}>
      {siteConfig.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={siteConfig.logoUrl} alt="" className="h-9 w-auto" />
      ) : (
        <LogoMark />
      )}
      <span className={cn("font-display text-lg font-semibold tracking-wide", light ? "text-cream" : "text-primary")}>
        {siteConfig.name.split(" ")[0]}
        <span className="text-gold"> {siteConfig.name.split(" ").slice(1).join(" ")}</span>
      </span>
    </Link>
  );
}
