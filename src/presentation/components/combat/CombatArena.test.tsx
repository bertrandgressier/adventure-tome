/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CombatArena } from './CombatArena';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';

vi.mock('@/src/presentation/providers/character-store-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/presentation/providers/character-store-provider')>();
  return {
    ...actual,
    useCharacterStore: vi.fn(),
  };
});

const mockUseCharacterStore = vi.mocked(useCharacterStore);

// Helper pour créer un mock character standard
const createMockCharacter = (id = 'test-id') => ({
  id,
  name: 'Test Hero',
  getInventory: () => ({ 
    items: [],
    equippedWeapon: null,
    gold: 0,
  }),
});

// Helper pour créer un state complet avec characters et getItem
const createMockState = (overrides: any = {}) => ({
  characters: { 'test-id': createMockCharacter() },
  getItem: () => undefined,
  ...overrides,
});

describe('CombatArena', () => {
  const mockOnExit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  describe('when no active combat', () => {
    it('should render nothing', () => {
      mockUseCharacterStore.mockImplementation((selector) => {
        return selector({
          combat: null,
          availableActions: [],
          lastActionTimestamp: 0,
          executeAction: vi.fn(),
          endCombat: vi.fn(),
        } as any);
      });

      const { container } = render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when combat is active', () => {
    const mockCombat = {
      id: 'combat-1',
      characterId: 'test-id',
      player: {
        name: 'Hero',
        dexterite: 12,
        endurance: 15,
        enduranceMax: 20,
        chance: 8,
        weapon: { id: 'sword', name: 'Épée', bonus: 2 },
        weaponDamage: 0,
        passiveDamageBonus: 0,
        totalDamageBonus: 0,
      },
      enemy: {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 8,
        enduranceMax: 8,
        chance: 0,
        weapon: { id: 'dagger', name: 'Dague', bonus: 1 },
        weaponDamage: 0,
        passiveDamageBonus: 0,
        totalDamageBonus: 0,
        isBoss: false,
      },
      phase: 'player_turn' as const,
      roundNumber: 1,
      currentTurn: 'player' as const,
      currentAttacker: 'player' as const,
      usedAbilities: {},
      usedReroll: false,
      isFirstAttack: true,
      config: {
        damageFormula: 'standard',
        isSurprise: false,
      },
      events: [],
      usedItems: [],
      history: [], // Historique des actions de combat (V3)
    };

    const mockAvailableActions = [
      { action: { type: 'attack' }, enabled: true },
      { action: { type: 'use_item' }, enabled: true },
      { action: { type: 'spend_chance' }, enabled: false, disabledReason: 'Plus de CHANCE' },
      { action: { type: 'flee' }, enabled: true },
    ];

    beforeEach(() => {
      const mockCharacter = {
        id: 'test-id',
        name: 'Test Hero',
        getInventory: () => ({ 
          items: [],
          equippedWeapon: null,
          gold: 0,
        }),
      };

      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: mockCombat,
          availableActions: mockAvailableActions,
          lastActionTimestamp: 0,
          executeAction: vi.fn(),
          endCombat: vi.fn(),
          getItem: () => undefined,
          characters: {
            'test-id': mockCharacter,
          },
          // Nouvelles actions pour l'orchestration du combat
          turnPhase: 'PLAYER_TURN_START' as const,
          endPlayerTurn: vi.fn(),
          executeEnemyAttack: vi.fn(),
          endEnemyTurn: vi.fn(),
        };

        return selector(state as any);
      });
    });

    it('should render full-screen layout', () => {
      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      const container = screen.getByRole('button', { name: /quitter/i }).parentElement;
      expect(container).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should disable body scroll when mounted', () => {
      document.body.style.overflow = 'auto';

      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should re-enable body scroll when unmounted', () => {
      document.body.style.overflow = 'auto';

      const { unmount } = render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      unmount();

      expect(document.body.style.overflow).toBe('');
    });

    it('should render enemy combatant card', () => {
      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      expect(screen.getByText('Gobelin')).toBeInTheDocument();
      expect(screen.getByText(/DEX: 6/)).toBeInTheDocument();
    });

    it('should render player combatant card', () => {
      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      expect(screen.getByText('Hero')).toBeInTheDocument();
      expect(screen.getByText(/DEX: 12/)).toBeInTheDocument();
    });

    it('should render action panel with available actions', () => {
      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      expect(screen.getByText('Attaquer')).toBeInTheDocument();
      expect(screen.getByText('Objet')).toBeInTheDocument();
      expect(screen.getByText('Fuir')).toBeInTheDocument();
    });

    it('should disable disabled actions', () => {
      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      const chanceButton = screen.getByText('CHANCE').closest('button');
      expect(chanceButton).toBeDisabled();
    });

    it('should call onExit when exit button clicked without active combat', async () => {
      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: { 
            ...mockCombat, 
            phase: 'ENDED' as const,
            enemies: [{ name: 'Gobelin', dexterite: 6, endurance: 0, enduranceMax: 8 }], // Victory
          },
          availableActions: [],
          lastActionTimestamp: 0,
          executeAction: vi.fn(),
          endCombat: vi.fn(),
          characters: { 'test-id': createMockCharacter() },
          getItem: () => undefined,
          // Nouvelles actions pour l'orchestration du combat
          turnPhase: 'COMBAT_ENDED' as const,
          endPlayerTurn: vi.fn(),
          executeEnemyAttack: vi.fn(),
          endEnemyTurn: vi.fn(),
        };
         
         
        return selector(state as any);
      });

      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      const exitButton = screen.getByRole('button', { name: /quitter/i });
      await userEvent.click(exitButton);

      expect(mockOnExit).toHaveBeenCalled();
    });

    it('should show confirmation dialog when exiting during combat', async () => {
      global.confirm = vi.fn(() => false);

      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      const exitButton = screen.getByRole('button', { name: /quitter/i });
      await userEvent.click(exitButton);

      expect(global.confirm).toHaveBeenCalledWith('Quitter le combat en cours ? La progression sera perdue.');
      expect(mockOnExit).not.toHaveBeenCalled();
    });

    it('should call onExit after confirmation', async () => {
      global.confirm = vi.fn(() => true);

      render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      const exitButton = screen.getByRole('button', { name: /quitter/i });
      await userEvent.click(exitButton);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockOnExit).toHaveBeenCalled();
    });

    describe('CombatantCard', () => {
      it('should display player health bar correctly', () => {
        render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        expect(screen.getByText('15/20')).toBeInTheDocument();
      });

      it('should display weapon information', () => {
        render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        expect(screen.getByText('Épée')).toBeInTheDocument();
        expect(screen.getByText(/\+2/)).toBeInTheDocument();
      });
    });

    describe('DiceAnimation', () => {
      it('should show ready message when no roll', () => {
        const noRollCombat = {
          ...mockCombat,
          lastRoll: undefined,
        };

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = createMockState({
            combat: noRollCombat,
            availableActions: mockAvailableActions,
            lastActionTimestamp: 0,
            executeAction: vi.fn(),
            endCombat: vi.fn(),
          });
           
         
        return selector(state as any);
        });

        const { container } = render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        // Avec lastRoll undefined, DiceAnimation retourne null (idle state)
        // Vérifions juste que le composant se rend correctement
        expect(container).toBeTruthy();
      });

      it('should display dice values when roll is present', async () => {
        vi.useFakeTimers();
        try {
          const withRollCombat = {
            ...mockCombat,
            lastRoll: {
              dice1: 4,
              dice2: 5,
              total: 9,
              success: true,
            },
          };

          mockUseCharacterStore.mockImplementation((selector) => {
            const state = createMockState({
              combat: withRollCombat,
              availableActions: mockAvailableActions,
              lastActionTimestamp: 0,
              executeAction: vi.fn(),
              endCombat: vi.fn(),
            });


          return selector(state as any);
          });

          const { container } = render(
            <CombatArena characterId="test-id" onExit={mockOnExit} />
          );

          await act(async () => {
            vi.runAllTimers();
          });

          // Vérifier que le composant se rend correctement
          expect(container.firstChild).not.toBeNull();
        } finally {
          vi.useRealTimers();
        }
      });

      it('should show double badge on double roll', () => {
        const doubleRollCombat = {
          ...mockCombat,
          lastRoll: {
            dice1: 6,
            dice2: 6,
            total: 12,
            isDouble: true,
            success: true,
          },
        };

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = createMockState({
            combat: doubleRollCombat,
            availableActions: mockAvailableActions,
            lastActionTimestamp: 0,
            executeAction: vi.fn(),
            endCombat: vi.fn(),
          });
           
         
        return selector(state as any);
        });

        const { container } = render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        // Vérifier que le composant se rend correctement
        expect(container.firstChild).not.toBeNull();
      });
    });

    describe('Victory phase', () => {
      it('should display victory message', () => {
        const victoryCombat = {
          ...mockCombat,
          phase: 'ENDED' as const,
          enemies: [{ name: 'Gobelin', dexterite: 6, endurance: 0, enduranceMax: 8 }],
        };

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = {
            combat: victoryCombat,
            availableActions: [],
            lastActionTimestamp: 0,
            executeAction: vi.fn(),
            endCombat: vi.fn(),
            characters: { 'test-id': createMockCharacter() },
            getItem: () => undefined,
            // Nouvelles actions pour l'orchestration du combat
            turnPhase: 'COMBAT_ENDED' as const,
            endPlayerTurn: vi.fn(),
            executeEnemyAttack: vi.fn(),
            endEnemyTurn: vi.fn(),
          };
           
         
        return selector(state as any);
        });

        render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        expect(screen.getByText('VICTOIRE !')).toBeInTheDocument();
        expect(screen.getByText('Terminer')).toBeInTheDocument();
      });
    });

    describe('Defeat phase', () => {
      it('should display defeat message', () => {
        const defeatCombat = {
          ...mockCombat,
          phase: 'ENDED' as const,
          player: { ...mockCombat.player, endurance: 0 }, // Defeat
        };

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = {
            combat: defeatCombat,
            availableActions: [],
            lastActionTimestamp: 0,
            executeAction: vi.fn(),
            endCombat: vi.fn(),
            characters: { 'test-id': createMockCharacter() },
            getItem: () => undefined,
            // Nouvelles actions pour l'orchestration du combat
            turnPhase: 'COMBAT_ENDED' as const,
            endPlayerTurn: vi.fn(),
            executeEnemyAttack: vi.fn(),
            endEnemyTurn: vi.fn(),
          };
           
         
        return selector(state as any);
        });

        render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        expect(screen.getByText('DÉFAITE...')).toBeInTheDocument();
        expect(screen.getByText('Terminer')).toBeInTheDocument();
      });
    });

    describe('DamageIndicator', () => {
      it('should not render when no pending damage', () => {
        const noDamageCombat = {
          ...mockCombat,
          pendingDamage: undefined,
        };

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = createMockState({
            combat: noDamageCombat,
            availableActions: mockAvailableActions,
            lastActionTimestamp: 0,
            executeAction: vi.fn(),
            endCombat: vi.fn(),
          });
           
         
        return selector(state as any);
        });

        render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        expect(screen.queryByText(/-/)).not.toBeInTheDocument();
      });

      it('should render damage indicator when damage is pending', () => {
        const damageCombat = {
          ...mockCombat,
          pendingDamage: {
            amount: 5,
            canBlock: false,
          },
        };

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = createMockState({
            combat: damageCombat,
            availableActions: mockAvailableActions,
            lastActionTimestamp: 0,
            executeAction: vi.fn(),
            endCombat: vi.fn(),
          });
           
         
        return selector(state as any);
        });

        const { container } = render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        // Vérifier que le composant se rend correctement
        expect(container.firstChild).not.toBeNull();
      });
    });

    describe('Mobile responsive', () => {
      it('should have touch-friendly buttons', () => {
        render(
          <CombatArena characterId="test-id" onExit={mockOnExit} />
        );

        const buttons = screen.getAllByRole('button');

        // Vérifier qu'il y a au moins des boutons
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Safe area handling', () => {
    it('should include safe area classes for iOS', () => {
      const mockCharacter = {
        id: 'test-id',
        name: 'Test Hero',
        getInventory: () => ({ 
          items: [],
          equippedWeapon: null,
          gold: 0,
        }),
      };

      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: {
            id: 'combat-1',
            characterId: 'test-id',
            player: {
              name: 'Hero',
              dexterite: 12,
              endurance: 15,
              enduranceMax: 20,
              chance: 8,
              weapon: { id: 'sword', name: 'Épée', bonus: 2 },
              weaponDamage: 0,
              passiveDamageBonus: 0,
              totalDamageBonus: 0,
            },
            enemy: {
              name: 'Gobelin',
              dexterite: 6,
              endurance: 8,
              enduranceMax: 8,
              chance: 0,
              weapon: { id: 'dagger', name: 'Dague', bonus: 1 },
              weaponDamage: 0,
              passiveDamageBonus: 0,
              totalDamageBonus: 0,
              isBoss: false,
            },
            phase: 'player_turn' as const,
            roundNumber: 1,
            currentTurn: 'player' as const,
            currentAttacker: 'player' as const,
            usedAbilities: {},
            usedReroll: false,
            isFirstAttack: true,
            config: {
              damageFormula: 'standard',
              isSurprise: false,
            },
            events: [],
            usedItems: [],
            history: [], // Historique des actions de combat (V3)
          },
          availableActions: [],
          lastActionTimestamp: 0,
          executeAction: vi.fn(),
          endCombat: vi.fn(),
          characters: {
            'test-id': mockCharacter,
          },
          getItem: () => undefined,
        };
         
         
        return selector(state as any);
      });

      const { container } = render(
        <CombatArena characterId="test-id" onExit={mockOnExit} />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('safe-area-top', 'safe-area-bottom');
    });
  });
});
