import { describe, it, expect } from 'vitest';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';
import { ItemType } from '@/src/domain/types/items';
import { WeaponAbilityTrigger } from '@/src/domain/types/WeaponAbilityTrigger';

describe('Items Catalog - Legendary Weapons', () => {
  const legendaryWeapons = ITEMS_CATALOG.filter(item => item.isLegendary);

  it('should contain exactly 5 legendary weapons', () => {
    expect(legendaryWeapons).toHaveLength(5);
  });

  it('should have all required fields for legendary weapons', () => {
    for (const weapon of legendaryWeapons) {
      expect(weapon.id).toBeDefined();
      expect(weapon.name).toBeDefined();
      expect(weapon.type).toBe(ItemType.WEAPON);
      expect(weapon.tome).toBe(3);
      expect(weapon.attackPoints).toBeGreaterThanOrEqual(1);
      expect(weapon.isLegendary).toBe(true);
      expect(weapon.abilities).toBeDefined();
      expect(weapon.abilities!.length).toBeGreaterThan(0);
    }
  });

  describe('Lame de l\'Aube Éternelle', () => {
    const lame = ITEMS_CATALOG.find(item => item.id === 'tome3-lame-aube-eternelle');

    it('should exist in catalog', () => {
      expect(lame).toBeDefined();
    });

    it('should have +2 attack points', () => {
      expect(lame?.attackPoints).toBe(2);
    });

    it('should have ON_DOUBLE ability trigger as constant', () => {
      expect(lame?.abilities).toHaveLength(1);
      expect(lame?.abilities![0].trigger).toBe(WeaponAbilityTrigger.ON_DOUBLE);
      expect(lame?.abilities![0].effect.type).toBe('extra_attack');
    });

    it('should have ability id lame-aube-extra-attack', () => {
      expect(lame?.abilities![0].id).toBe('lame-aube-extra-attack');
    });
  });

  describe('Marteau de la Terre', () => {
    const marteau = ITEMS_CATALOG.find(item => item.id === 'tome3-marteau-terre');

    it('should exist in catalog', () => {
      expect(marteau).toBeDefined();
    });

    it('should have ON_KILL ability trigger as constant', () => {
      expect(marteau?.abilities![0].trigger).toBe(WeaponAbilityTrigger.ON_KILL);
      expect(marteau?.abilities![0].effect.type).toBe('heal_on_kill');
      const effect = marteau?.abilities![0].effect;
      if (effect?.type === 'heal_on_kill') {
        expect(effect.amount).toBe(1);
      }
    });
  });

  describe('Arc des Vents', () => {
    const arc = ITEMS_CATALOG.find(item => item.id === 'tome3-arc-vents');

    it('should exist in catalog', () => {
      expect(arc).toBeDefined();
    });

    it('should have ON_MISS ability trigger with chance cost', () => {
      expect(arc?.abilities![0].trigger).toBe(WeaponAbilityTrigger.ON_MISS);
      expect(arc?.abilities![0].effect.type).toBe('convert_miss_to_hit');
      expect(arc?.abilities![0].costChance).toBe(1);
    });
  });

  describe('Dague des Ombres', () => {
    const dague = ITEMS_CATALOG.find(item => item.id === 'tome3-dague-ombres');

    it('should exist in catalog', () => {
      expect(dague).toBeDefined();
    });

    it('should have ON_SURPRISE ability trigger', () => {
      expect(dague?.abilities![0].trigger).toBe(WeaponAbilityTrigger.ON_SURPRISE);
      expect(dague?.abilities![0].effect.type).toBe('bonus_damage');
      const effect = dague?.abilities![0].effect;
      if (effect?.type === 'bonus_damage') {
        expect(effect.amount).toBe(2);
        expect(effect.firstAttackOnly).toBe(true);
      }
    });
  });

  describe('Bâton du Sage', () => {
    const baton = ITEMS_CATALOG.find(item => item.id === 'tome3-baton-sage');

    it('should exist in catalog', () => {
      expect(baton).toBeDefined();
    });

    it('should have ON_ENEMY_HIT ability trigger', () => {
      expect(baton?.abilities![0].trigger).toBe(WeaponAbilityTrigger.ON_ENEMY_HIT);
      expect(baton?.abilities![0].effect.type).toBe('negate_damage');
      expect(baton?.abilities![0].usesPerCombat).toBe(1);
    });
  });

  describe('Type Safety', () => {
    it('should have trigger as WeaponAbilityTrigger type (not string)', () => {
      for (const weapon of legendaryWeapons) {
        const trigger = weapon.abilities![0].trigger;

        expect(Object.values(WeaponAbilityTrigger)).toContain(trigger);

        switch (trigger) {
          case WeaponAbilityTrigger.ON_DOUBLE:
          case WeaponAbilityTrigger.ON_KILL:
          case WeaponAbilityTrigger.ON_MISS:
          case WeaponAbilityTrigger.ON_SURPRISE:
          case WeaponAbilityTrigger.ON_ENEMY_HIT:
          case WeaponAbilityTrigger.MANUAL:
            break;
          default:
            throw new Error(`Invalid trigger: ${trigger}`);
        }
      }
    });

    it('should allow comparison with constants', () => {
      const lame = ITEMS_CATALOG.find(item => item.id === 'tome3-lame-aube-eternelle');

      if (lame?.abilities![0].trigger === WeaponAbilityTrigger.ON_DOUBLE) {
        expect(true).toBe(true);
      } else {
        throw new Error('Trigger should be ON_DOUBLE');
      }
    });
  });

  describe('Catalog Integration', () => {
    it('should be loadable via ITEMS_CATALOG', () => {
      expect(ITEMS_CATALOG).toBeDefined();
      expect(Array.isArray(ITEMS_CATALOG)).toBe(true);
    });

    it('should be filterable by isLegendary flag', () => {
      const legendary = ITEMS_CATALOG.filter(item => item.isLegendary);
      expect(legendary.length).toBe(5);
    });

    it('should be filterable by trigger type using constants', () => {
      const onDoubleWeapons = ITEMS_CATALOG.filter(
        item => item.abilities?.[0]?.trigger === WeaponAbilityTrigger.ON_DOUBLE
      );
      expect(onDoubleWeapons).toHaveLength(1);
      expect(onDoubleWeapons[0].id).toBe('tome3-lame-aube-eternelle');
    });
  });

  describe('Backward Compatibility', () => {
    it('should not break existing weapons without abilities', () => {
      const basicWeapons = ITEMS_CATALOG.filter(
        item => item.type === ItemType.WEAPON && !item.isLegendary
      );

      for (const weapon of basicWeapons) {
        expect(weapon.abilities).toBeUndefined();
        expect(weapon.isLegendary).toBeFalsy();
      }
    });

    it('should maintain existing weapon structure', () => {
      const epee = ITEMS_CATALOG.find(item => item.id === 'tome1-epee-courte-1');

      expect(epee?.type).toBe(ItemType.WEAPON);
      expect(epee?.attackPoints).toBeDefined();
      expect(epee?.abilities).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should validate that all effect types have required fields', () => {
      for (const weapon of legendaryWeapons) {
        for (const ability of weapon.abilities || []) {
          const effect = ability.effect;
          
          if (effect.type === 'heal_on_kill') {
            expect(effect.amount).toBeDefined();
            expect(effect.amount).toBeGreaterThan(0);
          }
          
          if (effect.type === 'bonus_damage') {
            expect(effect.amount).toBeDefined();
            expect(effect.amount).toBeGreaterThan(0);
          }
        }
      }
    });

    it('should have valid trigger constants for all legendary weapons', () => {
      const validTriggers = Object.values(WeaponAbilityTrigger);
      
      for (const weapon of legendaryWeapons) {
        for (const ability of weapon.abilities || []) {
          expect(validTriggers).toContain(ability.trigger);
        }
      }
    });

    it('should have valid effect types for all legendary weapons', () => {
      const validEffectTypes = [
        'extra_attack',
        'heal_on_kill',
        'convert_miss_to_hit',
        'bonus_damage',
        'negate_damage',
      ];
      
      for (const weapon of legendaryWeapons) {
        for (const ability of weapon.abilities || []) {
          expect(validEffectTypes).toContain(ability.effect.type);
        }
      }
    });
  });
});
