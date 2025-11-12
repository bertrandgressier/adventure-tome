# Architecture - Adventure Hero

## Stack technique

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling avec theming
- **shadcn/ui** - Composants UI

### PWA
- **Service Worker** - Cache et offline
- **Web App Manifest** - Configuration PWA
- **IndexedDB** - Stockage local structuré

## Structure du projet

```
adventure-hero/
├── app/
│   ├── layout.tsx                 # Layout principal + metadata
│   ├── page.tsx                   # Page d'accueil
│   ├── manifest.ts                # PWA manifest
│   ├── globals.css                # Styles globaux + theme
│   │
│   ├── characters/                # Gestion des personnages
│   │   ├── page.tsx              # Liste des personnages
│   │   ├── new/
│   │   │   └── page.tsx          # Créer un personnage
│   │   └── [id]/
│   │       ├── page.tsx          # Détail personnage
│   │       └── edit/
│   │           └── page.tsx      # Éditer personnage
│   │
│   ├── adventure/                 # Aventure en cours
│   │   ├── page.tsx              # Écran principal aventure
│   │   ├── combat/
│   │   │   └── page.tsx          # Phase de combat
│   │   ├── dice/
│   │   │   └── page.tsx          # Lancer de dés
│   │   └── notes/
│   │       └── page.tsx          # Bloc-notes
│   │
│   └── components/                # Composants réutilisables
│       ├── ui/                    # Composants shadcn/ui
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── input.tsx
│       │   ├── dialog.tsx
│       │   └── ...
│       │
│       ├── character/             # Composants personnage
│       │   ├── CharacterCard.tsx
│       │   ├── CharacterForm.tsx
│       │   ├── StatsDisplay.tsx
│       │   └── InventoryList.tsx
│       │
│       ├── adventure/             # Composants aventure
│       │   ├── CombatInterface.tsx
│       │   ├── DiceRoller.tsx
│       │   ├── ProgressTracker.tsx
│       │   └── NotesEditor.tsx
│       │
│       └── shared/                # Composants partagés
│           ├── Header.tsx
│           ├── Navigation.tsx
│           ├── InstallPrompt.tsx
│           └── ThemeProvider.tsx
│
├── lib/
│   ├── storage/                   # Gestion du stockage
│   │   ├── characters.ts         # CRUD personnages
│   │   ├── progress.ts           # Sauvegarde progression
│   │   └── notes.ts              # Gestion notes
│   │
│   ├── game/                      # Logique de jeu
│   │   ├── combat.ts             # Calculs de combat
│   │   ├── dice.ts               # Lancer de dés
│   │   └── character.ts          # Gestion personnage
│   │
│   ├── utils/                     # Utilitaires
│   │   ├── export.ts             # Import/Export JSON
│   │   ├── validation.ts         # Validation données
│   │   └── format.ts             # Formatage
│   │
│   └── types/                     # Types TypeScript
│       ├── character.ts
│       ├── combat.ts
│       └── game.ts
│
├── public/
│   ├── icons/                     # Icônes PWA
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   │
│   └── manifest.json              # Manifest statique
│
├── docs/                          # Documentation
│   ├── FEATURES.md
│   ├── ARCHITECTURE.md
│   ├── CHARACTER_SHEET.md
│   ├── THEMING.md
│   └── DEPLOYMENT.md
│
└── config/
    └── site.ts                    # Configuration site
```

## Modèles de données

### Character (Personnage)

```typescript
interface Character {
  id: string;
  name: string;
  book: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Attributs de base (selon fiche officielle)
  stats: {
    habilete: number;
    habileteInitiale: number;
    endurance: number;
    enduranceInitiale: number;
    chance: number;
    chanceInitiale: number;
    dexterite: number;  // Score fixe
  };
  
  // Points de vie
  pointsDeVieMaximum: number;
  
  // Inventaire (cases à cocher)
  inventory: {
    items: Array<{
      name: string;
      possessed: boolean;
      attackPoints?: number;  // Points d'attaque pour les armes
      type?: 'weapon' | 'item' | 'special';
    }>;
  };
  
  // Progression
  progress: {
    currentParagraph: number;
    history: number[];
    lastSaved: Date;
  };
  
  // Notes
  notes: string;
}
```

### Combat

```typescript
interface Combat {
  id: string;
  characterId: string;
  opponent: {
    name: string;
    habilete: number;
    endurance: number;
  };
  rounds: CombatRound[];
  isActive: boolean;
  result?: 'victory' | 'defeat' | 'flee';
}

interface CombatRound {
  roundNumber: number;
  playerRoll: number;
  opponentRoll: number;
  playerAttack: number;
  opponentAttack: number;
  damage?: {
    toPlayer?: number;
    toOpponent?: number;
  };
}
```

## Flux de données

### Stockage local
```
User Action → Component → Storage Lib → IndexedDB/LocalStorage
                ↓
            Update UI
```

### Combat
```
Start Combat → Initialize Combat State
    ↓
Roll Dice → Calculate Attack Scores
    ↓
Compare Scores → Apply Damage
    ↓
Update Character Stats → Save to Storage
    ↓
Check Victory Condition → End or Continue
```

## Gestion d'état

### Client-side uniquement
- React hooks (useState, useEffect, useReducer)
- Context API pour état global (personnage actif)
- LocalStorage pour persistance
- Pas de state management externe (Redux, etc.)

## Performance

### Optimisations
- Next.js App Router avec RSC
- Code splitting automatique
- Lazy loading des composants
- Optimisation des images
- Service Worker pour cache
- IndexedDB pour stockage performant

## Sécurité

### Données locales
- Validation côté client
- Sanitization des inputs
- Pas de données sensibles
- Backup recommandé (export/import)

## Accessibilité

### ARIA et sémantique
- Labels appropriés
- Navigation au clavier
- Contraste des couleurs
- Tailles de touch targets (44x44px minimum)
- Screen reader support
