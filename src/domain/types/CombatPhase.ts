export const CombatPhase = {
  SETUP: 'setup',
  PLAYER_TURN: 'player_turn',
  PLAYER_ATTACK: 'player_attack',
  ENEMY_TURN: 'enemy_turn',
  ENEMY_ATTACK: 'enemy_attack',
  ROUND_END: 'round_end',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
} as const;

export type CombatPhase = (typeof CombatPhase)[keyof typeof CombatPhase];
