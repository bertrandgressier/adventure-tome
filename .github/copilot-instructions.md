# Adventure Hero - AI Agent Instructions

## Project Overview

**Adventure Hero** is a mobile-first PWA for managing characters in French "Choose Your Own Adventure" books ("Le jeu dont tu es le héro") from the [La Saga d'Agda collection](https://www.lasagadedagda.fr/). First implementation targets "La Harpe des Quatre Saisons".

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

## Architecture Patterns

### Data Models (see `docs/CHARACTER_SHEET.md`, `docs/ARCHITECTURE.md`)

**Character Model** - Based on official book character sheet:
```typescript
interface Character {
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

### Combat System (see `docs/COMBAT.md`)

**Force d'Attaque Formula**: `2d6 + HABILETÉ + Weapon Attack Points`
- Winner of each round deals 2 damage
- "Tentez votre Chance" mechanic: Lucky = 3 damage (or 1 taken), Unlucky = 1 damage (or 3 taken)
- Each luck test reduces CHANCE by 1

### File Structure

```
app/
  characters/          # Character CRUD pages
  adventure/           # Combat, dice, notes features
  components/
    ui/                # shadcn/ui primitives
    character/         # CharacterCard, CharacterForm, StatsDisplay
    adventure/         # CombatInterface, DiceRoller, ProgressTracker
lib/
  storage/             # IndexedDB wrappers (characters.ts, progress.ts)
  game/                # Game logic (combat.ts, dice.ts, character.ts)
  utils/               # export.ts (JSON import/export), validation.ts
  types/               # TypeScript definitions
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

### 4. State Management
- **No Redux/Zustand** - use React hooks (useState, useEffect, useReducer)
- Context API for global state (e.g., active character)
- Persist to IndexedDB via `lib/storage/*` modules
- Export/import characters as JSON via `lib/utils/export.ts`

## Development Workflow

### Commands
```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm lint         # Run ESLint
```

### PWA Testing
- Test install prompt on Android Chrome/Edge and iOS Safari
- Verify offline functionality (DevTools → Network → Offline)
- Check manifest: `app/manifest.ts` and `public/manifest.json`

### Documentation Updates
When adding features, update:
- `docs/FEATURES.md` - User-facing capabilities
- `docs/ARCHITECTURE.md` - Technical data models/flows
- `docs/COMBAT.md` or `docs/CHARACTER_SHEET.md` - Game mechanics (if applicable)

## Common Patterns

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
// Use lib/storage/*.ts wrappers, NOT direct IndexedDB calls
import { saveCharacter, getCharacter } from '@/lib/storage/characters';

await saveCharacter(character);
const loaded = await getCharacter(characterId);
```

## Key Files Reference

- `docs/COMBAT.md` - Complete combat rules with examples
- `docs/THEMING.md` - CSS variables, color palette, component styling
- `docs/CHARACTER_SHEET.md` - Official character sheet structure
- `app/layout.tsx` - PWA metadata and viewport config
- `tsconfig.json` - `@/*` path alias configuration

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
- [La Saga d'Agda Books](https://www.lasagadedagda.fr/)
