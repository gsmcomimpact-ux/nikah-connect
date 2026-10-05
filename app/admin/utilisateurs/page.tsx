import Link from "next/link";
import type { Prisma, UserStatus } from "@prisma/client";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { countryName } from "@/lib/constants/geo";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Utilisateurs" };
const PAGE = 30;
const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "BANNED", "DELETED"];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 100);
  const status = STATUSES.find((s) => s === sp.statut);
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.UserWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { id: q }, { profile: { displayName: { contains: q, mode: "insensitive" } } }] } : {}),
  };
  const [users, total] = await Promise.all([
    db.user.findMany({ where, include: { profile: { select: { displayName: true, city: true, country: true } }, subscription: { select: { plan: true } }, _count: { select: { reportsReceived: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE }),
    db.user.count({ where }),
  ]);
  return (
    <>
      <AdminTitle title="Utilisateurs" description={`${total} compte(s)`} />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input name="q" defaultValue={q} placeholder="E-mail, pseudonyme ou identifiant" className="sm:max-w-sm" />
        <Select name="statut" placeholder="Tous les statuts" defaultValue={status ?? ""} options={STATUSES.map((s) => ({ value: s, label: s }))} className="sm:max-w-xs" />
        <Button type="submit">Filtrer</Button>
      </form>
      <AdminTable head={["Membre", "E-mail", "Localisation", "Statut", "Vérif.", "Offre", "Signal.", "Inscrit le"]} empty={users.length === 0}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-cream/50">
            <Td>
              <Link href={`/admin/utilisateurs/${u.id}`} className="font-medium text-primary hover:underline">
                {u.profile?.displayName ?? "—"}
              </Link>
              {u.isDemo && <span className="ml-1 text-xs text-gray-400">(démo)</span>}
            </Td>
            <Td className="text-gray-600">{u.email}</Td>
            <Td>{u.profile ? `${u.profile.city}, ${countryName(u.profile.country)}` : "—"}</Td>
            <Td><StatusBadge status={u.status} /></Td>
            <Td className="text-xs">{[u.emailVerifiedAt && "E", u.phoneVerifiedAt && "T", u.identityVerifiedAt && "ID"].filter(Boolean).join(" · ") || "—"}</Td>
            <Td>{u.subscription?.plan ?? "FREE"}</Td>
            <Td>{u._count.reportsReceived}</Td>
            <Td className="whitespace-nowrap text-gray-500">{formatDate(u.createdAt, { dateStyle: "medium" })}</Td>
          </tr>
        ))}
      </AdminTable>
      <Pagination page={page} total={total} pageSize={PAGE} basePath="/admin/utilisateurs" query={sp} />
    </>
  );
}
