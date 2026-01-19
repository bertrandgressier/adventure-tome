import type { CombatState, CombatEvent } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';
import { Attacker } from '../../types/Attacker';
import { TargetRoll } from '../../types/TargetRoll';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

export class ReactionResolver {
  static resolveReroll(
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
      const targetEnemy = newState.enemies[newState.activeEnemyIndex];
      const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

      newState.enemies = newState.enemies.map((enemy: typeof newState.enemies[0], index: number) =>
        index === newState.activeEnemyIndex
          ? { ...enemy, endurance: newEnemyEndurance }
          : enemy
      );

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

  static resolveSpendChance(
    state: CombatState,
    pointsToSpend: number,
    targetRoll: TargetRoll
  ): ActionResolutionResult {
    if (pointsToSpend <= 0 || pointsToSpend > state.player.chance) {
      return { state, events: [] };
    }

    if (!state.lastRoll) {
      return { state, events: [] };
    }

    const newRoll = {
      ...state.lastRoll,
      modifier: pointsToSpend,
      modifiedTotal: state.lastRoll.total + pointsToSpend,
    };

    const newPlayer = {
      ...state.player,
      chance: state.player.chance - pointsToSpend,
    };

    const newState: CombatState = {
      ...state,
      player: newPlayer,
      lastRoll: newRoll,
    };

    const events: CombatEvent[] = [
      {
        type: CombatEventType.CHANCE_SPENT,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: Attacker.PLAYER,
        pointsSpent: pointsToSpend,
      },
    ];

    if (targetRoll === TargetRoll.HIT && state.phase === CombatPhase.PLAYER_ATTACK) {
      const dexterite = state.player.dexterite;
      const hit = newRoll.modifiedTotal <= dexterite;

      const finalState = { ...newState, phase: CombatPhase.PLAYER_TURN };

      if (hit) {
        const damage = DiceRoller.calculateDamage(state.player.totalDamageBonus);
        const targetEnemy = finalState.enemies[finalState.activeEnemyIndex];
        const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

        finalState.enemies = finalState.enemies.map((enemy: typeof finalState.enemies[0], index: number) =>
          index === finalState.activeEnemyIndex
            ? { ...enemy, endurance: newEnemyEndurance }
            : enemy
        );

        events.push({
          type: CombatEventType.DAMAGE_DEALT,
          timestamp: new Date().toISOString(),
          round: state.roundNumber,
          attacker: Attacker.PLAYER,
          damage,
        });

        return { state: { ...finalState, phase: PhaseManager.advancePhase(finalState) }, events };
      }

      return { state: finalState, events };
    }

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
