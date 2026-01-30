import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import type { PlayerConfig, EnemyConfig, CombatConfig, CombatWeapon } from '@/src/domain/types/combatants';

describe('CombatEngine', () => {
  const mockPlayerConfig: PlayerConfig = {
    name: 'Test Player',
    dexterite: 12,
    endurance: 20,
    enduranceMax: 20,
    chance: 10,
    weapon: {
      id: 'sword',
      name: 'Épée',
      bonus: 3,
    } as CombatWeapon,
  };

  const mockEnemyConfig: EnemyConfig = {
    name: 'Test Enemy',
    dexterite: 10,
    endurance: 15,
    enduranceMax: 15,
  };

  const mockCombatConfig: CombatConfig = {
    damageFormula: '1d6',
  };

  describe('createInitialState', () => {
    it('should create initial combat state with correct values', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'player' }
      );

      expect(state.characterId).toBe('char-123');
      expect(state.player.name).toBe('Test Player');
      expect(state.player.totalDamageBonus).toBe(3); // weapon bonus
      expect(state.enemy.name).toBe('Test Enemy');
      expect(state.enemy.totalDamageBonus).toBe(0); // enemies have no weapons
      expect(state.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
      expect(state.currentTurn).toBe('player');
      expect(state.roundNumber).toBe(1);
      expect(state.usedReroll).toBe(false);
      expect(state.isFirstAttack).toBe(true);
      expect(state.usedAbilities).toEqual({});
      expect(state.usedItems).toEqual([]);
      expect(state.history).toEqual([]);
    });

    it('should set enemy as first attacker when specified', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'enemy' }
      );

      expect(state.currentTurn).toBe('enemy');
    });

    it('should default to player as first attacker', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      expect(state.currentTurn).toBe('player');
    });

    it('should generate unique combat IDs', () => {
      const state1 = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      const state2 = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      expect(state1.id).not.toBe(state2.id);
      expect(state1.id).toMatch(/^combat-\d+-[a-z0-9]+$/);
    });
  });

  describe('getAvailableActions', () => {
    it('should return attack action when waiting for attack roll on player turn', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'player' }
      );

      const actions = CombatEngine.getAvailableActions(state);

      expect(actions).toHaveLength(1);
      expect(actions[0].action.type).toBe(CombatActionType.ATTACK);
      expect(actions[0].enabled).toBe(true);
    });

    it('should return skip action when turn is complete', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      const completeTurnState = { ...state, phase: CombatPhase.TURN_COMPLETE };
      const actions = CombatEngine.getAvailableActions(completeTurnState);

      expect(actions).toHaveLength(1);
      expect(actions[0].action.type).toBe(CombatActionType.SKIP);
      expect(actions[0].enabled).toBe(true);
    });

    it('should return no manual actions on enemy turn', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'enemy' }
      );

      const actions = CombatEngine.getAvailableActions(state);

      expect(actions).toHaveLength(0);
    });
  });

  describe('resolve - ATTACK action', () => {
    it('should process attack and advance phase on hit', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'player' }
      );

      // Force a hit with dice override
      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [1, 1] } // total 2, hits dexterite 12
      );

      // En V3, après une attaque réussie, les dégâts sont appliqués immédiatement
      // donc la phase avance automatiquement à TURN_COMPLETE
      expect(result.state.phase).toBe(CombatPhase.TURN_COMPLETE);
      expect(result.state.currentTurn).toBe('player');
      expect(result.state.lastRoll).toBeDefined();
      expect(result.state.lastRoll?.success).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
      // Vérifier que les dégâts ont été appliqués
      expect(result.state.enemy.endurance).toBeLessThan(mockEnemyConfig.enduranceMax);
    });

    it('should process attack and advance phase on miss', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        { ...mockPlayerConfig, dexterite: 10 }, // Reduce dexterity to make 12 a miss
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'player' }
      );

      // Force a miss with dice override - total > dexterite
      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [6, 6] } // total 12, misses dexterite 10
      );

      expect(result.state.phase).toBe(CombatPhase.TURN_COMPLETE);
      expect(result.state.currentTurn).toBe('player');
      expect(result.state.lastRoll).toBeDefined();
      expect(result.state.lastRoll?.success).toBe(false);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('should not process attack if not in correct phase', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      const wrongPhaseState = { ...state, phase: CombatPhase.ENDED };
      const result = CombatEngine.resolve(
        wrongPhaseState,
        { type: CombatActionType.ATTACK }
      );

      expect(result.state).toEqual(wrongPhaseState);
      expect(result.events).toHaveLength(0);
    });

    it('should end combat when enemy is defeated', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        { ...mockEnemyConfig, endurance: 1, enduranceMax: 1 }, // Low HP enemy
        { ...mockCombatConfig, firstAttacker: 'player' }
      );

      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { 
          hitDice: [1, 1], // Hit
          damageDice: 6 // High damage to kill
        }
      );

      expect(result.state.phase).toBe(CombatPhase.ENDED);
      expect(result.state.enemy.endurance).toBeLessThanOrEqual(0);
      
      // Should have combat end event
      const combatEndEvent = result.events.find(e => e.result === 'victory');
      expect(combatEndEvent).toBeDefined();
    });
  });

  describe('resolve - SKIP action', () => {
    it('should advance to next turn when skipping', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      const turnCompleteState = { 
        ...state, 
        phase: CombatPhase.TURN_COMPLETE,
        currentTurn: 'player' as const
      };
      
      const result = CombatEngine.resolve(
        turnCompleteState,
        { type: CombatActionType.SKIP }
      );

      expect(result.state.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
      expect(result.state.currentTurn).toBe('enemy');
      expect(result.state.roundNumber).toBe(1); // Same round
      expect(result.events).toHaveLength(0);
    });

    it('should increment round when enemy completes turn', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      const enemyTurnCompleteState = { 
        ...state, 
        phase: CombatPhase.TURN_COMPLETE,
        currentTurn: 'enemy' as const
      };
      
      const result = CombatEngine.resolve(
        enemyTurnCompleteState,
        { type: CombatActionType.SKIP }
      );

      expect(result.state.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
      expect(result.state.currentTurn).toBe('player');
      expect(result.state.roundNumber).toBe(2); // New round
    });
  });

  describe('resolve - REROLL action', () => {
    it('should allow reroll for player when not used yet', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      // Setup state with a failed attack roll
      const stateWithFailedRoll = {
        ...state,
        lastRoll: {
          dice1: 6,
          dice2: 6,
          total: 12,
          success: false,
        },
        usedReroll: false,
      };

      const result = CombatEngine.resolve(
        stateWithFailedRoll,
        { type: CombatActionType.REROLL },
        { hitDice: [1, 1] } // Better roll
      );

      expect(result.state.usedReroll).toBe(true);
      expect(result.state.lastRoll?.total).toBe(2);
      expect(result.state.lastRoll?.success).toBe(true);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('should not allow reroll on enemy turn', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        { ...mockCombatConfig, firstAttacker: 'enemy' }
      );

      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.REROLL }
      );

      expect(result.state).toEqual(state);
      expect(result.events).toHaveLength(0);
    });
  });

  describe('resolve - unknown action', () => {
    it('should return unchanged state for unknown action types', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      const result = CombatEngine.resolve(
        state,
        { type: 'UNKNOWN_ACTION' as CombatActionType }
      );

      expect(result.state).toEqual(state);
      expect(result.events).toHaveLength(0);
    });
  });

  describe('combat already ended', () => {
    it('should not process actions when combat is already ended', () => {
      const state = CombatEngine.createInitialState(
        'char-123',
        mockPlayerConfig,
        mockEnemyConfig,
        mockCombatConfig
      );

      // Set enemy to 0 endurance (defeated)
      const endedState = {
        ...state,
        enemy: { ...state.enemy, endurance: 0 },
        phase: CombatPhase.ENDED,
      };

      const result = CombatEngine.resolve(
        endedState,
        { type: CombatActionType.ATTACK }
      );

      expect(result.state).toEqual(endedState);
      expect(result.events).toHaveLength(0);
    });
  });
});