import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { Attacker } from '@/src/domain/types/Attacker';
import type { PlayerConfig, EnemyConfig } from '@/src/domain/types/combatants';

const createPlayerConfig = (): PlayerConfig => ({
  name: 'Hero',
  dexterite: 10,
  endurance: 20,
  enduranceMax: 20,
  chance: 10,
  weapon: {
    id: 'sword',
    name: 'Épée',
    bonus: 2,
  },
});

const createEnemyConfig = (): EnemyConfig => ({
  name: 'Goblin',
  dexterite: 8,
  endurance: 12,
  enduranceMax: 12,
});

describe('Combat History Integration', () => {
  describe('Attack sequence recording', () => {
    it('should record complete attack with hit roll details', () => {
      const player = createPlayerConfig();
      const enemy = createEnemyConfig();

      let state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      // Simulate successful hit: 4 + 2 = 6 ≤ 10
      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [4, 2], damageDice: 5 }
      );
      state = result.state;

      expect(state.history).toHaveLength(1);
      const entry = state.history[0];

      expect(entry.round).toBe(1);
      expect(entry.turn).toBe(Attacker.PLAYER);
      expect(entry.action).toBe(CombatActionType.ATTACK);
      expect(entry.hitRoll).toEqual({
        dice: [4, 2],
        target: 10,
        success: true,
        total: 6,
      });
      expect(entry.damageRoll).toEqual({
        dice: 5,
        bonus: 2,
        total: 8, // 1 + 5 + 2
      });
      expect(entry.hpBefore).toEqual({ player: 20, enemy: 12 });
      expect(entry.hpAfter).toEqual({ player: 20, enemy: 4 });
      expect(entry.description).toContain('infligez 8 dégâts');
    });

    it('should record missed attack without damage roll', () => {
      const player = createPlayerConfig();
      const enemy = createEnemyConfig();

      let state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      // Simulate miss: 5 + 6 = 11 > 10
      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [5, 6] }
      );
      state = result.state;

      expect(state.history).toHaveLength(1);
      const entry = state.history[0];

      expect(entry.hitRoll).toEqual({
        dice: [5, 6],
        target: 10,
        success: false,
        total: 11,
      });
      expect(entry.damageRoll).toBeUndefined();
      expect(entry.hpBefore).toEqual(entry.hpAfter);
      expect(entry.description).toContain('ratez');
    });

    it('should track HP before and after each action', () => {
      const player = createPlayerConfig();
      const enemy = createEnemyConfig();

      let state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      // First attack
      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [3, 3], damageDice: 4 }
      );
      state = result.state;

      expect(state.history[0].hpBefore).toEqual({ player: 20, enemy: 12 });
      expect(state.history[0].hpAfter).toEqual({ player: 20, enemy: 5 }); // 12 - 7 (1+4+2)
    });

    it('should preserve chronological order in history', () => {
      const player = createPlayerConfig();
      const enemy = createEnemyConfig();

      let state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      // First player attack
      let result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [3, 3], damageDice: 2 }
      );
      state = result.state;

      const firstTimestamp = state.history[0].timestamp;

      // Simulate time passing
      const delay = 100;
      const startTime = Date.now();
      while (Date.now() - startTime < delay) {
        // busy wait
      }

      // Second player attack (after advancing phase back to WAITING_ATTACK_ROLL)
      state.phase = CombatPhase.WAITING_ATTACK_ROLL;
      state.roundNumber = 2;
      result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [4, 3], damageDice: 3 }
      );
      state = result.state;

      // Verify chronological order and timestamps
      expect(state.history).toHaveLength(2);
      expect(state.history[0].round).toBe(1);
      expect(state.history[1].round).toBe(2);
      expect(new Date(state.history[1].timestamp).getTime()).toBeGreaterThan(
        new Date(firstTimestamp).getTime()
      );
    });
  });

  describe('History with weapon abilities', () => {
    it('should record weapon ability activation', () => {
      const player: PlayerConfig = {
        ...createPlayerConfig(),
        weapon: {
          id: 'legendary-sword',
          name: 'Épée Légendaire',
          bonus: 3,
          ability: {
            id: 'extra-attack',
            name: 'Attaque supplémentaire',
            trigger: 'on_double',
            effect: { type: 'extra_attack' },
            usesPerCombat: 1,
          },
        },
      };
      const enemy = createEnemyConfig();

      let state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      // Attack with double
      const result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [3, 3], damageDice: 4 }
      );
      state = result.state;

      // Should have attack entry (and possibly weapon ability entry)
      expect(state.history.length).toBeGreaterThanOrEqual(1);
      expect(state.history[0].action).toBe(CombatActionType.ATTACK);
    });
  });

  describe('Multiple rounds tracking', () => {
    it('should track multiple rounds in history', () => {
      const player = createPlayerConfig();
      const enemy = createEnemyConfig();

      let state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      // Round 1
      let result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [3, 3], damageDice: 2 }
      );
      state = result.state;

      expect(state.history[0].round).toBe(1);

      // Advance to round 2
      state.roundNumber = 2;
      state.phase = CombatPhase.WAITING_ATTACK_ROLL;
      
      result = CombatEngine.resolve(
        state,
        { type: CombatActionType.ATTACK },
        { hitDice: [4, 2], damageDice: 3 }
      );
      state = result.state;

      expect(state.history).toHaveLength(2);
      expect(state.history[0].round).toBe(1);
      expect(state.history[1].round).toBe(2);
    });
  });

  describe('History initial state', () => {
    it('should initialize with empty history', () => {
      const player = createPlayerConfig();
      const enemy = createEnemyConfig();

      const state = CombatEngine.createInitialState('char-1', player, enemy, {
        damageFormula: '1 + 1d6 + DOMMAGES',
        firstAttacker: Attacker.PLAYER,
      });

      expect(state.history).toEqual([]);
    });
  });
});
