export const CombatActionType = {
  ATTACK: 'attack',
  USE_ITEM: 'use_item',
  SPEND_CHANCE: 'spend_chance',
  WEAPON_ABILITY: 'weapon_ability',
  FLEE: 'flee',
  REROLL: 'reroll',
  BLOCK: 'block',
  SKIP: 'skip',
} as const;

export type CombatActionType = (typeof CombatActionType)[keyof typeof CombatActionType];
