import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/src/domain/types/items';

export interface CustomItemsCatalogState {
  customItems: CatalogItem[];
  addCustomItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem;
  removeCustomItem: (itemId: string) => void;
  getCustomItemById: (itemId: string) => CatalogItem | undefined;
}

function generateCustomItemId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useCustomItemsCatalog = create<CustomItemsCatalogState>()(
  persist(
    (set, get) => ({
      customItems: [],

      addCustomItem: (item: Omit<CatalogItem, 'id'>) => {
        const newItem: CatalogItem = {
          id: generateCustomItemId(),
          ...item,
        };

        set((state) => ({
          customItems: [...state.customItems, newItem],
        }));

        return newItem;
      },

      removeCustomItem: (itemId: string) => {
        set((state) => ({
          customItems: state.customItems.filter((item) => item.id !== itemId),
        }));
      },

      getCustomItemById: (itemId: string) => {
        const state = get();
        return state.customItems.find((item) => item.id === itemId);
      },
    }),
    {
      name: 'custom-items-catalog',
      version: 1,
    }
  )
);
