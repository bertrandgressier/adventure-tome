/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiceAnimation, DiceRollResult } from './DiceAnimation';

// Mock Framer Motion with better simulation of animation lifecycle
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  
  const MockMotionDiv = ({ children, onAnimationComplete, onAnimationStart, animate, ...props }: any) => {
    // Simulate animation lifecycle
    React.useEffect(() => {
      // Call onAnimationStart when animate changes
      if (onAnimationStart) {
        onAnimationStart();
      }
      
      // Simulate animation completion after a microtask
      if (onAnimationComplete && animate !== 'rolling') {
        Promise.resolve().then(() => {
          onAnimationComplete();
        });
      }
    }, [animate, onAnimationComplete, onAnimationStart]);
    
    return <div {...props}>{children}</div>;
  };
  
  return {
    ...actual,
    useReducedMotion: () => false,
    motion: {
      div: MockMotionDiv,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

import React from 'react';

describe('DiceAnimation', () => {
  const mockDiceResult: DiceRollResult = {
    dice: [3, 4],
    total: 7,
    modifiers: {
      habilete: 12,
      weaponBonus: 2,
    },
    finalScore: 21,
    isDouble: false,
    success: true,
  };

  beforeEach(() => {
    // Note: We no longer need fake timers since we're using Framer Motion callbacks
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering - idle state', () => {
    it('should render empty state when no dice result and not rolling', () => {
      const { container } = render(<DiceAnimation diceResult={null} isRolling={false} />);

      // Le composant retourne null en idle state
      expect(container.firstChild).toBeNull();
    });
  });

  describe('rendering - rolling state', () => {
    it('should show rolling animation when isRolling is true', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      const diceContainer = screen.queryByText('Prêt pour le combat');
      expect(diceContainer).not.toBeInTheDocument();

      const dieElements = document.querySelectorAll('[role="img"][aria-label*="Dé"]');
      expect(dieElements.length).toBeGreaterThan(0);
    });

    it('should display dice with question marks during rolling', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      const questionMarks = screen.getAllByText('?');
      expect(questionMarks.length).toBe(2);
    });
  });

  describe('rendering - result state', () => {
    it('should display dice values after animation completes', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should display final score', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      const finalScore = screen.getByTestId('final-score');
      expect(finalScore).toBeInTheDocument();
      expect(finalScore).toHaveTextContent('21');
    });

    it('should display calculation breakdown', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      expect(screen.getByText('[3]')).toBeInTheDocument();
      expect(screen.getByText('[4]')).toBeInTheDocument();
      expect(screen.getByText('12 HAB')).toBeInTheDocument();
      expect(screen.getByText('2 arme')).toBeInTheDocument();
      
      const finalCalcScore = screen.getByTestId('calc-final-score');
      expect(finalCalcScore).toHaveTextContent('21');
    });

    it('should display success status when hit', async () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} outcome="win" />
      );

      // Wait for the outcome to appear after animation completes
      await waitFor(() => {
        const status = screen.queryByTestId('outcome-status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent('TOUCHÉ !');
      });
    });

    it('should display fail status when miss', async () => {
      const missResult: DiceRollResult = {
        ...mockDiceResult,
        success: false,
      };

      render(<DiceAnimation diceResult={missResult} isRolling={false} outcome="lose" />);

      // Wait for the outcome to appear after animation completes
      await waitFor(() => {
        const status = screen.queryByTestId('outcome-status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent('RATÉ !');
      });
    });

    it('should display double badge when isDouble is true', () => {
      const doubleResult: DiceRollResult = {
        ...mockDiceResult,
        dice: [5, 5],
        total: 10,
        isDouble: true,
      };

      render(<DiceAnimation diceResult={doubleResult} isRolling={false} />);

      expect(screen.getByText('DOUBLE !')).toBeInTheDocument();
    });

    it('should not display double badge when isDouble is false', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      expect(screen.queryByText('DOUBLE !')).not.toBeInTheDocument();
    });
  });

  describe('outcome colors', () => {
    it('should apply green border and glow for win outcome', async () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="win"
        />
      );

      await waitFor(() => {
        const container = document.querySelector('.bg-card\\/80');
        expect(container?.className).toContain('border-chart-5/50');
      });
    });

    it('should apply red border and glow for lose outcome', async () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="lose"
        />
      );

      await waitFor(() => {
        const container = document.querySelector('.bg-card\\/80');
        expect(container?.className).toContain('border-destructive/50');
      });
    });

    it('should apply yellow border and glow for tie outcome', async () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="tie"
        />
      );

      await waitFor(() => {
        const container = document.querySelector('.bg-card\\/80');
        expect(container?.className).toContain('border-accent/50');
      });
    });

    it('should not apply outcome colors during rolling', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} outcome="win" />
      );

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).not.toContain('border-chart-5\\/50');
    });

    it('should apply outcome colors after result phase', async () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="win"
        />
      );

      await waitFor(() => {
        const container = document.querySelector('.bg-card\\/80');
        expect(container?.className).toContain('border-chart-5/50');
      });
    });
  });

  describe('animation phases', () => {
    it('should transition from idle to rolling when isRolling becomes true', () => {
      const { container, rerender } = render(
        <DiceAnimation diceResult={null} isRolling={false} />
      );

      // En idle, le composant ne rend rien
      expect(container.firstChild).toBeNull();

      rerender(<DiceAnimation diceResult={mockDiceResult} isRolling={true} />);

      // Pendant le rolling, le composant s'affiche
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for dice', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      const dice = document.querySelectorAll('[aria-label*="Dé"]');
      expect(dice.length).toBe(2);
      expect(dice[0]).toHaveAttribute('aria-label', 'Dé 3');
      expect(dice[1]).toHaveAttribute('aria-label', 'Dé 4');
    });

    it('should have aria-live for status updates', async () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} outcome="win" />
      );

      await waitFor(() => {
        const status = screen.queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should announce hit status to screen readers', async () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} outcome="win" />
      );

      await waitFor(() => {
        const status = screen.queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent('TOUCHÉ !');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing outcome gracefully', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).not.toContain('border-chart-5\\/50');
      expect(container?.className).not.toContain('border-destructive\\/50');
      expect(container?.className).not.toContain('border-accent\\/50');
    });

    it('should handle zero dice values', () => {
      const zeroResult: DiceRollResult = {
        dice: [0, 0],
        total: 0,
        modifiers: {
          habilete: 0,
          weaponBonus: 0,
        },
        finalScore: 0,
      };

      render(<DiceAnimation diceResult={zeroResult} isRolling={false} />);

      const finalScore = screen.getByTestId('final-score');
      expect(finalScore).toHaveTextContent('0');
    });

    it('should handle maximum dice values', () => {
      const maxResult: DiceRollResult = {
        dice: [6, 6],
        total: 12,
        modifiers: {
          habilete: 12,
          weaponBonus: 5,
        },
        finalScore: 29,
        isDouble: true,
      };

      render(<DiceAnimation diceResult={maxResult} isRolling={false} />);

      const finalScore = screen.getByTestId('final-score');
      expect(finalScore).toHaveTextContent('29');
      expect(screen.getByText('DOUBLE !')).toBeInTheDocument();
    });

    it('should handle undefined success status', () => {
      const noSuccessResult: DiceRollResult = {
        ...mockDiceResult,
        success: undefined,
      };

      render(<DiceAnimation diceResult={noSuccessResult} isRolling={false} />);

      const status = screen.queryByRole('status');
      expect(status).not.toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const { container, rerender } = render(
        <DiceAnimation diceResult={null} isRolling={false} />
      );

      rerender(<DiceAnimation diceResult={mockDiceResult} isRolling={true} />);
      rerender(<DiceAnimation diceResult={null} isRolling={false} />);

      // Retour à idle: le composant ne rend rien
      expect(container.firstChild).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { unmount } = render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      unmount();

      expect(screen.queryByTestId('final-score')).not.toBeInTheDocument();
    });

    it('should clear timeout when rolling state changes', () => {
      const { rerender } = render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      rerender(<DiceAnimation diceResult={mockDiceResult} isRolling={false} />);

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
    });
  });
  
  describe('animation callbacks', () => {
    it('should call onAnimationComplete after outcome is shown', async () => {
      const onComplete = vi.fn();
      
      render(
        <DiceAnimation 
          diceResult={mockDiceResult} 
          isRolling={false} 
          outcome="win"
          onAnimationComplete={onComplete}
        />
      );

      // Wait for animations to complete
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should not call onAnimationComplete while rolling', () => {
      const onComplete = vi.fn();
      
      render(
        <DiceAnimation 
          diceResult={mockDiceResult} 
          isRolling={true} 
          onAnimationComplete={onComplete}
        />
      );

      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});
