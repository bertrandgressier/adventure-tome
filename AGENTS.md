# Adventure Tome - AI Agent Instructions

## Project Overview

**Adventure Tome** is a mobile-first PWA for managing characters in French "Choose Your Own Adventure" books ("Le jeu dont tu es le héro") from the [La Saga de Dagda collection](https://www.lasagadedagda.fr/). First implementation targets "La Harpe des Quatre Saisons".

**Core Philosophy**: 
- 100% client-side (no server, no API)
- Mobile-first UX with heroic fantasy theming
- Offline-first with IndexedDB storage
- All game rules MUST match the official book exactly (no invented mechanics)

## Tech Stack & Key Decisions

- **Next.js 16** with App Router (React 19, TypeScript 5)
- **Tailwind CSS 4** with shadcn/ui components
- **pnpm** package manager
- **React Compiler** enabled in `next.config.ts`
- **IndexedDB** for character/progress persistence (LocalStorage for simple data)
- Path alias: `@/*` maps to project root

## Quality Gates & Workflows

### Version Requirements
- **Node.js**: >=24.0.0
- **pnpm**: >=10.20.0

### Available Scripts
```bash
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Run tests with coverage report
```

### Conventional Commits
**Commitlint is enforced** - All commits and PR titles must follow conventional commits format:
```
<type>(<scope>): <subject>

Allowed types:
- feat      New feature
- fix       Bug fix
- docs      Documentation changes
- style     Code style changes (formatting, no logic changes)
- refactor  Code refactoring
- perf      Performance improvements
- test      Test changes
- build     Build system changes
- ci        CI/CD changes
- chore     Maintenance tasks
- revert    Revert previous commit
```

Examples:
- `feat(combat): add lucky chance mechanic`
- `fix(inventory): prevent duplicate weapons`
- `test(character): add migration tests`

### CI/CD Pipeline
All PRs to `main` must pass:
1. **Commitlint** - Validates PR title follows conventional commits
2. **Lint** - ESLint must pass with 0 errors
3. **Tests** - All tests must pass
4. **Build** - Production build must succeed
5. **Coverage** - Upload to Codecov (non-blocking)

## Architecture Patterns

### Data Models (see `docs/CHARACTER_SHEET.md`, `docs/ARCHITECTURE.md`)

**Character Model** - Based on official book character sheet:
```typescript
interface Character {
  gameMode: 'narrative' | 'simplified' | 'mortal';  // Game difficulty mode
  version: number;                                   // Data model version (migration)
  stats: {
    habilete: number;           // Combat skill
    endurance: number;          // Health points
    chance: number;             // Luck score
    dexterite: number;          // Dexterity (fixed)
  };
  pointsDeVieMaximum: number;
  inventory: {
    items: Array<{
      name: string;
      possessed: boolean;       // Checkbox-style inventory
      attackPoints?: number;    // Weapon attack points
      type?: 'weapon' | 'item' | 'special';
    }>;
  };
  progress: {
    currentParagraph: number;   // Book paragraph tracking
    history: number[];
  };
}
```

**Game Modes**:
- **Narrative** (`narrative`): Story mode, auto-win combats
- **Simplified** (`simplified`): Normal mode with manual saves allowed (character copy)
- **Mortal** (`mortal`): Hardcore mode, one life, no manual saves

### Combat System (see `docs/COMBAT.md`)

**Force d'Attaque Formula**: `2d6 + HABILETÉ + Weapon Attack Points`
- Winner of each round deals 2 damage
- "Tentez votre Chance" mechanic: Lucky = 3 damage (or 1 taken), Unlucky = 1 damage (or 3 taken)
- Each luck test reduces CHANCE by 1

### File Structure

```
app/
  characters/          # Character CRUD pages
    layout.tsx         # CharacterStoreProvider scope
  adventure/           # Combat, dice, notes features
  components/
    ui/                # shadcn/ui primitives
    character/         # CharacterCard, CharacterForm, StatsDisplay
    adventure/         # CombatInterface, DiceRoller, ProgressTracker
src/
  domain/              # Entities, Value Objects (Character, Stats, Inventory)
  application/         # Services (CharacterService with business logic)
  infrastructure/      # Repositories (IndexedDBCharacterRepository)
  presentation/
    stores/            # Zustand stores (characterStore.ts)
    providers/         # React Context providers
    hooks/             # Custom React hooks
```

## Critical Development Rules

### 1. Game Rules Fidelity
**NEVER invent game mechanics**. All rules must come from official book documentation:
- Character creation formulas → check book-specific rules
- Combat calculations → see `docs/COMBAT.md`
- Inventory/stats → match official character sheet in `docs/CHARACTER_SHEET.md`

### 2. Theming & Styling (see `docs/THEMING.md`)
- **NO hardcoded CSS colors/styles** - use CSS variables and Tailwind classes
- Theme: Dark fantasy with gold (`--primary: 45 100% 50%`), purple (`--magic-purple`), blue (`--magic-blue`)
- Mobile touch targets: minimum 44x44px
- Font scale: `font-cinzel` for titles, `font-merriweather` for body, `font-mono` for stats

### 3. Component Guidelines
- Use shadcn/ui components from `app/components/ui/`
- Add new shadcn components via: `npx shadcn@latest add <component>`
- Mobile-first: test all layouts on 375px width minimum
- PWA icons required: 192x192, 512x512 in `public/icons/`

### 4. State Management (Zustand + Clean Architecture + Slices Pattern)
- **Zustand 5.x** with vanilla store pattern (`zustand/vanilla`)
- **Slices Pattern** for modularity - store divisé en slices thématiques
- **Provider scoped** to `/characters` routes only (client-side only)
- **Immutable updates**: Use `Record<string, T>` + spread operator, NEVER `Map`
- **Auto-selectors**: Use `createSelectors()` helper for type-safe access
- Persist to IndexedDB via `CharacterService` (all mutations auto-save)

**Store Architecture (Slices Pattern)**:
```
src/presentation/stores/
  characterStore.ts           # Store principal (combine tous les slices)
  slices/
    characterListSlice.ts     # État + chargement (characters, isLoading, error)
    characterMutationSlice.ts # CRUD (create, delete)
    characterStatsSlice.ts    # Stats (updateStats, applyDamage, heal)
    characterInventorySlice.ts # Inventaire (equipWeapon, addItem, removeItem)
    characterMetadataSlice.ts # Métadonnées (updateName, updateNotes, goToParagraph)
```

```typescript
// ✅ Correct: Immutable Record updates
set((state) => ({ characters: { ...state.characters, [id]: updated } }))

// ❌ Wrong: Map mutations
set((state) => ({ characters: new Map(state.characters).set(id, updated) }))

// ✅ Slice pattern (maintainability)
export const createCharacterStatsSlice = (service: CharacterService) => {
  return (set: SetState, get: GetState): CharacterStatsSlice => ({
    updateStats: async (id, stats) => { /* ... */ },
    applyDamage: async (id, amount) => { /* ... */ },
  });
};

// ✅ Combine slices in main store
export const createCharacterStore = () => {
  const service = getService();
  return createStore<CharacterStore>()(
    devtools((set, get, store) => ({
      ...createCharacterListSlice(service)(set, get),
      ...createCharacterStatsSlice(service)(set, get),
      // ... other slices
    }))
  );
};
```

**Key patterns**:
- **Slices** = fonctions retournant un objet avec state + actions
- **Typed signatures**: `SetState`, `GetState` pour chaque slice
- **Service injection**: Pass `CharacterService` to each slice creator
- `useMemo` in provider (not `useRef`) for React 19 compatibility
- `shallow` equality in `useStoreWithEqualityFn` for performance
- Test mocks: `__mocks__/zustand.ts` auto-resets stores after each test

**Testing**:
- Unit tests: Test store directly with `store.getState()` and `store.setState()`
- Component tests: Test with `CharacterStoreProvider` wrapper
- All tests auto-reset state via `__mocks__/zustand/vanilla.ts`

## Common Patterns

### Data Migration
1. **Increment `CURRENT_VERSION`** in `src/infrastructure/persistence/migrations.ts` when `Character` structure changes
2. **Create migration** in `migrations` array with `migrate()` function
3. **Default values** for backward compatibility (e.g., `gameMode: 'mortal'` for v1 characters)
4. **Test migration** in `tests/integration/data-migration.test.ts` with legacy data
5. **Update `CHANGELOG_USER.md`** for breaking changes

### Adding a New Character Stat
1. Update `Character` interface in `lib/types/character.ts`
2. Add field to `CharacterForm` component
3. Update `docs/CHARACTER_SHEET.md` with official rule
4. Add validation in `lib/utils/validation.ts`

### Creating Combat Features
1. Implement logic in `lib/game/combat.ts` following `docs/COMBAT.md` formulas
2. Build UI in `app/components/adventure/CombatInterface.tsx`
3. Use dice animations and visual feedback (see theming for colors)
4. Test edge cases: ties (no damage), luck mechanics, weapon bonuses

### Storage Operations
```typescript
// Use CharacterService, NOT direct IndexedDB calls
import { CharacterService } from '@/src/application/services/CharacterService';

const service = new CharacterService(repository);
await service.createCharacter(data);
await service.updateCharacterStats(id, stats);

// Or use Zustand store (auto-persists to IndexedDB)
const updateStats = useCharacterStore((state) => state.updateStats);
await updateStats(characterId, { habilete: 12 });
```

## Key Files Reference

- `docs/COMBAT.md` - Complete combat rules with examples
- `docs/THEMING.md` - CSS variables, color palette, component styling
- `docs/CHARACTER_SHEET.md` - Official character sheet structure
- `docs/ARCHITECTURE.md` - Clean Architecture + Zustand patterns
- `src/presentation/stores/characterStore.ts` - Zustand store implementation
- `app/characters/layout.tsx` - CharacterStoreProvider scope
- `app/layout.tsx` - PWA metadata and viewport config
- `tsconfig.json` - `@/*` path alias configuration
- `.commitlintrc.json` - Commitlint configuration
- `eslint.config.mjs` - ESLint configuration

## Accessibility & Mobile

- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text
- Touch targets: 44x44px minimum (`.btn-mobile` class)
- Input font-size: 16px minimum (prevents iOS zoom)
- Test with screen readers (labels, ARIA attributes)
- Portrait orientation only (set in manifest)

## External Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [La Saga de Dagda Books](https://www.lasagadedagda.fr/)
