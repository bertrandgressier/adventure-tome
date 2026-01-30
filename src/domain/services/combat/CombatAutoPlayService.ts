import { CombatEngine } from './CombatEngine';
import { CombatValidator } from './CombatValidator';
import { CombatActionType } from '../../types/CombatActionType';
import type { CombatState } from '../../types/combat-state';

/**
 * CombatAutoPlayService - Orchestration des actions automatiques du combat
 * 
 * Responsabilité : Gérer l'auto-skip uniquement (TURN_COMPLETE → next phase)
 * L'auto-play ennemi est géré dans la présentation avec délai d'animation
 */
export class CombatAutoPlayService {
  /**
   * Résout l'auto-skip après une action utilisateur
   * (ne gère PAS l'auto-play ennemi pour permettre les animations)
   * 
   * @param state État du combat après l'action utilisateur
   * @returns État après auto-skip si nécessaire
   */
  static resolveAutoActions(state: CombatState): CombatState {
    // Si autoPlay est désactivé, retourner l'état tel quel
    if (state.config.autoPlay === false) {
      return state;
    }

    let currentState = state;
    
    // Auto-skip uniquement (pas l'ennemi)
    // Boucle jusqu'à stabilisation (max 5 itérations pour sécurité)
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (CombatValidator.shouldAutoSkip(currentState) && iterations < MAX_ITERATIONS) {
      iterations++;
      const result = CombatEngine.resolve(currentState, { type: CombatActionType.SKIP });
      currentState = result.state;
    }

    return currentState;
  }
}
