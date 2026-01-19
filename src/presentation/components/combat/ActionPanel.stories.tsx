import type { Meta, StoryObj } from '@storybook/react';
import { ActionPanel } from './ActionPanel';

const meta = {
  title: 'Combat V2/ActionPanel',
  component: ActionPanel,
  parameters: {
    layout: 'padded',
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
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a des objets utilisables dans son inventaire.',
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
  parameters: {
    docs: {
      description: {
        story: 'La fuite n\'est pas autorisée dans ce combat.',
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
  parameters: {
    docs: {
      description: {
        story: 'L\'utilisation d\'objets n\'est pas autorisée dans ce combat.',
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
  parameters: {
    docs: {
      description: {
        story: 'Toutes les actions sont désactivées pendant l\'animation des dés.',
      },
    },
  },
};

/**
 * Aucune action disponible
 */
export const NoActionsAvailable: Story = {
  args: {
    characterId: 'test-character',
  },
  parameters: {
    docs: {
      description: {
        story: 'Aucune action n\'est disponible (phase de fin de combat).',
      },
    },
  },
};
