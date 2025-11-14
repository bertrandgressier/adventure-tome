# Architecture - Adventure Tome

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
adventure-tome/
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
  talent: string;  // Artisan, Explorateur, Guerrier, Magicien, Négociant, Voleur
  createdAt: string;
  updatedAt: string;
  
  // Caractéristiques
  stats: {
    dexterite: number;         // Score fixe (7 par défaut)
    chance: number;            // Score actuel
    chanceInitiale: number;    // Score de départ
    pointsDeVieMax: number;    // Maximum de PV (2d6 × 4)
    pointsDeVieActuels: number;// PV actuels
  };
  
  // Inventaire
  inventory: {
    boulons: number;           // Monnaie
    weapon?: {                 // Arme équipée (une seule)
      name: string;
      attackPoints: number;    // Points de dommage
    };
    items: Array<{             // Objets (hors armes)
      name: string;
      possessed: boolean;
      type?: 'item' | 'special';
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
interface Enemy {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  attackPoints: number; // Points de dommage de l'arme
}

interface CombatRound {
  roundNumber: number;
  attacker: 'player' | 'enemy';
  
  // Test pour toucher
  hitDiceRoll: number;           // 2d6
  hitSuccess: boolean;           // hitDiceRoll ≤ DEXTÉRITÉ
  
  // Si touché, calcul des dégâts
  damageDiceRoll?: number;       // 1d6
  weaponDamage?: number;         // Points de dommage de l'arme
  totalDamage?: number;          // 1 + 1d6 + weaponDamage
  
  playerEnduranceAfter: number;
  enemyEnduranceAfter: number;
}

interface CombatState {
  enemy: Enemy;
  rounds: CombatRound[];
  playerEndurance: number;
  enemyEndurance: number;
  status: 'setup' | 'ongoing' | 'victory' | 'defeat';
  nextAttacker: 'player' | 'enemy';
}

type CombatMode = 'auto' | 'manual';
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
Start Combat → Initialize Combat State (mode, first attacker)
    ↓
Roll to Hit (2d6) → Check if ≤ DEXTÉRITÉ
    ↓
If Hit → Roll Damage (1d6) → Calculate Total (1 + 1d6 + weapon)
    ↓
Apply Damage → Update Endurance
    ↓
Alternate Attacker → Next Round
    ↓
Check Victory/Defeat (PV = 0) → End or Continue
    ↓
Save Updated Character → Show End Modal
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
