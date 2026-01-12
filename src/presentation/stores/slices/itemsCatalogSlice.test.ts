import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createItemsCatalogSlice, type ItemsCatalogSlice } from './itemsCatalogSlice';
import { CatalogItem, ItemType } from '@/src/domain/types/items';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ITEMS_CATALOG } from '@/src/data/items-catalog';

describe('itemsCatalogSlice', () => {
  let slice: ItemsCatalogSlice;
  let catalog: Record<string, CatalogItem>;

  const mockSet = vi.fn();
  let currentState: ItemsCatalogSlice;
  const mockGet = vi.fn(() => currentState);

  beforeEach(() => {
    mockSet.mockClear();
    mockGet.mockClear();
    mockSet.mockImplementation((update) => {
      currentState = { ...currentState, ...(typeof update === 'function' ? update(currentState) : update) };
    });
    slice = createItemsCatalogSlice()(mockSet, mockGet);
    currentState = slice;
    catalog = slice.catalog;
  });

  it('should initialize catalog with ITEMS_CATALOG', () => {
    expect(catalog).toBeDefined();
    expect(Object.keys(catalog).length).toBeGreaterThan(0);
  });

  it('should include tome1-potion-soin from ITEMS_CATALOG', () => {
    const item = slice.getItem('tome1-potion-soin');
    expect(item).toBeDefined();
    expect(item?.id).toBe('tome1-potion-soin');
    expect(item?.name).toBe('Potion de soin');
  });

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

  it('should return all items from catalog', () => {
    const allItems = slice.getAllItems();

    expect(Array.isArray(allItems)).toBe(true);
    expect(allItems.length).toBeGreaterThan(0);
  });

  it('should include items from all tomes', () => {
    const allItems = slice.getAllItems();

    const hasTome1 = allItems.some((item: CatalogItem) => item.tome === 1);
    const hasTome2 = allItems.some((item: CatalogItem) => item.tome === 2);
    const hasTome3 = allItems.some((item: CatalogItem) => item.tome === 3);

    expect(hasTome1).toBe(true);
    expect(hasTome2).toBe(true);
    expect(hasTome3).toBe(true);
  });

  it('should return items for specific tome', () => {
    const tome1Items = slice.getItemsByTome(1);

    expect(Array.isArray(tome1Items)).toBe(true);
    expect(tome1Items.length).toBeGreaterThan(0);
    expect(tome1Items.every((item: CatalogItem) => item.tome === 1)).toBe(true);
  });

  it('should return items for tome 2', () => {
    const tome2Items = slice.getItemsByTome(2);

    expect(tome2Items.length).toBeGreaterThan(0);
    expect(tome2Items.every((item: CatalogItem) => item.tome === 2)).toBe(true);
  });

  it('should return items for tome 3', () => {
    const tome3Items = slice.getItemsByTome(3);

    expect(tome3Items.length).toBeGreaterThan(0);
    expect(tome3Items.every((item: CatalogItem) => item.tome === 3)).toBe(true);
  });

  describe('createCustomItem()', () => {
    it('should add custom item to catalog', () => {
      const customItem = slice.createCustomItem({
        name: 'Custom Item',
        type: ItemType.BASIC,
        tome: 1,
      });

      expect(customItem.id).toMatch(/^custom-\d+-[a-z0-9]+$/);
      expect(customItem.name).toBe('Custom Item');
      expect(customItem.type).toBe(ItemType.BASIC);
      expect(customItem.tome).toBe(1);
      expect(mockSet).toHaveBeenCalled();
    });

    it('should add custom item with all fields', () => {
      const customItem = slice.createCustomItem({
        name: 'Custom Weapon',
        type: ItemType.WEAPON,
        tome: 2,
        effect: 'A powerful weapon',
        stackable: false,
        unique: true,
        disappearsOnTimeLoop: false,
        attackPoints: 3,
        healAmount: 5,
        damageToEnemy: 2,
        statBonus: { chance: 1 },
        isQuestItem: false,
      });

      expect(customItem.id).toMatch(/^custom-\d+-[a-z0-9]+$/);
      expect(customItem.name).toBe('Custom Weapon');
      expect(customItem.attackPoints).toBe(3);
      expect(customItem.unique).toBe(true);
      expect(mockSet).toHaveBeenCalled();
    });
  });

  describe('removeCustomItem()', () => {
    it('should remove custom item from catalog', () => {
      const customItem = slice.createCustomItem({
        name: 'To Remove',
        type: ItemType.BASIC,
        tome: 1,
      });

      slice.removeCustomItem(customItem.id);
      expect(mockSet).toHaveBeenCalled();
    });

    it('should not remove non-custom items', () => {
      slice.removeCustomItem('tome1-potion-soin');
      expect(mockSet).not.toHaveBeenCalled();
    });
  });


});
