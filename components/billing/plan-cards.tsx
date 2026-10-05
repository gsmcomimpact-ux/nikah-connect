import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export function PlanCards({ current, premiumAction, freeAction }: { current?: "FREE" | "PREMIUM"; premiumAction?: ReactNode; freeAction?: ReactNode }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {(["FREE", "PREMIUM"] as const).map((key) => {
        const plan = PLANS[key];
        const premium = key === "PREMIUM";
        return (
          <div key={key} className={cn("relative flex flex-col rounded-3xl border p-7", premium ? "border-gold bg-primary text-cream" : "border-gray-200 bg-white")}>
            {current === key && <span className="absolute right-5 top-5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">Votre offre</span>}
            <h3 className={cn("font-display text-2xl font-semibold", premium ? "text-gold" : "text-primary")}>{plan.label}</h3>
            <p className="mt-1 text-3xl font-semibold">{plan.priceLabel}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {plan.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <Check className={cn("mt-0.5 h-4 w-4 shrink-0", premium ? "text-gold" : "text-primary-light")} aria-hidden /> {h}
                </li>
              ))}
            </ul>
            <div className="mt-7">{premium ? premiumAction : freeAction}</div>
          </div>
        );
      })}
    </div>
  );
}
