import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCharacterInventorySlice } from './characterInventorySlice';
import type { CharacterListSlice } from './characterListSlice';
import { ItemType } from '@/src/domain/types/items';
import { CatalogItem } from '@/src/domain/types/items';

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
      items: [{ name: 'Bourse', possessed: true, type: ItemType.BASIC, id: 'bourse' }],
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
  };

  beforeEach(() => {
    service = {
      addItemToInventory: vi.fn(),
      removeItemFromInventory: vi.fn(),
      equipWeapon: vi.fn(),
      unequipWeapon: vi.fn(),
      addBoulons: vi.fn(),
      removeBoulons: vi.fn(),
      removeOneQuantity: vi.fn(),
    };

    service.addItemToInventory.mockResolvedValue(mockCharacter);
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
      const catalogItem: CatalogItem = {
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        type: ItemType.ACTIVE,
        tome: 1,
        stackable: true,
        healAmount: 5,
      };

      await slice.addItemFromCatalog('test-character-id', 'tome1-potion-soin', 3);

      expect(mockSetState).toHaveBeenCalled();
    });

    it('devrait lancer une erreur si l\'item n\'est pas dans le catalogue', async () => {
      await expect(
        slice.addItemFromCatalog('test-character-id', 'non-existent-item')
      ).rejects.toThrow('Item non-existent-item not found in catalog');
    });
  });

  describe('addCustomItem()', () => {
    it('devrait ajouter un item personnalisé au personnage', async () => {
      const customItem: CatalogItem = {
        id: 'custom-1234567890-abc123',
        name: 'Épée légendaire',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 3,
      };

      await slice.addCustomItem('test-character-id', customItem, 1);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          id: 'custom-1234567890-abc123',
          name: 'Épée légendaire',
          type: ItemType.WEAPON,
          possessed: true,
          attackPoints: 3,
        })
      );
    });

    it('devrait gérer les items stackables personnalisés', async () => {
      const stackableItem: CatalogItem = {
        id: 'custom-1234567890-potions',
        name: 'Potion magique',
        type: ItemType.ACTIVE,
        tome: 2,
        stackable: true,
        healAmount: 5,
      };

      await slice.addCustomItem('test-character-id', stackableItem, 5);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          quantity: 5,
          stackable: true,
        })
      );
    });

    it('devrait gérer les items non-stackables', async () => {
      const uniqueItem: CatalogItem = {
        id: 'custom-1234567890-unique',
        name: 'Anneau unique',
        type: ItemType.SPECIAL,
        tome: 3,
        unique: true,
        statBonus: { chance: 2 },
      };

      await slice.addCustomItem('test-character-id', uniqueItem, 10);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          quantity: 1,
        })
      );
    });

    it('devrait copier tous les champs pertinents de l\'item personnalisé', async () => {
      const fullCustomItem: CatalogItem = {
        id: 'custom-1234567890-full',
        name: 'Item complet',
        type: ItemType.PASSIVE,
        tome: 2,
        effect: 'Donne des bonus',
        stackable: false,
        unique: true,
        disappearsOnTimeLoop: false,
        statBonus: { dexterite: 2, chance: 1 },
        isQuestItem: true,
      };

      await slice.addCustomItem('test-character-id', fullCustomItem);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          id: 'custom-1234567890-full',
          name: 'Item complet',
          type: ItemType.PASSIVE,
          possessed: true,
          effect: 'Donne des bonus',
          stackable: false,
          unique: true,
          disappearsOnTimeLoop: false,
          statBonus: { dexterite: 2, chance: 1 },
          isQuestItem: true,
        })
      );
    });

    it('devrait respecter la quantité par défaut si non spécifiée', async () => {
      const customItem: CatalogItem = {
        id: 'custom-1234567890-default',
        name: 'Potion',
        type: ItemType.ACTIVE,
        tome: 1,
        stackable: true,
      };

      await slice.addCustomItem('test-character-id', customItem);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          quantity: 1,
        })
      );
    });

    it('devrait gérer les erreurs lors de l\'ajout', async () => {
      const customItem: CatalogItem = {
        id: 'custom-1234567890-error',
        name: 'Item avec erreur',
        type: ItemType.BASIC,
        tome: 1,
      };

      service.addItemToInventory.mockRejectedValue(new Error('Inventaire plein'));

      await expect(slice.addCustomItem('test-character-id', customItem)).rejects.toThrow();
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
            { name: 'Potion', possessed: true, type: ItemType.ACTIVE, stackable: true, quantity: 3, id: 'potion' },
          ],
        })),
      };

      mockGetState.mockReturnValue({
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
            { name: 'Potion', possessed: true, type: ItemType.ACTIVE, stackable: true, quantity: 1, id: 'potion' },
          ],
        })),
      };

      mockGetState.mockReturnValue({
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
            { name: 'Épée', possessed: true, type: ItemType.WEAPON, stackable: false, id: 'sword' },
          ],
        })),
      };

      mockGetState.mockReturnValue({
        characters: {
          'test-character-id': nonStackableItem,
        },
      });

      await expect(slice.consumeItem('test-character-id', 0)).rejects.toThrow('Cet item n\'est pas consommable');
    });

    it('devrait lancer une erreur si l\'item n\'existe pas', async () => {
      mockGetState.mockReturnValue({
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
    it('devrait permettre d\'ajouter un item custom créé par un MJ', async () => {
      const customWeapon: CatalogItem = {
        id: 'custom-mj-weapon',
        name: 'Hache de combat',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 4,
      };

      await slice.addCustomItem('test-character-id', customWeapon);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          name: 'Hache de combat',
          type: ItemType.WEAPON,
          attackPoints: 4,
        })
      );
    });

    it('devrait permettre d\'ajouter une potion custom stackable', async () => {
      const customPotion: CatalogItem = {
        id: 'custom-mj-potion',
        name: 'Élixir de guérison',
        type: ItemType.ACTIVE,
        tome: 2,
        stackable: true,
        healAmount: 8,
      };

      await slice.addCustomItem('test-character-id', customPotion, 10);

      expect(service.addItemToInventory).toHaveBeenCalledWith(
        'test-character-id',
        expect.objectContaining({
          name: 'Élixir de guérison',
          quantity: 10,
          stackable: true,
          healAmount: 8,
        })
      );
    });

    it('devrait consommer une portion d\'un stackable', async () => {
      const itemWithStack = {
        ...mockCharacter,
        getInventory: vi.fn(() => ({
          items: [
            {
              name: 'Potions',
              possessed: true,
              type: ItemType.ACTIVE,
              stackable: true,
              quantity: 5,
              id: 'potions',
            },
          ],
        })),
      };

      mockGetState.mockReturnValue({
        characters: {
          'test-character-id': itemWithStack,
        },
      });

      await slice.consumeItem('test-character-id', 0);

      expect(service.removeOneQuantity).toHaveBeenCalled();
    });
  });
});
