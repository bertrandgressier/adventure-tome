import type { CombatAction, CombatState, CombatEvent } from '../../types/combat-state';
import type { DiceRoll } from '../../types/combatants';

export interface DiceOverrides {
  hitDice?: [number, number];
  damageDice?: number;
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
