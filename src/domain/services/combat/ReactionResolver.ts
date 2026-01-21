import type { CombatState, CombatEvent } from '../../types/combat-state';
import { Attacker } from '../../types/Attacker';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

// Type guard to check if state is V3
function isStateV3(state: CombatState | CombatState): state is CombatState {
  return 'currentTurn' in state && typeof state.currentTurn === 'string';
}

export class ReactionResolver {
  static resolveReroll(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    // All states are V3 now - directly call resolveRerollV3
    return this.resolveRerollV3(state, diceOverrides);
  }

  /* V2 CODE - DEAD CODE - Commented out to fix TypeScript build
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
      phase: 'player_turn' as const,
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

      newState.phase = 'enemy_turn' as const;
    }

    return { state: newState, events };
  }
  END OF V2 DEAD CODE */

  private static resolveRerollV3(
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
    };

    // Advance phase after blocking
    const phaseUpdate = PhaseManager.advancePhase(newState, {});
    return { state: { ...newState, ...phaseUpdate }, events: [] };
  }

  static resolveSkip(state: CombatState): ActionResolutionResult {
    let newState: CombatState = { ...state };

    // Si on a des dégâts en attente, les appliquer
    if (state.pendingDamage) {
      const newEndurance = Math.max(0, state.player.endurance - state.pendingDamage.amount);

      newState = {
        ...state,
        player: { ...state.player, endurance: newEndurance },
        pendingDamage: undefined,
      };
    }

    // Avancer la phase
    const phaseUpdate = PhaseManager.advancePhase(newState, {});
    return { state: { ...newState, ...phaseUpdate }, events: [] };
  }
}
