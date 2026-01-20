// V1 Combat types (legacy)
export type { Enemy, CombatRound, CombatMode } from './combat';
export type { CombatState as CombatStateV1 } from './combat';

// V2 Combat types (current)
export * from './combat-v2';

// V3 Combat types (new simplified system)
export { CombatPhaseV3, type CurrentTurn } from './CombatPhaseV3';
export type { CombatStateV3 } from './combat-state';

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
