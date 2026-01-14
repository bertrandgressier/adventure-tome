import type { CombatAction, CombatState } from '../../types/combat-state';
import type { DiceRoll } from '../../types/combatants';

export interface DiceOverrides {
  hitDice?: [number, number];
  damageDice?: number;
  luckDice?: [number, number];
}

export interface AvailableAction {
  action: CombatAction;
  enabled: boolean;
  disabledReason?: string;
}

export interface CombatResult {
  state: CombatState;
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
