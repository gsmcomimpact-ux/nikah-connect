/** Contenus éditoriaux des pages publiques (modifiables sans toucher aux composants). */

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Créez votre profil",
    description: "Présentez votre personnalité, vos valeurs et votre projet de mariage. Vous choisissez ce que vous partagez, et qui peut voir votre photo.",
  },
  {
    number: "02",
    title: "Définissez vos critères",
    description: "Âge, pays, ville, langue, situation matrimoniale, études, profession, pratique religieuse, projet de mariage, enfants, préférences familiales.",
  },
  {
    number: "03",
    title: "Découvrez des profils compatibles",
    description: "Notre algorithme vous propose des profils correspondant à vos critères et à vos valeurs, avec une explication claire de chaque compatibilité.",
  },
  {
    number: "04",
    title: "Échangez dans le respect",
    description: "Lorsqu'un intérêt est réciproque, une conversation s'ouvre dans un environnement sécurisé, modéré et respectueux.",
  },
] as const;

export const CRITERIA = [
  "Âge",
  "Pays",
  "Ville",
  "Langue",
  "Situation matrimoniale",
  "Niveau d'études",
  "Profession",
  "Pratique religieuse",
  "Projet de mariage",
  "Enfants",
  "Préférences familiales",
] as const;

export const ADVANTAGES = [
  { icon: "heart-handshake", title: "Rencontres sérieuses", description: "Une communauté de personnes qui souhaitent sincèrement avancer vers le mariage." },
  { icon: "scale", title: "Respect des valeurs", description: "Un vocabulaire, des règles et un design pensés pour des échanges dignes et pudiques." },
  { icon: "badge-check", title: "Profils vérifiés", description: "E-mail, téléphone et identité : trois niveaux de vérification, des badges distincts." },
  { icon: "lock", title: "Protection des données", description: "Coordonnées jamais affichées, photos contrôlées, documents chiffrés, export et suppression à tout moment." },
  { icon: "shield-alert", title: "Outils anti-arnaque", description: "Détection des demandes d'argent, des liens suspects et des envois massifs, avec alertes et modération." },
  { icon: "sparkles", title: "Matching intelligent", description: "Une compatibilité calculée sur le projet de vie, les valeurs, la famille — pas sur l'apparence." },
  { icon: "users", title: "Communauté respectueuse", description: "Signalement, blocage et modération humaine pour préserver un espace sain." },
] as const;

/**
 * Témoignages ILLUSTRATIFS fournis pour la démonstration.
 * Remplacez-les par de vrais témoignages, recueillis avec le consentement écrit des personnes.
 */
export const TESTIMONIALS = [
  {
    quote: "Ce qui m'a rassurée, c'est de pouvoir impliquer mon père dès le début. Les échanges sont restés respectueux du premier au dernier message.",
    author: "Témoignage illustratif",
    detail: "Exemple de parcours — 29 ans, Niamey",
  },
  {
    quote: "Le score de compatibilité m'a aidé à engager la conversation sur l'essentiel : le projet de famille, le lieu de vie, les valeurs.",
    author: "Témoignage illustratif",
    detail: "Exemple de parcours — 34 ans, Lyon",
  },
  {
    quote: "Je n'aimais pas les applications où tout repose sur la photo. Ici, on lit d'abord une personne, ses projets et sa vision du mariage.",
    author: "Témoignage illustratif",
    detail: "Exemple de parcours — 31 ans, Dakar",
  },
] as const;

/** Profils d'exemple affichés sur la page d'accueil — entièrement fictifs. */
export const SAMPLE_PROFILES = [
  { displayName: "Amina", age: 28, city: "Niamey", country: "NE", profession: "Enseignante", education: "MASTER", languages: ["fr", "ar"], score: 92 },
  { displayName: "Ibrahim", age: 33, city: "Abidjan", country: "CI", profession: "Ingénieur réseaux", education: "MASTER", languages: ["fr", "dyu"], score: 87 },
  { displayName: "Mariam", age: 30, city: "Dakar", country: "SN", profession: "Pharmacienne", education: "DOCTORATE", languages: ["fr", "wo"], score: 84 },
] as const;

export const SAFETY_RULES = [
  "Ne transférez jamais d'argent à une personne rencontrée sur la plateforme.",
  "Ne communiquez jamais vos informations bancaires.",
  "Signalez tout comportement suspect.",
] as const;

export const FAQ = [
  {
    q: "La plateforme est-elle réservée au mariage ?",
    a: "Oui. Elle s'adresse aux personnes musulmanes qui recherchent un(e) conjoint(e) dans une démarche sérieuse et respectueuse, orientée vers le mariage.",
  },
  {
    q: "Mes coordonnées sont-elles visibles ?",
    a: "Jamais. Votre e-mail, votre téléphone et votre adresse ne sont jamais affichés. Vous décidez seul(e) de partager vos coordonnées, quand la confiance est établie.",
  },
  {
    q: "Qui peut voir ma photo ?",
    a: "Vous choisissez : visible par les membres connectés, uniquement en cas de compatibilité mutuelle, ou masquée. Les photos sont vérifiées par la modération avant publication.",
  },
  {
    q: "Le score de compatibilité garantit-il la réussite d'une relation ?",
    a: "Non. Il reflète la proximité de vos réponses (projet, valeurs, famille, préférences). C'est un point de départ pour la discussion, pas une promesse.",
  },
  {
    q: "Puis-je impliquer ma famille ou un wali ?",
    a: "Oui, c'est facultatif : vous pouvez déclarer une personne de confiance (parent, tuteur, accompagnateur) et partager ses coordonnées avec un profil au moment que vous choisissez.",
  },
  {
    q: "L'inscription est-elle gratuite ?",
    a: "Oui. La création de profil, la consultation des profils et un nombre de demandes quotidiennes sont gratuits. L'offre Premium ajoute la recherche avancée et davantage de demandes.",
  },
] as const;
