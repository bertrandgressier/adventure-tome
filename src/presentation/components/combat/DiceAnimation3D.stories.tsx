import type { Meta, StoryObj } from '@storybook/react';
import { DiceAnimation3D } from './DiceAnimation3D';
import { fn } from '@storybook/test';
import { useState } from 'react';

const meta = {
  title: 'Combat V3/DiceAnimation3D',
  component: DiceAnimation3D,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    result: {
      control: 'object',
      description: 'Le résultat des deux dés [1-6, 1-6]',
    },
    isRolling: {
      control: 'boolean',
      description: 'État de lancer en cours',
    },
    onComplete: {
      action: 'onComplete',
      description: 'Callback appelé à la fin de l\'animation',
    },
  },
} satisfies Meta<typeof DiceAnimation3D>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * État repos - Dés prêts pour un lancer
 */
export const Idle: Story = {
  args: {
    result: [3, 4],
    isRolling: false,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Les dés sont au repos, affichant le dernier résultat.',
      },
    },
  },
};

/**
 * Animation de lancer en cours
 */
export const Rolling: Story = {
  args: {
    result: [3, 4],
    isRolling: true,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Animation 3D de rotation des dés sur les 3 axes (X, Y, Z). Les dés tournent à grande vitesse avec effet de rebond.',
      },
    },
  },
};

/**
 * Résultat faible (Snake Eyes)
 */
export const LowRoll: Story = {
  args: {
    result: [1, 1],
    isRolling: false,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Double 1 - Le pire résultat possible (Snake Eyes).',
      },
    },
  },
};

/**
 * Résultat élevé (Boxcars)
 */
export const HighRoll: Story = {
  args: {
    result: [6, 6],
    isRolling: false,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Double 6 - Le meilleur résultat possible (Boxcars).',
      },
    },
  },
};

/**
 * Résultat moyen
 */
export const MediumRoll: Story = {
  args: {
    result: [3, 4],
    isRolling: false,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Résultat moyen classique (total de 7).',
      },
    },
  },
};

/**
 * Valeurs différentes
 */
export const MixedValues: Story = {
  args: {
    result: [2, 5],
    isRolling: false,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Dés avec des valeurs différentes (2 et 5).',
      },
    },
  },
};

/**
 * Animation complète - Rolling vers Result
 */
/**
 * Animation complète - Rolling vers Result
 */
const InteractiveRollComponent = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<[number, number]>([3, 4]);

  const rollDice = () => {
    setIsRolling(true);
    
    setTimeout(() => {
      const newResult: [number, number] = [
        Math.floor(Math.random() * 6) + 1 as 1 | 2 | 3 | 4 | 5 | 6,
        Math.floor(Math.random() * 6) + 1 as 1 | 2 | 3 | 4 | 5 | 6,
      ];
      setResult(newResult);
      setIsRolling(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <DiceAnimation3D
        result={result}
        isRolling={isRolling}
        onComplete={() => console.log('Animation terminée!')}
      />
      <button
        onClick={rollDice}
        disabled={isRolling}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        {isRolling ? 'Lancer en cours...' : 'Lancer les dés'}
      </button>
      <div className="text-sm text-muted-foreground">
        Résultat: {result[0]} + {result[1]} = {result[0] + result[1]}
      </div>
    </div>
  );
};

export const InteractiveRoll: Story = {
  render: () => <InteractiveRollComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Démonstration interactive du cycle complet : rolling → result. Cliquez sur le bouton pour lancer les dés.',
      },
    },
  },
};

/**
 * Toutes les valeurs possibles
 */
export const AllValues: Story = {
  render: () => {
    const allCombinations: Array<[number, number]> = [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
      [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
      [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
      [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
      [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
    ];

    return (
      <div className="grid grid-cols-6 gap-4 p-4">
        {allCombinations.map((combo) => (
          <div key={`${combo[0]}-${combo[1]}`} className="flex flex-col items-center gap-2">
            <DiceAnimation3D result={combo} isRolling={false} />
            <span className="text-xs text-muted-foreground">
              {combo[0]} + {combo[1]}
            </span>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Galerie complète de toutes les combinaisons possibles (36 au total).',
      },
    },
  },
};

/**
 * Comparaison avec mouvement réduit
 */
export const ReducedMotion: Story = {
  args: {
    result: [5, 6],
    isRolling: false,
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pour tester le mode `prefers-reduced-motion`, activer dans les paramètres du navigateur.',
      },
    },
  },
};
