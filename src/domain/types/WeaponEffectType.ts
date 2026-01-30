/**
 * WeaponEffectType - Types d'effets des armes légendaires
 */
export const WeaponEffectType = {
  EXTRA_ATTACK: 'extra_attack',
  HEAL_ON_KILL: 'heal_on_kill',
  CONVERT_MISS_TO_HIT: 'convert_miss_to_hit',
  BONUS_DAMAGE: 'bonus_damage',
  NEGATE_DAMAGE: 'negate_damage',
} as const;

export type WeaponEffectType = (typeof WeaponEffectType)[keyof typeof WeaponEffectType];
