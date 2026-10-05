# ---- Image de production NIKAH CONNECT ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY database ./database
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/* \
  && groupadd -r app && useradd -r -g app app
COPY --from=build /app ./
RUN mkdir -p /data/storage && chown -R app:app /data/storage
ENV STORAGE_DIR=/data/storage
USER app
EXPOSE 3000
# Applique les migrations puis démarre le serveur
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p 3000"]
