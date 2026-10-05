import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { HowItWorksSection, SafetySection } from "@/components/marketing/sections";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { PageHero, Section, SectionHeading } from "@/components/ui/section";
import { COUNTRIES, COUNTRY_BY_SLUG } from "@/lib/constants/geo";
import { localPageContent } from "@/lib/content/local-seo";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.seoSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const country = COUNTRY_BY_SLUG.get((await params).country);
  if (!country) return {};
  const content = localPageContent(country);
  return pageMetadata({ title: content.title, description: content.description, path: `/rencontre-musulmane-${country.seoSlug}` });
}

export default async function LocalSeoPage({ params }: { params: Promise<{ country: string }> }) {
  const country = COUNTRY_BY_SLUG.get((await params).country);
  if (!country) notFound();
  const content = localPageContent(country);
  const others = COUNTRIES.filter((c) => c.code !== country.code);
  return (
    <>
      <JsonLd data={[faqJsonLd(content.faq), breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Rencontre musulmane", path: "/rencontre-musulmane" }, { name: country.name, path: `/rencontre-musulmane-${country.seoSlug}` }])]} />
      <PageHero eyebrow={country.name} title={content.h1} description={content.intro}>
        <ButtonLink href="/inscription" variant="gold" size="lg">Créer mon profil gratuitement</ButtonLink>
      </PageHero>
      <Section tone="white">
        <SectionHeading title={`Des rencontres dans tout le pays`} description="Le matching tient compte de votre ville et de la distance, sans jamais révéler d'adresse exacte." />
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {content.cities.map((city) => (
            <li key={city} className="flex items-center gap-1 rounded-full bg-muted px-4 py-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden /> {city}
            </li>
          ))}
        </ul>
      </Section>
      <HowItWorksSection />
      <Section tone="cream">
        <SectionHeading title="Questions fréquentes" />
        <div className="mx-auto mt-8 max-w-3xl space-y-4">
          {content.faq.map((f) => (
            <div key={f.q} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-ink">{f.q}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>
      <SafetySection />
      <Section tone="white">
        <h2 className="font-display text-xl font-semibold text-primary">Rencontres musulmanes dans d'autres pays</h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {others.map((c) => (
            <li key={c.code}>
              <Link href={`/rencontre-musulmane-${c.seoSlug}`} className="text-primary hover:underline">Rencontre musulmane {c.name}</Link>
            </li>
          ))}
          <li><Link href="/conseils" className="text-primary hover:underline">Nos conseils</Link></li>
        </ul>
      </Section>
    </>
  );
}
