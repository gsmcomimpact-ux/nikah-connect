"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { APP_NAV } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/espace" ? pathname === "/espace" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebarNav({ counts }: { counts: { messages: number; notifications: number; requests: number } }) {
  const pathname = usePathname();
  const badge = (href: string) =>
    href === "/espace/messages" ? counts.messages : href === "/espace/notifications" ? counts.notifications : href === "/espace/demandes" ? counts.requests : 0;
  return (
    <nav aria-label="Espace membre" className="space-y-1">
      {APP_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const n = badge(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-primary text-cream" : "text-ink/80 hover:bg-primary/5 hover:text-primary")}>
            <Icon name={item.icon} className="h-4.5 w-4.5" />
            <span className="flex-1">{item.label}</span>
            {n > 0 && <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-gold text-ink" : "bg-gold/20 text-primary")}>{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

const MOBILE_ITEMS = [
  { href: "/espace", label: "Accueil", icon: "home" },
  { href: "/espace/compatibilites", label: "Profils", icon: "sparkles" },
  { href: "/espace/demandes", label: "Demandes", icon: "heart-handshake" },
  { href: "/espace/messages", label: "Messages", icon: "messages" },
  { href: "/espace/profil", label: "Moi", icon: "user" },
];

/** Barre de navigation inférieure (mobile). */
export function AppBottomNav({ counts }: { counts: { messages: number; requests: number } }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {MOBILE_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const n = item.href === "/espace/messages" ? counts.messages : item.href === "/espace/demandes" ? counts.requests : 0;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", active ? "text-primary" : "text-gray-500")}>
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
                {n > 0 && <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-full bg-gold" aria-label={`${n} non lus`} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
