import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "green" | "gold" | "gray" | "red" | "blue";
const tones: Record<Tone, string> = {
  green: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-[#7a6213]",
  gray: "bg-muted text-gray-700",
  red: "bg-red-50 text-red-800",
  blue: "bg-sky-50 text-sky-800",
};

export function Badge({ children, tone = "gray", className, title }: { children: ReactNode; tone?: Tone; className?: string; title?: string }) {
  return (
    <span title={title} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
