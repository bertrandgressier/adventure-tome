/**
 * Helpers de test réutilisables pour le CombatEngine V3
 * 
 * Fournit des fonctions pour :
 * - Créer des configurations de test standard
 * - Simuler des séquences de combat
 * - Vérifier les résultats de combat
 */

import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import { CombatValidator } from '@/src/domain/services/combat/CombatValidator';
import type { CombatState } from '@/src/domain/types/combat-state';
import type { PlayerConfig, EnemyConfig, CombatConfig, CombatWeapon } from '@/src/domain/types/combatants';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import type { DiceOverrides } from '@/src/domain/services/combat/DiceRoller';

/**
 * Configuration de test pour un personnage joueur
 */
export interface TestPlayerConfig {
  name?: string;
  dexterite?: number;
  endurance?: number;
  enduranceMax?: number;
  chance?: number;
  weapon?: CombatWeapon;
}

/**
 * Configuration de test pour un ennemi
 */
export interface TestEnemyConfig {
  name?: string;
  dexterite?: number;
  endurance?: number;
  enduranceMax?: number;
}

/**
 * Configuration de test pour le combat
 */
export interface TestCombatConfig extends Partial<CombatConfig> {
  firstAttacker?: 'player' | 'enemy';
  isSurprise?: boolean;
}

/**
 * Armes légendaires du Tome 3 pour les tests
 */
export const LEGENDARY_WEAPONS = {
  EXCALIBUR: {
    id: 'excalibur',
    name: 'Excalibur',
    bonus: 8,
  } as CombatWeapon,
  
  DURANDAL: {
    id: 'durandal',
    name: 'Durandal',
    bonus: 6,
  } as CombatWeapon,
  
  FRAGARACH: {
    id: 'fragarach',
    name: 'Fragarach',
    bonus: 7,
  } as CombatWeapon,
};

/**
 * Armes standard
 */
export const STANDARD_WEAPONS = {
  SWORD: {
    id: 'sword',
    name: 'Épée',
    bonus: 3,
  } as CombatWeapon,
  
  AXE: {
    id: 'axe',
    name: 'Hache',
    bonus: 4,
  } as CombatWeapon,
  
  DAGGER: {
    id: 'dagger',
    name: 'Dague',
    bonus: 1,
  } as CombatWeapon,
};

/**
 * Crée une configuration de joueur par défaut
 */
export function createDefaultPlayer(overrides?: TestPlayerConfig): PlayerConfig {
  return {
    name: overrides?.name ?? 'Héros',
    dexterite: overrides?.dexterite ?? 7,
    endurance: overrides?.endurance ?? 32,
    enduranceMax: overrides?.enduranceMax ?? 32,
    chance: overrides?.chance ?? 5,
    weapon: overrides?.weapon ?? STANDARD_WEAPONS.SWORD,
  };
}

/**
 * Crée une configuration d'ennemi par défaut
 */
export function createDefaultEnemy(overrides?: TestEnemyConfig): EnemyConfig {
  return {
    name: overrides?.name ?? 'Gobelin',
    dexterite: overrides?.dexterite ?? 6,
    endurance: overrides?.endurance ?? 15,
    enduranceMax: overrides?.enduranceMax ?? 15,
  };
}

/**
 * Crée une configuration de combat par défaut
 */
export function createDefaultCombatConfig(overrides?: TestCombatConfig): CombatConfig & { firstAttacker?: 'player' | 'enemy'; isSurprise?: boolean } {
  return {
    damageFormula: '1 + 1d6 + DOMMAGES ACTUELS',
    firstAttacker: overrides?.firstAttacker ?? 'player',
    isSurprise: overrides?.isSurprise ?? false,
    ...overrides,
  };
}

/**
 * Crée un état de combat initial pour les tests
 */
export function createTestCombat(
  playerOverrides?: TestPlayerConfig,
  enemyOverrides?: TestEnemyConfig,
  configOverrides?: TestCombatConfig
): CombatState {
  return CombatEngine.createInitialState(
    'test-char-123',
    createDefaultPlayer(playerOverrides),
    createDefaultEnemy(enemyOverrides),
    createDefaultCombatConfig(configOverrides)
  );
}

/**
 * Simule une attaque avec des dés contrôlés
 */
export function simulateAttack(
  state: CombatState,
  hitDice: [number, number],
  damageDice?: number
): CombatState {
  const diceOverrides: DiceOverrides = {
    hitDice,
    damageDice,
  };
  
  const result = CombatEngine.resolve(state, { type: CombatActionType.ATTACK }, diceOverrides);
  return result.state;
}

/**
 * Simule un round complet (joueur puis ennemi)
 */
export function simulateFullRound(
  state: CombatState,
  playerDice: { hit: [number, number]; damage?: number },
  enemyDice: { hit: [number, number]; damage?: number }
): CombatState {
  // Tour du joueur
  let newState = simulateAttack(state, playerDice.hit, playerDice.damage);
  
  // Vérifier si le combat est terminé
  let combatStatus = CombatValidator.checkCombatEnd(newState);
  if (combatStatus !== 'ongoing') {
    return newState;
  }
  
  // Avancer après l'attaque (WAITING_DAMAGE_ROLL → TURN_COMPLETE)
  if (newState.phase === CombatPhase.WAITING_DAMAGE_ROLL) {
    const skipResult = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
    newState = skipResult.state;
  }
  
  // Passer au tour ennemi si nécessaire
  if (newState.phase === CombatPhase.TURN_COMPLETE) {
    const skipResult = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
    newState = skipResult.state;
  }
  
  // Vérifier à nouveau si le combat est terminé
  combatStatus = CombatValidator.checkCombatEnd(newState);
  if (combatStatus !== 'ongoing') {
    return newState;
  }
  
  // Tour de l'ennemi
  newState = simulateAttack(newState, enemyDice.hit, enemyDice.damage);
  
  // Vérifier si le combat est terminé
  combatStatus = CombatValidator.checkCombatEnd(newState);
  if (combatStatus !== 'ongoing') {
    return newState;
  }
  
  // Avancer après l'attaque (WAITING_DAMAGE_ROLL → TURN_COMPLETE)
  if (newState.phase === CombatPhase.WAITING_DAMAGE_ROLL) {
    const skipResult = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
    newState = skipResult.state;
  }
  
  // Passer au round suivant si nécessaire
  if (newState.phase === CombatPhase.TURN_COMPLETE) {
    const skipResult = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
    newState = skipResult.state;
  }
  
  return newState;
}

/**
 * Simule une séquence d'attaques jusqu'à la fin du combat ou un nombre max de rounds
 */
export function simulateUntilEnd(
  state: CombatState,
  attacks: Array<{ player: { hit: [number, number]; damage?: number }; enemy: { hit: [number, number]; damage?: number } }>,
  maxRounds: number = 10
): CombatState {
  let currentState = state;
  let roundIndex = 0;
  
  while (roundIndex < attacks.length && roundIndex < maxRounds) {
    const roundAttacks = attacks[roundIndex];
    currentState = simulateFullRound(currentState, roundAttacks.player, roundAttacks.enemy);
    
    const combatStatus = CombatValidator.checkCombatEnd(currentState);
    if (combatStatus !== 'ongoing') {
      break;
    }
    
    roundIndex++;
  }
  
  return currentState;
}

/**
 * Assertions de combat
 */

export function assertVictory(state: CombatState): void {
  const status = CombatValidator.checkCombatEnd(state);
  if (status !== 'victory') {
    throw new Error(`Expected victory but got ${status}. Player HP: ${state.player.endurance}, Enemy HP: ${state.enemy.endurance}`);
  }
}

export function assertDefeat(state: CombatState): void {
  const status = CombatValidator.checkCombatEnd(state);
  if (status !== 'defeat') {
    throw new Error(`Expected defeat but got ${status}. Player HP: ${state.player.endurance}, Enemy HP: ${state.enemy.endurance}`);
  }
}

export function assertOngoing(state: CombatState): void {
  const status = CombatValidator.checkCombatEnd(state);
  if (status !== 'ongoing') {
    throw new Error(`Expected ongoing but got ${status}. Player HP: ${state.player.endurance}, Enemy HP: ${state.enemy.endurance}`);
  }
}

export function assertPlayerHP(state: CombatState, expected: number): void {
  if (state.player.endurance !== expected) {
    throw new Error(`Expected player HP to be ${expected} but got ${state.player.endurance}`);
  }
}

export function assertEnemyHP(state: CombatState, expected: number): void {
  if (state.enemy.endurance !== expected) {
    throw new Error(`Expected enemy HP to be ${expected} but got ${state.enemy.endurance}`);
  }
}

export function assertPhase(state: CombatState, expected: CombatPhase): void {
  if (state.phase !== expected) {
    throw new Error(`Expected phase to be ${expected} but got ${state.phase}`);
  }
}

export function assertRound(state: CombatState, expected: number): void {
  if (state.roundNumber !== expected) {
    throw new Error(`Expected round to be ${expected} but got ${state.roundNumber}`);
  }
}

export function assertCurrentTurn(state: CombatState, expected: 'player' | 'enemy'): void {
  if (state.currentTurn !== expected) {
    throw new Error(`Expected current turn to be ${expected} but got ${state.currentTurn}`);
  }
}

/**
 * Ennemis types pour les tests
 */
export const TEST_ENEMIES = {
  WEAK_GOBLIN: { name: 'Gobelin Faible', dexterite: 5, endurance: 8, enduranceMax: 8 },
  GOBLIN: { name: 'Gobelin', dexterite: 6, endurance: 15, enduranceMax: 15 },
  ORC: { name: 'Orc', dexterite: 7, endurance: 20, enduranceMax: 20 },
  TROLL: { name: 'Troll', dexterite: 8, endurance: 30, enduranceMax: 30 },
  BOSS_DRAGON: { name: 'Dragon', dexterite: 10, endurance: 50, enduranceMax: 50 },
};

/**
 * Joueurs types pour les tests
 */
export const TEST_PLAYERS = {
  NOVICE: { name: 'Novice', dexterite: 6, endurance: 20, enduranceMax: 20, chance: 3, weapon: STANDARD_WEAPONS.DAGGER },
  WARRIOR: { name: 'Guerrier', dexterite: 7, endurance: 32, enduranceMax: 32, chance: 5, weapon: STANDARD_WEAPONS.SWORD },
  VETERAN: { name: 'Vétéran', dexterite: 8, endurance: 40, enduranceMax: 40, chance: 7, weapon: STANDARD_WEAPONS.AXE },
  HERO: { name: 'Héros', dexterite: 9, endurance: 50, enduranceMax: 50, chance: 10, weapon: LEGENDARY_WEAPONS.EXCALIBUR },
};
