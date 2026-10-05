import Link from "next/link";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { Button } from "@/components/ui/button";
import { hideMessageAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Messages signalés" };

export default async function FlaggedMessagesPage() {
  await requireAdmin();
  const messages = await db.message.findMany({
    where: { OR: [{ flagged: true }, { reports: { some: {} } }] },
    include: { sender: { select: { id: true, profile: { select: { displayName: true } } } }, _count: { select: { reports: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <>
      <AdminTitle title="Messages signalés" description="Messages détectés par l'anti-arnaque (argent, coordonnées bancaires, liens suspects) ou signalés par des membres." />
      <AdminTable head={["Auteur", "Message", "Signaux", "Signal.", "Date", "Action"]} empty={messages.length === 0}>
        {messages.map((m) => (
          <tr key={m.id}>
            <Td>{m.sender ? <Link href={`/admin/utilisateurs/${m.sender.id}`} className="text-primary underline">{m.sender.profile?.displayName ?? "—"}</Link> : "—"}</Td>
            <Td className="max-w-md whitespace-pre-line">{m.body}</Td>
            <Td className="text-xs">{m.flagReasons.join(", ") || "—"}</Td>
            <Td>{m._count.reports}</Td>
            <Td className="whitespace-nowrap text-xs text-gray-500">{formatDate(m.createdAt, { dateStyle: "short", timeStyle: "short" })}</Td>
            <Td>
              <form action={hideMessageAction.bind(null, m.id, m.status === "VISIBLE")}>
                <Button size="sm" type="submit" variant={m.status === "VISIBLE" ? "danger" : "outline"}>{m.status === "VISIBLE" ? "Masquer" : "Rétablir"}</Button>
              </form>
            </Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
