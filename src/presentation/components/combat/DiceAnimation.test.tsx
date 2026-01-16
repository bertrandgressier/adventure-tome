import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiceAnimation, DiceRollResult } from './DiceAnimation';

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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering - idle state', () => {
    it('should render empty state when no dice result and not rolling', () => {
      render(<DiceAnimation diceResult={null} isRolling={false} />);

      expect(
        screen.getByText('Prêt pour le combat')
      ).toBeInTheDocument();
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

    it('should display success status when hit', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} outcome="win" />
      );

      vi.advanceTimersByTime(1200);

      const status = screen.queryByTestId('outcome-status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('TOUCHÉ !');
    });

    it('should display fail status when miss', () => {
      const missResult: DiceRollResult = {
        ...mockDiceResult,
        success: false,
      };

      render(<DiceAnimation diceResult={missResult} isRolling={false} outcome="lose" />);

      vi.advanceTimersByTime(1200);

      const status = screen.queryByTestId('outcome-status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('RATÉ !');
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
    it('should apply green border and glow for win outcome', () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="win"
        />
      );

      vi.advanceTimersByTime(1200);

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).toContain('border-chart-5\\/50');
    });

    it('should apply red border and glow for lose outcome', () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="lose"
        />
      );

      vi.advanceTimersByTime(1200);

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).toContain('border-destructive\\/50');
    });

    it('should apply yellow border and glow for tie outcome', () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="tie"
        />
      );

      vi.advanceTimersByTime(1200);

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).toContain('border-accent\\/50');
    });

    it('should not apply outcome colors during rolling', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} outcome="win" />
      );

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).not.toContain('border-chart-5\\/50');
    });

    it('should apply outcome colors after result phase', () => {
      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="win"
        />
      );

      vi.advanceTimersByTime(1200);

      const container = document.querySelector('.bg-card\\/80');
      expect(container?.className).toContain('border-chart-5\\/50');
    });
  });

  describe('animation phases', () => {
    it('should transition from idle to rolling when isRolling becomes true', () => {
      const { rerender } = render(
        <DiceAnimation diceResult={null} isRolling={false} />
      );

      expect(screen.getByText('Prêt pour le combat')).toBeInTheDocument();

      rerender(<DiceAnimation diceResult={mockDiceResult} isRolling={true} />);

      expect(screen.queryByText('Prêt pour le combat')).not.toBeInTheDocument();
    });

    it('should transition to result phase after animation duration', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      expect(screen.queryByTestId('final-score')).not.toBeInTheDocument();

      vi.advanceTimersByTime(900);

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
    });

    it('should call onAnimationComplete after animation finishes', () => {
      const onComplete = vi.fn();

      render(
        <DiceAnimation
          diceResult={mockDiceResult}
          isRolling={true}
          onAnimationComplete={onComplete}
        />
      );

      expect(onComplete).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1200);

      expect(onComplete).toHaveBeenCalled();
    });

    it('should show outcome after result phase delay', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} outcome="win" />
      );

      vi.advanceTimersByTime(900);

      expect(screen.queryByTestId('outcome-status')).not.toBeInTheDocument();

      vi.advanceTimersByTime(100);

      expect(screen.getByTestId('outcome-status')).toBeInTheDocument();
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

    it('should have aria-live for status updates', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      vi.advanceTimersByTime(500);

      const status = screen.queryByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce hit status to screen readers', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={false} />
      );

      vi.advanceTimersByTime(500);

      const status = screen.queryByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('TOUCHÉ !');
    });
  });

  describe('prefers-reduced-motion', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });
    });

    it('should skip animations when reduced motion is preferred', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      vi.advanceTimersByTime(300);

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
    });

    it('should still display results with reduced motion', () => {
      render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      vi.advanceTimersByTime(400);

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
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

      vi.advanceTimersByTime(500);

      const status = screen.queryByRole('status');
      expect(status).not.toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <DiceAnimation diceResult={null} isRolling={false} />
      );

      rerender(<DiceAnimation diceResult={mockDiceResult} isRolling={true} />);
      rerender(<DiceAnimation diceResult={null} isRolling={false} />);

      expect(screen.getByText('Prêt pour le combat')).toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { unmount } = render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      unmount();

      vi.advanceTimersByTime(1000);

      expect(screen.queryByTestId('final-score')).not.toBeInTheDocument();
    });

    it('should clear timeout when rolling state changes', () => {
      const { rerender } = render(
        <DiceAnimation diceResult={mockDiceResult} isRolling={true} />
      );

      rerender(<DiceAnimation diceResult={mockDiceResult} isRolling={false} />);

      vi.advanceTimersByTime(100);

      expect(screen.getByTestId('final-score')).toBeInTheDocument();
    });
  });
});
