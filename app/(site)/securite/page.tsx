import { AlertTriangle, BadgeCheck, Ban, Flag, Lock, ShieldCheck } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/ui/section";
import { SAFETY_TIPS } from "@/lib/security/scam-detection";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Sécurité", description: "Conseils de sécurité, dispositifs anti-arnaque, vérification des profils et modération : comment nous protégeons nos membres.", path: "/securite" });

const MEASURES = [
  { icon: BadgeCheck, t: "Vérification des profils", d: "E-mail, téléphone et pièce d'identité. Les documents sont chiffrés et supprimés après examen." },
  { icon: AlertTriangle, t: "Détection anti-arnaque", d: "Les messages évoquant des transferts d'argent, des informations bancaires ou des liens suspects déclenchent une alerte et une vérification." },
  { icon: Flag, t: "Signalement en un clic", d: "Sur chaque profil et chaque message. Faux profil, harcèlement, demande d'argent : notre équipe intervient." },
  { icon: Ban, t: "Blocage immédiat", d: "Un membre bloqué ne peut plus voir votre profil ni vous contacter." },
  { icon: Lock, t: "Coordonnées protégées", d: "Téléphone, e-mail et adresse ne sont jamais affichés. Un avertissement apparaît si vous tentez de les partager trop tôt." },
  { icon: ShieldCheck, t: "Sécurité technique", d: "Mots de passe hachés, sessions sécurisées, protection contre les robots et les attaques, journalisation des actions sensibles." },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero eyebrow="Sécurité" title="Votre sécurité est notre priorité" description="Des outils, une équipe de modération et quelques règles simples pour des rencontres sereines." />
      <Section tone="white">
        <div className="mx-auto max-w-3xl rounded-3xl border-2 border-gold/50 bg-gold/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-primary">Les règles d'or</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {SAFETY_TIPS.map((t) => (
              <li key={t} className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Section tone="cream">
        <SectionHeading title="Nos dispositifs" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MEASURES.map((m) => (
            <div key={m.t} className="rounded-2xl border border-gray-200 bg-white p-6">
              <m.icon className="h-6 w-6 text-gold" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{m.t}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{m.d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="muted">
        <SectionHeading title="Reconnaître une tentative d'arnaque" center={false} />
        <ul className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <li className="rounded-xl bg-white p-4">La personne déclare très vite des sentiments forts et veut quitter la plateforme.</li>
          <li className="rounded-xl bg-white p-4">Elle évoque une urgence : maladie, accident, frais de visa, de douane ou de billet d'avion.</li>
          <li className="rounded-xl bg-white p-4">Elle demande un transfert d'argent, une carte cadeau, des cryptomonnaies ou vos codes.</li>
          <li className="rounded-xl bg-white p-4">Elle refuse tout appel vidéo ou toute implication de la famille.</li>
        </ul>
      </Section>
    </>
  );
}
