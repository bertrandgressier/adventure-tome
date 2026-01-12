import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiceService } from './DiceService';

describe('DiceService', () => {
  describe('roll()', () => {
    it('doit lancer un dé à 6 faces et retourner une valeur entre 1 et 6', () => {
      const result = DiceService.roll(6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('doit lancer plusieurs dés et sommer les résultats', () => {
      const result = DiceService.roll(6, 2);
      expect(result).toBeGreaterThanOrEqual(2); // Minimum 1+1
      expect(result).toBeLessThanOrEqual(12);   // Maximum 6+6
    });

    it('doit fonctionner avec différents nombres de faces', () => {
      const d4 = DiceService.roll(4);
      const d20 = DiceService.roll(20);
      
      expect(d4).toBeGreaterThanOrEqual(1);
      expect(d4).toBeLessThanOrEqual(4);
      expect(d20).toBeGreaterThanOrEqual(1);
      expect(d20).toBeLessThanOrEqual(20);
    });

    it('doit rejeter les valeurs invalides', () => {
      expect(() => DiceService.roll(0)).toThrow('Le dé doit avoir au moins 1 face');
      expect(() => DiceService.roll(-5)).toThrow('Le dé doit avoir au moins 1 face');
      expect(() => DiceService.roll(6, 0)).toThrow('Il faut lancer au moins 1 dé');
      expect(() => DiceService.roll(6, -1)).toThrow('Il faut lancer au moins 1 dé');
    });

    it('doit utiliser Math.random() pour générer les valeurs', () => {
      const spy = vi.spyOn(Math, 'random');
      DiceService.roll(6, 3);
      expect(spy).toHaveBeenCalledTimes(3);
      spy.mockRestore();
    });
  });

  describe('roll1d6()', () => {
    it('doit retourner une valeur entre 1 et 6', () => {
      const result = DiceService.roll1d6();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });
  });

  describe('roll2d6()', () => {
    it('doit retourner une valeur entre 2 et 12', () => {
      const result = DiceService.roll2d6();
      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(12);
    });
  });

  describe('rollMultiple()', () => {
    it('doit retourner un tableau de résultats', () => {
      const results = DiceService.rollMultiple(6, 3);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      });
    });

    it('doit rejeter les valeurs invalides', () => {
      expect(() => DiceService.rollMultiple(0, 3)).toThrow('Le dé doit avoir au moins 1 face');
      expect(() => DiceService.rollMultiple(6, 0)).toThrow('Il faut lancer au moins 1 dé');
    });
  });

  describe('generateCharacterStats()', () => {
    it('doit générer des stats selon les règles du livre', () => {
      const stats = DiceService.generateCharacterStats();
      
      // DEXTÉRITÉ fixe à 7
      expect(stats.dexterite).toBe(7);
      
      // CHANCE entre 1 et 6 (1d6)
      expect(stats.chance).toBeGreaterThanOrEqual(1);
      expect(stats.chance).toBeLessThanOrEqual(6);
      
      // POINTS DE VIE MAX entre 8 et 48 (2d6 × 4)
      expect(stats.pointsDeVieMax).toBeGreaterThanOrEqual(8);  // 2×4
      expect(stats.pointsDeVieMax).toBeLessThanOrEqual(48);    // 12×4
      expect(stats.pointsDeVieMax % 4).toBe(0); // Doit être multiple de 4
    });

    it('doit générer des valeurs différentes à chaque appel', () => {
      const results = Array.from({ length: 100 }, () => DiceService.generateCharacterStats());
      
      const chances = new Set(results.map(r => r.chance));
      const maxHPs = new Set(results.map(r => r.pointsDeVieMax));
      
      expect(chances.size).toBeGreaterThan(1);
      expect(maxHPs.size).toBeGreaterThan(1);
    });
  });

  describe('Déterminisme avec seed', () => {
    let originalRandom: () => number;

    beforeEach(() => {
      originalRandom = Math.random;
    });

    afterEach(() => {
      Math.random = originalRandom;
    });

    it('doit produire des résultats reproductibles avec Math.random mocké', () => {
      // Mock Math.random pour retourner toujours 0.5
      Math.random = vi.fn(() => 0.5);

      const result1 = DiceService.roll(6);
      const result2 = DiceService.roll(6);

      // 0.5 * 6 = 3 → floor(3) + 1 = 4
      expect(result1).toBe(4);
      expect(result2).toBe(4);
    });

    it('doit gérer les valeurs limites de Math.random', () => {
      // Test avec 0 (valeur minimale)
      Math.random = vi.fn(() => 0);
      expect(DiceService.roll(6)).toBe(1);

      // Test avec 0.999... (valeur maximale avant 1)
      Math.random = vi.fn(() => 0.9999);
      expect(DiceService.roll(6)).toBe(6);
    });
  });
});
