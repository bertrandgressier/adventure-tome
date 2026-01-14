import type { CombatState, CombatEvent } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

export class ReactionResolver {
  static resolveFlee(state: CombatState): ActionResolutionResult {
    const fleeCost = state.config.fleeCost ?? 2;
    const newEndurance = Math.max(0, state.player.endurance - fleeCost);

    const newState: CombatState = {
      ...state,
      player: { ...state.player, endurance: newEndurance },
      phase: CombatPhase.DEFEAT,
      events: [
        ...state.events,
        {
          type: CombatEventType.FLEE,
          timestamp: new Date().toISOString(),
          round: state.roundNumber,
          attacker: 'player',
          damage: fleeCost,
        },
      ],
    };

    return { state: newState, events: newState.events };
  }

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
        attacker: 'player',
        roll: diceRoll,
        hit,
      },
    ];

    if (hit) {
      const damage = DiceRoller.calculateDamage(state.player.weapon.bonus, diceOverrides?.damageDice);
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
        attacker: 'player',
        damage,
      });

      newState.phase = CombatPhase.ENEMY_TURN;
    }

    return { state: newState, events };
  }

  static resolveUseLuck(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    if (!state.pendingDamage || !state.pendingDamage.canUseLuck) {
      return { state, events: [] };
    }

    const diceRoll = DiceRoller.rollHitDice(diceOverrides?.luckDice);
    const luckSuccess = diceRoll.total <= state.player.chance;

    let damage = state.pendingDamage.amount;

    if (luckSuccess) {
      damage = Math.max(1, damage - 1);
    } else {
      damage = damage + 1;
    }

    const newEndurance = Math.max(0, state.player.endurance - damage);

    let newState: CombatState = {
      ...state,
      player: { ...state.player, endurance: newEndurance },
      pendingDamage: undefined,
      phase: CombatPhase.PLAYER_TURN,
    };

    const events: CombatEvent[] = [
      {
        type: CombatEventType.LUCK_TEST,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: 'enemy',
        roll: diceRoll,
        luckResult: luckSuccess ? 'success' : 'failure',
      },
      {
        type: CombatEventType.DAMAGE_DEALT,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: 'enemy',
        damage,
      },
    ];

    newState = { ...newState, phase: PhaseManager.advancePhase(newState) };

    return { state: newState, events };
  }

  static resolveBlock(state: CombatState): ActionResolutionResult {
    if (!state.pendingDamage || !state.pendingDamage.canBlock) {
      return { state, events: [] };
    }

    let newState: CombatState = {
      ...state,
      pendingDamage: undefined,
      phase: CombatPhase.PLAYER_TURN,
    };

    newState = { ...newState, phase: PhaseManager.advancePhase(newState) };

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
      };

      newState = { ...newState, phase: PhaseManager.advancePhase(newState) };
    }

    return { state: newState, events: [] };
  }
}
