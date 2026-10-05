import { AdminTitle } from "@/components/admin/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markContactHandledAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Messages de contact" };

export default async function AdminContactPage() {
  await requireAdmin();
  const messages = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }], take: 100 });
  return (
    <>
      <AdminTitle title="Messages de contact" />
      {messages.length === 0 && <p className="text-sm text-gray-500">Aucun message.</p>}
      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className={m.handled ? "opacity-60" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{m.subject}</p>
              <span className="text-xs text-gray-500">{formatDate(m.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <p className="text-sm text-gray-600">{m.name} · {m.email}</p>
            <p className="mt-2 whitespace-pre-line text-sm">{m.body}</p>
            {!m.handled && (
              <form action={markContactHandledAction.bind(null, m.id)} className="mt-3">
                <Button size="sm" variant="outline" type="submit">Marquer comme traité</Button>
              </form>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
