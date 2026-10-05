"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Cloche de notifications : interroge l'API toutes les 30 s et, si l'utilisateur
 * l'a autorisé, affiche une notification web du navigateur (sans contenu privé).
 */
export function NotificationBell({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const previous = useRef(initialCount);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch("/api/notifications/summary", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { notifications: number; latestTitle: string | null };
        if (!active) return;
        if (data.notifications > previous.current && data.latestTitle && typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
          new Notification(data.latestTitle, { body: "Ouvrez votre espace pour en savoir plus.", tag: "nc-notif" });
        }
        previous.current = data.notifications;
        setCount(data.notifications);
      } catch {
        /* hors ligne */
      }
    }
    const id = setInterval(poll, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Link href="/espace/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-primary/5" aria-label={`Notifications${count ? ` (${count} non lues)` : ""}`}>
      <Bell className="h-5 w-5" aria-hidden />
      {count > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-gold px-1 text-center text-[10px] font-bold leading-4 text-ink">{count > 9 ? "9+" : count}</span>}
    </Link>
  );
}
