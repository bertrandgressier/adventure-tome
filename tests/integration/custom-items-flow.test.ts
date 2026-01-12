/**
 * Tests d'intégration pour le flux d'items personnalisés:
 * Store Catalog → Modal → Inventory Slice → Character Service → IndexedDB
 *
 * Vérifie le flux complet de création et ajout d'un item personnalisé
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { CharacterService } from '@/src/application/services/CharacterService';
import { IndexedDBCharacterRepository } from '@/src/infrastructure/repositories/IndexedDBCharacterRepository';
import { ItemType } from '@/src/domain/types/items';
import { createItemsCatalogSlice } from '@/src/presentation/stores/slices/itemsCatalogSlice';
import type { ItemsCatalogSlice } from '@/src/presentation/stores/slices/itemsCatalogSlice';

describe('Integration: Custom Items Flow', () => {
  let service: CharacterService;
  let repository: IndexedDBCharacterRepository;
  let itemsCatalogStore: StoreApi<ItemsCatalogSlice>;

  beforeEach(async () => {
    repository = new IndexedDBCharacterRepository();
    service = new CharacterService(repository);
    itemsCatalogStore = createStore<ItemsCatalogSlice>()((set, get) => createItemsCatalogSlice()(set, get));
  });

  describe('Création d\'item personnalisé via Store', () => {
    it('devrait créer un item personnalisé et le retrouver', () => {
      const state = itemsCatalogStore.getState();

      const customItem = state.createCustomItem({
        name: 'Épée de l\'ombre',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 4,
      });

      expect(customItem.id).toBeDefined();
      expect(customItem.id).toMatch(/^custom-/);

      const retrieved = state.getAllItems().filter(item => item.id.startsWith('custom-')).find(item => item.id === customItem.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Épée de l\'ombre');
    });

    it('devrait créer un item personnalisé complexe', () => {
      const state = itemsCatalogStore.getState();

      const complexItem = {
        name: 'Anneau de temps',
        type: ItemType.SPECIAL,
        tome: 3 as 1 | 2 | 3,
        effect: 'Permet de voyager dans le temps',
        unique: true,
        disappearsOnTimeLoop: false,
        statBonus: { chance: 3 },
      };

      const created = state.createCustomItem(complexItem);

      expect(created.unique).toBe(true);
      expect(created.statBonus).toEqual({ chance: 3 });

      const retrieved = state.getAllItems().filter(item => item.id.startsWith('custom-')).find(item => item.id === created.id);
      expect(retrieved?.effect).toBe('Permet de voyager dans le temps');
    });

    it('devrait conserver les items personnalisés entre les appels', () => {
      const state = itemsCatalogStore.getState();

      const item1 = state.createCustomItem({
        name: 'Premier item',
        type: ItemType.BASIC,
        tome: 1,
      });

      const item2 = state.createCustomItem({
        name: 'Deuxième item',
        type: ItemType.PASSIVE,
        tome: 2,
      });

      const all = state.getAllItems().filter(item => item.id.startsWith('custom-'));
      const retrieved1 = all.find(i => i.id === item1.id);
      const retrieved2 = all.find(i => i.id === item2.id);

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

      const customItem = itemsCatalogStore.getState().createCustomItem({
        name: 'Arme MJ',
        type: ItemType.WEAPON,
        tome: 1,
        attackPoints: 5,
      });

      const itemRef = {
        itemId: customItem.id,
        quantity: 1,
        possessed: true,
      };

      await service.addItemToInventoryWithRef(character.id, itemRef, false, false);

      const updated = await service.getCharacter(character.id);
      const items = updated?.getInventory().items || [];

      const customWeapon = items.find((item) => item.itemId === customItem.id);
      expect(customWeapon).toBeDefined();
      expect(customWeapon?.itemId).toBe(customItem.id);
      expect(customWeapon?.quantity).toBe(1);
      expect(customWeapon?.possessed).toBe(true);
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

      const customPotion = itemsCatalogStore.getState().createCustomItem({
        name: 'Élixir puissant',
        type: ItemType.ACTIVE,
        tome: 2,
        stackable: true,
        healAmount: 10,
      });

      const itemRef = {
        itemId: customPotion.id,
        quantity: 5,
        possessed: true,
      };

      await service.addItemToInventoryWithRef(character.id, itemRef, true, false);

      const updated = await service.getCharacter(character.id);
      const items = updated?.getInventory().items || [];

      const potionItem = items.find((item) => item.itemId === customPotion.id);
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

      const customItem = itemsCatalogStore.getState().createCustomItem({
        name: 'Grimoire ancien',
        type: ItemType.PASSIVE,
        tome: 1,
        effect: '+2 en DEXTÉRITÉ',
        statBonus: { dexterite: 2 },
      });

      const itemRef = {
        itemId: customItem.id,
        quantity: 1,
        possessed: true,
      };

      await service.addItemToInventoryWithRef(character.id, itemRef, false, false);

      const retrieved = await service.getCharacter(character.id);
      const items = retrieved?.getInventory().items || [];

      const grimoire = items.find((item) => item.itemId === customItem.id);
      expect(grimoire).toBeDefined();
      expect(grimoire?.itemId).toBe(customItem.id);
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

      const dungeonKey = itemsCatalogStore.getState().createCustomItem({
        name: 'Clé du donjon',
        type: ItemType.SPECIAL,
        tome: 1,
        unique: true,
        isQuestItem: true,
        effect: 'Ouvre la porte du niveau inférieur',
      });

      const itemRef = {
        itemId: dungeonKey.id,
        quantity: 1,
        possessed: true,
      };

      await service.addItemToInventoryWithRef(character.id, itemRef, false, false);

      const updated = await service.getCharacter(character.id);
      const keyItem = updated?.getInventory().items.find((item) => item.itemId === dungeonKey.id);

      expect(keyItem).toBeDefined();
      expect(keyItem?.quantity).toBe(1);
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

      const missingItem = itemsCatalogStore.getState().createCustomItem({
        name: 'Torche magique',
        type: ItemType.BASIC,
        tome: 1,
        effect: 'S\'éteint jamais',
      });

      const itemRef = {
        itemId: missingItem.id,
        quantity: 1,
        possessed: true,
      };

      await service.addItemToInventoryWithRef(character.id, itemRef, false, false);

      const updated = await service.getCharacter(character.id);
      const torch = updated?.getInventory().items.find((item) => item.itemId === missingItem.id);

      expect(torch).toBeDefined();
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

      const timeItem = itemsCatalogStore.getState().createCustomItem({
        name: 'Parchemin temporel',
        type: ItemType.PASSIVE,
        tome: 3,
        disappearsOnTimeLoop: true,
        effect: 'Contient des souvenirs futurs',
      });

      const itemRef = {
        itemId: timeItem.id,
        quantity: 1,
        possessed: true,
      };

      await service.addItemToInventoryWithRef(character.id, itemRef, false, false);

      const updated = await service.getCharacter(character.id);
      const item = updated?.getInventory().items.find((i) => i.itemId === timeItem.id);

      expect(item).toBeDefined();
    });
  });

  describe('Suppression d\'item personnalisé', () => {
    it('devrait supprimer un item personnalisé du catalogue', () => {
      const state = itemsCatalogStore.getState();

      const item = state.createCustomItem({
        name: 'Item à supprimer',
        type: ItemType.BASIC,
        tome: 1,
      });

      expect(state.getAllItems().filter(i => i.id.startsWith('custom-')).find(i => i.id === item.id)).toBeDefined();

      state.removeCustomItem(item.id);

      expect(state.getAllItems().filter(i => i.id.startsWith('custom-')).find(i => i.id === item.id)).toBeUndefined();
    });

    it('devrait supprimer un item personnalisé sans affecter les autres items', () => {
      const state = itemsCatalogStore.getState();

      const item1 = state.createCustomItem({ name: 'Item 1', type: ItemType.BASIC, tome: 1 });
      const item2 = state.createCustomItem({ name: 'Item 2', type: ItemType.BASIC, tome: 1 });
      const item3 = state.createCustomItem({ name: 'Item 3', type: ItemType.BASIC, tome: 1 });

      state.removeCustomItem(item2.id);

      const all = state.getAllItems().filter(i => i.id.startsWith('custom-'));
      expect(all.find(i => i.id === item1.id)).toBeDefined();
      expect(all.find(i => i.id === item2.id)).toBeUndefined();
      expect(all.find(i => i.id === item3.id)).toBeDefined();
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

      const itemRef = {
        itemId: 'non-existent-custom-id',
        quantity: 1,
        possessed: true,
      };

      await expect(
        service.addItemToInventoryWithRef(character.id, itemRef, false, false)
      ).resolves.not.toThrow();

      const updated = await service.getCharacter(character.id);
      const items = updated?.getInventory().items || [];

      const ghostItem = items.find((item) => item.itemId === 'non-existent-custom-id');
      expect(ghostItem).toBeDefined();
    });
  });
});
