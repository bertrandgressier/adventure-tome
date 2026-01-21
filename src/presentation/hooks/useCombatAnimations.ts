import { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { CombatState } from '@/src/domain/types/combat-state';

/**
 * Phase d'animation du combat
 * Dérivée du state combat, gérée côté React (pas dans le slice)
 */
export type CombatAnimationPhase = 'idle' | 'rolling' | 'result' | 'damage';

/**
 * Hook pour gérer les animations de combat de manière séquentielle
 * 
 * Stratégie :
 * 1. Observe les changements de lastActionTimestamp (nouvelle action)
 * 2. Regarde le dernier élément de history pour déterminer quoi animer
 * 3. Séquence les phases : rolling → result → damage → idle
 * 4. Respecte prefers-reduced-motion
 */
export function useCombatAnimations(
  combat: CombatState | null,
  lastActionTimestamp: number
) {
  const [animationPhase, setAnimationPhase] = useState<CombatAnimationPhase>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const lastTimestampRef = useRef(lastActionTimestamp);

  useEffect(() => {
    // Nouvelle action détectée
    if (lastActionTimestamp !== lastTimestampRef.current && lastActionTimestamp > 0) {
      lastTimestampRef.current = lastActionTimestamp;

      if (!combat) return;

      // Déterminer si on doit animer (si la dernière action a des jets de dés ou dégâts)
      const lastHistoryEntry = combat.history[combat.history.length - 1];
      const shouldAnimate = lastHistoryEntry && (
        lastHistoryEntry.hitRoll !== undefined || 
        lastHistoryEntry.damageRoll !== undefined
      );

      if (!shouldAnimate) {
        setAnimationPhase('idle');
        setIsAnimating(false);
        return;
      }

      // Durées d'animation (ms)
      const ROLLING_DURATION = prefersReducedMotion ? 100 : 1000;
      const RESULT_DURATION = prefersReducedMotion ? 100 : 1800;
      const DAMAGE_DURATION = prefersReducedMotion ? 200 : 2000;

      // Séquence d'animation
      setIsAnimating(true);

      // Phase 1: Rolling (dés qui roulent)
      setAnimationPhase('rolling');

      setTimeout(() => {
        // Phase 2: Result (afficher le résultat des dés)
        setAnimationPhase('result');

        // Si il y a des dégâts, passer à la phase damage
        if (lastHistoryEntry.damageRoll) {
          setTimeout(() => {
            // Phase 3: Damage (indicateur de dégâts)
            setAnimationPhase('damage');

            setTimeout(() => {
              // Phase 4: Idle (retour au calme)
              setAnimationPhase('idle');
              setIsAnimating(false);
            }, DAMAGE_DURATION);
          }, RESULT_DURATION);
        } else {
          // Pas de dégâts, retour direct à idle
          setTimeout(() => {
            setAnimationPhase('idle');
            setIsAnimating(false);
          }, RESULT_DURATION);
        }
      }, ROLLING_DURATION);
    }
  }, [lastActionTimestamp, combat, prefersReducedMotion]);

  // Reset quand le combat se termine
  useEffect(() => {
    if (!combat) {
      setAnimationPhase('idle');
      setIsAnimating(false);
    }
  }, [combat]);

  return {
    animationPhase,
    isAnimating,
    prefersReducedMotion,
  };
}
