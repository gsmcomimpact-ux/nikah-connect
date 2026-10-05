import { PageTitle } from "@/components/layout/page-title";
import { PlanCards } from "@/components/billing/plan-cards";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { startCheckoutAction } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth/guards";
import { effectivePlan } from "@/lib/billing/plans";
import { paymentsEnabled } from "@/lib/billing/provider";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Abonnement" };

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const user = await requireUser();
  const { statut } = await searchParams;
  const plan = effectivePlan(user.subscription);
  const enabled = paymentsEnabled();
  return (
    <div className="space-y-6">
      <PageTitle title="Abonnement" description="L'essentiel est gratuit. Premium vous offre davantage d'outils et soutient une plateforme sûre." />
      {statut === "succes" && <Alert tone="success">Merci ! Votre paiement a été pris en compte ; votre offre sera mise à jour dans quelques instants.</Alert>}
      {statut === "annule" && <Alert tone="info">Paiement annulé. Aucun montant n'a été débité.</Alert>}
      {plan === "PREMIUM" && user.subscription?.currentPeriodEnd && <Alert tone="success">Offre Premium active jusqu'au {formatDate(user.subscription.currentPeriodEnd)}.</Alert>}
      <PlanCards
        current={plan}
        premiumAction={
          plan === "PREMIUM" ? null : enabled ? (
            <form action={async () => { "use server"; await startCheckoutAction(); }}>
              <Button type="submit" variant="gold" className="w-full">Passer à Premium</Button>
            </form>
          ) : (
            <p className="rounded-xl bg-white/10 p-3 text-center text-sm text-cream/90">Le paiement en ligne sera bientôt disponible.</p>
          )
        }
      />
    </div>
  );
}
