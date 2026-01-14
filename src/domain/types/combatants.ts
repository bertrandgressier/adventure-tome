import type { WeaponAbilityTrigger } from './WeaponAbilityTrigger';

export interface CombatantState {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  chance: number;
  weapon: CombatWeapon;
}

export interface CombatantConfig {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  chance: number;
  weapon: CombatWeapon;
}

export interface EnemyConfig extends CombatantConfig {
  isBoss: boolean;
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

export type WeaponEffect =
  | { type: 'extra_attack' }
  | { type: 'heal_on_kill'; amount: number }
  | { type: 'convert_miss_to_hit' }
  | { type: 'bonus_damage'; amount: number; firstAttackOnly?: boolean }
  | { type: 'negate_damage' };

export interface EnemyState extends CombatantState {
  isBoss: boolean;
}

export interface DiceRoll {
  dice1: number;
  dice2: number;
  total: number;
  modifier?: number;
  modifiedTotal?: number;
  isDouble?: boolean;
  success?: boolean;
}

export interface PendingDamage {
  amount: number;
  canUseLuck: boolean;
  canBlock: boolean;
}

export interface CombatConfig {
  fleeCost?: number;
  allowFlee: boolean;
  maxEnemies: number;
  damageFormula: string;
  firstAttacker?: 'player' | 'enemy';
}
