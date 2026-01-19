import type { Meta, StoryObj } from '@storybook/react';
import { CombatArena } from './CombatArena';
import { fn } from '@storybook/test';

const meta = {
  title: 'Combat V2/CombatArena',
  component: CombatArena,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    characterId: { control: 'text' },
    onExit: { action: 'onExit' },
  },
} satisfies Meta<typeof CombatArena>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * État initial - Pas de combat actif
 */
export const Idle: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
};

/**
 * Phase de lancer de dés
 */
export const Rolling: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'État pendant le lancer des dés, les actions sont désactivées.',
      },
    },
  },
};

/**
 * Tour du joueur
 */
export const PlayerTurn: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur peut choisir son action (attaque, défense, fuite, objet).',
      },
    },
  },
};

/**
 * Tour de l'ennemi
 */
export const EnemyTurn: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'L\'ennemi attaque automatiquement, pas d\'interaction joueur.',
      },
    },
  },
};

/**
 * Victoire - Tous les ennemis vaincus
 */
export const Victory: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tous les ennemis sont vaincus, affichage de l\'écran de victoire.',
      },
    },
  },
};

/**
 * Défaite - Le joueur est vaincu
 */
export const Defeat: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur est vaincu, affichage de l\'écran de défaite.',
      },
    },
  },
};

/**
 * Fuite réussie
 */
export const FleeSuccess: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a réussi à fuir le combat.',
      },
    },
  },
};

/**
 * État critique - Joueur avec faible endurance
 */
export const CriticalHealth: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a moins de 25% de ses points de vie, affichage en rouge.',
      },
    },
  },
};

/**
 * Combat multiple - Plusieurs ennemis
 */
export const MultipleEnemies: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat contre plusieurs ennemis simultanément.',
      },
    },
  },
};
