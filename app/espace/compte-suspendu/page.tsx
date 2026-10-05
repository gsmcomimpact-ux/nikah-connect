import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Compte suspendu" };

export default async function SuspendedPage() {
  const user = await requireUser({ allowSuspended: true, allowIncompleteOnboarding: true });
  if (user.status !== "SUSPENDED")
    return (
      <Card>
        <p>Votre compte est actif.</p>
        <ButtonLink href="/espace" className="mt-4">Retour à mon espace</ButtonLink>
      </Card>
    );
  return (
    <Card className="mx-auto max-w-xl text-center">
      <ShieldAlert className="mx-auto h-10 w-10 text-gold" aria-hidden />
      <h1 className="mt-4 font-display text-2xl font-semibold text-primary">Compte temporairement suspendu</h1>
      <p className="mt-3 text-sm text-gray-600">
        Votre compte a été suspendu par l'équipe de modération{user.suspendedUntil ? ` jusqu'au ${formatDate(user.suspendedUntil)}` : ""}. Pendant cette période, votre profil n'est plus visible et vous ne pouvez plus envoyer de messages.
      </p>
      {user.suspensionReason && <p className="mt-3 rounded-xl bg-muted p-3 text-sm">Motif : {user.suspensionReason}</p>}
      <p className="mt-4 text-sm text-gray-600">Vous pouvez contester cette décision ou exercer vos droits (export, suppression) en nous écrivant.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/contact" variant="outline">Contacter l'équipe</ButtonLink>
        <ButtonLink href="/espace/parametres/supprimer-mon-compte" variant="ghost">Supprimer mon compte</ButtonLink>
      </div>
    </Card>
  );
}
