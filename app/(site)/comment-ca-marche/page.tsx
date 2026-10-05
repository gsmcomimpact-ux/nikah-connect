import { HowItWorksSection, SafetySection } from "@/components/marketing/sections";
import { PageHero, Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Comment ça marche",
  description: "Créez votre profil, définissez vos critères, découvrez des profils compatibles et échangez dans le respect : le parcours NIKAH CONNECT en 4 étapes.",
  path: "/comment-ca-marche",
});

const JOURNEY = ["Inscription", "Création du profil", "Préférences", "Compatibilités", "Demande", "Compatibilité mutuelle", "Conversation", "Rencontre sérieuse", "Projet matrimonial"];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero eyebrow="Comment ça marche" title="Un parcours clair, du profil au projet de mariage" description="À chaque étape, la plateforme vous indique la prochaine action recommandée." />
      <HowItWorksSection withCriteria />
      <Section tone="cream">
        <SectionHeading title="Votre parcours" description="Les échanges ne s'ouvrent qu'en cas d'intérêt réciproque : pas de messages non sollicités." />
        <ol className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2">
          {JOURNEY.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary">{step}</span>
              {i < JOURNEY.length - 1 && <span className="text-gold" aria-hidden>→</span>}
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: "Intéressé(e) ou Passer", d: "Sur chaque profil suggéré, indiquez simplement votre intérêt. « Passer » est discret : la personne n'en est jamais informée." },
            { t: "Envoyer une demande", d: "Accompagnez votre demande d'un mot respectueux. Votre interlocuteur(trice) l'accepte ou la décline, sans pression." },
            { t: "Compatibilité mutuelle", d: "Lorsque l'intérêt est réciproque, une conversation sécurisée s'ouvre. Vous pouvez y impliquer votre famille ou votre wali." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-display text-lg font-semibold text-primary">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{c.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/inscription" size="lg">Créer mon profil</ButtonLink>
        </div>
      </Section>
      <SafetySection />
    </>
  );
}
