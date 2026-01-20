# Combat System V3 - Simplified Phase System

## Overview

Combat V3 introduces a simplified phase system with explicit turn tracking, replacing the complex V2 phase machine with a cleaner, more maintainable approach.

## Key Changes from V2

### Phase Simplification

**V2 (6 phases):**
- `SETUP` → `PLAYER_TURN` → `PLAYER_ATTACK` → `ENEMY_TURN` → `ENEMY_ATTACK` → `ROUND_END` → loop

**V3 (4 phases):**
- `WAITING_ATTACK_ROLL` → `WAITING_DAMAGE_ROLL` (if hit) → `TURN_COMPLETE` → next turn
- Or: `WAITING_ATTACK_ROLL` → `TURN_COMPLETE` (if miss) → next turn

### Turn Tracking

**V2:**
```typescript
interface CombatState {
  phase: CombatPhase; // Encodes who's playing
  currentAttacker: Attacker; // 'player' | 'enemy'
}
```

**V3:**
```typescript
interface CombatStateV3 {
  phase: CombatPhaseV3; // Action state
  currentTurn: CurrentTurn; // 'player' | 'enemy' (explicit)
}
```

## Phase Flow

### Complete Round Example

```
ROUND 1 - Player Turn
├─ waiting_attack_roll (player) ──[ATTACK]──> hit?
│  ├─ YES → waiting_damage_roll (player) ──[damage applied]──> turn_complete (player)
│  └─ NO  → turn_complete (player)
│
├─ turn_complete (player) ──[SKIP]──> waiting_attack_roll (enemy)
│
ROUND 1 - Enemy Turn (automatic)
├─ waiting_attack_roll (enemy) ──[auto attack]──> hit?
│  ├─ YES → waiting_damage_roll (enemy) ──[auto damage]──> turn_complete (enemy)
│  └─ NO  → turn_complete (enemy)
│
├─ turn_complete (enemy) ──[SKIP]──> ROUND 2 - Player Turn
```

## Available Actions by Phase

| Phase | currentTurn | Actions |
|-------|------------|---------|
| `waiting_attack_roll` | `player` | `ATTACK`, `WEAPON_ABILITY` (MANUAL) |
| `waiting_attack_roll` | `enemy` | (automatic) |
| `waiting_damage_roll` | `player` | (automatic) |
| `waiting_damage_roll` | `enemy` | (automatic) |
| `turn_complete` | * | `SKIP` (advance to next turn) |
| `ended` | * | (none) |

### Contextual Weapon Abilities

- **ON_MISS** abilities: Available in `turn_complete` after a missed attack
- **ON_ENEMY_HIT** abilities: Available in `waiting_damage_roll` during enemy turn
- **MANUAL** abilities: Available in `waiting_attack_roll` during player turn
- **Auto-triggered** (ON_DOUBLE, ON_KILL, ON_SURPRISE): Never manual

## Round Increment Logic

```typescript
// Round increments ONLY when enemy completes their turn
if (phase === TURN_COMPLETE && currentTurn === 'enemy') {
  roundNumber++; // Start new round
  currentTurn = 'player';
  phase = WAITING_ATTACK_ROLL;
}
```

## Implementation

### Core Classes

#### PhaseManagerV3

```typescript
class PhaseManagerV3 {
  static getInitialPhase(): CombatPhaseV3;
  static getInitialTurn(firstAttacker: 'player' | 'enemy'): CurrentTurn;
  
  static advancePhase(
    state: CombatStateV3,
    context: { hit?: boolean; combatEnded?: boolean }
  ): { phase: CombatPhaseV3; currentTurn: CurrentTurn; roundNumber: number };
  
  static skipToNextTurn(state: CombatStateV3): { ... };
}
```

#### CombatValidatorV3

```typescript
class CombatValidatorV3 {
  static checkCombatEnd(state: CombatStateV3): 'ongoing' | 'victory' | 'defeat';
  static getAvailableActions(state: CombatStateV3): AvailableAction[];
}
```

### State Structure

```typescript
interface CombatStateV3 {
  // Identifiers
  id: string;
  characterId: string;
  
  // Combatants
  player: PlayerState;
  enemy: EnemyState;
  
  // V3 Core State
  phase: CombatPhaseV3;
  currentTurn: CurrentTurn;
  roundNumber: number;
  
  // Context
  lastRoll?: DiceRoll;
  pendingDamage?: PendingDamage;
  usedAbilities: Record<string, number>;
  usedReroll: boolean;
  isFirstAttack: boolean;
  pendingExtraAttack?: boolean;
  
  // Config & History
  config: CombatConfig;
  events: CombatEvent[];
  usedItems: UsedItem[];
}
```

## Migration from V2

### Breaking Changes

1. **Phase names changed**: `PLAYER_TURN` → `WAITING_ATTACK_ROLL`
2. **currentAttacker renamed**: `currentAttacker: Attacker` → `currentTurn: CurrentTurn`
3. **Type change**: `Attacker` enum → string literal type `'player' | 'enemy'`

### Compatibility

- ✅ **WeaponAbilityResolver**: Compatible (uses `WeaponAbilityCheckState` interface)
- ✅ **CombatEvent**: Unchanged
- ✅ **PlayerState / EnemyState**: Unchanged
- ❌ **CombatEngine**: Needs V3 adaptation (future work)
- ❌ **AttackResolver**: Needs V3 adaptation (future work)

## Testing

### Coverage

- **PhaseManagerV3**: 18 tests
  - Initial state
  - Attack roll transitions (hit/miss)
  - Damage roll transitions
  - Turn alternation
  - Round increment
  - Combat end conditions
  - Complete flow scenarios

- **CombatValidatorV3**: 15 tests
  - Combat end detection
  - Available actions per phase
  - Weapon ability triggers
  - Event creation

### Running Tests

```bash
pnpm test PhaseManagerV3.test.ts
pnpm test CombatValidatorV3.test.ts
```

## Files

### New Files

- `src/domain/types/CombatPhaseV3.ts` - Phase enum + CurrentTurn type
- `src/domain/types/combat-state.ts` - CombatStateV3 interface (added)
- `src/domain/services/combat/PhaseManagerV3.ts` - Phase logic
- `src/domain/services/combat/CombatValidatorV3.ts` - Validation logic
- `tests/domain/services/PhaseManagerV3.test.ts` - Tests (18)
- `tests/domain/services/CombatValidatorV3.test.ts` - Tests (15)

### Modified Files

- `src/domain/types/index.ts` - Export V3 types
- `src/domain/services/combat/WeaponAbilityResolver.ts` - Generic compatibility

## Next Steps

1. ✅ **Issue #119**: Simplified phase system (DONE)
2. 🔄 **Future**: Adapt CombatEngine to use V3
3. 🔄 **Future**: Create AttackResolverV3
4. 🔄 **Future**: Update UI components to use V3
5. 🔄 **Future**: Deprecate V2 system

## References

- Issue #119: https://github.com/bertrandgressier/adventure-tome/issues/119
- Epic #115: Combat V3
- Related: Issue #120 (CHANCE restriction)
