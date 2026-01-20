/**
 * CombatPhaseV3 - Phases simplifiées du système de combat V3
 * 
 * Flow: waiting_attack_roll → waiting_damage_roll (si touché) → turn_complete → ROUND N+1
 */
export const CombatPhaseV3 = {
  WAITING_ATTACK_ROLL: 'waiting_attack_roll',
  WAITING_DAMAGE_ROLL: 'waiting_damage_roll',
  TURN_COMPLETE: 'turn_complete',
  ENDED: 'ended',
} as const;

export type CombatPhaseV3 = (typeof CombatPhaseV3)[keyof typeof CombatPhaseV3];

/**
 * CurrentTurn - Indique qui joue actuellement
 */
export type CurrentTurn = 'player' | 'enemy';
