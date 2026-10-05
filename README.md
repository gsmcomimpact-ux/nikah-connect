# NIKAH CONNECT

Plateforme web de rencontre musulmane **sérieuse, orientée mariage** : profils fondés sur les valeurs et le projet de vie, compatibilité réciproque expliquée, échanges uniquement en cas d'intérêt mutuel, personne de confiance (wali), vérification des profils, anti-arnaque, modération et administration.

> Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 · PostgreSQL · Prisma 6

---

## Sommaire
1. [Fonctionnalités](#fonctionnalités)
2. [Installation locale](#installation-locale)
3. [Variables d'environnement](#variables-denvironnement)
4. [Comptes de démonstration](#comptes-de-démonstration)
5. [Scripts](#scripts)
6. [Déploiement](#déploiement)
7. [Personnaliser le nom, le logo, les couleurs](#personnaliser-le-nom-le-logo-les-couleurs)
8. [Architecture](#architecture) (détails dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md))

---

## Fonctionnalités

| Domaine | Ce qui est livré |
|---|---|
| **Site public** | Accueil, Comment ça marche, Profils (aperçu fictif), Témoignages, Conseils (blog SEO), À propos, Pourquoi nous, Offres, Sécurité, Contact, pages locales `/rencontre-musulmane-<pays>` |
| **Inscription** | 5 étapes (compte → informations → profil religieux facultatif → projet matrimonial → préférences), sauvegarde progressive, CAPTCHA optionnel |
| **Profils** | Présentation, valeurs, projet, famille, centres d'intérêt, photos modérées (EXIF/GPS supprimés), visibilité des photos au choix, mise en pause, badges E-mail / Téléphone / Identité vérifiés |
| **Matching** | Score réciproque sur 10 dimensions, « Pourquoi cette compatibilité ? », détail par dimension, mention explicite que le score ne garantit rien |
| **Recherche** | Âge, pays, ville, distance, situation, enfants, profession, études, langues, valeurs, projet, préférences familiales, profils vérifiés, tri ; filtres avancés réservés Premium |
| **Demandes** | Intéressé(e) / Passer / Envoyer une demande (avec mot), reçues / envoyées / compatibilités mutuelles, refus discret |
| **Messagerie** | Ouverte seulement après compatibilité mutuelle, non-lus, rafraîchissement auto, blocage, signalement par message, suppression, clôture, images (Premium, après 10 messages), alerte avant partage de coordonnées, anti-spam |
| **Wali / accompagnateur** | Personne de confiance facultative, indicateur sur le profil, partage volontaire des coordonnées en un clic |
| **Notifications** | In-app + notifications navigateur ; e-mail (Resend) et SMS (Twilio) prêts via variables d'environnement |
| **Sécurité** | bcrypt, sessions en base (jeton haché, cookie httpOnly/SameSite), CSRF (vérif. d'origine), CSP & en-têtes, Zod, Prisma (requêtes paramétrées), rate limiting PostgreSQL, verrouillage après échecs, Turnstile, audit log, export & suppression du compte |
| **Anti-arnaque** | Détection argent / banque / liens / coordonnées, demandes massives, envois massifs, multi-comptes par IP → signalements automatiques |
| **Modération / Admin** | Statistiques, utilisateurs (suspendre, bannir, vérifier, offrir Premium, rôles), signalements avec contexte, vérifications d'identité (documents chiffrés, supprimés après décision), photos, messages signalés, blog, abonnements, contact, journal d'audit, paramètres |
| **Abonnements** | Freemium (quotas dans `lib/billing/plans.ts`), intégration Stripe préparée mais désactivée sans clés |
| **SEO** | Métadonnées, canonical, Open Graph, JSON-LD (Organization, WebSite, FAQ, Article, Breadcrumb), `sitemap.xml`, `robots.txt`, maillage interne |

---

## Installation locale

Prérequis : **Node.js ≥ 20.9**, **PostgreSQL ≥ 14**.

```bash
# 1. Dépendances
npm install

# 2. Base de données (exemple)
createuser -P nikah            # mot de passe : nikah_dev_password
createdb -O nikah nikah_connect

# 3. Configuration
cp .env.example .env           # puis ajustez DATABASE_URL et les secrets

# 4. Schéma + données de démonstration
npx prisma migrate deploy
npm run db:seed

# 5. Lancement
npm run dev                    # http://localhost:3000
```

En développement, les e-mails (confirmation, réinitialisation) et SMS sont **affichés dans le terminal** (`EMAIL_PROVIDER=console`).

---

## Variables d'environnement

Toutes sont documentées dans [`.env.example`](.env.example). Aucune clé n'est écrite dans le code.

| Variable | Obligatoire | Rôle |
|---|---|---|
| `DATABASE_URL` | ✅ | Connexion PostgreSQL |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | ✅ | URL publique (liens d'e-mails, SEO, sitemap) |
| `IP_HASH_SECRET` | ✅ prod | Sel HMAC des IP journalisées (`openssl rand -hex 32`) |
| `DOCUMENT_ENCRYPTION_KEY` | ✅ prod | Clé AES-256 (64 hex) des pièces d'identité (`openssl rand -hex 32`) — **à sauvegarder** : sans elle, les documents en attente sont illisibles |
| `STORAGE_DIR` | ✅ prod | Dossier privé persistant des photos/documents |
| `EMAIL_PROVIDER`, `EMAIL_FROM`, `RESEND_API_KEY` | — | Envoi d'e-mails via Resend (`console` par défaut) |
| `SMS_PROVIDER`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | — | Codes SMS via Twilio (`console` par défaut) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | recommandé | CAPTCHA Cloudflare Turnstile (inscription, contact) |
| `PAYMENT_PROVIDER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM_MONTHLY` | — | Paiement (désactivé tant que non renseigné ; webhook à finaliser dans `app/api/billing/webhook/route.ts`) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | seed | Compte super-administrateur créé par `npm run db:seed` |

---

## Comptes de démonstration

Créés par `npm run db:seed`. **Tous les profils sont fictifs** (`is_demo = true`, présentation préfixée « Profil fictif de démonstration »).

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Super-admin | `SEED_ADMIN_EMAIL` (défaut `admin@nikah-connect.local`) | `SEED_ADMIN_PASSWORD` |
| Membre (Premium, avec demandes et conversation) | `membre.demo@demo.nikah-connect.local` | `Demo-Nikah-2026` |
| Autres profils | `<prenom>@demo.nikah-connect.local` (amina, ibrahim, mariam…) | `Demo-Nikah-2026` |

⚠️ En production, changez le mot de passe admin et supprimez les profils de démonstration (Admin › Utilisateurs, recherche « demo.nikah-connect »), ou n'exécutez pas le seed.

---

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires (matching, anti-arnaque, validation) |
| `npm run db:migrate` | Nouvelle migration (développement) |
| `npm run db:deploy` | Appliquer les migrations (production) |
| `npm run db:seed` | Données de démonstration |

---

## Déploiement

### Option A — Docker (serveur VPS)
```bash
cp .env.example .env     # renseigner APP_URL, NEXT_PUBLIC_APP_URL, secrets, POSTGRES_PASSWORD
docker compose up -d --build
docker compose exec app npx tsx database/seed.ts   # facultatif : admin + démo
```
Placez un reverse proxy HTTPS (Caddy, Nginx, Traefik) devant le port 3000 ; il doit transmettre `Host` et `X-Forwarded-For`. Le volume `storage` contient photos et documents : sauvegardez-le avec la base.

### Option B — Node.js + PostgreSQL managé
```bash
npm ci
npm run build
npm run db:deploy
npm start          # derrière un reverse proxy HTTPS (pm2 / systemd recommandé)
```
`STORAGE_DIR` doit pointer vers un disque persistant. Sur une plateforme sans disque persistant (serverless), remplacez l'implémentation de `lib/storage/index.ts` par un stockage objet (S3, R2…) — l'interface est volontairement réduite.

### Check-list de mise en production
- [ ] HTTPS actif, `APP_URL` en `https://`
- [ ] `IP_HASH_SECRET` et `DOCUMENT_ENCRYPTION_KEY` générés et sauvegardés hors serveur
- [ ] Fournisseur e-mail configuré (`EMAIL_PROVIDER=resend`)
- [ ] Turnstile configuré
- [ ] Mot de passe admin changé, profils de démo retirés
- [ ] Pages légales complétées (éléments entre `[crochets]` dans `lib/content/legal.ts`) et relues par un juriste
- [ ] Témoignages illustratifs remplacés par de vrais témoignages consentis (`lib/content/marketing.ts`)
- [ ] Sauvegardes PostgreSQL + volume de stockage

---

## Personnaliser le nom, le logo, les couleurs

Tout est centralisé dans **`lib/config/site.ts`** :
- `name`, `shortName`, `tagline`, `description`, `contactEmail` ;
- `logoUrl` : chemin d'une image dans `public/` (sinon le logo vectoriel intégré est utilisé) ;
- `colors` : injectées en variables CSS et exposées à Tailwind (`bg-primary`, `text-gold`, `bg-cream`…).

L'icône du navigateur est `app/icon.svg`. Quotas et prix : `lib/billing/plans.ts`. Pays/villes et pages locales : `lib/constants/geo.ts`.

---

## Architecture

```
app/                 Routes (App Router)
  (site)/            Pages publiques, inscription, connexion, légal, blog, SEO local
  espace/            Espace membre (tableau de bord, compatibilités, messages…)
  admin/             Administration & modération
  api/               Routes API (médias protégés, messages, export, vérification, webhook)
components/          Composants réutilisables (ui, brand, layout, profile, messages, admin…)
lib/                 Logique serveur
  auth/              Sessions, mots de passe, jetons, gardes d'accès
  matching/          Moteur de compatibilité (pur, testé), candidats, demandes
  messages/          Messagerie et anti-abus
  notifications/     Service + canaux e-mail/SMS
  profile/           Requêtes, visibilité, complétude, relations
  security/          Rate limiting, CAPTCHA, chiffrement, anti-arnaque, nettoyage
  blog/ seo/ billing/ storage/ admin/ account/ actions/ (Server Actions) …
database/            schema.prisma, migrations, seed (données fictives)
docs/                Documentation technique
tests/               Tests unitaires (Vitest)
proxy.ts             Protection CSRF + redirection des espaces privés
```

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour les parcours, les règles de sécurité, l'algorithme de matching et le modèle de données.
