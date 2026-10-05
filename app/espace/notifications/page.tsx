import Link from "next/link";
import { Bell } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { WebNotificationToggle } from "@/components/layout/web-push-toggle";
import { deleteReadNotificationsAction, markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { cn, formatRelative } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <>
      <PageTitle
        title="Mes notifications"
        actions={
          <>
            <form action={markAllNotificationsReadAction}>
              <Button size="sm" variant="outline" type="submit">Tout marquer comme lu</Button>
            </form>
            <form action={deleteReadNotificationsAction}>
              <Button size="sm" variant="ghost" type="submit">Supprimer les lues</Button>
            </form>
          </>
        }
      />
      <div className="mb-4">
        <WebNotificationToggle />
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous serez notifié(e) des nouvelles demandes, compatibilités mutuelles et messages." />
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {notifications.map((n) => {
            const inner = (
              <div className={cn("flex gap-3 px-5 py-4", !n.readAt && "bg-gold/5")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-gold")} aria-hidden />
                <div className="flex-1">
                  <p className={cn("text-sm", n.readAt ? "text-ink/80" : "font-semibold text-ink")}>{n.title}</p>
                  <p className="text-sm text-gray-600">{n.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatRelative(n.createdAt)}</p>
                </div>
              </div>
            );
            return <li key={n.id}>{n.link ? <Link href={n.link} className="block hover:bg-cream/60">{inner}</Link> : inner}</li>;
          })}
        </ul>
      )}
    </>
  );
}
