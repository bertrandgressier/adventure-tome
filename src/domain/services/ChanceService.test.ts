import { describe, it, expect } from 'vitest';
import { ChanceService } from './ChanceService';

describe('ChanceService', () => {
  describe('calculateCostToSucceed', () => {
    it('devrait retourner 0 quand le jet est déjà supérieur ou égal à la cible', () => {
      expect(ChanceService.calculateCostToSucceed(5, 5)).toBe(0);
      expect(ChanceService.calculateCostToSucceed(6, 5)).toBe(0);
      expect(ChanceService.calculateCostToSucceed(10, 7)).toBe(0);
    });

    it('devrait retourner la différence quand le jet est inférieur à la cible', () => {
      expect(ChanceService.calculateCostToSucceed(3, 5)).toBe(2);
      expect(ChanceService.calculateCostToSucceed(1, 7)).toBe(6);
      expect(ChanceService.calculateCostToSucceed(4, 6)).toBe(2);
    });

    it('devrait gérer les cas limites', () => {
      expect(ChanceService.calculateCostToSucceed(0, 6)).toBe(6);
      expect(ChanceService.calculateCostToSucceed(1, 1)).toBe(0);
    });
  });

  describe('canSpendChance', () => {
    it('devrait retourner true quand assez de chance disponible', () => {
      expect(ChanceService.canSpendChance(5, 3)).toBe(true);
      expect(ChanceService.canSpendChance(5, 5)).toBe(true);
      expect(ChanceService.canSpendChance(10, 1)).toBe(true);
    });

    it('devrait retourner false quand pas assez de chance', () => {
      expect(ChanceService.canSpendChance(2, 3)).toBe(false);
      expect(ChanceService.canSpendChance(5, 6)).toBe(false);
      expect(ChanceService.canSpendChance(0, 1)).toBe(false);
    });

    it('devrait retourner false pour un coût nul', () => {
      expect(ChanceService.canSpendChance(5, 0)).toBe(false);
      expect(ChanceService.canSpendChance(0, 0)).toBe(false);
    });

    it('devrait gérer les valeurs négatives', () => {
      expect(ChanceService.canSpendChance(5, -1)).toBe(false);
      expect(ChanceService.canSpendChance(-1, 1)).toBe(false);
    });
  });

  describe('applyChanceModifier', () => {
    it('devrait ajouter les points dépensés au jet', () => {
      expect(ChanceService.applyChanceModifier(3, 2)).toBe(5);
      expect(ChanceService.applyChanceModifier(7, 1)).toBe(8);
      expect(ChanceService.applyChanceModifier(1, 6)).toBe(7);
    });

    it('devrait gérer zéro points dépensés', () => {
      expect(ChanceService.applyChanceModifier(5, 0)).toBe(5);
    });
  });

  describe('calculateRemainingChance', () => {
    it('devrait soustraire les points dépensés', () => {
      expect(ChanceService.calculateRemainingChance(5, 2)).toBe(3);
      expect(ChanceService.calculateRemainingChance(10, 5)).toBe(5);
      expect(ChanceService.calculateRemainingChance(7, 1)).toBe(6);
    });

    it('ne devrait pas descendre en dessous de 0', () => {
      expect(ChanceService.calculateRemainingChance(2, 5)).toBe(0);
      expect(ChanceService.calculateRemainingChance(0, 3)).toBe(0);
      expect(ChanceService.calculateRemainingChance(1, 10)).toBe(0);
    });

    it('devrait retourner la même valeur pour zéro points dépensés', () => {
      expect(ChanceService.calculateRemainingChance(5, 0)).toBe(5);
    });
  });

  describe('getSpendingOptions', () => {
    it('devrait retourner un tableau d\'options de dépense', () => {
      expect(ChanceService.getSpendingOptions(5)).toEqual([1, 2, 3, 4, 5]);
      expect(ChanceService.getSpendingOptions(3)).toEqual([1, 2, 3]);
      expect(ChanceService.getSpendingOptions(1)).toEqual([1]);
    });

    it('devrait respecter la limite maxUseful', () => {
      expect(ChanceService.getSpendingOptions(5, 3)).toEqual([1, 2, 3]);
      expect(ChanceService.getSpendingOptions(10, 2)).toEqual([1, 2]);
      expect(ChanceService.getSpendingOptions(5, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('devrait retourner un tableau vide quand aucune chance disponible', () => {
      expect(ChanceService.getSpendingOptions(0)).toEqual([]);
      expect(ChanceService.getSpendingOptions(0, 5)).toEqual([]);
    });

    it('devrait gérer les cas limites', () => {
      expect(ChanceService.getSpendingOptions(10, 0)).toEqual([]);
      expect(ChanceService.getSpendingOptions(1, 10)).toEqual([1]);
    });
  });

  describe('scénarios complets', () => {
    it('devrait gérer le scénario d\'exemple de la règle', () => {
      const chanceInitiale = 5;
      const roll = 3;
      const target = 5;

      const cost = ChanceService.calculateCostToSucceed(roll, target);
      expect(cost).toBe(2);

      expect(ChanceService.canSpendChance(chanceInitiale, cost)).toBe(true);

      const newRoll = ChanceService.applyChanceModifier(roll, cost);
      expect(newRoll).toBe(5);

      const chanceFinale = ChanceService.calculateRemainingChance(chanceInitiale, cost);
      expect(chanceFinale).toBe(3);
    });

    it('devrait gérer un cas où le coût dépasse la chance disponible', () => {
      const chanceInitiale = 2;
      const roll = 3;
      const target = 6;

      const cost = ChanceService.calculateCostToSucceed(roll, target);
      expect(cost).toBe(3);

      expect(ChanceService.canSpendChance(chanceInitiale, cost)).toBe(false);

      const options = ChanceService.getSpendingOptions(chanceInitiale, cost);
      expect(options).toEqual([1, 2]);
    });

    it('devrait gérer la dépense partielle de chance', () => {
      const chanceInitiale = 4;
      const roll = 2;
      const target = 5;

      const cost = ChanceService.calculateCostToSucceed(roll, target);
      expect(cost).toBe(3);

      const chanceFinale = ChanceService.calculateRemainingChance(chanceInitiale, cost);
      expect(chanceFinale).toBe(1);
    });
  });
});
