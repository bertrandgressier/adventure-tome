# 🗡️ Adventure Tome - Le Jeu Dont Tu Es Le Héro

Application PWA mobile pour gérer vos personnages des livres "Le jeu dont tu es le héro" de la collection [La Saga de Dagda](https://www.lasagadedagda.fr/).

## 📖 Description

Adventure Tome est votre compagnon mobile pour vivre vos aventures épiques ! Créez et gérez vos héros, suivez votre progression, lancez les dés, combattez des créatures et explorez les mondes fantastiques des livres dont vous êtes le héro.

**Première implémentation** : La Harpe des Quatre Saisons

## ✨ Fonctionnalités

### 🎭 Gestion des personnages
- ✓ Créer et personnaliser vos héros
- ✓ Suivre Habileté, Endurance, Chance
- ✓ Gérer inventaire (or, provisions, équipement)
- ✓ Importer/Exporter vos personnages

### ⚔️ Système de jeu
- ✓ Combats automatisés avec calculs
- ✓ Lancer de dés (1 ou 2 dés)
- ✓ Sauvegarder votre position (paragraphe)
- ✓ Bloc-notes pour vos indices

### 📱 PWA Mobile
- ✓ Installation sur écran d'accueil
- ✓ Fonctionne hors ligne
- ✓ Stockage local (pas de serveur)
- ✓ Interface optimisée mobile
- ✓ Thème heroic fantasy

## 🛠️ Technologies

- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling avec theming
- **shadcn/ui** - Composants UI
- **IndexedDB** - Stockage local

## 📋 Prérequis

- Node.js 18+ 
- pnpm (recommandé)

## 🛠️ Installation

```bash
# Installer les dépendances
pnpm install
```

## 🎯 Démarrage

```bash
# Mode développement
pnpm dev

# Build production
pnpm build
pnpm start
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📱 Installation PWA

### Sur Android (Chrome, Edge)
1. Ouvrez l'application dans Chrome/Edge
2. Cliquez sur le bouton "Installer" qui apparaît
3. Ou utilisez le menu ⋮ → "Installer l'application"

### Sur iOS (Safari)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton Partager ⎋
3. Sélectionnez "Sur l'écran d'accueil" ➕
4. Confirmez l'installation

## 📁 Structure du projet

```
adventure-tome/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Page d'accueil
│   ├── manifest.ts             # Configuration PWA
│   ├── globals.css             # Styles + thème
│   ├── characters/             # Gestion personnages
│   ├── adventure/              # Aventure (combat, dés, notes)
│   └── components/             # Composants réutilisables
│       ├── ui/                 # shadcn/ui components
│       ├── character/          # Composants personnage
│       └── adventure/          # Composants aventure
├── lib/
│   ├── storage/                # Stockage local (IndexedDB)
│   ├── game/                   # Logique de jeu
│   ├── utils/                  # Utilitaires
│   └── types/                  # Types TypeScript
├── public/
│   ├── icons/                  # Icônes PWA
│   └── manifest.json           # Manifest statique
├── docs/                       # Documentation
│   ├── FEATURES.md             # Liste des fonctionnalités
│   ├── ARCHITECTURE.md         # Architecture technique
│   ├── CHARACTER_SHEET.md      # Structure fiche personnage
│   ├── THEMING.md              # Guide du thème
│   └── DEPLOYMENT.md           # Guide de déploiement
└── package.json
```

## 🔧 Technologies utilisées

- **Next.js** 16.0.1 - Framework React
- **React** 19.2.0 - Bibliothèque UI
- **TypeScript** 5 - Langage typé
- **Tailwind CSS** 4 - Framework CSS
- **Turbopack** - Build tool
- **ESLint** - Linter

## 📝 Configuration PWA

Le fichier `app/manifest.ts` configure les paramètres PWA :
- Nom de l'application
- Icônes (192x192, 512x512)
- Mode d'affichage (standalone)
- Couleurs du thème
- Orientation (portrait)

## 🎨 Personnalisation

### Modifier les icônes
Remplacez les fichiers dans `public/` :
- `icon-192x192.svg`
- `icon-512x512.svg`
- `apple-touch-icon.png`

### Modifier les couleurs
Dans `app/manifest.ts` et `public/manifest.json` :
```typescript
theme_color: "#000000"     // Couleur de la barre d'état
background_color: "#ffffff" // Couleur de fond au démarrage
```

## 📦 Build et déploiement

```bash
# Build pour production
pnpm build

# Démarrer en production
pnpm start
```
## 📖 Documentation

### Documentation projet
- [📋 Fonctionnalités](./docs/FEATURES.md) - Liste complète des features
- [🏗️ Architecture](./docs/ARCHITECTURE.md) - Structure technique
- [📝 Fiche personnage](./docs/CHARACTER_SHEET.md) - Format et règles
- [⚔️ Système de combat](./docs/COMBAT.md) - Règles et mécaniques de combat
- [🎨 Theming](./docs/THEMING.md) - Design system et thème
- [🚀 Déploiement](./docs/DEPLOYMENT.md) - Guide de mise en production

### Ressources externes
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [La Saga de Dagda](https://www.lasagadedagda.fr/)on)](https://vercel.com/new)

## ☕ Soutenir le projet

Ce projet est **100% gratuit et open-source**. Si ce projet vous est utile ou si vous voulez soutenir ce jeu, vous pouvez m'offrir un café ☕

[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/donate/?hosted_button_id=Q5EPDFZEEXQHJ)

Merci pour votre soutien ! ❤️

## 🧪 Tests

```bash
# Linter
pnpm lint
```

## 📖 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licence

MIT
