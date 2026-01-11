import { describe, it, expect, beforeEach } from 'vitest';
import { createItemsCatalogSlice, type ItemsCatalogSlice } from '../itemsCatalogSlice';
import { CatalogItem, ItemType } from '@/src/domain/types/items';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';

describe('itemsCatalogSlice', () => {
  let slice: ItemsCatalogSlice;
  let set: jest.Mock;
  let get: jest.Mock;

  beforeEach(() => {
    set = jest.fn();
    get = jest.fn(() => ({ catalog: {} }));
    slice = createItemsCatalogSlice()(set, get);
  });

  describe('getItem', () => {
    it('should return item from ITEMS_CATALOG by ID', () => {
      const item = slice.getItem('tome1-potion-soin');

      expect(item).toBeDefined();
      expect(item?.id).toBe('tome1-potion-soin');
      expect(item?.name).toBe('Potion de soin');
    });

    it('should return undefined for unknown item ID', () => {
      const item = slice.getItem('unknown-item-id');

      expect(item).toBeUndefined();
    });

    it('should return custom item by ID', () => {
      const customItem: Omit<CatalogItem, 'id'> = {
        name: 'Custom Weapon',
        type: ItemType.WEAPON,
        tome: 1,
        stackable: false,
      };

      const added = slice.addCustomItem(customItem);
      const retrieved = slice.getItem(added.id);

      expect(retrieved).toEqual(added);
    });
  });

  describe('getAllItems', () => {
    it('should return all items including custom items', () => {
      const customItem: Omit<CatalogItem, 'id'> = {
        name: 'Custom Item',
        type: ItemType.BASIC,
        tome: 1,
      };

      slice.addCustomItem(customItem);
      const allItems = slice.getAllItems();

      expect(allItems.length).toBeGreaterThan(ITEMS_CATALOG.length);
      expect(allItems.some((item) => item.name === 'Custom Item')).toBe(true);
    });
  });

  describe('getItemsByTome', () => {
    it('should return items for specific tome', () => {
      const tome1Items = slice.getItemsByTome(1);

      expect(tome1Items.length).toBeGreaterThan(0);
      expect(tome1Items.every((item) => item.tome === 1)).toBe(true);
    });

    it('should return items for tome 2', () => {
      const tome2Items = slice.getItemsByTome(2);

      expect(tome2Items.length).toBeGreaterThan(0);
      expect(tome2Items.every((item) => item.tome === 2)).toBe(true);
    });

    it('should return items for tome 3', () => {
      const tome3Items = slice.getItemsByTome(3);

      expect(tome3Items.length).toBeGreaterThan(0);
      expect(tome3Items.every((item) => item.tome === 3)).toBe(true);
    });
  });

  describe('addCustomItem', () => {
    it('should add custom item with generated ID', () => {
      const customItem: Omit<CatalogItem, 'id'> = {
        name: 'Epic Sword',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 5,
      };

      const added = slice.addCustomItem(customItem);

      expect(added.id).toMatch(/^custom-\d+-[a-z0-9]+$/);
      expect(added.name).toBe('Epic Sword');
      expect(added.attackPoints).toBe(5);
      expect(set).toHaveBeenCalled();
    });

    it('should persist custom item in catalog', () => {
      const customItem: Omit<CatalogItem, 'id'> = {
        name: 'Magic Ring',
        type: ItemType.PASSIVE,
        tome: 2,
        stackable: false,
      };

      const added = slice.addCustomItem(customItem);
      const retrieved = slice.getItem(added.id);

      expect(retrieved).toEqual(added);
    });
  });

  describe('removeCustomItem', () => {
    it('should remove custom item by ID', () => {
      const customItem: Omit<CatalogItem, 'id'> = {
        name: 'Temporary Item',
        type: ItemType.BASIC,
        tome: 1,
      };

      const added = slice.addCustomItem(customItem);
      slice.removeCustomItem(added.id);

      const retrieved = slice.getItem(added.id);
      expect(retrieved).toBeUndefined();
      expect(set).toHaveBeenCalled();
    });

    it('should not remove items from ITEMS_CATALOG', () => {
      const itemId = 'tome1-potion-soin';
      const before = slice.getItem(itemId);

      slice.removeCustomItem(itemId);
      const after = slice.getItem(itemId);

      expect(before).toBeDefined();
      expect(after).toBeDefined();
      expect(set).not.toHaveBeenCalled();
    });

    it('should only remove items starting with "custom-"', () => {
      slice.removeCustomItem('tome1-potion-soin');

      expect(slice.getItem('tome1-potion-soin')).toBeDefined();
      expect(set).not.toHaveBeenCalled();
    });
  });

  describe('initializeCatalog', () => {
    it('should rebuild catalog with existing custom items', async () => {
      const customItem: Omit<CatalogItem, 'id'> = {
        name: 'Persisted Custom',
        type: ItemType.BASIC,
        tome: 1,
      };

      const added = slice.addCustomItem(customItem);
      await slice.initializeCatalog();

      const retrieved = slice.getItem(added.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Persisted Custom');
    });
  });
});
