import type {
  CombatState,
  CombatAction,
  CombatEvent,
} from '../../types/combat-v2';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatPhase } from '../../types/CombatPhase';
import type { CombatantConfig, EnemyConfig } from '../../types/combatants';
import type { DiceOverrides } from './DiceRoller';
import { AttackResolver } from './AttackResolver';
import { ReactionResolver } from './ReactionResolver';
import { CombatValidator } from './CombatValidator';

export type CombatResult = {
  state: CombatState;
  events: CombatEvent[];
};

export class CombatEngine {
  private static generateId(): string {
    return `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createInitialState(
    characterId: string,
    player: CombatantConfig,
    enemies: EnemyConfig[],
    config: { allowFlee: boolean; maxEnemies: number; damageFormula: string; firstAttacker?: 'player' | 'enemy'; fleeCost?: number }
  ): CombatState {
    const state: CombatState = {
      id: this.generateId(),
      characterId,
      player: {
        ...player,
        endurance: player.endurance,
      },
      enemies: enemies.map((enemy) => ({
        ...enemy,
        endurance: enemy.endurance,
      })),
      activeEnemyIndex: 0,
      phase: CombatPhase.PLAYER_TURN,
      roundNumber: 1,
      currentAttacker: config.firstAttacker ?? 'player',
      config: {
        fleeCost: config.fleeCost ?? 2,
        allowFlee: config.allowFlee,
        maxEnemies: config.maxEnemies,
        damageFormula: config.damageFormula,
        firstAttacker: config.firstAttacker ?? 'player',
      },
      usedAbilities: {},
      usedReroll: false,
      isFirstAttack: true,
      events: [
        {
          type: 'combat_start',
          timestamp: new Date().toISOString(),
          round: 1,
        },
      ],
    };

    return state;
  }

  static resolve(
    state: CombatState,
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    const combatEndStatus = CombatValidator.checkCombatEnd(state);
    if (combatEndStatus !== 'ongoing') {
      return { state, events: [] };
    }

    switch (action.type) {
      case CombatActionType.ATTACK:
        return AttackResolver.resolve(state, diceOverrides);
      case CombatActionType.USE_ITEM:
        return { state, events: [] };
      case CombatActionType.FLEE:
        return ReactionResolver.resolveFlee(state);
      case CombatActionType.REROLL:
        return ReactionResolver.resolveReroll(state, diceOverrides);
      case CombatActionType.USE_LUCK:
        return ReactionResolver.resolveUseLuck(state, diceOverrides);
      case CombatActionType.BLOCK:
        return ReactionResolver.resolveBlock(state);
      case CombatActionType.SKIP:
        return ReactionResolver.resolveSkip(state);
      default:
        return { state, events: [] };
    }
  }

  static getAvailableActions(state: CombatState) {
    return CombatValidator.getAvailableActions(state);
  }

  static checkCombatEnd(state: CombatState) {
    return CombatValidator.checkCombatEnd(state);
  }
}
