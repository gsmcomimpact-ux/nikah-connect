import { PageHero, Section, SectionHeading } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "À propos", description: `${siteConfig.name} : notre mission, nos valeurs et nos engagements pour des rencontres musulmanes sérieuses et respectueuses.`, path: "/a-propos" });

const VALUES = [
  { t: "Sérieux", d: "Une plateforme exclusivement dédiée aux personnes qui souhaitent se marier." },
  { t: "Respect", d: "Un cadre pudique, un vocabulaire digne, une tolérance zéro pour le harcèlement." },
  { t: "Confiance", d: "Vérification des profils, modération humaine, transparence sur le fonctionnement du matching." },
  { t: "Vie privée", d: "Nous collectons le strict nécessaire, ne vendons aucune donnée et vous laissons la maîtrise de votre visibilité." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="À propos" title="Faciliter des unions sincères" description="Nous croyons qu'une rencontre réussie repose d'abord sur des valeurs partagées et un projet de vie commun." />
      <Section tone="white">
        <div className="mx-auto max-w-3xl space-y-5 text-[17px] leading-relaxed text-gray-700">
          <p>
            {siteConfig.name} est née d'un constat simple : beaucoup de personnes musulmanes souhaitent se marier mais ne trouvent pas, dans les applications de rencontre classiques, un cadre qui respecte leurs valeurs. Trop centrées sur l'apparence, trop rapides, parfois risquées.
          </p>
          <p>
            Nous avons donc conçu une plateforme où l'on se présente d'abord par sa personnalité, ses valeurs et son projet de famille ; où les échanges ne s'ouvrent qu'en cas d'intérêt réciproque ; où la famille peut être associée ; et où la sécurité de chacun est une priorité.
          </p>
          <p>Nous ne prétendons pas « garantir » un mariage : nous offrons un cadre sérieux pour que deux personnes compatibles puissent se rencontrer, apprendre à se connaître et, si Allah le veut, construire un foyer.</p>
        </div>
      </Section>
      <Section tone="cream" pattern>
        <SectionHeading title="Nos valeurs" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.t} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-display text-xl font-semibold text-primary">{v.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{v.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/contact" variant="outline">Nous contacter</ButtonLink>
        </div>
      </Section>
    </>
  );
}
