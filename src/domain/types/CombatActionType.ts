export const CombatActionType = {
  ATTACK: 'attack',
  USE_ITEM: 'use_item',
  USE_LUCK: 'use_luck',
  WEAPON_ABILITY: 'weapon_ability',
  FLEE: 'flee',
  REROLL: 'reroll',
  BLOCK: 'block',
  SKIP: 'skip',
} as const;

export type CombatActionType = (typeof CombatActionType)[keyof typeof CombatActionType];
