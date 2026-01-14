import { describe, it, expect } from 'vitest';
import { DiceRoller, type DiceOverrides } from '@/src/domain/services/combat/DiceRoller';
import type { DiceRoll } from '@/src/domain/types/combatants';

describe('DiceRoller', () => {
  describe('rollHitDice', () => {
    it('should return dice from override when provided', () => {
      const result = DiceRoller.rollHitDice([3, 4]);

      expect(result.dice1).toBe(3);
      expect(result.dice2).toBe(4);
      expect(result.total).toBe(7);
      expect(result.isDouble).toBe(false);
    });

    it('should detect double when override dice are same', () => {
      const result = DiceRoller.rollHitDice([5, 5]);

      expect(result.isDouble).toBe(true);
    });

    it('should generate random dice when no override', () => {
      const result = DiceRoller.rollHitDice();

      expect(result.dice1).toBeGreaterThanOrEqual(1);
      expect(result.dice1).toBeLessThanOrEqual(6);
      expect(result.dice2).toBeGreaterThanOrEqual(1);
      expect(result.dice2).toBeLessThanOrEqual(6);
      expect(result.total).toBe(result.dice1 + result.dice2);
    });
  });

  describe('rollDamageDice', () => {
    it('should return override value when provided', () => {
      const result = DiceRoller.rollDamageDice(5);

      expect(result).toBe(5);
    });

    it('should generate random value when no override', () => {
      const result = DiceRoller.rollDamageDice();

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });
  });

  describe('calculateDamage', () => {
    it('should calculate damage as 1 + dice + weapon', () => {
      const result = DiceRoller.calculateDamage(5, 3);

      expect(result).toBe(9);
    });

    it('should use override damage dice when provided', () => {
      const result = DiceRoller.calculateDamage(5, 5);

      expect(result).toBe(11);
    });

    it('should use random damage dice when no override', () => {
      const result = DiceRoller.calculateDamage(5);

      expect(result).toBeGreaterThanOrEqual(7);
      expect(result).toBeLessThanOrEqual(12);
    });
  });
});
