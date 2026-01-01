import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import type { InventoryItem } from '@/src/domain/value-objects/Inventory';

export interface CharacterInventorySlice {
  equipWeapon: (
    id: string,
    weapon: { name: string; attackPoints: number } | null
  ) => Promise<void>;
  addItem: (
    id: string,
    item: Partial<InventoryItem> & { name: string; possessed?: boolean }
  ) => Promise<void>;
  removeItem: (id: string, itemIndex: number) => Promise<void>;
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
