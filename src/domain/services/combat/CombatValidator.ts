import type { CombatState, CombatEvent, AvailableAction } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatEventType } from '../../types/CombatEventType';

export class CombatValidator {
  static checkCombatEnd(state: CombatState): 'ongoing' | 'victory' | 'defeat' {
    if (state.player.endurance <= 0) {
      return 'defeat';
    }

    const allEnemiesDefeated = state.enemies.every(
      (enemy: typeof state.enemies[0]) => enemy.endurance <= 0
    );
    if (allEnemiesDefeated) {
      return 'victory';
    }

    return 'ongoing';
  }

  static getAvailableActions(state: CombatState): AvailableAction[] {
    const actions: AvailableAction[] = [];

    if (state.phase === CombatPhase.PLAYER_TURN) {
      actions.push({ action: { type: CombatActionType.ATTACK }, enabled: true });

      const hasUsableItems = state.player.weapon.ability !== undefined;
      if (hasUsableItems) {
        actions.push({ action: { type: CombatActionType.USE_ITEM, payload: {} }, enabled: true });
      }

      if (state.config.allowFlee) {
        const canFlee = state.player.endurance > (state.config.fleeCost ?? 2);
        actions.push({
          action: { type: CombatActionType.FLEE },
          enabled: canFlee,
          disabledReason: canFlee ? undefined : 'Endurance insuffisante pour fuir',
        });
      }
    }

    if (state.phase === CombatPhase.PLAYER_ATTACK) {
      if (state.lastRoll && !state.lastRoll.success) {
        if (!state.usedReroll) {
          actions.push({ action: { type: CombatActionType.REROLL }, enabled: true });
        }
        actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
      }
    }

    if (state.phase === CombatPhase.PLAYER_ATTACK) {
      if (state.player.chance > 0) {
        actions.push({ action: { type: CombatActionType.SPEND_CHANCE, payload: {} }, enabled: true });
      }
    }

    if (state.phase === CombatPhase.ENEMY_ATTACK) {
      if (state.pendingDamage?.canBlock) {
        actions.push({ action: { type: CombatActionType.BLOCK }, enabled: true });
      }
      actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
    }

    return actions;
  }

  static createCombatEndEvent(state: CombatState, result: 'victory' | 'defeat'): CombatEvent {
    return {
      type: CombatEventType.COMBAT_END,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      attacker: 'player',
      result,
    };
  }

  static createRoundStartEvent(roundNumber: number): CombatEvent {
    return {
      type: CombatEventType.ROUND_START,
      timestamp: new Date().toISOString(),
      round: roundNumber,
    };
  }

  static createRoundEndEvent(roundNumber: number): CombatEvent {
    return {
      type: CombatEventType.ROUND_END,
      timestamp: new Date().toISOString(),
      round: roundNumber,
    };
  }
}
