export const CombatEventType = {
  COMBAT_START: 'combat_start',
  COMBAT_END: 'combat_end',
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  ATTACK_ROLL: 'attack_roll',
  DAMAGE_DEALT: 'damage_dealt',
  HEAL: 'heal',
  ABILITY_USED: 'ability_used',
  LUCK_TEST: 'luck_test',
  CHANCE_SPENT: 'chance_spent',
  FLEE: 'flee',
  WEAPON_ABILITY: 'weapon_ability',
  ITEM_USED: 'item_used',
} as const;

export type CombatEventType = (typeof CombatEventType)[keyof typeof CombatEventType];
