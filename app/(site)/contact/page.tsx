import { PageHero, Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";
import { pageMetadata } from "@/lib/seo/metadata";
import { ContactForm } from "./contact-form";

export const metadata = pageMetadata({ title: "Contact", description: "Une question, un signalement urgent ou une demande liée à vos données personnelles ? Contactez l'équipe NIKAH CONNECT.", path: "/contact" });

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Nous sommes à votre écoute" description="Réponse sous 48 h ouvrées. Pour signaler un membre, utilisez de préférence le bouton « Signaler » depuis son profil." />
      <Section tone="cream">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_18rem]">
          <Card>
            <ContactForm />
          </Card>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h2 className="font-semibold text-primary">E-mail</h2>
              <p>{siteConfig.contactEmail}</p>
            </div>
            <div>
              <h2 className="font-semibold text-primary">Données personnelles</h2>
              <p>Vous pouvez exporter ou supprimer vos données directement depuis votre espace, rubrique Paramètres.</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
