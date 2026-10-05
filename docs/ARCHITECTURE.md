# Architecture technique — NIKAH CONNECT

## 1. Analyse des besoins (résumé)
- **Utilisateurs** : personnes musulmanes majeures recherchant un(e) conjoint(e) ; familles/walis associés ; modérateurs et administrateurs.
- **Principes** : sérieux (mariage), pudeur (photo secondaire, contrôlée), sécurité (vérification, anti-arnaque, modération), vie privée (aucune coordonnée affichée, minimisation), transparence (score expliqué, sans promesse).
- **Contraintes** : mobile d'abord, SEO, déploiement simple, évolutivité (paiement, e-mail/SMS, stockage objet).

## 2. Choix techniques
| Besoin | Choix | Raison |
|---|---|---|
| Front + back | Next.js 16 App Router, Server Components & Server Actions | Un seul déploiement Node.js, rendu serveur (SEO, performances), mutations typées |
| Données | PostgreSQL + Prisma | Relations fortes, index GIN pour tableaux (langues, valeurs), migrations versionnées |
| Validation | Zod | Schémas partagés, messages en français |
| Styles | Tailwind 4 + variables CSS de marque | Thème modifiable depuis `lib/config/site.ts` |
| Auth | Sessions en base (pas de JWT) | Révocation immédiate (déconnexion des appareils, bannissement) |
| Images | sharp | Ré-encodage WebP, suppression EXIF/GPS, limite de pixels |

## 3. Parcours utilisateur
```
Accueil → Inscription (étape 1 : compte) → Étapes 2-5 (profil, religion facultative, projet, préférences)
→ Tableau de bord (« prochaine étape recommandée ») → Compatibilités / Recherche
→ Demande (Intéressé(e)) → Compatibilité mutuelle → Conversation → (personne de confiance) → Rencontre sérieuse
```
`lib/profile/next-action.ts` calcule à chaque visite la prochaine action conseillée (confirmer l'e-mail, se présenter, photo, répondre aux demandes, vérifier son identité, découvrir des profils).

## 4. Routes principales
| Zone | Routes |
|---|---|
| Public | `/`, `/comment-ca-marche`, `/profils`, `/temoignages`, `/conseils`, `/conseils/[slug]`, `/conseils/categorie/[cat]`, `/a-propos`, `/pourquoi-nous`, `/tarifs`, `/securite`, `/contact`, `/rencontre-musulmane`, `/rencontre-musulmane-[pays]` (réécriture), pages légales |
| Auth | `/inscription`, `/inscription/etape/[2-5]`, `/connexion`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`, `GET /api/auth/verify-email` |
| Membre | `/espace`, `/espace/compatibilites`, `/espace/recherche`, `/espace/demandes`, `/espace/messages[/id]`, `/espace/favoris`, `/espace/notifications`, `/espace/membres/[id]`, `/espace/profil[/preferences]`, `/espace/parametres/*`, `/espace/abonnement` |
| Admin | `/admin`, `/admin/utilisateurs[/id]`, `/admin/signalements`, `/admin/verifications`, `/admin/photos`, `/admin/messages`, `/admin/blog[/id]`, `/admin/abonnements`, `/admin/contact`, `/admin/journal`, `/admin/parametres` |
| API | `/api/media/photo/[id]`, `/api/media/attachment/[id]`, `/api/messages/[id]`, `/api/notifications/summary`, `/api/account/export`, `/api/admin/verification/[id]/[kind]`, `/api/billing/webhook` |

Les mutations passent par des **Server Actions** (`lib/actions/*`), chacune revérifiant l'authentification et les droits.

## 5. Modèle de données
Tables (snake_case) : `users`, `sessions`, `verification_tokens`, `profiles`, `photos`, `preferences`, `interests`, `profile_interests`, `likes`, `matches`, `conversations`, `conversation_participants`, `messages`, `message_attachments`, `notifications`, `reports`, `blocks`, `favorites`, `profile_views`, `verification_requests`, `trusted_contacts`, `subscriptions`, `payments`, `blog_posts`, `contact_messages`, `admin_users`, `audit_logs`, `site_settings`, `rate_limits`.

Points clés :
- `likes` : une ligne par paire orientée (INTEREST/PASS + statut PENDING/ACCEPTED/DECLINED/WITHDRAWN).
- `matches` : paire ordonnée (`user_a_id < user_b_id`), unique ; une `conversation` par match.
- Index : `(gender, is_visible, date_of_birth)`, `(gender, country, city)`, GIN sur `languages` et `values`, `(to_user_id, type, status)`, `(conversation_id, created_at)`, `(status, created_at)` sur reports…
- `admin_users` sépare les privilèges des comptes membres ; rôles MODERATOR < ADMIN < SUPER_ADMIN.

## 6. Moteur de compatibilité (`lib/matching/engine.ts`)
Module pur, testé (`tests/matching.test.ts`).

| Dimension | Poids | Calcul (direction A → B) |
|---|---|---|
| Projet matrimonial | 16 | recherche du mariage + proximité d'horizon |
| Valeurs | 15 | Jaccard des valeurs + écart de place de la religion, pondéré par l'importance que A accorde à la compatibilité religieuse |
| Géographie | 12 | même ville / pays / ouverture à l'expatriation, pays préférés, distance max |
| Âge | 12 | dans la tranche préférée, décroissance hors tranche |
| Enfants | 12 | souhait d'enfants, acceptation d'enfants existants |
| Famille | 10 | valeurs familiales + compatibilité du lieu de vie |
| Langues | 7 | langues communes / préférées |
| Préférences déclarées | 6 | situation matrimoniale, ville, profils vérifiés |
| Études | 5 | niveau minimum ou proximité |
| Centres d'intérêt | 5 | Jaccard |

Score final = **moyenne géométrique** des deux scores directionnels → élevé seulement si la compatibilité est réciproque. Les raisons affichées sont dérivées du détail. Le boost Premium ne modifie jamais le score : il ne sert qu'à départager l'ordre.

Pipeline : pré-filtrage SQL (sexe opposé, actif, visible, e-mail vérifié, inscription terminée, non bloqué, tranche d'âge élargie, profils non déjà traités) → 400 candidats max → scoring en mémoire → tri. Pour de très gros volumes : pré-calculer les scores en tâche de fond dans une table dédiée.

## 7. Sécurité
| Menace | Mesure |
|---|---|
| Vol de mot de passe | bcrypt (coût 12), politique de mot de passe, verrouillage 15 min après 5 échecs, alerte e-mail |
| Vol de session | jeton aléatoire 256 bits, seul son SHA-256 en base, cookie `__Host-` httpOnly/Secure/SameSite=Lax, expiration glissante, révocation par appareil |
| CSRF | SameSite + vérification `Origin`/`Sec-Fetch-Site` dans `proxy.ts` pour toute requête non-GET + contrôle natif des Server Actions |
| XSS | échappement React, rendu Markdown sans HTML brut, CSP stricte (`frame-ancestors 'none'`, `object-src 'none'`…) |
| Injection SQL | Prisma (requêtes paramétrées), requêtes brutes via gabarits paramétrés |
| Abus / robots | rate limiting PostgreSQL (connexion, inscription, messages, signalements, OTP, uploads, contact), Turnstile, pot de miel |
| Énumération de comptes | messages génériques, temps de réponse égalisé |
| Open redirect | `safeRedirectPath` |
| Fichiers malveillants | vérification de la signature binaire, ré-encodage, taille max, stockage hors `public/`, accès contrôlé |
| Documents d'identité | AES-256-GCM au repos, dossier séparé, accès ADMIN uniquement, chaque consultation journalisée, suppression après décision |
| Arnaques | `lib/security/scam-detection.ts` + détection de rafales de demandes, d'envois massifs, de multi-comptes par IP → signalements automatiques |
| Traçabilité | `audit_logs` (connexions, modération, accès documents, suppressions), IP hachées (HMAC) |
| RGPD | export JSON, suppression effective, données religieuses facultatives, minimisation (pas d'adresse, centre-ville uniquement) |

## 8. Évolutions prévues
- Paiement : compléter `lib/billing/provider.ts` et le webhook.
- Temps réel : remplacer le rafraîchissement périodique de la messagerie par SSE/WebSocket.
- Stockage objet : réimplémenter `lib/storage/index.ts` (S3/R2).
- Notifications push (Web Push) et SMS transactionnels.
- Internationalisation (anglais, arabe) : les libellés sont déjà centralisés dans `lib/constants/options.ts`.
