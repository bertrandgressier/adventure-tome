import type { CombatPhase } from './CombatPhase';
import type { CombatActionType } from './CombatActionType';
import type { CombatantState, EnemyState, DiceRoll, PendingDamage, CombatConfig } from './combatants';

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

export interface CombatAction {
  type: CombatActionType;
  payload?: unknown;
}
