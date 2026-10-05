import Link from "next/link";
import { ArrowRight, BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { HeroIllustration } from "@/components/brand/hero-illustration";
import { GeometricPattern } from "@/components/brand/geometric-pattern";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { AdvantagesSection, HowItWorksSection, SafetySection, SampleProfilesSection, TestimonialsSection } from "@/components/marketing/sections";
import { BlogCard } from "@/components/blog/blog-card";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ } from "@/lib/content/marketing";
import { getLatestPosts } from "@/lib/blog/queries";
import { organizationJsonLd, websiteJsonLd, faqJsonLd } from "@/lib/seo/structured-data";

export const revalidate = 3600;

export default async function HomePage() {
  const posts = await getLatestPosts(3);
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(FAQ)]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <GeometricPattern className="text-primary" opacity={0.045} />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/70 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Rencontre musulmane sérieuse · orientée mariage
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">Trouvez la personne qui partage vos valeurs.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-700">
              Une plateforme de rencontre musulmane sérieuse dédiée aux personnes qui souhaitent construire une relation respectueuse et avancer vers le mariage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/inscription" size="lg">
                Créer mon profil <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/comment-ca-marche" variant="outline" size="lg">
                Découvrir comment ça marche
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-gold" aria-hidden /> Profils vérifiés</li>
              <li className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-gold" aria-hidden /> Coordonnées jamais affichées</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" aria-hidden /> Modération active</li>
            </ul>
          </div>
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <HeroIllustration className="h-auto w-full drop-shadow-sm" />
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <AdvantagesSection />
      <SampleProfilesSection />
      <TestimonialsSection />
      <SafetySection />

      {posts.length > 0 && (
        <Section tone="cream">
          <SectionHeading eyebrow="Conseils" title="Conseils pour une rencontre sérieuse" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/conseils" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Tous les conseils →
            </Link>
          </div>
        </Section>
      )}

      <Section tone="white">
        <SectionHeading eyebrow="Questions fréquentes" title="Vous vous posez des questions ?" />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-cream/40">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                {item.q}
                <span className="text-gold transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section tone="primary" pattern>
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">Votre projet de mariage mérite un cadre sérieux.</h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/80">Créez votre profil gratuitement en quelques minutes.</p>
          <ButtonLink href="/inscription" variant="gold" size="lg" className="mt-8">
            Créer mon profil
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
