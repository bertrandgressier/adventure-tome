import type { WeaponAbilityTrigger } from './WeaponAbilityTrigger';
import type { WeaponEffectType } from './WeaponEffectType';
import type { TargetRoll } from './TargetRoll';
import type { Attacker } from './Attacker';

export interface CombatantState {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  weaponDamage: number;
  passiveDamageBonus: number;
  totalDamageBonus: number;
}

export interface PlayerState extends CombatantState {
  chance: number;
  weapon: CombatWeapon;
}

export type EnemyState = CombatantState;

export interface BaseCombatantConfig {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
}

export interface PlayerConfig extends BaseCombatantConfig {
  chance: number;
  weapon: CombatWeapon;
}

export type EnemyConfig = BaseCombatantConfig;

export interface CombatantConfig extends BaseCombatantConfig {
  chance: number;
  weapon: CombatWeapon;
}

export interface CombatWeapon {
  id: string;
  name: string;
  bonus: number;
  ability?: WeaponAbility;
}

export interface WeaponAbility {
  id: string;
  name: string;
  trigger: WeaponAbilityTrigger;
  effect: WeaponEffect;
  usesPerCombat?: number;
  costChance?: number;
}

/**
 * Effet d'une arme légendaire
 * Les valeurs 'type' correspondent aux constantes de WeaponEffectType
 */
export type WeaponEffect =
  | { type: WeaponEffectType & 'extra_attack' }
  | { type: WeaponEffectType & 'heal_on_kill'; amount: number }
  | { type: WeaponEffectType & 'convert_miss_to_hit' }
  | { type: WeaponEffectType & 'bonus_damage'; amount: number; firstAttackOnly?: boolean }
  | { type: WeaponEffectType & 'negate_damage' };

export interface DiceRoll {
  dice1: number;
  dice2: number;
  total: number;
  modifier?: number;
  modifiedTotal?: number;
  isDouble?: boolean;
  success?: boolean;
}

export interface ChanceModifier {
  targetRoll: TargetRoll;
  pointsSpent: number;
}

export interface PendingDamage {
  amount: number;
  canBlock: boolean;
}

export interface CombatConfig {
  damageFormula: string;
  firstAttacker?: Attacker;
  isSurprise?: boolean;
}
