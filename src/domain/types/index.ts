// V1 Combat types (legacy)
export type { Enemy, CombatRound, CombatMode } from './combat';
export type { CombatState as CombatStateV1 } from './combat';

// Combat types (main system)
export { CombatPhase, type CurrentTurn } from './CombatPhase';
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
