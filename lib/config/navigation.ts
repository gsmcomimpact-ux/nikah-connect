export const MAIN_NAV = [
  { href: "/", label: "Accueil" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/profils", label: "Profils" },
  { href: "/temoignages", label: "Témoignages" },
  { href: "/conseils", label: "Conseils" },
  { href: "/a-propos", label: "À propos" },
] as const;

export const FOOTER_NAV = {
  plateforme: [
    { href: "/comment-ca-marche", label: "Comment ça marche" },
    { href: "/pourquoi-nous", label: "Pourquoi nous" },
    { href: "/profils", label: "Profils" },
    { href: "/tarifs", label: "Offres" },
    { href: "/conseils", label: "Conseils" },
    { href: "/rencontre-musulmane", label: "Rencontres par pays" },
  ],
  confiance: [
    { href: "/securite", label: "Sécurité" },
    { href: "/regles-communautaires", label: "Règles communautaires" },
    { href: "/contact", label: "Contact" },
    { href: "/a-propos", label: "À propos" },
  ],
  legal: [
    { href: "/conditions-generales", label: "Conditions générales d'utilisation" },
    { href: "/confidentialite", label: "Politique de confidentialité" },
    { href: "/cookies", label: "Politique de cookies" },
    { href: "/donnees-personnelles", label: "Gestion des données personnelles" },
    { href: "/suppression-de-compte", label: "Suppression de compte" },
  ],
} as const;

export const APP_NAV = [
  { href: "/espace", label: "Tableau de bord", icon: "home" },
  { href: "/espace/compatibilites", label: "Mes compatibilités", icon: "sparkles" },
  { href: "/espace/recherche", label: "Recherche", icon: "search" },
  { href: "/espace/demandes", label: "Mes demandes", icon: "heart-handshake" },
  { href: "/espace/messages", label: "Mes conversations", icon: "messages" },
  { href: "/espace/favoris", label: "Mes favoris", icon: "star" },
  { href: "/espace/notifications", label: "Notifications", icon: "bell" },
  { href: "/espace/profil", label: "Mon profil", icon: "user" },
  { href: "/espace/parametres", label: "Paramètres", icon: "settings" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/signalements", label: "Signalements" },
  { href: "/admin/verifications", label: "Vérifications" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/messages", label: "Messages signalés" },
  { href: "/admin/blog", label: "Contenus (blog)" },
  { href: "/admin/abonnements", label: "Abonnements" },
  { href: "/admin/contact", label: "Messages de contact" },
  { href: "/admin/journal", label: "Journal d'audit" },
  { href: "/admin/parametres", label: "Paramètres du site" },
] as const;
