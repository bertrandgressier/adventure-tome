import type { Meta, StoryObj } from '@storybook/react';
import { DiceAnimation } from './DiceAnimation';
import { fn } from '@storybook/test';

const meta = {
  title: 'Combat V2/DiceAnimation',
  component: DiceAnimation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isRolling: { control: 'boolean' },
    outcome: {
      control: 'radio',
      options: ['win', 'lose', 'tie', undefined],
    },
    onAnimationComplete: { action: 'onAnimationComplete' },
  },
} satisfies Meta<typeof DiceAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * État repos - Pas de lancer en cours
 */
export const Idle: Story = {
  args: {
    diceResult: null,
    isRolling: false,
    onAnimationComplete: fn(),
  },
};

/**
 * En cours de lancer
 */
export const Rolling: Story = {
  args: {
    diceResult: null,
    isRolling: true,
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Animation de rotation des dés en cours.',
      },
    },
  },
};

/**
 * Résultat: Victoire
 */
export const ResultWin: Story = {
  args: {
    diceResult: {
      dice: [5, 6],
      total: 11,
      modifiers: {
        habilete: 12,
        weaponBonus: 2,
      },
      finalScore: 25,
      isDouble: false,
      success: true,
    },
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a gagné le tour (score supérieur).',
      },
    },
  },
};

/**
 * Résultat: Défaite
 */
export const ResultLose: Story = {
  args: {
    diceResult: {
      dice: [1, 2],
      total: 3,
      modifiers: {
        habilete: 12,
        weaponBonus: 0,
      },
      finalScore: 15,
      isDouble: false,
      success: false,
    },
    isRolling: false,
    outcome: 'lose',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a perdu le tour (score inférieur).',
      },
    },
  },
};

/**
 * Résultat: Égalité
 */
export const ResultTie: Story = {
  args: {
    diceResult: {
      dice: [3, 4],
      total: 7,
      modifiers: {
        habilete: 10,
        weaponBonus: 1,
      },
      finalScore: 18,
      isDouble: false,
    },
    isRolling: false,
    outcome: 'tie',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Égalité - aucun dégât infligé.',
      },
    },
  },
};

/**
 * Double - Coup critique
 */
export const DoubleRoll: Story = {
  args: {
    diceResult: {
      dice: [6, 6],
      total: 12,
      modifiers: {
        habilete: 12,
        weaponBonus: 3,
      },
      finalScore: 27,
      isDouble: true,
      success: true,
    },
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Double 6 - coup critique avec bonus.',
      },
    },
  },
};

/**
 * Résultat avec arme légendaire
 */
export const WithLegendaryWeapon: Story = {
  args: {
    diceResult: {
      dice: [4, 5],
      total: 9,
      modifiers: {
        habilete: 12,
        weaponBonus: 5,
      },
      finalScore: 26,
      isDouble: false,
      success: true,
    },
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Lancer avec bonus d\'arme légendaire (+5).',
      },
    },
  },
};

/**
 * Résultat faible
 */
export const LowRoll: Story = {
  args: {
    diceResult: {
      dice: [1, 1],
      total: 2,
      modifiers: {
        habilete: 8,
        weaponBonus: 0,
      },
      finalScore: 10,
      isDouble: true,
      success: false,
    },
    isRolling: false,
    outcome: 'lose',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Double 1 - le pire résultat possible.',
      },
    },
  },
};
