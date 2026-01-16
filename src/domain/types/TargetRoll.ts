/**
 * TargetRoll - Cible du modificateur de chance
 */
export const TargetRoll = {
  HIT: 'hit',
  DAMAGE: 'damage',
} as const;

export type TargetRoll = (typeof TargetRoll)[keyof typeof TargetRoll];
