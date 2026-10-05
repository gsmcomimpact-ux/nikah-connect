/**
 * Identité de la plateforme — modifiez ce fichier pour changer le nom,
 * le slogan, le logo et les couleurs. Les couleurs sont injectées comme
 * variables CSS dans le layout racine et utilisées partout via Tailwind
 * (bg-primary, text-gold, etc.).
 */
export const siteConfig = {
  name: "NIKAH CONNECT",
  shortName: "Nikah Connect",
  tagline: "La rencontre musulmane sérieuse, orientée mariage",
  description:
    "Une plateforme de rencontre musulmane sérieuse dédiée aux personnes qui souhaitent construire une relation respectueuse et avancer vers le mariage.",
  /** Chemin d'un logo image facultatif (ex. "/logo.svg"). Si vide, le logo vectoriel intégré est utilisé. */
  logoUrl: "",
  locale: "fr_FR",
  contactEmail: "contact@nikah-connect.example",
  colors: {
    primary: "#0F5132", // vert profond
    primaryLight: "#198754", // vert émeraude
    gold: "#D4AF37", // doré
    cream: "#FAF9F6", // blanc cassé
    muted: "#F3F4F6", // gris clair
    ink: "#17201A", // texte foncé
  },
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
