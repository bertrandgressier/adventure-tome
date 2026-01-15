# Adventure Tome - AI Agent Instructions

## ⚠️ IMPORTANT: When to Read ARCHITECTURE.md

**This file (AGENTS.md)** provides essential rules and patterns for development.

**Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) when working on**:
- Data model changes (Character structure, Stats, Inventory)
- Migration system (versioning, data persistence)
- Detailed layer interactions (Domain ↔ Application ↔ Infrastructure ↔ Presentation)
- Store architecture details (Slices composition, specific patterns)
- Combat system implementation (CombatService, formulas)
- Full project structure reference

**Mandatory consultation**: Before modifying domain entities, adding fields to Character, or changing data persistence logic.

---

## Project Overview

**Adventure Tome** is a mobile-first PWA for French gamebook characters ([La Saga de Dagda](https://www.lasagadedagda.fr/)). 100% client-side, offline-first, with strict adherence to official book rules.

**Tech Stack**: Next.js 16 (React 19) • Tailwind CSS 4 • Zustand 5 • IndexedDB • TypeScript 5 • pnpm

**Core Principles**:
- Clean Architecture (Domain → Application → Infrastructure → Presentation)
- Mobile-first UX (min 375px width, 44px touch targets)
- Game rules fidelity (never invent mechanics)
- Type safety + immutability

## Development Workflow

## Development Workflow

### Requirements
- Node.js >=24.0.0, pnpm >=10.20.0
- Conventional Commits enforced (commitlint)

### Commands
```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # ESLint (must pass)
pnpm test             # All tests (293 tests)
pnpm test:coverage    # Coverage report
```

### CI/CD Gates (all must pass)
1. Commitlint (PR title format)
2. ESLint (0 errors)
3. Tests (293/293 pass)
4. TypeScript compilation
5. Production build

### Creating Issues

**TOUJOURS utiliser les templates GitHub** lors de la création d'issues :

```bash
# Récupérer et analyser une issue existante
gh issue view 44

# Créer une nouvelle issue avec template
gh issue create --template feature.yml      # Nouvelle fonctionnalité
gh issue create --template bug.yml          # Bug report
gh issue create --template enhancement.yml  # Amélioration
gh issue create --template refactor.yml     # Refactorisation
```

**Templates disponibles** (`.github/ISSUE_TEMPLATE/`) :
- 🚀 **feature.yml** - Nouvelle fonctionnalité (objectif, étapes, livrables, edge cases)
- 🐛 **bug.yml** - Bug report (reproduction, logs, sévérité, environnement)
- ✨ **enhancement.yml** - Amélioration (comportement actuel vs proposé, mockups)
- ♻️ **refactor.yml** - Refactorisation (étude d'impact, architecture, risques)

**Guide complet** : [.github/ISSUE_TEMPLATE/USAGE_GUIDE.md](.github/ISSUE_TEMPLATE/USAGE_GUIDE.md)

---

## Architecture Globale

### Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│           PRESENTATION LAYER                │  React Components, Zustand Stores
│  app/, src/presentation/                    │  (UI, Providers, Hooks)
├─────────────────────────────────────────────┤
│          APPLICATION LAYER                  │  Use Cases, Services
│  src/application/services/                  │  (CharacterService)
├─────────────────────────────────────────────┤
│      INFRASTRUCTURE LAYER                   │  External I/O
│  src/infrastructure/                        │  (IndexedDB, Analytics, Migrations)
├─────────────────────────────────────────────┤
│           DOMAIN LAYER                      │  Business Logic (Pure)
│  src/domain/                                │  (Character, Stats, Inventory, Combat)
└─────────────────────────────────────────────┘
```

### Data Flow
```
User Action → Component
    ↓
Zustand Store (Slice)
    ↓
CharacterService (Application)
    ↓
Character.method() (Domain Logic)
    ↓
IndexedDBRepository (Infrastructure)
    ↓
Store Update → Re-render
```

### Key Directories
```
src/domain/
  entities/Character.ts          # Entité avec logique métier (withChanges pattern)
  value-objects/Stats.ts         # Valeurs immuables avec validation
  value-objects/Inventory.ts
  services/CombatService.ts      # Logique de combat pure
  
src/application/
  services/CharacterService.ts   # Orchestration CRUD + persistence
  
src/infrastructure/
  repositories/IndexedDBCharacterRepository.ts
  persistence/migrations.ts      # Versioning + migrations (v10)
  
src/presentation/
  stores/characterStore.ts       # Zustand vanilla store
  stores/slices/                 # Slices modulaires
  providers/                     # React Context
  components/                    # Composants métier
  hooks/                         # Custom hooks
```

---

## Domain Logic

### Character Entity Pattern

**Problem**: 18 mutation methods duplicated `new Character(id, name, book, talent, ...)` with 13 params
**Solution**: Private `withChanges()` helper method

```typescript
// src/domain/entities/Character.ts
export class Character {
  // ✅ DRY pattern: centralize immutable updates
  private withChanges(changes: {
    name?: string;
    stats?: Stats;
    inventory?: Inventory;
    progress?: Progress;
    notes?: string;
  }): Character {
    return new Character(
      this.id,
      changes.name ?? this._name,
      changes.book ?? this.book,
      this.talent,
      changes.secondTalent ?? this.secondTalent,
      this.gameMode,
      this.version,
      this.createdAt,
      new Date().toISOString(), // Auto-update timestamp
      changes.stats ?? this.stats,
      changes.inventory ?? this.inventory,
      changes.progress ?? this.progress,
      changes.notes ?? this._notes
    );
  }

  // ✅ Concise mutations (was 17 lines → 3 lines)
  updateName(name: string): Character {
    if (!name.trim()) throw new Error('Name required');
    return this.withChanges({ name: name.trim() });
  }

  updateStats(stats: Partial<StatsData>): Character {
    return this.withChanges({ stats: this.stats.update(stats) });
  }

  takeDamage(amount: number): Character {
    return this.withChanges({ stats: this.stats.takeDamage(amount) });
  }
  // ... 15 other methods using withChanges()
}
```

**Rules**:
- ALL mutations return new `Character` instance (immutable)
- Validation in domain layer (e.g., `updateName` checks empty)
- Value Objects (Stats, Inventory) handle their own logic
- NO direct persistence in domain layer

### Value Objects
```typescript
// src/domain/value-objects/Stats.ts
export class Stats {
  update(partial: Partial<StatsData>): Stats {
    // Validation + immutable update
    return new Stats({ ...this.toData(), ...partial });
  }
  
  takeDamage(amount: number): Stats {
    const newEndurance = Math.max(0, this.endurance - amount);
    return this.update({ endurance: newEndurance });
  }
}
```

### Game Rules Reference
- Character stats: [docs/CHARACTER_SHEET.md](docs/CHARACTER_SHEET.md)
- Combat formulas: [docs/COMBAT.md](docs/COMBAT.md) (2d6 + HABILETÉ + weapon)
- Modes: `narrative` (auto-win) | `simplified` (manual saves) | `mortal` (hardcore)

---

## Application Layer

### CharacterService Pattern

**Responsibility**: Orchestrate domain logic + persistence

```typescript
// src/application/services/CharacterService.ts
export class CharacterService {
  constructor(private repository: ICharacterRepository) {}

  // Pattern: find → validate → domain method → persist → return
  async updateCharacterStats(id: string, stats: Partial<StatsData>): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) throw new CharacterNotFoundError(id);
    
    const updated = character.updateStats(stats); // Domain logic
    await this.repository.save(updated);          // Persist
    return updated;
  }

  async applyDamage(id: string, amount: number): Promise<Character> {
    const character = await this.repository.findById(id);
    if (!character) throw new CharacterNotFoundError(id);
    
    const updated = character.takeDamage(amount);
    await this.repository.save(updated);
    return updated;
  }
}
```

**Rules**:
- Service = thin orchestration layer
- Domain logic stays in `Character.ts` / Value Objects
- Always validate entity exists before mutation
- Return updated entity for store sync

---

## Presentation: Zustand Store (Slices Pattern)

### Store Architecture

```
characterStore.ts              # Main store (combines slices)
slices/
  sliceHelpers.ts             # Shared utilities (handleSliceError)
  characterListSlice.ts       # State + loading (characters, isLoading, error)
  characterMutationSlice.ts   # CRUD (create, delete)
  characterStatsSlice.ts      # Stats updates (updateStats, applyDamage, heal)
  characterInventorySlice.ts  # Inventory (equipWeapon, addItem, removeItem)
  characterMetadataSlice.ts   # Metadata (updateName, notes, progress)
  characterItemsSlice.ts      # Filter items for "Add Item" modal (custom items that can be added)
```

### Slice Pattern: itemsCatalogSlice

**Purpose**: Centralized items catalog combining static catalog (`ITEMS_CATALOG`) + custom items (persisted)

```typescript
export interface ItemsCatalogSlice {
  catalog: Record<string, CatalogItem>;  // itemId → definition

  // Getters
  getItem: (itemId: string) => CatalogItem | undefined;
  getAllItems: () => CatalogItem[];
  getItemsByTome: (tome: number) => CatalogItem[];

  // Custom items (persisted via zustand/persist)
  createCustomItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem;
  removeCustomItem: (itemId: string) => void;
  initializeCatalog: () => Promise<void>;
}
```

**Usage in components**:
```typescript
const catalogItem = useCharacterStore((state) => state.getItem(itemId));
const allItems = useCharacterStore((state) => state.getAllItems());
const createCustomItem = useCharacterStore((state) => state.createCustomItem);
```

**Usage in slices** (e.g., `characterInventorySlice`):
```typescript
const catalogItem = get().getItem(catalogItemId);
```

**Note**: `customItemsCatalogStore.ts` was removed - this slice now handles both static catalog (loaded from `ITEMS_CATALOG`) and custom items (persisted).

### Slice Pattern

**Problem**: 16 catch blocks duplicated error handling  
**Solution**: `handleSliceError()` helper

```typescript
// slices/sliceHelpers.ts
export function handleSliceError(set: SetState, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
  set({ error: errorMessage });
}

// slices/characterStatsSlice.ts
import { handleSliceError } from './sliceHelpers';

export const createCharacterStatsSlice = (service: CharacterService) => {
  return (set: SetState, get: GetState): CharacterStatsSlice => ({
    updateStats: async (id: string, stats: Partial<StatsData>) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateCharacterStats(id, stats);
        set((state) => ({
          characters: { ...state.characters, [id]: updated }, // Immutable Record update
        }));
      } catch (error) {
        handleSliceError(set, error); // ✅ DRY error handling
        throw error;
      }
    },
    
    applyDamage: async (id: string, amount: number) => {
      // Same pattern...
    },
  });
};
```

### Store Composition

```typescript
// characterStore.ts
export const createCharacterStore = () => {
  const service = getService();
  return createStore<CharacterStore>()(
    devtools((set, get) => ({
      ...createCharacterListSlice(service)(set, get),
      ...createCharacterMutationSlice(service)(set),
      ...createCharacterStatsSlice(service)(set, get),
      ...createCharacterInventorySlice(service)(set, get),
      ...createCharacterMetadataSlice(service)(set, get),
      ...createCharacterItemsSlice(service)(set, get),
    }), { name: 'CharacterStore' })
  );
};
```

### Store Rules
- **Immutability**: Use `Record<string, T>` + spread (NEVER `Map`)
- **Type safety**: `SetState`, `GetState` signatures in each slice
- **Scope**: Provider in `app/characters/layout.tsx` only
- **Testing**: Auto-reset via `__mocks__/zustand/vanilla.ts`
- **Persistence**: All mutations auto-save via `CharacterService`

```typescript
// ✅ Correct: Immutable Record update
set((state) => ({ characters: { ...state.characters, [id]: updated } }))

// ❌ Wrong: Map mutation
set((state) => ({ characters: new Map(state.characters).set(id, updated) }))
```

---

## UI Components

### Component Structure

```
components/ui/                 # shadcn/ui primitives (Button, Dialog, Input)
components/adventure/          # Combat, dice roller
components/character/          # Character-specific (legacy)

src/presentation/components/   # Clean Architecture components
  CharacterStats.tsx           # Stats display + edit
  CharacterInventory.tsx       # Inventory management
  CharacterProgress.tsx        # Paragraph tracking
  AddItemModal.tsx            # Item catalog modal
  AddCustomItemModal.tsx      # Custom item creation
```

### Component Patterns

```typescript
// ✅ Use Zustand hooks from provider
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';

export function CharacterStats({ characterId }: Props) {
  const character = useCharacterStore((state) => state.getCharacter(characterId));
  const updateStats = useCharacterStore((state) => state.updateStats);
  const applyDamage = useCharacterStore((state) => state.applyDamage);

  const handleSave = async () => {
    await updateStats(characterId, { habilete: 12 });
  };
}
```

### shadcn/ui Usage
- Install: `npx shadcn@latest add <component>`
- Components in `components/ui/`
- Customize via Tailwind classes
- Theme via CSS variables (see Theming section)

---

## UX Guidelines

### Theming & Styling

**Rule**: NO hardcoded colors/styles - use CSS variables

```typescript
// ✅ Correct: Use Tailwind + CSS variables
<div className="bg-card text-primary border-primary/50" />

// ❌ Wrong: Hardcoded colors
<div style={{ background: '#1a1a1a', color: '#ffd700' }} />
```

**CSS Variables** (see [docs/THEMING.md](docs/THEMING.md)):
```css
--primary: 45 100% 50%       /* Gold */
--magic-purple: 280 100% 70%
--magic-blue: 210 100% 60%
--card: 0 0% 10%            /* Dark background */
```

**Fonts**:
- Titles: `font-cinzel` (uncial fantasy)
- Body: `font-merriweather` (readable)
- Stats: `font-mono` (monospace)

### Mobile-First Rules

1. **Touch Targets**: Minimum 44x44px (`.btn-mobile` class)
2. **Viewport**: Test at 375px width minimum
3. **Font Size**: Input min 16px (prevents iOS zoom)
4. **Orientation**: Portrait only (PWA manifest)

### Accessibility

- Contrast: 4.5:1 text, 3:1 large text
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader testing

### PWA Requirements

- Icons: 192x192, 512x512 in `public/icons/`
- Manifest: `app/manifest.ts` + `public/manifest.json`
- Offline: IndexedDB for all character data
- Service Worker: Auto-generated by Next.js

---

## Common Tasks

### Adding a New Character Field

1. **Domain**: Update `Character` interface in `src/domain/entities/Character.ts`
2. **Migration**: Increment `CURRENT_VERSION` in `src/infrastructure/persistence/migrations.ts`, add migration
3. **Service**: Add method in `CharacterService` if needed
4. **Store**: Add action in appropriate slice
5. **UI**: Update form/display components
6. **Tests**: Add tests in `*.test.ts` files
7. **Docs**: Update [docs/CHARACTER_SHEET.md](docs/CHARACTER_SHEET.md)

### Data Migration Steps

```typescript
// src/infrastructure/persistence/migrations.ts
export const CURRENT_VERSION = 11; // Increment

export const migrations: Migration[] = [
  // ... existing migrations
  {
    version: 11,
    migrate: (data) => ({
      ...data,
      newField: data.newField ?? defaultValue, // Backward compatibility
      version: 11,
    }),
  },
];
```

Test in `tests/integration/data-migration.test.ts`

### Creating Combat Features

1. Logic in `src/domain/services/CombatService.ts` (formulas from [docs/COMBAT.md](docs/COMBAT.md))
2. UI in `components/adventure/CombatInterface.tsx`
3. Dice animations + visual feedback
4. Test edge cases: ties, luck mechanics, weapon bonuses

---

## Testing Strategy

## Testing Strategy

- **293 tests** across domain, application, infrastructure, presentation layers
- **Coverage**: Domain entities, services, slices, components, integration flows
- **Tools**: Vitest + Testing Library + fake-indexeddb
- **Mocks**: Auto-reset in `__mocks__/zustand/vanilla.ts`

```bash
pnpm test              # Run all tests
pnpm test:coverage     # Coverage report
pnpm test:ui           # Interactive UI
```

---

## Key Documentation

- [docs/COMBAT.md](docs/COMBAT.md) - Combat formulas + examples
- [docs/CHARACTER_SHEET.md](docs/CHARACTER_SHEET.md) - Official character structure
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed architecture + migrations
- [docs/THEMING.md](docs/THEMING.md) - CSS variables + color palette

---

## Critical Rules

1. **Game Fidelity**: NEVER invent mechanics - follow official book rules
2. **Immutability**: Domain entities + Zustand store use immutable patterns
3. **DRY**: Use helpers (`withChanges()`, `handleSliceError()`) to avoid duplication
4. **Clean Architecture**: Respect layer boundaries (Domain ← Application ← Infrastructure → Presentation)
5. **⚠️ NO BUSINESS LOGIC IN UI COMPONENTS** (see details below)
6. **Type Safety**: TypeScript strict mode, proper typing in all layers
7. **Mobile-First**: 375px minimum, 44px touch targets, 16px input font-size

### Rule #5: NO BUSINESS LOGIC IN UI COMPONENTS

**FORBIDDEN in React components** (`app/`, `components/`, `src/presentation/components/`):
```typescript
// ❌ Math calculations (except display formatting)
const diff = newValue - oldValue;
const total = items.reduce((sum, item) => sum + item.price, 0);
const result = Math.floor(Math.random() * 6) + 1;

// ❌ Complex conditionals (business logic)
if (character.stats.endurance <= character.stats.pointsDeVieMax / 4) {
  // Critical health logic
}

// ❌ Data transformations with logic
const validItems = items.filter(item => item.type === 'weapon' && item.possessed);
```

**ALLOWED in React components**:
```typescript
// ✅ Simple display conditionals
if (isLoading) return <Loading />;
if (error) return <Error message={error} />;

// ✅ Formatting for display only
const formatted = new Date(character.updatedAt).toLocaleString();

// ✅ Delegate to store/hooks
const handleSave = async (value: number) => {
  await updateStats({ endurance: value }); // No logic, just call
};
```

**Where to put logic**:
- **Domain** (`src/domain/`): Pure business logic (Character.isDead(), Stats.isCritical())
- **Application** (`src/application/`): Orchestration (CharacterService.applyDamage())
- **Slices** (`src/presentation/stores/slices/`): Coordination logic (calculateDiff, conditionals)
- **Services** (`src/domain/services/`): Reusable logic (DiceService.roll(), CombatService)

**All logic MUST have unit tests**. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed rules.

---

## Best Practices - Code Quality

### DRY: Avoid Type/Interface Duplication

**Problem**: Types defined in multiple files lead to maintenance issues and inconsistencies.

```typescript
// ❌ WRONG: Same interface in multiple files
// file: AttackResolver.ts
export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

// file: ReactionResolver.ts (duplicate!)
export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}
```

```typescript
// ✅ CORRECT: Centralize in a types file, import everywhere
// file: types.ts
export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

// file: AttackResolver.ts
import type { ActionResolutionResult } from './types';

// file: ReactionResolver.ts
import type { ActionResolutionResult } from './types';
```

**Pattern for re-exporting**:
```typescript
// types.ts - Re-export from source of truth
import type { DiceOverrides } from './DiceRoller';
export type { DiceOverrides };
```

### Use Constants Instead of String Literals

**Problem**: String literals are error-prone and lack type safety.

```typescript
// ❌ WRONG: Hardcoded string
expect(result.events.some(e => e.type === 'flee')).toBe(true);

// ✅ CORRECT: Use constant
import { CombatEventType } from '@/src/domain/types/CombatEventType';
expect(result.events.some(e => e.type === CombatEventType.FLEE)).toBe(true);
```

**Define constants as const objects**:
```typescript
// ✅ Pattern for type-safe constants
export const CombatPhase = {
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN: 'enemy_turn',
  // ...
} as const;

export type CombatPhase = (typeof CombatPhase)[keyof typeof CombatPhase];
```

### Prefer `const` Over `let`

**Problem**: Using `let` when variable is never reassigned triggers lint errors.

```typescript
// ❌ WRONG: let but never reassigned
let newState: CombatState = {
  ...state,
  phase: CombatPhase.PLAYER_TURN,
};
return { state: newState, events: [] };

// ✅ CORRECT: const since never reassigned
const newState: CombatState = {
  ...state,
  phase: CombatPhase.PLAYER_TURN,
};
return { state: newState, events: [] };
```

### Remove Unused Imports

**Problem**: Unused imports clutter code and fail lint.

```typescript
// ❌ WRONG: DiceRoll imported but never used
import type { DiceOverrides } from './DiceRoller';
import type { DiceRoll } from '../../types/combatants'; // UNUSED!

// ✅ CORRECT: Only import what you use
import type { DiceOverrides } from './DiceRoller';
```

**Check before committing**: Run `pnpm lint` to catch unused imports.

### Correct Export Paths in Index Files

**Problem**: Incorrect relative paths in barrel exports cause import failures.

```typescript
// ❌ WRONG: File is in ./combat/ subdirectory
export { CombatEngine } from './CombatEngine';

// ✅ CORRECT: Proper path to subdirectory
export { CombatEngine } from './combat/CombatEngine';
```

### Consolidate Related Types

**Problem**: Related types scattered across files make codebase harder to navigate.

```
// ❌ WRONG: Types scattered
src/domain/services/combat/
  DiceRoller.ts        → defines DiceOverrides
  types.ts             → defines DiceOverrides again (duplicate!)
  AttackResolver.ts    → defines ActionResolutionResult
  ReactionResolver.ts  → defines ActionResolutionResult again!
```

```
// ✅ CORRECT: Centralized types
src/domain/services/combat/
  types.ts             → ActionResolutionResult, CombatResult, AvailableAction
  DiceRoller.ts        → DiceOverrides (source of truth, re-exported by types.ts)
  AttackResolver.ts    → imports from types.ts
  ReactionResolver.ts  → imports from types.ts
```

### Pre-Commit Checklist

Before committing, always run:
```bash
pnpm lint      # 0 errors required
pnpm test      # All tests must pass
```

Common issues to check:
1. **Duplicate types** - Search for interface/type name across codebase
2. **Unused imports** - Lint will catch these
3. **String literals** - Should use constants for enum-like values
4. **`let` vs `const`** - Use `const` unless reassignment is needed
5. **Export paths** - Verify barrel exports match actual file locations

---

## External Resources

- [Next.js 16](https://nextjs.org/docs) - App Router, React 19
- [shadcn/ui](https://ui.shadcn.com/docs) - Component library
- [Tailwind CSS 4](https://tailwindcss.com/docs) - Utility-first CSS
- [Zustand 5](https://docs.pmnd.rs/zustand) - State management
- [La Saga de Dagda](https://www.lasagadedagda.fr/) - Official gamebooks
