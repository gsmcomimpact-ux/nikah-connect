import { PlanCards } from "@/components/billing/plan-cards";
import { PageHero, Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Offres", description: "Inscription et profil gratuits. L'offre Premium ajoute la recherche avancée, davantage de demandes et une meilleure visibilité.", path: "/tarifs" });

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Offres" title="L'essentiel est gratuit" description="Créer son profil, découvrir des profils compatibles et échanger en cas d'intérêt mutuel : sans frais." />
      <Section tone="cream">
        <div className="mx-auto max-w-4xl">
          <PlanCards
            freeAction={<ButtonLink href="/inscription" variant="outline" className="w-full">Créer mon profil</ButtonLink>}
            premiumAction={<ButtonLink href="/inscription" variant="gold" className="w-full">Commencer gratuitement</ButtonLink>}
          />
          <p className="mt-6 text-center text-sm text-gray-500">Le score de compatibilité et la messagerie sont identiques pour tous : Premium n'achète jamais une « meilleure » compatibilité.</p>
        </div>
      </Section>
    </>
  );
}
