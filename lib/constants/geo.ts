/**
 * Pays et villes de référence (coordonnées approximatives du centre-ville,
 * utilisées uniquement pour le calcul de distance — jamais d'adresse exacte).
 * Ajoutez des pays/villes ici ; les pages locales SEO sont générées à partir de `seoSlug`.
 */
export type City = { name: string; lat: number; lng: number };
export type Country = { code: string; name: string; seoSlug: string; demonym: string; cities: City[] };

export const COUNTRIES: Country[] = [
  {
    code: "NE",
    name: "Niger",
    seoSlug: "niger",
    demonym: "nigériens",
    cities: [
      { name: "Niamey", lat: 13.512, lng: 2.112 },
      { name: "Zinder", lat: 13.805, lng: 8.988 },
      { name: "Maradi", lat: 13.5, lng: 7.102 },
      { name: "Tahoua", lat: 14.89, lng: 5.265 },
      { name: "Agadez", lat: 16.974, lng: 7.986 },
      { name: "Dosso", lat: 13.049, lng: 3.194 },
    ],
  },
  {
    code: "FR",
    name: "France",
    seoSlug: "france",
    demonym: "français",
    cities: [
      { name: "Paris", lat: 48.857, lng: 2.352 },
      { name: "Lyon", lat: 45.764, lng: 4.836 },
      { name: "Marseille", lat: 43.296, lng: 5.37 },
      { name: "Lille", lat: 50.629, lng: 3.057 },
      { name: "Toulouse", lat: 43.605, lng: 1.444 },
      { name: "Strasbourg", lat: 48.573, lng: 7.752 },
      { name: "Bordeaux", lat: 44.838, lng: -0.579 },
      { name: "Nantes", lat: 47.218, lng: -1.554 },
    ],
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    seoSlug: "cote-divoire",
    demonym: "ivoiriens",
    cities: [
      { name: "Abidjan", lat: 5.36, lng: -4.008 },
      { name: "Bouaké", lat: 7.69, lng: -5.03 },
      { name: "Yamoussoukro", lat: 6.827, lng: -5.289 },
      { name: "Korhogo", lat: 9.458, lng: -5.629 },
      { name: "Odienné", lat: 9.51, lng: -7.569 },
    ],
  },
  {
    code: "BF",
    name: "Burkina Faso",
    seoSlug: "burkina-faso",
    demonym: "burkinabè",
    cities: [
      { name: "Ouagadougou", lat: 12.371, lng: -1.52 },
      { name: "Bobo-Dioulasso", lat: 11.177, lng: -4.297 },
      { name: "Koudougou", lat: 12.253, lng: -2.363 },
      { name: "Ouahigouya", lat: 13.582, lng: -2.421 },
    ],
  },
  {
    code: "SN",
    name: "Sénégal",
    seoSlug: "senegal",
    demonym: "sénégalais",
    cities: [
      { name: "Dakar", lat: 14.716, lng: -17.467 },
      { name: "Thiès", lat: 14.791, lng: -16.926 },
      { name: "Touba", lat: 14.85, lng: -15.883 },
      { name: "Saint-Louis", lat: 16.018, lng: -16.489 },
      { name: "Kaolack", lat: 14.152, lng: -16.073 },
    ],
  },
  {
    code: "ML",
    name: "Mali",
    seoSlug: "mali",
    demonym: "maliens",
    cities: [
      { name: "Bamako", lat: 12.639, lng: -8.003 },
      { name: "Sikasso", lat: 11.317, lng: -5.666 },
      { name: "Ségou", lat: 13.431, lng: -6.26 },
      { name: "Mopti", lat: 14.493, lng: -4.191 },
    ],
  },
  {
    code: "GN",
    name: "Guinée",
    seoSlug: "guinee",
    demonym: "guinéens",
    cities: [
      { name: "Conakry", lat: 9.641, lng: -13.578 },
      { name: "Kankan", lat: 10.385, lng: -9.305 },
      { name: "Labé", lat: 11.318, lng: -12.283 },
    ],
  },
  {
    code: "CM",
    name: "Cameroun",
    seoSlug: "cameroun",
    demonym: "camerounais",
    cities: [
      { name: "Yaoundé", lat: 3.848, lng: 11.502 },
      { name: "Douala", lat: 4.051, lng: 9.768 },
      { name: "Garoua", lat: 9.301, lng: 13.397 },
      { name: "Maroua", lat: 10.591, lng: 14.316 },
    ],
  },
  {
    code: "TD",
    name: "Tchad",
    seoSlug: "tchad",
    demonym: "tchadiens",
    cities: [
      { name: "N'Djamena", lat: 12.134, lng: 15.056 },
      { name: "Moundou", lat: 8.567, lng: 16.083 },
      { name: "Abéché", lat: 13.829, lng: 20.832 },
    ],
  },
  {
    code: "MA",
    name: "Maroc",
    seoSlug: "maroc",
    demonym: "marocains",
    cities: [
      { name: "Casablanca", lat: 33.573, lng: -7.59 },
      { name: "Rabat", lat: 34.02, lng: -6.841 },
      { name: "Marrakech", lat: 31.629, lng: -7.981 },
      { name: "Fès", lat: 34.033, lng: -5.0 },
      { name: "Tanger", lat: 35.759, lng: -5.834 },
    ],
  },
  {
    code: "DZ",
    name: "Algérie",
    seoSlug: "algerie",
    demonym: "algériens",
    cities: [
      { name: "Alger", lat: 36.754, lng: 3.059 },
      { name: "Oran", lat: 35.697, lng: -0.633 },
      { name: "Constantine", lat: 36.365, lng: 6.615 },
    ],
  },
  {
    code: "TN",
    name: "Tunisie",
    seoSlug: "tunisie",
    demonym: "tunisiens",
    cities: [
      { name: "Tunis", lat: 36.806, lng: 10.181 },
      { name: "Sfax", lat: 34.74, lng: 10.76 },
      { name: "Sousse", lat: 35.826, lng: 10.637 },
    ],
  },
  {
    code: "BE",
    name: "Belgique",
    seoSlug: "belgique",
    demonym: "belges",
    cities: [
      { name: "Bruxelles", lat: 50.85, lng: 4.352 },
      { name: "Anvers", lat: 51.219, lng: 4.402 },
      { name: "Liège", lat: 50.633, lng: 5.567 },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    seoSlug: "canada",
    demonym: "canadiens",
    cities: [
      { name: "Montréal", lat: 45.502, lng: -73.567 },
      { name: "Toronto", lat: 43.653, lng: -79.383 },
      { name: "Ottawa", lat: 45.421, lng: -75.697 },
    ],
  },
];

export const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
export const COUNTRY_BY_SLUG = new Map(COUNTRIES.map((c) => [c.seoSlug, c]));

export function countryName(code: string | null | undefined): string {
  if (!code) return "";
  return COUNTRY_BY_CODE.get(code)?.name ?? code;
}

export function findCity(countryCode: string, cityName: string): City | undefined {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  return COUNTRY_BY_CODE.get(countryCode)?.cities.find((c) => norm(c.name) === norm(cityName));
}

/** Distance orthodromique en kilomètres (formule de haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
