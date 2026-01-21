import { type StateCreator } from 'zustand';
import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import type { ItemsCatalogSlice } from './itemsCatalogSlice';
import type { InventoryItemRef } from '@/src/domain/types/items';
import type { InventoryItem } from '@/src/domain/value-objects/Inventory';
import { handleSliceError } from './sliceHelpers';
import { BOURSE_ITEM_ID } from '@/src/domain/value-objects/Inventory';

export interface CharacterInventorySlice {
  equipWeapon: (
    id: string,
    weapon: { name: string; attackPoints: number } | null
  ) => Promise<void>;
  addItem: (
    id: string,
    item: Partial<InventoryItem> & { name: string; possessed?: boolean }
  ) => Promise<void>;
  addItemFromCatalog: (
    id: string,
    catalogItemId: string,
    quantity?: number
  ) => Promise<void>;
  removeItem: (id: string, itemIndex: number) => Promise<void>;
  consumeItem: (id: string, itemIndex: number) => Promise<void>;
  addBoulons: (id: string, amount: number) => Promise<void>;
  removeBoulons: (id: string, amount: number) => Promise<void>;
  setBoulons: (id: string, newValue: number) => Promise<void>;
  getItemDetails: (itemRef: InventoryItemRef) => ReturnType<ItemsCatalogSlice['getItem']>;
}

type StoreState = CharacterInventorySlice & CharacterListSlice & ItemsCatalogSlice;

export const createCharacterInventorySlice = (service: CharacterService): StateCreator<
  StoreState,
  [['zustand/devtools', never]],
  [],
  CharacterInventorySlice
> => {
  return (set, get) => ({
    equipWeapon: async (
      id: string,
      weapon: { name: string; attackPoints: number } | null
    ) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = weapon
          ? await service.equipWeapon(id, weapon)
          : await service.unequipWeapon(id);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, weapon ? 'inventory/equipWeapon' : 'inventory/unequipWeapon');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    addItemFromCatalog: async (
      id: string,
      catalogItemId: string,
      quantity: number = 1
    ) => {
      const character = get().characters[id];
      if (!character) return;

      const catalogItem = get().getItem(catalogItemId);
      if (!catalogItem) {
        throw new Error(`Item ${catalogItemId} not found in catalog`);
      }

      const itemRef: InventoryItemRef = {
        itemId: catalogItem.id,
        quantity: catalogItem.stackable ? quantity : 1,
        possessed: true,
      };

      try {
        const updated = await service.addItemToInventoryWithRef(
          id,
          itemRef,
          catalogItem.stackable ?? false,
          catalogItem.id === BOURSE_ITEM_ID
        );
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'inventory/addItemFromCatalog');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    removeItem: async (id: string, itemIndex: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.removeItemFromInventory(id, itemIndex);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'inventory/removeItem');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    consumeItem: async (id: string, itemIndex: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const itemRef = character.getInventory().items[itemIndex];
        if (!itemRef) {
          throw new Error('Item non trouvé');
        }

        const catalogItem = get().getItem(itemRef.itemId);

        if (!catalogItem) {
          throw new Error('Cet item n\'est plus disponible dans le catalogue');
        }

        if (!catalogItem.stackable) {
          throw new Error('Cet item n\'est pas consommable');
        }

        if (itemRef.quantity <= 1) {
          await service.removeItemFromInventory(id, itemIndex);
        } else {
          const updated = await service.removeOneQuantity(id, itemIndex);
          set((state) => ({
            characters: { ...state.characters, [id]: updated },
          }), false, 'inventory/consumeItem');
        }
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    addBoulons: async (id: string, amount: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.addBoulons(id, amount);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'inventory/addBoulons');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    removeBoulons: async (id: string, amount: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.removeBoulons(id, amount);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'inventory/removeBoulons');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    setBoulons: async (id: string, newValue: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const currentBoulons = character.getInventory().boulons;
        const diff = newValue - currentBoulons;

        if (diff > 0) {
          await service.addBoulons(id, diff);
        } else if (diff < 0) {
          await service.removeBoulons(id, Math.abs(diff));
        }

        const updated = await service.getCharacter(id);
        if (updated) {
          set((state) => ({
            characters: { ...state.characters, [id]: updated },
          }), false, 'inventory/setBoulons');
        }
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    getItemDetails: (itemRef: InventoryItemRef) => {
      return get().getItem(itemRef.itemId);
    },

    addItem: async (
      id: string,
      item: Partial<InventoryItem> & { name: string; possessed?: boolean }
    ) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.addItemToInventory(id, item);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'inventory/addItem');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },
  });
};
