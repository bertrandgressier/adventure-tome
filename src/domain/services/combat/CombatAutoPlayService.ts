import { CombatEngine, type CombatResult } from './CombatEngine';
import { CombatValidator } from './CombatValidator';
import { CombatActionType } from '../../types/CombatActionType';
import type { CombatState } from '../../types/combat-state';

/**
 * CombatAutoPlayService - Orchestration des actions automatiques du combat
 * 
 * Responsabilité : Déterminer et exécuter les actions automatiques (auto-skip, auto-play ennemi)
 * selon les règles métier définies dans CombatValidator
 */
export class CombatAutoPlayService {
  /**
   * Résout les actions automatiques après une action utilisateur
   * 
   * @param state État du combat après l'action utilisateur
   * @returns État final après toutes les actions automatiques
   */
  static resolveAutoActions(state: CombatState): CombatState {
    // Si autoPlay est désactivé, retourner l'état tel quel
    if (state.config.autoPlay === false) {
      return state;
    }

    let currentState = state;
    let hasAutoAction = true;

    // Boucle jusqu'à ce qu'il n'y ait plus d'actions automatiques
    // (max 10 itérations pour éviter boucle infinie)
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    while (hasAutoAction && iterations < MAX_ITERATIONS) {
      iterations++;
      hasAutoAction = false;

      // 1. Auto-skip si TURN_COMPLETE sans actions manuelles
      if (CombatValidator.shouldAutoSkip(currentState)) {
        const result = CombatEngine.resolve(currentState, { type: CombatActionType.SKIP });
        currentState = result.state;
        hasAutoAction = true;
        continue;
      }

      // 2. Auto-play ennemi si c'est son tour
      if (CombatValidator.shouldAutoPlayEnemy(currentState)) {
        const result = CombatEngine.resolve(currentState, { type: CombatActionType.ATTACK });
        currentState = result.state;
        hasAutoAction = true;
        continue;
      }
    }

    return currentState;
  }
}
