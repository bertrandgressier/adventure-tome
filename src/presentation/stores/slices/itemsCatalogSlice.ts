import { CatalogItem } from '@/src/domain/types/items';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';
import { useCustomItemsStore } from '../customItemsStore';

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

export interface ItemsCatalogSlice {
  catalog: Record<string, CatalogItem>;

  getItem: (itemId: string) => CatalogItem | undefined;
  getAllItems: () => CatalogItem[];
  getItemsByTome: (tome: number) => CatalogItem[];
  createCustomItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem;
  removeCustomItem: (itemId: string) => void;
}

type SetState = (partial: Partial<ItemsCatalogSlice> | ((state: ItemsCatalogSlice) => Partial<ItemsCatalogSlice>)) => void;
type GetState = () => ItemsCatalogSlice;

export const createItemsCatalogSlice = () => {
  return (set: SetState, get: GetState): ItemsCatalogSlice => {
    const customItems = useCustomItemsStore.getState().customItems;

    return {
      catalog: buildCatalog(customItems),

      getItem: (itemId: string) => {
        return get().catalog[itemId];
      },

      getAllItems: () => {
        return Object.values(get().catalog);
      },

      getItemsByTome: (tome: number) => {
        return Object.values(get().catalog).filter((item) => item.tome === tome);
      },

      createCustomItem: (item: Omit<CatalogItem, 'id'>) => {
        const newItem: CatalogItem = {
          id: generateCustomItemId(),
          ...item,
        };

        useCustomItemsStore.getState().addCustomItem(newItem);

        set(() => ({
          catalog: buildCatalog([...useCustomItemsStore.getState().customItems, newItem]),
        }));

        return newItem;
      },

      removeCustomItem: (itemId: string) => {
        if (!itemId.startsWith('custom-')) return;

        useCustomItemsStore.getState().removeCustomItem(itemId);

        set(() => ({
          catalog: buildCatalog(useCustomItemsStore.getState().customItems),
        }));
      },
    };
  };
};
