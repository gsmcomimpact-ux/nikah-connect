import Link from "next/link";
import { AdminTitle } from "@/components/admin/table";
import { SignupsChart } from "@/components/admin/signups-chart";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminStats, signupsPerDay } from "@/lib/admin/stats";

export const metadata = { title: "Vue d'ensemble" };

export default async function AdminDashboard() {
  await requireAdmin();
  const [s, series] = await Promise.all([getAdminStats(), signupsPerDay()]);
  const tiles = [
    { label: "Utilisateurs", value: s.users },
    { label: "Nouveaux inscrits (7 j)", value: s.newUsers7, sub: `${s.newUsers30} sur 30 j` },
    { label: "Profils vérifiés", value: s.verified },
    { label: "Utilisateurs actifs (7 j)", value: s.active7 },
    { label: "Compatibilités mutuelles", value: s.matches, sub: `${s.matches30} sur 30 j` },
    { label: "Conversations", value: s.conversations },
    { label: "Signalements ouverts", value: s.openReports, href: "/admin/signalements" },
    { label: "Comptes suspendus / bannis", value: `${s.suspended} / ${s.banned}` },
    { label: "Abonnements Premium", value: s.premium, href: "/admin/abonnements" },
  ];
  const queues = [
    { label: "Vérifications d'identité en attente", value: s.pendingVerifications, href: "/admin/verifications" },
    { label: "Photos à modérer", value: s.pendingPhotos, href: "/admin/photos" },
    { label: "Messages signalés automatiquement", value: s.flaggedMessages, href: "/admin/messages" },
    { label: "Signalements à traiter", value: s.openReports, href: "/admin/signalements" },
  ];
  return (
    <>
      <AdminTitle title="Vue d'ensemble" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map((t) => {
          const body = (
            <>
              <p className="text-xs text-gray-500">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{t.value}</p>
              {t.sub && <p className="text-xs text-gray-500">{t.sub}</p>}
            </>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gold">
              {body}
            </Link>
          ) : (
            <div key={t.label} className="rounded-xl border border-gray-200 bg-white p-4">
              {body}
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SignupsChart data={series} />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-ink">Files de modération</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {queues.map((q) => (
              <li key={q.label}>
                <Link href={q.href} className="flex items-center justify-between py-3 text-sm hover:text-primary">
                  {q.label}
                  <span className={q.value > 0 ? "rounded-full bg-gold/20 px-2.5 py-0.5 font-semibold text-primary" : "text-gray-400"}>{q.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
