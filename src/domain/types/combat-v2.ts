import type { CombatPhase } from './CombatPhase';
import type { CombatActionType } from './CombatActionType';
import type { WeaponAbilityTrigger } from './WeaponAbilityTrigger';
import type { CombatEventType } from './CombatEventType';

export type { CombatPhase };
export type { CombatActionType };
export type { WeaponAbilityTrigger };
export type { CombatEventType };

export type {
  CombatantState,
  CombatantConfig,
  EnemyState,
  EnemyConfig,
  CombatWeapon,
  WeaponAbility,
  WeaponEffect,
  DiceRoll,
  PendingDamage,
  CombatConfig,
} from './combatants';

export type {
  CombatState,
  CombatEvent,
  CombatAction,
} from './combat-state';

export type {
  DiceOverrides,
  AvailableAction,
  CombatResult,
} from '../services/combat/types';
