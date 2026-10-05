/**
 * Pages légales. Les éléments entre [crochets] sont à compléter avec les informations
 * de l'éditeur. Faites relire ces textes par un juriste avant la mise en production,
 * en fonction des pays où la plateforme est exploitée (RGPD, lois nationales sur les données).
 */
export type LegalPage = { slug: string; title: string; description: string; updated: string; content: string };

const UPDATED = "5 octobre 2026";

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "conditions-generales",
    title: "Conditions générales d'utilisation",
    description: "Les règles d'utilisation de la plateforme NIKAH CONNECT.",
    updated: UPDATED,
    content: `## 1. Objet
Les présentes conditions régissent l'utilisation de la plateforme NIKAH CONNECT (ci-après « la Plateforme »), éditée par [Raison sociale], [forme juridique], [adresse], [numéro d'immatriculation] (ci-après « l'Éditeur »). La Plateforme a pour objet la mise en relation de personnes musulmanes majeures recherchant un(e) conjoint(e) dans une démarche sérieuse orientée vers le mariage.

## 2. Accès et inscription
L'inscription est réservée aux personnes âgées d'au moins 18 ans, juridiquement capables, et recherchant une relation sérieuse en vue du mariage. Le membre s'engage à fournir des informations exactes et à les tenir à jour. Un seul compte par personne est autorisé.

## 3. Engagements du membre
Le membre s'engage notamment à :
- respecter les [règles communautaires](/regles-communautaires) ;
- ne pas usurper l'identité d'un tiers ni créer de faux profil ;
- ne jamais solliciter d'argent, de biens ou d'informations bancaires ;
- ne pas utiliser la Plateforme à des fins commerciales, publicitaires ou de prosélytisme agressif ;
- ne publier aucun contenu illicite, haineux, discriminatoire, sexuel ou portant atteinte à la vie privée d'autrui.

## 4. Fonctionnement du service
La Plateforme propose des suggestions de profils fondées sur les informations déclarées. Le score de compatibilité est un indicateur de proximité des réponses ; il ne constitue ni une garantie ni une promesse de réussite d'une relation. Les conversations ne sont ouvertes qu'en cas d'intérêt réciproque.

## 5. Vérification des profils
La Plateforme propose une vérification de l'e-mail, du téléphone et de l'identité. Un badge de vérification atteste uniquement du contrôle effectué à une date donnée ; il ne dispense pas le membre de rester vigilant.

## 6. Offres et abonnements
L'inscription et les fonctionnalités essentielles sont gratuites. Des fonctionnalités complémentaires peuvent être proposées dans le cadre d'un abonnement Premium dont le prix et la durée sont indiqués avant tout paiement. [Conditions de rétractation, de renouvellement et de résiliation à compléter lors de l'activation du paiement.]

## 7. Modération et sanctions
L'Éditeur peut, en cas de manquement aux présentes conditions, retirer un contenu, suspendre temporairement ou fermer définitivement un compte. Le membre concerné peut contester la décision via la page [Contact](/contact).

## 8. Responsabilité
L'Éditeur met en œuvre des moyens raisonnables pour assurer la sécurité de la Plateforme mais ne peut garantir le comportement des membres. Chaque membre est seul responsable de ses échanges et des rencontres qu'il organise. Les rencontres physiques doivent se dérouler dans des lieux publics, idéalement en présence ou avec l'information de la famille.

## 9. Données personnelles
Le traitement des données est décrit dans la [politique de confidentialité](/confidentialite).

## 10. Résiliation
Le membre peut supprimer son compte à tout moment depuis son espace (Paramètres › Supprimer mon compte).

## 11. Droit applicable
Les présentes conditions sont soumises au droit [à préciser]. Tout litige sera, à défaut de résolution amiable, porté devant les juridictions compétentes de [ville].`,
  },
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    description: "Comment NIKAH CONNECT collecte, utilise et protège vos données personnelles.",
    updated: UPDATED,
    content: `## Responsable du traitement
[Raison sociale], [adresse]. Contact : via la page [Contact](/contact) (objet « Données personnelles »).

## Données collectées
- **Compte** : e-mail, téléphone (facultatif), mot de passe (stocké sous forme hachée uniquement), date de naissance.
- **Profil** : prénom ou pseudonyme, sexe, ville et pays, situation matrimoniale, enfants, profession, études, langues, présentation, centres d'intérêt, projet matrimonial.
- **Informations facultatives à caractère religieux** : place de la religion, pratique, valeurs. Ces données sont sensibles : elles ne sont collectées qu'avec votre consentement explicite, sont facultatives et peuvent être retirées à tout moment.
- **Photos** (facultatives) : ré-encodées et débarrassées de leurs métadonnées (dont la localisation GPS).
- **Pièces d'identité** (vérification facultative) : chiffrées, accessibles aux seuls administrateurs habilités et **supprimées dès la décision**.
- **Données d'usage** : demandes, messages, signalements, journal de sécurité. Les adresses IP sont conservées sous forme hachée.

## Finalités et bases légales
- Fournir le service de mise en relation (exécution du contrat).
- Calculer les compatibilités (exécution du contrat ; consentement pour les données religieuses).
- Assurer la sécurité, prévenir la fraude et les arnaques, modérer (intérêt légitime, obligations légales).
- Envoyer les notifications liées au service (exécution du contrat) ; vous pouvez désactiver les e-mails non essentiels.

## Ce que nous ne faisons jamais
- Afficher votre e-mail, votre téléphone ou votre adresse.
- Vendre ou louer vos données.
- Afficher vos documents d'identité.

## Destinataires
Les membres connectés voient les informations de profil que vous avez choisi de publier. Nos sous-traitants techniques (hébergement, envoi d'e-mails/SMS, paiement le cas échéant) n'accèdent qu'aux données nécessaires. [Liste des sous-traitants et localisation des serveurs à compléter.]

## Durées de conservation
- Compte actif : pendant toute la durée d'utilisation.
- Compte supprimé : données de profil, photos et contenu des messages effacés immédiatement ; éléments de sécurité (signalements, journal d'audit) conservés [12 mois] puis supprimés.
- Pièces d'identité : supprimées dès la décision de vérification.

## Vos droits
Accès, rectification, effacement, portabilité, opposition, limitation et retrait du consentement. Vous pouvez exercer la plupart de ces droits directement depuis votre espace : modification du profil, **export de vos données** (Paramètres › Exporter mes données) et **suppression du compte**. Vous pouvez également introduire une réclamation auprès de l'autorité de protection des données compétente.

## Sécurité
Chiffrement des communications (HTTPS), hachage des mots de passe, chiffrement des pièces d'identité au repos, contrôle d'accès strict, journalisation des actions sensibles, protection contre les robots et les abus.`,
  },
  {
    slug: "cookies",
    title: "Politique de cookies",
    description: "Les cookies utilisés par NIKAH CONNECT.",
    updated: UPDATED,
    content: `## Cookies strictement nécessaires
La Plateforme utilise uniquement un **cookie de session** sécurisé (httpOnly, SameSite) indispensable à votre connexion. Il ne contient aucune information personnelle lisible et expire après 30 jours d'inactivité. Ce cookie étant strictement nécessaire, il ne requiert pas de consentement.

## Protection anti-robots
Si la protection Cloudflare Turnstile est activée, elle peut déposer des éléments techniques nécessaires à la détection des robots sur les formulaires d'inscription et de contact.

## Aucun cookie publicitaire
Nous n'utilisons aucun cookie publicitaire ni de traçage tiers. Si des outils de mesure d'audience étaient ajoutés à l'avenir, un bandeau de consentement serait mis en place au préalable.`,
  },
  {
    slug: "regles-communautaires",
    title: "Règles communautaires",
    description: "Les règles qui garantissent un espace respectueux et sûr pour tous.",
    updated: UPDATED,
    content: `## L'esprit de la communauté
NIKAH CONNECT est un espace dédié aux personnes qui recherchent sincèrement un(e) conjoint(e). Chacun s'y engage à faire preuve de respect, d'honnêteté et de pudeur.

## Ce qui est attendu
- Un profil sincère, avec des informations exactes.
- Des échanges courtois, patients et bienveillants, même en cas de désaccord ou de refus.
- Le respect du choix de l'autre : un refus ou une absence de réponse doit être accepté.
- Des photos pudiques, récentes, sur lesquelles vous êtes identifiable.

## Ce qui est interdit
- Les faux profils, l'usurpation d'identité, les comptes multiples.
- Toute demande d'argent, de cadeaux, de cartes prépayées ou d'informations bancaires.
- Le harcèlement, les insultes, les menaces, les propos discriminatoires.
- Les contenus à caractère sexuel ou suggestif.
- Les messages en masse, la publicité, les liens vers des services externes.
- Le jugement de la foi d'autrui : les informations religieuses sont personnelles et facultatives.

## Sanctions
Selon la gravité : avertissement, masquage de contenu, suspension temporaire ou fermeture définitive du compte. Les tentatives d'escroquerie peuvent être signalées aux autorités.

## Signaler
Utilisez le bouton « Signaler » présent sur chaque profil et chaque message. Vos signalements sont confidentiels.`,
  },
  {
    slug: "suppression-de-compte",
    title: "Suppression de compte",
    description: "Comment supprimer votre compte et ce qu'il advient de vos données.",
    updated: UPDATED,
    content: `## Supprimer votre compte
Connectez-vous puis rendez-vous dans **Paramètres › Supprimer mon compte**. Pour votre sécurité, votre mot de passe et une confirmation vous sont demandés.

## Ce qui est supprimé
- Votre profil, vos préférences, vos photos (fichiers compris), votre personne de confiance.
- Vos demandes, vos favoris, vos notifications, vos sessions.
- Le contenu de vos messages, remplacé par « [message supprimé] » chez vos interlocuteurs.
- Vos éventuels documents de vérification.

## Ce qui est conservé temporairement
Pour des raisons de sécurité et d'obligations légales, les signalements et le journal d'audit sont conservés pendant une durée limitée, rattachés à un identifiant anonymisé.

## Avant de supprimer
Vous pouvez **télécharger une copie de vos données** (Paramètres › Exporter mes données) ou simplement **mettre votre profil en pause** (Paramètres › Confidentialité).

## Vous ne pouvez plus vous connecter ?
Écrivez-nous via la page [Contact](/contact) en précisant l'adresse e-mail du compte : nous traiterons votre demande après vérification.`,
  },
  {
    slug: "donnees-personnelles",
    title: "Gestion des données personnelles",
    description: "Exercer vos droits sur vos données : accès, export, rectification, suppression.",
    updated: UPDATED,
    content: `## Vos outils en libre-service
- **Consulter et modifier** vos informations : Mon profil.
- **Choisir qui voit vos photos** et **mettre votre profil en pause** : Paramètres › Confidentialité.
- **Exporter vos données** au format JSON : Paramètres › Exporter mes données.
- **Gérer vos appareils connectés** : Paramètres › Sécurité.
- **Supprimer votre compte** : Paramètres › Supprimer mon compte.

## Données sensibles
Les informations relatives à la religion sont facultatives. Vous pouvez les retirer à tout moment en modifiant la section « Profil religieux » de votre profil ; elles cessent alors immédiatement d'être utilisées pour le calcul des compatibilités.

## Minimisation
Nous ne demandons jamais votre adresse exacte. La distance entre membres est calculée à partir du centre de la ville déclarée. Les pièces d'identité sont supprimées dès la fin de la vérification.

## Nous contacter
Pour toute autre demande (opposition, limitation, réclamation), utilisez la page [Contact](/contact) avec l'objet « Données personnelles ». Nous répondons dans un délai d'un mois.`,
  },
];

export const LEGAL_BY_SLUG = new Map(LEGAL_PAGES.map((p) => [p.slug, p]));
