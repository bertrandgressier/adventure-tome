import type { CombatActionType } from './CombatActionType';
import type { Attacker } from './Attacker';

/**
 * Détails d'un jet d'attaque dans l'historique
 */
export interface HitRollDetails {
  /** Résultat des deux dés (ex: [4, 2]) */
  dice: [number, number];
  /** Valeur cible (HABILETÉ du combattant) */
  target: number;
  /** Si le jet a réussi (total ≤ target) */
  success: boolean;
  /** Total du jet (dice[0] + dice[1]) */
  total: number;
}

/**
 * Détails d'un jet de dégâts dans l'historique
 */
export interface DamageRollDetails {
  /** Résultat du dé de dégâts */
  dice: number;
  /** Bonus de dégâts (arme + objets) */
  bonus: number;
  /** Total des dégâts (1 + dice + bonus) */
  total: number;
}

/**
 * Points de vie avant/après une action
 */
export interface HPSnapshot {
  player: number;
  enemy: number;
}

/**
 * Entrée complète dans l'historique du combat
 * Contient tous les détails d'une action (jets, HP, description)
 */
export interface CombatHistoryEntry {
  /** ID unique de l'entrée */
  id: string;
  /** Numéro du round */
  round: number;
  /** Tour en cours (player/enemy) */
  turn: Attacker;
  /** Type d'action */
  action: CombatActionType;
  /** Détails du jet d'attaque (si applicable) */
  hitRoll?: HitRollDetails;
  /** Détails du jet de dégâts (si applicable) */
  damageRoll?: DamageRollDetails;
  /** HP avant l'action */
  hpBefore: HPSnapshot;
  /** HP après l'action */
  hpAfter: HPSnapshot;
  /** Timestamp de l'action */
  timestamp: string;
  /** Description textuelle de l'action */
  description: string;
  /** ID de l'objet utilisé (si applicable) */
  itemId?: string;
  /** ID de la capacité d'arme utilisée (si applicable) */
  abilityId?: string;
}
