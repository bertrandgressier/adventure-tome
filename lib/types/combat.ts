export interface Enemy {
  name: string;
  habilete: number;
  endurance: number;
  enduranceMax: number;
  attackPoints: number; // Points d'attaque de l'arme de l'ennemi
}

export interface CombatRound {
  roundNumber: number;
  playerDiceRoll: number;
  playerAttackStrength: number;
  playerWeaponPoints: number;
  enemyDiceRoll: number;
  enemyAttackStrength: number;
  enemyWeaponPoints: number;
  winner: 'player' | 'enemy' | 'draw';
  damageDealt: number;
  playerEnduranceAfter: number;
  enemyEnduranceAfter: number;
  luckUsed: boolean;
  luckResult?: 'lucky' | 'unlucky';
  adjustedDamage?: number;
}

export interface CombatState {
  enemy: Enemy;
  rounds: CombatRound[];
  playerEndurance: number;
  enemyEndurance: number;
  status: 'setup' | 'ongoing' | 'victory' | 'defeat';
  canFlee: boolean;
}

export type CombatMode = 'auto' | 'manual';
