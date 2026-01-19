import { describe, it, expect } from 'vitest';
import { ItemResolver, type CombatUsableItem } from '@/src/domain/services/combat/ItemResolver';
import type { CombatState } from '@/src/domain/types/combat-v2';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { CombatEventType } from '@/src/domain/types/CombatEventType';

function createMockCombatState(overrides?: Partial<CombatState>): CombatState {
  return {
    id: 'test-combat',
    characterId: 'test-char',
    player: {
      name: 'Hero',
      dexterite: 8,
      endurance: 20,
      enduranceMax: 30,
      chance: 5,
      weapon: { id: 'sword', name: 'Épée', bonus: 2 },
      weaponDamage: 2,
      passiveDamageBonus: 0,
      totalDamageBonus: 2,
    },
    enemies: [
      {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 15,
        enduranceMax: 15,
        chance: 3,
        isBoss: false,
        weapon: { id: 'dagger', name: 'Dague', bonus: 1 },
        weaponDamage: 1,
        passiveDamageBonus: 0,
        totalDamageBonus: 1,
      },
    ],
    activeEnemyIndex: 0,
    phase: CombatPhase.PLAYER_TURN,
    roundNumber: 1,
    currentAttacker: 'player',
    config: {
      maxEnemies: 3,
      damageFormula: '2d6 + bonus',
    },
    usedAbilities: {},
    usedReroll: false,
    isFirstAttack: true,
    usedItems: [],
    events: [],
    ...overrides,
  };
}

describe('ItemResolver', () => {
  describe('resolve', () => {
    it('should heal player when using healing potion', () => {
      const state = createMockCombatState({ player: { ...createMockCombatState().player, endurance: 20 } });
      const item: CombatUsableItem = {
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        itemIndex: 0,
        healAmount: 5,
      };

      const result = ItemResolver.resolve(state, item);

      expect(result.state.player.endurance).toBe(25);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe(CombatEventType.ITEM_USED);
      expect(result.events[0].healAmount).toBe(5);
      expect(result.state.usedItems).toContainEqual({ itemId: 'tome1-potion-soin', itemIndex: 0 });
    });

    it('should cap healing at max endurance', () => {
      const state = createMockCombatState({ player: { ...createMockCombatState().player, endurance: 28, enduranceMax: 30 } });
      const item: CombatUsableItem = {
        id: 'tome1-potion-soin',
        name: 'Potion de soin',
        itemIndex: 1,
        healAmount: 5,
      };

      const result = ItemResolver.resolve(state, item);

      expect(result.state.player.endurance).toBe(30); // Capped at max
      expect(result.events[0].healAmount).toBe(2); // Actual heal = 2
    });

    it('should damage enemy when using offensive potion', () => {
      const state = createMockCombatState();
      const item: CombatUsableItem = {
        id: 'tome3-potion-confusion',
        name: 'Potion de confusion',
        itemIndex: 0,
        damageToEnemy: 5,
      };

      const result = ItemResolver.resolve(state, item);

      expect(result.state.enemies[0].endurance).toBe(10); // 15 - 5
      expect(result.events).toHaveLength(1);
      expect(result.events[0].type).toBe(CombatEventType.ITEM_USED);
      expect(result.events[0].damage).toBe(5);
    });

    it('should not reduce enemy endurance below 0', () => {
      const mockState = createMockCombatState();
      mockState.enemies[0].endurance = 3;
      const state = mockState;
      const item: CombatUsableItem = {
        id: 'tome3-potion-confusion',
        name: 'Potion de confusion',
        itemIndex: 0,
        damageToEnemy: 5,
      };

      const result = ItemResolver.resolve(state, item);

      expect(result.state.enemies[0].endurance).toBe(0); // Clamped at 0
    });

    it('should handle item with both heal and damage', () => {
      const mockState = createMockCombatState();
      mockState.player.endurance = 20;
      const state = mockState;
      const item: CombatUsableItem = {
        id: 'combo-item',
        name: 'Item Combo',
        itemIndex: 2,
        healAmount: 3,
        damageToEnemy: 2,
      };

      const result = ItemResolver.resolve(state, item);

      expect(result.state.player.endurance).toBe(23); // 20 + 3
      expect(result.state.enemies[0].endurance).toBe(13); // 15 - 2
      expect(result.events).toHaveLength(2); // One for heal, one for damage
    });

    it('should return unchanged state for item with no effects', () => {
      const state = createMockCombatState();
      const item: CombatUsableItem = {
        id: 'useless-item',
        name: 'Item inutile',
        itemIndex: 0,
      };

      const result = ItemResolver.resolve(state, item);

      expect(result.state.player.endurance).toBe(state.player.endurance);
      expect(result.state.enemies[0].endurance).toBe(state.enemies[0].endurance);
      // Item still tracked even if no effect
      expect(result.state.usedItems).toContainEqual({ itemId: 'useless-item', itemIndex: 0 });
    });
  });

  describe('isUsableInCombat', () => {
    it('should return true for healing item', () => {
      expect(ItemResolver.isUsableInCombat({ healAmount: 5 })).toBe(true);
    });

    it('should return true for offensive item', () => {
      expect(ItemResolver.isUsableInCombat({ damageToEnemy: 5 })).toBe(true);
    });

    it('should return false for item with no combat effects', () => {
      expect(ItemResolver.isUsableInCombat({})).toBe(false);
    });

    it('should return false for zero healing', () => {
      expect(ItemResolver.isUsableInCombat({ healAmount: 0 })).toBe(false);
    });

    it('should return false for zero damage', () => {
      expect(ItemResolver.isUsableInCombat({ damageToEnemy: 0 })).toBe(false);
    });
  });
});
