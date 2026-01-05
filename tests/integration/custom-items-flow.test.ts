/**
 * Tests d'intégration pour le flux d'items personnalisés:
 * Store Catalog → Modal → Inventory Slice → Character Service → IndexedDB
 *
 * Vérifie le flux complet de création et ajout d'un item personnalisé
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterService } from '@/src/application/services/CharacterService';
import { IndexedDBCharacterRepository } from '@/src/infrastructure/repositories/IndexedDBCharacterRepository';
import { ItemType } from '@/src/domain/types/items';
import { useCustomItemsCatalog } from '@/src/presentation/stores/customItemsCatalogStore';

describe('Integration: Custom Items Flow', () => {
  let service: CharacterService;
  let repository: IndexedDBCharacterRepository;

  beforeEach(async () => {
    repository = new IndexedDBCharacterRepository();
    service = new CharacterService(repository);

    useCustomItemsCatalog.setState({ customItems: [] });
  });

  describe('Création d\'item personnalisé via Store', () => {
    it('devrait créer un item personnalisé et le retrouver', () => {
      const { addCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const customItem = addCustomItem({
        name: 'Épée de l\'ombre',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 4,
      });

      expect(customItem.id).toBeDefined();
      expect(customItem.id).toMatch(/^custom-\d+-[a-z0-9]+$/);

      const retrieved = getCustomItemById(customItem.id);
      expect(retrieved).toEqual(customItem);
    });

    it('devrait créer un item personnalisé complexe', () => {
      const { addCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const complexItem = {
        name: 'Anneau de temps',
        type: ItemType.SPECIAL,
        tome: 3 as 1 | 2 | 3,
        effect: 'Permet de voyager dans le temps',
        unique: true,
        disappearsOnTimeLoop: false,
        statBonus: { chance: 3 },
      };

      const created = addCustomItem(complexItem);

      expect(created.unique).toBe(true);
      expect(created.statBonus).toEqual({ chance: 3 });

      const retrieved = getCustomItemById(created.id);
      expect(retrieved?.effect).toBe('Permet de voyager dans le temps');
    });

    it('devrait conserver les items personnalisés entre les appels', () => {
      const { addCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const item1 = addCustomItem({
        name: 'Premier item',
        type: ItemType.BASIC,
        tome: 1,
      });

      const item2 = addCustomItem({
        name: 'Deuxième item',
        type: ItemType.PASSIVE,
        tome: 2,
      });

      const retrieved1 = getCustomItemById(item1.id);
      const retrieved2 = getCustomItemById(item2.id);

      expect(retrieved1?.name).toBe('Premier item');
      expect(retrieved2?.name).toBe('Deuxième item');
    });
  });

  describe('Ajout d\'item personnalisé à un personnage', () => {
    it('devrait ajouter un item custom à un personnage via Service', async () => {
      const character = await service.createCharacter({
        name: 'Héros du jeu de rôle',
        book: 1,
        talent: 'instinct',
        gameMode: 'narrative',
        stats: {
          dexterite: 8,
          chance: 7,
          chanceInitiale: 7,
          pointsDeVieMax: 36,
          pointsDeVieActuels: 36,
        },
      });

      const customItem = useCustomItemsCatalog.getState().addCustomItem({
        name: 'Arme MJ',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 5,
      });

      await service.addItemToInventory(character.id, {
        id: customItem.id,
        name: customItem.name,
        type: customItem.type,
        possessed: true,
        attackPoints: customItem.attackPoints,
      });

      const updated = await service.getCharacter(character.id);
      const items = updated?.getInventory().items || [];

      const customWeapon = items.find((item) => item.id === customItem.id);
      expect(customWeapon).toBeDefined();
      expect(customWeapon?.name).toBe('Arme MJ');
      expect(customWeapon?.attackPoints).toBe(5);
    });

    it('devrait ajouter un item custom stackable avec quantité', async () => {
      const character = await service.createCharacter({
        name: 'Héros alchimiste',
        book: 2,
        talent: 'discretion',
        gameMode: 'narrative',
        stats: {
          dexterite: 6,
          chance: 9,
          chanceInitiale: 9,
          pointsDeVieMax: 30,
          pointsDeVieActuels: 30,
        },
      });

      const customPotion = useCustomItemsCatalog.getState().addCustomItem({
        name: 'Élixir puissant',
        type: ItemType.ACTIVE,
        tome: 2,
        stackable: true,
        healAmount: 10,
      });

      await service.addItemToInventory(character.id, {
        id: customPotion.id,
        name: customPotion.name,
        type: customPotion.type,
        possessed: true,
        stackable: true,
        quantity: 5,
        healAmount: customPotion.healAmount,
      });

      const updated = await service.getCharacter(character.id);
      const items = updated?.getInventory().items || [];

      const potionItem = items.find((item) => item.id === customPotion.id);
      expect(potionItem).toBeDefined();
      expect(potionItem?.quantity).toBe(5);
    });

    it('devrait persister l\'item custom après reload', async () => {
      const character = await service.createCharacter({
        name: 'Héros test persistance',
        book: 1,
        talent: 'instinct',
        gameMode: 'narrative',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const customItem = useCustomItemsCatalog.getState().addCustomItem({
        name: 'Grimoire ancien',
        type: ItemType.PASSIVE,
        tome: 1,
        effect: '+2 en DEXTÉRITÉ',
        statBonus: { dexterite: 2 },
      });

      await service.addItemToInventory(character.id, {
        id: customItem.id,
        name: customItem.name,
        type: customItem.type,
        possessed: true,
        effect: customItem.effect,
        statBonus: customItem.statBonus,
      });

      const retrieved = await service.getCharacter(character.id);
      const items = retrieved?.getInventory().items || [];

      const grimoire = items.find((item) => item.id === customItem.id);
      expect(grimoire).toBeDefined();
      expect(grimoire?.name).toBe('Grimoire ancien');
      expect(grimoire?.statBonus).toEqual({ dexterite: 2 });
    });
  });

  describe('Cas d\'usage métier - Sessions de jeu de rôle', () => {
    it('devrait permettre à un MJ de créer un item pour une aventure personnalisée', async () => {
      const character = await service.createCharacter({
        name: 'Aventurier MJ',
        book: 1,
        talent: 'discretion',
        gameMode: 'narrative',
        stats: {
          dexterite: 9,
          chance: 6,
          chanceInitiale: 6,
          pointsDeVieMax: 40,
          pointsDeVieActuels: 40,
        },
      });

      const dungeonKey = useCustomItemsCatalog.getState().addCustomItem({
        name: 'Clé du donjon',
        type: ItemType.SPECIAL,
        tome: 1,
        unique: true,
        isQuestItem: true,
        effect: 'Ouvre la porte du niveau inférieur',
      });

      await service.addItemToInventory(character.id, {
        id: dungeonKey.id,
        name: dungeonKey.name,
        type: dungeonKey.type,
        possessed: true,
        unique: true,
        isQuestItem: true,
        effect: dungeonKey.effect,
      });

      const updated = await service.getCharacter(character.id);
      const keyItem = updated?.getInventory().items.find((item) => item.id === dungeonKey.id);

      expect(keyItem?.unique).toBe(true);
      expect(keyItem?.isQuestItem).toBe(true);
    });

    it('devrait permettre de créer des items manquants du catalogue', async () => {
      const character = await service.createCharacter({
        name: 'Correction catalogue',
        book: 1,
        talent: 'instinct',
        gameMode: 'narrative',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const missingItem = useCustomItemsCatalog.getState().addCustomItem({
        name: 'Torche magique',
        type: ItemType.BASIC,
        tome: 1,
        effect: 'S\'éteint jamais',
      });

      await service.addItemToInventory(character.id, {
        id: missingItem.id,
        name: missingItem.name,
        type: missingItem.type,
        possessed: true,
        effect: missingItem.effect,
      });

      const updated = await service.getCharacter(character.id);
      const torch = updated?.getInventory().items.find((item) => item.id === missingItem.id);

      expect(torch?.name).toBe('Torche magique');
      expect(torch?.effect).toBe('S\'éteint jamais');
    });

    it('devrait gérer un item qui disparaît lors des resets temporels (Tome 3)', async () => {
      const character = await service.createCharacter({
        name: 'Voyageur temporel',
        book: 3,
        talent: 'instinct',
        gameMode: 'narrative',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const timeItem = useCustomItemsCatalog.getState().addCustomItem({
        name: 'Parchemin temporel',
        type: ItemType.PASSIVE,
        tome: 3,
        disappearsOnTimeLoop: true,
        effect: 'Contient des souvenirs futurs',
      });

      await service.addItemToInventory(character.id, {
        id: timeItem.id,
        name: timeItem.name,
        type: timeItem.type,
        possessed: true,
        disappearsOnTimeLoop: true,
        effect: timeItem.effect,
      });

      const updated = await service.getCharacter(character.id);
      const item = updated?.getInventory().items.find((i) => i.id === timeItem.id);

      expect(item?.disappearsOnTimeLoop).toBe(true);
    });
  });

  describe('Suppression d\'item personnalisé', () => {
    it('devrait supprimer un item personnalisé du catalogue', () => {
      const { addCustomItem, removeCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const item = addCustomItem({
        name: 'Item à supprimer',
        type: ItemType.BASIC,
        tome: 1,
      });

      expect(getCustomItemById(item.id)).toBeDefined();

      removeCustomItem(item.id);

      expect(getCustomItemById(item.id)).toBeUndefined();
    });

    it('devrait supprimer un item personnalisé sans affecter les autres items', () => {
      const { addCustomItem, removeCustomItem, getCustomItemById } = useCustomItemsCatalog.getState();

      const item1 = addCustomItem({ name: 'Item 1', type: ItemType.BASIC, tome: 1 });
      const item2 = addCustomItem({ name: 'Item 2', type: ItemType.BASIC, tome: 1 });
      const item3 = addCustomItem({ name: 'Item 3', type: ItemType.BASIC, tome: 1 });

      removeCustomItem(item2.id);

      expect(getCustomItemById(item1.id)).toBeDefined();
      expect(getCustomItemById(item2.id)).toBeUndefined();
      expect(getCustomItemById(item3.id)).toBeDefined();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer l\'ajout d\'item custom inexistant au personnage', async () => {
      const character = await service.createCharacter({
        name: 'Test erreur',
        book: 1,
        talent: 'instinct',
        gameMode: 'narrative',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      await expect(
        service.addItemToInventory(character.id, {
          id: 'non-existent-custom-id',
          name: 'Fantôme',
          type: ItemType.BASIC,
          possessed: true,
        })
      ).resolves.not.toThrow();

      const updated = await service.getCharacter(character.id);
      const items = updated?.getInventory().items || [];

      const ghostItem = items.find((item) => item.id === 'non-existent-custom-id');
      expect(ghostItem).toBeDefined();
    });
  });
});
