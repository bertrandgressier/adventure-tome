import type { CombatPhase } from './CombatPhase';
import type { CombatPhaseV3, CurrentTurn } from './CombatPhaseV3';
import type { CombatActionType } from './CombatActionType';
import type { Attacker } from './Attacker';
import type { PlayerState, EnemyState, DiceRoll, PendingDamage, CombatConfig } from './combatants';
import { CombatEventType } from './CombatEventType';

/**
 * Item utilisé pendant le combat, à consommer à la fin
 */
export interface UsedItem {
  itemId: string;
  itemIndex: number;
}

export interface CombatState {
  id: string;
  characterId: string;
  player: PlayerState;
  enemy: EnemyState;
  phase: CombatPhase;
  roundNumber: number;
  currentAttacker: Attacker;
  lastRoll?: DiceRoll;
  pendingDamage?: PendingDamage;
  usedAbilities: Record<string, number>;
  usedReroll: boolean;
  isFirstAttack: boolean;
  pendingExtraAttack?: boolean;
  config: CombatConfig;
  events: CombatEvent[];
  /** Items utilisés pendant le combat, à consommer via consumeItem() à la fin */
  usedItems: UsedItem[];
}

/**
 * CombatStateV3 - État du combat avec phases simplifiées et currentTurn
 */
export interface CombatStateV3 {
  id: string;
  characterId: string;
  player: PlayerState;
  enemy: EnemyState;
  phase: CombatPhaseV3;
  currentTurn: CurrentTurn;
  roundNumber: number;
  lastRoll?: DiceRoll;
  pendingDamage?: PendingDamage;
  usedAbilities: Record<string, number>;
  usedReroll: boolean;
  isFirstAttack: boolean;
  pendingExtraAttack?: boolean;
  config: CombatConfig;
  events: CombatEvent[];
  usedItems: UsedItem[];
}

export interface CombatEvent {
  type: CombatEventType;
  timestamp: string;
  round?: number;
  attacker?: Attacker;
  roll?: DiceRoll;
  hit?: boolean;
  damage?: number;
  healAmount?: number;
  abilityId?: string;
  luckUsed?: boolean;
  luckResult?: 'success' | 'failure';
  result?: 'victory' | 'defeat';
  pointsSpent?: number;
}

export interface CombatAction {
  type: CombatActionType;
  payload?: unknown;
}
