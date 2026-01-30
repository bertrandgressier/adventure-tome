import { describe, it, expect } from 'vitest';
import type { CombatState, WeaponAbility, CombatEvent } from '@/src/domain/types/combat-v2';

const mockWeapon = {
  id: 'epiee',
  name: 'Épée',
  bonus: 5,
};

const mockEnemy = {
  name: 'Gobelin',
  dexterite: 6,
  endurance: 15,
  enduranceMax: 15,
  chance: 0,
  weapon: { id: 'dague', name: 'Dague', bonus: 2 },
  weaponDamage: 2,
  passiveDamageBonus: 0,
  totalDamageBonus: 2,
  isBoss: false,
};

const mockDiceRoll = {
  dice1: 4,
  dice2: 5,
  total: 9,
};

function createMockCombatState(overrides?: Partial<CombatState>): CombatState {
  return {
    id: 'combat-1',
    characterId: 'char-1',
    player: {
      name: 'Aventurier',
      dexterite: 7,
      endurance: 32,
      enduranceMax: 32,
      chance: 5,
      weapon: mockWeapon,
      weaponDamage: 5,
      passiveDamageBonus: 0,
      totalDamageBonus: 5,
    },
    enemies: [mockEnemy],
    activeEnemyIndex: 0,
    phase: 'setup',
    roundNumber: 0,
    currentAttacker: 'player',
    usedAbilities: {},
    usedReroll: false,
    isFirstAttack: true,
    config: {
      maxEnemies: 3,
      damageFormula: '2d6+DEX+weapon',
    },
    events: [],
    ...overrides,
  };
}

describe('Combat V2 Types', () => {
  describe('CombatStateV2', () => {
    it('should create a valid initial combat state', () => {
      const state: CombatState = createMockCombatState();
      expect(state.phase).toBe('setup');
      expect(state.roundNumber).toBe(0);
      expect(state.currentAttacker).toBe('player');
    });

    it('should support multiple enemies', () => {
      const enemy2 = {
        name: 'Orc',
        dexterite: 5,
        endurance: 20,
        enduranceMax: 20,
        chance: 0,
        weapon: { id: 'hache', name: 'Hache', bonus: 3 },
        weaponDamage: 3,
        passiveDamageBonus: 0,
        totalDamageBonus: 3,
        isBoss: false,
      };
      const state = createMockCombatState({
        enemies: [mockEnemy, enemy2],
      });
      expect(state.enemies).toHaveLength(2);
      expect(state.activeEnemyIndex).toBe(0);
    });

    it('should track used abilities', () => {
      const state = createMockCombatState({
        usedAbilities: { 'lame-aube': 1, 'marteau-terre': 2 },
      });
      expect(state.usedAbilities['lame-aube']).toBe(1);
      expect(state.usedAbilities['marteau-terre']).toBe(2);
    });

    it('should track reroll usage', () => {
      const state = createMockCombatState({ usedReroll: true });
      expect(state.usedReroll).toBe(true);
    });

    it('should track first attack flag', () => {
      const state = createMockCombatState({ isFirstAttack: false });
      expect(state.isFirstAttack).toBe(false);
    });
  });

  describe('WeaponAbility', () => {
    it('should define all legendary weapon abilities', () => {
      const abilities: WeaponAbility[] = [
        { id: 'lame-aube', name: 'Lame de l\'Aube', trigger: 'on_double', effect: { type: 'extra_attack' } },
        { id: 'marteau-terre', name: 'Marteau de la Terre', trigger: 'on_kill', effect: { type: 'heal_on_kill', amount: 1 } },
        { id: 'arc-vents', name: 'Arc des Vents', trigger: 'on_miss', effect: { type: 'convert_miss_to_hit' }, costChance: 1 },
        { id: 'dague-ombres', name: 'Dague des Ombres', trigger: 'on_surprise', effect: { type: 'bonus_damage', amount: 2, firstAttackOnly: true } },
        { id: 'baton-sage', name: 'Bâton du Sage', trigger: 'on_enemy_hit', effect: { type: 'negate_damage' }, usesPerCombat: 1 },
      ];
      expect(abilities).toHaveLength(5);
    });

    it('should support optional costChance', () => {
      const ability: WeaponAbility = {
        id: 'arc-vents',
        name: 'Arc des Vents',
        trigger: 'on_miss',
        effect: { type: 'convert_miss_to_hit' },
        costChance: 1,
      };
      expect(ability.costChance).toBe(1);
    });

    it('should support optional usesPerCombat', () => {
      const ability: WeaponAbility = {
        id: 'baton-sage',
        name: 'Bâton du Sage',
        trigger: 'on_enemy_hit',
        effect: { type: 'negate_damage' },
        usesPerCombat: 1,
      };
      expect(ability.usesPerCombat).toBe(1);
    });
  });

  describe('CombatEvent', () => {
    it('should type all event variants correctly', () => {
      const events: CombatEvent[] = [
        { type: 'combat_start', timestamp: new Date().toISOString() },
        { type: 'attack_roll', timestamp: new Date().toISOString(), attacker: 'player', roll: mockDiceRoll, hit: true },
        { type: 'damage_dealt', timestamp: new Date().toISOString(), round: 1, attacker: 'player', damage: 9 },
        { type: 'heal', timestamp: new Date().toISOString(), healAmount: 5 },
        { type: 'ability_used', timestamp: new Date().toISOString(), abilityId: 'lame-aube' },
        { type: 'luck_test', timestamp: new Date().toISOString(), luckUsed: true, luckResult: 'success' },
        { type: 'flee', timestamp: new Date().toISOString() },
        { type: 'combat_end', timestamp: new Date().toISOString(), result: 'victory' },
        { type: 'round_start', timestamp: new Date().toISOString(), round: 1 },
        { type: 'round_end', timestamp: new Date().toISOString(), round: 1 },
      ];
      expect(events).toHaveLength(10);
    });
  });

  describe('CombatPhase', () => {
    it('should support all combat phases', () => {
      const phases = ['setup', 'player_turn', 'player_attack', 'enemy_turn', 'enemy_attack', 'round_end', 'victory', 'defeat'] as const;
      expect(phases).toHaveLength(8);
    });
  });

  describe('CombatActionType', () => {
    it('should support all action types', () => {
      const actionTypes = ['attack', 'use_item', 'use_luck', 'weapon_ability', 'flee', 'reroll', 'block', 'skip'] as const;
      expect(actionTypes).toHaveLength(8);
    });
  });
});
