/**
 * Attacker - Identifie qui attaque dans un combat
 */
export const Attacker = {
  PLAYER: 'player',
  ENEMY: 'enemy',
} as const;

export type Attacker = (typeof Attacker)[keyof typeof Attacker];
