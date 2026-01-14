import type { CombatState } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';

export class PhaseManager {
  static advancePhase(state: CombatState): CombatPhase {
    switch (state.phase) {
      case CombatPhase.PLAYER_TURN:
        return CombatPhase.PLAYER_ATTACK;

      case CombatPhase.PLAYER_ATTACK:
        return CombatPhase.ENEMY_TURN;

      case CombatPhase.ENEMY_TURN:
        return CombatPhase.ENEMY_ATTACK;

      case CombatPhase.ENEMY_ATTACK:
        return CombatPhase.ROUND_END;

      case CombatPhase.ROUND_END:
        return CombatPhase.PLAYER_TURN;

      default:
        return state.phase;
    }
  }

  static incrementRound(roundNumber: number): number {
    return roundNumber + 1;
  }

  static shouldIncrementRound(phase: CombatPhase): boolean {
    return phase === CombatPhase.ENEMY_ATTACK;
  }
}
