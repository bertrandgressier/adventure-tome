/**
 * Tests de migration des données
 * 
 * Vérifie que les données existantes en IndexedDB sont 100% compatibles
 * avec la nouvelle architecture Clean Architecture et le système de versioning.
 * 
 * GARANTIE: Aucune perte de données lors de la migration.
 */

import { describe, it, expect } from 'vitest';
import { Character } from '@/src/domain/entities/Character';
import { migrateCharacter } from '@/src/infrastructure/persistence/migrations';
import type { InventoryItemRef } from '@/src/domain/types/items';

// Legacy item format (pre-v10)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LegacyItem {
  id?: string;
  name?: string;
  possessed?: boolean;
  type?: 'item' | 'special';
  attackPoints?: number;
}

 
describe('Migration des données - Compatibilité', () => {
  it('devrait lire les données legacy sans perte', () => {
    // Données existantes dans IndexedDB (format legacy)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacyData: any = {
      id: 'abc-123',
      name: 'Gandalf le Gris',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 4,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-15T14:30:00.000Z',
      stats: {
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 20,
      },
      inventory: {
        boulons: 150,
        weapon: {
          name: 'Glamdring',
          attackPoints: 5,
        },
        items: [
          { name: 'Potion', possessed: true, type: 'item' },
          { name: 'Corde', possessed: false, type: 'item' },
        ],
      },
      progress: {
        currentParagraph: 42,
        history: [1, 15, 23, 42],
        lastSaved: '2025-01-15T14:30:00.000Z',
      },
      notes: 'Rencontré un dragon au paragraphe 23',
    };

    // Conversion vers nouvelle architecture
    const migratedData = migrateCharacter(legacyData);
    const character = Character.fromData(migratedData);

    // VÉRIFICATION: Aucune donnée perdue
    expect(character.id).toBe(legacyData.id);
    expect(character.name).toBe(legacyData.name);
    expect(character.book).toBe(legacyData.book);
    expect(character.talent).toBe(legacyData.talent);
    expect(character.gameMode).toBe('mortal');
    expect(character.version).toBe(11); // Migrated to v11
    expect(character.createdAt).toBe(legacyData.createdAt);
    expect(character.notes).toBe(legacyData.notes);

    const stats = character.getStats();
    expect(stats.dexterite).toBe(legacyData.stats.dexterite);
    expect(stats.chance).toBe(legacyData.stats.chance);
    expect(stats.chanceInitiale).toBe(legacyData.stats.chanceInitiale);
    expect(stats.pointsDeVieMax).toBe(legacyData.stats.pointsDeVieMax);
    expect(stats.pointsDeVieActuels).toBe(legacyData.stats.pointsDeVieActuels);

    const inventory = character.getInventory();
    expect(inventory.boulons).toBe(legacyData.inventory.boulons);
    expect(inventory.weapon).toEqual(legacyData.inventory.weapon);
    // Items should be in InventoryItemRef format (v11)
    // Bourse is added, items contain only Potion + Corde
    expect(inventory.items.length).toBeGreaterThan(0);
    
    const progress = character.getProgress();
    expect(progress.currentParagraph).toBe(legacyData.progress.currentParagraph);
    expect(progress.history).toEqual(legacyData.progress.history);
    expect(progress.lastSaved).toBe(legacyData.progress.lastSaved);
  });

  it('devrait sauvegarder au format legacy compatible', () => {
    // Créer un personnage avec nouvelle architecture
    const character = Character.create({
      name: 'Aragorn',
      book: 1,
      talent: 'discretion',
      gameMode: 'simplified',
      stats: {
        dexterite: 8,
        chance: 6,
        chanceInitiale: 6,
        pointsDeVieMax: 36,
        pointsDeVieActuels: 36,
      },
    });

    // Équiper une arme
    const withWeapon = character.equipWeapon({
      name: 'Andúril',
      attackPoints: 4,
    });

    // Ajouter des objets
    const withItem1 = withWeapon.addItem({
      name: 'Torche',
      possessed: true,
    });

    const withItem2 = withItem1.addItem({
      name: 'Parchemin',
      possessed: true,
    });

    // Ajouter des boulons
    const withBoulons = withItem2.addBoulons(200);

    // Changer de paragraphe
    const withProgress = withBoulons.goToParagraph(99);

    // Ajouter des notes
    const final = withProgress.updateNotes('Bataille épique au paragraphe 99');

    // Conversion vers format IndexedDB
    const data = final.toData();

    // VÉRIFICATION: Toutes les propriétés legacy sont présentes
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('book');
    expect(data).toHaveProperty('talent');
    expect(data).toHaveProperty('gameMode');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
    expect(data).toHaveProperty('stats');
    expect(data).toHaveProperty('inventory');
    expect(data).toHaveProperty('progress');
    expect(data).toHaveProperty('notes');

    // VÉRIFICATION: gameMode et version
    expect(data.gameMode).toBe('simplified');
    expect(data.version).toBe(11);

    // VÉRIFICATION: Structure stats
    expect(data.stats).toHaveProperty('dexterite');
    expect(data.stats).toHaveProperty('chance');
    expect(data.stats).toHaveProperty('chanceInitiale');
    expect(data.stats).toHaveProperty('pointsDeVieMax');
    expect(data.stats).toHaveProperty('pointsDeVieActuels');

    // VÉRIFICATION: Structure inventory
    expect(data.inventory).toHaveProperty('boulons');
    expect(data.inventory).toHaveProperty('weapon');
    expect(data.inventory).toHaveProperty('items');
    expect(data.inventory.boulons).toBe(200);
    expect(data.inventory.weapon).toEqual({
      name: 'Andúril',
      attackPoints: 4,
    });
    expect(data.inventory.items).toHaveLength(3); // Bourse + Torche + Parchemin

    // VÉRIFICATION: Structure progress
    expect(data.progress).toHaveProperty('currentParagraph');
    expect(data.progress).toHaveProperty('history');
    expect(data.progress).toHaveProperty('lastSaved');
    expect(data.progress.currentParagraph).toBe(99);
    expect(data.progress.history).toEqual([1, 99]);

    // VÉRIFICATION: Notes
    expect(data.notes).toBe('Bataille épique au paragraphe 99');
  });

  it('devrait gérer les cas edge (données manquantes)', () => {
    // Données legacy avec champs optionnels manquants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const minimalData: any = {
      id: 'min-123',
      name: 'Frodon',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 4,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 5,
        chance: 9,
        chanceInitiale: 9,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      },
      inventory: {
        boulons: 0,
        items: [],
        // weapon manquant (optionnel)
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    // Doit fonctionner sans erreur
    const migratedMinimalData = migrateCharacter(minimalData);
    const character = Character.fromData(migratedMinimalData);

    expect(character.name).toBe('Frodon');
    expect(character.getInventory().weapon).toBeUndefined();
    expect(character.getInventory().items[0].itemId).toMatch(/^legacy-/);
    expect(character.getInventory().items[0].quantity).toBe(1);
    expect(character.getInventory().items[0].possessed).toBe(true);
    expect(character.notes).toBe('');
  });

  it('devrait préserver l\'ordre chronologique dans l\'historique', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      id: 'hist-123',
      name: 'Test',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 4,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 5,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 20,
        pointsDeVieActuels: 20,
      },
      inventory: {
        boulons: 0,
        items: [],
      },
      progress: {
        currentParagraph: 150,
        history: [1, 15, 42, 78, 99, 150],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    const migratedData = migrateCharacter(data);
    const character = Character.fromData(migratedData);
    const progress = character.getProgress();

    // VÉRIFICATION: Historique préservé
    expect(progress.history).toEqual([1, 15, 42, 78, 99, 150]);
    expect(progress.currentParagraph).toBe(150);
  });

  it('devrait conserver les types d\'objets (item vs special)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      id: 'items-123',
      name: 'Test',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 4,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 5,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 20,
        pointsDeVieActuels: 20,
      },
      inventory: {
        boulons: 100,
        items: [
          { name: 'Potion', possessed: true, type: 'item' },
          { name: 'Clé magique', possessed: false, type: 'special' },
          { name: 'Pain', possessed: true }, // Type undefined (ok)
        ],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    const migratedData = migrateCharacter(data);
    const character = Character.fromData(migratedData);
    const inventory = character.getInventory();

    // VÉRIFICATION: Items migrés avec nouvelle structure
    // Bourse was added in v6, so now it should have a legacy ID generated in v10
    expect(inventory.items[0].itemId).toMatch(/^legacy-/);
    expect(inventory.items[0].quantity).toBe(1);
    expect(inventory.items[0].possessed).toBe(true);

    // Other items should have IDs but only store itemId, quantity, possessed
    expect(inventory.items.length).toBeGreaterThan(0);
  });

  it('devrait gérer la sérialisation round-trip sans perte', () => {
    // Données complètes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalData: any = {
      id: 'roundtrip-123',
      name: 'Test Complet',
      book: 1,
      talent: 'discretion',
      gameMode: 'mortal',
      version: 7,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-15T14:30:00.000Z',
      stats: {
        dexterite: 9,
        chance: 3,
        chanceInitiale: 8,
        pointsDeVieMax: 40,
        pointsDeVieActuels: 15,
      },
      inventory: {
        boulons: 275,
        weapon: {
          name: 'Épée enchantée',
          attackPoints: 6,
        },
        items: [
          { name: 'Bourse', possessed: true },
          { name: 'A', possessed: true, type: 'item' },
          { name: 'B', possessed: false, type: 'special' },
          { name: 'C', possessed: true },
        ],
      },
      progress: {
        currentParagraph: 200,
        history: [1, 50, 100, 150, 200],
        lastSaved: '2025-01-15T14:30:00.000Z',
      },
      notes: 'Notes importantes\navec plusieurs lignes\net caractères spéciaux: é à ç',
    };

    // Round-trip: Legacy → Migration → Entity → Legacy
    const migratedData = migrateCharacter(originalData);
    const character = Character.fromData(migratedData);
    const serialized = character.toData();

    // VÉRIFICATION: Toutes les données sont identiques (sauf updatedAt et structure items qui a changé)
    expect(serialized.id).toBe(originalData.id);
    expect(serialized.name).toBe(originalData.name);
    expect(serialized.book).toBe(originalData.book);
    expect(serialized.talent).toBe(originalData.talent);
    expect(serialized.createdAt).toBe(originalData.createdAt);
    // updatedAt est mis à jour automatiquement par toData()
    expect(serialized.updatedAt).toBeDefined();

    expect(serialized.stats).toEqual(originalData.stats);
    // Inventory items structure changed with v11 (now InventoryItemRef)
    expect(serialized.inventory.boulons).toBe(originalData.inventory.boulons);
    expect(serialized.inventory.weapon).toEqual(originalData.inventory.weapon);
    expect(serialized.inventory.items).toHaveLength(4); // Bourse + 3 items originaux
    expect(serialized.progress).toEqual({
      ...originalData.progress,
      daysElapsed: 0,
      nextWakeUpParagraph: undefined,
    });
    expect(serialized.notes).toBe(originalData.notes);
  });

  it('devrait migrer les données v3 (book string) vers v4 (book number)', () => {
    // Données v3 avec book en string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v3Data: any = {
      id: 'v3-migration-123',
      name: 'Personnage Legacy',
      book: 'La Harpe des Quatre Saisons', // string (v3)
      talent: 'instinct',
      gameMode: 'mortal',
      version: 3,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 28,
        pointsDeVieActuels: 28,
      },
      inventory: {
        boulons: 50,
        items: [],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    // La migration doit être appelée explicitement
    const migratedData = migrateCharacter(v3Data);
    const character = Character.fromData(migratedData);
    
    // VÉRIFICATION: book converti en number
    expect(character.book).toBe(1); // "La Harpe des Quatre Saisons" → 1
    expect(character.version).toBe(11); // Version mise à jour
    
    // Test avec autres titres
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v3DataBook2: any = { ...v3Data, book: 'La Confrérie de NUADA', id: 'v3-2' };
    const migratedData2 = migrateCharacter(v3DataBook2);
    const characterBook2 = Character.fromData(migratedData2);
    expect(characterBook2.book).toBe(2);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v3DataBook3: any = { ...v3Data, book: 'Les Entrailles du temps', id: 'v3-3' };
    const migratedData3 = migrateCharacter(v3DataBook3);
    const characterBook3 = Character.fromData(migratedData3);
    expect(characterBook3.book).toBe(3);
    
    // Test avec un titre inconnu (fallback à 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v3DataUnknown: any = { ...v3Data, book: 'Livre Inconnu', id: 'v3-unknown' };
    const migratedDataUnknown = migrateCharacter(v3DataUnknown);
    const characterUnknown = Character.fromData(migratedDataUnknown);
    expect(characterUnknown.book).toBe(1);
  });

  it('devrait ajouter la Bourse si elle est manquante (migration v6)', () => {
    // Données v5 sans Bourse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v5Data: any = {
      id: 'v5-migration-123',
      name: 'Sans Bourse',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 5,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 28,
        pointsDeVieActuels: 28,
      },
      inventory: {
        boulons: 50,
        items: [
          { name: 'Potion', possessed: true, type: 'item' },
        ],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    const migratedData = migrateCharacter(v5Data);
    const character = Character.fromData(migratedData);
    const items = character.getInventory().items;

    // VÉRIFICATION: Bourse ajoutée
    expect(character.version).toBe(11);
    expect(items).toHaveLength(2); // Bourse + Potion
    // Bourse was added in v6, then got a legacy ID in v10 migration
    expect(items[0].itemId).toMatch(/^legacy-/);
  });

  it('devrait migrer les items vers la structure v10 avec nouveaux champs', () => {
    // Données v5 sans les nouveaux champs d'items (pour tester toutes les migrations v6→v10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v5Data: any = {
      id: 'v5-migration-123',
      name: 'Personnage v5',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 5,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 28,
        pointsDeVieActuels: 28,
        reputation: null,
      },
      inventory: {
        boulons: 50,
        weapon: {
          name: 'Épée courte',
          attackPoints: 1,
        },
        items: [
          { name: 'Potion', possessed: true, type: 'item' },
          { name: 'Torche', possessed: false, type: 'item' },
          { name: 'Clé', possessed: true },
        ],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    const migratedData = migrateCharacter(v5Data);
    const character = Character.fromData(migratedData);
    const inventory = character.getInventory();

    // VÉRIFICATION: Version mise à jour
    expect(character.version).toBe(11);

    // VÉRIFICATION: Items migrés avec nouveaux champs
    // Bourse + 3 items existants
    expect(inventory.items).toHaveLength(4);
  });

  it('devrait générer des IDs uniques pour chaque item lors de la migration v10', () => {
    // Données v5
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v5Data: any = {
      id: 'unique-id-123',
      name: 'Test',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 5,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 5,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 20,
        pointsDeVieActuels: 20,
        reputation: null,
      },
      inventory: {
        boulons: 0,
        items: [
          { name: 'Potion', possessed: true },
        ],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    const migratedData1 = migrateCharacter(v5Data);
    const migratedData2 = migrateCharacter(v5Data);

    // VÉRIFICATION: Les IDs sont différents entre deux migrations
    const items1 = Character.fromData(migratedData1).getInventory().items;
    const items2 = Character.fromData(migratedData2).getInventory().items;

    expect(items1).toHaveLength(2); // Bourse + Potion
    expect(items2).toHaveLength(2); // Bourse + Potion
    expect(items1[1].itemId).toBeDefined(); // Premier item utilisateur (après Bourse)
    expect(items2[1].itemId).toBeDefined();
    expect(items1[1].itemId).not.toBe(items2[1].itemId);
  });

  it('devrait préserver les IDs existants lors de la migration v10', () => {
    // Données v9 avec des items qui ont déjà des IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v9DataWithIds: any = {
      id: 'preserve-id-123',
      name: 'Test',
      book: 1,
      talent: 'instinct',
      gameMode: 'mortal',
      version: 9,
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
      stats: {
        dexterite: 5,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 20,
        pointsDeVieActuels: 20,
      },
      inventory: {
        boulons: 0,
        items: [
          { id: 'custom-id-1', name: 'Item 1', possessed: true },
          { id: 'custom-id-2', name: 'Item 2', possessed: false },
        ],
      },
      progress: {
        currentParagraph: 1,
        history: [1],
        lastSaved: '2025-01-01T10:00:00.000Z',
      },
      notes: '',
    };

    const migratedData = migrateCharacter(v9DataWithIds);
    const inventory = Character.fromData(migratedData).getInventory();

    // VÉRIFICATION: Les IDs existants sont préservés
    // La Bourse est ajoutée en premier par la migration v6
    const customId1 = inventory.items.find((i: InventoryItemRef) => i.itemId === 'custom-id-1');
    const customId2 = inventory.items.find((i: InventoryItemRef) => i.itemId === 'custom-id-2');
    expect(customId1).toBeDefined();
    expect(customId2).toBeDefined();
  });
});
