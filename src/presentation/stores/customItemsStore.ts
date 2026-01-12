import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/src/domain/types/items';

interface CustomItemsStore {
  customItems: CatalogItem[];
  addCustomItem: (item: CatalogItem) => void;
  removeCustomItem: (itemId: string) => void;
}

export const useCustomItemsStore = create<CustomItemsStore>()(
  persist(
    (set) => ({
      customItems: [],

      addCustomItem: (item: CatalogItem) => {
        set((state) => ({
          customItems: [...state.customItems, item],
        }));
      },

      removeCustomItem: (itemId: string) => {
        set((state) => ({
          customItems: state.customItems.filter((item) => item.id !== itemId),
        }));
      },
    }),
    {
      name: 'adventure-tome-custom-items-storage',
    }
  )
);
