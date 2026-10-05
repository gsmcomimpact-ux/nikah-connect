import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SIGNUP_STEPS = ["Compte", "Informations", "Profil religieux", "Projet matrimonial", "Préférences"] as const;

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-between gap-1" aria-label="Étapes de l'inscription">
      {SIGNUP_STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={active ? "step" : undefined}>
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold", done && "border-primary bg-primary text-cream", active && "border-gold bg-gold/15 text-primary", !done && !active && "border-gray-300 bg-white text-gray-400")}>
              {done ? <Check className="h-4 w-4" aria-hidden /> : n}
            </span>
            <span className={cn("hidden text-[11px] leading-tight sm:block", active ? "font-semibold text-primary" : "text-gray-500")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
