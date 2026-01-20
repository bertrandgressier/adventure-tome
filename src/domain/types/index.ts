// V1 Combat types (legacy)
export type { Enemy, CombatRound, CombatMode } from './combat';
export type { CombatState as CombatStateV1 } from './combat';

// V3 Combat types (main system)
export { CombatPhaseV3, type CurrentTurn } from './CombatPhaseV3';
export type { 
  CombatState, 
  CombatEvent, 
  CombatAction, 
  AvailableAction,
  UsedItem 
} from './combat-state';

// Combat History types
export type {
  CombatHistoryEntry,
  HitRollDetails,
  DamageRollDetails,
  HPSnapshot,
} from './combat-history';

// Combat constants
export { CombatActionType } from './CombatActionType';
export { CombatEventType } from './CombatEventType';
export { CombatPhase } from './CombatPhase';
export { WeaponAbilityTrigger } from './WeaponAbilityTrigger';
export { WeaponEffectType } from './WeaponEffectType';
export { Attacker } from './Attacker';
export { TargetRoll } from './TargetRoll';

// Combatants types  
export type {
  CombatantState,
  PlayerState,
  EnemyState,
  PlayerConfig,
  EnemyConfig,
  CombatConfig,
  CombatWeapon,
  WeaponAbility,
  PendingDamage,
  DiceRoll,
} from './combatants';
