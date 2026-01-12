/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCharacterInventorySlice } from './characterInventorySlice';
import type { CharacterListSlice } from './characterListSlice';
import { ItemType } from '@/src/domain/types/items';

vi.mock('@/src/application/services/CharacterService');

describe('CharacterInventorySlice', () => {
  let service: any;
  let slice: any;
  let mockGetState: any;
  let mockSetState: any;

  const mockCharacter = {
    id: 'test-character-id',
    name: 'Gandalf',
    book: 1,
    talent: 'instinct',
    gameMode: 'mortal',
    getInventory: vi.fn(() => ({
      items: [{ itemId: 'tome1-bourse', quantity: 1, possessed: true }],
      weapon: null,
      boulons: 0,
    })),
    getStats: vi.fn(() => ({
      dexterite: 7,
      chance: 5,
      chanceInitiale: 5,
      pointsDeVieMax: 32,
      pointsDeVieActuels: 32,
    })),
    setInventory: vi.fn(),
  } as any;

  const mockCharacterListSlice: Partial<CharacterListSlice> = {
    characters: {
      'test-character-id': mockCharacter,
    },
  };

  const mockInventorySlice: any = {
    addItem: vi.fn(async (id: string, item: any) => {
      const updated = await service.addItemToInventory(id, item);
      mockSetState((state: any) => ({
        ...state,
        characters: { ...state.characters, [id]: updated },
      }));
      return updated;
    }),
    getItem: vi.fn((itemId: string) => {
      if (itemId === 'tome1-potion-soin') {
        return { id: 'tome1-potion-soin', name: 'Potion de soin', type: ItemType.ACTIVE, stackable: true };
      }
      if (itemId === 'potion') {
        return { id: 'potion', name: 'Potion', type: ItemType.ACTIVE, stackable: true };
      }
      if (itemId === 'potions') {
        return { id: 'potions', name: 'Potions', type: ItemType.ACTIVE, stackable: true };
      }
      if (itemId === 'sword') {
        return { id: 'sword', name: 'Épée', type: ItemType.WEAPON, stackable: false };
      }
      if (itemId === 'custom-1234567890-abc123') {
        return { id: 'custom-1234567890-abc123', name: 'Épée légendaire', type: ItemType.WEAPON, tome: 1, attackPoints: 3 };
      }
      if (itemId === 'custom-1234567890-potions') {
        return { id: 'custom-1234567890-potions', name: 'Potion magique', type: ItemType.ACTIVE, tome: 2, stackable: true, healAmount: 5 };
      }
      if (itemId === 'custom-1234567890-unique') {
        return { id: 'custom-1234567890-unique', name: 'Anneau unique', type: ItemType.SPECIAL, tome: 3, unique: true, statBonus: { chance: 2 } };
      }
      if (itemId === 'custom-1234567890-full') {
        return { id: 'custom-1234567890-full', name: 'Item complet', type: ItemType.PASSIVE, tome: 2, effect: 'Donne des bonus', stackable: false, unique: true, disappearsOnTimeLoop: false, statBonus: { dexterite: 2, chance: 1 }, isQuestItem: true };
      }
      if (itemId === 'custom-1234567890-default') {
        return { id: 'custom-1234567890-default', name: 'Potion', type: ItemType.ACTIVE, tome: 1, stackable: true };
      }
      if (itemId === 'custom-1234567890-error') {
        return { id: 'custom-1234567890-error', name: 'Item avec erreur', type: ItemType.BASIC, tome: 1 };
      }
      return undefined;
    }),
    addItemFromCatalog: vi.fn(async (id: string, catalogItemId: string, quantity: number) => {
      const catalogItem = mockInventorySlice.getItem(catalogItemId);
      if (!catalogItem) throw new Error(`Item ${catalogItemId} not found in catalog`);
      const itemRef = {
        itemId: catalogItem.id,
        quantity: catalogItem.stackable ? quantity : 1,
        possessed: true,
      };
      const updated = await service.addItemToInventoryWithRef(id, itemRef, catalogItem.stackable ?? false, catalogItem.id === 'tome1-bourse');
      mockSetState((state: any) => ({
        ...state,
        characters: { ...state.characters, [id]: updated },
      }));
      return updated;
    }),
  };

  beforeEach(() => {
    service = {
      addItemToInventory: vi.fn(),
      addItemToInventoryWithRef: vi.fn(),
      removeItemFromInventory: vi.fn(),
      equipWeapon: vi.fn(),
      unequipWeapon: vi.fn(),
      addBoulons: vi.fn(),
      removeBoulons: vi.fn(),
      removeOneQuantity: vi.fn(),
    };

    service.addItemToInventory.mockResolvedValue(mockCharacter);
    service.addItemToInventoryWithRef.mockResolvedValue(mockCharacter);
    service.removeItemFromInventory.mockResolvedValue(mockCharacter);
    service.equipWeapon.mockResolvedValue(mockCharacter);
    service.unequipWeapon.mockResolvedValue(mockCharacter);
    service.addBoulons.mockResolvedValue(mockCharacter);
    service.removeBoulons.mockResolvedValue(mockCharacter);
    service.removeOneQuantity.mockResolvedValue(mockCharacter);

    mockSetState = vi.fn();
    mockGetState = vi.fn(() => ({
      ...mockCharacterListSlice,
      ...mockInventorySlice,
      characters: {
        'test-character-id': mockCharacter,
      },
    }));

    slice = createCharacterInventorySlice(service)(mockSetState, mockGetState);
  });

  describe('addItem()', () => {
    it('devrait ajouter un item via le service', async () => {
      const itemData = {
        name: 'Potion de soin',
        possessed: true,
        type: ItemType.ACTIVE,
      };

      await slice.addItem('test-character-id', itemData);

      expect(service.addItemToInventory).toHaveBeenCalledWith('test-character-id', itemData);
      expect(mockSetState).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs du service', async () => {
      const error = new Error('Erreur lors de l\'ajout');
      service.addItemToInventory.mockRejectedValue(error);

      const itemData = {
        name: 'Potion',
        possessed: true,
        type: ItemType.ACTIVE,
      };

      await expect(slice.addItem('test-character-id', itemData)).rejects.toThrow();
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Erreur lors de l\'ajout',
        })
      );
    });
  });

  describe('addItemFromCatalog()', () => {
    it('devrait ajouter un item depuis le catalogue', async () => {
      await slice.addItemFromCatalog('test-character-id', 'tome1-potion-soin', 3);

      expect(mockSetState).toHaveBeenCalled();
    });

    it('devrait lancer une erreur si l\'item n\'est pas dans le catalogue', async () => {
      await expect(
        slice.addItemFromCatalog('test-character-id', 'non-existent-item')
      ).rejects.toThrow('Item non-existent-item not found in catalog');
    });
  });

  describe('removeItem()', () => {
    it('devrait supprimer un item via le service', async () => {
      await slice.removeItem('test-character-id', 0);

      expect(service.removeItemFromInventory).toHaveBeenCalledWith('test-character-id', 0);
      expect(mockSetState).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de suppression', async () => {
      const error = new Error('Item non trouvé');
      service.removeItemFromInventory.mockRejectedValue(error);

      await expect(slice.removeItem('test-character-id', 99)).rejects.toThrow();
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Item non trouvé',
        })
      );
    });
  });

  describe('consumeItem()', () => {
    it('devrait consommer un item stackable avec quantité > 1', async () => {
      const itemWithQuantity = {
        ...mockCharacter,
        getInventory: vi.fn(() => ({
          items: [
            { itemId: 'potion', quantity: 3, possessed: true },
          ],
        })),
      };

      mockGetState.mockReturnValue({
        ...mockInventorySlice,
        characters: {
          'test-character-id': itemWithQuantity,
        },
      });

      await slice.consumeItem('test-character-id', 0);

      expect(service.removeOneQuantity).toHaveBeenCalledWith('test-character-id', 0);
    });

    it('devrait supprimer un item stackable avec quantité = 1', async () => {
      const itemWithOneQuantity = {
        ...mockCharacter,
        getInventory: vi.fn(() => ({
          items: [
            { itemId: 'potion', quantity: 1, possessed: true },
          ],
        })),
      };

      mockGetState.mockReturnValue({
        ...mockInventorySlice,
        characters: {
          'test-character-id': itemWithOneQuantity,
        },
      });

      await slice.consumeItem('test-character-id', 0);

      expect(service.removeItemFromInventory).toHaveBeenCalledWith('test-character-id', 0);
    });

    it('devrait lancer une erreur si l\'item n\'est pas stackable', async () => {
      const nonStackableItem = {
        ...mockCharacter,
        getInventory: vi.fn(() => ({
          items: [
            { itemId: 'sword', quantity: 1, possessed: true },
          ],
        })),
      };

      mockGetState.mockReturnValue({
        ...mockInventorySlice,
        characters: {
          'test-character-id': nonStackableItem,
        },
      });

      await expect(slice.consumeItem('test-character-id', 0)).rejects.toThrow('Cet item n\'est pas consommable');
    });

    it('devrait lancer une erreur si l\'item n\'existe pas', async () => {
      mockGetState.mockReturnValue({
        ...mockInventorySlice,
        characters: {
          'test-character-id': {
            ...mockCharacter,
            getInventory: vi.fn(() => ({ items: [] })),
          },
        },
      });

      await expect(slice.consumeItem('test-character-id', 0)).rejects.toThrow('Item non trouvé');
    });
  });

  describe('equipWeapon()', () => {
    it('devrait équiper une arme', async () => {
      const weapon = { name: 'Glamdring', attackPoints: 5 };

      await slice.equipWeapon('test-character-id', weapon);

      expect(service.equipWeapon).toHaveBeenCalledWith('test-character-id', weapon);
      expect(mockSetState).toHaveBeenCalled();
    });

    it('devrait déséquiper si weapon est null', async () => {
      await slice.equipWeapon('test-character-id', null);

      expect(service.unequipWeapon).toHaveBeenCalledWith('test-character-id');
    });

    it('devrait gérer les erreurs d\'équipement', async () => {
      const error = new Error('Arme cassée');
      service.equipWeapon.mockRejectedValue(error);

      const weapon = { name: 'Épée brisée', attackPoints: 0 };

      await expect(slice.equipWeapon('test-character-id', weapon)).rejects.toThrow();
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Arme cassée',
        })
      );
    });
  });

  describe('addBoulons() et removeBoulons()', () => {
    it('devrait ajouter des boulons', async () => {
      await slice.addBoulons('test-character-id', 10);

      expect(service.addBoulons).toHaveBeenCalledWith('test-character-id', 10);
      expect(mockSetState).toHaveBeenCalled();
    });

    it('devrait retirer des boulons', async () => {
      await slice.removeBoulons('test-character-id', 5);

      expect(service.removeBoulons).toHaveBeenCalledWith('test-character-id', 5);
    });

    it('devrait gérer les erreurs de manipulation des boulons', async () => {
      const error = new Error('Pas assez de boulons');
      service.removeBoulons.mockRejectedValue(error);

      await expect(slice.removeBoulons('test-character-id', 999)).rejects.toThrow();
    });
  });

  describe('Cas d\'usage métier - Gestion de l\'inventaire', () => {
    it('devrait consommer une portion d\'un stackable', async () => {
      const itemWithStack = {
        ...mockCharacter,
        getInventory: vi.fn(() => ({
          items: [
            {
              itemId: 'potions',
              quantity: 5,
              possessed: true,
            },
          ],
        })),
      };
      const catalogItem = {
        id: 'potions',
        name: 'Potions',
        type: ItemType.ACTIVE,
        stackable: true,
      };
      mockInventorySlice.getItem.mockReturnValue(catalogItem);

      mockGetState.mockReturnValue({
        ...mockInventorySlice,
        characters: {
          'test-character-id': itemWithStack,
        },
      });

      await slice.consumeItem('test-character-id', 0);

      expect(service.removeOneQuantity).toHaveBeenCalled();
    });
  });
});
