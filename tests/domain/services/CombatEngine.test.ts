import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/src/domain/services/CombatEngine';
import type { CombatState, CombatantConfig, EnemyConfig, CombatConfig } from '@/src/domain/types/combat-v2';

function createMockState(overrides: Partial<CombatState> = {}): CombatState {
  const defaultState: CombatState = {
    id: 'combat-1',
    characterId: 'char-1',
    player: {
      name: 'Player',
      dexterite: 7,
      endurance: 30,
      enduranceMax: 32,
      chance: 5,
      weapon: { id: 'sword', name: 'Épée', bonus: 5 },
    },
    enemies: [
      {
        name: 'Gobelin',
        dexterite: 6,
        endurance: 15,
        enduranceMax: 15,
        chance: 4,
        weapon: { id: 'club', name: 'Gourdin', bonus: 2 },
        isBoss: false,
      },
    ],
    activeEnemyIndex: 0,
    phase: 'player_turn',
    roundNumber: 1,
    currentAttacker: 'player',
    usedAbilities: {},
    usedReroll: false,
    isFirstAttack: true,
    config: {
      allowFlee: true,
      maxEnemies: 3,
      damageFormula: '1 + 1d6 + weapon',
      fleeCost: 2,
    },
    events: [],
  };

  return { ...defaultState, ...overrides };
}

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

function createCombatConfig(): CombatConfig {
  return {
    allowFlee: true,
    maxEnemies: 3,
    damageFormula: '1 + 1d6 + weapon',
    fleeCost: 2,
  };
}

describe('CombatEngine', () => {
  describe('createInitialState', () => {
    it('should create state with player_turn phase', () => {
      const state = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        createCombatConfig()
      );

      expect(state.phase).toBe('player_turn');
      expect(state.roundNumber).toBe(1);
    });

    it('should set first attacker based on config', () => {
      const config = { ...createCombatConfig(), firstAttacker: 'enemy' as const };
      const state = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        config
      );

      expect(state.currentAttacker).toBe('enemy');
    });

    it('should set default first attacker to player', () => {
      const state = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        createCombatConfig()
      );

      expect(state.currentAttacker).toBe('player');
    });

    it('should generate unique combat ID', () => {
      const state1 = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        createCombatConfig()
      );
      const state2 = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        createCombatConfig()
      );

      expect(state1.id).not.toBe(state2.id);
    });

    it('should create combat_start event', () => {
      const state = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        createCombatConfig()
      );

      expect(state.events).toHaveLength(1);
      expect(state.events[0].type).toBe('combat_start');
    });

    it('should initialize with first attack flag', () => {
      const state = CombatEngine.createInitialState(
        'char-1',
        createPlayerConfig(),
        [createEnemyConfig()],
        createCombatConfig()
      );

      expect(state.isFirstAttack).toBe(true);
    });
  });

  describe('resolve - attack', () => {
    it('should hit when roll <= dexterite', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [3, 2] });

      expect(result.state.lastRoll?.success).toBe(true);
      expect(result.events).toContainEqual(
        expect.objectContaining({ type: 'attack_roll', hit: true })
      );
    });

    it('should miss when roll > dexterite', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [5, 4] });

      expect(result.state.lastRoll?.success).toBe(false);
      expect(result.events).toContainEqual(
        expect.objectContaining({ type: 'attack_roll', hit: false })
      );
    });

    it('should calculate damage as 1 + die + weapon', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 4 });

      expect(result.state.lastRoll?.success).toBe(true);

      const damageEvent = result.events.find((e) => e.type === 'damage_dealt');
      expect(damageEvent?.damage).toBe(10);
    });

    it('should detect double dice roll', () => {
      const result = CombatEngine.resolve(createMockState(), { type: 'attack' }, { hitDice: [3, 3] });

      expect(result.state.lastRoll?.isDouble).toBe(true);
    });

    it('should not detect double when dice are different', () => {
      const result = CombatEngine.resolve(createMockState(), { type: 'attack' }, { hitDice: [3, 4] });

      expect(result.state.lastRoll?.isDouble).toBe(false);
    });

    it('should damage enemy on player hit', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 3 });

      expect(result.state.enemies[0].endurance).toBe(6);
    });

    it('should not damage enemy on player miss', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [5, 4] });

      expect(result.state.enemies[0].endurance).toBe(15);
    });

    it('should transition to enemy_turn after player hit', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 3 });

      expect(result.state.phase).toBe('enemy_turn');
    });

    it('should stay in player_attack on player miss', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [5, 4] });

      expect(result.state.phase).toBe('player_attack');
    });

    it('should handle enemy attack', () => {
      const state = createMockState({ phase: 'enemy_turn', currentAttacker: 'enemy' });
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [3, 3], damageDice: 2 });

      expect(result.state.phase).toBe('enemy_attack');
      expect(result.state.pendingDamage).toBeDefined();
    });

    it('should set pending damage on enemy hit', () => {
      const state = createMockState({
        phase: 'enemy_turn',
        currentAttacker: 'enemy',
        enemies: [{ ...createEnemyConfig(), dexterite: 7 }],
      });
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [3, 3], damageDice: 2 });

      expect(result.state.pendingDamage?.amount).toBe(5);
    });
  });

  describe('resolve - flee', () => {
    it('should apply flee damage and end combat', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'flee' });

      expect(result.state.player.endurance).toBe(28);
      expect(result.state.phase).toBe('defeat');
    });

    it('should create flee event', () => {
      const state = createMockState();
      const result = CombatEngine.resolve(state, { type: 'flee' });

      expect(result.events).toContainEqual(expect.objectContaining({ type: 'flee' }));
    });
  });

  describe('resolve - reroll', () => {
    it('should allow reroll with second chance ring', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
        usedReroll: false,
      });

      const result = CombatEngine.resolve(state, { type: 'reroll' }, { hitDice: [2, 3] });

      expect(result.state.lastRoll?.total).toBe(5);
      expect(result.state.usedReroll).toBe(true);
    });

    it('should apply damage on successful reroll', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
      });

      const result = CombatEngine.resolve(state, { type: 'reroll' }, { hitDice: [2, 2], damageDice: 4 });

      expect(result.state.enemies[0].endurance).toBe(5);
      expect(result.state.phase).toBe('enemy_turn');
    });

    it('should not apply damage on failed reroll', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
      });

      const result = CombatEngine.resolve(state, { type: 'reroll' }, { hitDice: [5, 4] });

      expect(result.state.enemies[0].endurance).toBe(15);
    });
  });

  describe('resolve - use_luck', () => {
    it('should reduce damage when luck test succeeds', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const result = CombatEngine.resolve(state, { type: 'use_luck' }, { luckDice: [2, 3] });

      expect(result.state.player.endurance).toBe(24);
    });

    it('should increase damage when luck test fails', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const result = CombatEngine.resolve(state, { type: 'use_luck' }, { luckDice: [4, 5] });

      expect(result.state.player.endurance).toBe(22);
    });

    it('should create luck_test event', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const result = CombatEngine.resolve(state, { type: 'use_luck' }, { luckDice: [2, 3] });

      expect(result.events).toContainEqual(expect.objectContaining({ type: 'luck_test', luckResult: 'success' }));
    });

    it('should clear pending damage after luck', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const result = CombatEngine.resolve(state, { type: 'use_luck' }, { luckDice: [2, 3] });

      expect(result.state.pendingDamage).toBeUndefined();
    });

    it('should not allow luck if pendingDamage missing', () => {
      const state = createMockState({ phase: 'enemy_attack' });

      const result = CombatEngine.resolve(state, { type: 'use_luck' });

      expect(result.state).toEqual(state);
    });
  });

  describe('resolve - block', () => {
    it('should clear pending damage', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: true },
      });

      const result = CombatEngine.resolve(state, { type: 'block' });

      expect(result.state.pendingDamage).toBeUndefined();
    });

    it('should not modify player endurance', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: true },
      });

      const result = CombatEngine.resolve(state, { type: 'block' });

      expect(result.state.player.endurance).toBe(state.player.endurance);
    });
  });

  describe('resolve - skip', () => {
    it('should advance phase on player_attack', () => {
      const state = createMockState({ phase: 'player_attack' });
      const result = CombatEngine.resolve(state, { type: 'skip' });

      expect(result.state.phase).toBe('enemy_turn');
    });

    it('should apply pending damage on enemy_attack', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const result = CombatEngine.resolve(state, { type: 'skip' });

      expect(result.state.player.endurance).toBe(23);
    });

    it('should clear pending damage after skip', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const result = CombatEngine.resolve(state, { type: 'skip' });

      expect(result.state.pendingDamage).toBeUndefined();
    });
  });

  describe('getAvailableActions', () => {
    it('should return attack and flee on player_turn', () => {
      const state = createMockState({ phase: 'player_turn' });
      const actions = CombatEngine.getAvailableActions(state);

      expect(actions.map((a) => a.action.type)).toContain('attack');
      expect(actions.map((a) => a.action.type)).toContain('flee');
    });

    it('should return reactions on player_attack miss', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
        usedReroll: false,
      });

      const actions = CombatEngine.getAvailableActions(state);

      expect(actions.map((a) => a.action.type)).toContain('reroll');
      expect(actions.map((a) => a.action.type)).toContain('skip');
    });

    it('should return defensive reactions on enemy_attack hit', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        pendingDamage: { amount: 7, canUseLuck: true, canBlock: false },
      });

      const actions = CombatEngine.getAvailableActions(state);

      expect(actions.map((a) => a.action.type)).toContain('use_luck');
      expect(actions.map((a) => a.action.type)).toContain('skip');
    });

    it('should not allow flee when endurance too low', () => {
      const state = createMockState({
        phase: 'player_turn',
        player: { ...createMockState().player, endurance: 2 },
      });
      const actions = CombatEngine.getAvailableActions(state);

      const fleeAction = actions.find((a) => a.action.type === 'flee');
      expect(fleeAction?.enabled).toBe(false);
    });

    it('should not allow reroll if already used', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
        usedReroll: true,
      });

      const actions = CombatEngine.getAvailableActions(state);

      const rerollAction = actions.find((a) => a.action.type === 'reroll');
      expect(rerollAction).toBeUndefined();
    });
  });

  describe('checkCombatEnd', () => {
    it('should return victory when all enemies dead', () => {
      const state = createMockState({ enemies: [{ ...createEnemyConfig(), endurance: 0 }] });
      expect(CombatEngine.checkCombatEnd(state)).toBe('victory');
    });

    it('should return defeat when player dead', () => {
      const state = createMockState({ player: { ...createMockState().player, endurance: 0 } });
      expect(CombatEngine.checkCombatEnd(state)).toBe('defeat');
    });

    it('should return ongoing when both alive', () => {
      const state = createMockState({
        player: { ...createMockState().player, endurance: 10 },
        enemies: [{ ...createEnemyConfig(), endurance: 5 }],
      });
      expect(CombatEngine.checkCombatEnd(state)).toBe('ongoing');
    });

    it('should return ongoing when some enemies alive', () => {
      const state = createMockState({
        enemies: [
          { ...createEnemyConfig(), endurance: 0 },
          { ...createEnemyConfig(), endurance: 5 },
        ],
      });
      expect(CombatEngine.checkCombatEnd(state)).toBe('ongoing');
    });
  });

  describe('phase transitions', () => {
    it('should transition player_turn -> player_attack on attack', () => {
      const state = createMockState({ phase: 'player_turn' });
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [5, 4] });

      expect(result.state.phase).toBe('player_attack');
    });

    it('should transition player_attack -> enemy_turn after hit', () => {
      const state = createMockState({ phase: 'player_turn' });
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 3 });

      expect(result.state.phase).toBe('enemy_turn');
    });

    it('should transition enemy_turn -> enemy_attack on attack', () => {
      const state = createMockState({
        phase: 'enemy_turn',
        currentAttacker: 'enemy',
        enemies: [{ ...createEnemyConfig(), dexterite: 7 }],
      });
      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2] });

      expect(result.state.phase).toBe('enemy_attack');
    });

    it('should increment roundNumber on round_end', () => {
      const state = createMockState({
        phase: 'enemy_attack',
        currentAttacker: 'enemy',
        pendingDamage: { amount: 5, canUseLuck: false, canBlock: false },
      });
      const result = CombatEngine.resolve(state, { type: 'skip' });

      expect(result.state.roundNumber).toBe(2);
    });
  });

  describe('complex scenarios', () => {
    it('should complete a full round', () => {
      let state = createMockState();

      const result1 = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 3 });
      state = result1.state;

      expect(state.enemies[0].endurance).toBe(6);

      const result2 = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 1 });
      state = result2.state;

      const result3 = CombatEngine.resolve(state, { type: 'skip' });
      state = result3.state;

      expect(state.roundNumber).toBe(2);
    });

    it('should achieve victory', () => {
      let state = createMockState({ enemies: [{ ...createEnemyConfig(), endurance: 5 }] });

      const result = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 5 });
      state = result.state;

      expect(CombatEngine.checkCombatEnd(state)).toBe('victory');
    });

    it('should achieve defeat', () => {
      let state = createMockState({ player: { ...createMockState().player, endurance: 5 } });

      const result1 = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 1 });
      state = result1.state;

      const result2 = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 1 });
      state = result2.state;

      const result3 = CombatEngine.resolve(state, { type: 'skip' });
      state = result3.state;

      const result4 = CombatEngine.resolve(state, { type: 'attack' }, { hitDice: [2, 2], damageDice: 5 });
      state = result4.state;

      const result5 = CombatEngine.resolve(state, { type: 'skip' });
      state = result5.state;

      expect(CombatEngine.checkCombatEnd(state)).toBe('defeat');
    });

    it('should handle reroll with success', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
      });

      const result = CombatEngine.resolve(state, { type: 'reroll' }, { hitDice: [2, 2], damageDice: 4 });

      expect(result.state.enemies[0].endurance).toBe(5);
      expect(result.state.usedReroll).toBe(true);
    });

    it('should handle reroll with failure', () => {
      const state = createMockState({
        phase: 'player_attack',
        lastRoll: { dice1: 5, dice2: 4, total: 9, success: false },
      });

      const result = CombatEngine.resolve(state, { type: 'reroll' }, { hitDice: [5, 4] });

      expect(result.state.enemies[0].endurance).toBe(15);
      expect(result.state.usedReroll).toBe(true);
    });
  });
});
