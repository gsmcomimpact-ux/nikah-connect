"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileMenu({ items, isLoggedIn }: { items: readonly { href: string; label: string }[]; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary/5">
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <div id="menu-mobile" className={cn("fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-cream px-5 pb-10 pt-4 transition", open ? "visible opacity-100" : "invisible opacity-0")}>
        <nav aria-label="Menu principal mobile" className="flex flex-col divide-y divide-gray-200">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={cn("py-4 text-lg font-medium", pathname === item.href ? "text-primary" : "text-ink")}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 grid gap-3">
          {isLoggedIn ? (
            <Link href="/espace" className="flex h-12 items-center justify-center rounded-full bg-primary font-medium text-cream">
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/inscription" className="flex h-12 items-center justify-center rounded-full bg-primary font-medium text-cream">
                Créer mon profil
              </Link>
              <Link href="/connexion" className="flex h-12 items-center justify-center rounded-full border border-primary/30 font-medium text-primary">
                Connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
