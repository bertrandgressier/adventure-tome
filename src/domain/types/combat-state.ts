import type { CombatPhaseV3, CurrentTurn } from '../../types/CombatPhaseV3';
import type { CombatActionType } from './CombatActionType';
import type { Attacker } from './Attacker';
import type { PlayerState, EnemyState, DiceRoll, PendingDamage, CombatConfig } from './combatants';
import { CombatEventType } from './CombatEventType';
import type { CombatHistoryEntry } from './combat-history';

/**
 * Item utilisé pendant le combat, à consommer à la fin
 */
export interface UsedItem {
  itemId: string;
  itemIndex: number;
}

/**
 * CombatState - État du combat avec phases simplifiées et currentTurn
 */
export interface CombatState {
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
  /** Historique détaillé du combat avec jets et HP tracking */
  history: CombatHistoryEntry[];
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

export interface AvailableAction {
  action: CombatAction;
  enabled: boolean;
  disabledReason?: string;
}
