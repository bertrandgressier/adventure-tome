# Déploiement - Adventure Tome

## Vue d'ensemble

Guide de déploiement de la PWA "Adventure Tome" sur différentes plateformes.

## Prérequis

- Node.js 18+
- pnpm installé
- Compte sur la plateforme de déploiement

## Build de production

### Commandes

```bash
# Installer les dépendances
pnpm install

# Vérifier le linting
pnpm lint

# Build pour production
pnpm build

# Tester en local
pnpm start
```

### Variables d'environnement

Créer `.env.local` :

```env
# Nom de l'application
NEXT_PUBLIC_APP_NAME="Adventure Tome"

# Version
NEXT_PUBLIC_APP_VERSION="1.0.0"

# URL de base (production)
NEXT_PUBLIC_BASE_URL="https://adventure-tome.vercel.app"

# Analytics (optionnel)
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## Déploiement sur Vercel (recommandé)

### Méthode 1 : Deploy button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/votre-username/adventure-tome)

### Méthode 2 : CLI

```bash
# Installer Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Méthode 3 : Git integration

1. Push votre code sur GitHub/GitLab/Bitbucket
2. Connectez votre repo sur [vercel.com](https://vercel.com)
3. Déploiement automatique à chaque push

### Configuration Vercel

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

## Déploiement sur Netlify

### netlify.toml

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

### Déploiement

```bash
# Installer Netlify CLI
pnpm add -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod
```

## Déploiement sur GitHub Pages

⚠️ **Note** : GitHub Pages ne supporte pas les features serveur de Next.js. Utiliser l'export statique.

### Configuration Next.js

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/adventure-tome', // Nom de votre repo
};
```

### Workflow GitHub Actions

`.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - uses: actions/upload-pages-artifact@v2
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v2
        id: deployment
```

## Déploiement sur serveur VPS

### Prérequis serveur

```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Installer PM2 (process manager)
pnpm add -g pm2
```

### Déploiement

```bash
# Clone le projet
git clone https://github.com/votre-username/adventure-tome.git
cd adventure-tome

# Installer et build
pnpm install
pnpm build

# Démarrer avec PM2
pm2 start pnpm --name "adventure-tome" -- start

# Sauvegarder la config PM2
pm2 save
pm2 startup
```

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name adventure-tome.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d adventure-tome.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

## Configuration PWA

### Service Worker

Le service worker est généré automatiquement. Vérifier dans `public/` :

```javascript
// sw.js (exemple)
const CACHE_NAME = 'adventure-tome-v1';
const urlsToCache = [
  '/',
  '/characters',
  '/adventure',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

### Manifest

Vérifier `public/manifest.json` :

```json
{
  "name": "Adventure Tome",
  "short_name": "AdventureHero",
  "description": "Guide pour livres 'Le jeu dont tu es le héro'",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#eab308",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Tests de production

### Lighthouse CI

```bash
# Installer Lighthouse CI
pnpm add -g @lhci/cli

# Configuration
# .lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm start",
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:pwa": ["error", {"minScore": 0.9}]
      }
    }
  }
}

# Lancer les tests
lhci autorun
```

### Test PWA

```bash
# Tester l'installation PWA
# Chrome DevTools > Application > Manifest
# Vérifier :
# - Manifest valide
# - Service Worker enregistré
# - Icônes présentes
# - Installable
```

## Monitoring

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Google Analytics (optionnel)

```typescript
// lib/analytics.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
```

## Rollback

### Vercel

```bash
# Lister les déploiements
vercel ls

# Promouvoir un déploiement précédent
vercel promote <deployment-url>
```

### PM2

```bash
# Revenir à la version précédente
cd adventure-tome
git pull origin main
pnpm install
pnpm build
pm2 restart adventure-tome
```

## Checklist de déploiement

- [ ] Tests passent localement (`pnpm lint`)
- [ ] Build réussit (`pnpm build`)
- [ ] Variables d'environnement configurées
- [ ] Manifest PWA validé
- [ ] Icônes PWA présentes (192x192, 512x512)
- [ ] Service Worker fonctionnel
- [ ] Lighthouse score > 90 (PWA, Performance, Accessibility)
- [ ] Test installation sur mobile (Android + iOS)
- [ ] Test mode hors ligne
- [ ] Analytics configurés (optionnel)
- [ ] Domain configuré (production)
- [ ] SSL activé (production)
- [ ] Monitoring en place

## Maintenance

### Mises à jour

```bash
# Mettre à jour les dépendances
pnpm update

# Vérifier les vulnérabilités
pnpm audit

# Corriger les vulnérabilités
pnpm audit fix
```

### Backup

```bash
# Exporter la base de données (si applicable)
# Pour cette app : LocalStorage géré côté client

# Backup du code
git push origin main

# Backup des assets
tar -czf backup-assets-$(date +%Y%m%d).tar.gz public/
```

## Support

### Vérifications post-déploiement

1. **PWA installable** : Vérifier sur Android et iOS
2. **Hors ligne** : Désactiver réseau et tester
3. **Performance** : Lighthouse > 90
4. **Fonctionnalités** : Tester toutes les pages
5. **Stockage** : Créer/modifier/supprimer personnages

### Debugging

```bash
# Logs Vercel
vercel logs [deployment-url]

# Logs PM2
pm2 logs adventure-tome

# Logs Netlify
netlify logs
```
