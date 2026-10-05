import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import { CompatibilityMeter } from "@/components/profile/compatibility-meter";
import { ADVANTAGES, CRITERIA, HOW_IT_WORKS_STEPS, SAFETY_RULES, SAMPLE_PROFILES, TESTIMONIALS } from "@/lib/content/marketing";
import { countryName } from "@/lib/constants/geo";
import { EDUCATION_LABELS, languageLabel } from "@/lib/constants/options";
import type { EducationLevel } from "@prisma/client";

export function HowItWorksSection({ withCriteria = false }: { withCriteria?: boolean }) {
  return (
    <Section id="comment-ca-marche" tone="white" pattern>
      <SectionHeading eyebrow="Comment ça marche" title="Quatre étapes, en toute sérénité" description="Un parcours simple et guidé : à chaque étape, vous savez quelle est la prochaine action recommandée." />
      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS_STEPS.map((step) => (
          <li key={step.number} className="relative rounded-2xl border border-gray-200 bg-cream/60 p-6">
            <span className="font-display text-4xl font-semibold text-gold">{step.number}</span>
            <h3 className="mt-3 font-display text-xl font-semibold text-primary">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
          </li>
        ))}
      </ol>
      {withCriteria && (
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-muted p-6 text-center">
          <h3 className="font-display text-lg font-semibold text-primary">Les critères que vous pouvez définir</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {CRITERIA.map((c) => (
              <span key={c} className="rounded-full bg-white px-3 py-1 text-sm text-ink shadow-sm">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

export function AdvantagesSection() {
  return (
    <Section tone="cream">
      <SectionHeading eyebrow="Pourquoi nous" title="Une plateforme pensée pour le mariage" description="Pas pour « swiper ». Pour rencontrer une personne qui partage vos valeurs et votre projet de vie." />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ADVANTAGES.map((a) => (
          <div key={a.title} className="rounded-2xl border border-gray-200/80 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name={a.icon} className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{a.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{a.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function SampleProfilesSection() {
  return (
    <Section tone="white">
      <SectionHeading eyebrow="Profils" title="Des profils qui parlent de projets, pas d'apparence" description="Exemples entièrement fictifs. Les profils réels ne sont visibles qu'aux membres inscrits." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {SAMPLE_PROFILES.map((p) => (
          <div key={p.displayName} className="rounded-2xl border border-gray-200 bg-cream/50 p-6">
            <div className="flex items-center gap-4">
              <Avatar name={p.displayName} />
              <div className="flex-1">
                <p className="font-display text-lg font-semibold">
                  {p.displayName}, {p.age} ans
                </p>
                <p className="text-sm text-gray-600">
                  📍 {p.city}, {countryName(p.country)}
                </p>
              </div>
              <CompatibilityMeter score={p.score} size="sm" />
            </div>
            <ul className="mt-4 space-y-1 text-sm text-gray-700">
              <li>💼 {p.profession}</li>
              <li>🎓 {EDUCATION_LABELS[p.education as EducationLevel]}</li>
              <li>🌍 {p.languages.map(languageLabel).join(" / ")}</li>
              <li>❤️ Projet matrimonial sérieux</li>
            </ul>
            <p className="mt-4 text-sm font-medium text-primary">{p.score} % compatible</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function TestimonialsSection() {
  return (
    <Section id="temoignages" tone="primary" pattern>
      <SectionHeading light eyebrow="Témoignages" title="Des parcours sereins" description="Exemples illustratifs de parcours sur la plateforme." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.detail} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <blockquote className="font-display text-lg leading-relaxed text-cream">« {t.quote} »</blockquote>
            <figcaption className="mt-4 text-sm text-cream/70">
              <span className="font-medium text-gold">{t.author}</span> · {t.detail}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function SafetySection() {
  return (
    <Section tone="muted">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading center={false} eyebrow="Sécurité" title="Votre sécurité passe avant tout" description="Modération humaine, détection automatique des comportements suspects, signalement en un clic et vérification des profils." />
        </div>
        <ul className="space-y-3">
          {SAFETY_RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden />
              <span className="text-sm font-medium text-ink">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
