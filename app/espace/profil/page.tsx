import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import { PageTitle } from "@/components/layout/page-title";
import { Card, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { AboutForm } from "@/components/profile/about-form";
import { PhotoManager } from "@/components/profile/photo-manager";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Mon profil" };

export default async function MyProfilePage({ searchParams }: { searchParams: Promise<{ maj?: string }> }) {
  const user = await requireUser();
  const { maj } = await searchParams;
  const [profile, photos, interests] = await Promise.all([
    db.profile.findUniqueOrThrow({ where: { userId: user.id }, include: { interests: { include: { interest: true } } } }),
    db.photo.findMany({ where: { userId: user.id }, orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }], select: { id: true, status: true, isPrimary: true } }),
    db.interest.findMany({ orderBy: { label: "asc" }, take: 80 }),
  ]);
  const mine = profile.interests.map((i) => i.interest);
  const options = [...new Map([...interests, ...mine].map((i) => [i.label, { value: i.label, label: i.label }])).values()];

  const sections = [
    { href: "/inscription/etape/2", title: "Informations personnelles", desc: "Situation, enfants, profession, études, langues" },
    { href: "/inscription/etape/3", title: "Profil religieux", desc: "Place de la religion, valeurs, vision du mariage" },
    { href: "/inscription/etape/4", title: "Projet matrimonial", desc: "Enfants, lieu de vie, horizon du mariage" },
    { href: "/espace/profil/preferences", title: "Mes préférences", desc: "Ce que vous recherchez chez un(e) partenaire" },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mon profil"
        description={`Profil complété à ${profile.completeness} %`}
        actions={
          <ButtonLink href={`/espace/membres/${user.id}`} variant="outline" size="sm">
            <Eye className="h-4 w-4" aria-hidden /> Voir mon profil
          </ButtonLink>
        }
      />
      {maj && <Alert tone="success">Vos modifications ont été enregistrées.</Alert>}
      <Card>
        <CardTitle>Présentation</CardTitle>
        <div className="mt-5">
          <AboutForm
            interestOptions={options}
            defaults={{
              displayName: profile.displayName,
              country: profile.country,
              city: profile.city,
              bio: profile.bio ?? "",
              familyVision: profile.familyVision ?? "",
              familyValues: profile.familyValues,
              interests: mine.map((i) => i.label),
            }}
          />
        </div>
      </Card>
      <Card id="photos">
        <CardTitle>Photos</CardTitle>
        <p className="mt-1 text-sm text-gray-600">
          Facultatives. Vous choisissez qui peut les voir dans <Link href="/espace/parametres/confidentialite" className="text-primary underline">Confidentialité</Link>.
        </p>
        <div className="mt-4">
          <PhotoManager photos={photos} />
        </div>
      </Card>
      <Card>
        <CardTitle>Autres sections</CardTitle>
        <ul className="mt-3 divide-y divide-gray-100">
          {sections.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="flex items-center justify-between gap-3 py-3.5 hover:text-primary">
                <span>
                  <span className="block font-medium">{s.title}</span>
                  <span className="text-sm text-gray-500">{s.desc}</span>
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
