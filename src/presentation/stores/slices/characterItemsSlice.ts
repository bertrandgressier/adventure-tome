import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import type { ItemsCatalogSlice } from './itemsCatalogSlice';
import type { CharacterInventorySlice } from './characterInventorySlice';
import { CatalogItem } from '@/src/domain/types/items';

export interface CharacterItemsSlice {
  getAddableCustomItems: (characterId: string) => CatalogItem[];
}

type StoreState = CharacterItemsSlice & CharacterListSlice & ItemsCatalogSlice & CharacterInventorySlice;
type GetState = () => StoreState;

export const createCharacterItemsSlice = (_service: CharacterService) => {
  return (_set: SetState, get: GetState): CharacterItemsSlice => ({
    getAddableCustomItems: (characterId: string) => {
      const character = get().characters[characterId];
      if (!character) return [];

      const allItems = get().getAllItems();
      const presentItemIds = character.getInventory().items
        .filter((item) => item.possessed)
        .map((item) => item.itemId);

      return allItems.filter((item) => {
        if (item.id !== 'custom-' && !item.id.startsWith('custom-')) return false;
        const isPresent = presentItemIds.includes(item.id);
        if (!isPresent) return true;
        return item.stackable === true;
      });
    },
  });
};

type SetState = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;
