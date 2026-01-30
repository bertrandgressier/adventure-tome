import { describe, it, expect } from 'vitest';
import { Character } from './Character';
import { ItemType } from '../types/items';

describe('Character', () => {
  describe('create()', () => {
    it('devrait créer un nouveau personnage', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      expect(character.name).toBe('Aragorn');
      expect(character.book).toBe(1);
      expect(character.talentId).toBe('instinct');
      expect(character.talentLevel).toBe(1);
      expect(character.gameMode).toBe('mortal');
      expect(character.id).toBeTruthy();
      expect(character.createdAt).toBeTruthy();
    });

    it('devrait trimmer le nom', () => {
      const character = Character.create({
        name: '  Aragorn  ',
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

      expect(character.name).toBe('Aragorn');
    });

    it('devrait rejeter un nom vide', () => {
      expect(() =>
        Character.create({
          name: '   ',
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
        })
      ).toThrow('Le nom du personnage ne peut pas être vide');
    });
  });

  describe('updateName()', () => {
    it('devrait mettre à jour le nom', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const updated = character.updateName('Legolas');

      expect(updated.name).toBe('Legolas');
      expect(character.name).toBe('Aragorn'); // Original inchangé
    });

    it('devrait rejeter un nom vide', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      expect(() => character.updateName('   ')).toThrow(
        'Le nom du personnage ne peut pas être vide'
      );
    });
  });

  describe('updateStats()', () => {
    it('devrait mettre à jour les stats', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const updated = character.updateStats({ dexterite: 10 });

      expect(updated.getStats().dexterite).toBe(10);
      expect(character.getStats().dexterite).toBe(7); // Original inchangé
    });
  });

  describe('takeDamage() et heal()', () => {
    it('devrait appliquer des dégâts', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const damaged = character.takeDamage(10);

      expect(damaged.getStats().pointsDeVieActuels).toBe(22);
    });

    it('devrait soigner le personnage', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const healed = character.heal(5);

      expect(healed.getStats().pointsDeVieActuels).toBe(25);
    });
  });

  describe('equipWeapon() et unequipWeapon()', () => {
    it('devrait équiper une arme', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const equipped = character.equipWeapon({
        name: 'Épée longue',
        attackPoints: 3,
      });

      expect(equipped.getInventory().weapon).toEqual({
        name: 'Épée longue',
        attackPoints: 3,
      });
    });

    it('devrait retirer l\'arme équipée', () => {
      const character = Character.create({
        name: 'Aragorn',
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
      }).equipWeapon({ name: 'Épée longue', attackPoints: 3 });

      const unequipped = character.unequipWeapon();

      expect(unequipped.getInventory().weapon).toBeUndefined();
    });
  });

  describe('addItem() et removeItem()', () => {
    it('devrait ajouter un objet', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const withItem = character.addItem({
        name: 'Potion de soin',
        possessed: true,
        type: ItemType.BASIC,
      });

      expect(withItem.getInventory().items).toHaveLength(2);
      expect(withItem.getInventory().items[1].itemId).toMatch(/^legacy-/);
      expect(withItem.getInventory().items[1].quantity).toBe(1);
      expect(withItem.getInventory().items[1].possessed).toBe(true);
    });

    it('devrait retirer un objet', () => {
      const character = Character.create({
        name: 'Aragorn',
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
      })
        .addItem({ name: 'Potion de soin', possessed: true })
        .addItem({ name: 'Corde', possessed: true });

      const removed = character.removeItem(1);

      expect(removed.getInventory().items).toHaveLength(2);
      expect(removed.getInventory().items[1].itemId).toMatch(/^legacy-/);
    });

    it('devrait empêcher d\'ajouter un objet non-stackable déjà présent', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const withItem = character.addItem({
        id: 'test-item',
        name: 'Clé mystérieuse',
        possessed: true,
        type: ItemType.BASIC,
        stackable: false,
      });

      expect(() => {
        withItem.addItem({
          id: 'test-item',
          name: 'Clé mystérieuse',
          possessed: true,
          type: ItemType.BASIC,
          stackable: false,
        });
      }).toThrow('Clé mystérieuse est déjà dans l\'inventaire');
    });

    it('devrait empêcher d\'ajouter un item unique déjà présent', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const withItem = character.addItem({
        id: 'unique-item',
        name: 'Bague de la 2ème chance',
        possessed: true,
        type: ItemType.SPECIAL,
        unique: true,
      });

      expect(() => {
        withItem.addItem({
          id: 'unique-item',
          name: 'Bague de la 2ème chance',
          possessed: true,
          type: ItemType.SPECIAL,
          unique: true,
        });
      }).toThrow('Bague de la 2ème chance est déjà dans l\'inventaire');
    });

    it('devrait augmenter la quantité d\'un item stackable déjà présent', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const withPotion = character.addItem({
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        possessed: true,
        type: ItemType.ACTIVE,
        stackable: true,
        quantity: 3,
      });

      const withMorePotions = withPotion.addItem({
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        possessed: true,
        type: ItemType.ACTIVE,
        stackable: true,
        quantity: 2,
      });

      const items = withMorePotions.getInventory().items;
      const potion = items.find((i) => i.itemId === 'tome1-potion-soin');

      expect(items).toHaveLength(2);
      expect(potion?.quantity).toBe(5);
    });
  });

  describe('addBoulons() et removeBoulons()', () => {
    it('devrait ajouter des boulons', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const withMoney = character.addBoulons(50);

      expect(withMoney.getInventory().boulons).toBe(50);
    });

    it('devrait retirer des boulons', () => {
      const character = Character.create({
        name: 'Aragorn',
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
      }).addBoulons(50);

      const afterPurchase = character.removeBoulons(20);

      expect(afterPurchase.getInventory().boulons).toBe(30);
    });
  });

  describe('goToParagraph()', () => {
    it('devrait changer le paragraphe actuel', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const updated = character.goToParagraph(42);

      expect(updated.getProgress().currentParagraph).toBe(42);
      expect(updated.getProgress().history).toContain(42);
    });
  });

  describe('isDead() et isCriticalHealth()', () => {
    it('devrait détecter un personnage mort', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 0,
        },
      });

      expect(character.isDead()).toBe(true);
    });

    it('devrait détecter une santé critique', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 1,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 5,
        },
      });

      expect(character.isCriticalHealth()).toBe(true);
    });
  });

  describe('toData() et fromData()', () => {
    it('devrait sérialiser et désérialiser correctement', () => {
      const original = Character.create({
        name: 'Aragorn',
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

      const data = original.toData();
      const reconstructed = Character.fromData(data);

      expect(reconstructed.name).toBe(original.name);
      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.getStats()).toEqual(original.getStats());
    });

    it('devrait ajouter updatedAt lors de la sérialisation', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      const data = character.toData();

      expect(data.updatedAt).toBeTruthy();
      expect(new Date(data.updatedAt).getTime()).toBeGreaterThan(0);
    });
  });

  describe('updateTalentLevel() et updateSecondTalentLevel()', () => {
    it('devrait mettre à jour le niveau du talent principal', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 3,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
          experience: 0,
        },
      });

      const updated = character.updateTalentLevel(2);

      expect(updated.talentLevel).toBe(2);
      expect(updated.talentId).toBe('instinct');
      expect(character.talentLevel).toBe(1);
    });

    it('devrait rejeter un niveau inférieur à 1 pour le talent principal', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 3,
        talent: 'instinct',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
          experience: 0,
        },
      });

      expect(() => character.updateTalentLevel(0)).toThrow('Le niveau du talent doit être >= 1');
      expect(() => character.updateTalentLevel(-1)).toThrow('Le niveau du talent doit être >= 1');
    });

    it('devrait mettre à jour le niveau du second talent', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 3,
        talent: 'instinct',
        secondTalent: 'discretion',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
          experience: 0,
        },
      });

      const updated = character.updateSecondTalentLevel(3);

      expect(updated.secondTalentLevel).toBe(3);
      expect(updated.secondTalentId).toBe('discretion');
      expect(character.secondTalentLevel).toBe(1);
    });

    it('devrait rejeter un niveau inférieur à 1 pour le second talent', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 3,
        talent: 'instinct',
        secondTalent: 'discretion',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
          experience: 0,
        },
      });

      expect(() => character.updateSecondTalentLevel(0)).toThrow('Le niveau du talent doit être >= 1');
      expect(() => character.updateSecondTalentLevel(-1)).toThrow('Le niveau du talent doit être >= 1');
    });

    it('devrait rejeter la mise à jour du niveau si pas de second talent', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 2,
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

      expect(() => character.updateSecondTalentLevel(2)).toThrow('Pas de second talent');
    });

    it('devrait initialiser le niveau à 1 par défaut', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 3,
        talent: 'instinct',
        secondTalent: 'discretion',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
          experience: 0,
        },
      });

      expect(character.talentLevel).toBe(1);
      expect(character.secondTalentLevel).toBe(1);
    });
  });

  describe('Talent getters', () => {
    it('devrait retourner les IDs et niveaux des talents', () => {
      const character = Character.create({
        name: 'Aragorn',
        book: 3,
        talent: 'instinct',
        secondTalent: 'discretion',
        gameMode: 'mortal',
        stats: {
          dexterite: 7,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 32,
          pointsDeVieActuels: 32,
          experience: 0,
        },
      });

      expect(character.talentId).toBe('instinct');
      expect(character.talentLevel).toBe(1);
      expect(character.secondTalentId).toBe('discretion');
      expect(character.secondTalentLevel).toBe(1);
    });

    it('devrait retourner undefined pour secondTalentId et secondTalentLevel si pas de second talent', () => {
      const character = Character.create({
        name: 'Aragorn',
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

      expect(character.talentId).toBe('instinct');
      expect(character.talentLevel).toBe(1);
      expect(character.secondTalentId).toBeUndefined();
      expect(character.secondTalentLevel).toBeUndefined();
    });
  });
});
