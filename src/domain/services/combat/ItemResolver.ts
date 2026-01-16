import type { CombatState, CombatEvent } from '../../types/combat-v2';
import { CombatEventType } from '../../types/CombatEventType';

/**
 * Item utilisable en combat
 * Représente une potion ou autre consommable avec ses effets
 */
export interface CombatUsableItem {
  id: string;
  name: string;
  /** Index de l'item dans l'inventaire (pour consommation à la fin du combat) */
  itemIndex: number;
  /** Points de vie restaurés au joueur */
  healAmount?: number;
  /** Dégâts infligés à l'ennemi actif */
  damageToEnemy?: number;
}

export interface ItemResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

/**
 * ItemResolver - Gère l'utilisation d'items en combat
 * 
 * Supporte:
 * - Potions de soin (healAmount → +PV joueur)
 * - Potions offensives (damageToEnemy → -PV ennemi actif)
 * 
 * L'item est passé en paramètre car le CombatState ne stocke pas
 * les items disponibles (ils restent dans l'inventaire du personnage).
 */
export class ItemResolver {
  /**
   * Résout l'utilisation d'un item en combat
   * @param state État actuel du combat
   * @param item Item à utiliser avec ses effets
   * @returns Nouvel état du combat et événements générés
   */
  static resolve(
    state: CombatState,
    item: CombatUsableItem
  ): ItemResolutionResult {
    let newState = { ...state };
    const events: CombatEvent[] = [];

    // Tracker l'item utilisé pour consommation à la fin du combat
    newState = {
      ...newState,
      usedItems: [...newState.usedItems, { itemId: item.id, itemIndex: item.itemIndex }],
    };

    // Appliquer le soin au joueur
    if (item.healAmount && item.healAmount > 0) {
      const newEndurance = Math.min(
        newState.player.enduranceMax,
        newState.player.endurance + item.healAmount
      );
      const actualHeal = newEndurance - newState.player.endurance;

      newState = {
        ...newState,
        player: {
          ...newState.player,
          endurance: newEndurance,
        },
      };

      events.push({
        type: CombatEventType.ITEM_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        healAmount: actualHeal,
      });
    }

    // Appliquer les dégâts à l'ennemi actif
    if (item.damageToEnemy && item.damageToEnemy > 0) {
      const targetEnemy = newState.enemies[newState.activeEnemyIndex];
      const newEnemyEndurance = Math.max(0, targetEnemy.endurance - item.damageToEnemy);

      newState = {
        ...newState,
        enemies: newState.enemies.map((enemy, index) =>
          index === newState.activeEnemyIndex
            ? { ...enemy, endurance: newEnemyEndurance }
            : enemy
        ),
      };

      events.push({
        type: CombatEventType.ITEM_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        damage: item.damageToEnemy,
      });
    }

    return { state: newState, events };
  }

  /**
   * Vérifie si un item peut être utilisé en combat
   * @param item Item à vérifier
   * @returns true si l'item a des effets de combat
   */
  static isUsableInCombat(item: Partial<CombatUsableItem>): boolean {
    return (
      (item.healAmount !== undefined && item.healAmount > 0) ||
      (item.damageToEnemy !== undefined && item.damageToEnemy > 0)
    );
  }
}
