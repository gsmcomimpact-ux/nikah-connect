import Link from "next/link";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { DeleteAccountForm } from "@/components/settings/forms";
import { requireUser } from "@/lib/auth/guards";

export const metadata = { title: "Supprimer mon compte" };

export default async function DeleteAccountPage() {
  await requireUser({ allowSuspended: true });
  return (
    <div className="space-y-6">
      <PageTitle title="Supprimer mon compte" />
      <Alert tone="warning" title="Action définitive">
        Votre profil, vos photos, vos préférences, vos demandes et vos favoris seront supprimés. Le contenu de vos messages sera effacé. Vous pouvez auparavant{" "}
        <Link href="/api/account/export" prefetch={false} className="underline">
          télécharger une copie de vos données
        </Link>
        .
      </Alert>
      <Alert tone="info">Vous souhaitez seulement faire une pause ? Vous pouvez masquer votre profil dans <Link href="/espace/parametres/confidentialite" className="underline">Confidentialité</Link>.</Alert>
      <Card>
        <DeleteAccountForm />
      </Card>
    </div>
  );
}
