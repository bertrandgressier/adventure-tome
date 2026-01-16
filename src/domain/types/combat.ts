import type { Attacker } from './Attacker';

export interface Enemy {
  name: string;
  dexterite: number;
  endurance: number;
  enduranceMax: number;
  attackPoints: number; // Points de dommage de l'arme
}

export interface CombatRound {
  roundNumber: number;
  attacker: Attacker;
  
  // Lancer pour toucher
  hitDiceRoll: number;
  hitSuccess: boolean;
  
  // Si touché, calcul des dégâts
  damageDiceRoll?: number;
  weaponDamage?: number;
  totalDamage?: number;
  
  playerEnduranceAfter: number;
  enemyEnduranceAfter: number;
}

export interface CombatState {
  enemy: Enemy;
  rounds: CombatRound[];
  playerEndurance: number;
  enemyEndurance: number;
  status: 'setup' | 'ongoing' | 'victory' | 'defeat';
  nextAttacker: Attacker;
}

export type CombatMode = 'auto' | 'manual';
