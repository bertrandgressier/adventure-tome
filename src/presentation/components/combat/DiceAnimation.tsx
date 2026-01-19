'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  diceRollVariants,
  diceBounceVariants,
} from './motion';

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
  const [showOutcome, setShowOutcome] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const previousPhaseRef = useRef<'idle' | 'rolling' | 'result'>('idle');

  // Derive phase from props instead of managing it in state
  const phase = useMemo<'idle' | 'rolling' | 'result'>(() => {
    if (!diceResult && !isRolling) return 'idle';
    if (isRolling) return 'rolling';
    return 'result';
  }, [diceResult, isRolling]);

  // Handle outcome display timing
  useEffect(() => {
    const phaseChanged = previousPhaseRef.current !== phase;
    previousPhaseRef.current = phase;

    // Reset showOutcome when transitioning to idle
    if (phase === 'idle' && phaseChanged) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOutcome(false);
      return;
    }

    // Show outcome after delay when transitioning to result phase
    if (phase === 'result' && phaseChanged) {
      const outcomeDelay = prefersReducedMotion ? 100 : 500;
      const timer = setTimeout(() => {
        setShowOutcome(true);
      }, outcomeDelay);

      return () => clearTimeout(timer);
    }

    // Hide outcome during rolling
    if (phase === 'rolling' && phaseChanged) {
      setShowOutcome(false);
    }
  }, [phase, prefersReducedMotion]);

  // Handle animation complete callback
  useEffect(() => {
    const phaseIsResult = phase === 'result';
    if (phaseIsResult && onAnimationComplete) {
      const completeDelay = prefersReducedMotion ? 100 : 300;
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, completeDelay);

      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete, prefersReducedMotion]);

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
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-2">
      <motion.div
        className={cn(
          'bg-card/80 border-2 rounded-xl p-4 max-w-md',
          getOutcomeColor()
        )}
        variants={diceRollVariants}
        initial="idle"
        animate={phase === 'rolling' ? 'rolling' : 'result'}
        custom={prefersReducedMotion}
      >
        <div className="flex items-center justify-center gap-4">
          <Die
            value={phase === 'rolling' ? null : diceResult?.dice[0] ?? null}
            isRolling={phase === 'rolling'}
            prefersReducedMotion={prefersReducedMotion}
          />
          <span className="text-xl text-muted-foreground font-bold">+</span>
          <Die
            value={phase === 'rolling' ? null : diceResult?.dice[1] ?? null}
            isRolling={phase === 'rolling'}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>

        {phase === 'result' && diceResult && (
          <div className="mt-3 space-y-2">
            <div className="text-center">
              <div
                className="text-4xl font-cinzel font-bold text-primary"
                data-testid="final-score"
              >
                {diceResult.finalScore}
              </div>
              {diceResult.isDouble && (
                <span className="inline-block mt-1 px-3 py-0.5 bg-accent text-accent-foreground text-xs font-bold rounded-full">
                  DOUBLE !
                </span>
              )}
            </div>

            <div className="border-t border-primary/20 pt-2">
              <div className="text-xs text-muted-foreground font-mono text-center space-y-0.5">
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
              <div className="text-center mt-1">
                <div
                  className={cn(
                    'text-base font-bold',
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
      </motion.div>
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
    <motion.div
      className={cn(
        'w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-card to-card/80 border-2 rounded-lg flex items-center justify-center shadow-lg',
        value !== null && 'border-primary/60'
      )}
      variants={diceBounceVariants}
      initial="idle"
      animate={isRolling ? 'bouncing' : 'idle'}
      custom={prefersReducedMotion}
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
    </motion.div>
  );
}
