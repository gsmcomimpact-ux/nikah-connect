import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/brand/avatar";
import { AppBottomNav, AppSidebarNav } from "@/components/layout/app-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth/guards";
import { hasRole } from "@/lib/auth/guards";
import { effectivePlan } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { totalUnreadMessages } from "@/lib/messages/service";
import { unreadNotificationCount } from "@/lib/notifications/service";
import { PRIVATE_METADATA } from "@/lib/seo/metadata";

export const metadata = { ...PRIVATE_METADATA, title: { default: "Mon espace", template: "%s | Mon espace" } };

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const user = await requireUser({ allowSuspended: true });
  const [notifications, messages, requests, photo] = await Promise.all([
    unreadNotificationCount(user.id),
    totalUnreadMessages(user.id),
    db.like.count({ where: { toUserId: user.id, type: "INTEREST", status: "PENDING" } }),
    db.photo.findFirst({ where: { userId: user.id, isPrimary: true, status: { not: "REJECTED" } }, select: { id: true } }),
  ]);
  const premium = effectivePlan(user.subscription) === "PREMIUM";
  const name = user.profile?.displayName ?? "Membre";

  return (
    <div className="min-h-dvh bg-muted/50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-1 sm:gap-2">
            {hasRole(user, "MODERATOR") && (
              <Link href="/admin" className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 sm:flex">
                <ShieldCheck className="h-4 w-4" aria-hidden /> Administration
              </Link>
            )}
            <NotificationBell initialCount={notifications} />
            <Link href="/espace/profil" className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-primary/5 sm:flex">
              <Avatar name={name} photoUrl={photo ? `/api/media/photo/${photo.id}` : null} size="sm" />
              <span className="text-sm font-medium">{name}</span>
              {premium && <Badge tone="gold">Premium</Badge>}
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-primary/5 hover:text-primary" aria-label="Se déconnecter" title="Se déconnecter">
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        <aside className="sticky top-22 hidden h-fit w-60 shrink-0 lg:block">
          <AppSidebarNav counts={{ messages, notifications, requests }} />
        </aside>
        <main id="contenu" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
      <AppBottomNav counts={{ messages, requests }} />
    </div>
  );
}
