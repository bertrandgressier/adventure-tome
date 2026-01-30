import { describe, it, expect } from 'vitest';
import { DamageCalculator } from '@/src/domain/services/combat/DamageCalculator';
import type { CatalogItem } from '@/src/domain/types/items';
import { ItemType } from '@/src/domain/types/items';

describe('DamageCalculator', () => {
  describe('calculateTotalDamageBonus', () => {
    it('should sum weapon damage with passive item bonuses', () => {
      const weaponDamage = 2;
      const items: CatalogItem[] = [
        { id: 'ring', name: 'Anneau', type: ItemType.PASSIVE, tome: 1, statBonus: { damageBonus: 1 } },
        { id: 'amulet', name: 'Amulette', type: ItemType.PASSIVE, tome: 1, statBonus: { damageBonus: 1 } },
      ];

      const total = DamageCalculator.calculateTotalDamageBonus(weaponDamage, items);

      expect(total).toBe(4);
    });

    it('should return weapon damage when no items have bonus', () => {
      const weaponDamage = 2;
      const items: CatalogItem[] = [
        { id: 'ring', name: 'Anneau', type: ItemType.PASSIVE, tome: 1, statBonus: { dexterite: 1 } },
        { id: 'amulet', name: 'Amulette', type: ItemType.PASSIVE, tome: 1, statBonus: { chance: 2 } },
      ];

      const total = DamageCalculator.calculateTotalDamageBonus(weaponDamage, items);

      expect(total).toBe(2);
    });

    it('should return weapon damage when items array is empty', () => {
      const weaponDamage = 2;
      const items: CatalogItem[] = [];

      const total = DamageCalculator.calculateTotalDamageBonus(weaponDamage, items);

      expect(total).toBe(2);
    });

    it('should ignore items with undefined damageBonus', () => {
      const weaponDamage = 2;
      const items: CatalogItem[] = [
        { id: 'ring', name: 'Anneau', type: ItemType.PASSIVE, tome: 1, statBonus: {} },
        { id: 'amulet', name: 'Amulette', type: ItemType.PASSIVE, tome: 1, statBonus: { damageBonus: 1 } },
      ];

      const total = DamageCalculator.calculateTotalDamageBonus(weaponDamage, items);

      expect(total).toBe(3);
    });
  });
});
