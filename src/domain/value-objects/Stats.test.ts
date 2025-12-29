import { describe, it, expect } from 'vitest';
import { Stats } from './Stats';

describe('Stats', () => {
  describe('Construction et validation', () => {
    it('devrait créer des stats valides', () => {
      const stats = new Stats(7, null, null, 6, 6, 32, 32);
      
      expect(stats.dexterite).toBe(7);
      expect(stats.constitution).toBe(null);
      expect(stats.reputation).toBe(null);
      expect(stats.chance).toBe(6);
      expect(stats.chanceInitiale).toBe(6);
      expect(stats.maxHealth).toBe(32);
      expect(stats.currentHealth).toBe(32);
    });

    it('devrait rejeter une dextérité < 1', () => {
      expect(() => new Stats(0, null, null, 5, 5, 20, 20))
        .toThrow('La dextérité doit être supérieure ou égale à 1');
    });

    it('devrait rejeter une chance négative', () => {
      expect(() => new Stats(7, null, null, -1, 5, 20, 20))
        .toThrow('La chance doit être supérieure ou égale à 0');
    });

    it('devrait rejeter des PV max < 1', () => {
      expect(() => new Stats(7, null, null, 5, 5, 0, 0))
        .toThrow('Les points de vie maximum doivent être supérieurs ou égaux à 1');
    });

    it('devrait rejeter des PV actuels négatifs', () => {
      expect(() => new Stats(7, null, null, 5, 5, 20, -1))
        .toThrow('Les points de vie actuels doivent être supérieurs ou égaux à 0');
    });

    it('devrait rejeter des PV actuels > PV max', () => {
      expect(() => new Stats(7, null, null, 5, 5, 20, 25))
        .toThrow('Les points de vie actuels ne peuvent pas dépasser le maximum');
    });

    it('devrait rejeter une réputation hors bornes', () => {
      expect(() => new Stats(7, null, -6, 5, 5, 20, 20))
        .toThrow('La réputation doit être comprise entre -5 et 5');
      expect(() => new Stats(7, null, 6, 5, 5, 20, 20))
        .toThrow('La réputation doit être comprise entre -5 et 5');
    });
  });

  describe('update()', () => {
    it('devrait mettre à jour la dextérité', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 20);
      const updated = stats.update({ dexterite: 10 });
      
      expect(updated.dexterite).toBe(10);
      expect(updated.chance).toBe(5); // Autres propriétés inchangées
      expect(stats.dexterite).toBe(7); // Original inchangé (immutable)
    });

    it('devrait mettre à jour plusieurs stats', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 20);
      const updated = stats.update({
        dexterite: 10,
        chance: 3,
        pointsDeVieActuels: 15
      });
      
      expect(updated.dexterite).toBe(10);
      expect(updated.chance).toBe(3);
      expect(updated.currentHealth).toBe(15);
    });

    it('devrait ajuster la vie actuelle si maxHealth diminue en dessous (issue #14)', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 15);
      const updated = stats.update({ pointsDeVieMax: 10 });
      
      expect(updated.maxHealth).toBe(10);
      expect(updated.currentHealth).toBe(10);
    });

    it('devrait conserver la vie actuelle si maxHealth augmente', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 15);
      const updated = stats.update({ pointsDeVieMax: 30 });
      
      expect(updated.maxHealth).toBe(30);
      expect(updated.currentHealth).toBe(15);
    });

    it('devrait respecter la vie actuelle explicitement fournie', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 15);
      const updated = stats.update({ pointsDeVieMax: 10, pointsDeVieActuels: 8 });
      
      expect(updated.maxHealth).toBe(10);
      expect(updated.currentHealth).toBe(8);
    });

    it('devrait valider les nouvelles stats', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 20);
      
      expect(() => stats.update({ dexterite: -1 }))
        .toThrow('La dextérité doit être supérieure ou égale à 1');
    });
  });

  describe('decreaseChance()', () => {
    it('devrait diminuer la chance de 1', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 20);
      const updated = stats.decreaseChance();
      
      expect(updated.chance).toBe(4);
      expect(stats.chance).toBe(5); // Original inchangé
    });

    it('ne devrait pas descendre en dessous de 0', () => {
      const stats = new Stats(7, null, null, 0, 5, 20, 20);
      const updated = stats.decreaseChance();
      
      expect(updated.chance).toBe(0);
    });
  });

  describe('takeDamage()', () => {
    it('devrait réduire les PV du montant des dégâts', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 20);
      const updated = stats.takeDamage(5);
      
      expect(updated.currentHealth).toBe(15);
      expect(stats.currentHealth).toBe(20); // Original inchangé
    });

    it('ne devrait pas descendre en dessous de 0', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 5);
      const updated = stats.takeDamage(10);
      
      expect(updated.currentHealth).toBe(0);
    });

    it('devrait rejeter des dégâts négatifs', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 20);
      
      expect(() => stats.takeDamage(-5))
        .toThrow('Les dégâts ne peuvent pas être négatifs');
    });
  });

  describe('heal()', () => {
    it('devrait augmenter les PV', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 10);
      const updated = stats.heal(5);
      
      expect(updated.currentHealth).toBe(15);
    });

    it('ne devrait pas dépasser les PV max', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 15);
      const updated = stats.heal(10);
      
      expect(updated.currentHealth).toBe(20);
    });

    it('devrait rejeter un montant négatif', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 10);
      
      expect(() => stats.heal(-5))
        .toThrow('La quantité de soin ne peut pas être négative');
    });
  });

  describe('isDead()', () => {
    it('devrait retourner true si PV = 0', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 0);
      expect(stats.isDead()).toBe(true);
    });

    it('devrait retourner false si PV > 0', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 1);
      expect(stats.isDead()).toBe(false);
    });
  });

  describe('isCriticalHealth()', () => {
    it('devrait retourner true si PV <= 25% du max', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 5);
      expect(stats.isCriticalHealth()).toBe(true);
    });

    it('devrait retourner false si PV > 25% du max', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 6);
      expect(stats.isCriticalHealth()).toBe(false);
    });

    it('devrait retourner false si le personnage est mort', () => {
      const stats = new Stats(7, null, null, 5, 5, 20, 0);
      expect(stats.isCriticalHealth()).toBe(false);
    });
  });

  describe('toData() et fromData()', () => {
    it('devrait convertir en données et reconstruire', () => {
      const original = new Stats(7, null, null, 5, 5, 20, 15);
      const data = original.toData();
      const reconstructed = Stats.fromData(data);
      
      expect(reconstructed.dexterite).toBe(7);
      expect(reconstructed.constitution).toBe(null);
      expect(reconstructed.reputation).toBe(null);
      expect(reconstructed.chance).toBe(5);
      expect(reconstructed.chanceInitiale).toBe(5);
      expect(reconstructed.maxHealth).toBe(20);
      expect(reconstructed.currentHealth).toBe(15);
    });
  });
});
