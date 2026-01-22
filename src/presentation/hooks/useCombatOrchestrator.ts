import { useEffect, useRef, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import type { CombatTurnPhase } from '@/src/presentation/stores/slices/combatSlice';
import type { AvailableAction } from '@/src/domain/types/combat-state';

/**
 * Configuration des durées d'animation (en ms)
 */
const ANIMATION_DURATIONS = {
  standard: {
    rolling: 1000,
    result: 1500,
    damage: 1500,
    enemyTurnDelay: 800,
  },
  reduced: {
    rolling: 100,
    result: 100,
    damage: 200,
    enemyTurnDelay: 200,
  },
};

/**
 * Phase d'animation locale (pour l'affichage des dés/dégâts)
 */
export type AnimationPhase = 'idle' | 'rolling' | 'result' | 'damage';

/**
 * Vérifie si les actions contiennent quelque chose de significatif (autre que SKIP)
 */
function hasMeaningfulActions(actions: AvailableAction[]): boolean {
  return actions.some(
    a => a.action.type !== CombatActionType.SKIP && a.enabled
  );
}

/**
 * Hook orchestrateur du combat
 * 
 * PRINCIPE FONDAMENTAL : Le CombatEngine (via availableActions) est la source de vérité.
 * 
 * L'orchestrateur :
 * 1. Joue les animations après une action
 * 2. Vérifie availableActions AVANT de passer au tour suivant
 * 3. Si le joueur a des actions (REROLL, etc.), on ATTEND
 * 4. Si la seule action est SKIP, on passe automatiquement
 * 
 * RÈGLE D'OR : Ne JAMAIS passer au tour suivant si availableActions contient autre chose que SKIP
 */
export function useCombatOrchestrator() {
  const combat = useCharacterStore((state) => state.combat);
  const turnPhase = useCharacterStore((state) => state.turnPhase);
  const availableActions = useCharacterStore((state) => state.availableActions);
  const endPlayerTurn = useCharacterStore((state) => state.endPlayerTurn);
  const executeEnemyAttack = useCharacterStore((state) => state.executeEnemyAttack);
  const endEnemyTurn = useCharacterStore((state) => state.endEnemyTurn);
  
  const prefersReducedMotion = useReducedMotion() ?? false;
  const durations = prefersReducedMotion ? ANIMATION_DURATIONS.reduced : ANIMATION_DURATIONS.standard;
  
  // Ref pour tracker les timeouts actifs
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Phase d'animation locale (pour l'UI des dés)
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  
  // Ref pour accéder aux availableActions dans les callbacks
  const availableActionsRef = useRef(availableActions);
  availableActionsRef.current = availableActions;

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  // Nettoyer les timeouts précédents
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  /**
   * Lance la séquence d'animation d'une attaque
   */
  const runAttackAnimation = useCallback((onComplete: () => void) => {
    clearTimeouts();

    // Vérifier si l'attaque a fait des dégâts
    const lastEntry = combat?.history[combat.history.length - 1];
    const hasDamage = lastEntry?.damageRoll !== undefined;

    // Phase 1: Rolling
    setAnimationPhase('rolling');

    const t1 = setTimeout(() => {
      // Phase 2: Result
      setAnimationPhase('result');

      const t2 = setTimeout(() => {
        if (hasDamage) {
          // Phase 3: Damage
          setAnimationPhase('damage');

          const t3 = setTimeout(() => {
            setAnimationPhase('idle');
            onComplete();
          }, durations.damage);
          timeoutsRef.current.push(t3);
        } else {
          setAnimationPhase('idle');
          onComplete();
        }
      }, durations.result);
      timeoutsRef.current.push(t2);
    }, durations.rolling);
    timeoutsRef.current.push(t1);
  }, [combat, durations, clearTimeouts]);

  // Observer turnPhase et réagir
  useEffect(() => {
    if (!combat) return;

    switch (turnPhase) {
      case 'PLAYER_ATTACKING':
        // Joueur a attaqué → lancer animation
        runAttackAnimation(() => {
          // IMPORTANT : Vérifier si le joueur a des actions (REROLL, etc.)
          // On utilise la ref pour avoir la valeur actuelle
          if (hasMeaningfulActions(availableActionsRef.current)) {
            // Le joueur a des actions (ex: REROLL après un miss)
            // On ne passe PAS au tour ennemi, on attend l'action utilisateur
            return;
          }
          
          // Pas d'actions significatives → passer au tour ennemi
          endPlayerTurn();
        });
        break;

      case 'ENEMY_TURN_START':
        // Début tour ennemi → délai pour afficher "Tour de l'ennemi" → puis attaquer
        clearTimeouts();
        const t = setTimeout(() => {
          executeEnemyAttack();
        }, durations.enemyTurnDelay);
        timeoutsRef.current.push(t);
        break;

      case 'ENEMY_ATTACKING':
        // Ennemi a attaqué → lancer animation → puis endEnemyTurn
        runAttackAnimation(() => {
          endEnemyTurn();
        });
        break;

      case 'PLAYER_TURN_START':
      case 'COMBAT_ENDED':
        // Rien à faire automatiquement
        clearTimeouts();
        setAnimationPhase('idle');
        break;
    }
  }, [turnPhase, combat, runAttackAnimation, endPlayerTurn, executeEnemyAttack, endEnemyTurn, durations, clearTimeouts]);

  return {
    /** Phase d'animation actuelle (pour affichage dés/dégâts) */
    animationPhase,
    /** Phase du tour (depuis le store) */
    turnPhase,
    /** Si une animation est en cours */
    isAnimating: animationPhase !== 'idle',
    /** Si le joueur a des actions disponibles (hors SKIP) */
    hasPlayerActions: hasMeaningfulActions(availableActions),
    /** Si on respecte prefers-reduced-motion */
    prefersReducedMotion,
  };
}
