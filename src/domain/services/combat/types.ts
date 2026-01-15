import type { CombatState, CombatEvent, CombatAction } from '../../types/combat-state';
import type { DiceOverrides } from './DiceRoller';

export type { DiceOverrides };

export interface AvailableAction {
  action: CombatAction;
  enabled: boolean;
  disabledReason?: string;
}

/**
 * Result of a combat action resolution.
 * Returned by all resolvers (AttackResolver, ReactionResolver, etc.)
 */
export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

/**
 * Alias for ActionResolutionResult used by CombatEngine.resolve()
 */
export type CombatResult = ActionResolutionResult;
