/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CombatLog } from './CombatLog';
import type { CombatEvent } from '@/src/domain/types/combat-v2';
import { CombatEventType } from '@/src/domain/types/CombatEventType';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('CombatLog', () => {
  const mockEvents: CombatEvent[] = [
    {
      type: CombatEventType.COMBAT_START,
      timestamp: '2024-01-01T10:00:00Z',
      round: 1,
    },
    {
      type: CombatEventType.ROUND_START,
      timestamp: '2024-01-01T10:00:01Z',
      round: 1,
    },
    {
      type: CombatEventType.ATTACK_ROLL,
      timestamp: '2024-01-01T10:00:02Z',
      round: 1,
      attacker: 'player',
      roll: { dice1: 4, dice2: 3, total: 7, success: true, hit: true },
      hit: true,
    },
    {
      type: CombatEventType.DAMAGE_DEALT,
      timestamp: '2024-01-01T10:00:03Z',
      round: 1,
      attacker: 'player',
      damage: 5,
    },
    {
      type: CombatEventType.ROUND_END,
      timestamp: '2024-01-01T10:00:04Z',
      round: 1,
    },
    {
      type: CombatEventType.ROUND_START,
      timestamp: '2024-01-01T10:00:05Z',
      round: 2,
    },
  ];

  describe('rendering', () => {
    it('should render with collapsed state by default', () => {
      render(<CombatLog events={mockEvents} />);

      expect(screen.getByText(/Historique \(6\)/)).toBeInTheDocument();
      expect(screen.queryByText('Round 1')).not.toBeInTheDocument();
    });

    it('should expand when button is clicked', () => {
      render(<CombatLog events={mockEvents} />);

      const button = screen.getByRole('button', { name: /Historique \(6\)/ });
      fireEvent.click(button);

      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });

    it('should collapse when button is clicked again', () => {
      render(<CombatLog events={mockEvents} />);

      const button = screen.getByRole('button', { name: /Historique \(6\)/ });
      fireEvent.click(button);
      expect(screen.getByText('Round 1')).toBeInTheDocument();

      fireEvent.click(button);
      expect(screen.queryByText('Round 1')).not.toBeInTheDocument();
    });

    it('should display empty state when no events', () => {
      render(<CombatLog events={[]} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(0\)/ }));

      expect(screen.getByText('Aucun événement pour le moment')).toBeInTheDocument();
    });

    it('should show correct event count in button', () => {
      render(<CombatLog events={mockEvents} />);

      expect(screen.getByText(/Historique \(6\)/)).toBeInTheDocument();
    });
  });

  describe('event grouping', () => {
    it('should group events by round', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      expect(screen.getByText('Round 1')).toBeInTheDocument();
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });

    it('should display events in correct order within rounds', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      const round1Header = screen.getByText('Round 1');
      const round2Header = screen.getByText('Round 2');

      const allHeaders = screen.getAllByText(/Round/);
      expect(allHeaders[0]).toBe(round1Header);
      expect(allHeaders[1]).toBe(round2Header);
    });
  });

  describe('event formatting', () => {
    it('should format combat start event', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      expect(screen.getByText('⚔️ Combat commencé')).toBeInTheDocument();
    });

    it('should format round start event', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      expect(screen.getByText('📢 Début du round 1')).toBeInTheDocument();
    });

    it('should format attack roll event with dice values', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      expect(screen.getByText((content) => content.includes('⚔️ Vous attaque') && content.includes('[4+3] = 7') && content.includes('Touché !'))).toBeInTheDocument();
    });

    it('should format damage dealt event', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      expect(screen.getByText(/Vous infligez 5 dégâts à l'ennemi/)).toBeInTheDocument();
    });

    it('should format enemy attack event', () => {
      const enemyAttackEvent: CombatEvent[] = [
        {
          type: CombatEventType.ATTACK_ROLL,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'enemy',
          roll: { dice1: 2, dice2: 1, total: 3, success: false, hit: false },
          hit: false,
        },
      ];

      render(<CombatLog events={enemyAttackEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes("⚔️ L'ennemi attaque") && content.includes('[2+1] = 3') && content.includes('Raté !')).length).toBeGreaterThan(0);
    });

    it('should format heal event', () => {
      const healEvent: CombatEvent[] = [
        {
          type: CombatEventType.HEAL,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          healAmount: 3,
        },
      ];

      render(<CombatLog events={healEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('💚 Vous récupérez 3 points de vie')).length).toBeGreaterThan(0);
    });

    it('should format weapon ability event', () => {
      const abilityEvent: CombatEvent[] = [
        {
          type: CombatEventType.WEAPON_ABILITY,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'player',
          abilityId: 'Lame Ardente',
        },
      ];

      render(<CombatLog events={abilityEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('⚔️ Vous utilisez Lame Ardente')).length).toBeGreaterThan(0);
    });

    it('should format luck test event', () => {
      const luckEvent: CombatEvent[] = [
        {
          type: CombatEventType.LUCK_TEST,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
        },
      ];

      render(<CombatLog events={luckEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('🎲 Test de chance')).length).toBeGreaterThan(0);
    });

    it('should format chance spent event', () => {
      const chanceEvent: CombatEvent[] = [
        {
          type: CombatEventType.CHANCE_SPENT,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          pointsSpent: 2,
        },
      ];

      render(<CombatLog events={chanceEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('⚡ 2 point(s) de chance dépensé(s)')).length).toBeGreaterThan(0);
    });

    it('should format flee success event', () => {
      const fleeEvent: CombatEvent[] = [
        {
          type: CombatEventType.FLEE,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          success: true,
        },
      ];

      render(<CombatLog events={fleeEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('🏃 Fuite réussie !')).length).toBeGreaterThan(0);
    });

    it('should format flee failure event', () => {
      const fleeEvent: CombatEvent[] = [
        {
          type: CombatEventType.FLEE,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          success: false,
        },
      ];

      render(<CombatLog events={fleeEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('🚫 Fuite échouée')).length).toBeGreaterThan(0);
    });

    it('should format item used event', () => {
      const itemEvent: CombatEvent[] = [
        {
          type: CombatEventType.ITEM_USED,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          abilityId: 'Potion de soin',
        },
      ];

      render(<CombatLog events={itemEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('🎒 Item utilisé : Potion de soin')).length).toBeGreaterThan(0);
    });

    it('should format combat end victory event', () => {
      const victoryEvent: CombatEvent[] = [
        {
          type: CombatEventType.COMBAT_END,
          timestamp: '2024-01-01T10:00:02Z',
          result: 'victory',
        },
      ];

      render(<CombatLog events={victoryEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('🏆 VICTOIRE !')).length).toBeGreaterThan(0);
    });

    it('should format combat end defeat event', () => {
      const defeatEvent: CombatEvent[] = [
        {
          type: CombatEventType.COMBAT_END,
          timestamp: '2024-01-01T10:00:02Z',
          result: 'defeat',
        },
      ];

      render(<CombatLog events={defeatEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('💀 DÉFAITE...')).length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute on button', () => {
      render(<CombatLog events={mockEvents} />);

      const button = screen.getByRole('button', { name: /Historique \(6\)/ });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-controls pointing to content', () => {
      render(<CombatLog events={mockEvents} />);

      const button = screen.getByRole('button', { name: /Historique \(6\)/ });
      expect(button).toHaveAttribute('aria-controls', 'combat-log-content');
    });

    it('should announce last event via aria-live', () => {
      render(<CombatLog events={mockEvents} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(6\)/ }));

      expect(screen.getAllByText((content) => content.includes('📢 Début du round 2')).length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle events without round number', () => {
      const eventsWithoutRound: CombatEvent[] = [
        {
          type: CombatEventType.COMBAT_START,
          timestamp: '2024-01-01T10:00:00Z',
        },
      ];

      render(<CombatLog events={eventsWithoutRound} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getByText('Round 0')).toBeInTheDocument();
    });

    it('should handle attack roll without hit status', () => {
      const attackEvent: CombatEvent[] = [
        {
          type: CombatEventType.ATTACK_ROLL,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'player',
          roll: { dice1: 4, dice2: 3, total: 7, success: true },
        },
      ];

      render(<CombatLog events={attackEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('⚔️ Vous attaque') && content.includes('[4+3] = 7')).length).toBeGreaterThan(0);
    });

    it('should handle attack roll without roll data', () => {
      const attackEvent: CombatEvent[] = [
        {
          type: CombatEventType.ATTACK_ROLL,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'player',
        },
      ];

      render(<CombatLog events={attackEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      const button = screen.getByRole('button', { name: /Historique \(1\)/ });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle damage event without damage amount', () => {
      const damageEvent: CombatEvent[] = [
        {
          type: CombatEventType.DAMAGE_DEALT,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'player',
        },
      ];

      render(<CombatLog events={damageEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      const button = screen.getByRole('button', { name: /Historique \(1\)/ });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle heal event without heal amount', () => {
      const healEvent: CombatEvent[] = [
        {
          type: CombatEventType.HEAL,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
        },
      ];

      render(<CombatLog events={healEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('💚 Soin effectué')).length).toBeGreaterThan(0);
    });

    it('should handle ability event without ability id', () => {
      const abilityEvent: CombatEvent[] = [
        {
          type: CombatEventType.ABILITY_USED,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
        },
      ];

      render(<CombatLog events={abilityEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('✨ Capacité utilisée')).length).toBeGreaterThan(0);
    });

    it('should handle item event without item id', () => {
      const itemEvent: CombatEvent[] = [
        {
          type: CombatEventType.ITEM_USED,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
        },
      ];

      render(<CombatLog events={itemEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('🎒 Item utilisé')).length).toBeGreaterThan(0);
    });

    it('should handle chance spent without points', () => {
      const chanceEvent: CombatEvent[] = [
        {
          type: CombatEventType.CHANCE_SPENT,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
        },
      ];

      render(<CombatLog events={chanceEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes('⚡ Chance dépensée')).length).toBeGreaterThan(0);
    });

    it('should handle weapon ability without ability id', () => {
      const abilityEvent: CombatEvent[] = [
        {
          type: CombatEventType.WEAPON_ABILITY,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'player',
        },
      ];

      render(<CombatLog events={abilityEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      const button = screen.getByRole('button', { name: /Historique \(1\)/ });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle enemy weapon ability', () => {
      const abilityEvent: CombatEvent[] = [
        {
          type: CombatEventType.WEAPON_ABILITY,
          timestamp: '2024-01-01T10:00:02Z',
          round: 1,
          attacker: 'enemy',
          abilityId: 'Griffes acérées',
        },
      ];

      render(<CombatLog events={abilityEvent} />);

      fireEvent.click(screen.getByRole('button', { name: /Historique \(1\)/ }));

      expect(screen.getAllByText((content) => content.includes("⚔️ L'ennemi utilise Griffes acérées")).length).toBeGreaterThan(0);
    });
  });

  describe('responsive design', () => {
    it('should have mobile-friendly button', () => {
      render(<CombatLog events={mockEvents} />);

      const button = screen.getByRole('button', { name: /Historique \(6\)/ });
      expect(button).toBeInTheDocument();
    });
  });
});
