import "server-only";
import { env } from "@/lib/config/env";

/**
 * Point d'intégration du paiement.
 * Tant que PAYMENT_PROVIDER="none" ou que STRIPE_SECRET_KEY est absente,
 * aucun paiement réel n'est proposé. Pour activer Stripe :
 *   PAYMENT_PROVIDER="stripe", STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PREMIUM_MONTHLY
 * puis implémentez createCheckout() avec l'API Stripe Checkout et le webhook
 * app/api/billing/webhook/route.ts (squelette fourni).
 */
export function paymentsEnabled(): boolean {
  return env.payment.provider === "stripe" && Boolean(env.payment.stripeSecretKey && env.payment.stripePricePremiumMonthly);
}

export async function createCheckout(params: { userId: string; email: string }): Promise<{ url: string } | { error: string }> {
  if (!paymentsEnabled()) return { error: "Le paiement en ligne n'est pas encore disponible." };
  // Appel REST Stripe sans dépendance supplémentaire.
  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": env.payment.stripePricePremiumMonthly,
    "line_items[0][quantity]": "1",
    customer_email: params.email,
    client_reference_id: params.userId,
    success_url: `${env.appUrl}/espace/abonnement?statut=succes`,
    cancel_url: `${env.appUrl}/espace/abonnement?statut=annule`,
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.payment.stripeSecretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return { error: "Impossible de démarrer le paiement. Réessayez plus tard." };
  const data = (await res.json()) as { url?: string };
  return data.url ? { url: data.url } : { error: "Réponse de paiement invalide." };
}
