import type { Meta, StoryObj } from '@storybook/react';
import { ActionPanel } from './ActionPanel';
import type { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import type { CombatState } from '@/src/domain/types/combat-v2';
import {
  createSimpleCombatState,
  createRestrictedCombatState,
} from '@/.storybook/helpers/mockCombatData';

/**
 * Decorator pour injecter un état de combat dans le store
 */
const withCombatState = (combatStateFactory: () => Partial<CombatState>): Decorator => {
  const DecoratorComponent: Decorator = (Story) => {
    const SetupCombat = () => {
      const store = useCharacterStore();

      useEffect(() => {
        const combatState = combatStateFactory();
        // Injecter l'état via Object.assign (acceptable pour Storybook)
        Object.assign(store, {
          combat: combatState,
          availableActions: [],
        });
      }, [store]);

      return <Story />;
    };
    
    SetupCombat.displayName = 'SetupCombat';

    return <SetupCombat />;
  };
  
  DecoratorComponent.displayName = 'withCombatState';
  return DecoratorComponent;
};

const meta = {
  title: 'Combat V2/ActionPanel',
  component: ActionPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Panneau d'actions de combat permettant au joueur de choisir :
- **Attaque** : Attaquer l'ennemi
- **Défense** : Position défensive (peut être future fonctionnalité)
- **Fuite** : Tenter de fuir (si autorisé)
- **Objet** : Utiliser un objet de l'inventaire (si autorisé et disponible)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    characterId: { control: 'text' },
  },
} satisfies Meta<typeof ActionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Actions disponibles - Attaque, Défense, Fuite
 */
export const AllActionsAvailable: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        config: {
          allowFlee: true,
          allowItems: true,
          deathOnDefeat: false,
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Toutes les actions de combat sont disponibles pour le joueur.',
      },
    },
  },
};

/**
 * Avec objet disponible
 */
export const WithItemsAvailable: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        config: {
          allowFlee: true,
          allowItems: true,
          deathOnDefeat: false,
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a des objets utilisables dans son inventaire. Le bouton "Objet" est actif.',
      },
    },
  },
};

/**
 * Fuite désactivée
 */
export const FleeDisabled: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        config: {
          allowFlee: false,
          allowItems: true,
          deathOnDefeat: true,
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'La fuite n\'est pas autorisée dans ce combat (combat de boss). Le bouton est désactivé.',
      },
    },
  },
};

/**
 * Objets désactivés
 */
export const ItemsDisabled: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        config: {
          allowFlee: true,
          allowItems: false,
          deathOnDefeat: false,
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'L\'utilisation d\'objets n\'est pas autorisée dans ce combat. Le bouton est désactivé.',
      },
    },
  },
};

/**
 * Pendant l'animation - Actions désactivées
 */
export const DuringAnimation: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'rolling',
        config: {
          allowFlee: true,
          allowItems: true,
          deathOnDefeat: false,
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Toutes les actions sont désactivées pendant l\'animation des dés.',
      },
    },
  },
};

/**
 * Aucune action disponible - Combat restreint
 */
export const NoActions: Story = {
  args: {
    characterId: 'test-character',
  },
  decorators: [
    withCombatState(() => createRestrictedCombatState({ phase: 'player_turn' })),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Combat mortel sans fuite ni objets. Seule l\'attaque est disponible.',
      },
    },
  },
};

