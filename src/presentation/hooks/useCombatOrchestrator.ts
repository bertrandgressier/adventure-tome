import { useEffect, useRef, useCallback, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatValidator } from '@/src/domain/services/combat/CombatValidator';
import type { CombatDisplayPhase } from '@/src/presentation/stores/slices/combatSlice';

/**
 * Configuration des durées d'animation (en ms)
 */
const ANIMATION_DURATIONS = {
  standard: {
    rolling: 1000,
    result: 1800,
    damage: 2000,
    enemyTurnDelay: 800, // Délai pour afficher "Tour de l'ennemi"
    returnToIdle: 300,
  },
  reduced: {
    rolling: 100,
    result: 100,
    damage: 200,
    enemyTurnDelay: 200,
    returnToIdle: 100,
  },
};

/**
 * Phase d'animation locale (pour l'affichage des dés/dégâts)
 */
export type AnimationPhase = 'idle' | 'rolling' | 'result' | 'damage';

/**
 * Hook orchestrateur du combat
 * 
 * Responsabilité : Observer le state et déclencher les actions au bon moment
 * 
 * Architecture SoC :
 * - Store : Source de vérité (displayPhase, combat state)
 * - Hook : Séquençage temporel (setTimeout pour animations)
 * - UI : Réagit au state (animationPhase, displayPhase)
 * 
 * Flux :
 * 1. User click "Attaquer" → executeAction() → displayPhase = 'player_attacking'
 * 2. Hook détecte 'player_attacking' → animate (rolling → result → damage)
 * 3. Animation terminée → confirmPlayerTurnEnd() → displayPhase = 'enemy_turn_start'
 * 4. Hook détecte 'enemy_turn_start' → délai → executeEnemyAttack()
 * 5. Hook détecte 'enemy_attacking' → animate (rolling → result → damage)
 * 6. Animation terminée → setDisplayPhase('idle')
 */
export function useCombatOrchestrator() {
  const combat = useCharacterStore((state) => state.combat);
  const displayPhase = useCharacterStore((state) => state.displayPhase);
  const confirmPlayerTurnEnd = useCharacterStore((state) => state.confirmPlayerTurnEnd);
  const executeEnemyAttack = useCharacterStore((state) => state.executeEnemyAttack);
  const setDisplayPhase = useCharacterStore((state) => state.setDisplayPhase);
  
  const prefersReducedMotion = useReducedMotion() ?? false;
  const durations = prefersReducedMotion ? ANIMATION_DURATIONS.reduced : ANIMATION_DURATIONS.standard;
  
  // Ref pour tracker les timeouts actifs
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Phase d'animation locale (pour l'UI des dés)
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  /**
   * Lance la séquence d'animation d'une attaque
   * @param onComplete Callback appelée quand l'animation est terminée
   */
  const animateAttack = useCallback((onComplete: () => void) => {
    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Vérifier si l'attaque a fait des dégâts (dernière entry de history)
    const lastEntry = combat?.history[combat.history.length - 1];
    const hasDamage = lastEntry?.damageRoll !== undefined;

    // Phase 1: Rolling
    setAnimationPhase('rolling');

    const t1 = setTimeout(() => {
      // Phase 2: Result
      setAnimationPhase('result');

      if (hasDamage) {
        const t2 = setTimeout(() => {
          // Phase 3: Damage
          setAnimationPhase('damage');

          const t3 = setTimeout(() => {
            // Phase 4: Idle + callback
            setAnimationPhase('idle');
            onComplete();
          }, durations.damage);
          timeoutsRef.current.push(t3);
        }, durations.result);
        timeoutsRef.current.push(t2);
      } else {
        // Pas de dégâts, direct à idle
        const t2 = setTimeout(() => {
          setAnimationPhase('idle');
          onComplete();
        }, durations.result);
        timeoutsRef.current.push(t2);
      }
    }, durations.rolling);
    timeoutsRef.current.push(t1);
  }, [combat, durations]);

  // Observer displayPhase et réagir
  useEffect(() => {
    if (!combat) return;

    // Vérifier si le combat est terminé
    const combatStatus = CombatValidator.checkCombatEnd(combat);
    if (combatStatus !== 'ongoing') {
      // Combat terminé, reset à idle
      if (displayPhase !== 'idle') {
        setDisplayPhase('idle');
      }
      return;
    }

    switch (displayPhase) {
      case 'player_attacking':
        // Animer l'attaque du joueur
        animateAttack(() => {
          // Vérifier si c'est le tour de l'ennemi
          if (CombatValidator.shouldAutoPlayEnemy(combat)) {
            confirmPlayerTurnEnd();
          } else {
            // Pas d'attaque ennemi (joueur continue ou actions manuelles)
            setDisplayPhase('idle');
          }
        });
        break;

      case 'enemy_turn_start':
        // Afficher "Tour de l'ennemi" puis lancer l'attaque
        const t = setTimeout(() => {
          executeEnemyAttack();
        }, durations.enemyTurnDelay);
        timeoutsRef.current.push(t);
        break;

      case 'enemy_attacking':
        // Animer l'attaque de l'ennemi
        animateAttack(() => {
          // Retour au joueur
          setDisplayPhase('idle');
        });
        break;

      case 'enemy_attack_complete':
        // Petit délai avant de retourner à idle
        const t2 = setTimeout(() => {
          setDisplayPhase('idle');
        }, durations.returnToIdle);
        timeoutsRef.current.push(t2);
        break;

      case 'idle':
      case 'player_attack_complete':
        // Rien à faire
        break;
    }
  }, [displayPhase, combat, animateAttack, confirmPlayerTurnEnd, executeEnemyAttack, setDisplayPhase, durations]);

  return {
    /** Phase d'animation actuelle (pour affichage dés/dégâts) */
    animationPhase,
    /** Phase d'affichage du combat (depuis le store) */
    displayPhase,
    /** Si une animation est en cours */
    isAnimating: animationPhase !== 'idle' || displayPhase !== 'idle',
    /** Si on respecte prefers-reduced-motion */
    prefersReducedMotion,
  };
}
