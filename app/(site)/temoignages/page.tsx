import { TestimonialsSection } from "@/components/marketing/sections";
import { PageHero, Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Témoignages", description: "Parcours de membres ayant construit une relation sérieuse et respectueuse sur NIKAH CONNECT.", path: "/temoignages" });

export default function TestimonialsPage() {
  return (
    <>
      <PageHero eyebrow="Témoignages" title="Des parcours sereins vers le mariage" description="Chaque histoire est unique. Voici quelques exemples de parcours sur la plateforme." />
      <TestimonialsSection />
      <Section tone="cream">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold text-primary">Vous vous êtes rencontrés grâce à nous ?</h2>
          <p className="mt-2 text-gray-600">Partagez votre histoire : elle sera publiée uniquement avec votre accord écrit, et de manière anonyme si vous le souhaitez.</p>
          <ButtonLink href="/contact" variant="outline" className="mt-6">Partager notre témoignage</ButtonLink>
        </div>
      </Section>
    </>
  );
}
