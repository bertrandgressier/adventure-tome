import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import type { CombatantConfig, EnemyConfig } from '@/src/domain/types/combatants';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { CombatActionType } from '@/src/domain/types/CombatActionType';

function createPlayerConfig(): CombatantConfig {
  return {
    name: 'Player',
    dexterite: 7,
    endurance: 30,
    enduranceMax: 32,
    chance: 5,
    weapon: { id: 'sword', name: 'Épée', bonus: 5 },
  };
}

function createEnemyConfig(): EnemyConfig {
  return {
    name: 'Gobelin',
    dexterite: 6,
    endurance: 15,
    enduranceMax: 15,
    chance: 4,
    weapon: { id: 'club', name: 'Gourdin', bonus: 2 },
    isBoss: false,
  };
}

function createCombatConfig() {
  return {
    damageFormula: '1 + 1d6 + weapon',
  };
}

describe('CombatEngine - Global Scenarios', () => {
  it('should complete a full combat with victory', () => {
    const initialState = CombatEngine.createInitialState(
      'char-1',
      createPlayerConfig(),
      createEnemyConfig(),
      createCombatConfig()
    );

    expect(initialState.phase).toBe(CombatPhase.PLAYER_TURN);
    expect(initialState.roundNumber).toBe(1);

    const result1 = CombatEngine.resolve(initialState, { type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 4 });
    let state = result1.state;

    expect(state.phase).toBe(CombatPhase.ENEMY_TURN);
    expect(state.enemy.endurance).toBe(5);

    const result2 = CombatEngine.resolve(state, { type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 1 });
    state = result2.state;

    expect(state.phase).toBe(CombatPhase.ENEMY_ATTACK);
    expect(state.pendingDamage?.amount).toBe(4);

    const result3 = CombatEngine.resolve(state, { type: CombatActionType.SKIP });
    state = result3.state;

    expect(state.phase).toBe(CombatPhase.PLAYER_TURN);
    expect(state.roundNumber).toBe(2);
    expect(state.player.endurance).toBe(26);

    const result4 = CombatEngine.resolve(state, { type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 4 });
    state = result4.state;

    expect(state.enemy.endurance).toBe(0);
    expect(CombatEngine.checkCombatEnd(state)).toBe('victory');
  });

  it('should handle reroll on missed attack', () => {
    const initialState = CombatEngine.createInitialState(
      'char-1',
      createPlayerConfig(),
      { ...createEnemyConfig(), dexterite: 7 },
      createCombatConfig()
    );

    const result1 = CombatEngine.resolve(initialState, { type: CombatActionType.ATTACK }, { hitDice: [5, 4] });
    let state = result1.state;

    expect(state.phase).toBe(CombatPhase.PLAYER_ATTACK);
    expect(state.lastRoll?.success).toBe(false);
    expect(state.lastRoll?.total).toBe(9);

    const actions1 = CombatEngine.getAvailableActions(state);
    expect(actions1.some(a => a.action.type === CombatActionType.REROLL)).toBe(true);

    const result2 = CombatEngine.resolve(state, { type: CombatActionType.REROLL }, { hitDice: [3, 2] });
    state = result2.state;

    expect(state.usedReroll).toBe(true);
    expect(state.lastRoll?.total).toBe(5);
    expect(state.lastRoll?.success).toBe(true);
    expect(state.phase).toBe(CombatPhase.ENEMY_TURN);
  });

  it('should provide available actions based on phase', () => {
    const initialState = CombatEngine.createInitialState(
      'char-1',
      createPlayerConfig(),
      createEnemyConfig(),
      createCombatConfig()
    );

    const actions1 = CombatEngine.getAvailableActions(initialState);
    expect(actions1.map(a => a.action.type)).toContain(CombatActionType.ATTACK);

    const result = CombatEngine.resolve(initialState, { type: CombatActionType.ATTACK }, { hitDice: [5, 4] });
    const state = result.state;

    const actions2 = CombatEngine.getAvailableActions(state);
    expect(actions2.map(a => a.action.type)).toContain(CombatActionType.REROLL);
    expect(actions2.map(a => a.action.type)).toContain(CombatActionType.SKIP);
  });
});
