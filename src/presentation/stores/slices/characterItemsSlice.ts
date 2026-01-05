import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';
import { CatalogItem } from '@/src/domain/types/items';
import { useCustomItemsCatalog } from '../customItemsCatalogStore';

export interface CharacterItemsSlice {
  getAvailableItems: (characterId: string) => CatalogItem[];
  getCustomItems: (characterId: string) => CatalogItem[];
  getAddableCustomItems: (characterId: string) => CatalogItem[];
}

type StoreState = CharacterItemsSlice & CharacterListSlice;
type GetState = () => StoreState;
type SetState = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;

export const createCharacterItemsSlice = (_service: CharacterService) => {
  return (_set: SetState, get: GetState): CharacterItemsSlice => ({
    getAvailableItems: (characterId: string) => {
      const character = get().characters[characterId];
      const customItems = useCustomItemsCatalog.getState().customItems;

      if (!character) return [...ITEMS_CATALOG, ...customItems];

      return [...ITEMS_CATALOG, ...customItems];
    },

    getCustomItems: (characterId: string) => {
      const character = get().characters[characterId];
      if (!character) return [];

      const customItemsCatalog = useCustomItemsCatalog.getState().customItems;

      const presentCustomItemIds = character.getInventory().items
        .filter((item) => item.id.startsWith('custom-') && item.possessed)
        .map((item) => item.id);

      return customItemsCatalog.filter((item) => presentCustomItemIds.includes(item.id));
    },

    getAddableCustomItems: (characterId: string) => {
      const character = get().characters[characterId];
      if (!character) return [];

      const customItemsCatalog = useCustomItemsCatalog.getState().customItems;

      const presentItemIds = character.getInventory().items
        .filter((item) => item.possessed)
        .map((item) => item.id);

      return customItemsCatalog.filter((item) => {
        const isPresent = presentItemIds.includes(item.id);
        if (!isPresent) return true;
        return item.stackable === true;
      });
    },
  });
};
