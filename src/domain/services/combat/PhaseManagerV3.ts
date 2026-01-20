import type { CombatStateV3 } from '../../types/combat-state';
import { CombatPhaseV3, type CurrentTurn } from '../../types/CombatPhaseV3';

export class PhaseManagerV3 {
  /**
   * Détermine la phase initiale du combat selon le premier attaquant
   */
  static getInitialPhase(): CombatPhaseV3 {
    return CombatPhaseV3.WAITING_ATTACK_ROLL;
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
    state: CombatStateV3,
    context: {
      hit?: boolean;
      combatEnded?: boolean;
    }
  ): { phase: CombatPhaseV3; currentTurn: CurrentTurn; roundNumber: number } {
    if (context.combatEnded) {
      return {
        phase: CombatPhaseV3.ENDED,
        currentTurn: state.currentTurn,
        roundNumber: state.roundNumber,
      };
    }

    switch (state.phase) {
      case CombatPhaseV3.WAITING_ATTACK_ROLL:
        if (context.hit) {
          return {
            phase: CombatPhaseV3.WAITING_DAMAGE_ROLL,
            currentTurn: state.currentTurn,
            roundNumber: state.roundNumber,
          };
        } else {
          return {
            phase: CombatPhaseV3.TURN_COMPLETE,
            currentTurn: state.currentTurn,
            roundNumber: state.roundNumber,
          };
        }

      case CombatPhaseV3.WAITING_DAMAGE_ROLL:
        return {
          phase: CombatPhaseV3.TURN_COMPLETE,
          currentTurn: state.currentTurn,
          roundNumber: state.roundNumber,
        };

      case CombatPhaseV3.TURN_COMPLETE: {
        const nextTurn: CurrentTurn = state.currentTurn === 'player' ? 'enemy' : 'player';
        const shouldIncrementRound = state.currentTurn === 'enemy';

        return {
          phase: CombatPhaseV3.WAITING_ATTACK_ROLL,
          currentTurn: nextTurn,
          roundNumber: shouldIncrementRound ? state.roundNumber + 1 : state.roundNumber,
        };
      }

      case CombatPhaseV3.ENDED:
        return {
          phase: CombatPhaseV3.ENDED,
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
  static skipToNextTurn(state: CombatStateV3): {
    phase: CombatPhaseV3;
    currentTurn: CurrentTurn;
    roundNumber: number;
  } {
    if (state.phase !== CombatPhaseV3.TURN_COMPLETE) {
      return {
        phase: state.phase,
        currentTurn: state.currentTurn,
        roundNumber: state.roundNumber,
      };
    }

    return this.advancePhase(state, {});
  }
}
