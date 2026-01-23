/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionPanel } from './ActionPanel';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { ItemType } from '@/src/domain/types/items';

vi.mock('@/src/presentation/providers/character-store-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/presentation/providers/character-store-provider')>();
  return {
    ...actual,
    useCharacterStore: vi.fn(),
  };
});

const mockUseCharacterStore = vi.mocked(useCharacterStore);

const mockCatalogItems = {
  'tome1-potion-soin': {
    id: 'tome1-potion-soin',
    name: 'Potion de soin',
    type: ItemType.ACTIVE,
    tome: 1,
    healAmount: 5,
    effect: 'Restaure 5 points de vie',
  },
  'tome1-bague-deuxieme-chance': {
    id: 'tome1-bague-deuxieme-chance',
    name: "Bague de deuxième chance",
    type: ItemType.SPECIAL,
    tome: 1,
    effect: 'Permet de relancer un jet de dés',
  },
} as const;

const mockCharacter = {
  name: 'Hero',
  book: 1,
  talent: 'Guerrier',
  secondTalent: null,
  gameMode: 'mortal' as const,
  version: 10,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  stats: {
    dexterite: 12,
    endurance: 15,
    pointsDeVieMax: 20,
    chance: 8,
    chanceInitiale: 8,
  },
  inventory: {
    weapon: {
      itemId: 'tome1-epee',
      name: 'Épée',
      attackPoints: 2,
    },
    items: [
      { itemId: 'tome1-potion-soin', quantity: 2, possessed: true },
      { itemId: 'tome1-bague-deuxieme-chance', quantity: 1, possessed: true },
    ],
  },
  progress: { currentParagraph: 10, paragraphsRead: [10] },
  notes: '',
  getStats: vi.fn(function() {
    return {
      dexterite: 12,
      endurance: 15,
      pointsDeVieMax: 20,
      chance: 8,
      chanceInitiale: 8,
      pointsDeVieActuels: 15,
    };
  }),
  getInventory: vi.fn(function(this: typeof mockCharacter) {
    return this.inventory;
  }),
  updateName: vi.fn(),
  updateStats: vi.fn(),
  equipWeapon: vi.fn(),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  consumeItem: vi.fn(),
  updateProgress: vi.fn(),
  updateNotes: vi.fn(),
};

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
};

describe('ActionPanel', () => {
  const mockExecuteAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when no combat is active', () => {
    it('should not render anything', () => {
      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: null,
          availableActions: [],
          isAnimating: false,
          characters: { 'test-id': mockCharacter },
          getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          executeAction: mockExecuteAction,
        };
        return selector(state as any);
      });

      const { container } = render(<ActionPanel characterId="test-id" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when combat is in victory phase', () => {
    it('should not render', () => {
      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: { 
            ...mockCombat, 
            phase: 'ENDED' as const,
            enemies: [{ name: 'Gobelin', dexterite: 6, endurance: 0, enduranceMax: 8 }], // Victory: all enemies dead
          },
          availableActions: [],
          isAnimating: false,
          characters: { 'test-id': mockCharacter },
          getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          executeAction: mockExecuteAction,
        };
        return selector(state as any);
      });

      const { container } = render(<ActionPanel characterId="test-id" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when combat is in defeat phase', () => {
    it('should not render', () => {
      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: { 
            ...mockCombat, 
            phase: 'ENDED' as const,
            player: { ...mockCombat.player, endurance: 0 }, // Defeat: player dead
          },
          availableActions: [],
          isAnimating: false,
          characters: { 'test-id': mockCharacter },
          getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          executeAction: mockExecuteAction,
        };
        return selector(state as any);
      });

      const { container } = render(<ActionPanel characterId="test-id" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when combat is active', () => {
    const mockAvailableActions = [
      { action: { type: 'attack' }, enabled: true },
      { action: { type: 'use_item' }, enabled: true },
      { action: { type: 'spend_chance' }, enabled: false, disabledReason: 'Plus de CHANCE' },
      { action: { type: 'flee' }, enabled: true },
    ];

    beforeEach(() => {
      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: mockCombat,
          availableActions: mockAvailableActions,
          isAnimating: false,
          characters: { 'test-id': mockCharacter },
          getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          executeAction: mockExecuteAction,
        };
        return selector(state as any);
      });
    });

    it('should render action buttons', () => {
      render(<ActionPanel characterId="test-id" />);

      expect(screen.getByText('Attaquer')).toBeInTheDocument();
      expect(screen.getByText('Objet')).toBeInTheDocument();
      expect(screen.getByText('Fuir')).toBeInTheDocument();
    });

    it('should disable buttons when disabled in available actions', () => {
      render(<ActionPanel characterId="test-id" />);

      const chanceButton = screen.getByText('CHANCE').closest('button');
      expect(chanceButton).toBeDisabled();
    });

    it('should call executeAction when attack button is clicked', async () => {
      const user = userEvent.setup();
      render(<ActionPanel characterId="test-id" />);

      const attackButton = screen.getByText('Attaquer').closest('button');
      await user.click(attackButton!);

      expect(mockExecuteAction).toHaveBeenCalledWith({ type: 'attack' });
    });

    it('should open item picker when item button is clicked', async () => {
      const user = userEvent.setup();
      render(<ActionPanel characterId="test-id" />);

      const itemButton = screen.getByText('Objet').closest('button');
      await user.click(itemButton!);

      expect(screen.getByText('Choisir un objet')).toBeInTheDocument();
    });

    describe('Item picker', () => {
      it('should display available items when opened', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        expect(screen.getByText('Potion de soin')).toBeInTheDocument();
        // La bague passive ne devrait pas apparaître (pas de healAmount/damageToEnemy)
      });

      it('should display item effects', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        expect(screen.getByText('Restaure 5 points de vie')).toBeInTheDocument();
        // L'effet de la bague passive ne devrait pas apparaître
      });

      it('should display item heal amount', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        expect(screen.getByText('+5 PV')).toBeInTheDocument();
      });

      it('should execute use_item action when item is selected', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        const potionItem = screen.getByText('Potion de soin').closest('button');
        await user.click(potionItem!);

        expect(mockExecuteAction).toHaveBeenCalledWith({
          type: 'use_item',
          payload: {
            id: 'tome1-potion-soin',
            name: 'Potion de soin',
            itemIndex: 0,
            quantity: 2,
            healAmount: 5,
            damageToEnemy: undefined,
          },
        });
      });

      it('should close item picker when backdrop is clicked', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        const backdrop = screen.getByLabelText('Fermer le sélecteur d\'objets');
        await user.click(backdrop);

        await waitFor(() => {
          expect(screen.queryByText('Choisir un objet')).not.toBeInTheDocument();
        });
      });

      it('should close item picker when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        const closeButton = screen.getByLabelText('Fermer');
        await user.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByText('Choisir un objet')).not.toBeInTheDocument();
        });
      });

      it('should close item picker when cancel button is clicked', async () => {
        const user = userEvent.setup();
        render(<ActionPanel characterId="test-id" />);

        const itemButton = screen.getByText('Objet').closest('button');
        await user.click(itemButton!);

        const cancelButton = screen.getByText('Annuler');
        await user.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByText('Choisir un objet')).not.toBeInTheDocument();
        });
      });

    it('should show message when no usable items are available', async () => {
      const user = userEvent.setup();

      const emptyInventory = {
        ...mockCharacter,
        inventory: {
          weapon: { itemId: 'tome1-epee', name: 'Épée', attackPoints: 2 },
          items: [],
        },
      };

      mockUseCharacterStore.mockImplementation((selector) => {
        const state = {
          combat: mockCombat,
          availableActions: mockAvailableActions,
          isAnimating: false,
          characters: { 'test-id': emptyInventory },
          getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          executeAction: mockExecuteAction,
        };
        return selector(state as any);
      });

      render(<ActionPanel characterId="test-id" />);

      const itemButton = screen.getByText('Objet').closest('button');
      await user.click(itemButton!);

      expect(screen.getByText('Aucun objet utilisable disponible')).toBeInTheDocument();
    });
  });

    describe('Accessibility', () => {
      it('should have aria-label for disabled actions', () => {
        render(<ActionPanel characterId="test-id" />);

        const chanceButton = screen.getByText('CHANCE').closest('button');
        expect(chanceButton).toHaveAttribute('aria-label', 'CHANCE');
        expect(chanceButton).toHaveAttribute('aria-disabled', 'true');
      });
    });

    describe('Weapon ability', () => {
      it('should display weapon ability button when available', () => {
        const weaponAbilityCombat = {
          ...mockCombat,
          player: {
            ...mockCombat.player,
            weapon: {
              ...mockCombat.player.weapon,
              ability: {
                id: 'extra-attack',
                name: 'Attaque rapide',
                trigger: 'on_hit' as const,
                effect: { type: 'extra_attack' as const },
              },
            },
          },
        };

        const baseActions = [
          { action: { type: 'attack' }, enabled: true },
          { action: { type: 'use_item' }, enabled: true },
          { action: { type: 'spend_chance' }, enabled: false, disabledReason: 'Plus de CHANCE' },
          { action: { type: 'flee' }, enabled: true },
        ];

        const weaponAbilityActions = [
          ...baseActions,
          { action: { type: 'weapon_ability' }, enabled: true },
        ];

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = {
            combat: weaponAbilityCombat,
            availableActions: weaponAbilityActions,
            isAnimating: false,
            characters: { 'test-id': mockCharacter },
            executeAction: mockExecuteAction,
            getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          };
          return selector(state as any);
        });

        render(<ActionPanel characterId="test-id" />);

        expect(screen.getByText('Pouvoir')).toBeInTheDocument();
      });

      it('should call executeAction with weapon_ability when clicked', async () => {
        const user = userEvent.setup();

        const weaponAbilityCombat = {
          ...mockCombat,
          player: {
            ...mockCombat.player,
            weapon: {
              ...mockCombat.player.weapon,
              ability: {
                id: 'extra-attack',
                name: 'Attaque rapide',
                trigger: 'on_hit' as const,
                effect: { type: 'extra_attack' as const },
              },
            },
          },
        };

        const baseActions = [
          { action: { type: 'attack' }, enabled: true },
          { action: { type: 'use_item' }, enabled: true },
          { action: { type: 'spend_chance' }, enabled: false, disabledReason: 'Plus de CHANCE' },
          { action: { type: 'flee' }, enabled: true },
        ];

        const weaponAbilityActions = [
          ...baseActions,
          { action: { type: 'weapon_ability' }, enabled: true },
        ];

        mockUseCharacterStore.mockImplementation((selector) => {
          const state = {
            combat: weaponAbilityCombat,
            availableActions: weaponAbilityActions,
            isAnimating: false,
            characters: { 'test-id': mockCharacter },
            executeAction: mockExecuteAction,
            getItem: (id: string) => mockCatalogItems[id as keyof typeof mockCatalogItems],
          };
          return selector(state as any);
        });

        render(<ActionPanel characterId="test-id" />);

        const powerButton = screen.getByText('Pouvoir').closest('button');
        await user.click(powerButton!);

        expect(mockExecuteAction).toHaveBeenCalledWith({ type: 'weapon_ability' });
      });
    });
  });
});
