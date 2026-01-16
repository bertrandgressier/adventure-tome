import { describe, it, expect } from 'vitest';
import {
  getCombatantHealthInfo,
  wouldBeLethal,
  getActionMetadata,
  isEnemy,
} from './combatUIHelpers';

describe('combatUIHelpers', () => {
  describe('getCombatantHealthInfo', () => {
    it('should return normal status for full health', () => {
      const result = getCombatantHealthInfo(20, 20);
      
      expect(result.healthPercent).toBe(100);
      expect(result.status).toBe('normal');
      expect(result.barColorClass).toBe('bg-primary');
      expect(result.textColorClass).toBe('text-primary');
    });

    it('should return normal status for > 25% health', () => {
      const result = getCombatantHealthInfo(15, 20);
      
      expect(result.healthPercent).toBe(75);
      expect(result.status).toBe('normal');
      expect(result.barColorClass).toBe('bg-primary');
      expect(result.textColorClass).toBe('text-primary');
    });

    it('should return critical status for <= 25% health', () => {
      const result = getCombatantHealthInfo(5, 20);
      
      expect(result.healthPercent).toBe(25);
      expect(result.status).toBe('critical');
      expect(result.barColorClass).toBe('bg-orange-500');
      expect(result.textColorClass).toContain('text-orange-500');
    });

    it('should return critical status for 24% health', () => {
      const result = getCombatantHealthInfo(4, 20);
      
      expect(result.healthPercent).toBe(20);
      expect(result.status).toBe('critical');
    });

    it('should return dead status for 0 health', () => {
      const result = getCombatantHealthInfo(0, 20);
      
      expect(result.healthPercent).toBe(0);
      expect(result.status).toBe('dead');
      expect(result.barColorClass).toBe('bg-red-600');
      expect(result.textColorClass).toContain('text-red-600');
    });

    it('should return dead status for negative health', () => {
      const result = getCombatantHealthInfo(-5, 20);
      
      expect(result.healthPercent).toBe(0);
      expect(result.status).toBe('dead');
    });

    it('should handle edge case: exactly 1 HP on 20 max', () => {
      const result = getCombatantHealthInfo(1, 20);
      
      expect(result.healthPercent).toBe(5);
      expect(result.status).toBe('critical');
    });
  });

  describe('wouldBeLethal', () => {
    it('should return false when damage is less than health', () => {
      expect(wouldBeLethal(10, 5)).toBe(false);
    });

    it('should return false when damage equals health minus 1', () => {
      expect(wouldBeLethal(10, 9)).toBe(false);
    });

    it('should return true when damage equals health', () => {
      expect(wouldBeLethal(10, 10)).toBe(true);
    });

    it('should return true when damage exceeds health', () => {
      expect(wouldBeLethal(10, 15)).toBe(true);
    });

    it('should return true when health is 0', () => {
      expect(wouldBeLethal(0, 5)).toBe(true);
    });

    it('should handle edge case: 1 HP and 1 damage', () => {
      expect(wouldBeLethal(1, 1)).toBe(true);
    });

    it('should handle edge case: 1 HP and 0 damage', () => {
      expect(wouldBeLethal(1, 0)).toBe(false);
    });
  });

  describe('getActionMetadata', () => {
    it('should return attack metadata', () => {
      const result = getActionMetadata('attack');
      
      expect(result.label).toBe('Attaquer');
      expect(result.icon).toBe('⚔️');
    });

    it('should return use_item metadata', () => {
      const result = getActionMetadata('use_item');
      
      expect(result.label).toBe('Objet');
      expect(result.icon).toBe('🎒');
    });

    it('should return spend_chance metadata', () => {
      const result = getActionMetadata('spend_chance');
      
      expect(result.label).toBe('CHANCE');
      expect(result.icon).toBe('🍀');
    });

    it('should return weapon_ability metadata', () => {
      const result = getActionMetadata('weapon_ability');
      
      expect(result.label).toBe('Pouvoir');
      expect(result.icon).toBe('✨');
    });

    it('should return flee metadata', () => {
      const result = getActionMetadata('flee');
      
      expect(result.label).toBe('Fuir');
      expect(result.icon).toBe('🏃');
    });

    it('should return reroll metadata', () => {
      const result = getActionMetadata('reroll');
      
      expect(result.label).toBe('Relancer');
      expect(result.icon).toBe('🎲');
    });

    it('should return block metadata', () => {
      const result = getActionMetadata('block');
      
      expect(result.label).toBe('Bloquer');
      expect(result.icon).toBe('🛡️');
    });

    it('should return fallback for unknown action type', () => {
      const result = getActionMetadata('unknown_action');
      
      expect(result.label).toBe('unknown_action');
      expect(result.icon).toBe('?');
    });
  });

  describe('isEnemy', () => {
    it('should return true for enemy combatant with isBoss', () => {
      const enemy = {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 8,
        enduranceMax: 8,
        chance: 0,
        isBoss: false,
        weapon: { id: 'dagger', name: 'Dague', bonus: 1 },
        weaponDamage: 0,
        passiveDamageBonus: 0,
        totalDamageBonus: 0,
      };
      
      expect(isEnemy(enemy)).toBe(true);
    });

    it('should return false for player combatant without isBoss', () => {
      const player = {
        name: 'Hero',
        dexterite: 12,
        endurance: 20,
        enduranceMax: 20,
        chance: 8,
        weapon: { id: 'sword', name: 'Épée', bonus: 2 },
        weaponDamage: 0,
        passiveDamageBonus: 0,
        totalDamageBonus: 0,
      };
      
      expect(isEnemy(player)).toBe(false);
    });
  });
});
