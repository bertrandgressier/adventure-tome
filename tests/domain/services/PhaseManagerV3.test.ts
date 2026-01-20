import { describe, it, expect } from 'vitest';
import { PhaseManagerV3 } from '../../../src/domain/services/combat/PhaseManagerV3';
import { CombatPhaseV3 } from '../../../src/domain/types/CombatPhaseV3';
import type { CombatStateV3 } from '../../../src/domain/types/combat-state';
import { CombatEventType } from '../../../src/domain/types/CombatEventType';

describe('PhaseManagerV3', () => {
  const createMockState = (
    phase: CombatPhaseV3,
    currentTurn: 'player' | 'enemy',
    roundNumber: number,
    overrides?: Partial<CombatStateV3>
  ): CombatStateV3 => ({
    id: 'test-combat',
    characterId: 'test-char',
    player: {
      name: 'Hero',
      dexterite: 10,
      endurance: 20,
      enduranceMax: 20,
      chance: 10,
      weaponDamage: 2,
      passiveDamageBonus: 0,
      totalDamageBonus: 2,
      weapon: {
        id: 'sword',
        name: 'Épée',
        bonus: 2,
      },
    },
    enemy: {
      name: 'Goblin',
      dexterite: 8,
      endurance: 10,
      enduranceMax: 10,
      weaponDamage: 0,
      passiveDamageBonus: 0,
      totalDamageBonus: 0,
    },
    phase,
    currentTurn,
    roundNumber,
    usedAbilities: {},
    usedReroll: false,
    isFirstAttack: true,
    config: {
      damageFormula: '1d6',
      firstAttacker: 'player',
      isSurprise: false,
    },
    events: [
      {
        type: CombatEventType.COMBAT_START,
        timestamp: new Date().toISOString(),
        round: 1,
      },
    ],
    usedItems: [],
    ...overrides,
  });

  describe('getInitialPhase', () => {
    it('should return WAITING_ATTACK_ROLL as initial phase', () => {
      const phase = PhaseManagerV3.getInitialPhase();
      expect(phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
    });
  });

  describe('getInitialTurn', () => {
    it('should start with player turn when firstAttacker is player', () => {
      const turn = PhaseManagerV3.getInitialTurn('player');
      expect(turn).toBe('player');
    });

    it('should start with enemy turn when firstAttacker is enemy', () => {
      const turn = PhaseManagerV3.getInitialTurn('enemy');
      expect(turn).toBe('enemy');
    });
  });

  describe('advancePhase - attack roll transitions', () => {
    it('should transition to waiting_damage_roll on successful hit', () => {
      const state = createMockState(CombatPhaseV3.WAITING_ATTACK_ROLL, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, { hit: true });

      expect(result.phase).toBe(CombatPhaseV3.WAITING_DAMAGE_ROLL);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(1);
    });

    it('should transition to turn_complete on miss', () => {
      const state = createMockState(CombatPhaseV3.WAITING_ATTACK_ROLL, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, { hit: false });

      expect(result.phase).toBe(CombatPhaseV3.TURN_COMPLETE);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(1);
    });

    it('should transition to ended when combat ends during attack', () => {
      const state = createMockState(CombatPhaseV3.WAITING_ATTACK_ROLL, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, { hit: true, combatEnded: true });

      expect(result.phase).toBe(CombatPhaseV3.ENDED);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(1);
    });
  });

  describe('advancePhase - damage roll transitions', () => {
    it('should transition to turn_complete after damage roll', () => {
      const state = createMockState(CombatPhaseV3.WAITING_DAMAGE_ROLL, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, {});

      expect(result.phase).toBe(CombatPhaseV3.TURN_COMPLETE);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(1);
    });

    it('should transition to ended when combat ends after damage', () => {
      const state = createMockState(CombatPhaseV3.WAITING_DAMAGE_ROLL, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, { combatEnded: true });

      expect(result.phase).toBe(CombatPhaseV3.ENDED);
    });
  });

  describe('advancePhase - turn complete transitions', () => {
    it('should alternate turns after turn_complete (player to enemy)', () => {
      const state = createMockState(CombatPhaseV3.TURN_COMPLETE, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, {});

      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('enemy');
      expect(result.roundNumber).toBe(1); // Same round
    });

    it('should alternate turns after turn_complete (enemy to player)', () => {
      const state = createMockState(CombatPhaseV3.TURN_COMPLETE, 'enemy', 1);
      const result = PhaseManagerV3.advancePhase(state, {});

      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(2); // New round
    });

    it('should increment roundNumber after both turns (enemy turn complete)', () => {
      const state = createMockState(CombatPhaseV3.TURN_COMPLETE, 'enemy', 1);
      const result = PhaseManagerV3.advancePhase(state, {});

      expect(result.roundNumber).toBe(2);
    });

    it('should NOT increment roundNumber after player turn complete', () => {
      const state = createMockState(CombatPhaseV3.TURN_COMPLETE, 'player', 1);
      const result = PhaseManagerV3.advancePhase(state, {});

      expect(result.roundNumber).toBe(1);
    });
  });

  describe('advancePhase - combat end conditions', () => {
    it('should end combat when player HP reaches 0', () => {
      const state = createMockState(
        CombatPhaseV3.WAITING_DAMAGE_ROLL,
        'enemy',
        2,
        {
          player: {
            name: 'Hero',
            dexterite: 10,
            endurance: 0, // Dead
            enduranceMax: 20,
            chance: 10,
            weaponDamage: 2,
            passiveDamageBonus: 0,
            totalDamageBonus: 2,
            weapon: {
              id: 'sword',
              name: 'Épée',
              bonus: 2,
            },
          },
        }
      );

      const result = PhaseManagerV3.advancePhase(state, { combatEnded: true });

      expect(result.phase).toBe(CombatPhaseV3.ENDED);
    });

    it('should end combat when enemy HP reaches 0', () => {
      const state = createMockState(
        CombatPhaseV3.WAITING_DAMAGE_ROLL,
        'player',
        2,
        {
          enemy: {
            name: 'Goblin',
            dexterite: 8,
            endurance: 0, // Dead
            enduranceMax: 10,
            weaponDamage: 0,
            passiveDamageBonus: 0,
            totalDamageBonus: 0,
          },
        }
      );

      const result = PhaseManagerV3.advancePhase(state, { combatEnded: true });

      expect(result.phase).toBe(CombatPhaseV3.ENDED);
    });
  });

  describe('skipToNextTurn', () => {
    it('should advance to next turn from turn_complete', () => {
      const state = createMockState(CombatPhaseV3.TURN_COMPLETE, 'player', 1);
      const result = PhaseManagerV3.skipToNextTurn(state);

      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('enemy');
      expect(result.roundNumber).toBe(1);
    });

    it('should NOT change phase if not in turn_complete', () => {
      const state = createMockState(CombatPhaseV3.WAITING_ATTACK_ROLL, 'player', 1);
      const result = PhaseManagerV3.skipToNextTurn(state);

      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(1);
    });

    it('should increment round when enemy completes turn', () => {
      const state = createMockState(CombatPhaseV3.TURN_COMPLETE, 'enemy', 1);
      const result = PhaseManagerV3.skipToNextTurn(state);

      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(2);
    });
  });

  describe('complete combat flow', () => {
    it('should follow correct flow: player hit → damage → enemy miss → complete round', () => {
      // Round 1 - Player turn
      let state = createMockState(CombatPhaseV3.WAITING_ATTACK_ROLL, 'player', 1);

      // Player attacks and hits
      let result = PhaseManagerV3.advancePhase(state, { hit: true });
      expect(result.phase).toBe(CombatPhaseV3.WAITING_DAMAGE_ROLL);
      expect(result.currentTurn).toBe('player');

      // Player rolls damage
      state = { ...state, phase: result.phase };
      result = PhaseManagerV3.advancePhase(state, {});
      expect(result.phase).toBe(CombatPhaseV3.TURN_COMPLETE);
      expect(result.currentTurn).toBe('player');

      // Skip to enemy turn
      state = { ...state, phase: result.phase };
      result = PhaseManagerV3.skipToNextTurn(state);
      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('enemy');
      expect(result.roundNumber).toBe(1);

      // Enemy attacks and misses
      state = { ...state, phase: result.phase, currentTurn: result.currentTurn };
      result = PhaseManagerV3.advancePhase(state, { hit: false });
      expect(result.phase).toBe(CombatPhaseV3.TURN_COMPLETE);
      expect(result.currentTurn).toBe('enemy');

      // Skip to next round (player turn)
      state = { ...state, phase: result.phase, roundNumber: result.roundNumber };
      result = PhaseManagerV3.skipToNextTurn(state);
      expect(result.phase).toBe(CombatPhaseV3.WAITING_ATTACK_ROLL);
      expect(result.currentTurn).toBe('player');
      expect(result.roundNumber).toBe(2);
    });
  });
});
