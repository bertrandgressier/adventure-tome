/**
 * Inventory - Value Object
 * Représente l'inventaire d'un personnage
 */

import { InventoryItem as DomainInventoryItem, ItemType } from '../types/items';

export interface InventoryItem extends DomainInventoryItem {
  id: string;
  name: string;
  type: ItemType;
  possessed: boolean;
  effect?: string;
  quantity?: number;
  stackable?: boolean;
  unique?: boolean;
  disappearsOnTimeLoop?: boolean;
  attackPoints?: number;
  healAmount?: number;
  statBonus?: {
    dexterite?: number;
    chance?: number;
    vie?: number;
    pvMax?: number;
  };
  isQuestItem?: boolean;
  damageToEnemy?: number;
}

export interface Weapon {
  name: string;
  attackPoints: number;
}

export interface InventoryData {
  boulons: number;
  weapon?: Weapon;
  items: InventoryItem[];
}

export const MAX_ITEMS = 14;
export const BOURSE_ITEM_NAME = 'Bourse';

export class Inventory {
  constructor(
    public readonly boulons: number,
    public readonly weapon: Weapon | undefined,
    public readonly items: readonly InventoryItem[]
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.boulons < 0) {
      throw new Error('Le nombre de boulons ne peut pas être négatif');
    }
    
    if (this.weapon && this.weapon.attackPoints < 0) {
      throw new Error('Les points d\'attaque de l\'arme ne peuvent pas être négatifs');
    }
  }

  /**
   * Ajoute des boulons
   */
  addBoulons(amount: number): Inventory {
    if (amount < 0) {
      throw new Error('Le montant à ajouter ne peut pas être négatif');
    }
    
    return new Inventory(
      this.boulons + amount,
      this.weapon,
      this.items
    );
  }

  /**
   * Retire des boulons
   */
  removeBoulons(amount: number): Inventory {
    if (amount < 0) {
      throw new Error('Le montant à retirer ne peut pas être négatif');
    }
    
    if (this.boulons < amount) {
      throw new Error('Pas assez de boulons');
    }
    
    return new Inventory(
      this.boulons - amount,
      this.weapon,
      this.items
    );
  }

  /**
   * Équipe une arme (remplace l'arme actuelle)
   */
  equipWeapon(weapon: Weapon): Inventory {
    if (weapon.attackPoints < 0) {
      throw new Error('Les points d\'attaque de l\'arme ne peuvent pas être négatifs');
    }
    
    return new Inventory(
      this.boulons,
      weapon,
      this.items
    );
  }

  /**
   * Retire l'arme équipée
   */
  unequipWeapon(): Inventory {
    return new Inventory(
      this.boulons,
      undefined,
      this.items
    );
  }

  /**
   * Ajoute un objet à l'inventaire
   */
  addItem(item: Partial<InventoryItem> & { name: string; possessed?: boolean }): Inventory {
    const itemToAdd: InventoryItem = {
      id: item.id || `legacy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name,
      type: item.type || ItemType.BASIC,
      possessed: item.possessed ?? true,
      effect: item.effect,
      quantity: item.quantity ?? 1,
      stackable: item.stackable ?? false,
      unique: item.unique ?? false,
      disappearsOnTimeLoop: item.disappearsOnTimeLoop ?? false,
      attackPoints: item.attackPoints,
      healAmount: item.healAmount,
      damageToEnemy: item.damageToEnemy,
      statBonus: item.statBonus,
      isQuestItem: item.isQuestItem ?? false,
    };

    if (this.items.length >= MAX_ITEMS) {
      throw new Error(`Inventaire plein (${MAX_ITEMS} objets maximum)`);
    }

    // Empêcher d'ajouter une deuxième bourse
    if (itemToAdd.name === BOURSE_ITEM_NAME) {
      const hasBourse = this.items.some((i) => i.name === BOURSE_ITEM_NAME);
      if (hasBourse) {
        throw new Error('La bourse est déjà présente dans l\'inventaire');
      }
    }

    // Gérer les items stackables et uniques
    const existingItemIndex = this.items.findIndex((i) => i.id === itemToAdd.id && i.possessed);

    if (existingItemIndex >= 0) {
      const existingItem = this.items[existingItemIndex];

      // Si l'item est stackable, augmenter la quantité
      if (itemToAdd.stackable && itemToAdd.quantity) {
        const updatedItems = [...this.items];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: (existingItem.quantity || 0) + itemToAdd.quantity,
        };
        return new Inventory(this.boulons, this.weapon, updatedItems);
      }

      // Si l'item n'est pas stackable, empêcher l'ajout
      throw new Error(`${itemToAdd.name} est déjà dans l'inventaire`);
    }

    return new Inventory(
      this.boulons,
      this.weapon,
      [...this.items, itemToAdd]
    );
  }

  /**
   * Retire un objet de l'inventaire
   */
  removeItem(index: number): Inventory {
    if (index < 0 || index >= this.items.length) {
      throw new Error('Index d\'objet invalide');
    }

    const itemToRemove = this.items[index];
    if (itemToRemove.name === BOURSE_ITEM_NAME) {
      throw new Error('Impossible de jeter la bourse');
    }
    
    return new Inventory(
      this.boulons,
      this.weapon,
      this.items.filter((_, i) => i !== index)
    );
  }

  /**
   * Convertit en format de données
   */
  toData(): InventoryData {
    return {
      boulons: this.boulons,
      weapon: this.weapon,
      items: [...this.items],
    };
  }

  /**
   * Crée une instance depuis des données
   */
  static fromData(data: InventoryData): Inventory {
    return new Inventory(
      data.boulons,
      data.weapon,
      data.items
    );
  }
}
