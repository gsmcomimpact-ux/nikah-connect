import Link from "next/link";
import { BadgeCheck, ChevronRight, CreditCard, Download, Lock, Shield, Trash2, Users } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { requireUser } from "@/lib/auth/guards";

export const metadata = { title: "Paramètres" };

const ITEMS = [
  { href: "/espace/parametres/confidentialite", icon: Lock, title: "Confidentialité", desc: "Visibilité du profil et des photos, notifications, membres bloqués" },
  { href: "/espace/parametres/securite", icon: Shield, title: "Sécurité", desc: "Mot de passe, appareils connectés, activité récente" },
  { href: "/espace/parametres/verification", icon: BadgeCheck, title: "Vérification du profil", desc: "E-mail, téléphone et identité" },
  { href: "/espace/parametres/personne-de-confiance", icon: Users, title: "Personne de confiance (wali)", desc: "Impliquer un proche dans votre démarche — facultatif" },
  { href: "/espace/abonnement", icon: CreditCard, title: "Abonnement", desc: "Offre Essentiel ou Premium" },
  { href: "/api/account/export", icon: Download, title: "Exporter mes données", desc: "Téléchargez une copie de vos données personnelles (JSON)", download: true },
  { href: "/espace/parametres/supprimer-mon-compte", icon: Trash2, title: "Supprimer mon compte", desc: "Suppression définitive de votre profil et de vos données" },
];

export default async function SettingsPage() {
  await requireUser({ allowSuspended: true });
  return (
    <>
      <PageTitle title="Mes paramètres" />
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} prefetch={item.download ? false : undefined} className="flex items-center gap-4 px-5 py-4 hover:bg-cream/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-medium">{item.title}</span>
                <span className="text-sm text-gray-500">{item.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
