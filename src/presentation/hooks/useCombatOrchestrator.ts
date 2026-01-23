import { useEffect, useRef, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import type { AvailableAction } from '@/src/domain/types/combat-state';

/**
 * Configuration des durées d'animation (en ms)
 */
const ANIMATION_DURATIONS = {
  standard: {
    rolling: 1200,      // Animation des dés
    result: 1500,       // Affichage du résultat (réduit de 2500 → 1500)
    damage: 800,        // Affichage des dégâts (réduit de 2000 → 800)
    enemyTurnDelay: 100, // Délai minimal (réduit de 200 → 100)
  },
  reduced: {
    rolling: 100,
    result: 100,
    damage: 200,
    enemyTurnDelay: 100,
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
  
  // Flag pour afficher les écrans de fin après les animations
  // Utilise combat?.id comme key pour se réinitialiser automatiquement
  const [showEndScreen, setShowEndScreen] = useState(false);
  const combatIdRef = useRef(combat?.id);
  
  // Réinitialiser showEndScreen quand le combat change
  if (combatIdRef.current !== combat?.id) {
    combatIdRef.current = combat?.id;
    setShowEndScreen(false);
  }
  
  // Ref pour accéder aux availableActions dans les callbacks
  const availableActionsRef = useRef(availableActions);

  // Mettre à jour la ref quand availableActions change
  useEffect(() => {
    availableActionsRef.current = availableActions;
  }, [availableActions]);

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
        // Rien à faire automatiquement
        clearTimeouts();
        setAnimationPhase('idle');
        break;

      case 'COMBAT_ENDED':
        // Combat terminé - rien à faire, l'écran s'affichera via l'effet animationPhase
        break;
    }
  }, [turnPhase, combat, runAttackAnimation, endPlayerTurn, executeEnemyAttack, endEnemyTurn, durations, clearTimeouts]);

  // Observer animationPhase : afficher l'écran de fin quand animations terminées et combat fini
  useEffect(() => {
    if (turnPhase === 'COMBAT_ENDED' && animationPhase === 'idle' && !showEndScreen) {
      clearTimeouts();
      const endScreenTimeout = setTimeout(() => {
        setShowEndScreen(true);
      }, 500);
      timeoutsRef.current.push(endScreenTimeout);
    }
  }, [animationPhase, turnPhase, showEndScreen, clearTimeouts]);

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
    /** Si l'écran de fin doit être affiché (victoire/défaite) */
    showEndScreen,
  };
}
