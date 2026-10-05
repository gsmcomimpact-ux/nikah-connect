"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

export function AdminNav({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ADMIN_NAV.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const n = counts[item.href] ?? 0;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm", active ? "bg-gold/20 font-semibold text-cream" : "text-cream/75 hover:bg-white/5 hover:text-cream")}>
            {item.label}
            {n > 0 && <span className="rounded-full bg-gold px-1.5 text-xs font-semibold text-ink">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
