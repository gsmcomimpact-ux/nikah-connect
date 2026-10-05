import Link from "next/link";
import { PageHero, Section } from "@/components/ui/section";
import { COUNTRIES } from "@/lib/constants/geo";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Rencontre musulmane par pays", description: "Rencontres musulmanes sérieuses en Afrique de l'Ouest, au Maghreb, en Europe et au Canada : trouvez des profils compatibles près de chez vous.", path: "/rencontre-musulmane" });

export default function LocalIndexPage() {
  return (
    <>
      <PageHero eyebrow="Par pays" title="Rencontre musulmane par pays" description="Des célibataires musulmans en démarche de mariage, près de chez vous ou dans la diaspora." />
      <Section tone="cream">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <Link href={`/rencontre-musulmane-${c.seoSlug}`} className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-gold">
                <span className="font-display text-lg font-semibold text-primary">Rencontre musulmane — {c.name}</span>
                <span className="mt-1 block text-sm text-gray-500">{c.cities.slice(0, 4).map((x) => x.name).join(", ")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
