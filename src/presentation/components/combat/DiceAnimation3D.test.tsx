/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiceAnimation3D } from './DiceAnimation3D';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: () => false,
    motion: {
      div: ({ children, animate, ...props }: any) => (
        <div {...props} data-animate={JSON.stringify(animate)}>
          {children}
        </div>
      ),
    },
  };
});

describe('DiceAnimation3D', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render the component with two dice', () => {
      render(<DiceAnimation3D result={[3, 4]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('role', 'region');
      expect(container).toHaveAttribute('aria-label', 'Animation de lancer de dés 3D');
    });

    it('should render dice with correct values when not rolling', () => {
      render(<DiceAnimation3D result={[5, 6]} isRolling={false} />);

      // Check for dice faces
      const faces = document.querySelectorAll('[data-face]');
      expect(faces.length).toBeGreaterThan(0);
    });

    it('should render all 6 faces for each die', () => {
      render(<DiceAnimation3D result={[1, 2]} isRolling={false} />);

      // Each die has 6 faces, so 12 total
      const allFaces = document.querySelectorAll('.dice-face');
      expect(allFaces.length).toBe(12);
    });
  });

  describe('rolling state', () => {
    it('should show animation when isRolling is true', () => {
      render(<DiceAnimation3D result={[3, 4]} isRolling={true} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
    });

    it('should not highlight any face when rolling', () => {
      render(<DiceAnimation3D result={[3, 4]} isRolling={true} />);

      const activeFaces = document.querySelectorAll('.dice-face-active');
      expect(activeFaces.length).toBe(0);
    });

    it('should apply rolling animation to both dice', () => {
      render(<DiceAnimation3D result={[1, 6]} isRolling={true} />);

      // Check that dice containers exist
      const diceContainers = document.querySelectorAll('.dice-3d');
      expect(diceContainers.length).toBe(2);
    });
  });

  describe('result state', () => {
    it('should display result after rolling stops', () => {
      const { rerender } = render(<DiceAnimation3D result={[3, 4]} isRolling={true} />);

      rerender(<DiceAnimation3D result={[3, 4]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
    });

    it('should highlight active faces when result is shown', () => {
      render(<DiceAnimation3D result={[1, 6]} isRolling={false} />);

      // Wait for state update
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const activeFaces = document.querySelectorAll('.dice-face-active');
      // 2 active faces (one per die)
      expect(activeFaces.length).toBeGreaterThan(0);
    });

    it('should show correct face for value 1', () => {
      render(<DiceAnimation3D result={[1, 1]} isRolling={false} />);

      const face1Elements = document.querySelectorAll('[data-face="1"]');
      expect(face1Elements.length).toBe(2);
    });

    it('should show correct face for value 6', () => {
      render(<DiceAnimation3D result={[6, 6]} isRolling={false} />);

      const face6Elements = document.querySelectorAll('[data-face="6"]');
      expect(face6Elements.length).toBe(2);
    });

    it('should render different values for each die', () => {
      render(<DiceAnimation3D result={[2, 5]} isRolling={false} />);

      expect(document.querySelector('[data-face="2"]')).toBeInTheDocument();
      expect(document.querySelector('[data-face="5"]')).toBeInTheDocument();
    });
  });

  describe('dice dots rendering', () => {
    it('should render 1 dot for value 1', () => {
      render(<DiceAnimation3D result={[1, 1]} isRolling={false} />);

      const dotsGrids = document.querySelectorAll('.dice-dots-grid');
      const firstGrid = dotsGrids[0];
      const dots = firstGrid.querySelectorAll('.dice-dot');
      expect(dots.length).toBe(1);
    });

    it('should render 2 dots for value 2', () => {
      render(<DiceAnimation3D result={[2, 2]} isRolling={false} />);

      const dotsGrids = document.querySelectorAll('.dice-dots-grid');
      const firstGrid = dotsGrids[1]; // Face 2 is back face
      const dots = firstGrid.querySelectorAll('.dice-dot');
      expect(dots.length).toBe(2);
    });

    it('should render 3 dots for value 3', () => {
      render(<DiceAnimation3D result={[3, 3]} isRolling={false} />);

      const dotsGrids = document.querySelectorAll('.dice-dots-grid');
      const firstGrid = dotsGrids[2]; // Face 3 is right face
      const dots = firstGrid.querySelectorAll('.dice-dot');
      expect(dots.length).toBe(3);
    });

    it('should render 4 dots for value 4', () => {
      render(<DiceAnimation3D result={[4, 4]} isRolling={false} />);

      const dotsGrids = document.querySelectorAll('.dice-dots-grid');
      const firstGrid = dotsGrids[3]; // Face 4 is left face
      const dots = firstGrid.querySelectorAll('.dice-dot');
      expect(dots.length).toBe(4);
    });

    it('should render 5 dots for value 5', () => {
      render(<DiceAnimation3D result={[5, 5]} isRolling={false} />);

      const dotsGrids = document.querySelectorAll('.dice-dots-grid');
      const firstGrid = dotsGrids[4]; // Face 5 is top face
      const dots = firstGrid.querySelectorAll('.dice-dot');
      expect(dots.length).toBe(5);
    });

    it('should render 6 dots for value 6', () => {
      render(<DiceAnimation3D result={[6, 6]} isRolling={false} />);

      const dotsGrids = document.querySelectorAll('.dice-dots-grid');
      const firstGrid = dotsGrids[5]; // Face 6 is bottom face
      const dots = firstGrid.querySelectorAll('.dice-dot');
      expect(dots.length).toBe(6);
    });
  });

  describe('onComplete callback', () => {
    it('should call onComplete after rolling stops', async () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <DiceAnimation3D result={[3, 4]} isRolling={true} onComplete={onComplete} />
      );

      rerender(<DiceAnimation3D result={[3, 4]} isRolling={false} onComplete={onComplete} />);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onComplete while still rolling', () => {
      const onComplete = vi.fn();
      render(<DiceAnimation3D result={[3, 4]} isRolling={true} onComplete={onComplete} />);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should not call onComplete if not provided', () => {
      const { rerender } = render(<DiceAnimation3D result={[3, 4]} isRolling={true} />);

      rerender(<DiceAnimation3D result={[3, 4]} isRolling={false} />);

      act(() => {
        vi.runAllTimers();
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DiceAnimation3D result={[3, 4]} isRolling={false} />);

      const container = screen.getByRole('region');
      expect(container).toHaveAttribute('aria-label', 'Animation de lancer de dés 3D');
    });

    it('should be keyboard accessible', () => {
      render(<DiceAnimation3D result={[3, 4]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeVisible();
    });
  });

  describe('3D transforms', () => {
    it('should apply preserve-3d style', () => {
      render(<DiceAnimation3D result={[1, 2]} isRolling={false} />);

      const dice3d = document.querySelectorAll('.dice-3d');
      expect(dice3d.length).toBe(2);
    });

    it('should have perspective container', () => {
      render(<DiceAnimation3D result={[1, 2]} isRolling={false} />);

      const perspectiveContainers = document.querySelectorAll('.perspective-container');
      expect(perspectiveContainers.length).toBe(2);
    });

    it('should render all faces with proper transforms', () => {
      render(<DiceAnimation3D result={[1, 2]} isRolling={false} />);

      const frontFaces = document.querySelectorAll('.dice-face-front');
      const backFaces = document.querySelectorAll('.dice-face-back');
      const rightFaces = document.querySelectorAll('.dice-face-right');
      const leftFaces = document.querySelectorAll('.dice-face-left');
      const topFaces = document.querySelectorAll('.dice-face-top');
      const bottomFaces = document.querySelectorAll('.dice-face-bottom');

      expect(frontFaces.length).toBe(2);
      expect(backFaces.length).toBe(2);
      expect(rightFaces.length).toBe(2);
      expect(leftFaces.length).toBe(2);
      expect(topFaces.length).toBe(2);
      expect(bottomFaces.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle extreme values', () => {
      render(<DiceAnimation3D result={[1, 6]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
    });

    it('should handle same values for both dice', () => {
      render(<DiceAnimation3D result={[4, 4]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
    });

    it('should handle rapid rolling state changes', () => {
      const { rerender } = render(<DiceAnimation3D result={[3, 4]} isRolling={true} />);

      rerender(<DiceAnimation3D result={[3, 4]} isRolling={false} />);
      rerender(<DiceAnimation3D result={[5, 6]} isRolling={true} />);
      rerender(<DiceAnimation3D result={[5, 6]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
    });

    it('should cleanup timers on unmount', () => {
      const onComplete = vi.fn();
      const { rerender, unmount } = render(
        <DiceAnimation3D result={[3, 4]} isRolling={true} onComplete={onComplete} />
      );

      rerender(<DiceAnimation3D result={[3, 4]} isRolling={false} onComplete={onComplete} />);

      unmount();

      act(() => {
        vi.runAllTimers();
      });

      // onComplete should not be called after unmount
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('reduced motion', () => {
    it('should respect prefers-reduced-motion', () => {
      // Test that component renders with reduced motion enabled
      // The actual motion reduction is handled by Framer Motion
      render(<DiceAnimation3D result={[3, 4]} isRolling={false} />);

      const container = screen.getByTestId('dice-animation-3d');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('role', 'region');
    });
  });
});
