import type { Meta, StoryObj } from '@storybook/react';
import { CombatDemo } from './CombatDemo';
import { fn } from '@storybook/test';
import type { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import { Character, Progress } from '@/src/domain/entities/Character';
import { Stats } from '@/src/domain/value-objects/Stats';
import { Inventory } from '@/src/domain/value-objects/Inventory';

/**
 * Decorator pour créer un personnage de test dans le store
 */
const withTestCharacter: Decorator = (Story, context) => {
  const SetupCharacter = () => {
    const store = useCharacterStore();

    useEffect(() => {
      // Créer un personnage de test si non existant
      const characterId = context.args.characterId || 'test-character';
      if (!store.characters[characterId]) {
        const testCharacter = new Character(
          characterId,
          'Héros de Test',
          'L1',
          'Magie',
          null,
          'narrative',
          10,
          new Date().toISOString(),
          new Date().toISOString(),
          new Stats({
            habilete: 12,
            endurance: 20,
            pointsDeVieMax: 20,
            chance: 10,
            chanceMax: 10,
          }),
          new Inventory({
            items: [
              {
                id: 'potion-guerison',
                name: 'Potion de guérison',
                type: 'potion',
                possessed: true,
                inCombat: true,
                effect: { type: 'heal', value: 5 },
              },
            ],
            equippedWeapon: {
              id: 'épée',
              name: 'Épée',
              bonus: 0,
              possessed: true,
              type: 'weapon',
            },
            gold: 10,
          }),
          new Progress({
            currentParagraph: 1,
            visitedParagraphs: [1],
            decisions: [],
          }),
          ''
        );

        // Injecter directement dans le store via Object.assign (acceptable pour Storybook)
        Object.assign(store, {
          characters: { ...store.characters, [characterId]: testCharacter },
        });
      }
    }, [store]);

    return <Story />;
  };

  SetupCharacter.displayName = 'SetupCharacter';

  return <SetupCharacter />;
};

const meta = {
  title: 'Combat V2/CombatDemo',
  component: CombatDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Composant de démo haut niveau pour tester le système de combat complet.

## Fonctionnalités
- Configuration facile des ennemis
- Options de combat (fuite, objets, mort)
- Bouton de démarrage du combat
- Interface complète du combat (CombatArena)

## Utilisation
Idéal pour tester différentes configurations de combat sans avoir à créer manuellement l'état.
        `,
      },
    },
  },
  decorators: [withTestCharacter],
  tags: ['autodocs'],
  argTypes: {
    characterId: { control: 'text' },
    onComplete: { action: 'onComplete' },
  },
} satisfies Meta<typeof CombatDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Combat simple - 1 vs 1 Gobelin
 */
export const SimpleGoblin: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    enemies: [
      {
        name: 'Gobelin',
        endurance: 6,
        dexterite: 5,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat basique contre un Gobelin. Toutes les options disponibles (fuite, objets).',
      },
    },
  },
};

/**
 * Combat multiple - 3 ennemis
 */
export const MultipleEnemies: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    enemies: [
      {
        name: 'Orc',
        endurance: 8,
        dexterite: 7,
      },
      {
        name: 'Gobelin',
        endurance: 5,
        dexterite: 5,
      },
      {
        name: 'Loup',
        endurance: 6,
        dexterite: 6,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat contre 3 ennemis : Orc, Gobelin et Loup. Test des combats multiples.',
      },
    },
  },
};

/**
 * Combat Boss - Dragon
 */
export const BossFight: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: false,
      allowItems: true,
      deathOnDefeat: true,
    },
    enemies: [
      {
        name: 'Dragon',
        endurance: 20,
        dexterite: 16,
        weaponBonus: 2,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat de boss contre un Dragon. Fuite interdite, mort en cas de défaite.',
      },
    },
  },
};

/**
 * Combat difficile - Troll
 */
export const DifficultFight: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    enemies: [
      {
        name: 'Troll',
        endurance: 10,
        dexterite: 9,
        weaponBonus: 1,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat difficile contre un Troll avec une arme (+1 bonus).',
      },
    },
  },
};

/**
 * Combat sans options - Duel mortel
 */
export const RestrictedDuel: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: false,
      allowItems: false,
      deathOnDefeat: true,
    },
    enemies: [
      {
        name: 'Chevalier Noir',
        endurance: 12,
        dexterite: 11,
        weaponBonus: 1,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Duel mortel sans fuite ni objets. Combat jusqu\'à la mort.',
      },
    },
  },
};

/**
 * Combat facile - Rats
 */
export const EasyFight: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    enemies: [
      {
        name: 'Rat géant',
        endurance: 4,
        dexterite: 4,
      },
      {
        name: 'Rat géant',
        endurance: 4,
        dexterite: 4,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat facile contre 2 rats géants. Idéal pour tester la victoire rapide.',
      },
    },
  },
};

/**
 * Combat sans objets
 */
export const NoItems: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: true,
      allowItems: false,
      deathOnDefeat: false,
    },
    enemies: [
      {
        name: 'Squelette',
        endurance: 6,
        dexterite: 6,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat où les objets ne peuvent pas être utilisés. Seules les attaques et la fuite sont disponibles.',
      },
    },
  },
};

/**
 * Combat sans fuite
 */
export const NoFlee: Story = {
  args: {
    characterId: 'test-character',
    config: {
      allowFlee: false,
      allowItems: true,
      deathOnDefeat: false,
    },
    enemies: [
      {
        name: 'Zombie',
        endurance: 7,
        dexterite: 5,
      },
    ],
    onComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat où la fuite est interdite. Le joueur doit vaincre l\'ennemi.',
      },
    },
  },
};
