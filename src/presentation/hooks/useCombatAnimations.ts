import { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { CombatState } from '@/src/domain/types/combat-state';

/**
 * Phase d'animation du combat
 * Dérivée du state combat, gérée côté React (pas dans le slice)
 */
export type CombatAnimationPhase = 'idle' | 'rolling' | 'result' | 'damage';

/**
 * Hook pour gérer les animations de combat
 * 
 * Stratégie simple :
 * 1. Observe les changements de lastActionTimestamp (nouvelle action)
 * 2. Anime la dernière action : rolling → result → damage → idle
 * 3. Appelle onAnimationComplete quand l'animation se termine
 * 4. Respecte prefers-reduced-motion
 */
export function useCombatAnimations(
  combat: CombatState | null,
  lastActionTimestamp: number,
  onAnimationComplete?: () => void
) {
  const [animationPhase, setAnimationPhase] = useState<CombatAnimationPhase>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const lastTimestampRef = useRef(lastActionTimestamp);

  useEffect(() => {
    // Nouvelle action détectée
    if (lastActionTimestamp !== lastTimestampRef.current && lastActionTimestamp > 0) {
      lastTimestampRef.current = lastActionTimestamp;

      if (!combat || combat.history.length === 0) return;

      // Animer la dernière action
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

      // Séquence d'animation pour cette action
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
              
              // Callback après animation complète
              onAnimationComplete?.();
            }, DAMAGE_DURATION);
          }, RESULT_DURATION);
        } else {
          // Pas de dégâts, retour direct à idle
          setTimeout(() => {
            setAnimationPhase('idle');
            setIsAnimating(false);
            
            // Callback après animation complète
            onAnimationComplete?.();
          }, RESULT_DURATION);
        }
      }, ROLLING_DURATION);
    }
  }, [lastActionTimestamp, combat, prefersReducedMotion, onAnimationComplete]);

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
