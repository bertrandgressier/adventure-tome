import type { Meta, StoryObj } from '@storybook/nextjs';
import { DiceResultCard } from './DiceResultCard';
import type { DiceRollResult } from './DiceAnimation';
import { fn } from 'storybook/test';
import { useState } from 'react';

const meta = {
  title: 'Combat V3/DiceResultCard',
  component: DiceResultCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    diceResult: {
      control: 'object',
      description: 'Le résultat complet du lancer avec modifiers',
    },
    isRolling: {
      control: 'boolean',
      description: 'État de lancer en cours',
    },
    outcome: {
      control: 'select',
      options: ['win', 'lose', 'tie', undefined],
      description: 'Type de résultat (victoire, défaite, égalité)',
    },
    onAnimationComplete: {
      action: 'onAnimationComplete',
      description: 'Callback appelé à la fin de l\'animation',
    },
  },
} satisfies Meta<typeof DiceResultCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const createDiceResult = (
  dice: [number, number],
  habilete: number,
  weaponBonus: number,
  success?: boolean
): DiceRollResult => {
  const total = dice[0] + dice[1];
  const finalScore = total + habilete + weaponBonus;
  return {
    dice,
    total,
    modifiers: { habilete, weaponBonus },
    finalScore,
    isDouble: dice[0] === dice[1],
    success,
  };
};

/**
 * État repos - Carte prête
 */
export const Idle: Story = {
  args: {
    diceResult: null,
    isRolling: false,
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'État initial - rien n\'est affiché.',
      },
    },
  },
};

/**
 * Animation de lancer en cours
 */
export const Rolling: Story = {
  args: {
    diceResult: createDiceResult([3, 4], 12, 2, true),
    isRolling: true,
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Animation 3D en cours - seuls les dés sont visibles, pas de score.',
      },
    },
  },
};

/**
 * Résultat avec succès (win)
 */
export const SuccessResult: Story = {
  args: {
    diceResult: createDiceResult([5, 6], 12, 2, true),
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Résultat gagnant avec bordure verte et message "TOUCHÉ !".',
      },
    },
  },
};

/**
 * Résultat avec échec (lose)
 */
export const FailureResult: Story = {
  args: {
    diceResult: createDiceResult([1, 2], 8, 1, false),
    isRolling: false,
    outcome: 'lose',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Résultat perdant avec bordure rouge et message "RATÉ !".',
      },
    },
  },
};

/**
 * Résultat égalité (tie)
 */
export const TieResult: Story = {
  args: {
    diceResult: createDiceResult([3, 4], 10, 0),
    isRolling: false,
    outcome: 'tie',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Résultat d\'égalité avec bordure accent.',
      },
    },
  },
};

/**
 * Double dés (Snake Eyes)
 */
export const DoubleOnes: Story = {
  args: {
    diceResult: createDiceResult([1, 1], 12, 2, false),
    isRolling: false,
    outcome: 'lose',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Double 1 avec badge "DOUBLE !" affiché.',
      },
    },
  },
};

/**
 * Double dés (Boxcars)
 */
export const DoubleSixes: Story = {
  args: {
    diceResult: createDiceResult([6, 6], 12, 2, true),
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Double 6 avec badge "DOUBLE !" - le meilleur résultat.',
      },
    },
  },
};

/**
 * Résultat élevé avec bonus élevé
 */
export const HighScoreResult: Story = {
  args: {
    diceResult: createDiceResult([5, 6], 15, 4, true),
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Score final élevé (30) avec bons modificateurs (HAB 15 + arme +4).',
      },
    },
  },
};

/**
 * Résultat faible avec faibles bonus
 */
export const LowScoreResult: Story = {
  args: {
    diceResult: createDiceResult([2, 1], 6, 0, false),
    isRolling: false,
    outcome: 'lose',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Score final faible (9) avec modificateurs faibles.',
      },
    },
  },
};

/**
 * Sans outcome défini
 */
export const NoOutcome: Story = {
  args: {
    diceResult: createDiceResult([4, 3], 10, 1),
    isRolling: false,
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Résultat affiché sans outcome - pas de message ni de bordure colorée.',
      },
    },
  },
};

/**
 * Animation complète interactive
 */
const InteractiveComponent = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<DiceRollResult | null>(null);
  const [outcome, setOutcome] = useState<'win' | 'lose' | undefined>(undefined);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);
    setOutcome(undefined);

    setTimeout(() => {
      const dice: [number, number] = [
        Math.floor(Math.random() * 6) + 1 as 1 | 2 | 3 | 4 | 5 | 6,
        Math.floor(Math.random() * 6) + 1 as 1 | 2 | 3 | 4 | 5 | 6,
      ];
      const habilete = 12;
      const weaponBonus = 2;
      const newResult = createDiceResult(dice, habilete, weaponBonus);
      
      // Déterminer success/outcome basé sur score
      const success = newResult.finalScore >= 18;
      newResult.success = success;
      
      setResult(newResult);
      setOutcome(success ? 'win' : 'lose');
      setIsRolling(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6 min-h-[500px]">
      <DiceResultCard
        diceResult={result}
        isRolling={isRolling}
        outcome={outcome}
        onAnimationComplete={() => console.log('Animation terminée!')}
      />
      <button
        onClick={rollDice}
        disabled={isRolling}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
      >
        {isRolling ? 'Lancer en cours...' : 'Lancer les dés'}
      </button>
      {result && (
        <div className="text-sm text-muted-foreground text-center">
          <div>Dés: [{result.dice[0]}, {result.dice[1]}] = {result.total}</div>
          <div>HAB: +{result.modifiers.habilete} | Arme: +{result.modifiers.weaponBonus}</div>
          <div className="font-bold text-primary">Score final: {result.finalScore}</div>
        </div>
      )}
    </div>
  );
};

export const InteractiveRoll: Story = {
  args: {
    diceResult: createDiceResult([3, 4], 12, 2, true),
    isRolling: false,
  },
  render: () => <InteractiveComponent />,
  parameters: {
    docs: {
      description: {
        story: 'Démonstration interactive du cycle complet : rolling → result avec score et outcome.',
      },
    },
  },
};

/**
 * Comparaison avec mouvement réduit
 */
export const ReducedMotion: Story = {
  args: {
    diceResult: createDiceResult([5, 6], 12, 2, true),
    isRolling: false,
    outcome: 'win',
    onAnimationComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pour tester le mode `prefers-reduced-motion`, activer dans les paramètres du navigateur.',
      },
    },
  },
};
