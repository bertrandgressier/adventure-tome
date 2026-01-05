import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import type { InventoryItem } from '@/src/domain/value-objects/Inventory';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';
import { CatalogItem } from '@/src/domain/types/items';

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
  addCustomItem: (
    id: string,
    catalogItem: CatalogItem,
    quantity?: number
  ) => Promise<void>;
  removeItem: (id: string, itemIndex: number) => Promise<void>;
  consumeItem: (id: string, itemIndex: number) => Promise<void>;
  addBoulons: (id: string, amount: number) => Promise<void>;
  removeBoulons: (id: string, amount: number) => Promise<void>;
}

type StoreState = CharacterInventorySlice & CharacterListSlice;
type SetState = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;
type GetState = () => StoreState;

export const createCharacterInventorySlice = (service: CharacterService) => {
  return (set: SetState, get: GetState): CharacterInventorySlice => ({
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
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour' });
        throw error;
      }
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
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour' });
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

      const catalogItem = ITEMS_CATALOG.find((item) => item.id === catalogItemId);
      if (!catalogItem) {
        throw new Error(`Item ${catalogItemId} not found in catalog`);
      }

      const newItem: Partial<InventoryItem> & { name: string; possessed?: boolean } = {
        id: catalogItem.id,
        name: catalogItem.name,
        type: catalogItem.type,
        possessed: true,
        effect: catalogItem.effect,
        quantity: catalogItem.stackable ? quantity : 1,
        stackable: catalogItem.stackable,
        unique: catalogItem.unique,
        disappearsOnTimeLoop: catalogItem.disappearsOnTimeLoop,
        attackPoints: catalogItem.attackPoints,
        healAmount: catalogItem.healAmount,
        damageToEnemy: catalogItem.damageToEnemy,
        statBonus: catalogItem.statBonus,
        isQuestItem: catalogItem.isQuestItem,
      };

      await get().addItem(id, newItem);
    },

    addCustomItem: async (
      id: string,
      catalogItem: CatalogItem,
      quantity: number = 1
    ) => {
      const character = get().characters[id];
      if (!character) return;

      const newItem: Partial<InventoryItem> & { name: string; possessed?: boolean } = {
        id: catalogItem.id,
        name: catalogItem.name,
        type: catalogItem.type,
        possessed: true,
        effect: catalogItem.effect,
        quantity: catalogItem.stackable ? quantity : 1,
        stackable: catalogItem.stackable,
        unique: catalogItem.unique,
        disappearsOnTimeLoop: catalogItem.disappearsOnTimeLoop,
        attackPoints: catalogItem.attackPoints,
        healAmount: catalogItem.healAmount,
        damageToEnemy: catalogItem.damageToEnemy,
        statBonus: catalogItem.statBonus,
        isQuestItem: catalogItem.isQuestItem,
      };

      await get().addItem(id, newItem);
    },

    removeItem: async (id: string, itemIndex: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.removeItemFromInventory(id, itemIndex);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour' });
        throw error;
      }
    },

    consumeItem: async (id: string, itemIndex: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const items = character.getInventory().items;
        const item = items[itemIndex];

        if (!item) {
          throw new Error('Item non trouvé');
        }

        if (!item.stackable) {
          throw new Error('Cet item n\'est pas consommable');
        }

        const quantity = item.quantity || 1;
        if (quantity <= 1) {
          await service.removeItemFromInventory(id, itemIndex);
        } else {
          const updated = await service.removeOneQuantity(id, itemIndex);
          set((state) => ({
            characters: { ...state.characters, [id]: updated },
          }));
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour' });
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
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour' });
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
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Erreur de mise à jour' });
        throw error;
      }
    },
  });
};
