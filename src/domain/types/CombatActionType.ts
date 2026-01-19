export const CombatActionType = {
  ATTACK: 'attack',
  USE_ITEM: 'use_item',
  WEAPON_ABILITY: 'weapon_ability',
  REROLL: 'reroll',
  BLOCK: 'block',
  SKIP: 'skip',
} as const;

export type CombatActionType = (typeof CombatActionType)[keyof typeof CombatActionType];
