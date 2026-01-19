import type { CombatState, CombatEvent } from '@/src/domain/types/combat-v2';
import { CombatEventType } from '@/src/domain/types/CombatEventType';

/**
 * Fixtures pour les tests Storybook
 * Fournit des états de combat pré-configurés réalistes
 */

/**
 * Combat simple - 1 vs 1 Gobelin
 */
export function createSimpleCombatState(overrides?: Partial<CombatState>): CombatState {
  return {
    characterId: 'test-character',
    phase: 'player_turn',
    round: 1,
    activeEnemyIndex: 0,
    player: {
      name: 'Héros',
      currentEndurance: 20,
      maxEndurance: 20,
      dexterite: 12,
      weapon: {
        id: 'épée',
        name: 'Épée',
        bonus: 0,
      },
    },
    enemies: [
      {
        id: 'enemy-1',
        name: 'Gobelin',
        currentEndurance: 6,
        maxEndurance: 6,
        dexterite: 5,
      },
    ],
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    events: [],
    ...overrides,
  };
}

/**
 * Combat avec plusieurs ennemis
 */
export function createMultipleEnemiesCombatState(overrides?: Partial<CombatState>): CombatState {
  return {
    characterId: 'test-character',
    phase: 'player_turn',
    round: 1,
    activeEnemyIndex: 0,
    player: {
      name: 'Héros',
      currentEndurance: 20,
      maxEndurance: 20,
      dexterite: 12,
      weapon: {
        id: 'épée-longue',
        name: 'Épée longue',
        bonus: 1,
      },
    },
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
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    events: [],
    ...overrides,
  };
}

/**
 * Combat difficile - Boss
 */
export function createBossCombatState(overrides?: Partial<CombatState>): CombatState {
  return {
    characterId: 'test-character',
    phase: 'player_turn',
    round: 1,
    activeEnemyIndex: 0,
    player: {
      name: 'Héros',
      currentEndurance: 18,
      maxEndurance: 20,
      dexterite: 12,
      weapon: {
        id: 'épée-magique',
        name: 'Épée magique',
        bonus: 2,
      },
    },
    enemies: [
      {
        id: 'boss-1',
        name: 'Dragon',
        currentEndurance: 20,
        maxEndurance: 20,
        dexterite: 16,
        weapon: {
          id: 'griffes',
          name: 'Griffes acérées',
          bonus: 2,
        },
      },
    ],
    config: {
      allowFlee: false,
      allowItems: true,
      deathOnDefeat: true,
    },
    events: [],
    ...overrides,
  };
}

/**
 * Combat en cours - Milieu du combat avec historique
 */
export function createMidCombatState(overrides?: Partial<CombatState>): CombatState {
  const events: CombatEvent[] = [
    {
      type: CombatEventType.COMBAT_START,
      round: 1,
      description: 'Le combat commence !',
    },
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
      roll: { dice1: 6, dice2: 5, total: 11, modifiedTotal: 18 },
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
  ];

  return {
    characterId: 'test-character',
    phase: 'player_turn',
    round: 2,
    activeEnemyIndex: 0,
    player: {
      name: 'Héros',
      currentEndurance: 18,
      maxEndurance: 20,
      dexterite: 12,
      weapon: {
        id: 'épée',
        name: 'Épée',
        bonus: 0,
      },
    },
    enemies: [
      {
        id: 'enemy-1',
        name: 'Orc',
        currentEndurance: 6,
        maxEndurance: 8,
        dexterite: 7,
      },
    ],
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    events,
    lastRoll: {
      dice1: 6,
      dice2: 5,
      total: 11,
      modifiedTotal: 18,
      success: true,
    },
    ...overrides,
  };
}

/**
 * Combat - Tour de l'ennemi avec animation
 */
export function createEnemyTurnState(overrides?: Partial<CombatState>): CombatState {
  return {
    ...createSimpleCombatState(),
    phase: 'enemy_turn',
    currentAttacker: 'enemy',
    ...overrides,
  };
}

/**
 * Combat - Animation en cours
 */
export function createRollingState(overrides?: Partial<CombatState>): CombatState {
  return {
    ...createSimpleCombatState(),
    phase: 'rolling',
    currentAttacker: 'player',
    ...overrides,
  };
}

/**
 * Combat - Victoire
 */
export function createVictoryState(overrides?: Partial<CombatState>): CombatState {
  const events: CombatEvent[] = [
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
      roll: { dice1: 6, dice2: 5, total: 11, modifiedTotal: 23 },
      success: true,
      description: 'Héros attaque Gobelin et réussit (23 vs 10)',
    },
    {
      type: CombatEventType.DAMAGE,
      round: 1,
      target: 'Gobelin',
      amount: 2,
      description: 'Gobelin perd 2 points d\'endurance',
    },
    {
      type: CombatEventType.ENEMY_DEFEATED,
      round: 1,
      target: 'Gobelin',
      description: 'Gobelin est vaincu !',
    },
    {
      type: CombatEventType.VICTORY,
      round: 1,
      description: 'Victoire ! Tous les ennemis sont vaincus.',
    },
  ];

  return {
    characterId: 'test-character',
    phase: 'victory',
    round: 1,
    activeEnemyIndex: 0,
    player: {
      name: 'Héros',
      currentEndurance: 20,
      maxEndurance: 20,
      dexterite: 12,
      weapon: {
        id: 'épée',
        name: 'Épée',
        bonus: 0,
      },
    },
    enemies: [
      {
        id: 'enemy-1',
        name: 'Gobelin',
        currentEndurance: 0,
        maxEndurance: 6,
        dexterite: 5,
      },
    ],
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    events,
    ...overrides,
  };
}

/**
 * Combat - Défaite
 */
export function createDefeatState(overrides?: Partial<CombatState>): CombatState {
  const events: CombatEvent[] = [
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
      roll: { dice1: 6, dice2: 6, total: 12, modifiedTotal: 30 },
      success: true,
      description: 'Dragon attaque Héros et réussit (30 vs 19) - Double 6 !',
    },
    {
      type: CombatEventType.DAMAGE,
      round: 1,
      target: 'Héros',
      amount: 20,
      description: 'Héros perd 20 points d\'endurance',
    },
    {
      type: CombatEventType.PLAYER_DEFEATED,
      round: 1,
      description: 'Héros est vaincu !',
    },
    {
      type: CombatEventType.DEFEAT,
      round: 1,
      description: 'Défaite... Le combat est perdu.',
    },
  ];

  return {
    characterId: 'test-character',
    phase: 'defeat',
    round: 1,
    activeEnemyIndex: 0,
    player: {
      name: 'Héros',
      currentEndurance: 0,
      maxEndurance: 20,
      dexterite: 12,
      weapon: {
        id: 'épée',
        name: 'Épée',
        bonus: 0,
      },
    },
    enemies: [
      {
        id: 'boss-1',
        name: 'Dragon',
        currentEndurance: 20,
        maxEndurance: 20,
        dexterite: 16,
      },
    ],
    config: {
      allowFlee: false,
      allowItems: true,
      deathOnDefeat: true,
    },
    events,
    ...overrides,
  };
}

/**
 * Combat sans fuite ni objets
 */
export function createRestrictedCombatState(overrides?: Partial<CombatState>): CombatState {
  return {
    ...createSimpleCombatState(),
    config: {
      allowFlee: false,
      allowItems: false,
      deathOnDefeat: true,
    },
    ...overrides,
  };
}
