import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { CombatActionType } from '@/src/domain/types/CombatActionType';

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
 * Hook orchestrateur du combat V2
 * 
 * PRINCIPE FONDAMENTAL : Le CombatEngine est la SEULE source de vérité.
 * 
 * L'orchestrateur ne "décide" rien. Il observe le state du moteur et :
 * 1. Joue les animations quand le moteur a résolu une action
 * 2. Exécute automatiquement l'attaque ennemi quand c'est son tour ET pas d'actions joueur
 * 3. Passe automatiquement au tour suivant quand la seule action est SKIP
 * 
 * RÈGLE D'OR : Si availableActions contient autre chose que SKIP, on ATTEND l'utilisateur.
 */
export function useCombatOrchestratorV2() {
  const combat = useCharacterStore((state) => state.combat);
  const availableActions = useCharacterStore((state) => state.availableActions);
  const executeAction = useCharacterStore((state) => state.executeAction);
  const executeEnemyAttack = useCharacterStore((state) => state.executeEnemyAttack);
  
  const prefersReducedMotion = useReducedMotion() ?? false;
  const durations = prefersReducedMotion ? ANIMATION_DURATIONS.reduced : ANIMATION_DURATIONS.standard;
  
  // Ref pour tracker les timeouts actifs
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Phase d'animation locale
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  
  // Tracker la dernière action pour savoir quand jouer l'animation
  const lastHistoryLengthRef = useRef(0);
  const lastProcessedActionRef = useRef<string | null>(null);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉRIVATIONS DU STATE (pas de duplication, tout vient du moteur)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const derivedState = useMemo(() => {
    if (!combat) {
      return {
        isPlayerTurn: false,
        isEnemyTurn: false,
        isCombatEnded: false,
        hasPlayerActions: false,
        shouldAutoSkip: false,
        shouldAutoEnemyAttack: false,
        lastEntry: null,
      };
    }

    const isPlayerTurn = combat.currentTurn === 'player';
    const isEnemyTurn = combat.currentTurn === 'enemy';
    const isCombatEnded = combat.phase === CombatPhase.ENDED || 
                          combat.player.endurance <= 0 || 
                          combat.enemy.endurance <= 0;

    // Actions disponibles (hors SKIP qui est toujours là)
    const meaningfulActions = availableActions.filter(
      a => a.action.type !== CombatActionType.SKIP && a.enabled
    );
    const hasPlayerActions = meaningfulActions.length > 0;
    
    // Auto-skip : si la seule action est SKIP et c'est le tour du joueur en TURN_COMPLETE
    const shouldAutoSkip = isPlayerTurn && 
                           combat.phase === CombatPhase.TURN_COMPLETE &&
                           !hasPlayerActions;

    // Auto-enemy-attack : si c'est le tour de l'ennemi et phase WAITING_ATTACK_ROLL
    const shouldAutoEnemyAttack = isEnemyTurn && 
                                   combat.phase === CombatPhase.WAITING_ATTACK_ROLL;

    const lastEntry = combat.history.length > 0 
      ? combat.history[combat.history.length - 1] 
      : null;

    return {
      isPlayerTurn,
      isEnemyTurn,
      isCombatEnded,
      hasPlayerActions,
      shouldAutoSkip,
      shouldAutoEnemyAttack,
      lastEntry,
    };
  }, [combat, availableActions]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION : Déclenchée quand une nouvelle entrée apparaît dans l'historique
  // ═══════════════════════════════════════════════════════════════════════════

  const runAnimation = useCallback((hasDamage: boolean, onComplete: () => void) => {
    clearTimeouts();

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
  }, [durations, clearTimeouts]);

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFET PRINCIPAL : Observer les changements et réagir
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!combat || derivedState.isCombatEnded) {
      clearTimeouts();
      setAnimationPhase('idle');
      return;
    }

    const currentHistoryLength = combat.history.length;
    const lastEntryId = derivedState.lastEntry?.id ?? null;

    // ─────────────────────────────────────────────────────────────────────────
    // CAS 1 : Nouvelle action dans l'historique → Jouer l'animation
    // ─────────────────────────────────────────────────────────────────────────
    if (currentHistoryLength > lastHistoryLengthRef.current && 
        lastEntryId !== lastProcessedActionRef.current) {
      
      lastHistoryLengthRef.current = currentHistoryLength;
      lastProcessedActionRef.current = lastEntryId;
      
      const hasDamage = derivedState.lastEntry?.damageRoll !== undefined;
      
      runAnimation(hasDamage, () => {
        // Animation terminée - on ne fait RIEN d'automatique ici
        // Le prochain effet se déclenchera et vérifiera les conditions
      });
      return; // On attend la fin de l'animation
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CAS 2 : Animation idle + conditions d'auto-action
    // ─────────────────────────────────────────────────────────────────────────
    if (animationPhase !== 'idle') {
      return; // Animation en cours, on attend
    }

    // Auto-skip si pas d'actions significatives (ex: après un hit, pas de reroll possible)
    if (derivedState.shouldAutoSkip) {
      // Petit délai pour que l'utilisateur voit le résultat
      const t = setTimeout(() => {
        executeAction({ type: CombatActionType.SKIP });
      }, 300);
      timeoutsRef.current.push(t);
      return;
    }

    // Auto-enemy-attack si c'est le tour de l'ennemi
    if (derivedState.shouldAutoEnemyAttack) {
      const t = setTimeout(() => {
        executeEnemyAttack();
      }, durations.enemyTurnDelay);
      timeoutsRef.current.push(t);
      return;
    }

    // Sinon : on attend une action utilisateur (REROLL, ATTACK, etc.)

  }, [
    combat, 
    derivedState, 
    animationPhase, 
    executeAction, 
    executeEnemyAttack, 
    runAnimation, 
    durations, 
    clearTimeouts
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETOUR : Tout ce dont l'UI a besoin
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    /** Phase d'animation actuelle (pour affichage dés/dégâts) */
    animationPhase,
    /** Si une animation est en cours */
    isAnimating: animationPhase !== 'idle',
    /** Si c'est le tour du joueur (dérivé du moteur) */
    isPlayerTurn: derivedState.isPlayerTurn,
    /** Si c'est le tour de l'ennemi (dérivé du moteur) */
    isEnemyTurn: derivedState.isEnemyTurn,
    /** Si le combat est terminé (dérivé du moteur) */
    isCombatEnded: derivedState.isCombatEnded,
    /** Si le joueur a des actions disponibles (hors SKIP) */
    hasPlayerActions: derivedState.hasPlayerActions,
    /** Si on respecte prefers-reduced-motion */
    prefersReducedMotion,
  };
}
