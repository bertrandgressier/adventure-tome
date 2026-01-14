export type CombatPhase = 
  | 'setup'
  | 'player_turn'
  | 'player_attack'
  | 'enemy_turn'
  | 'enemy_attack'
  | 'round_end'
  | 'victory'
  | 'defeat';

export type CombatActionType = 
  | 'attack'
  | 'use_item'
  | 'use_luck'
  | 'weapon_ability'
  | 'flee'
  | 'reroll'
  | 'block'
  | 'skip';

export type WeaponAbilityTrigger = 
  | 'on_double'
  | 'on_kill'
  | 'on_miss'
  | 'on_surprise'
  | 'on_enemy_hit'
  | 'manual';

export type WeaponEffect = 
  | { type: 'extra_attack' }
  | { type: 'heal_on_kill'; amount: number }
  | { type: 'convert_miss_to_hit' }
  | { type: 'bonus_damage'; amount: number; firstAttackOnly?: boolean }
  | { type: 'negate_damage' };

export interface WeaponAbility {
  id: string;
  name: string;
  trigger: WeaponAbilityTrigger;
  effect: WeaponEffect;
  usesPerCombat?: number;
  costChance?: number;
}

export interface CombatantState {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  chance: number;
  weapon: CombatWeapon;
}

export interface CombatWeapon {
  id: string;
  name: string;
  bonus: number;
  ability?: WeaponAbility;
}

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

export interface CombatEvent {
  type: 'combat_start' | 'combat_end' | 'round_start' | 'round_end' | 'attack_roll' | 'damage_dealt' | 'heal' | 'ability_used' | 'luck_test' | 'flee';
  timestamp: string;
  round?: number;
  attacker?: 'player' | 'enemy';
  roll?: DiceRoll;
  hit?: boolean;
  damage?: number;
  healAmount?: number;
  abilityId?: string;
  luckUsed?: boolean;
  luckResult?: 'success' | 'failure';
  result?: 'victory' | 'defeat';
}

export interface CombatState {
  id: string;
  characterId: string;
  player: CombatantState;
  enemies: EnemyState[];
  activeEnemyIndex: number;
  phase: CombatPhase;
  roundNumber: number;
  currentAttacker: 'player' | 'enemy';
  lastRoll?: DiceRoll;
  pendingDamage?: PendingDamage;
  usedAbilities: Record<string, number>;
  usedReroll: boolean;
  isFirstAttack: boolean;
  config: CombatConfig;
  events: CombatEvent[];
}

export interface CombatAction {
  type: CombatActionType;
  payload?: unknown;
}

export interface AvailableAction {
  action: CombatAction;
  enabled: boolean;
  disabledReason?: string;
}

export interface DiceOverrides {
  hitDice?: [number, number];
  damageDice?: number;
  luckDice?: [number, number];
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

export interface UsableItem {
  itemId: string;
  name: string;
  quantity: number;
  effect: ItemEffect;
}

export type ItemEffect = 
  | { type: 'heal'; amount: number }
  | { type: 'damage_enemy'; amount: number }
  | { type: 'boost_dexterity'; amount: number; duration?: number }
  | { type: 'boost_luck'; amount: number; duration?: number };
