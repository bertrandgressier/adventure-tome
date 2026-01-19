import type { Meta, StoryObj } from '@storybook/react';
import { CombatLog } from './CombatLog';
import { CombatEventType } from '@/src/domain/types/CombatEventType';
import type { CombatEvent } from '@/src/domain/types/combat-v2';

const meta = {
  title: 'Combat V2/CombatLog',
  component: CombatLog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Historique des événements de combat avec affichage par rounds et auto-scroll.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    events: { control: 'object' },
  },
} satisfies Meta<typeof CombatLog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Historique vide - Début de combat
 */
export const Empty: Story = {
  args: {
    events: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'État initial du combat sans aucun événement.',
      },
    },
  },
};

/**
 * Combat simple - Quelques événements
 */
export const SimpleEvents: Story = {
  args: {
    events: [
      {
        type: CombatEventType.COMBAT_START,
        round: 1,
        description: 'Le combat commence !',
      },
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 1,
        attacker: 'Héros',
        target: 'Gobelin',
        roll: { dice1: 4, dice2: 3, total: 7, modifiedTotal: 19 },
        success: true,
        description: 'Héros attaque Gobelin et réussit (19 vs 12)',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Gobelin',
        amount: 2,
        description: 'Gobelin perd 2 points d\'endurance',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 1,
        attacker: 'Gobelin',
        target: 'Héros',
        roll: { dice1: 2, dice2: 1, total: 3, modifiedTotal: 8 },
        success: false,
        description: 'Gobelin attaque Héros et échoue (8 vs 19)',
      },
    ] as CombatEvent[],
  },
  parameters: {
    docs: {
      description: {
        story: 'Historique avec quelques événements de combat basiques.',
      },
    },
  },
};

/**
 * Combat complet - Multiple rounds
 */
export const MultipleRounds: Story = {
  args: {
    events: [
      {
        type: CombatEventType.COMBAT_START,
        round: 1,
        description: 'Le combat commence !',
      },
      // Round 1
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 1,
        attacker: 'Héros',
        target: 'Orc',
        roll: { dice1: 5, dice2: 4, total: 9, modifiedTotal: 21 },
        success: true,
        description: 'Héros attaque Orc et réussit (21 vs 15)',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Orc',
        amount: 2,
        description: 'Orc perd 2 points d\'endurance',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 1,
        attacker: 'Orc',
        target: 'Héros',
        roll: { dice1: 6, dice6: 5, total: 11, modifiedTotal: 18 },
        success: true,
        description: 'Orc attaque Héros et réussit (18 vs 16)',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Héros',
        amount: 2,
        description: 'Héros perd 2 points d\'endurance',
      },
      // Round 2
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 2,
        attacker: 'Héros',
        target: 'Orc',
        roll: { dice1: 3, dice2: 3, total: 6, modifiedTotal: 18, isDouble: true },
        success: true,
        description: 'Héros attaque Orc et réussit (18 vs 14) - Double 3 !',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 2,
        target: 'Orc',
        amount: 2,
        description: 'Orc perd 2 points d\'endurance',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 2,
        attacker: 'Orc',
        target: 'Héros',
        roll: { dice1: 1, dice2: 2, total: 3, modifiedTotal: 10 },
        success: false,
        description: 'Orc attaque Héros et échoue (10 vs 19)',
      },
      // Round 3
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 3,
        attacker: 'Héros',
        target: 'Orc',
        roll: { dice1: 6, dice2: 6, total: 12, modifiedTotal: 24, isDouble: true },
        success: true,
        description: 'Héros attaque Orc et réussit (24 vs 12) - Double 6 !',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 3,
        target: 'Orc',
        amount: 2,
        description: 'Orc perd 2 points d\'endurance',
      },
      {
        type: CombatEventType.ENEMY_DEFEATED,
        round: 3,
        target: 'Orc',
        description: 'Orc est vaincu !',
      },
      {
        type: CombatEventType.VICTORY,
        round: 3,
        description: 'Victoire ! Tous les ennemis sont vaincus.',
      },
    ] as CombatEvent[],
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat complet avec 3 rounds et victoire du joueur.',
      },
    },
  },
};

/**
 * Utilisation d'objets
 */
export const WithItems: Story = {
  args: {
    events: [
      {
        type: CombatEventType.COMBAT_START,
        round: 1,
        description: 'Le combat commence !',
      },
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 1,
        attacker: 'Héros',
        target: 'Troll',
        roll: { dice1: 2, dice2: 3, total: 5, modifiedTotal: 17 },
        success: false,
        description: 'Héros attaque Troll et échoue (17 vs 20)',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 1,
        attacker: 'Troll',
        target: 'Héros',
        roll: { dice1: 5, dice2: 6, total: 11, modifiedTotal: 19 },
        success: true,
        description: 'Troll attaque Héros et réussit (19 vs 18)',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Héros',
        amount: 3,
        description: 'Héros perd 3 points d\'endurance',
      },
      {
        type: CombatEventType.ITEM_USE,
        round: 2,
        actor: 'Héros',
        item: 'Potion de guérison',
        description: 'Héros utilise Potion de guérison',
      },
      {
        type: CombatEventType.HEAL,
        round: 2,
        target: 'Héros',
        amount: 5,
        description: 'Héros récupère 5 points d\'endurance',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 2,
        attacker: 'Troll',
        target: 'Héros',
        roll: { dice1: 3, dice2: 2, total: 5, modifiedTotal: 13 },
        success: false,
        description: 'Troll attaque Héros et échoue (13 vs 21)',
      },
    ] as CombatEvent[],
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat avec utilisation d\'objets (potion de guérison).',
      },
    },
  },
};

/**
 * Défaite du joueur
 */
export const Defeat: Story = {
  args: {
    events: [
      {
        type: CombatEventType.COMBAT_START,
        round: 1,
        description: 'Le combat commence !',
      },
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 1,
        attacker: 'Héros',
        target: 'Dragon',
        roll: { dice1: 1, dice2: 2, total: 3, modifiedTotal: 15 },
        success: false,
        description: 'Héros attaque Dragon et échoue (15 vs 28)',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 1,
        attacker: 'Dragon',
        target: 'Héros',
        roll: { dice1: 6, dice2: 5, total: 11, modifiedTotal: 27 },
        success: true,
        description: 'Dragon attaque Héros et réussit (27 vs 19)',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Héros',
        amount: 4,
        description: 'Héros perd 4 points d\'endurance',
      },
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 2,
        attacker: 'Héros',
        target: 'Dragon',
        roll: { dice1: 2, dice2: 1, total: 3, modifiedTotal: 15 },
        success: false,
        description: 'Héros attaque Dragon et échoue (15 vs 26)',
      },
      {
        type: CombatEventType.ENEMY_ATTACK,
        round: 2,
        attacker: 'Dragon',
        target: 'Héros',
        roll: { dice1: 5, dice2: 6, total: 11, modifiedTotal: 27 },
        success: true,
        description: 'Dragon attaque Héros et réussit (27 vs 18)',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 2,
        target: 'Héros',
        amount: 4,
        description: 'Héros perd 4 points d\'endurance',
      },
      {
        type: CombatEventType.PLAYER_DEFEATED,
        round: 2,
        description: 'Héros est vaincu !',
      },
      {
        type: CombatEventType.DEFEAT,
        round: 2,
        description: 'Défaite... Le combat est perdu.',
      },
    ] as CombatEvent[],
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat perdu avec défaite du joueur.',
      },
    },
  },
};

/**
 * Événements variés - Doubles, capacités spéciales
 */
export const VariedEvents: Story = {
  args: {
    events: [
      {
        type: CombatEventType.COMBAT_START,
        round: 1,
        description: 'Le combat commence !',
      },
      {
        type: CombatEventType.PLAYER_ATTACK,
        round: 1,
        attacker: 'Héros',
        target: 'Squelette',
        roll: { dice1: 4, dice2: 4, total: 8, modifiedTotal: 20, isDouble: true },
        success: true,
        description: 'Héros attaque Squelette et réussit (20 vs 10) - Double 4 !',
      },
      {
        type: CombatEventType.DOUBLE_ROLL,
        round: 1,
        actor: 'Héros',
        value: 4,
        description: 'Double 4 ! Effet spécial activé',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Squelette',
        amount: 2,
        description: 'Squelette perd 2 points d\'endurance',
      },
      {
        type: CombatEventType.WEAPON_ABILITY,
        round: 1,
        actor: 'Héros',
        ability: 'Lame de feu',
        description: 'Lame de feu activée ! Dégâts supplémentaires',
      },
      {
        type: CombatEventType.DAMAGE,
        round: 1,
        target: 'Squelette',
        amount: 1,
        description: 'Squelette perd 1 point d\'endurance (brûlure)',
      },
    ] as CombatEvent[],
  },
  parameters: {
    docs: {
      description: {
        story: 'Combat avec doubles, capacités d\'armes et événements spéciaux.',
      },
    },
  },
};
