import catalogJson from '@/data/items-catalog.json';
import { CatalogItem, ItemType } from '@/src/domain/types/items';

export const ITEMS_CATALOG: CatalogItem[] = catalogJson.items.map((item) => ({
  ...item,
  type: item.type as ItemType,
})) as CatalogItem[];
