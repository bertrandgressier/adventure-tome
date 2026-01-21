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
import { createItemsCatalogSlice, type ItemsCatalogSlice } from './slices/itemsCatalogSlice';
import { createCombatSlice, type CombatSlice } from './slices/combatSlice';

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
  ItemsCatalogSlice &
  CombatSlice;

export const createCharacterStore = () => {
  const service = getService();

  return createStore<CharacterStore>()(
    devtools(
      (...args) => ({
        ...createCharacterListSlice(service)(...args),
        ...createCharacterMutationSlice(service)(...args),
        ...createCharacterStatsSlice(service)(...args),
        ...createCharacterInventorySlice(service)(...args),
        ...createCharacterMetadataSlice(service)(...args),
        ...createCharacterItemsSlice(service)(...args),
        ...createItemsCatalogSlice()(...args),
        ...createCombatSlice()(...args),
      }),
      { name: 'CharacterStore', enabled: typeof window !== 'undefined' }
    )
  );
};
