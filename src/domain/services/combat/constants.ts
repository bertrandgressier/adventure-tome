/**
 * Combat system constants and messages
 */

/**
 * Dice roll result constants for identifying special rolls
 */
export const DICE_ROLL_RESULTS = {
  /** Check if a roll is a double (both dice show the same value) */
  isDouble: (dice1: number, dice2: number): boolean => dice1 === dice2,
  /** Check if an attack hit (roll <= target dexterity) */
  isHit: (roll: number, dexterite: number): boolean => roll <= dexterite,
  /** Check if an attack missed (roll > target dexterity) */
  isMiss: (roll: number, dexterite: number): boolean => roll > dexterite,
} as const;

export const COMBAT_MESSAGES = {
  WEAPON_ABILITY: {
    WEAPON_REQUIRED: 'Arme requise non équipée',
    INSUFFICIENT_CHANCE: 'Pas assez de CHANCE',
    ALREADY_USED: 'Déjà utilisé ce combat',
    NO_DAMAGE_TO_BLOCK: 'Pas de dégâts à bloquer',
    /** Weapon ability triggered notification messages */
    TRIGGERED: {
      /** Lame de l'Aube Éternelle - on double */
      EXTRA_ATTACK: 'DOUBLE ! Attaque supplémentaire !',
      /** Marteau de la Terre - on kill */
      HEAL_ON_KILL: (amount: number) => `Ennemi vaincu ! +${amount} PV récupéré`,
      /** Arc des Vents - on miss (manual) */
      CONVERT_MISS: (pointsSpent: number) => `Flèche guidée ! -${pointsSpent} CHANCE`,
      /** Dague des Ombres - on surprise */
      SURPRISE_BONUS: (amount: number) => `SURPRISE ! +${amount} dégâts bonus`,
      /** Bâton du Sage - on enemy hit (manual) */
      NEGATE_DAMAGE: 'Bouclier mystique ! Dégâts annulés',
    },
  },
  /** History log descriptions for weapon abilities */
  HISTORY: {
    EXTRA_ATTACK_TRIGGERED: '⚔️ La Lame de l\'Aube Éternelle brille ! Double aux dés → Attaque supplémentaire',
    HEAL_ON_KILL_TRIGGERED: (amount: number, currentHp: number, maxHp: number) => 
      `💚 Le Marteau de la Terre pulse d'énergie ! +${amount} PV (${currentHp}/${maxHp})`,
    CONVERT_MISS_TRIGGERED: (chanceSpent: number, chanceRemaining: number) => 
      `🏹 L'Arc des Vents guide la flèche ! Raté → Touché ! (-${chanceSpent} CHANCE, reste ${chanceRemaining})`,
    SURPRISE_BONUS_TRIGGERED: (bonusDamage: number, totalDamage: number) => 
      `🗡️ La Dague des Ombres frappe depuis les ténèbres ! +${bonusDamage} dégâts (total: ${totalDamage})`,
    NEGATE_DAMAGE_TRIGGERED: (negatedDamage: number) => 
      `🛡️ Le Bâton du Sage crée un bouclier mystique ! ${negatedDamage} dégâts annulés`,
    /** Generic fallback for unknown abilities */
    ABILITY_TRIGGERED: (abilityName: string) => `✨ ${abilityName} activé !`,
  },
  /** Attack result messages */
  ATTACK: {
    HIT: (attackerName: string, targetName: string, damage: number) => 
      `${attackerName} touche ${targetName} et inflige ${damage} dégâts`,
    MISS: (attackerName: string, targetName: string) => 
      `${attackerName} rate ${targetName}`,
    DOUBLE_ROLL: '🎲 DOUBLE !',
  },
} as const;

export const COMBAT_ERRORS = {
  WEAPON_MAPPER: {
    NOT_A_WEAPON: (itemId: string) => `Item ${itemId} is not a weapon`,
    INVALID_TRIGGER: (trigger: string, weaponId: string) =>
      `Invalid weapon ability trigger "${trigger}" for weapon ${weaponId}`,
  },
} as const;

/**
 * Weapon ability IDs for type-safe references
 */
export const WEAPON_ABILITY_IDS = {
  LAME_AUBE_EXTRA_ATTACK: 'lame-aube-extra-attack',
  MARTEAU_VAMPIRIC: 'marteau-vampiric',
  ARC_WIND_GUIDED: 'arc-wind-guided',
  DAGUE_SURPRISE_STRIKE: 'dague-surprise-strike',
  BATON_MYSTIC_SHIELD: 'baton-mystic-shield',
} as const;
