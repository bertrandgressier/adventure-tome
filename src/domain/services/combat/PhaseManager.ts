import type { CombatState } from '../../types/combat-state';
import { CombatPhase, type CurrentTurn } from '../../types/CombatPhase';

export class PhaseManager {
  /**
   * Détermine la phase initiale du combat selon le premier attaquant
   */
  static getInitialPhase(): CombatPhase {
    return CombatPhase.WAITING_ATTACK_ROLL;
  }

  /**
   * Détermine le tour initial selon firstAttacker
   */
  static getInitialTurn(firstAttacker: 'player' | 'enemy'): CurrentTurn {
    return firstAttacker;
  }

  /**
   * Avance la phase selon l'état actuel et le résultat de l'action
   */
  static advancePhase(
    state: CombatState,
    context: {
      hit?: boolean;
      combatEnded?: boolean;
    }
  ): { phase: CombatPhase; currentTurn: CurrentTurn; roundNumber: number } {
    if (context.combatEnded) {
      return {
        phase: CombatPhase.ENDED,
        currentTurn: state.currentTurn,
        roundNumber: state.roundNumber,
      };
    }

    switch (state.phase) {
      case CombatPhase.WAITING_ATTACK_ROLL:
        if (context.hit) {
          return {
            phase: CombatPhase.WAITING_DAMAGE_ROLL,
            currentTurn: state.currentTurn,
            roundNumber: state.roundNumber,
          };
        } else {
          return {
            phase: CombatPhase.TURN_COMPLETE,
            currentTurn: state.currentTurn,
            roundNumber: state.roundNumber,
          };
        }

      case CombatPhase.WAITING_DAMAGE_ROLL:
        return {
          phase: CombatPhase.TURN_COMPLETE,
          currentTurn: state.currentTurn,
          roundNumber: state.roundNumber,
        };

      case CombatPhase.TURN_COMPLETE: {
        const nextTurn: CurrentTurn = state.currentTurn === 'player' ? 'enemy' : 'player';
        const shouldIncrementRound = state.currentTurn === 'enemy';

        return {
          phase: CombatPhase.WAITING_ATTACK_ROLL,
          currentTurn: nextTurn,
          roundNumber: shouldIncrementRound ? state.roundNumber + 1 : state.roundNumber,
        };
      }

      case CombatPhase.ENDED:
        return {
          phase: CombatPhase.ENDED,
          currentTurn: state.currentTurn,
          roundNumber: state.roundNumber,
        };

      default:
        return {
          phase: state.phase,
          currentTurn: state.currentTurn,
          roundNumber: state.roundNumber,
        };
    }
  }

  /**
   * Passe au tour suivant (action SKIP sur turn_complete)
   */
  static skipToNextTurn(state: CombatState): {
    phase: CombatPhase;
    currentTurn: CurrentTurn;
    roundNumber: number;
  } {
    if (state.phase !== CombatPhase.TURN_COMPLETE) {
      return {
        phase: state.phase,
        currentTurn: state.currentTurn,
        roundNumber: state.roundNumber,
      };
    }

    return this.advancePhase(state, {});
  }
}
