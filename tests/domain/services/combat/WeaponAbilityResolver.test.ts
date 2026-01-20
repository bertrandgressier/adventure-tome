import { describe, it, expect } from 'vitest';
import { WeaponAbilityResolver } from '@/src/domain/services/combat/WeaponAbilityResolver';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import { catalogWeaponToCombatWeapon } from '@/src/domain/services/combat/weaponMapper';
import { COMBAT_MESSAGES } from '@/src/domain/services/combat/constants';
import { ITEMS_CATALOG } from '@/src/data/items-catalog';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { WeaponAbilityTrigger } from '@/src/domain/types/WeaponAbilityTrigger';
import { CombatEventType } from '@/src/domain/types/CombatEventType';
import type { PlayerConfig, EnemyConfig } from '@/src/domain/types/combatants';
import type { CombatState } from '@/src/domain/types/combat-v2';

function getLegendaryWeapon(itemId: string) {
  const catalogItem = ITEMS_CATALOG.find(item => item.id === itemId);
  if (!catalogItem) {
    throw new Error(`Weapon ${itemId} not found in catalog`);
  }
  return catalogWeaponToCombatWeapon(catalogItem);
}

function createTestPlayer(overrides: Partial<PlayerConfig> = {}): PlayerConfig {
  return {
    name: 'Héros',
    dexterite: 8,
    endurance: 30,
    enduranceMax: 32,
    chance: 5,
    weapon: getLegendaryWeapon('tome3-lame-aube-eternelle'),
    ...overrides,
  };
}

function createTestEnemy(overrides: Partial<EnemyConfig> = {}): EnemyConfig {
  return {
    name: 'Gobelin',
    dexterite: 6,
    endurance: 10,
    enduranceMax: 10,
    ...overrides,
  };
}

function createCombatState(options: {
  weaponId?: string;
  playerEndurance?: number;
  playerEnduranceMax?: number;
  playerChance?: number;
  enemyEndurance?: number;
  isSurprise?: boolean;
  isFirstAttack?: boolean;
  usedAbilities?: Record<string, number>;
  pendingDamage?: { amount: number; canBlock: boolean };
  phase?: CombatPhase;
}): CombatState {
  const weaponId = options.weaponId ?? 'tome3-lame-aube-eternelle';

  const player = createTestPlayer({
    endurance: options.playerEndurance ?? 30,
    enduranceMax: options.playerEnduranceMax ?? 32,
    chance: options.playerChance ?? 5,
    weapon: getLegendaryWeapon(weaponId),
  });

  const enemy = createTestEnemy({
    endurance: options.enemyEndurance ?? 10,
  });

  const state = CombatEngine.createInitialState(
    'char-123',
    player,
    enemy,
    {
      damageFormula: '1+1d6+weapon',
      isSurprise: options.isSurprise ?? false,
    }
  );

  if (options.isFirstAttack !== undefined) {
    state.isFirstAttack = options.isFirstAttack;
  }

  if (options.usedAbilities) {
    state.usedAbilities = { ...state.usedAbilities, ...options.usedAbilities };
  }

  if (options.pendingDamage) {
    state.pendingDamage = options.pendingDamage;
  }

  if (options.phase) {
    state.phase = options.phase;
  }

  return state;
}

describe('Lame de l\'Aube Éternelle', () => {
  const weaponId = 'tome3-lame-aube-eternelle';

  describe('Trigger Detection (WeaponAbilityTrigger.ON_DOUBLE)', () => {
    it('should detect trigger when dice show a double', () => {
      const state = createCombatState({ weaponId });
      const roll = { dice1: 4, dice2: 4, total: 8, isDouble: true, success: true };

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_DOUBLE,
        { roll }
      );

      expect(ability).not.toBeNull();
      expect(ability?.id).toBe('lame-aube-extra-attack');
    });

    it('should NOT trigger when dice are different', () => {
      const state = createCombatState({ weaponId });
      const roll = { dice1: 3, dice2: 4, total: 7, isDouble: false, success: true };

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_DOUBLE,
        { roll }
      );

      expect(ability).toBeNull();
    });

    it('should trigger even if the attack missed (double 6s)', () => {
      const state = createCombatState({ weaponId });
      const roll = { dice1: 6, dice2: 6, total: 12, isDouble: true, success: false };

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_DOUBLE,
        { roll }
      );

      expect(ability).not.toBeNull();
    });

    it('should NOT trigger if player does not have this weapon equipped', () => {
      const state = createCombatState({ weaponId: 'tome3-marteau-terre' });
      const roll = { dice1: 4, dice2: 4, total: 8, isDouble: true };

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_DOUBLE,
        { roll }
      );

      expect(ability).toBeNull();
    });
  });

  describe('Effect Resolution (extra_attack)', () => {
    it('should grant a pending extra attack when resolved', () => {
      const state = createCombatState({ weaponId });

      const result = WeaponAbilityResolver.resolveAbility(state, 'lame-aube-extra-attack');

      expect(result.triggered).toBe(true);
      expect(result.state.pendingExtraAttack).toBe(true);
    });

    it('should emit a WEAPON_ABILITY event', () => {
      const state = createCombatState({ weaponId });

      const result = WeaponAbilityResolver.resolveAbility(state, 'lame-aube-extra-attack');

      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: CombatEventType.WEAPON_ABILITY,
          abilityId: 'lame-aube-extra-attack',
        })
      );
    });

    it('should allow multiple extra attacks in same combat (each double triggers)', () => {
      let state = createCombatState({ weaponId });

      const result1 = WeaponAbilityResolver.resolveAbility(state, 'lame-aube-extra-attack');
      expect(result1.state.pendingExtraAttack).toBe(true);

      state = { ...result1.state, pendingExtraAttack: false };

      const result2 = WeaponAbilityResolver.resolveAbility(state, 'lame-aube-extra-attack');
      expect(result2.state.pendingExtraAttack).toBe(true);
    });
  });

  describe('Integration with CombatEngine', () => {
    it('should trigger extra attack automatically when attack rolls a double', () => {
      const state = createCombatState({ weaponId });

      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [3, 3], damageDice: 4 }
      );

      expect(result.state.pendingExtraAttack).toBe(true);
      expect(result.events).toContainEqual(
        expect.objectContaining({ type: CombatEventType.WEAPON_ABILITY })
      );
    });
  });
});

describe('Marteau de la Terre', () => {
  const weaponId = 'tome3-marteau-terre';

  describe('Trigger Detection (WeaponAbilityTrigger.ON_KILL)', () => {
    it('should detect trigger when enemy is killed', () => {
      const state = createCombatState({ weaponId, enemyEndurance: 0 });

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_KILL,
        { killedEnemy: true }
      );

      expect(ability).not.toBeNull();
      expect(ability?.id).toBe('marteau-vampiric');
    });

    it('should NOT trigger when enemy survives', () => {
      const state = createCombatState({ weaponId, enemyEndurance: 5 });

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_KILL,
        { killedEnemy: false }
      );

      expect(ability).toBeNull();
    });

    it('should NOT trigger if using different weapon', () => {
      const state = createCombatState({ weaponId: 'tome3-lame-aube-eternelle', enemyEndurance: 0 });

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_KILL,
        { killedEnemy: true }
      );

      expect(ability).toBeNull();
    });
  });

  describe('Effect Resolution (heal_on_kill)', () => {
    it('should heal player by 1 PV when resolved', () => {
      const state = createCombatState({
        weaponId,
        playerEndurance: 25,
        playerEnduranceMax: 32,
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric');

      expect(result.triggered).toBe(true);
      expect(result.state.player.endurance).toBe(26);
    });

    it('should NOT exceed maximum health', () => {
      const state = createCombatState({
        weaponId,
        playerEndurance: 32,
        playerEnduranceMax: 32,
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric');

      expect(result.state.player.endurance).toBe(32);
    });

    it('should heal even if at 1 HP below max', () => {
      const state = createCombatState({
        weaponId,
        playerEndurance: 31,
        playerEnduranceMax: 32,
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric');

      expect(result.state.player.endurance).toBe(32);
    });

    it('should emit a WEAPON_ABILITY event with heal', () => {
      const state = createCombatState({ weaponId, playerEndurance: 25 });

      const result = WeaponAbilityResolver.resolveAbility(state, 'marteau-vampiric');

      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: CombatEventType.WEAPON_ABILITY,
          healAmount: 1,
        })
      );
    });
  });

  describe('Multiple Kills in Same Combat', () => {
    it('should trigger on each enemy killed (no usage limit)', () => {
      const state1 = createCombatState({ weaponId, playerEndurance: 20 });

      const result1 = WeaponAbilityResolver.resolveAbility(state1, 'marteau-vampiric');
      expect(result1.state.player.endurance).toBe(21);

      const result2 = WeaponAbilityResolver.resolveAbility(result1.state, 'marteau-vampiric');
      expect(result2.state.player.endurance).toBe(22);
    });
  });
});

describe('Arc des Vents', () => {
  const weaponId = 'tome3-arc-vents';

  describe('Trigger Detection (WeaponAbilityTrigger.ON_MISS)', () => {
    it('should detect trigger when attack misses', () => {
      const state = createCombatState({ weaponId, playerChance: 3 });
      const roll = { dice1: 5, dice2: 4, total: 9, isDouble: false, success: false };

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_MISS,
        { roll }
      );

      expect(ability).not.toBeNull();
      expect(ability?.id).toBe('arc-wind-guided');
    });

    it('should NOT trigger when attack hits', () => {
      const state = createCombatState({ weaponId });
      const roll = { dice1: 3, dice2: 2, total: 5, isDouble: false, success: true };

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_MISS,
        { roll }
      );

      expect(ability).toBeNull();
    });
  });

  describe('Availability Check (canUseAbility)', () => {
    it('should be usable with 1+ CHANCE', () => {
      const state = createCombatState({ weaponId, playerChance: 1 });

      const { canUse } = WeaponAbilityResolver.canUseAbility(state, 'arc-wind-guided');

      expect(canUse).toBe(true);
    });

    it('should NOT be usable with 0 CHANCE', () => {
      const state = createCombatState({ weaponId, playerChance: 0 });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'arc-wind-guided');

      expect(canUse).toBe(false);
      expect(reason).toBe(COMBAT_MESSAGES.WEAPON_ABILITY.INSUFFICIENT_CHANCE);
    });

    it('should NOT be usable if wrong weapon equipped', () => {
      const state = createCombatState({ weaponId: 'tome3-lame-aube-eternelle', playerChance: 5 });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'arc-wind-guided');

      expect(canUse).toBe(false);
      expect(reason).toBe(COMBAT_MESSAGES.WEAPON_ABILITY.WEAPON_REQUIRED);
    });
  });

  describe('Effect Resolution (convert_miss_to_hit)', () => {
    it('should spend 1 CHANCE and convert miss to hit', () => {
      const state = createCombatState({ weaponId, playerChance: 3 });

      const result = WeaponAbilityResolver.resolveAbility(state, 'arc-wind-guided');

      expect(result.triggered).toBe(true);
      expect(result.state.player.chance).toBe(2);
    });

    it('should emit WEAPON_ABILITY event with pointsSpent', () => {
      const state = createCombatState({ weaponId, playerChance: 3 });

      const result = WeaponAbilityResolver.resolveAbility(state, 'arc-wind-guided');

      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: CombatEventType.WEAPON_ABILITY,
          abilityId: 'arc-wind-guided',
          pointsSpent: 1,
        })
      );
    });
  });
});

describe('Dague des Ombres', () => {
  const weaponId = 'tome3-dague-ombres';

  describe('Trigger Detection (WeaponAbilityTrigger.ON_SURPRISE)', () => {
    it('should detect trigger when isSurprise and isFirstAttack', () => {
      const state = createCombatState({ weaponId, isSurprise: true, isFirstAttack: true });

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_SURPRISE,
        {}
      );

      expect(ability).not.toBeNull();
      expect(ability?.id).toBe('dague-surprise-strike');
    });

    it('should NOT trigger when isSurprise is false', () => {
      const state = createCombatState({ weaponId, isSurprise: false, isFirstAttack: true });

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_SURPRISE,
        {}
      );

      expect(ability).toBeNull();
    });

    it('should NOT trigger when isFirstAttack is false', () => {
      const state = createCombatState({ weaponId, isSurprise: true, isFirstAttack: false });

      const ability = WeaponAbilityResolver.checkAutoTrigger(
        state,
        WeaponAbilityTrigger.ON_SURPRISE,
        {}
      );

      expect(ability).toBeNull();
    });
  });

  describe('Effect Resolution (bonus_damage)', () => {
    it('should add bonus damage to totalDamageBonus', () => {
      const state = createCombatState({ weaponId });

      const result = WeaponAbilityResolver.resolveAbility(state, 'dague-surprise-strike');

      expect(result.triggered).toBe(true);
      expect(result.state.player.totalDamageBonus).toBe(3);
    });

    it('should emit WEAPON_ABILITY event', () => {
      const state = createCombatState({ weaponId });

      const result = WeaponAbilityResolver.resolveAbility(state, 'dague-surprise-strike');

      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: CombatEventType.WEAPON_ABILITY,
          abilityId: 'dague-surprise-strike',
        })
      );
    });
  });
});

describe('Bâton du Sage', () => {
  const weaponId = 'tome3-baton-sage';

  describe('Availability Check (canUseAbility)', () => {
    it('should be usable when pendingDamage exists', () => {
      const state = createCombatState({ weaponId, pendingDamage: { amount: 5, canBlock: true } });

      const { canUse } = WeaponAbilityResolver.canUseAbility(state, 'baton-mystic-shield');

      expect(canUse).toBe(true);
    });

    it('should NOT be usable when no pendingDamage', () => {
      const state = createCombatState({ weaponId });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'baton-mystic-shield');

      expect(canUse).toBe(false);
      expect(reason).toBe(COMBAT_MESSAGES.WEAPON_ABILITY.NO_DAMAGE_TO_BLOCK);
    });

    it('should NOT be usable after already used once', () => {
      const state = createCombatState({
        weaponId,
        pendingDamage: { amount: 5, canBlock: true },
        usedAbilities: { 'baton-mystic-shield': 1 },
      });

      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, 'baton-mystic-shield');

      expect(canUse).toBe(false);
      expect(reason).toBe(COMBAT_MESSAGES.WEAPON_ABILITY.ALREADY_USED);
    });
  });

  describe('Effect Resolution (negate_damage)', () => {
    it('should clear pendingDamage and track usage', () => {
      const state = createCombatState({
        weaponId,
        pendingDamage: { amount: 5, canBlock: true },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'baton-mystic-shield');

      expect(result.triggered).toBe(true);
      expect(result.state.pendingDamage).toBeUndefined();
      expect(result.state.usedAbilities['baton-mystic-shield']).toBe(1);
    });

    it('should emit WEAPON_ABILITY event', () => {
      const state = createCombatState({
        weaponId,
        pendingDamage: { amount: 5, canBlock: true },
      });

      const result = WeaponAbilityResolver.resolveAbility(state, 'baton-mystic-shield');

      expect(result.events).toContainEqual(
        expect.objectContaining({
          type: CombatEventType.WEAPON_ABILITY,
          abilityId: 'baton-mystic-shield',
        })
      );
    });
  });
});

describe('Cross-Weapon Scenarios', () => {
  it('should NOT trigger wrong weapon ability even if condition matches', () => {
    const state = createCombatState({ weaponId: 'tome3-lame-aube-eternelle' });
    const roll = { dice1: 5, dice2: 4, total: 9, isDouble: false, success: false };

    const ability = WeaponAbilityResolver.checkAutoTrigger(
      state,
      WeaponAbilityTrigger.ON_MISS,
      { roll }
    );

    expect(ability).toBeNull();
  });
});

describe('Regression Tests', () => {
  it('should handle state without weapon ability gracefully', () => {
    const state = createCombatState({ weaponId: 'tome3-lame-aube-eternelle' });
    state.player.weapon.ability = undefined;

    const result = WeaponAbilityResolver.resolveAbility(state, 'any-ability');

    expect(result.triggered).toBe(false);
    expect(result.state).toEqual(state);
  });

  it('should not trigger ability if canUse returns false', () => {
    const state = createCombatState({ weaponId: 'tome3-arc-vents', playerChance: 0 });

    const result = WeaponAbilityResolver.resolveAbility(state, 'arc-wind-guided');

    expect(result.triggered).toBe(false);
  });
});
