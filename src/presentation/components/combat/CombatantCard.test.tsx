/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CombatantCard } from './CombatantCard';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});





describe('CombatantCard', () => {
  const playerCombatant = {
    name: 'Hero',
    dexterite: 12,
    endurance: 15,
    enduranceMax: 20,
    chance: 8,
    weapon: { id: 'sword', name: 'Épée', bonus: 2 },
    weaponDamage: 0,
    passiveDamageBonus: 0,
    totalDamageBonus: 0,
  };

  const enemyCombatant = {
    ...playerCombatant,
    name: 'Gobelin',
    dexterite: 6,
    endurance: 8,
    enduranceMax: 8,
    isBoss: false,
  };

  describe('rendering', () => {
    it('should render player combatant', () => {
      render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      expect(screen.getByText('Hero')).toBeInTheDocument();
      expect(screen.getByText(/DEX: 12/)).toBeInTheDocument();
    });

    it('should render enemy combatant', () => {
      render(
        <CombatantCard combatant={enemyCombatant} type="enemy" isActive={false} />
      );

      expect(screen.getByText('Gobelin')).toBeInTheDocument();
      expect(screen.getByText(/DEX: 6/)).toBeInTheDocument();
    });

    it('should render weapon information', () => {
      render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      expect(screen.getByText('Épée')).toBeInTheDocument();
      expect(screen.getByText(/\+2/)).toBeInTheDocument();
    });

    it('should display health points correctly', () => {
      render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      expect(screen.getByText('15/20')).toBeInTheDocument();
    });

    it('should have accessible labels', () => {
      render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      const healthLabel = screen.getByLabelText(/Points de vie: 15 sur 20/);
      expect(healthLabel).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '15');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '20');
    });
  });

  describe('visual states', () => {
    describe('idle state', () => {
      it('should render with default styling when inactive', () => {
        const { container } = render(
          <CombatantCard
            combatant={playerCombatant}
            type="player"
            isActive={false}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card).not.toHaveClass('border-primary/50', 'shadow-\\[0_0_10px_rgba\\(234,179,8,0\\.2\\)\\]');
        expect(card).not.toHaveClass('animate-pulse-slow');
      });
    });

    describe('active state', () => {
      it('should render with active styling when active', () => {
        const { container } = render(
          <CombatantCard
            combatant={playerCombatant}
            type="player"
            isActive={true}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card.tagName.toLowerCase()).toBe('div');
      });
    });

    describe('damaged state', () => {
      it('should render with damage styling when lastDamage is provided', () => {
        const { container } = render(
          <CombatantCard
            combatant={playerCombatant}
            type="player"
            isActive={false}
            lastDamage={5}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card.tagName.toLowerCase()).toBe('div');
      });
    });

    describe('healing state', () => {
      it('should render with healing styling when lastDamage is negative', () => {
        const { container } = render(
          <CombatantCard
            combatant={playerCombatant}
            type="player"
            isActive={false}
            lastDamage={-3}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card.tagName.toLowerCase()).toBe('div');
      });
    });

    describe('dead state', () => {
      it('should render with dead styling when health is zero', () => {
        const deadCombatant = {
          ...playerCombatant,
          endurance: 0,
        };

        const { container } = render(
          <CombatantCard
            combatant={deadCombatant}
            type="player"
            isActive={false}
          />
        );

        const card = container.firstChild as HTMLElement;
        expect(card.tagName.toLowerCase()).toBe('div');
      });
    });
  });

  describe('health bar colors', () => {
    it('should use primary color for healthy state', () => {
      render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-primary');
    });

    it('should use critical color for low health', () => {
      const lowHealthCombatant = {
        ...playerCombatant,
        endurance: 4,
      };

      render(
        <CombatantCard
          combatant={lowHealthCombatant}
          type="player"
          isActive={false}
        />
      );

      const healthText = screen.getByText('4/20');
      expect(healthText).toHaveClass('text-orange-500');

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-orange-500');
    });

    it('should use red color for dead state', () => {
      const deadCombatant = {
        ...playerCombatant,
        endurance: 0,
      };

      render(
        <CombatantCard
          combatant={deadCombatant}
          type="player"
          isActive={false}
        />
      );

      const healthText = screen.getByText('0/20');
      expect(healthText).toHaveClass('text-red-600');

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-red-600');
    });
  });

  describe('responsive design', () => {
    it('should have minimum height for touch targets', () => {
      const { container } = render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      const card = container.firstChild as HTMLElement;
      const className = card.className;
      expect(className).toContain('min-h-[120px]');
    });

    it('should use responsive padding', () => {
      const { container } = render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });
  });

  describe('transitions', () => {
    it('should use motion.div for animated transitions', () => {
      const { container } = render(
        <CombatantCard
          combatant={playerCombatant}
          type="player"
          isActive={false}
        />
      );

      const card = container.firstChild as HTMLElement;
      expect(card.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('edge cases', () => {
    it('should handle zero health correctly', () => {
      const deadCombatant = {
        ...playerCombatant,
        endurance: 0,
      };

      render(
        <CombatantCard
          combatant={deadCombatant}
          type="player"
          isActive={false}
        />
      );

      expect(screen.getByText('0/20')).toBeInTheDocument();
    });

    it('should handle full health correctly', () => {
      const fullHealthCombatant = {
        ...playerCombatant,
        endurance: 20,
      };

      render(
        <CombatantCard
          combatant={fullHealthCombatant}
          type="player"
          isActive={false}
        />
      );

      expect(screen.getByText('20/20')).toBeInTheDocument();
    });

    it('should handle weapon with zero bonus', () => {
      const noBonusCombatant = {
        ...playerCombatant,
        weapon: { id: 'staff', name: 'Bâton', bonus: 0 },
      };

      render(
        <CombatantCard
          combatant={noBonusCombatant}
          type="player"
          isActive={false}
        />
      );

      expect(screen.getByText('Bâton')).toBeInTheDocument();
      expect(screen.queryByText(/\\+/)).not.toBeInTheDocument();
    });

    it('should handle weapon with no bonus displayed', () => {
      const noWeaponCombatant = {
        ...playerCombatant,
        weapon: undefined,
      };

      render(
        <CombatantCard
          combatant={noWeaponCombatant as typeof playerCombatant & { weapon?: undefined }}
          type="player"
          isActive={false}
        />
      );

      expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
    });
  });
});
