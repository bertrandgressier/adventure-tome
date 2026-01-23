import type { CombatState, CombatEvent } from '../../types/combat-state';
import { CombatEventType } from '../../types/CombatEventType';
import { HistoryManager } from './HistoryManager';

/**
 * Item utilisable en combat
 * Représente une potion ou autre consommable avec ses effets
 */
export interface CombatUsableItem {
  id: string;
  name: string;
  /** Index de l'item dans l'inventaire (pour consommation à la fin du combat) */
  itemIndex: number;
  /** Quantité disponible de cet item */
  quantity: number;
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
    // Validation de l'item
    if (item.itemIndex < 0) {
      throw new Error(`Invalid itemIndex: ${item.itemIndex}. Must be >= 0.`);
    }
    if (!ItemResolver.isUsableInCombat(item)) {
      throw new Error(`Item "${item.name}" has no usable combat effects (healAmount or damageToEnemy required).`);
    }

    // Compter combien de fois cet item a été utilisé
    const usageCount = state.usedItems.filter(
      usedItem => usedItem.itemId === item.id && usedItem.itemIndex === item.itemIndex
    ).length;
    
    if (usageCount >= item.quantity) {
      throw new Error(`${item.name} : quantité épuisée (${usageCount}/${item.quantity} utilisées)`);
    }

    // Snapshot HP avant l'action
    const hpBefore = HistoryManager.createHPSnapshot(state);

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
        itemName: item.name,
        description: `${item.name} utilisé : +${actualHeal} PV`,
      });
    }

    // Appliquer les dégâts à l'ennemi actif
    if (item.damageToEnemy && item.damageToEnemy > 0) {
      const targetEnemy = newState.enemy;
      const newEnemyEndurance = Math.max(0, targetEnemy.endurance - item.damageToEnemy);

      newState = {
        ...newState,
        enemy: { ...newState.enemy, endurance: newEnemyEndurance },
      };

      events.push({
        type: CombatEventType.ITEM_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        damage: item.damageToEnemy,
        itemName: item.name,
        description: `${item.name} inflige ${item.damageToEnemy} dégâts à ${targetEnemy.name}`,
      });
    }

    // Snapshot HP après l'action
    const hpAfter = HistoryManager.createHPSnapshot(newState);

    // Créer une description complète pour l'historique
    const parts = [];
    if (item.healAmount && item.healAmount > 0) {
      const actualHeal = hpAfter.player - hpBefore.player;
      if (actualHeal > 0) {
        parts.push(`+${actualHeal} PV`);
      }
    }
    if (item.damageToEnemy && item.damageToEnemy > 0) {
      parts.push(`${item.damageToEnemy} dégâts à ${newState.enemy.name}`);
    }
    const description = `${item.name} utilisé${parts.length > 0 ? ' : ' + parts.join(', ') : ''}`;

    // Ajouter entrée dans l'historique
    newState.history = HistoryManager.addEntry(newState, {
      round: state.roundNumber,
      turn: 'player',
      action: 'use_item',
      hpBefore,
      hpAfter,
      timestamp: new Date().toISOString(),
      description,
      itemId: item.id,
    });

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
