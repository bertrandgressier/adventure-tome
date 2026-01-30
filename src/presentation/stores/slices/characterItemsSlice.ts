import { type StateCreator } from 'zustand';
import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import type { ItemsCatalogSlice } from './itemsCatalogSlice';
import type { CharacterInventorySlice } from './characterInventorySlice';
import { CatalogItem } from '@/src/domain/types/items';

export interface CharacterItemsSlice {
  getAddableCustomItems: (characterId: string) => CatalogItem[];
}

type StoreState = CharacterItemsSlice & CharacterListSlice & ItemsCatalogSlice & CharacterInventorySlice;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createCharacterItemsSlice = (_service: CharacterService): StateCreator<
  StoreState,
  [['zustand/devtools', never]],
  [],
  CharacterItemsSlice
> => {
  return (_set, get) => ({
    getAddableCustomItems: (characterId: string) => {
      const character = get().characters[characterId];
      if (!character) return [];

      const allItems = get().getAllItems();
      const presentItemIds = character.getInventory().items
        .filter((item) => item.possessed)
        .map((item) => item.itemId);

      return allItems.filter((item) => {
        if (!item.id.startsWith('custom-')) return false;
        const isPresent = presentItemIds.includes(item.id);
        const isStackable = item.stackable === true;
        if (!isPresent) return true;
        return isStackable;
      });
    },
  });
};
