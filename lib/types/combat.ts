export interface Enemy {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
}

export interface CombatRound {
  roundNumber: number;
  playerDiceRoll: number;
  playerAttackStrength: number;
  playerWeaponPoints: number;
  enemyDiceRoll: number;
  enemyAttackStrength: number;
  winner: 'player' | 'enemy' | 'draw';
  damageDealt: number;
  playerEnduranceAfter: number;
  enemyEnduranceAfter: number;
}

export interface CombatState {
  enemy: Enemy;
  rounds: CombatRound[];
  playerEndurance: number;
  enemyEndurance: number;
  status: 'setup' | 'ongoing' | 'victory' | 'defeat';
}

export type CombatMode = 'auto' | 'manual';
