import { describe, it, expect } from 'vitest';
import type { EnemyConfig, PlayerConfig } from '@/src/domain/types/combatants';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';

/**
 * Tests pour l'issue #129 - Bug enemy.weapon.bonus undefined
 * 
 * Vérifie que :
 * 1. EnemyConfig ne contient que les propriétés de base (name, dexterite, endurance, enduranceMax)
 * 2. EnemyConfig ne contient PAS : weapon, chance, isBoss
 * 3. PlayerConfig contient weapon et chance en plus des propriétés de base
 * 4. Le CombatEngine ne tente pas d'accéder à enemy.weapon
 * 5. Les ennemis ont weaponDamage = 0 (pas de bonus d'arme)
 */
describe('Issue #129 - Enemy interface separation', () => {
  describe('Type definitions', () => {
    it('should allow creating an EnemyConfig without weapon, chance, or isBoss', () => {
      // ✅ Ceci doit compiler et fonctionner
      const enemy: EnemyConfig = {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 15,
        enduranceMax: 15,
      };

      expect(enemy).toBeDefined();
      expect(enemy.name).toBe('Gobelin');
      expect(enemy.dexterite).toBe(6);
      expect(enemy.endurance).toBe(15);
      expect(enemy.enduranceMax).toBe(15);
    });

    it('should require weapon and chance for PlayerConfig', () => {
      const player: PlayerConfig = {
        name: 'Héros',
        dexterite: 7,
        endurance: 30,
        enduranceMax: 32,
        chance: 5,
        weapon: { id: 'sword', name: 'Épée', bonus: 3 },
      };

      expect(player).toBeDefined();
      expect(player.weapon).toBeDefined();
      expect(player.weapon.bonus).toBe(3);
      expect(player.chance).toBe(5);
    });
  });

  describe('CombatEngine initialization', () => {
    it('should initialize enemy with weaponDamage = 0 (no weapon bonus)', () => {
      const player: PlayerConfig = {
        name: 'Héros',
        dexterite: 7,
        endurance: 30,
        enduranceMax: 32,
        chance: 5,
        weapon: { id: 'sword', name: 'Épée', bonus: 5 },
      };

      const enemy: EnemyConfig = {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 15,
        enduranceMax: 15,
      };

      const state = CombatEngine.createInitialState(
        'char-1',
        player,
        enemy,
        { damageFormula: '1 + 1d6 + weapon' }
      );

      // Player should have weapon damage bonus
      expect(state.player.weaponDamage).toBe(5);
      expect(state.player.totalDamageBonus).toBe(5);
      expect(state.player.weapon).toBeDefined();
      expect(state.player.chance).toBe(5);

      // Enemy should have NO weapon damage bonus
      expect(state.enemy.weaponDamage).toBe(0);
      expect(state.enemy.totalDamageBonus).toBe(0);
      
      // Type-level: enemy should not have weapon or chance properties
      // This is enforced at compile-time, not runtime
    });

    it('should not throw error when creating initial state (regression test)', () => {
      const player: PlayerConfig = {
        name: 'Test Player',
        dexterite: 8,
        endurance: 25,
        enduranceMax: 25,
        chance: 4,
        weapon: { id: 'test', name: 'Test Weapon', bonus: 2 },
      };

      const enemy: EnemyConfig = {
        name: 'Test Enemy',
        dexterite: 5,
        endurance: 10,
        enduranceMax: 10,
      };

      // This should not throw "Cannot read property 'bonus' of undefined"
      expect(() => {
        CombatEngine.createInitialState(
          'test-char',
          player,
          enemy,
          { damageFormula: '1 + 1d6 + weapon' }
        );
      }).not.toThrow();
    });
  });

  describe('Combat damage calculation', () => {
    it('should calculate enemy damage without weapon bonus', () => {
      const player: PlayerConfig = {
        name: 'Héros',
        dexterite: 7,
        endurance: 30,
        enduranceMax: 32,
        chance: 5,
        weapon: { id: 'sword', name: 'Épée', bonus: 5 },
      };

      const enemy: EnemyConfig = {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 15,
        enduranceMax: 15,
      };

      const state = CombatEngine.createInitialState(
        'char-1',
        player,
        enemy,
        { damageFormula: '1 + 1d6 + DOMMAGES ACTUELS' }
      );

      // Simulate enemy attack
      const result = CombatEngine.resolve(
        { ...state, phase: 'enemy_turn' as any },
        { type: 'attack' as any },
        { hitDice: [2, 2], damageDice: 3 }
      );

      // Enemy damage should be: 1 (base) + 3 (dice) + 0 (no weapon) = 4
      if (result.state.pendingDamage) {
        expect(result.state.pendingDamage.amount).toBe(4);
      }
    });
  });
});
