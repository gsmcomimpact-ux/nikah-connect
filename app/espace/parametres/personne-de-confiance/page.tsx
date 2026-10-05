import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { TrustedContactForm } from "@/components/settings/forms";
import { deleteTrustedContactAction } from "@/lib/actions/profile";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Personne de confiance" };

export default async function TrustedContactPage() {
  const user = await requireUser();
  const contact = await db.trustedContact.findUnique({ where: { userId: user.id } });
  return (
    <div className="space-y-6">
      <PageTitle title="Personne de confiance (wali / accompagnateur)" description="Une fonctionnalité totalement facultative pour impliquer un proche dans votre démarche matrimoniale." />
      <Alert tone="info">
        Vous pouvez déclarer un parent, un membre de votre famille, un tuteur (wali) ou un accompagnateur de votre choix. Ses coordonnées restent privées : vous seul(e) décidez de les partager, depuis une conversation, avec la personne de votre choix.
      </Alert>
      <Card>
        <TrustedContactForm defaults={contact ? { name: contact.name, relation: contact.relation, email: contact.email ?? "", phone: contact.phone ?? "", showIndicator: contact.showIndicator } : null} />
      </Card>
      {contact && (
        <form action={deleteTrustedContactAction}>
          <Button type="submit" variant="ghost" size="sm">Retirer ma personne de confiance</Button>
        </form>
      )}
    </div>
  );
}
