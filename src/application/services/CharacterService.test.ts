import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterService } from './CharacterService';
import { Character } from '@/src/domain/entities/Character';
import { ICharacterRepository } from '@/src/domain/repositories/ICharacterRepository';

// Mock du repository
class MockCharacterRepository implements ICharacterRepository {
  private characters = new Map<string, Character>();

  async save(character: Character): Promise<void> {
    this.characters.set(character.id, character);
  }

  async findById(id: string): Promise<Character | null> {
    return this.characters.get(id) || null;
  }

  async findAll(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async delete(id: string): Promise<void> {
    this.characters.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.characters.has(id);
  }

  // Helper pour les tests
  clear(): void {
    this.characters.clear();
  }
}

describe('CharacterService', () => {
  let repository: MockCharacterRepository;
  let service: CharacterService;

  beforeEach(() => {
    repository = new MockCharacterRepository();
    service = new CharacterService(repository);
  });

  describe('createCharacter()', () => {
    it('devrait créer et sauvegarder un personnage', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      expect(character.name).toBe('Gandalf');
      
      // Vérifier que le personnage est sauvegardé
      const saved = await repository.findById(character.id);
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe('Gandalf');
    });
  });

  describe('getCharacter()', () => {
    it('devrait récupérer un personnage existant', async () => {
      const created = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'simplified',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const retrieved = await service.getCharacter(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });

    it('devrait retourner null pour un ID inexistant', async () => {
      const character = await service.getCharacter('nonexistent-id');
      expect(character).toBeNull();
    });
  });

  describe('getAllCharacters()', () => {
    it('devrait retourner tous les personnages', async () => {
      await service.createCharacter({
        name: 'Gandalf',
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

      await service.createCharacter({
        name: 'Aragorn',
        book: 1,
        talent: 'discretion',
        gameMode: 'mortal',
        stats: {
          dexterite: 8,
          chance: 6,
          chanceInitiale: 6,
          pointsDeVieMax: 36,
          pointsDeVieActuels: 36,
        },
      });

      const all = await service.getAllCharacters();

      expect(all).toHaveLength(2);
    });
  });

  describe('deleteCharacter()', () => {
    it('devrait supprimer un personnage existant', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'simplified',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      await service.deleteCharacter(character.id);

      const deleted = await service.getCharacter(character.id);
      expect(deleted).toBeNull();
    });

    it('devrait lancer une erreur si le personnage n\'existe pas', async () => {
      await expect(service.deleteCharacter('nonexistent-id')).rejects.toThrow(
        'Le personnage avec l\'ID nonexistent-id n\'existe pas'
      );
    });
  });

  describe('updateCharacterName()', () => {
    it('devrait mettre à jour le nom', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const updated = await service.updateCharacterName(character.id, 'Gandalf le Gris');

      expect(updated.name).toBe('Gandalf le Gris');
      
      // Vérifier la persistance
      const saved = await service.getCharacter(character.id);
      expect(saved?.name).toBe('Gandalf le Gris');
    });

    it('devrait lancer une erreur pour un personnage inexistant', async () => {
      await expect(
        service.updateCharacterName('nonexistent-id', 'Nouveau nom')
      ).rejects.toThrow('Le personnage avec l\'ID nonexistent-id n\'existe pas');
    });
  });

  describe('updateCharacterStats()', () => {
    it('devrait mettre à jour les stats', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
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

      const updated = await service.updateCharacterStats(character.id, {
        dexterite: 10,
      });

      expect(updated.getStats().dexterite).toBe(10);
      
      // Vérifier la persistance
      const saved = await service.getCharacter(character.id);
      expect(saved?.getStats().dexterite).toBe(10);
    });
  });

  describe('applyDamage() et healCharacter()', () => {
    it('devrait appliquer des dégâts', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'simplified',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const damaged = await service.applyDamage(character.id, 10);

      expect(damaged.getStats().pointsDeVieActuels).toBe(22);
    });

    it('devrait soigner le personnage', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 20,
        },
      });

      const healed = await service.healCharacter(character.id, 5);

      expect(healed.getStats().pointsDeVieActuels).toBe(25);
    });
  });

  describe('equipWeapon()', () => {
    it('devrait équiper une arme', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
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

      const equipped = await service.equipWeapon(character.id, {
        name: 'Glamdring',
        attackPoints: 5,
      });

      expect(equipped.getInventory().weapon).toEqual({
        name: 'Glamdring',
        attackPoints: 5,
      });
    });
  });

  describe('duplicateCharacter()', () => {
    it('devrait créer une copie du personnage', async () => {
      const original = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'simplified',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const copy = await service.duplicateCharacter(original.id);

      expect(copy.name).toBe('Gandalf (Copie)');
      expect(copy.id).not.toBe(original.id);
      expect(copy.getStats()).toEqual(original.getStats());
      
      // Vérifier que les deux existent
      const all = await service.getAllCharacters();
      expect(all).toHaveLength(2);
    });
  });

  describe('unequipWeapon()', () => {
    it('devrait retirer l\'arme équipée', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      await service.equipWeapon(character.id, {
        name: 'Glamdring',
        attackPoints: 5,
      });

      const unequipped = await service.unequipWeapon(character.id);

      expect(unequipped.getInventory().weapon).toBeUndefined();
    });
  });

  describe('addItemToInventory()', () => {
    it('devrait ajouter un objet à l\'inventaire', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
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

      const updated = await service.addItemToInventory(character.id, {
        name: 'Potion de soin',
        possessed: true,
      });

      const items = updated.getInventory().items;
      expect(items).toHaveLength(2);
      expect(items[0].itemId).toBe('tome1-bourse');
      expect(items[1].itemId).toBeDefined();
    });
  });

  describe('removeItemFromInventory()', () => {
    it('devrait supprimer un objet de l\'inventaire', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      await service.addItemToInventory(character.id, {
        name: 'Potion',
        possessed: true,
      });

      const removed = await service.removeItemFromInventory(character.id, 1);

      expect(removed.getInventory().items).toHaveLength(1);
      expect(removed.getInventory().items[0].itemId).toBe('tome1-bourse');
    });
  });

  describe('addBoulons() et removeBoulons()', () => {
    it('devrait ajouter des boulons', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
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

      const updated = await service.addBoulons(character.id, 10);

      expect(updated.getInventory().boulons).toBe(10);
    });

    it('devrait retirer des boulons', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'simplified',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      await service.addBoulons(character.id, 20);
      const updated = await service.removeBoulons(character.id, 5);

      expect(updated.getInventory().boulons).toBe(15);
    });
  });

  describe('goToParagraph()', () => {
    it('devrait mettre à jour le paragraphe actuel', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
        },
      });

      const updated = await service.goToParagraph(character.id, 42);

      expect(updated.getProgress().currentParagraph).toBe(42);
      expect(updated.getProgress().history).toContain(1);
      expect(updated.getProgress().history).toContain(42);
    });
  });

  describe('updateNotes()', () => {
    it('devrait mettre à jour les notes du personnage', async () => {
      const character = await service.createCharacter({
        name: 'Gandalf',
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

      const updated = await service.updateNotes(character.id, 'Rencontré un dragon');

      expect(updated.notes).toBe('Rencontré un dragon');
    });
  });
});
