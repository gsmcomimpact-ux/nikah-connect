import Link from "next/link";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { paymentsEnabled } from "@/lib/billing/provider";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Abonnements" };

export default async function AdminSubscriptionsPage() {
  await requireAdmin("ADMIN");
  const [subs, payments] = await Promise.all([
    db.subscription.findMany({ where: { plan: "PREMIUM" }, include: { user: { select: { id: true, email: true, profile: { select: { displayName: true } } } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);
  return (
    <>
      <AdminTitle title="Abonnements" description={paymentsEnabled() ? "Paiement en ligne actif." : "Paiement en ligne non configuré (PAYMENT_PROVIDER / STRIPE_*). Les accès Premium peuvent être offerts manuellement depuis la fiche utilisateur."} />
      <AdminTable head={["Membre", "Statut", "Fin de période", "Fournisseur"]} empty={subs.length === 0}>
        {subs.map((s) => (
          <tr key={s.id}>
            <Td><Link href={`/admin/utilisateurs/${s.user.id}`} className="text-primary underline">{s.user.profile?.displayName ?? s.user.email}</Link></Td>
            <Td>{s.status}</Td>
            <Td>{s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : "—"}</Td>
            <Td>{s.provider ?? "—"}</Td>
          </tr>
        ))}
      </AdminTable>
      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-primary">Derniers paiements</h2>
      <AdminTable head={["Date", "Montant", "Statut", "Fournisseur"]} empty={payments.length === 0}>
        {payments.map((p) => (
          <tr key={p.id}>
            <Td>{formatDate(p.createdAt, { dateStyle: "short" })}</Td>
            <Td>{(p.amountCents / 100).toFixed(2)} {p.currency.toUpperCase()}</Td>
            <Td>{p.status}</Td>
            <Td>{p.provider}</Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
