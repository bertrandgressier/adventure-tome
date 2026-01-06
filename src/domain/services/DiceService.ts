/**
 * DiceService - Service pur pour la génération aléatoire (dés)
 * 
 * Centralise toute la logique de lancer de dés pour éviter Math.random()
 * éparpillé dans les composants UI.
 * 
 * Clean Architecture: Domain Service (logique métier pure, testable)
 */

export class DiceService {
  /**
   * Lance un ou plusieurs dés avec un nombre de faces donné
   * @param sides Nombre de faces du dé (ex: 6 pour 1d6)
   * @param count Nombre de dés à lancer (par défaut 1)
   * @returns Résultat du lancer (somme des dés)
   */
  static roll(sides: number, count: number = 1): number {
    if (sides < 1) throw new Error('Le dé doit avoir au moins 1 face');
    if (count < 1) throw new Error('Il faut lancer au moins 1 dé');

    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }

  /**
   * Lance 1d6 (dé à 6 faces standard)
   */
  static roll1d6(): number {
    return this.roll(6, 1);
  }

  /**
   * Lance 2d6 (deux dés à 6 faces)
   */
  static roll2d6(): number {
    return this.roll(6, 2);
  }

  /**
   * Lance plusieurs dés et retourne les résultats individuels
   * @param sides Nombre de faces
   * @param count Nombre de dés
   * @returns Tableau des résultats individuels
   */
  static rollMultiple(sides: number, count: number): number[] {
    if (sides < 1) throw new Error('Le dé doit avoir au moins 1 face');
    if (count < 1) throw new Error('Il faut lancer au moins 1 dé');

    const results: number[] = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }
    return results;
  }

  /**
   * Génère les stats initiales d'un personnage selon les règles du livre
   * @returns Stats générées { dexterite, chance, pointsDeVieMax }
   */
  static generateCharacterStats(): {
    dexterite: number;
    chance: number;
    pointsDeVieMax: number;
  } {
    return {
      dexterite: 7,                    // Fixe selon règles
      chance: this.roll1d6(),          // 1d6
      pointsDeVieMax: this.roll2d6() * 4, // 2d6 × 4
    };
  }
}
