# Architecture - Adventure Tome

## Stack technique

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling avec theming
- **shadcn/ui** - Composants UI

### State Management
- **Zustand 5.x** - State management avec vanilla store pattern
- **Slices Pattern** - Store modulaire divisé en slices thématiques
- **Immutabilité** - Updates avec `Record<string, T>` et spread operator

### PWA
- **Service Worker** - Cache et offline
- **Web App Manifest** - Configuration PWA
- **IndexedDB** - Stockage local structuré

## Clean Architecture - Règles Strictes

### ⚠️ RÈGLE #1 : PAS DE LOGIQUE MÉTIER DANS LES COMPOSANTS UI

**Interdit** dans les composants React (Presentation layer):
- ❌ Calculs mathématiques (sauf formatage d'affichage)
- ❌ Logique conditionnelle complexe (if/else métier, switch/case)
- ❌ Transformations de données (map/filter/reduce avec logique)
- ❌ Validations métier
- ❌ Génération de valeurs aléatoires (Math.random pour dés)
- ❌ Manipulation d'état complexe (calcul de différence, aggregation)

**Autorisé** dans les composants React:
- ✅ Affichage conditionnel simple (isLoading, error)
- ✅ Formatage visuel (dates, nombres pour affichage)
- ✅ Gestion d'état UI local (modales, formulaires)
- ✅ Appel de méthodes du store/hook (sans logique)
- ✅ Event handlers qui délèguent au store

**Où placer la logique**:
1. **Domain Layer** (`src/domain/`) : Logique métier pure (Character, Stats, CombatService)
2. **Application Layer** (`src/application/`) : Orchestration (CharacterService)
3. **Slices** (`src/presentation/stores/slices/`) : Logique de coordination store

**Exemple de violation**:
```typescript
// ❌ WRONG: Logique dans le composant
function CharacterProgress() {
  const handleUpdateBoulons = (newValue: number) => {
    const diff = newValue - character.boulons; // ❌ Calcul métier
    if (diff > 0) {                             // ❌ Logique conditionnelle
      addBoulons(diff);
    } else {
      removeBoulons(Math.abs(diff));            // ❌ Math.abs
    }
  };
}

// ✅ CORRECT: Logique dans le slice
// Composant:
function CharacterProgress() {
  const handleUpdateBoulons = (newValue: number) => {
    setBoulons(newValue); // Simple appel, pas de logique
  };
}

// Slice:
export const createInventorySlice = () => ({
  setBoulons: async (id: string, newValue: number) => {
    const character = get().characters[id];
    const diff = newValue - character.getInventory().boulons;
    if (diff > 0) {
      await service.addBoulons(id, diff);
    } else if (diff < 0) {
      await service.removeBoulons(id, Math.abs(diff));
    }
    // ...
  }
});
```

### RÈGLE #2 : TOUTE LOGIQUE DOIT ÊTRE TESTÉE

- Domain entities : Tests unitaires obligatoires
- Services : Tests unitaires obligatoires
- Slices : Tests unitaires obligatoires
- Composants UI : Tests d'intégration (pas de tests de logique métier)

**Ratio cible** : 80%+ de couverture sur Domain/Application/Slices

## Structure du projet

```text
adventure-tome/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Layout principal + metadata
│   ├── page.tsx                   # Page d'accueil
│   ├── manifest.ts                # PWA manifest
│   ├── globals.css                # Styles globaux + theme
│   │
│   ├── characters/                # Gestion des personnages
│   │   ├── layout.tsx            # Provider Zustand scoped
│   │   ├── page.tsx              # Liste des personnages
│   │   ├── new/
│   │   │   └── page.tsx          # Créer un personnage
│   │   └── [id]/
│   │       └── page.tsx          # Détail personnage
│   │
│   └── components/                # Composants Next.js legacy
│       ├── ui/                    # Composants shadcn/ui
│       ├── adventure/             # Combat, dice roller
│       ├── character/             # Character legacy components
│       ├── GoogleAnalytics.tsx
│       └── MusicPlayer.tsx
│
├── src/                           # Clean Architecture
│   ├── domain/                    # Couche métier (logique pure)
│   │   ├── entities/
│   │   │   ├── Character.ts      # Entité Character avec logique métier
│   │   │   └── Character.test.ts
│   │   │
│   │   ├── value-objects/
│   │   │   ├── Stats.ts          # Stats avec validation
│   │   │   ├── Stats.test.ts
│   │   │   └── Inventory.ts      # Inventory, Weapon types
│   │   │
│   │   ├── services/
│   │   │   ├── CombatService.ts  # Logique de combat pure
│   │   │   └── CombatService.test.ts
│   │   │
│   │   ├── repositories/
│   │   │   └── ICharacterRepository.ts  # Interface repository
│   │   │
│   │   └── types/
│   │       └── combat.ts         # Types combat
│   │
│   ├── application/               # Couche application (use cases)
│   │   └── services/
│   │       ├── CharacterService.ts      # Orchestration CRUD
│   │       └── CharacterService.test.ts
│   │
│   ├── infrastructure/            # Couche infrastructure (I/O)
│   │   ├── repositories/
│   │   │   └── IndexedDBCharacterRepository.ts  # Implémentation IndexedDB
│   │   │
│   │   ├── persistence/
│   │   │   └── indexeddb.ts      # Helpers IndexedDB
│   │   │
│   │   ├── dto/
│   │   │   └── CharacterDTO.ts   # Mapping DB <-> Domain
│   │   │
│   │   └── analytics/
│   │       ├── gtag.ts           # Google Analytics
│   │       └── tracking.ts
│   │
│   └── presentation/              # Couche présentation (UI)
│       ├── stores/
│       │   ├── characterStore.ts         # Store principal (combine slices)
│       │   ├── characterStore.test.ts
│       │   ├── createSelectors.ts        # Auto-selectors helper
│       │   │
│       │   └── slices/                   # Slices Pattern
│       │       ├── characterListSlice.ts     # Load, refresh, getters
│       │       ├── characterMutationSlice.ts # Create, delete
│       │       ├── characterStatsSlice.ts    # Update stats, damage, heal
│       │       ├── characterInventorySlice.ts # Inventory, weapons, boulons
│       │       └── characterMetadataSlice.ts # Name, notes, progress
│       │
│       ├── providers/
│       │   ├── character-store-provider.tsx  # Context provider
│       │   └── CharacterStoreProvider.test.tsx
│       │
│       ├── hooks/
│       │   └── useCharacter.ts   # Custom hook pour Zustand store
│       │
│       └── components/
│           ├── CharacterStats.tsx
│           ├── CharacterInventory.tsx
│           ├── CharacterProgress.tsx
│           ├── CharacterWeapon.tsx
│           └── EditableStatField.tsx
│
├── lib/                           # Legacy code (en cours de migration)
│   ├── storage/                   # DEPRECATED - use CharacterService
│   ├── game/
│   │   └── combat.ts             # DEPRECATED - use CombatService
│   ├── utils.ts
│   └── types/
│       ├── character.ts          # DEPRECATED - use domain entities
│       └── combat.ts             # DEPRECATED - use domain types
│
├── tests/
│   └── integration/
│       ├── character-flow.test.ts    # Tests E2E flux personnage
│       └── data-migration.test.ts    # Tests migration données
│
├── public/
│   ├── icons/                     # Icônes PWA
│   └── manifest.json              # Manifest statique
│
└── docs/                          # Documentation
    ├── ARCHITECTURE.md            # Ce fichier
    ├── FEATURES.md
    ├── CHARACTER_SHEET.md
    ├── COMBAT.md
    └── THEMING.md
```

## Modèles de données

### Character (Personnage)

```typescript
interface Character {
  id: string;
  name: string;
  book: string;
  talent: string;  // Artisan, Explorateur, Guerrier, Magicien, Négociant, Voleur
  gameMode: 'narrative' | 'simplified' | 'mortal';  // Mode de jeu
  version: number;           // Version du modèle de données (migration)
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

### Modes de Jeu

- **Narratif** (`narrative`) : Mode histoire sans combat, victoire automatique
- **Simplifié** (`simplified`) : Mode normal avec sauvegardes manuelles autorisées (copie de personnage)
- **Mortel** (`mortal`) : Mode hardcore, une seule vie, pas de sauvegarde manuelle

```typescript
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

### Architecture Clean - Flux de données

```text
User Action → Component (Presentation)
    ↓
useCharacter Hook → Zustand Store
    ↓
CharacterService (Application)
    ↓
IndexedDBRepository (Infrastructure) → IndexedDB
    ↓
Return Domain Entity
    ↓
Update Zustand Store → Re-render Component
```

### Exemple : Mise à jour d'une stat

```text
1. User clicks "Save" in EditableStatField
2. Component calls updateStats from useCharacter hook
3. Hook dispatches to Zustand characterStatsSlice
4. Slice calls CharacterService.updateCharacterStats()
5. Service validates with Stats Value Object
6. Service calls repository.update(character)
7. Repository saves to IndexedDB
8. Repository returns updated Character entity
9. Service returns to slice
10. Slice updates store state (immutable Record update)
11. Component re-renders with new data
```

### Combat

```text
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

### Zustand avec Slices Pattern

- **Store centralisé** : `characterStore.ts` combine 5 slices thématiques
- **Vanilla store** : `zustand/vanilla` pour compatibilité SSR Next.js
- **Provider scoped** : Context limité à `/characters` routes
- **Immutabilité** : `Record<string, Character>` avec spread operator (pas de `Map`)
- **Auto-selectors** : `createSelectors()` helper pour accès type-safe
- **Persistence** : Auto-save vers IndexedDB via `CharacterService`

### Slices (5 modules)

1. **characterListSlice** : État + chargement (`characters`, `isLoading`, `hasInitialLoad`, `loadAll`, `loadOne`)
2. **characterMutationSlice** : CRUD (`createCharacter`, `deleteCharacter`)
3. **characterStatsSlice** : Stats (`updateStats`, `applyDamage`, `heal`)
4. **characterInventorySlice** : Inventaire (`equipWeapon`, `addItem`, `removeItem`, `addBoulons`)
5. **characterMetadataSlice** : Métadonnées (`updateName`, `updateNotes`, `goToParagraph`)

### Tests

- **Unit tests** : Test store directement avec `store.getState()` et `store.setState()`
- **Component tests** : Test avec `CharacterStoreProvider` wrapper
- **Mocks auto-reset** : `__mocks__/zustand/vanilla.ts` réinitialise après chaque test
- **109 tests** : 100% de couverture sur Domain, Application, Infrastructure, Presentation

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

## Migration de Données

### Versioning Pattern

Le projet utilise un système de versioning et migration inspiré du pattern de Zustand `persist` middleware. Chaque personnage possède un champ `version: number` permettant de migrer automatiquement les données lors de changements de structure.

### Architecture de Migration

```typescript
// src/infrastructure/persistence/migrations.ts
export const CURRENT_VERSION = 10;

interface Migration {
  version: number;
  migrate: (data: any) => any;
}

// Registre des migrations (ordre chronologique)
export const migrations: Migration[] = [
  {
    version: 2,
    migrate: (data) => ({
      ...data,
      gameMode: data.gameMode ?? 'mortal',
      version: 2,
    }),
  },
  // Futures migrations ici
];

export function migrateCharacter(data: any): any {
  const currentVersion = data.version ?? 1;
  
  if (currentVersion >= CURRENT_VERSION) {
    return data;
  }
  
  // Applique toutes les migrations nécessaires
  return migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version)
    .reduce((acc, migration) => migration.migrate(acc), data);
}
```

### Flux de Migration

```text
IndexedDB Read → Raw Data (version 1 ou undefined)
    ↓
migrateCharacter(data)
    ↓
Apply migrations v1→v2, v2→v3, etc.
    ↓
Return migrated data (version: CURRENT_VERSION)
    ↓
CharacterDTO.fromPersistence()
    ↓
Domain Entity (Character)
```

### Exemple de Migration v1 → v2

**Avant (v1)** :

```json
{
  "id": "123",
  "name": "Aragorn",
  "stats": { "dexterite": 7, "chance": 4 }
  // Pas de champ gameMode ni version
}
```

**Après (v2)** :

```json
{
  "id": "123",
  "name": "Aragorn",
  "stats": { "dexterite": 7, "chance": 4 },
  "gameMode": "mortal",
  "version": 2
}
```

### Règles de Migration

1. **Toujours incrémenter `CURRENT_VERSION`** quand la structure `Character` change
2. **Créer une migration** dans `migrations.ts` avec fonction `migrate()`
3. **Rétrocompatibilité** : Assigner des valeurs par défaut pour nouveaux champs
4. **Tests obligatoires** : Tester migration avec données legacy dans `data-migration.test.ts`
5. **Documentation** : Mettre à jour `CHANGELOG_USER.md` pour changements breaking

