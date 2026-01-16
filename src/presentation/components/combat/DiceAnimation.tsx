'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface DiceRollResult {
  dice: [number, number];
  total: number;
  modifiers: {
    habilete: number;
    weaponBonus: number;
  };
  finalScore: number;
  isDouble?: boolean;
  success?: boolean;
}

export type DiceOutcome = 'win' | 'lose' | 'tie';

export interface DiceAnimationProps {
  diceResult: DiceRollResult | null;
  isRolling: boolean;
  outcome?: DiceOutcome;
  onAnimationComplete?: () => void;
}

export function DiceAnimation({
  diceResult,
  isRolling,
  outcome,
  onAnimationComplete,
}: DiceAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'result'>('idle');
  const [showOutcome, setShowOutcome] = useState(false);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    // Handle cleanup and early returns first
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    // Reset to idle when no dice result and not rolling
    if (!diceResult && !isRolling) {
      if (phase !== 'idle' || showOutcome) {
        setPhase('idle');
        setShowOutcome(false);
      }
      return;
    }

    // Direct transition to result when not rolling (for static display)
    if (diceResult && !isRolling) {
      if (phase !== 'result') {
        setPhase('result'); // Transition synchrone pour affichage immédiat
      }

      const outcomeDelay = prefersReducedMotion ? 100 : 500;
      const completeDelay = prefersReducedMotion ? 100 : 300;

      const completeTimer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, completeDelay);

      const outcomeTimer = setTimeout(() => {
        setShowOutcome(true);
      }, outcomeDelay);

      return () => {
        clearTimeout(completeTimer);
        clearTimeout(outcomeTimer);
      };
    }

    // Start rolling animation
    if (diceResult && isRolling && (phase === 'idle' || phase === 'result')) {
      setPhase('rolling'); // Transition synchrone
      setShowOutcome(false);

      const animationDuration = prefersReducedMotion ? 100 : 800;

      animationRef.current = setTimeout(() => {
        setPhase('result');

        const completeDelay = prefersReducedMotion ? 100 : 300;
        const outcomeDelay = prefersReducedMotion ? 100 : 500;

        if (onAnimationComplete) {
          setTimeout(onAnimationComplete, completeDelay);
        }

        setTimeout(() => {
          setShowOutcome(true);
        }, outcomeDelay);
      }, animationDuration);

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [diceResult, isRolling, phase, onAnimationComplete, prefersReducedMotion, showOutcome]);

  const getOutcomeColor = (): string => {
    if (!showOutcome || !outcome) return '';
    switch (outcome) {
      case 'win':
        return 'border-chart-5/50 shadow-[0_0_20px_hsl(var(--chart-5)/0.3)]';
      case 'lose':
        return 'border-destructive/50 shadow-[0_0_20px_hsl(var(--destructive)/0.3)]';
      case 'tie':
        return 'border-accent/50 shadow-[0_0_20px_hsl(var(--accent)/0.3)]';
    }
  };

  if (!diceResult && !isRolling) {
    return (
      <div className="text-center p-8">
        <span className="text-muted-foreground text-sm">Prêt pour le combat</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div
        className={cn(
          'bg-card/80 border-2 border-primary/30 rounded-xl p-6 transition-all duration-300',
          getOutcomeColor(),
          !prefersReducedMotion && phase === 'rolling' && 'animate-dice-roll'
        )}
      >
        <div className="flex items-center justify-center gap-6">
          <Die
            value={phase === 'rolling' ? null : diceResult?.dice[0] ?? null}
            isRolling={phase === 'rolling'}
            prefersReducedMotion={prefersReducedMotion}
          />
          <span className="text-2xl text-muted-foreground font-bold">+</span>
          <Die
            value={phase === 'rolling' ? null : diceResult?.dice[1] ?? null}
            isRolling={phase === 'rolling'}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>

        {phase === 'result' && diceResult && (
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <div
                className="text-5xl font-cinzel font-bold text-primary"
                data-testid="final-score"
              >
                {diceResult.finalScore}
              </div>
              {diceResult.isDouble && (
                <span className="inline-block mt-2 px-4 py-1 bg-accent text-accent-foreground text-sm font-bold rounded-full">
                  DOUBLE !
                </span>
              )}
            </div>

            <div className="border-t border-primary/20 pt-4 mt-4">
              <div className="text-sm text-muted-foreground font-mono text-center space-y-1">
                <div>
                  <span className="text-primary font-bold">[{diceResult.dice[0]}]</span>
                  {' + '}
                  <span className="text-primary font-bold">[{diceResult.dice[1]}]</span>
                  {' = '}
                  <span className="text-primary">{diceResult.total}</span>
                </div>
                <div>
                  <span className="text-accent">{diceResult.total}</span>
                  {' + '}
                  <span className="text-secondary">{diceResult.modifiers.habilete} HAB</span>
                  {' + '}
                  <span className="text-primary">{diceResult.modifiers.weaponBonus} arme</span>
                  {' = '}
                  <span className="text-primary font-bold" data-testid="calc-final-score">
                    {diceResult.finalScore}
                  </span>
                </div>
              </div>
            </div>

            {showOutcome && outcome && diceResult.success !== undefined && (
              <div className="text-center mt-2">
                <div
                  className={cn(
                    'text-lg font-bold',
                    outcome === 'win' || diceResult.success
                      ? 'text-chart-5'
                      : 'text-destructive'
                  )}
                  role="status"
                  aria-live="polite"
                  data-testid="outcome-status"
                >
                  {diceResult.success ? 'TOUCHÉ !' : 'RATÉ !'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DieProps {
  value: number | null;
  isRolling: boolean;
  prefersReducedMotion: boolean;
}

function Die({ value, isRolling, prefersReducedMotion }: DieProps) {
  return (
    <div
      className={cn(
        'w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-card to-card/80 border-2 border-primary/40 rounded-lg flex items-center justify-center shadow-lg',
        !prefersReducedMotion && isRolling && 'animate-dice-bounce',
        value !== null && 'border-primary/60'
      )}
      role="img"
      aria-label={`Dé ${value ?? '?'}`}
    >
      {value !== null ? (
        <span className="text-3xl sm:text-4xl font-cinzel text-primary font-bold">
          {value}
        </span>
      ) : (
        <span className="text-xl sm:text-2xl text-muted-foreground">?</span>
      )}
    </div>
  );
}
