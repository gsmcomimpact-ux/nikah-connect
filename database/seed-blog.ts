import type { BlogCategory } from "@prisma/client";

/** Articles de conseils initiaux (contenu éditorial original, modifiable depuis l'administration). */
export const BLOG_POSTS: {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  authorName: string;
  daysAgo: number;
  seoDescription: string;
  content: string;
}[] = [
  {
    slug: "preparer-son-mariage-sereinement",
    title: "Préparer son mariage sereinement : les questions à se poser avant de chercher",
    excerpt: "Avant même de créer votre profil, prendre le temps de clarifier vos attentes vous fera gagner en sérénité et en sincérité.",
    category: "PREPARER_MARIAGE",
    authorName: "L'équipe éditoriale",
    daysAgo: 3,
    seoDescription: "Les questions essentielles à se poser avant de chercher un(e) conjoint(e) : intention, projet de vie, famille et priorités.",
    content: `Chercher un(e) conjoint(e) commence rarement par une rencontre : cela commence par un travail sur soi. Clarifier ses intentions permet d'aborder chaque échange avec sincérité et de reconnaître plus facilement une personne réellement compatible.

## Pourquoi est-ce que je souhaite me marier maintenant ?
Le mariage est un engagement de foi, de compassion et de responsabilité. Interrogez-vous honnêtement : êtes-vous disponible émotionnellement, matériellement et spirituellement pour construire un foyer ? Il n'y a pas de « bon moment » parfait, mais il y a un moment où l'on se sent prêt à donner autant qu'à recevoir.

## Quelles sont mes priorités non négociables ?
Distinguez ce qui est essentiel de ce qui relève de la préférence. Quelques exemples de points à clarifier :
- la place de la religion dans le quotidien du foyer ;
- le souhait d'avoir des enfants, et leur éducation ;
- le lieu de vie (rester dans votre pays, vivre à l'étranger) ;
- l'organisation entre vie professionnelle et vie familiale ;
- la place de la famille élargie.

## Quel rôle pour ma famille ?
Beaucoup de personnes souhaitent impliquer un parent, un tuteur ou un wali dès les premières étapes. C'est une protection et une source de conseil précieuse. Sur NIKAH CONNECT, vous pouvez déclarer une **personne de confiance** et partager ses coordonnées au moment que vous choisissez.

## Être honnête dans son profil
Un profil sincère attire des échanges sincères. Décrivez qui vous êtes aujourd'hui, pas une version idéalisée. Mentionnez vos projets concrets, vos valeurs et ce que vous attendez de votre futur(e) conjoint(e).

> La compatibilité ne se décrète pas : elle se découvre, avec patience, à travers des échanges respectueux.

Une fois ces questions clarifiées, vos préférences de recherche deviendront presque évidentes — et vos conversations bien plus riches.`,
  },
  {
    slug: "comprendre-la-compatibilite",
    title: "Comprendre la compatibilité : au-delà des critères",
    excerpt: "Âge, ville, profession… Les critères aident à trier. Mais la compatibilité réelle repose sur des valeurs et une vision partagées.",
    category: "COMPATIBILITE",
    authorName: "L'équipe éditoriale",
    daysAgo: 8,
    seoDescription: "Ce qui fait réellement la compatibilité d'un couple : valeurs, projet de vie, communication et vision de la famille.",
    content: `Les critères de recherche sont utiles pour orienter les rencontres, mais ils ne suffisent pas à définir une compatibilité durable.

## Les trois piliers de la compatibilité
1. **Les valeurs** : honnêteté, foi, respect, générosité… Ce sont elles qui guident les décisions du quotidien.
2. **Le projet de vie** : enfants, lieu de vie, rythme professionnel, place de la famille.
3. **La manière de communiquer** : savoir exprimer un désaccord, écouter, demander pardon.

## Comment fonctionne notre score
Notre algorithme compare vos réponses dans dix dimensions (projet matrimonial, valeurs, famille, enfants, langues, géographie…) et calcule une compatibilité **dans les deux sens** : un score n'est élevé que s'il l'est pour les deux personnes. Chaque suggestion est accompagnée des raisons principales de la compatibilité.

## Ce que le score ne dit pas
Le score mesure la proximité de vos réponses. Il ne mesure ni le caractère, ni la sincérité, ni la qualité d'une relation. Utilisez-le comme un point de départ pour la conversation, jamais comme une garantie.

## Les bonnes questions à aborder tôt
- Comment imaginez-vous une journée ordinaire dans votre foyer ?
- Quelle place pour la famille de chacun ?
- Comment gérez-vous les finances du ménage ?
- Quelles sont vos attentes concernant la pratique religieuse au quotidien ?

Aborder ces sujets avec bienveillance, dès les premiers échanges, évite bien des malentendus.`,
  },
  {
    slug: "premiers-echanges-communication",
    title: "Premiers échanges : communiquer avec respect et clarté",
    excerpt: "Le premier message donne le ton. Quelques principes simples pour des échanges dignes, sincères et constructifs.",
    category: "COMMUNICATION",
    authorName: "L'équipe éditoriale",
    daysAgo: 14,
    seoDescription: "Conseils pour réussir ses premiers échanges sur une plateforme de rencontre musulmane : respect, clarté et sincérité.",
    content: `Lorsque l'intérêt est réciproque, une conversation s'ouvre. Ces premiers échanges sont précieux : ils permettent de vérifier que la compatibilité déclarée se confirme dans la manière d'être.

## Commencer simplement
Un salut, une référence à un élément du profil qui vous a touché, une question ouverte. Inutile d'en faire trop : la sincérité se ressent.

## Poser des questions qui comptent
Privilégiez les questions sur les valeurs et le projet de vie plutôt que sur l'apparence. Écoutez les réponses avec attention et relancez sur ce qui est important pour l'autre.

## Respecter le rythme de chacun
Certaines personnes répondent vite, d'autres prennent le temps de réfléchir. Ne multipliez pas les messages en l'absence de réponse.

## Savoir dire non avec élégance
Si vous sentez que la compatibilité n'est pas au rendez-vous, il est respectueux de le dire simplement, ou de clôturer l'échange. La plateforme permet de **clôturer** une conversation avec discrétion.

## Les limites à ne pas franchir
- Aucun propos déplacé ou insistant.
- Aucune demande d'argent ni d'informations bancaires.
- Aucune pression pour quitter la plateforme ou partager vos coordonnées.

En cas de doute, utilisez le bouton **Signaler** : notre équipe examine chaque signalement.`,
  },
  {
    slug: "impliquer-sa-famille",
    title: "Impliquer sa famille dans sa démarche matrimoniale",
    excerpt: "Le rôle du wali, des parents ou d'un accompagnateur : comment et quand associer ses proches à la rencontre.",
    category: "FAMILLE",
    authorName: "L'équipe éditoriale",
    daysAgo: 21,
    seoDescription: "Pourquoi et comment impliquer sa famille, un tuteur ou un wali dans la recherche d'un conjoint en ligne.",
    content: `Dans de nombreuses familles musulmanes, le mariage est une affaire qui concerne aussi les proches. Associer sa famille n'est pas une contrainte : c'est souvent une protection et une source de sagesse.

## Pourquoi associer un proche ?
- Un regard extérieur et bienveillant sur la compatibilité.
- Une protection contre les comportements malhonnêtes.
- Une transition naturelle vers la rencontre des familles.

## Qui peut jouer ce rôle ?
Un parent, un frère ou une sœur, un oncle, un tuteur (wali), ou toute personne de confiance que vous choisissez.

## Comment faire sur NIKAH CONNECT
Dans **Paramètres › Personne de confiance**, déclarez votre proche. Seule la mention « souhaite impliquer une personne de confiance » apparaît sur votre profil. Ses coordonnées restent privées : vous pouvez les partager en un clic, depuis une conversation, lorsque vous le jugez opportun.

## Le bon moment
Il n'y a pas de règle unique. Certaines personnes préfèrent impliquer leur famille dès le premier échange ; d'autres après quelques conversations sérieuses. L'essentiel est que les deux personnes soient informées de cette démarche et la respectent.`,
  },
  {
    slug: "vie-conjugale-premieres-annees",
    title: "Les premières années de vie conjugale : bâtir sur des bases solides",
    excerpt: "Communication, répartition des rôles, gestion des désaccords : quelques repères pour bien commencer.",
    category: "VIE_CONJUGALE",
    authorName: "L'équipe éditoriale",
    daysAgo: 30,
    seoDescription: "Repères pour les premières années de mariage : communication, partage des responsabilités et gestion des désaccords.",
    content: `Le mariage n'est pas une fin, c'est un commencement. Les premières années posent les habitudes qui accompagneront le couple longtemps.

## Prendre soin de la communication
Réservez des moments pour parler de ce qui va bien, et de ce qui pourrait aller mieux. Une petite discussion régulière évite l'accumulation de non-dits.

## Clarifier les responsabilités
Qui gère quoi au quotidien ? Les finances, les tâches, les relations avec les familles… En parler explicitement évite les attentes implicites.

## Gérer les désaccords
- Parler du problème, pas de la personne.
- Choisir le bon moment, au calme.
- Savoir reconnaître ses torts et pardonner.

## Préserver sa foi ensemble
Partager des moments spirituels — une lecture, une prière, une action de bienfaisance — nourrit le lien et donne un sens commun au foyer.

> « Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles, et Il a mis entre vous de l'affection et de la bonté. » (Coran 30:21)`,
  },
  {
    slug: "reconnaitre-une-arnaque-sentimentale",
    title: "Reconnaître et éviter une arnaque sentimentale",
    excerpt: "Les escrocs exploitent la sincérité. Voici les signaux d'alerte et les bons réflexes pour vous protéger.",
    category: "SECURITE_EN_LIGNE",
    authorName: "L'équipe sécurité",
    daysAgo: 5,
    seoDescription: "Signaux d'alerte d'une arnaque sentimentale en ligne et bons réflexes : ne jamais envoyer d'argent, signaler, bloquer.",
    content: `Les arnaques sentimentales visent des personnes sincères. Elles suivent presque toujours le même schéma. Les connaître, c'est déjà s'en protéger.

## Les signaux d'alerte
- Des déclarations d'affection très rapides et intenses.
- Une volonté pressante de quitter la plateforme pour une messagerie externe.
- Une histoire difficile : maladie, accident, blocage à la douane, frais de visa ou de billet d'avion.
- Une demande d'argent, de carte cadeau, de recharge, de cryptomonnaie ou de codes bancaires.
- Le refus de tout appel vidéo ou de toute implication de la famille.

## Les règles d'or
- **Ne transférez jamais d'argent** à une personne rencontrée sur la plateforme, quelle que soit l'histoire.
- **Ne communiquez jamais** vos informations bancaires ni vos codes.
- Gardez vos échanges sur la plateforme tant que la confiance n'est pas établie.
- Parlez-en à un proche : un regard extérieur aide à garder la tête froide.

## Ce que fait la plateforme
Nos outils détectent automatiquement les messages évoquant des transferts d'argent, des informations bancaires ou des liens suspects, ainsi que les envois massifs. Ces signaux sont examinés par notre équipe de modération.

## Que faire en cas de doute ?
Utilisez le bouton **Signaler** sur le profil ou le message concerné, puis **bloquez** la personne. Si vous avez déjà envoyé de l'argent, contactez votre banque et les autorités compétentes.`,
  },
  {
    slug: "reussir-son-profil",
    title: "Rencontres musulmanes en ligne : réussir son profil",
    excerpt: "Une présentation sincère, des préférences claires et une photo pudique : les clés d'un profil qui inspire confiance.",
    category: "RENCONTRES_MUSULMANES",
    authorName: "L'équipe éditoriale",
    daysAgo: 11,
    seoDescription: "Conseils pour rédiger un profil sincère sur un site de rencontre musulmane sérieuse et inspirer confiance.",
    content: `Votre profil est la première impression que vous donnez. Sur une plateforme orientée mariage, ce sont la sincérité et la clarté qui font la différence.

## Une présentation qui vous ressemble
Parlez de votre personnalité, de ce qui vous anime, de votre quotidien. Quelques lignes authentiques valent mieux qu'une longue liste de qualités.

## Des valeurs explicites
Choisissez les valeurs qui comptent vraiment pour vous. Elles sont prises en compte dans le calcul de compatibilité et aident les autres membres à vous comprendre.

## Un projet clair
Indiquez votre horizon pour le mariage, votre souhait d'enfants et votre lieu de vie souhaité. Cela évite des échanges qui n'auraient pas d'avenir.

## Une photo pudique (facultative)
La photo n'est pas obligatoire. Si vous en ajoutez une, choisissez-la récente et pudique. Vous décidez qui peut la voir : tous les membres connectés, ou uniquement en cas de compatibilité mutuelle.

## Faire vérifier son profil
Les badges **E-mail vérifié**, **Téléphone vérifié** et **Profil vérifié** rassurent les membres et leurs familles. La vérification d'identité est rapide et vos documents sont supprimés après examen.`,
  },
  {
    slug: "parler-des-enfants-avant-le-mariage",
    title: "Parler des enfants avant le mariage",
    excerpt: "Souhait d'enfants, enfants d'une précédente union, éducation : un sujet essentiel à aborder tôt et avec délicatesse.",
    category: "FAMILLE",
    authorName: "L'équipe éditoriale",
    daysAgo: 40,
    seoDescription: "Comment aborder le sujet des enfants avant le mariage : souhait, famille recomposée, éducation et valeurs.",
    content: `Le projet d'enfants est l'un des sujets les plus importants à aborder avant de s'engager. Il touche à la vision du foyer, à l'organisation et aux valeurs.

## Le souhait d'enfants
Souhaitez-vous des enfants ? Combien, et à quel horizon ? Un écart important sur ce point est l'une des premières causes d'incompatibilité.

## Les familles recomposées
Si l'un de vous a déjà des enfants, parlez ouvertement de leur place dans le futur foyer, de la relation avec l'autre parent et du rôle de chacun. La bienveillance envers les enfants est un signe fort de maturité.

## L'éducation
Langues transmises, scolarité, éducation religieuse, place des grands-parents : autant de sujets qui gagnent à être évoqués avant le mariage.

## Avancer ensemble
Il est normal de ne pas avoir toutes les réponses. L'important est de partager une même direction et la volonté d'en discuter avec respect.`,
  },
];
