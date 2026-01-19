import type { Meta, StoryObj } from '@storybook/react';
import { ItemPicker } from './ItemPicker';
import { fn } from '@storybook/test';
import type { CatalogItem } from '@/src/domain/types/items';
import { ItemType } from '@/src/domain/types/items';

const meta = {
  title: 'Combat V2/ItemPicker',
  component: ItemPicker,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    onSelect: { action: 'onSelect' },
    onClose: { action: 'onClose' },
  },
} satisfies Meta<typeof ItemPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: CatalogItem[] = [
  {
    id: 'potion-soin',
    name: 'Potion de Soin',
    effect: 'Restaure 4 points d\'endurance',
    type: ItemType.ACTIVE,
    tome: 1,
    healAmount: 4,
    stackable: true,
  },
  {
    id: 'potion-force',
    name: 'Potion de Force',
    effect: 'Augmente l\'habileté de +2 pour 3 tours',
    type: ItemType.SPECIAL,
    tome: 1,
  },
  {
    id: 'bombe',
    name: 'Bombe Alchimique',
    effect: 'Inflige 6 points de dégâts à l\'ennemi',
    type: ItemType.ACTIVE,
    tome: 1,
    damageToEnemy: 6,
    stackable: true,
  },
];

/**
 * Liste vide - Aucun objet disponible
 */
export const Empty: Story = {
  args: {
    items: [],
    isOpen: true,
    onSelect: fn(),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Aucun objet utilisable dans l\'inventaire.',
      },
    },
  },
};

/**
 * Liste avec objets
 */
export const WithItems: Story = {
  args: {
    items: sampleItems,
    isOpen: true,
    onSelect: fn(),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Liste d\'objets utilisables pendant le combat.',
      },
    },
  },
};

/**
 * Un seul objet
 */
export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]],
    isOpen: true,
    onSelect: fn(),
    onClose: fn(),
  },
};

/**
 * Fermé
 */
export const Closed: Story = {
  args: {
    items: sampleItems,
    isOpen: false,
    onSelect: fn(),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal fermé - rien n\'est affiché.',
      },
    },
  },
};

/**
 * Nombreux objets
 */
export const ManyItems: Story = {
  args: {
    items: [
      ...sampleItems,
      {
        id: 'elixir',
        name: 'Élixir Mystique',
        effect: 'Restaure toute l\'endurance',
        type: ItemType.ACTIVE,
        tome: 1,
        healAmount: 999,
        stackable: true,
      },
      {
        id: 'poison',
        name: 'Fiole de Poison',
        effect: 'Empoisonne l\'ennemi (-2 END par tour)',
        type: ItemType.SPECIAL,
        tome: 1,
      },
      {
        id: 'fumigene',
        name: 'Bombe Fumigène',
        effect: 'Facilite la fuite (+50% chance)',
        type: ItemType.SPECIAL,
        tome: 1,
      },
    ],
    isOpen: true,
    onSelect: fn(),
    onClose: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Liste avec défilement pour nombreux objets.',
      },
    },
  },
};
