import { describe, it, expect } from 'vitest';
import { HistoryManager } from '@/src/domain/services/combat/HistoryManager';
import type { CombatState } from '@/src/domain/types/combat-v2';
import type { CombatHistoryEntry } from '@/src/domain/types/combat-history';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { Attacker } from '@/src/domain/types/Attacker';
import { CombatActionType } from '@/src/domain/types/CombatActionType';

const createMockState = (playerEndurance: number, enemyEndurance: number): CombatState => ({
  id: 'combat-1',
  characterId: 'char-1',
  player: {
    name: 'Hero',
    dexterite: 10,
    endurance: playerEndurance,
    enduranceMax: 20,
    chance: 10,
    weapon: {
      id: 'sword',
      name: 'Épée',
      bonus: 2,
    },
    weaponDamage: 2,
    passiveDamageBonus: 0,
    totalDamageBonus: 2,
  },
  enemy: {
    name: 'Goblin',
    dexterite: 8,
    endurance: enemyEndurance,
    enduranceMax: 10,
    weaponDamage: 0,
    passiveDamageBonus: 0,
    totalDamageBonus: 0,
  },
  phase: CombatPhase.WAITING_ATTACK_ROLL,
  roundNumber: 1,
  currentAttacker: Attacker.PLAYER,
  config: {
    damageFormula: '1 + 1d6 + DOMMAGES',
    firstAttacker: Attacker.PLAYER,
  },
  usedAbilities: {},
  usedReroll: false,
  isFirstAttack: true,
  usedItems: [],
  history: [],
  events: [],
});

describe('HistoryManager', () => {
  describe('createHPSnapshot', () => {
    it('should capture current HP from state', () => {
      const state = createMockState(18, 12);
      
      const snapshot = HistoryManager.createHPSnapshot(state);
      
      expect(snapshot).toEqual({
        player: 18,
        enemy: 12,
      });
    });
  });

  describe('createHitRollDetails', () => {
    it('should convert DiceRoll to HitRollDetails', () => {
      const diceRoll = {
        dice1: 4,
        dice2: 2,
        total: 6,
        success: true,
      };
      
      const details = HistoryManager.createHitRollDetails(diceRoll, 7);
      
      expect(details).toEqual({
        dice: [4, 2],
        target: 7,
        success: true,
        total: 6,
      });
    });

    it('should handle failed rolls', () => {
      const diceRoll = {
        dice1: 5,
        dice2: 5,
        total: 10,
        success: false,
      };
      
      const details = HistoryManager.createHitRollDetails(diceRoll, 7);
      
      expect(details.success).toBe(false);
    });
  });

  describe('createDamageRollDetails', () => {
    it('should create damage roll details correctly', () => {
      const details = HistoryManager.createDamageRollDetails(5, 2, 8);
      
      expect(details).toEqual({
        dice: 5,
        bonus: 2,
        total: 8,
      });
    });
  });

  describe('addEntry', () => {
    it('should add entry with generated ID', () => {
      const state = createMockState(18, 12);
      const entry: Omit<CombatHistoryEntry, 'id'> = {
        round: 1,
        turn: Attacker.PLAYER,
        action: CombatActionType.ATTACK,
        hpBefore: { player: 18, enemy: 12 },
        hpAfter: { player: 18, enemy: 4 },
        timestamp: '2026-01-20T12:00:00Z',
        description: 'Vous touchez l\'ennemi et infligez 8 dégâts',
      };
      
      const newHistory = HistoryManager.addEntry(state, entry);
      
      expect(newHistory).toHaveLength(1);
      expect(newHistory[0]).toMatchObject(entry);
      expect(newHistory[0].id).toMatch(/^hist-/);
    });

    it('should preserve chronological order', () => {
      const state = createMockState(18, 12);
      
      const entry1: Omit<CombatHistoryEntry, 'id'> = {
        round: 1,
        turn: Attacker.PLAYER,
        action: CombatActionType.ATTACK,
        hpBefore: { player: 18, enemy: 12 },
        hpAfter: { player: 18, enemy: 10 },
        timestamp: '2026-01-20T12:00:00Z',
        description: 'First attack',
      };
      
      const history1 = HistoryManager.addEntry(state, entry1);
      
      const entry2: Omit<CombatHistoryEntry, 'id'> = {
        round: 1,
        turn: Attacker.ENEMY,
        action: CombatActionType.ATTACK,
        hpBefore: { player: 18, enemy: 10 },
        hpAfter: { player: 15, enemy: 10 },
        timestamp: '2026-01-20T12:00:01Z',
        description: 'Enemy attack',
      };
      
      const stateWithHistory = { ...state, history: history1 };
      const newHistory = HistoryManager.addEntry(stateWithHistory, entry2);
      
      expect(newHistory).toHaveLength(2);
      expect(newHistory[0].description).toBe('First attack');
      expect(newHistory[1].description).toBe('Enemy attack');
    });
  });

  describe('filterByRound', () => {
    it('should filter entries by round number', () => {
      const history: CombatHistoryEntry[] = [
        {
          id: 'hist-1',
          round: 1,
          turn: Attacker.PLAYER,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 12 },
          hpAfter: { player: 18, enemy: 10 },
          timestamp: '2026-01-20T12:00:00Z',
          description: 'Round 1',
        },
        {
          id: 'hist-2',
          round: 2,
          turn: Attacker.PLAYER,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 10 },
          hpAfter: { player: 18, enemy: 5 },
          timestamp: '2026-01-20T12:00:10Z',
          description: 'Round 2',
        },
        {
          id: 'hist-3',
          round: 1,
          turn: Attacker.ENEMY,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 10 },
          hpAfter: { player: 15, enemy: 10 },
          timestamp: '2026-01-20T12:00:05Z',
          description: 'Round 1 enemy',
        },
      ];
      
      const round1Entries = HistoryManager.filterByRound(history, 1);
      
      expect(round1Entries).toHaveLength(2);
      expect(round1Entries[0].round).toBe(1);
      expect(round1Entries[1].round).toBe(1);
    });
  });

  describe('filterByTurn', () => {
    it('should filter entries by attacker', () => {
      const history: CombatHistoryEntry[] = [
        {
          id: 'hist-1',
          round: 1,
          turn: Attacker.PLAYER,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 12 },
          hpAfter: { player: 18, enemy: 10 },
          timestamp: '2026-01-20T12:00:00Z',
          description: 'Player attack',
        },
        {
          id: 'hist-2',
          round: 1,
          turn: Attacker.ENEMY,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 10 },
          hpAfter: { player: 15, enemy: 10 },
          timestamp: '2026-01-20T12:00:05Z',
          description: 'Enemy attack',
        },
      ];
      
      const playerEntries = HistoryManager.filterByTurn(history, Attacker.PLAYER);
      
      expect(playerEntries).toHaveLength(1);
      expect(playerEntries[0].turn).toBe(Attacker.PLAYER);
    });
  });

  describe('filterByAction', () => {
    it('should filter entries by action type', () => {
      const history: CombatHistoryEntry[] = [
        {
          id: 'hist-1',
          round: 1,
          turn: Attacker.PLAYER,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 12 },
          hpAfter: { player: 18, enemy: 10 },
          timestamp: '2026-01-20T12:00:00Z',
          description: 'Attack',
        },
        {
          id: 'hist-2',
          round: 1,
          turn: Attacker.PLAYER,
          action: CombatActionType.USE_ITEM,
          hpBefore: { player: 15, enemy: 10 },
          hpAfter: { player: 20, enemy: 10 },
          timestamp: '2026-01-20T12:00:05Z',
          description: 'Use item',
        },
      ];
      
      const attackEntries = HistoryManager.filterByAction(history, CombatActionType.ATTACK);
      
      expect(attackEntries).toHaveLength(1);
      expect(attackEntries[0].action).toBe(CombatActionType.ATTACK);
    });
  });

  describe('getLastEntry', () => {
    it('should return last entry in history', () => {
      const history: CombatHistoryEntry[] = [
        {
          id: 'hist-1',
          round: 1,
          turn: Attacker.PLAYER,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 12 },
          hpAfter: { player: 18, enemy: 10 },
          timestamp: '2026-01-20T12:00:00Z',
          description: 'First',
        },
        {
          id: 'hist-2',
          round: 1,
          turn: Attacker.ENEMY,
          action: CombatActionType.ATTACK,
          hpBefore: { player: 18, enemy: 10 },
          hpAfter: { player: 15, enemy: 10 },
          timestamp: '2026-01-20T12:00:05Z',
          description: 'Last',
        },
      ];
      
      const lastEntry = HistoryManager.getLastEntry(history);
      
      expect(lastEntry?.description).toBe('Last');
    });

    it('should return undefined for empty history', () => {
      const lastEntry = HistoryManager.getLastEntry([]);
      
      expect(lastEntry).toBeUndefined();
    });
  });

  describe('generateAttackDescription', () => {
    it('should generate description for successful player attack', () => {
      const description = HistoryManager.generateAttackDescription(Attacker.PLAYER, true, 8);
      
      expect(description).toBe('Vous touchez l\'ennemi et infligez 8 dégâts');
    });

    it('should generate description for missed player attack', () => {
      const description = HistoryManager.generateAttackDescription(Attacker.PLAYER, false);
      
      expect(description).toBe('Vous ratez l\'ennemi');
    });

    it('should generate description for successful enemy attack', () => {
      const description = HistoryManager.generateAttackDescription(Attacker.ENEMY, true, 5);
      
      expect(description).toBe('L\'ennemi touche vous et inflige 5 dégâts');
    });

    it('should generate description for missed enemy attack', () => {
      const description = HistoryManager.generateAttackDescription(Attacker.ENEMY, false);
      
      expect(description).toBe('L\'ennemi rate vous');
    });
  });

  describe('generateItemDescription', () => {
    it('should generate item usage description', () => {
      const description = HistoryManager.generateItemDescription('Potion de soin');
      
      expect(description).toBe('Vous utilisez Potion de soin');
    });
  });

  describe('generateAbilityDescription', () => {
    it('should generate ability usage description', () => {
      const description = HistoryManager.generateAbilityDescription('Attaque éclair');
      
      expect(description).toBe('Vous utilisez Attaque éclair');
    });
  });

  describe('generateBlockDescription', () => {
    it('should generate block description', () => {
      const description = HistoryManager.generateBlockDescription(6);
      
      expect(description).toBe('Vous bloquez 6 dégâts');
    });
  });

  describe('generateRerollDescription', () => {
    it('should generate reroll description', () => {
      const description = HistoryManager.generateRerollDescription();
      
      expect(description).toBe('Vous relancez les dés');
    });
  });
});
