import Link from "next/link";
import { AdminTitle } from "@/components/admin/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { reviewVerificationAction } from "@/lib/actions/admin";
import { hasRole, requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ageFromDate, formatDate } from "@/lib/utils";

export const metadata = { title: "Vérifications d'identité" };

export default async function VerificationsPage() {
  const admin = await requireAdmin();
  const canReview = hasRole(admin, "ADMIN");
  const requests = await db.verificationRequest.findMany({ where: { status: "PENDING" }, include: { user: { select: { id: true, profile: { select: { displayName: true, dateOfBirth: true, city: true } } } } }, orderBy: { createdAt: "asc" } });
  return (
    <>
      <AdminTitle title="Vérifications d'identité" description="Documents chiffrés, consultables uniquement par les administrateurs. Chaque consultation est journalisée ; les fichiers sont supprimés dès la décision." />
      {!canReview && <Alert tone="info" className="mb-4">Seuls les administrateurs peuvent consulter les documents et décider.</Alert>}
      {requests.length === 0 && <p className="text-sm text-gray-500">Aucune demande en attente.</p>}
      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">
                <Link href={`/admin/utilisateurs/${r.user.id}`} className="font-semibold text-primary underline">{r.user.profile?.displayName}</Link>
                {r.user.profile && <span className="text-gray-500"> · {ageFromDate(r.user.profile.dateOfBirth)} ans · {r.user.profile.city}</span>}
              </p>
              <span className="text-xs text-gray-500">{r.documentType} · déposé le {formatDate(r.createdAt, { dateStyle: "medium" })}</span>
            </div>
            {canReview && (
              <>
                <div className="flex gap-3 text-sm">
                  <a href={`/api/admin/verification/${r.id}/document`} target="_blank" rel="noopener" className="text-primary underline">Voir le document</a>
                  <a href={`/api/admin/verification/${r.id}/selfie`} target="_blank" rel="noopener" className="text-primary underline">Voir le selfie</a>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <form action={reviewVerificationAction.bind(null, r.id)}>
                    <input type="hidden" name="decision" value="approve" />
                    <Button type="submit" size="sm">Approuver</Button>
                  </form>
                  <form action={reviewVerificationAction.bind(null, r.id)} className="flex flex-1 gap-2">
                    <input type="hidden" name="decision" value="reject" />
                    <Input name="reason" placeholder="Motif du refus (communiqué au membre)" maxLength={300} />
                    <Button type="submit" size="sm" variant="danger">Refuser</Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
