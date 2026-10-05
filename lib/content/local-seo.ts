import type { Country } from "@/lib/constants/geo";

/** Contenu des pages locales SEO, généré à partir de la liste des pays (lib/constants/geo.ts). */
export function localPageContent(country: Country) {
  const cities = country.cities.map((c) => c.name);
  return {
    title: `Rencontre musulmane ${prepositionFor(country)} : mariage sérieux et halal`,
    h1: `Rencontre musulmane ${prepositionFor(country)}`,
    description: `Rencontrez des célibataires musulmans ${prepositionFor(country)} (${cities.slice(0, 3).join(", ")}…) dans une démarche sérieuse orientée vers le mariage. Profils vérifiés, échanges respectueux, inscription gratuite.`,
    intro: `Vous vivez ${prepositionFor(country)} ou souhaitez rencontrer une personne musulmane qui y réside ? NIKAH CONNECT met en relation des personnes partageant les mêmes valeurs et le même projet : construire un foyer dans le respect de la foi et de la famille.`,
    cities,
    faq: [
      { q: `Comment trouver un(e) conjoint(e) musulman(e) ${prepositionFor(country)} ?`, a: `Créez votre profil gratuitement, indiquez ${country.name} et votre ville dans vos préférences : notre algorithme vous propose des profils compatibles, avec la distance approximative et les raisons de la compatibilité.` },
      { q: "Puis-je rencontrer une personne vivant à l'étranger ?", a: "Oui. Indiquez si vous êtes ouvert(e) à vivre à l'étranger : le matching en tient compte et vous propose aussi des profils de la diaspora." },
      { q: "Ma famille peut-elle être impliquée ?", a: "Oui, la fonctionnalité « personne de confiance » vous permet d'associer un parent, un tuteur ou un wali, au moment que vous choisissez." },
    ],
  };
}

const PREPOSITIONS: Record<string, string> = {
  NE: "au Niger",
  FR: "en France",
  CI: "en Côte d'Ivoire",
  BF: "au Burkina Faso",
  SN: "au Sénégal",
  ML: "au Mali",
  GN: "en Guinée",
  CM: "au Cameroun",
  TD: "au Tchad",
  MA: "au Maroc",
  DZ: "en Algérie",
  TN: "en Tunisie",
  BE: "en Belgique",
  CA: "au Canada",
};

function prepositionFor(country: Country): string {
  return PREPOSITIONS[country.code] ?? `en ${country.name}`;
}
