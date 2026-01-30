import type { Meta, StoryObj } from '@storybook/nextjs';
import { CombatantCard } from './CombatantCard';
import type { PlayerState, EnemyState } from '@/src/domain/types/combatants';

const meta = {
  title: 'Combat V2/CombatantCard',
  component: CombatantCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      options: ['player', 'enemy'],
    },
    isActive: { control: 'boolean' },
    lastDamage: { control: 'number' },
  },
} satisfies Meta<typeof CombatantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper pour créer un joueur valide
const createPlayer = (overrides: Partial<PlayerState>): PlayerState => ({
  name: 'Héros',
  dexterite: 12,
  endurance: 20,
  enduranceMax: 20,
  chance: 8,
  weapon: { id: 'none', name: 'Aucune', bonus: 0 },
  weaponDamage: 0,
  passiveDamageBonus: 0,
  totalDamageBonus: 0,
  ...overrides,
});

// Helper pour créer un ennemi valide
const createEnemy = (overrides: Partial<EnemyState>): EnemyState => ({
  name: 'Gobelin',
  dexterite: 5,
  endurance: 6,
  enduranceMax: 6,
  weaponDamage: 0,
  passiveDamageBonus: 0,
  totalDamageBonus: 0,
  ...overrides,
});

/**
 * Carte joueur - Endurance normale
 */
export const PlayerHealthy: Story = {
  args: {
    combatant: createPlayer({}),
    type: 'player',
    isActive: false,
  },
};

/**
 * Carte joueur - Endurance moyenne
 */
export const PlayerModerate: Story = {
  args: {
    combatant: createPlayer({ endurance: 12 }),
    type: 'player',
    isActive: false,
  },
};

/**
 * Carte joueur - État critique (< 25%)
 */
export const PlayerCritical: Story = {
  args: {
    combatant: createPlayer({ endurance: 4 }),
    type: 'player',
    isActive: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur est en état critique avec moins de 25% de ses PV.',
      },
    },
  },
};

/**
 * Carte joueur - Actif
 */
export const PlayerActive: Story = {
  args: {
    combatant: createPlayer({ endurance: 15 }),
    type: 'player',
    isActive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Le joueur est actif, bordure mise en évidence.',
      },
    },
  },
};

/**
 * Carte joueur - Vient de subir des dégâts
 */
export const PlayerDamaged: Story = {
  args: {
    combatant: createPlayer({ endurance: 12 }),
    type: 'player',
    isActive: false,
    lastDamage: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Animation de dégâts affichée.',
      },
    },
  },
};

/**
 * Carte ennemi - Gobelin
 */
export const EnemyGoblin: Story = {
  args: {
    combatant: createEnemy({}),
    type: 'enemy',
    isActive: false,
  },
};

/**
 * Carte ennemi - Boss puissant
 */
export const EnemyBoss: Story = {
  args: {
    combatant: createEnemy({
      name: 'Seigneur des Ténèbres',
      dexterite: 15,
      endurance: 30,
      enduranceMax: 30,
    }),
    type: 'enemy',
    isActive: false,
  },
};

/**
 * Carte ennemi - État critique
 */
export const EnemyCritical: Story = {
  args: {
    combatant: createEnemy({
      name: 'Orc Blessé',
      dexterite: 8,
      endurance: 2,
      enduranceMax: 12,
    }),
    type: 'enemy',
    isActive: false,
  },
};

/**
 * Carte ennemi - Actif (son tour)
 */
export const EnemyActive: Story = {
  args: {
    combatant: createEnemy({
      name: 'Troll',
      dexterite: 7,
      endurance: 10,
      enduranceMax: 10,
    }),
    type: 'enemy',
    isActive: true,
  },
};

/**
 * Carte ennemi - Vaincu
 */
export const EnemyDefeated: Story = {
  args: {
    combatant: createEnemy({
      name: 'Squelette',
      dexterite: 6,
      endurance: 0,
      enduranceMax: 8,
    }),
    type: 'enemy',
    isActive: false,
  },
};
