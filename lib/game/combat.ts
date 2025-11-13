import type { CombatRound, Enemy } from '@/lib/types/combat';

/**
 * Lance 2 dés à 6 faces et retourne le total
 */
export function rollTwoDice(): number {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  return die1 + die2;
}

/**
 * Calcule la Force d'Attaque
 * Formule: 2d6 + DEXTÉRITÉ + Points d'attaque de l'arme
 */
export function calculateAttackStrength(
  diceRoll: number,
  dexterite: number,
  weaponPoints: number
): number {
  return diceRoll + dexterite + weaponPoints;
}

/**
 * Résout un assaut de combat
 */
export function resolveCombatRound(
  roundNumber: number,
  playerDexterite: number,
  playerEndurance: number,
  playerWeaponPoints: number,
  enemy: Enemy,
  playerDiceRoll?: number,
  enemyDiceRoll?: number
): CombatRound {
  // 1. Lancer les dés (ou utiliser les valeurs fournies en mode manuel)
  const playerRoll = playerDiceRoll ?? rollTwoDice();
  const enemyRoll = enemyDiceRoll ?? rollTwoDice();
  
  // 2. Calculer Forces d'Attaque
  const playerAS = calculateAttackStrength(playerRoll, playerDexterite, playerWeaponPoints);
  const enemyAS = calculateAttackStrength(enemyRoll, enemy.dexterite, 0); // Pas d'arme pour l'ennemi
  
  // 3. Déterminer le gagnant et les dégâts
  let winner: 'player' | 'enemy' | 'draw';
  let damageDealt = 0;
  let playerEnduranceAfter = playerEndurance;
  let enemyEnduranceAfter = enemy.endurance;
  
  if (playerAS > enemyAS) {
    winner = 'player';
    damageDealt = 2;
    enemyEnduranceAfter = Math.max(0, enemy.endurance - damageDealt);
  } else if (enemyAS > playerAS) {
    winner = 'enemy';
    damageDealt = 2;
    playerEnduranceAfter = Math.max(0, playerEndurance - damageDealt);
  } else {
    winner = 'draw';
    damageDealt = 0;
  }
  
  return {
    roundNumber,
    playerDiceRoll: playerRoll,
    playerAttackStrength: playerAS,
    playerWeaponPoints,
    enemyDiceRoll: enemyRoll,
    enemyAttackStrength: enemyAS,
    winner,
    damageDealt,
    playerEnduranceAfter,
    enemyEnduranceAfter
  };
}

