import type { Meta, StoryObj } from '@storybook/react';
import { CombatArena } from './CombatArena';
import { fn } from '@storybook/test';
import type { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import type { CombatState } from '@/src/domain/types/combat-v2';
import {
  createSimpleCombatState,
  createMidCombatState,
  createRollingState,
  createEnemyTurnState,
  createVictoryState,
  createDefeatState,
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
        Object.assign(store, { combat: combatState });
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
  title: 'Combat V2/CombatArena',
  component: CombatArena,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Arène de combat complète avec :
- Affichage des combattants (joueur et ennemi)
- Animation des dés
- Panneau d'actions
- Historique des événements
- Écrans de victoire/défaite
        `,
      },
    },
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
  parameters: {
    docs: {
      description: {
        story: 'Aucun combat actif. L\'arène ne s\'affiche pas (retourne null).',
      },
    },
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
  decorators: [
    withCombatState(() => createRollingState()),
  ],
  parameters: {
    docs: {
      description: {
        story: 'État pendant le lancer des dés, les actions sont désactivées. Animation visible.',
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
  decorators: [
    withCombatState(() => createSimpleCombatState({ phase: 'player_turn' })),
  ],
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
  decorators: [
    withCombatState(() => createEnemyTurnState()),
  ],
  parameters: {
    docs: {
      description: {
        story: 'L\'ennemi attaque automatiquement, pas d\'interaction joueur.',
      },
    },
  },
};

/**
 * Combat en cours - Milieu de combat
 */
export const MidCombat: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() => createMidCombatState()),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Combat en cours avec historique d\'événements. Round 2, les deux combattants ont subi des dégâts.',
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
  decorators: [
    withCombatState(() => createVictoryState()),
  ],
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
  decorators: [
    withCombatState(() => createDefeatState()),
  ],
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
  decorators: [
    withCombatState(() => createSimpleCombatState({ phase: 'fled' })),
  ],
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
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        player: {
          name: 'Héros',
          currentEndurance: 3,
          maxEndurance: 20,
          dexterite: 12,
          weapon: {
            id: 'épée',
            name: 'Épée',
            bonus: 0,
          },
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Le joueur a moins de 25% de ses points de vie, affichage en rouge avec alerte visuelle.',
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
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        enemies: [
          {
            id: 'enemy-1',
            name: 'Orc',
            currentEndurance: 8,
            maxEndurance: 8,
            dexterite: 7,
          },
          {
            id: 'enemy-2',
            name: 'Gobelin',
            currentEndurance: 5,
            maxEndurance: 5,
            dexterite: 5,
          },
          {
            id: 'enemy-3',
            name: 'Loup',
            currentEndurance: 6,
            maxEndurance: 6,
            dexterite: 6,
          },
        ],
        activeEnemyIndex: 0,
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Combat contre plusieurs ennemis. Le joueur doit vaincre tous les ennemis un par un.',
      },
    },
  },
};
