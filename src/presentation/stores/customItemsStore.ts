import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/src/domain/types/items';

interface CustomItemsStore {
  customItems: CatalogItem[];
  addCustomItem: (item: CatalogItem) => void;
  removeCustomItem: (itemId: string) => void;
}

const isTest = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storeDefinition = (set: any) => ({
  customItems: [] as CatalogItem[],

  addCustomItem: (item: CatalogItem) => {
    set((state: CustomItemsStore) => ({
      customItems: [...state.customItems, item],
    }));
  },

  removeCustomItem: (itemId: string) => {
    set((state: CustomItemsStore) => ({
      customItems: state.customItems.filter((item) => item.id !== itemId),
    }));
  },
});

export const useCustomItemsStore = isTest
  ? create<CustomItemsStore>()(storeDefinition)
  : create<CustomItemsStore>()(
      persist(storeDefinition, {
        name: 'adventure-tome-custom-items-storage',
      })
    );
