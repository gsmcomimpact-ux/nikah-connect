import { cn } from "@/lib/utils";

export function CompatibilityMeter({ score, size = "md", className }: { score: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const dims = { sm: 44, md: 60, lg: 96 }[size];
  const stroke = size === "lg" ? 7 : 5;
  const r = (dims - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: dims, height: dims }} role="img" aria-label={`${score} % compatible`}>
      <svg width={dims} height={dims} className="-rotate-90">
        <circle cx={dims / 2} cy={dims / 2} r={r} fill="none" stroke="var(--brand-muted)" strokeWidth={stroke} />
        <circle cx={dims / 2} cy={dims / 2} r={r} fill="none" stroke="var(--brand-gold)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <span className={cn("absolute font-semibold text-primary", size === "lg" ? "text-2xl" : size === "md" ? "text-sm" : "text-xs")}>{score}%</span>
    </div>
  );
}
