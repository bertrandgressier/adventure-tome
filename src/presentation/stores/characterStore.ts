import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';
import { CharacterService } from '@/src/application/services/CharacterService';
import { IndexedDBCharacterRepository } from '@/src/infrastructure/repositories/IndexedDBCharacterRepository';
import { createCharacterListSlice, type CharacterListSlice } from './slices/characterListSlice';
import { createCharacterMutationSlice, type CharacterMutationSlice } from './slices/characterMutationSlice';
import { createCharacterStatsSlice, type CharacterStatsSlice } from './slices/characterStatsSlice';
import { createCharacterInventorySlice, type CharacterInventorySlice } from './slices/characterInventorySlice';
import { createCharacterMetadataSlice, type CharacterMetadataSlice } from './slices/characterMetadataSlice';
import { createCharacterItemsSlice, type CharacterItemsSlice } from './slices/characterItemsSlice';
import { createPersistedItemsCatalogSlice, type ItemsCatalogSlice } from './slices/itemsCatalogSlice';

let serviceInstance: CharacterService | null = null;

function getService(): CharacterService {
  if (!serviceInstance) {
    const repository = new IndexedDBCharacterRepository();
    serviceInstance = new CharacterService(repository);
  }
  return serviceInstance;
}

export type CharacterStore = CharacterListSlice &
  CharacterMutationSlice &
  CharacterStatsSlice &
  CharacterInventorySlice &
  CharacterMetadataSlice &
  CharacterItemsSlice &
  ItemsCatalogSlice;

export const createCharacterStore = () => {
  const service = getService();

  return createStore<CharacterStore>()(
    devtools(
      (set, get) => ({
        ...createCharacterListSlice(service)(set, get),
        ...createCharacterMutationSlice(service)(set),
        ...createCharacterStatsSlice(service)(set, get),
        ...createCharacterInventorySlice(service)(set, get),
        ...createCharacterMetadataSlice(service)(set, get),
        ...createCharacterItemsSlice(service)(set, get),
        ...createPersistedItemsCatalogSlice()(set, get),
      }),
      { name: 'CharacterStore', enabled: typeof window !== 'undefined' }
    )
  );
};
