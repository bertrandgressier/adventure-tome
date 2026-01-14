import { describe, it, expect } from 'vitest';
import { WeaponAbilityResolver } from '@/src/domain/services/combat/WeaponAbilityResolver';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { WeaponAbilityTrigger } from '@/src/domain/types/WeaponAbilityTrigger';
import type { CombatState } from '@/src/domain/types/combat-v2';
import type { WeaponEffect, CombatWeapon } from '@/src/domain/types/combatants';

function createMockState(overrides: Partial<CombatState> = {}) {
  return {
    id: 'test-combat',
    characterId: 'test-char',
    player: {
      name: 'Hero',
      dexterite: 7,
      endurance: 32,
      enduranceMax: 32,
      chance: 5,
      weapon: {
        id: 'basic-sword',
        name: 'Basic Sword',
        bonus: 3,
      },
    },
    enemies: [
      {
        name: 'Goblin',
        dexterite: 6,
        endurance: 15,
        enduranceMax: 15,
        chance: 0,
        weapon: { id: 'goblin-weapon', name: 'Dagger', bonus: 2 },
        isBoss: false,
      },
    ],
    activeEnemyIndex: 0,
    phase: CombatPhase.PLAYER_TURN,
    roundNumber: 1,
    currentAttacker: 'player' as const,
    usedAbilities: {},
    usedReroll: false,
    isFirstAttack: true,
    config: {
      fleeCost: 2,
      allowFlee: true,
      maxEnemies: 1,
      damageFormula: '1 + 1d6 + weapon',
      firstAttacker: 'player' as const,
    },
    events: [],
    ...overrides,
  };
}

describe('WeaponAbilityResolver', () => {
  describe('Lame de l\'Aube Éternelle', () => {
    const LAME_AUBE_WEAPON: CombatWeapon = {
      id: 'lame-aube-eternelle',
      name: 'Lame de l\'Aube Éternelle',
      bonus: 5,
      ability: {
        id: 'lame-aube-double-attack',
        name: 'Double Attack',
        trigger: WeaponAbilityTrigger.ON_DOUBLE,
        effect: { type: 'extra_attack' } as WeaponEffect,
      },
    };

    it('should trigger extra attack on double', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: LAME_AUBE_WEAPON,
        },
      });
      const roll = { dice1: 4, dice2: 4, total: 8, isDouble: true, success: true };

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_double', { roll });
      expect(ability?.id).toBe('lame-aube-double-attack');
    });

    it('should not trigger on non-double', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: LAME_AUBE_WEAPON,
        },
      });
      const roll = { dice1: 3, dice2: 4, total: 7, isDouble: false, success: true };

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_double', { roll });
      expect(ability).toBeNull();
    });

    it('should grant extra attack in same round', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: LAME_AUBE_WEAPON,
        },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'lame-aube-double-attack');
      expect(result.state.pendingExtraAttack).toBe(true);
      expect(result.triggered).toBe(true);
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'ability_used',
        abilityId: 'lame-aube-double-attack',
      }));
      expect(result.state.usedAbilities['lame-aube-double-attack']).toBe(1);
    });

    it('should not trigger if no weapon ability', () => {
      const state = createMockState();
      const roll = { dice1: 4, dice2: 4, total: 8, isDouble: true, success: true };

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_double', { roll });
      expect(ability).toBeNull();
    });
  });

  describe('Marteau de la Terre', () => {
    const MARTEAU_WEAPON: CombatWeapon = {
      id: 'marteau-terre',
      name: 'Marteau de la Terre',
      bonus: 4,
      ability: {
        id: 'marteau-vampiric',
        name: 'Vampiric Heal',
        trigger: WeaponAbilityTrigger.ON_KILL,
        effect: { type: 'heal_on_kill', amount: 1 } as WeaponEffect,
      },
    };

    it('should heal +1 PV on enemy kill', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: MARTEAU_WEAPON,
          endurance: 25,
          enduranceMax: 32,
        },
      });
      const mockEnemy = {
        name: 'Goblin',
        dexterite: 6,
        endurance: 0,
        enduranceMax: 15,
        chance: 0,
        weapon: { id: 'goblin-weapon', name: 'Dagger', bonus: 2 },
        isBoss: false,
      };

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric', {
        killedEnemy: mockEnemy,
      });

      expect(result.state.player.endurance).toBe(26);
      expect(result.triggered).toBe(true);
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'ability_used',
        abilityId: 'marteau-vampiric',
      }));
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'heal',
        healAmount: 1,
      }));
    });

    it('should not exceed max health', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: MARTEAU_WEAPON,
          endurance: 32,
          enduranceMax: 32,
        },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric', {
        killedEnemy: {
          name: 'Goblin',
          dexterite: 6,
          endurance: 0,
          enduranceMax: 15,
          chance: 0,
          weapon: { id: 'goblin-weapon', name: 'Dagger', bonus: 2 },
          isBoss: false,
        },
      });

      expect(result.state.player.endurance).toBe(32);
    });

    it('should not trigger without killed enemy', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: MARTEAU_WEAPON,
        },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric');
      expect(result.triggered).toBe(false);
    });

    it('should check trigger on kill', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: MARTEAU_WEAPON,
        },
      });
      const mockEnemy = {
        name: 'Goblin',
        dexterite: 6,
        endurance: 0,
        enduranceMax: 15,
        chance: 0,
        weapon: { id: 'goblin-weapon', name: 'Dagger', bonus: 2 },
        isBoss: false,
      };

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_kill', { killedEnemy: mockEnemy });
      expect(ability?.id).toBe('marteau-vampiric');
    });
  });

  describe('Arc des Vents', () => {
    const ARC_VENTS_WEAPON: CombatWeapon = {
      id: 'arc-vents',
      name: 'Arc des Vents',
      bonus: 3,
      ability: {
        id: 'arc-wind-guided',
        name: 'Wind Guided',
        trigger: WeaponAbilityTrigger.ON_MISS,
        effect: { type: 'convert_miss_to_hit' } as WeaponEffect,
        costChance: 1,
      },
    };

    it('should convert miss to hit when using CHANCE', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: ARC_VENTS_WEAPON,
          chance: 5,
        },
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'arc-wind-guided');

      expect(result.state.lastRoll?.success).toBe(true);
      expect(result.state.player.chance).toBe(4);
      expect(result.triggered).toBe(true);
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'ability_used',
        abilityId: 'arc-wind-guided',
      }));
    });

    it('should not be usable with 0 CHANCE', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: ARC_VENTS_WEAPON,
          chance: 0,
        },
      });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'arc-wind-guided');

      expect(canUse).toBe(false);
      expect(reason).toBe('Pas assez de CHANCE');
    });

    it('should check trigger on miss', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: ARC_VENTS_WEAPON,
        },
      });
      const roll = { dice1: 5, dice2: 4, total: 9, isDouble: false, success: false };

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_miss', { roll });
      expect(ability?.id).toBe('arc-wind-guided');
    });

    it('should not trigger on hit', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: ARC_VENTS_WEAPON,
        },
      });
      const roll = { dice1: 3, dice2: 4, total: 7, isDouble: false, success: true };

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_miss', { roll });
      expect(ability).toBeNull();
    });
  });

  describe('Dague des Ombres', () => {
    const DAGUE_WEAPON: CombatWeapon = {
      id: 'dague-ombres',
      name: 'Dague des Ombres',
      bonus: 2,
      ability: {
        id: 'dague-surprise-strike',
        name: 'Surprise Strike',
        trigger: WeaponAbilityTrigger.ON_SURPRISE,
        effect: { type: 'bonus_damage', amount: 2, firstAttackOnly: true } as WeaponEffect,
      },
    };

    it('should add +2 damage on first surprise attack', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: DAGUE_WEAPON,
        },
        isFirstAttack: true,
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'dague-surprise-strike');

      expect(result.state.pendingDamage?.abilityBonus).toBe(2);
      expect(result.triggered).toBe(true);
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'ability_used',
        abilityId: 'dague-surprise-strike',
      }));
    });

    it('should not trigger on non-surprise combat', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: DAGUE_WEAPON,
        },
        isFirstAttack: false,
      });

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_surprise', {});
      expect(ability).toBeNull();
    });

    it('should check trigger on surprise', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: DAGUE_WEAPON,
        },
        isFirstAttack: true,
      });

      const ability = WeaponAbilityResolver.checkTriggers(state, 'on_surprise', {});
      expect(ability?.id).toBe('dague-surprise-strike');
    });
  });

  describe('Bâton du Sage', () => {
    const BATON_WEAPON: CombatWeapon = {
      id: 'baton-sage',
      name: 'Bâton du Sage',
      bonus: 1,
      ability: {
        id: 'baton-mystic-shield',
        name: 'Mystic Shield',
        trigger: WeaponAbilityTrigger.ON_ENEMY_HIT,
        effect: { type: 'negate_damage' } as WeaponEffect,
        usesPerCombat: 1,
      },
    };

    it('should negate all damage once per combat', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: BATON_WEAPON,
        },
        pendingDamage: {
          amount: 10,
          canUseLuck: true,
          canBlock: false,
        },
        usedAbilities: {},
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'baton-mystic-shield');

      expect(result.state.pendingDamage?.amount).toBe(0);
      expect(result.state.usedAbilities['baton-mystic-shield']).toBe(1);
      expect(result.triggered).toBe(true);
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'ability_used',
        abilityId: 'baton-mystic-shield',
      }));
    });

    it('should not be usable twice in same combat', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: BATON_WEAPON,
        },
        pendingDamage: {
          amount: 10,
          canUseLuck: true,
          canBlock: false,
        },
        usedAbilities: { 'baton-mystic-shield': 1 },
      });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'baton-mystic-shield');
      expect(canUse).toBe(false);
      expect(reason).toBe('Capacité déjà utilisée');
    });

    it('should not be usable without pending damage', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: BATON_WEAPON,
        },
      });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'baton-mystic-shield');
      expect(canUse).toBe(false);
      expect(reason).toBe('Aucun dégât en attente');
    });

    it('should not trigger if no pending damage', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: BATON_WEAPON,
        },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'baton-mystic-shield');
      expect(result.triggered).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return false if weapon not equipped', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: {
            id: 'test',
            name: 'Test',
            bonus: 0,
            ability: undefined,
          },
        },
      });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'arc-wind-guided');
      expect(canUse).toBe(false);
      expect(reason).toBe('Arme non équipée');
    });

    it('should return false if weapon has no ability', () => {
      const state = createMockState();

      const result = WeaponAbilityResolver.resolveAbility(state, 'some-ability-id');
      expect(result.triggered).toBe(false);
    });

    it('should track multiple ability uses', () => {
      const state = createMockState({
        player: {
          ...createMockState().player,
          weapon: {
            id: 'lame-aube-eternelle',
            name: 'Lame de l\'Aube Éternelle',
            bonus: 5,
            ability: {
              id: 'lame-aube-double-attack',
              name: 'Double Attack',
              trigger: WeaponAbilityTrigger.ON_DOUBLE,
              effect: { type: 'extra_attack' },
            },
          },
        },
        usedAbilities: { 'lame-aube-double-attack': 2 },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'lame-aube-double-attack');
      expect(result.state.usedAbilities['lame-aube-double-attack']).toBe(3);
    });
  });
});
