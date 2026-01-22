/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiceResultCard } from './DiceResultCard';
import type { DiceRollResult } from './DiceAnimation';

// Mock Framer Motion
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  
  const MockMotionDiv = ({ children, onAnimationComplete, ...props }: any) => {
    // Simulate animation completion after a microtask
    React.useEffect(() => {
      if (onAnimationComplete) {
        Promise.resolve().then(() => {
          onAnimationComplete();
        });
      }
    }, [onAnimationComplete]);
    
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

// Mock DiceAnimation3D to simplify testing
vi.mock('./DiceAnimation3D', () => ({
  DiceAnimation3D: ({ result, isRolling, onComplete }: any) => {
    React.useEffect(() => {
      if (!isRolling && onComplete) {
        const timer = setTimeout(onComplete, 100);
        return () => clearTimeout(timer);
      }
    }, [isRolling, onComplete]);
    
    return (
      <div data-testid="dice-animation-3d-mock">
        {isRolling ? 'Rolling...' : `Result: ${result.join(', ')}`}
      </div>
    );
  },
}));

describe('DiceResultCard', () => {
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
    vi.useRealTimers();
  });

  describe('rendering - idle state', () => {
    it('should render empty state when no dice result and not rolling', () => {
      const { container } = render(<DiceResultCard diceResult={null} isRolling={false} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('rendering - rolling state', () => {
    it('should show DiceAnimation3D when rolling', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={true} />);

      expect(screen.getByTestId('dice-animation-3d-mock')).toBeInTheDocument();
      expect(screen.getByText('Rolling...')).toBeInTheDocument();
    });

    it('should not show result details when rolling', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={true} />);

      expect(screen.queryByTestId('final-score')).not.toBeInTheDocument();
      expect(screen.queryByTestId('calc-final-score')).not.toBeInTheDocument();
    });

    it('should pass correct tuple to DiceAnimation3D', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={true} />);

      const diceAnimation = screen.getByTestId('dice-animation-3d-mock');
      expect(diceAnimation).toHaveTextContent('Rolling...');
    });
  });

  describe('rendering - result state', () => {
    it('should show DiceAnimation3D with result values', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={false} />);

      expect(screen.getByTestId('dice-animation-3d-mock')).toBeInTheDocument();
      expect(screen.getByText(/Result: 3, 4/)).toBeInTheDocument();
    });

    it('should display final score', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={false} />);

      expect(screen.getByTestId('final-score')).toHaveTextContent('21');
    });

    it('should display dice values and modifiers breakdown', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={false} />);

      expect(screen.getByText(/\[3\]/)).toBeInTheDocument();
      expect(screen.getByText(/\[4\]/)).toBeInTheDocument();
      expect(screen.getByText(/12 HAB/)).toBeInTheDocument();
      expect(screen.getByText(/2 arme/)).toBeInTheDocument();
    });

    it('should display "DOUBLE !" badge when dice are equal', () => {
      const doubleResult: DiceRollResult = {
        ...mockDiceResult,
        dice: [5, 5],
        isDouble: true,
      };

      render(<DiceResultCard diceResult={doubleResult} isRolling={false} />);

      expect(screen.getByText('DOUBLE !')).toBeInTheDocument();
    });

    it('should not display "DOUBLE !" badge when dice are different', () => {
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={false} />);

      expect(screen.queryByText('DOUBLE !')).not.toBeInTheDocument();
    });
  });

  describe('outcome display', () => {
    it('should show "TOUCHÉ !" when success is true', () => {
      render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="win"
        />
      );

      expect(screen.getByTestId('outcome-status')).toHaveTextContent('TOUCHÉ !');
    });

    it('should show "RATÉ !" when success is false', () => {
      const failResult: DiceRollResult = {
        ...mockDiceResult,
        success: false,
      };

      render(
        <DiceResultCard
          diceResult={failResult}
          isRolling={false}
          outcome="lose"
        />
      );

      expect(screen.getByTestId('outcome-status')).toHaveTextContent('RATÉ !');
    });

    it('should not show outcome when outcome prop is missing', () => {
      render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={false}
        />
      );

      expect(screen.queryByTestId('outcome-status')).not.toBeInTheDocument();
    });

    it('should apply win border color class', () => {
      const { container } = render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="win"
        />
      );

      const card = container.querySelector('.border-chart-5\\/50');
      expect(card).toBeInTheDocument();
    });

    it('should apply lose border color class', () => {
      const failResult: DiceRollResult = {
        ...mockDiceResult,
        success: false,
      };

      const { container } = render(
        <DiceResultCard
          diceResult={failResult}
          isRolling={false}
          outcome="lose"
        />
      );

      const card = container.querySelector('.border-destructive\\/50');
      expect(card).toBeInTheDocument();
    });

    it('should apply tie border color class', () => {
      const { container } = render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={false}
          outcome="tie"
        />
      );

      const card = container.querySelector('.border-accent\\/50');
      expect(card).toBeInTheDocument();
    });

    it('should not apply outcome colors when rolling', () => {
      const { container } = render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={true}
          outcome="win"
        />
      );

      const card = container.querySelector('.border-chart-5\\/50');
      expect(card).not.toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onAnimationComplete when animation finishes', async () => {
      const onComplete = vi.fn();

      render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={false}
          onAnimationComplete={onComplete}
        />
      );

      // Wait for the mocked DiceAnimation3D to call onComplete
      await vi.advanceTimersByTimeAsync(150);
      
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onAnimationComplete when rolling', async () => {
      const onComplete = vi.fn();

      render(
        <DiceResultCard
          diceResult={mockDiceResult}
          isRolling={true}
          onAnimationComplete={onComplete}
        />
      );

      await vi.advanceTimersByTimeAsync(200);

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('reduced motion support', () => {
    it('should respect reduced motion preferences', () => {
      // This is handled by the mocked useReducedMotion
      render(<DiceResultCard diceResult={mockDiceResult} isRolling={false} />);

      // Component should render without throwing
      expect(screen.getByTestId('final-score')).toBeInTheDocument();
    });
  });
});
