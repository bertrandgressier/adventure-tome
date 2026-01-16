/**
 * Inventory - Value Object
 * Représente l'inventaire d'un personnage
 */

import { InventoryItem as DomainInventoryItem, InventoryItemRef, ItemType } from '../types/items';

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
  /** ID du catalog (source de vérité pour les abilities) */
  itemId?: string;
  name: string;
  attackPoints: number;
}

export interface InventoryData {
  boulons: number;
  weapon?: Weapon;
  items: InventoryItemRef[];
}

export const MAX_ITEMS = 14;
export const BOURSE_ITEM_ID = 'tome1-bourse';
export const BOURSE_ITEM_NAME = 'Bourse';

export class Inventory {
  constructor(
    public readonly boulons: number,
    public readonly weapon: Weapon | undefined,
    public readonly items: readonly InventoryItemRef[]
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

  unequipWeapon(): Inventory {
    return new Inventory(
      this.boulons,
      undefined,
      this.items
    );
  }

  addItem(itemRef: InventoryItemRef, isStackable: boolean, isBourse: boolean, itemName?: string): Inventory {
    if (this.items.length >= MAX_ITEMS) {
      throw new Error(`Inventaire plein (${MAX_ITEMS} objets maximum)`);
    }

    if (isBourse) {
      const hasBourse = this.items.some((i) => i.itemId === BOURSE_ITEM_ID);
      if (hasBourse) {
        throw new Error('La bourse est déjà présente dans l\'inventaire');
      }
    }

    const existingItemIndex = this.items.findIndex((i) => i.itemId === itemRef.itemId && i.possessed);

    if (existingItemIndex >= 0) {
      if (isStackable) {
        const updatedItems = [...this.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + itemRef.quantity,
        };
        return new Inventory(this.boulons, this.weapon, updatedItems);
      }

      throw new Error(`${itemName ?? 'Cet item'} est déjà dans l\'inventaire`);
    }

    return new Inventory(
      this.boulons,
      this.weapon,
      [...this.items, itemRef]
    );
  }

  removeItem(index: number): Inventory {
    if (index < 0 || index >= this.items.length) {
      throw new Error('Index d\'objet invalide');
    }

    const itemToRemove = this.items[index];
    if (itemToRemove.itemId === BOURSE_ITEM_ID) {
      throw new Error('Impossible de jeter la bourse');
    }

    return new Inventory(
      this.boulons,
      this.weapon,
      this.items.filter((_, i) => i !== index)
    );
  }

  removeOneQuantity(index: number): Inventory {
    if (index < 0 || index >= this.items.length) {
      throw new Error('Index d\'objet invalide');
    }

    const item = this.items[index];
    if (item.quantity <= 1) {
      throw new Error('Impossible de réduire la quantité en dessous de 1');
    }

    const updatedItems = [...this.items];
    updatedItems[index] = {
      ...item,
      quantity: item.quantity - 1,
    };

    return new Inventory(this.boulons, this.weapon, updatedItems);
  }

  toData(): InventoryData {
    return {
      boulons: this.boulons,
      weapon: this.weapon,
      items: [...this.items],
    };
  }

  static fromData(data: InventoryData): Inventory {
    return new Inventory(
      data.boulons,
      data.weapon,
      data.items
    );
  }

  static fromLegacyData(data: { boulons: number; weapon?: Weapon; items: InventoryItem[] }): Inventory {
    const itemsRef: InventoryItemRef[] = data.items.map((item) => ({
      itemId: item.id,
      quantity: item.quantity ?? 1,
      possessed: item.possessed,
    }));

    return new Inventory(
      data.boulons,
      data.weapon,
      itemsRef
    );
  }
}
