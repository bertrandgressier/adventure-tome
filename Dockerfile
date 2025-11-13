# Utiliser Node 24 Alpine pour une image légère
FROM node:24-alpine AS base

# Installer pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Étape 1: Installer les dépendances
FROM base AS deps
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances en mode production
RUN pnpm install --frozen-lockfile --prod=false

# Étape 2: Builder l'application
FROM base AS builder
WORKDIR /app

# Copier les dépendances depuis l'étape deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Désactiver la télémétrie Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Builder l'application
RUN pnpm build

# Étape 3: Runner (production)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
