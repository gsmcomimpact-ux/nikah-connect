import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { PRIVATE_METADATA } from "@/lib/seo/metadata";

export const metadata = { ...PRIVATE_METADATA, title: { default: "Administration", template: "%s | Administration" } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin("MODERATOR");
  const [reports, verifications, photos, messages, contact] = await Promise.all([
    db.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    db.verificationRequest.count({ where: { status: "PENDING" } }),
    db.photo.count({ where: { status: "PENDING" } }),
    db.message.count({ where: { flagged: true, status: "VISIBLE" } }),
    db.contactMessage.count({ where: { handled: false } }),
  ]);
  return (
    <div className="min-h-dvh bg-muted/60 lg:flex">
      <aside className="bg-ink px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:py-6">
        <div className="mb-4 flex items-center justify-between lg:mb-8 lg:block">
          <Logo light />
          <p className="text-xs text-cream/60 lg:mt-2">
            {admin.adminUser?.role === "SUPER_ADMIN" ? "Super-administrateur" : admin.adminUser?.role === "ADMIN" ? "Administrateur" : "Modérateur"}
          </p>
        </div>
        <AdminNav counts={{ "/admin/signalements": reports, "/admin/verifications": verifications, "/admin/photos": photos, "/admin/messages": messages, "/admin/contact": contact }} />
        <Link href="/espace" className="mt-6 hidden text-sm text-cream/60 hover:text-cream lg:block">
          ← Retour à l'espace membre
        </Link>
      </aside>
      <main id="contenu" className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        {children}
      </main>
    </div>
  );
}
