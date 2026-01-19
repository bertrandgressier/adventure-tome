/**
 * Combat system constants and messages
 */

export const COMBAT_MESSAGES = {
  WEAPON_ABILITY: {
    WEAPON_REQUIRED: 'Arme requise non équipée',
    INSUFFICIENT_CHANCE: 'Pas assez de CHANCE',
    ALREADY_USED: 'Déjà utilisé ce combat',
    NO_DAMAGE_TO_BLOCK: 'Pas de dégâts à bloquer',
  },
} as const;

export const COMBAT_ERRORS = {
  WEAPON_MAPPER: {
    NOT_A_WEAPON: (itemId: string) => `Item ${itemId} is not a weapon`,
    INVALID_TRIGGER: (trigger: string, weaponId: string) =>
      `Invalid weapon ability trigger "${trigger}" for weapon ${weaponId}`,
  },
} as const;
