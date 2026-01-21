/**
 * CombatPhase - Phases simplifiées du système de combat
 * 
 * Flow: waiting_attack_roll → waiting_damage_roll (si touché) → turn_complete → ROUND N+1
 */
export const CombatPhase = {
  WAITING_ATTACK_ROLL: 'waiting_attack_roll',
  WAITING_DAMAGE_ROLL: 'waiting_damage_roll',
  TURN_COMPLETE: 'turn_complete',
  ENDED: 'ended',
} as const;

export type CombatPhase = (typeof CombatPhase)[keyof typeof CombatPhase];

/**
 * CurrentTurn - Indique qui joue actuellement
 */
export type CurrentTurn = 'player' | 'enemy';
