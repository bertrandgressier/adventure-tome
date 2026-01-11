import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/src/domain/types/items';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';

export interface ItemsCatalogSlice {
  catalog: Record<string, CatalogItem>;

  getItem: (itemId: string) => CatalogItem | undefined;
  getAllItems: () => CatalogItem[];
  getItemsByTome: (tome: number) => CatalogItem[];
  addCustomItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem;
  removeCustomItem: (itemId: string) => void;
  initializeCatalog: () => Promise<void>;
}

type SetState = (partial: Partial<ItemsCatalogSlice> | ((state: ItemsCatalogSlice) => Partial<ItemsCatalogSlice>)) => void;
type GetState = () => ItemsCatalogSlice;

function generateCustomItemId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function buildCatalog(customItems: CatalogItem[]): Record<string, CatalogItem> {
  const catalog: Record<string, CatalogItem> = {};

  for (const item of ITEMS_CATALOG) {
    catalog[item.id] = item;
  }

  for (const item of customItems) {
    catalog[item.id] = item;
  }

  return catalog;
}

function filterCustomItems(catalog: Record<string, CatalogItem>): CatalogItem[] {
  return Object.values(catalog).filter((item) => item.id.startsWith('custom-'));
}

export const createItemsCatalogSlice = () => {
  return (set: SetState, get: GetState): ItemsCatalogSlice => ({
    catalog: buildCatalog([]),

    getItem: (itemId: string) => {
      return get().catalog[itemId];
    },

    getAllItems: () => {
      return Object.values(get().catalog);
    },

    getItemsByTome: (tome: number) => {
      return Object.values(get().catalog).filter((item) => item.tome === tome);
    },

    addCustomItem: (item: Omit<CatalogItem, 'id'>) => {
      const newItem: CatalogItem = {
        id: generateCustomItemId(),
        ...item,
      };

      set((state) => ({
        catalog: { ...state.catalog, [newItem.id]: newItem },
      }));

      return newItem;
    },

    removeCustomItem: (itemId: string) => {
      if (!itemId.startsWith('custom-')) return;

      set((state) => {
        const newCatalog = { ...state.catalog };
        delete newCatalog[itemId];
        return { catalog: newCatalog };
      });
    },

    initializeCatalog: async () => {
      const state = get();
      const customItems = filterCustomItems(state.catalog);
      set({ catalog: buildCatalog(customItems) });
    },
  });
};

export const createPersistedItemsCatalogSlice = () => {
  return persist(createItemsCatalogSlice(), {
    name: 'items-catalog',
    version: 1,
    partialize: (state) => ({
      catalog: Object.fromEntries(
        Object.entries(state.catalog).filter(([key]) => key.startsWith('custom-'))
      ),
    }),
  });
};
