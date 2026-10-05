import { BadgeCheck, Mail, Phone } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IdentityForm, PhoneVerificationForms } from "@/components/settings/forms";
import { resendVerificationAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Vérification du profil" };

export default async function VerificationPage() {
  const user = await requireUser();
  const lastRequest = await db.verificationRequest.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const Status = ({ ok }: { ok: boolean }) => (ok ? <Badge tone="green">Vérifié</Badge> : <Badge>Non vérifié</Badge>);

  return (
    <div className="space-y-6">
      <PageTitle title="Vérification du profil" description="Trois niveaux de vérification, trois badges distincts. Vos documents ne sont jamais affichés." />
      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Mail className="h-5 w-5 text-gold" aria-hidden /> E-mail</CardTitle>
          <Status ok={Boolean(user.emailVerifiedAt)} />
        </div>
        {!user.emailVerifiedAt && (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-gray-600">Un lien de confirmation a été envoyé à votre adresse. Votre profil n'apparaît dans les recherches qu'après confirmation.</p>
            <form action={async () => { "use server"; await resendVerificationAction(); }}>
              <Button size="sm" variant="outline" type="submit">Renvoyer l'e-mail de confirmation</Button>
            </form>
          </div>
        )}
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5 text-gold" aria-hidden /> Téléphone</CardTitle>
          <Status ok={Boolean(user.phoneVerifiedAt)} />
        </div>
        {!user.phoneVerifiedAt && (
          <div className="mt-4">
            <PhoneVerificationForms phone={user.phone} />
          </div>
        )}
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg"><BadgeCheck className="h-5 w-5 text-gold" aria-hidden /> Identité</CardTitle>
          <Status ok={Boolean(user.identityVerifiedAt)} />
        </div>
        {user.identityVerifiedAt ? (
          <p className="mt-2 text-sm text-gray-600">Identité vérifiée le {formatDate(user.identityVerifiedAt)}. Le badge « Profil vérifié » est affiché sur votre profil.</p>
        ) : lastRequest?.status === "PENDING" ? (
          <Alert tone="info" className="mt-3">Votre demande du {formatDate(lastRequest.createdAt)} est en cours d'examen.</Alert>
        ) : (
          <div className="mt-3 space-y-4">
            {lastRequest?.status === "REJECTED" && <Alert tone="warning" title="Demande précédente refusée">{lastRequest.rejectionReason ?? "Document illisible ou non conforme."}</Alert>}
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Vos documents sont chiffrés (AES-256) et stockés séparément du reste de la plateforme.</li>
              <li>• Seuls les administrateurs habilités y ont accès ; chaque consultation est journalisée.</li>
              <li>• Ils sont supprimés dès que la décision est prise.</li>
            </ul>
            <IdentityForm />
          </div>
        )}
      </Card>
    </div>
  );
}
