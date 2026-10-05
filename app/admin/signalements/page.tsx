import Link from "next/link";
import type { ReportStatus } from "@prisma/client";
import { AdminTitle } from "@/components/admin/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox, Select, Textarea } from "@/components/ui/field";
import { handleReportAction } from "@/lib/actions/admin";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { REPORT_REASON_LABELS } from "@/lib/constants/options";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Signalements" };
const FILTERS: { key: string; label: string; statuses: ReportStatus[] }[] = [
  { key: "a-traiter", label: "À traiter", statuses: ["OPEN", "IN_REVIEW"] },
  { key: "traites", label: "Traités", statuses: ["RESOLVED", "DISMISSED"] },
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ filtre?: string }> }) {
  const admin = await requireAdmin();
  const { filtre } = await searchParams;
  const filter = FILTERS.find((f) => f.key === filtre) ?? FILTERS[0]!;
  const reports = await db.report.findMany({
    where: { status: { in: filter.statuses } },
    include: {
      reporter: { select: { id: true, profile: { select: { displayName: true } } } },
      reportedUser: { select: { id: true, status: true, profile: { select: { displayName: true } }, _count: { select: { reportsReceived: true } } } },
      message: { select: { id: true, body: true, conversationId: true, createdAt: true, flagReasons: true } },
    },
    orderBy: { createdAt: filter.key === "a-traiter" ? "asc" : "desc" },
    take: 50,
  });

  // Contexte limité (10 derniers messages avant le message signalé), accès journalisé.
  const contexts = new Map<string, { id: string; senderId: string | null; body: string }[]>();
  for (const r of reports) {
    if (!r.message) continue;
    contexts.set(
      r.id,
      (await db.message.findMany({ where: { conversationId: r.message.conversationId, createdAt: { lte: r.message.createdAt } }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, senderId: true, body: true } })).reverse(),
    );
  }
  if (contexts.size) await audit({ actorId: admin.id, action: "admin.report_context_view", metadata: { reports: [...contexts.keys()] } });

  return (
    <>
      <AdminTitle title="Signalements" description="Faux profils, harcèlement, arnaques, demandes d'argent… Les signalements automatiques proviennent du système anti-arnaque." />
      <nav className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/admin/signalements?filtre=${f.key}`} className={cn("rounded-full px-4 py-1.5 text-sm", f.key === filter.key ? "bg-primary text-cream" : "bg-white text-gray-600")}>
            {f.label}
          </Link>
        ))}
      </nav>
      {reports.length === 0 && <p className="text-sm text-gray-500">Aucun signalement.</p>}
      <div className="space-y-4">
        {reports.map((r) => (
          <Card key={r.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge status={r.status} />
              <span className="font-semibold">{REPORT_REASON_LABELS[r.reason]}</span>
              <span className="text-gray-400">·</span>
              <span>{r.source === "SYSTEM" ? "Détection automatique" : `par ${r.reporter?.profile?.displayName ?? "membre supprimé"}`}</span>
              <span className="ml-auto text-xs text-gray-500">{formatDate(r.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <p className="text-sm">
              Membre signalé :{" "}
              <Link href={`/admin/utilisateurs/${r.reportedUser.id}`} className="font-medium text-primary underline">
                {r.reportedUser.profile?.displayName ?? r.reportedUser.id}
              </Link>{" "}
              <StatusBadge status={r.reportedUser.status} /> <span className="text-xs text-gray-500">({r.reportedUser._count.reportsReceived} signalement(s) au total)</span>
            </p>
            {r.details && <p className="rounded-xl bg-muted p-3 text-sm">{r.details}</p>}
            {contexts.get(r.id) && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Contexte de la conversation</p>
                <ul className="space-y-1 text-sm">
                  {contexts.get(r.id)!.map((m) => (
                    <li key={m.id} className={cn(m.id === r.message?.id && "rounded bg-red-50 font-medium text-red-900")}>
                      <span className="text-xs text-gray-500">{m.senderId === null ? "Système" : m.senderId === r.reportedUser.id ? "Signalé" : "Autre"} : </span>
                      {m.body}
                    </li>
                  ))}
                </ul>
                {r.message?.flagReasons.length ? <p className="mt-2 text-xs text-gray-500">Signaux détectés : {r.message.flagReasons.join(", ")}</p> : null}
              </div>
            )}
            {r.resolution && <p className="text-sm text-gray-600">Décision : {r.resolution}</p>}
            {filter.key === "a-traiter" && (
              <form action={handleReportAction.bind(null, r.id)} className="grid gap-2 border-t border-gray-100 pt-3 sm:grid-cols-[12rem_1fr_auto] sm:items-start">
                <Select name="status" defaultValue="RESOLVED" options={[{ value: "IN_REVIEW", label: "En cours d'examen" }, { value: "RESOLVED", label: "Traité" }, { value: "DISMISSED", label: "Classé sans suite" }]} />
                <div className="space-y-2">
                  <Textarea name="resolution" placeholder="Décision / note interne" className="min-h-11" maxLength={1000} />
                  {r.message && <Checkbox name="hideMessage" label="Masquer le message signalé" />}
                </div>
                <Button type="submit" size="sm">Valider</Button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
