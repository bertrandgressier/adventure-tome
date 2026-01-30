/**
 * Combat UI Helpers
 * 
 * Helpers purs pour le calcul d'état visuel du combat.
 * Ces fonctions sont dédiées uniquement à l'affichage et ne contiennent
 * pas de logique métier du jeu.
 */

import type { CombatState } from '@/src/domain/types/combat-state';

export type HealthStatus = 'normal' | 'critical' | 'dead';

export interface CombatantHealthInfo {
  /** Pourcentage de santé (0-100) */
  healthPercent: number;
  /** État de santé pour styling */
  status: HealthStatus;
  /** Classe CSS de couleur pour la barre de vie */
  barColorClass: string;
  /** Classe CSS de couleur pour le texte */
  textColorClass: string;
}

/**
 * Calcule les informations d'affichage de santé d'un combattant
 * @param endurance Endurance actuelle
 * @param enduranceMax Endurance maximale
 * @returns Informations d'affichage de santé
 */
export function getCombatantHealthInfo(
  endurance: number,
  enduranceMax: number
): CombatantHealthInfo {
  const healthPercent = (endurance / enduranceMax) * 100;
  
  let status: HealthStatus = 'normal';
  let barColorClass = 'bg-primary';
  let textColorClass = 'text-primary';

  if (healthPercent <= 0) {
    status = 'dead';
    barColorClass = 'bg-red-600';
    textColorClass = 'text-red-600 drop-shadow-[0_0_2px_rgba(220,38,38,0.8)]';
  } else if (healthPercent <= 25) {
    status = 'critical';
    barColorClass = 'bg-orange-500';
    textColorClass = 'text-orange-500 drop-shadow-[0_0_2px_rgba(249,115,22,0.8)]';
  }

  return {
    healthPercent: Math.max(0, healthPercent),
    status,
    barColorClass,
    textColorClass,
  };
}

/**
 * Détermine si les dégâts seraient fatals
 * @param currentHealth Santé actuelle
 * @param damage Dégâts à appliquer
 * @returns true si les dégâts tueraient le combattant
 */
export function wouldBeLethal(currentHealth: number, damage: number): boolean {
  return currentHealth - damage <= 0;
}

/**
 * Type pour les métadonnées d'action de combat
 */
export interface ActionMetadata {
  label: string;
  icon: string;
}

/**
 * Métadonnées d'affichage pour les actions de combat
 */
export const COMBAT_ACTION_METADATA: Record<string, ActionMetadata> = {
  attack: { label: 'Attaquer', icon: '⚔️' },
  use_item: { label: 'Objet', icon: '🎒' },
  weapon_ability: { label: 'Pouvoir', icon: '✨' },
  reroll: { label: 'Relancer', icon: '🎲' },
  block: { label: 'Bloquer', icon: '🛡️' },
  skip: { label: 'Continuer', icon: '▶️' },
};

/**
 * Récupère les métadonnées d'affichage pour un type d'action
 * @param actionType Type d'action
 * @returns Métadonnées d'affichage (label + icon)
 */
export function getActionMetadata(actionType: string): ActionMetadata {
  return COMBAT_ACTION_METADATA[actionType] || { label: actionType, icon: '?' };
}

/**
 * Type guard pour vérifier si un combattant est un ennemi
 * Note: En V3, les ennemis n'ont plus de propriété isBoss
 */
export function isEnemy(
  combatant: CombatState['player'] | CombatState['enemy']
): combatant is CombatState['enemy'] {
  // En V3, on distingue par l'absence de 'weapon' et 'chance'
  return !('weapon' in combatant) && !('chance' in combatant);
}
