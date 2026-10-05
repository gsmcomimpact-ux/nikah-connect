import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { paymentsEnabled } from "@/lib/billing/provider";

/**
 * Webhook du fournisseur de paiement (squelette).
 * À compléter lors de l'activation de Stripe :
 *  1. vérifier la signature avec STRIPE_WEBHOOK_SECRET (en-tête « stripe-signature ») ;
 *  2. sur « checkout.session.completed » / « invoice.paid » : passer subscriptions.plan à PREMIUM,
 *     renseigner current_period_end et créer une ligne dans payments ;
 *  3. sur « customer.subscription.deleted » : repasser l'offre à FREE.
 * Cette route est exclue de la vérification d'origine CSRF (appel serveur à serveur).
 */
export async function POST() {
  if (!paymentsEnabled() || !env.payment.stripeWebhookSecret) {
    return NextResponse.json({ error: "Paiements non configurés" }, { status: 501 });
  }
  return NextResponse.json({ error: "Webhook non implémenté" }, { status: 501 });
}
