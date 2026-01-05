import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCustomItemsCatalog } from './customItemsCatalogStore';
import { ItemType } from '@/src/domain/types/items';

describe('CustomItemsCatalogStore', () => {
  beforeEach(() => {
    useCustomItemsCatalog.setState({ customItems: [] });
  });

  afterEach(() => {
    useCustomItemsCatalog.setState({ customItems: [] });
  });

  describe('État initial', () => {
    it('devrait avoir une liste vide d\'items personnalisés', () => {
      const state = useCustomItemsCatalog.getState();
      expect(state.customItems).toEqual([]);
    });
  });

  describe('addCustomItem()', () => {
    it('devrait ajouter un item personnalisé avec un ID généré', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const result = addCustomItem({
        name: 'Épée légendaire',
        type: ItemType.WEAPON,
        tome: 1,
      });

      expect(result.id).toMatch(/^custom-\d+-[a-z0-9]+$/);
      expect(result.name).toBe('Épée légendaire');
      expect(result.type).toBe(ItemType.WEAPON);
      expect(result.tome).toBe(1);
    });

    it('devrait persister l\'ajout dans le store', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      addCustomItem({
        name: 'Potion magique',
        type: ItemType.ACTIVE,
        tome: 2,
        stackable: true,
      });

      const state = useCustomItemsCatalog.getState();
      expect(state.customItems).toHaveLength(1);
      expect(state.customItems[0].name).toBe('Potion magique');
    });

    it('devrait ajouter plusieurs items personnalisés', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      addCustomItem({
        name: 'Item 1',
        type: ItemType.BASIC,
        tome: 1,
      });

      addCustomItem({
        name: 'Item 2',
        type: ItemType.PASSIVE,
        tome: 1,
      });

      const state = useCustomItemsCatalog.getState();
      expect(state.customItems).toHaveLength(2);
    });

    it('devrait conserver tous les champs d\'un item complet', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const customItem = {
        name: 'Amulette de protection',
        type: ItemType.SPECIAL,
        tome: 3 as 1 | 2 | 3,
        effect: 'Donne +3 en DEXTÉRITÉ',
        stackable: false,
        unique: true,
        disappearsOnTimeLoop: false,
        attackPoints: 0,
        healAmount: 5,
        damageToEnemy: 2,
        statBonus: { dexterite: 3 },
        isQuestItem: false,
      };

      const result = addCustomItem(customItem);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^custom-\d+-[a-z0-9]+$/),
          ...customItem,
        })
      );
    });

    it('devrait générer des IDs uniques pour chaque item', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const item1 = addCustomItem({
        name: 'Item A',
        type: ItemType.BASIC,
        tome: 1,
      });

      const item2 = addCustomItem({
        name: 'Item B',
        type: ItemType.BASIC,
        tome: 1,
      });

      expect(item1.id).not.toBe(item2.id);
    });
  });

  describe('removeCustomItem()', () => {
    it('devrait supprimer un item personnalisé par son ID', () => {
      const { addCustomItem, removeCustomItem } = useCustomItemsCatalog.getState();

      const item1 = addCustomItem({
        name: 'Item à supprimer',
        type: ItemType.BASIC,
        tome: 1,
      });

      const item2 = addCustomItem({
        name: 'Item à conserver',
        type: ItemType.BASIC,
        tome: 1,
      });

      removeCustomItem(item1.id);

      const state = useCustomItemsCatalog.getState();
      expect(state.customItems).toHaveLength(1);
      expect(state.customItems[0].id).toBe(item2.id);
    });

    it('devrait ne rien faire si l\'ID n\'existe pas', () => {
      const { addCustomItem, removeCustomItem } = useCustomItemsCatalog.getState();

      addCustomItem({
        name: 'Item existant',
        type: ItemType.BASIC,
        tome: 1,
      });

      removeCustomItem('non-existent-id');

      const state = useCustomItemsCatalog.getState();
      expect(state.customItems).toHaveLength(1);
    });

    it('devrait supprimer le dernier item restant', () => {
      const { addCustomItem, removeCustomItem } = useCustomItemsCatalog.getState();

      const item = addCustomItem({
        name: 'Item seul',
        type: ItemType.BASIC,
        tome: 1,
      });

      removeCustomItem(item.id);

      const state = useCustomItemsCatalog.getState();
      expect(state.customItems).toEqual([]);
    });
  });

  describe('getCustomItemById()', () => {
    it('devrait retrouver un item personnalisé par son ID', () => {
      const { addCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const created = addCustomItem({
        name: 'Item recherché',
        type: ItemType.PASSIVE,
        tome: 2,
      });

      const found = getCustomItemById(created.id);

      expect(found).toEqual(created);
    });

    it('devrait retourner undefined si l\'ID n\'existe pas', () => {
      const { getCustomItemById } = useCustomItemsCatalog.getState();

      const found = getCustomItemById('non-existent-id');

      expect(found).toBeUndefined();
    });

    it('devrait trouver le bon item parmi plusieurs', () => {
      const { addCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const item1 = addCustomItem({
        name: 'Premier item',
        type: ItemType.BASIC,
        tome: 1,
      });

      addCustomItem({
        name: 'Deuxième item',
        type: ItemType.BASIC,
        tome: 1,
      });

      addCustomItem({
        name: 'Troisième item',
        type: ItemType.BASIC,
        tome: 1,
      });

      const found = getCustomItemById(item1.id);

      expect(found?.name).toBe('Premier item');
      expect(found?.id).toBe(item1.id);
    });
  });

  describe('Cas d\'usage métier - Items personnalisés', () => {
    it('devrait créer une arme personnalisée pour un MJ', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const weapon = addCustomItem({
        name: 'Hache de guerre',
        type: ItemType.WEAPON,
        tome: 1,
        effect: 'Arme puissante',
        attackPoints: 3,
      });

      expect(weapon.type).toBe(ItemType.WEAPON);
      expect(weapon.attackPoints).toBe(3);
      expect(weapon.stackable).toBeUndefined();
    });

    it('devrait créer une potion stackable', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const potion = addCustomItem({
        name: 'Potion de vie',
        type: ItemType.ACTIVE,
        tome: 2,
        stackable: true,
        healAmount: 5,
      });

      expect(potion.type).toBe(ItemType.ACTIVE);
      expect(potion.stackable).toBe(true);
      expect(potion.healAmount).toBe(5);
    });

    it('devrait créer un item spécial unique', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const specialItem = addCustomItem({
        name: 'Anneau magique',
        type: ItemType.SPECIAL,
        tome: 3,
        unique: true,
        statBonus: { chance: 2 },
      });

      expect(specialItem.type).toBe(ItemType.SPECIAL);
      expect(specialItem.unique).toBe(true);
      expect(specialItem.statBonus).toEqual({ chance: 2 });
    });

    it('devrait créer un item qui disparaît lors des resets temporels', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const timeLoopItem = addCustomItem({
        name: 'Parchemin temporel',
        type: ItemType.PASSIVE,
        tome: 3,
        disappearsOnTimeLoop: true,
      });

      expect(timeLoopItem.disappearsOnTimeLoop).toBe(true);
    });

    it('devrait gérer un item sans champs optionnels', () => {
      const { addCustomItem } = useCustomItemsCatalog.getState();

      const basicItem = addCustomItem({
        name: 'Clé rouillée',
        type: ItemType.BASIC,
        tome: 1,
      });

      expect(basicItem.effect).toBeUndefined();
      expect(basicItem.stackable).toBeUndefined();
      expect(basicItem.unique).toBeUndefined();
    });
  });
});
