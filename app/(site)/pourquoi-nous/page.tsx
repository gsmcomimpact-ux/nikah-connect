import { AdvantagesSection, SafetySection } from "@/components/marketing/sections";
import { PageHero, Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Pourquoi nous",
  description: "Rencontres sérieuses, respect des valeurs, profils vérifiés, protection des données, outils anti-arnaque et matching intelligent.",
  path: "/pourquoi-nous",
});

export default function WhyUsPage() {
  return (
    <>
      <PageHero eyebrow="Pourquoi nous" title="Une plateforme de mariage, pas une application de rencontre" description="Nous avons conçu chaque fonctionnalité autour de trois mots : sérieux, respect, sécurité." />
      <AdvantagesSection />
      <SafetySection />
      <Section tone="primary" pattern>
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-cream">Prêt(e) à commencer ?</h2>
          <ButtonLink href="/inscription" variant="gold" size="lg" className="mt-6">Créer mon profil</ButtonLink>
        </div>
      </Section>
    </>
  );
}
