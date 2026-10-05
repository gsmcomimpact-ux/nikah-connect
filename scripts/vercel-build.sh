#!/bin/sh
# Build exécuté automatiquement par Vercel (script npm « vercel-build »).
# 1. Génère le client Prisma  2. Applique les migrations  3. (option) données initiales  4. Build Next.js
set -e

npx prisma generate

# Les migrations utilisent une connexion directe si elle est fournie (ex. intégration Neon : DATABASE_URL_UNPOOLED).
DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npx prisma migrate deploy

# SEED_ON_DEPLOY=true : crée le super-admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD), les articles
# de conseils et les profils de démonstration fictifs. Opération idempotente. Repassez à false ensuite.
if [ "$SEED_ON_DEPLOY" = "true" ]; then
  DATABASE_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}" npx tsx database/seed.ts
fi

npx next build
