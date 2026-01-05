/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCharacterItemsSlice } from './characterItemsSlice';
import { ItemType } from '@/src/domain/types/items';
import { useCustomItemsCatalog } from '../customItemsCatalogStore';

describe('CharacterItemsSlice', () => {
  let slice: any;
  let state: any;

  const mockGetInventory = vi.fn(() => ({
    items: [
      { name: 'Bourse', possessed: true, type: ItemType.BASIC, id: 'bourse' },
      {
        id: 'custom-123-potion',
        name: 'Potion magique',
        type: ItemType.ACTIVE,
        possessed: true,
        stackable: true,
        quantity: 3,
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

  beforeEach(() => {
    useCustomItemsCatalog.setState({
      customItems: [
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
        },
        {
          id: 'custom-789-passive',
          name: 'Amulette de protection',
          type: ItemType.PASSIVE,
          tome: 1,
          statBonus: { dexterite: 2 },
        },
      ],
    });

    state = {
      characters: {
        'test-character-id': mockCharacter,
      },
    };

    slice = createCharacterItemsSlice({} as any)(undefined, () => state);
  });

  describe('getAvailableItems()', () => {
    it('devrait retourner tous les items disponibles pour un personnage', () => {
      const available = slice.getAvailableItems('test-character-id');

      expect(Array.isArray(available)).toBe(true);
      expect(available.length).toBeGreaterThan(0);

      const customItems = available.filter((item: any) => item.id.startsWith('custom-'));
      expect(customItems.length).toBe(3);
    });

    it('devrait inclure les items personnalisés dans la liste disponible', () => {
      const available = slice.getAvailableItems('test-character-id');

      const customPotion = available.find((item: any) => item.id === 'custom-123-potion');
      expect(customPotion).toBeDefined();
      expect(customPotion.name).toBe('Potion magique');
    });

    it('devrait retourner catalogue + custom items même sans personnage', () => {
      const available = slice.getAvailableItems('non-existent-character');

      expect(Array.isArray(available)).toBe(true);
      const customItems = available.filter((item: any) => item.id.startsWith('custom-'));
      expect(customItems.length).toBe(3);
    });
  });

  describe('getCustomItems()', () => {
    it('devrait retourner les items personnalisés possédés par le personnage', () => {
      const customItems = slice.getCustomItems('test-character-id');

      expect(customItems).toHaveLength(1);
      expect(customItems[0].id).toBe('custom-123-potion');
      expect(customItems[0].name).toBe('Potion magique');
    });

    it('devrait filtrer les items personnalisés non possédés', () => {
      const customItems = slice.getCustomItems('test-character-id');

      const customWeapon = customItems.find((item: any) => item.id === 'custom-456-weapon');
      const customPassive = customItems.find((item: any) => item.id === 'custom-789-passive');

      expect(customWeapon).toBeUndefined();
      expect(customPassive).toBeUndefined();
    });

    it('devrait retourner un tableau vide pour un personnage sans items custom', () => {
      const emptyCharacter = {
        id: 'empty-character-id',
        name: 'Frodo',
        getInventory: vi.fn(() => ({
          items: [{ name: 'Bourse', possessed: true, type: ItemType.BASIC, id: 'bourse' }],
        })),
      } as any;

      state = {
        characters: {
          'empty-character-id': emptyCharacter,
        },
      };

      slice = createCharacterItemsSlice({} as any)(undefined, () => state);

      const customItems = slice.getCustomItems('empty-character-id');

      expect(customItems).toEqual([]);
    });

    it('devrait retourner un tableau vide si le personnage n\'existe pas', () => {
      const customItems = slice.getCustomItems('non-existent-character');

      expect(customItems).toEqual([]);
    });
  });

  describe('getAddableCustomItems()', () => {
    it('devrait retourner les items custom non présents dans l\'inventaire', () => {
      const addable = slice.getAddableCustomItems('test-character-id');

      expect(addable.length).toBeGreaterThan(0);

      const weapon = addable.find((item: any) => item.id === 'custom-456-weapon');
      const passive = addable.find((item: any) => item.id === 'custom-789-passive');

      expect(weapon).toBeDefined();
      expect(passive).toBeDefined();
    });

    it('devrait inclure les items stackables même s\'ils sont présents', () => {
      const addable = slice.getAddableCustomItems('test-character-id');

      const stackablePotion = addable.find((item: any) => item.id === 'custom-123-potion');

      expect(stackablePotion).toBeDefined();
      expect(stackablePotion.stackable).toBe(true);
    });

    it('devrait exclure les items uniques déjà possédés', () => {
      const uniqueCharacter = {
        id: 'unique-character-id',
        name: 'Legolas',
        getInventory: vi.fn(() => ({
          items: [
            {
              id: 'custom-789-passive',
              name: 'Amulette unique',
              possessed: true,
              type: ItemType.PASSIVE,
              unique: true,
            },
          ],
        })),
      } as any;

      state = {
        characters: {
          'unique-character-id': uniqueCharacter,
        },
      };

      slice = createCharacterItemsSlice({} as any)(undefined, () => state);

      const addable = slice.getAddableCustomItems('unique-character-id');

      const uniqueItem = addable.find((item: any) => item.id === 'custom-789-passive');

      expect(uniqueItem).toBeUndefined();
    });

    it('devrait retourner un tableau vide si le personnage n\'existe pas', () => {
      const addable = slice.getAddableCustomItems('non-existent-character');

      expect(addable).toEqual([]);
    });

    it('devrait retourner un tableau vide si aucun item custom dans le catalogue', () => {
      useCustomItemsCatalog.setState({ customItems: [] });
      slice = createCharacterItemsSlice({} as any)(undefined, () => state);

      const addable = slice.getAddableCustomItems('test-character-id');

      expect(addable).toEqual([]);
    });

    it('devrait filtrer correctement mixte d\'items stackables et uniques', () => {
      const mixedCharacter = {
        id: 'mixed-character-id',
        name: 'Gimli',
        getInventory: vi.fn(() => ({
          items: [
            {
              id: 'custom-123-potion',
              name: 'Potion',
              possessed: true,
              type: ItemType.ACTIVE,
              stackable: true,
              quantity: 2,
            },
            {
              id: 'custom-789-passive',
              name: 'Amulette unique',
              possessed: true,
              type: ItemType.PASSIVE,
              unique: true,
            },
            { id: 'bourse', name: 'Bourse', possessed: true, type: ItemType.BASIC },
          ],
        })),
      } as any;

      state = {
        characters: {
          'mixed-character-id': mixedCharacter,
        },
      };

      slice = createCharacterItemsSlice({} as any)(undefined, () => state);

      const addable = slice.getAddableCustomItems('mixed-character-id');

      const potion = addable.find((item: any) => item.id === 'custom-123-potion');
      const uniqueItem = addable.find((item: any) => item.id === 'custom-789-passive');
      const weapon = addable.find((item: any) => item.id === 'custom-456-weapon');

      expect(potion).toBeDefined();
      expect(uniqueItem).toBeUndefined();
      expect(weapon).toBeDefined();
    });
  });

  describe('Cas d\'usage métier - Gestion des items personnalisés', () => {
    it('devrait permettre à un MJ de voir tous les items disponibles pour un personnage', () => {
      const available = slice.getAvailableItems('test-character-id');

      const customItems = available.filter((item: any) => item.id.startsWith('custom-'));

      expect(customItems.length).toBe(3);
      expect(customItems.some((item: any) => item.name === 'Épée personnalisée')).toBe(true);
      expect(customItems.some((item: any) => item.name === 'Potion magique')).toBe(true);
    });

    it('devrait afficher les items custom possédés par un personnage', () => {
      const customItems = slice.getCustomItems('test-character-id');

      expect(customItems).toHaveLength(1);
      expect(customItems[0].name).toBe('Potion magique');
    });

    it('devrait proposer d\'ajouter uniquement les items non possédés ou stackables', () => {
      const addable = slice.getAddableCustomItems('test-character-id');

      // custom-123-potion: possessed mais stackable → addable ✓
      // custom-456-weapon: pas possédé → addable ✓
      // custom-789-passive: pas possédé → addable ✓
      expect(addable.length).toBe(3);

      const ids = addable.map((item: any) => item.id);
      expect(ids).toContain('custom-456-weapon');
      expect(ids).toContain('custom-789-passive');
    });
  });
});
