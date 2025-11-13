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
 * Formule: 2d6 + HABILETÉ + Points d'attaque de l'arme
 */
export function calculateAttackStrength(
  diceRoll: number,
  habilete: number,
  weaponPoints: number
): number {
  return diceRoll + habilete + weaponPoints;
}

/**
 * Résout un assaut de combat
 */
export function resolveCombatRound(
  roundNumber: number,
  playerHabilete: number,
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
  const playerAS = calculateAttackStrength(playerRoll, playerHabilete, playerWeaponPoints);
  const enemyAS = calculateAttackStrength(enemyRoll, enemy.habilete, enemy.attackPoints);
  
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
    enemyWeaponPoints: enemy.attackPoints,
    winner,
    damageDealt,
    playerEnduranceAfter,
    enemyEnduranceAfter,
    luckUsed: false
  };
}

/**
 * Teste la chance du joueur
 * Retourne true si chanceux (2d6 <= CHANCE actuelle)
 */
export function testLuck(currentChance: number): { isLucky: boolean; diceRoll: number } {
  const roll = rollTwoDice();
  return {
    isLucky: roll <= currentChance,
    diceRoll: roll
  };
}

/**
 * Applique l'effet de la chance sur les dégâts
 */
export function applyLuckToDamage(
  baseDamage: number,
  isLucky: boolean,
  damageType: 'dealt' | 'taken'
): number {
  if (damageType === 'dealt') {
    // Vous avez blessé l'adversaire
    return isLucky ? baseDamage + 1 : baseDamage - 1; // 3 ou 1
  } else {
    // Vous avez été blessé
    return isLucky ? baseDamage - 1 : baseDamage + 1; // 1 ou 3
  }
}

/**
 * Applique les résultats de la chance à un round de combat
 */
export function applyCombatLuck(
  round: CombatRound,
  isLucky: boolean,
  playerEndurance: number,
  enemyEndurance: number
): CombatRound {
  const damageType = round.winner === 'player' ? 'dealt' : 'taken';
  const adjustedDamage = applyLuckToDamage(round.damageDealt, isLucky, damageType);
  
  let playerEnduranceAfter = playerEndurance;
  let enemyEnduranceAfter = enemyEndurance;
  
  if (round.winner === 'player') {
    // Dégâts infligés à l'ennemi modifiés
    enemyEnduranceAfter = Math.max(0, enemyEndurance - adjustedDamage);
  } else if (round.winner === 'enemy') {
    // Dégâts subis par le joueur modifiés
    playerEnduranceAfter = Math.max(0, playerEndurance - adjustedDamage);
  }
  
  return {
    ...round,
    luckUsed: true,
    luckResult: isLucky ? 'lucky' : 'unlucky',
    adjustedDamage,
    playerEnduranceAfter,
    enemyEnduranceAfter
  };
}
