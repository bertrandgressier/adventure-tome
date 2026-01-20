import type { CombatState, CombatEvent } from '../../types/combat-v2';
import type { CombatStateV3 } from '../../types/combat-state';
import { CombatPhase } from '../../types/CombatPhase';
import { Attacker } from '../../types/Attacker';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

export interface ActionResolutionResultV3 {
  state: CombatStateV3;
  events: CombatEvent[];
}

// Type guard to check if state is V3
function isStateV3(state: any): state is CombatStateV3 {
  return 'currentTurn' in state && typeof state.currentTurn === 'string';
}

export class ReactionResolver {
  // Overload for V2 state
  static resolveReroll(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult;
  
  // Overload for V3 state
  static resolveReroll(
    state: CombatStateV3,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResultV3;
  
  // Implementation
  static resolveReroll(
    state: CombatState | CombatStateV3,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult | ActionResolutionResultV3 {
    if (isStateV3(state)) {
      return this.resolveRerollV3(state, diceOverrides);
    }
    return this.resolveRerollV2(state as CombatState, diceOverrides);
  }

  private static resolveRerollV2(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    if (!state.lastRoll || state.usedReroll) {
      return { state, events: [] };
    }

    const diceRoll = DiceRoller.rollHitDice(diceOverrides?.hitDice);
    const dexterite = state.player.dexterite;
    const hit = diceRoll.total <= dexterite;

    const newState: CombatState = {
      ...state,
      lastRoll: {
        ...diceRoll,
        success: hit,
      },
      usedReroll: true,
      phase: CombatPhase.PLAYER_TURN,
    };

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ATTACK_ROLL,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: Attacker.PLAYER,
        roll: diceRoll,
        hit,
      },
    ];

    if (hit) {
      const damage = DiceRoller.calculateDamage(state.player.totalDamageBonus, diceOverrides?.damageDice);
      const targetEnemy = newState.enemy;
      const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

      newState.enemy = { ...newState.enemy, endurance: newEnemyEndurance };

      events.push({
        type: CombatEventType.DAMAGE_DEALT,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: Attacker.PLAYER,
        damage,
      });

      newState.phase = CombatPhase.ENEMY_TURN;
    }

    return { state: newState, events };
  }

  private static resolveRerollV3(
    state: CombatStateV3,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResultV3 {
    if (!state.lastRoll || state.usedReroll) {
      return { state, events: [] };
    }

    const diceRoll = DiceRoller.rollHitDice(diceOverrides?.hitDice);
    const dexterite = state.player.dexterite;
    const hit = diceRoll.total <= dexterite;

    const newState: CombatStateV3 = {
      ...state,
      lastRoll: {
        ...diceRoll,
        success: hit,
        isDouble: diceRoll.dice1 === diceRoll.dice2,
      },
      usedReroll: true,
    };

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ATTACK_ROLL,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: Attacker.PLAYER,
        roll: diceRoll,
        hit,
      },
    ];

    return { state: newState, events };
  }

  static resolveBlock(state: CombatState): ActionResolutionResult {
    if (!state.pendingDamage || !state.pendingDamage.canBlock) {
      return { state, events: [] };
    }

    const newState: CombatState = {
      ...state,
      pendingDamage: undefined,
      phase: CombatPhase.PLAYER_TURN,
    };

    return { state: newState, events: [] };
  }

  static resolveSkip(state: CombatState): ActionResolutionResult {
    let newState: CombatState = { ...state };

    if (state.phase === CombatPhase.PLAYER_ATTACK) {
      newState = { ...newState, phase: PhaseManager.advancePhase(newState) };
    } else if (state.phase === CombatPhase.ENEMY_ATTACK && state.pendingDamage) {
      const newEndurance = Math.max(0, state.player.endurance - state.pendingDamage.amount);

      newState = {
        ...state,
        player: { ...state.player, endurance: newEndurance },
        pendingDamage: undefined,
        phase: CombatPhase.PLAYER_TURN,
        roundNumber: state.roundNumber + 1,
      };
    }

    return { state: newState, events: [] };
  }
}
