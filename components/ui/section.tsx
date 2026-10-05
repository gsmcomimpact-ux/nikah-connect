import type { ReactNode } from "react";
import { GeometricPattern } from "@/components/brand/geometric-pattern";
import { cn } from "@/lib/utils";

export function Section({ id, children, className, tone = "cream", pattern = false }: { id?: string; children: ReactNode; className?: string; tone?: "cream" | "white" | "muted" | "primary"; pattern?: boolean }) {
  const tones = { cream: "bg-cream", white: "bg-white", muted: "bg-muted", primary: "bg-primary text-cream" };
  return (
    <section id={id} className={cn("relative overflow-hidden py-16 sm:py-20", tones[tone], className)}>
      {pattern && <GeometricPattern className={tone === "primary" ? "text-gold" : "text-primary"} opacity={tone === "primary" ? 0.08 : 0.05} />}
      <div className="container-page relative">{children}</div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, center = true, light = false }: { eyebrow?: string; title: string; description?: string; center?: boolean; light?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
      <h2 className={cn("mt-2 font-display text-3xl font-semibold sm:text-4xl", light ? "text-cream" : "text-primary")}>{title}</h2>
      {description && <p className={cn("mt-3 text-base leading-relaxed", light ? "text-cream/80" : "text-gray-600")}>{description}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-primary py-14 text-cream sm:py-20">
      <GeometricPattern className="text-gold" opacity={0.09} />
      <div className="container-page relative max-w-3xl text-center">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-cream/80 sm:text-lg">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
