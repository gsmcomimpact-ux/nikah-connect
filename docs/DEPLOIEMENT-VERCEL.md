# Déployer NIKAH CONNECT sur Vercel

Le projet est prêt pour Vercel :
- **Build** : le script `vercel-build` (scripts/vercel-build.sh) génère Prisma, applique les migrations, initialise les données si demandé, puis construit Next.js.
- **Fichiers** : sur Vercel, photos et pièces d'identité sont stockées dans PostgreSQL (table `stored_files`, pièces d'identité chiffrées), car le disque n'est pas persistant.
- **Envois** : les images sont compressées dans le navigateur pour respecter la limite de 4,5 Mo par requête.
- **Région** : `fra1` (Francfort), dans `vercel.json`. Créez la base dans la même région.

## 1. Créer la base PostgreSQL
Le plus simple : dans Vercel, **Storage › Create Database › Neon (Postgres)**, région **Frankfurt (eu-central-1)**, puis reliez-la au projet. Vercel ajoute automatiquement `DATABASE_URL` et `DATABASE_URL_UNPOOLED`.
(Alternative : Supabase, Railway… — copiez alors l'URL de connexion dans `DATABASE_URL`.)

## 2. Importer le projet
1. https://vercel.com/new → **Import Git Repository** → `gsmcomimpact-ux/nikah-connect`.
2. Framework : Next.js (détecté). Ne modifiez pas les commandes de build.

## 3. Variables d'environnement (Settings › Environment Variables)
| Variable | Valeur |
|---|---|
| `APP_URL` | `https://<votre-projet>.vercel.app` (puis votre domaine) |
| `NEXT_PUBLIC_APP_URL` | même valeur |
| `IP_HASH_SECRET` | 64 caractères aléatoires (`openssl rand -hex 32`) |
| `DOCUMENT_ENCRYPTION_KEY` | 64 caractères hexadécimaux (`openssl rand -hex 32`) — **gardez-en une copie** |
| `SEED_ON_DEPLOY` | `true` pour le premier déploiement uniquement |
| `SEED_ADMIN_EMAIL` | votre e-mail d'administrateur |
| `SEED_ADMIN_PASSWORD` | un mot de passe fort (12 caractères minimum) |
| `EMAIL_PROVIDER` / `RESEND_API_KEY` / `EMAIL_FROM` | `resend` + clé, pour envoyer les vrais e-mails |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | recommandé (anti-robots) |

Sans fournisseur d'e-mail, les liens de confirmation n'apparaissent que dans les journaux Vercel (Logs).

## 4. Déployer
Cliquez sur **Deploy**. À la fin, connectez-vous avec `SEED_ADMIN_EMAIL` sur `/connexion` puis ouvrez `/admin`.

## 5. Après le premier déploiement
- Passez `SEED_ON_DEPLOY` à `false`.
- Supprimez les profils de démonstration si vous ouvrez au public (Admin › Utilisateurs › recherche « demo.nikah-connect »).
- Ajoutez votre domaine (Settings › Domains) et mettez à jour `APP_URL` / `NEXT_PUBLIC_APP_URL`, puis redéployez.
