"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** Active les notifications web du navigateur (aucune donnée privée n'y est affichée). */
export function WebNotificationToggle() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  useEffect(() => {
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);
  if (perm === "unsupported") return null;
  if (perm === "granted") return <p className="text-xs text-primary">Notifications du navigateur activées.</p>;
  if (perm === "denied") return <p className="text-xs text-gray-500">Notifications bloquées dans les réglages du navigateur.</p>;
  return (
    <Button size="sm" variant="outline" onClick={async () => setPerm(await Notification.requestPermission())}>
      Activer les notifications du navigateur
    </Button>
  );
}
