/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCharacterItemsSlice } from './characterItemsSlice';
import { ItemType } from '@/src/domain/types/items';
import { CatalogItem } from '@/src/domain/types/items';

describe('CharacterItemsSlice', () => {
  let slice: any;
  let mockSet: any;
  let mockGet: any;

  const mockGetInventory = vi.fn(() => ({
    items: [
      { itemId: 'tome1-bourse', quantity: 1, possessed: true },
      {
        itemId: 'custom-123-potion',
        quantity: 3,
        possessed: true,
      },
    ],
    weapon: null,
    boulons: 0,
  }));

  const mockCharacter = {
    id: 'test-character-id',
    name: 'Gandalf',
    book: 1,
    talent: 'instinct',
    gameMode: 'mortal',
    getInventory: mockGetInventory,
  } as any;

  const mockCatalog: CatalogItem[] = [
    {
      id: 'custom-123-potion',
      name: 'Potion magique',
      type: ItemType.ACTIVE,
      tome: 2,
      stackable: true,
      healAmount: 5,
    },
    {
      id: 'custom-456-weapon',
      name: 'Épée personnalisée',
      type: ItemType.WEAPON,
      tome: 1,
      attackPoints: 4,
      stackable: false,
    },
    {
      id: 'custom-789-passive',
      name: 'Amulette de protection',
      type: ItemType.PASSIVE,
      tome: 1,
      statBonus: { dexterite: 2 },
      stackable: false,
    },
  ];

  beforeEach(() => {
    mockSet = vi.fn();
    mockGet = vi.fn(() => ({
      characters: {
        'test-character-id': mockCharacter,
      },
      getAllItems: () => mockCatalog,
      getItem: (_itemId: string) => mockCatalog.find((item) => item.id === _itemId),
    }));

    slice = createCharacterItemsSlice({} as any)(mockSet, mockGet);
  });

  describe('getAddableCustomItems()', () => {
    it('devrait retourner tous les items custom addables (y compris stackables déjà présents)', () => {
      const addable = slice.getAddableCustomItems('test-character-id');

      expect(Array.isArray(addable)).toBe(true);

      // custom-123-potion is in inventory and stackable, should still be addable
      const hasPotion = addable.some((item: any) => item.id === 'custom-123-potion');
      expect(hasPotion).toBe(true);

      // custom-456-weapon and custom-789-passive should be addable
      const hasWeapon = addable.some((item: any) => item.id === 'custom-456-weapon');
      const hasPassive = addable.some((item: any) => item.id === 'custom-789-passive');
      expect(hasWeapon).toBe(true);
      expect(hasPassive).toBe(true);
    });

    it('devrait inclure les items stackables même s\'ils sont présents', () => {
      const addable = slice.getAddableCustomItems('test-character-id');

      // custom-123-potion is stackable and in inventory, but stackable items should still show
      const customPotion = addable.find((item: any) => item.id === 'custom-123-potion');
      expect(customPotion).toBeDefined();
    });

    it('devrait exclure les items uniques déjà possédés', () => {
      mockGetInventory.mockReturnValue({
        items: [
          { itemId: 'tome1-bourse', quantity: 1, possessed: true },
          { itemId: 'custom-456-weapon', quantity: 1, possessed: true },
          { itemId: 'custom-123-potion', quantity: 3, possessed: true },
          { itemId: 'custom-789-passive', quantity: 1, possessed: true },
        ],
        weapon: null,
        boulons: 0,
      });

      const addable = slice.getAddableCustomItems('test-character-id');

      // All custom items are now in inventory
      // Only stackable item should be addable even when present
      expect(addable).toHaveLength(1);
      expect(addable.find((item: any) => item.id === 'custom-123-potion')).toBeDefined();
    });

    it('devrait retourner un tableau vide si le personnage n\'existe pas', () => {
      const addable = slice.getAddableCustomItems('non-existent-character');

      expect(addable).toEqual([]);
    });

    it('devrait retourner un tableau vide si aucun item custom dans le catalogue', () => {
      mockGet.mockReturnValue({
        characters: {
          'test-character-id': mockCharacter,
        },
        getAllItems: () => [],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getItem: (itemId: string) => undefined,
      });

      const addable = slice.getAddableCustomItems('test-character-id');

      expect(addable).toEqual([]);
    });

     it('devrait filtrer correctement mixte d\'items stackables et uniques', () => {
      // Mock inventory with custom-123-potion (stackable) already present
      // and custom-456-weapon (unique) already present
      mockGetInventory.mockReturnValue({
        items: [
          { itemId: 'custom-123-potion', quantity: 1, possessed: true },
          { itemId: 'custom-456-weapon', quantity: 1, possessed: true },
        ],
        weapon: null,
        boulons: 0,
      });

      const addable = slice.getAddableCustomItems('test-character-id');

      const stackables = addable.filter((item: any) => item.stackable === true);
      const uniques = addable.filter((item: any) => item.stackable !== true);

      // custom-123-potion is stackable, so it's addable even though present
      expect(stackables.length).toBeGreaterThan(0);
      // custom-789-passive is unique and not in inventory, so it's addable
      expect(uniques.length).toBeGreaterThan(0);
    });
  });
});
