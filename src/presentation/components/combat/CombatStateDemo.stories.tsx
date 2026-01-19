import type { Meta, StoryObj } from '@storybook/react';
import { CombatStateDemo } from './CombatStateDemo';
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
  createMultipleEnemiesCombatState,
  createBossCombatState,
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
        // Injecter l'état de combat via Object.assign (acceptable pour Storybook)
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
  title: 'Combat V2/État Combat Complet',
  component: CombatStateDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Interface de Combat Complète par État

Affichage direct de l'interface de combat dans différents états.
**Pas de bouton** : l'état est pré-chargé et visible immédiatement.

## Ce que vous voyez
- Cartes des combattants (joueur + ennemi)
- Panneau d'actions
- Animation des dés (si en cours)
- Historique des événements
- Écrans de victoire/défaite

## Usage
Cliquez sur une story pour voir l'interface complète dans cet état.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    characterId: { control: 'text' },
    onExit: { action: 'onExit' },
  },
} satisfies Meta<typeof CombatStateDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Combat Simple - Gobelin - Tour du joueur
 */
export const SimpleGoblinPlayerTurn: Story = {
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
        story: '**Combat 1v1 contre un Gobelin** - C\'est au tour du joueur. Toutes les actions sont disponibles.',
      },
    },
  },
};

/**
 * Combat Simple - Tour de l'ennemi
 */
export const SimpleGoblinEnemyTurn: Story = {
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
        story: '**Tour de l\'ennemi** - Le Gobelin attaque. Les actions du joueur sont désactivées.',
      },
    },
  },
};

/**
 * Combat Simple - Animation des dés
 */
export const SimpleGoblinRolling: Story = {
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
        story: '**Animation en cours** - Les dés sont lancés. L\'interface est figée pendant l\'animation.',
      },
    },
  },
};

/**
 * Combat en Cours - Round 2 avec historique
 */
export const MidCombatWithHistory: Story = {
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
        story: '**Milieu de combat** - Round 2, les deux combattants ont subi des dégâts. L\'historique montre les événements précédents.',
      },
    },
  },
};

/**
 * Combat Multiple - 3 Ennemis - Tour du joueur
 */
export const MultipleEnemiesPlayerTurn: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() => createMultipleEnemiesCombatState({ phase: 'player_turn' })),
  ],
  parameters: {
    docs: {
      description: {
        story: '**Combat contre 3 ennemis** - Orc, Gobelin et Loup. Le joueur doit les vaincre un par un.',
      },
    },
  },
};

/**
 * Boss Fight - Dragon - Tour du joueur
 */
export const BossFightPlayerTurn: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() => createBossCombatState({ phase: 'player_turn' })),
  ],
  parameters: {
    docs: {
      description: {
        story: '**Combat de boss contre un Dragon** - Stats élevées, fuite interdite, mort en cas de défaite.',
      },
    },
  },
};

/**
 * Boss Fight - Dragon - Tour de l'ennemi
 */
export const BossFightEnemyTurn: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() =>
      createBossCombatState({ phase: 'enemy_turn', currentAttacker: 'enemy' })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '**Dragon attaque** - Le boss lance son attaque. Interface figée côté joueur.',
      },
    },
  },
};

/**
 * État Critique - Joueur à 3 PV
 */
export const CriticalHealthPlayerTurn: Story = {
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
        story: '**Santé critique** - Le joueur n\'a plus que 3 PV sur 20. Affichage visuel d\'alerte (rouge).',
      },
    },
  },
};

/**
 * Victoire - Tous les ennemis vaincus
 */
export const VictoryScreen: Story = {
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
        story: '**Victoire !** - Tous les ennemis sont vaincus. Écran de victoire avec historique complet.',
      },
    },
  },
};

/**
 * Défaite - Le joueur est vaincu
 */
export const DefeatScreen: Story = {
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
        story: '**Défaite...** - Le joueur a été vaincu. Écran de défaite avec historique complet.',
      },
    },
  },
};

/**
 * Combat Restreint - Pas de fuite ni objets
 */
export const RestrictedCombatPlayerTurn: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() =>
      createSimpleCombatState({
        phase: 'player_turn',
        config: {
          allowFlee: false,
          allowItems: false,
          deathOnDefeat: true,
        },
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '**Combat mortel** - Fuite et objets interdits. Seule l\'attaque est disponible. Mort en cas de défaite.',
      },
    },
  },
};

/**
 * Combat Multiple - Ennemi actif #2
 */
export const MultipleEnemiesSecondEnemy: Story = {
  args: {
    characterId: 'test-character',
    onExit: fn(),
  },
  decorators: [
    withCombatState(() =>
      createMultipleEnemiesCombatState({
        phase: 'player_turn',
        activeEnemyIndex: 1, // Gobelin
        enemies: [
          {
            id: 'enemy-1',
            name: 'Orc',
            currentEndurance: 0, // Vaincu
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
      })
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '**Combat multiple - 2e ennemi** - L\'Orc est vaincu, maintenant c\'est au tour du Gobelin.',
      },
    },
  },
};
