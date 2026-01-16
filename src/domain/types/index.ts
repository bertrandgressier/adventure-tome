// V1 Combat types (legacy)
export type { Enemy, CombatRound, CombatMode } from './combat';
export type { CombatState as CombatStateV1 } from './combat';

// V2 Combat types (current)
export * from './combat-v2';

// Combat constants
export { CombatActionType } from './CombatActionType';
export { CombatEventType } from './CombatEventType';
export { CombatPhase } from './CombatPhase';
export { WeaponAbilityTrigger } from './WeaponAbilityTrigger';
export { WeaponEffectType } from './WeaponEffectType';
export { Attacker } from './Attacker';
export { TargetRoll } from './TargetRoll';
