/**
 * ChanceService - Service de gestion de la CHANCE
 *
 * La CHANCE est une réserve de points consommables qui permet
 * de modifier le résultat d'un jet de dés.
 *
 * Règle officielle (docs/regles.md):
 * "Cette caractéristique fonctionne comme une réserve de points.
 * Vous pouvez consommer des points de CHANCE pour modifier le résultat
 * d'un de vos jets de dés au cours de votre aventure."
 *
 * Exemple : Vous possédez 5 en CHANCE. Pour ouvrir une porte, vous devez
 * faire 5 avec un dé à six faces : vous jetez le dé et obtenez un 3.
 * Vous choisissez d'utiliser 2 de vos points de CHANCE pour régler
 * votre dé sur 5.
 *
 * Clean Architecture: Domain Service (logique métier pure, testable)
 */
export class ChanceService {
  /**
   * Calcule le coût minimum en points de CHANCE pour atteindre un objectif
   * @param currentRoll - Résultat actuel du jet de dés
   * @param targetValue - Valeur à atteindre (ex: DEXTÉRITÉ pour toucher)
   * @returns Nombre de points nécessaires (0 si déjà réussi)
   *
   * Note: Pour les jets où on veut être "inférieur ou égal" (ex: toucher),
   * la CHANCE ne peut pas transformer un échec en réussite.
   * Elle sert principalement à modifier des jets pour ATTEINDRE une valeur
   * exacte ou augmenter les dégâts.
   */
  static calculateCostToSucceed(currentRoll: number, targetValue: number): number {
    const diff = targetValue - currentRoll;
    return Math.max(0, diff);
  }

  /**
   * Vérifie si le joueur peut dépenser de la chance
   * @param availableChance - Points de CHANCE disponibles
   * @param cost - Coût en points
   * @returns true si la dépense est possible
   */
  static canSpendChance(availableChance: number, cost: number): boolean {
    return cost > 0 && availableChance >= cost;
  }

  /**
   * Applique le modificateur de chance à un jet
   * @param roll - Résultat original du jet
   * @param pointsSpent - Nombre de points dépensés
   * @returns Nouveau résultat modifié
   */
  static applyChanceModifier(roll: number, pointsSpent: number): number {
    return roll + pointsSpent;
  }

  /**
   * Calcule le nouveau score de CHANCE après dépense
   * @param currentChance - Score actuel de CHANCE
   * @param pointsSpent - Points dépensés
   * @returns Nouveau score de CHANCE (jamais négatif)
   */
  static calculateRemainingChance(currentChance: number, pointsSpent: number): number {
    return Math.max(0, currentChance - pointsSpent);
  }

  /**
   * Obtient les options de dépense de CHANCE disponibles
   * @param availableChance - Points disponibles
   * @param maxUseful - Maximum utile (ex: pour atteindre un objectif)
   * @returns Tableau des options de dépense [1, 2, 3, ...]
   */
  static getSpendingOptions(availableChance: number, maxUseful?: number): number[] {
    const max = maxUseful !== undefined ? Math.min(availableChance, maxUseful) : availableChance;
    return Array.from({ length: Math.max(0, max) }, (_, i) => i + 1);
  }
}
