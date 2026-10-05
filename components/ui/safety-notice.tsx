import { ShieldAlert } from "lucide-react";
import { SAFETY_TIPS } from "@/lib/security/scam-detection";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  const tips = compact ? SAFETY_TIPS.slice(0, 3) : SAFETY_TIPS;
  return (
    <aside className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm" aria-label="Conseils de sécurité">
      <p className="flex items-center gap-2 font-semibold text-primary">
        <ShieldAlert className="h-4 w-4" aria-hidden /> Restez vigilant(e)
      </p>
      <ul className="mt-2 space-y-1 text-ink/80">
        {tips.map((t) => (
          <li key={t}>• {t}</li>
        ))}
      </ul>
    </aside>
  );
}
