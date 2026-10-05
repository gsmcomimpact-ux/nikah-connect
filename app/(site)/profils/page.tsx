import { Lock } from "lucide-react";
import { SampleProfilesSection } from "@/components/marketing/sections";
import { PageHero, Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = pageMetadata({
  title: "Profils",
  description: "Des profils de personnes musulmanes en recherche sérieuse de mariage. Pour protéger leur vie privée, les profils réels ne sont visibles qu'aux membres inscrits.",
  path: "/profils",
});

export default async function ProfilesPublicPage() {
  if (await getSessionUser()) redirect("/espace/compatibilites");
  return (
    <>
      <PageHero eyebrow="Profils" title="Des profils sincères, protégés" description="Pour préserver la vie privée de nos membres, les profils réels ne sont accessibles qu'après inscription. Aucun profil n'est indexé par les moteurs de recherche." />
      <SampleProfilesSection />
      <Section tone="muted">
        <div className="mx-auto max-w-2xl text-center">
          <Lock className="mx-auto h-8 w-8 text-gold" aria-hidden />
          <h2 className="mt-3 font-display text-2xl font-semibold text-primary">Inscrivez-vous pour découvrir vos compatibilités</h2>
          <p className="mt-2 text-gray-600">L'inscription est gratuite. Vos coordonnées ne sont jamais affichées et vous choisissez qui peut voir votre photo.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/inscription" size="lg">Créer mon profil</ButtonLink>
            <ButtonLink href="/connexion" variant="outline" size="lg">J'ai déjà un compte</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
