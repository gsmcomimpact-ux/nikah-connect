import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Journal d'audit" };
const PAGE = 50;

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ action?: string; page?: string }> }) {
  await requireAdmin("ADMIN");
  const sp = await searchParams;
  const action = (sp.action ?? "").trim().slice(0, 60);
  const page = Math.max(1, Number(sp.page) || 1);
  const where = action ? { action: { startsWith: action } } : {};
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({ where, include: { actor: { select: { email: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    db.auditLog.count({ where }),
  ]);
  return (
    <>
      <AdminTitle title="Journal d'audit" description="Actions sensibles : connexions, modération, accès aux documents, suppressions. Les adresses IP sont hachées." />
      <form className="mb-4 flex gap-2">
        <Input name="action" defaultValue={action} placeholder="Préfixe d'action (ex. admin., auth.)" className="max-w-sm" />
        <Button type="submit">Filtrer</Button>
      </form>
      <AdminTable head={["Date", "Action", "Acteur", "Cible", "Détails"]} empty={logs.length === 0}>
        {logs.map((l) => (
          <tr key={l.id}>
            <Td className="whitespace-nowrap text-xs">{formatDate(l.createdAt, { dateStyle: "short", timeStyle: "medium" })}</Td>
            <Td className="font-mono text-xs">{l.action}</Td>
            <Td className="text-xs">{l.actor?.email ?? "système"}</Td>
            <Td className="text-xs">{l.targetType ? `${l.targetType}:${l.targetId ?? ""}` : "—"}</Td>
            <Td className="max-w-xs truncate font-mono text-xs text-gray-500">{l.metadata ? JSON.stringify(l.metadata) : ""}</Td>
          </tr>
        ))}
      </AdminTable>
      <Pagination page={page} total={total} pageSize={PAGE} basePath="/admin/journal" query={sp} />
    </>
  );
}
