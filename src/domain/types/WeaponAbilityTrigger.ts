export const WeaponAbilityTrigger = {
  ON_DOUBLE: 'on_double',
  ON_KILL: 'on_kill',
  ON_MISS: 'on_miss',
  ON_SURPRISE: 'on_surprise',
  ON_ENEMY_HIT: 'on_enemy_hit',
  MANUAL: 'manual',
} as const;

export type WeaponAbilityTrigger = (typeof WeaponAbilityTrigger)[keyof typeof WeaponAbilityTrigger];
