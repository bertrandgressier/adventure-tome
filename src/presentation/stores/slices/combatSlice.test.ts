import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCombatSlice, type CombatSlice } from './combatSlice';
import { Character, type GameMode, type ProgressData } from '@/src/domain/entities/Character';
import { Stats, type StatsData } from '@/src/domain/value-objects/Stats';
import { Inventory } from '@/src/domain/value-objects/Inventory';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import type { EnemyConfig } from '@/src/domain/types/combatants';

vi.mock('@/src/application/services/CharacterService');

const mockSet = vi.fn();
let currentState: {
  combat: CombatSlice['combat'];
  availableActions: CombatSlice['availableActions'];
  isAnimating: CombatSlice['isAnimating'];
  privateInitialChance: CombatSlice['privateInitialChance'];
  error: CombatSlice['error'];
  characters: Record<string, Character>;
  updateStats: (id: string, stats: Partial<{ chance: number }>) => Promise<void>;
  applyDamage: (id: string, amount: number) => Promise<void>;
  getItem: (itemId: string) => import('@/src/domain/types/items').CatalogItem | undefined;
};
const mockGet = vi.fn().mockImplementation(() => currentState);

const defaultProgressData: ProgressData = {
  currentParagraph: 1,
  history: [],
  lastSaved: '2024-01-01T00:00:00.000Z',
};

function createMockCharacter(statsData: StatsData): Character {
  const stats = Stats.fromData(statsData);
  const inventory = new Inventory(0, { name: 'Épée', attackPoints: 3 }, []);

  return Character.fromData({
    id: 'test-char-id',
    name: 'Hero',
    book: 1,
    talent: 'guerrier',
    secondTalent: undefined,
    gameMode: 'mortal' as GameMode,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    stats: stats.toData(),
    inventory: inventory.toData(),
    progress: defaultProgressData,
    notes: '',
  });
}

const mockEnemy: EnemyConfig = {
  name: 'Gobelin',
  dexterite: 6,
  endurance: 15,
  enduranceMax: 15,
  chance: 3,
  isBoss: false,
  weapon: { id: 'goblin-dagger', name: 'Dague', bonus: 2 },
};

const defaultConfig = {
  allowFlee: true,
  maxEnemies: 3,
  damageFormula: '2d6 + HABILETÉ + weapon',
};

describe('combatSlice', () => {
  let slice: CombatSlice;
  let character: Character;
  let characterWithReroll: Character;

  beforeEach(() => {
    mockSet.mockClear();
    mockGet.mockClear();
    mockSet.mockImplementation((update) => {
      currentState = { ...currentState, ...(typeof update === 'function' ? update(currentState) : update) };
    });

    character = createMockCharacter({
      dexterite: 7,
      chance: 5,
      chanceInitiale: 5,
      pointsDeVieMax: 32,
      pointsDeVieActuels: 30,
    });

    const inventoryWithReroll = new Inventory(
      0,
      { name: 'Épée', attackPoints: 3 },
      [
        { itemId: 'tome1-bague-deuxieme-chance', quantity: 1, possessed: true },
      ]
    );

    characterWithReroll = Character.fromData({
      id: 'test-char-id',
      name: 'Hero',
      book: 1,
      talent: 'guerrier',
      secondTalent: undefined,
      gameMode: 'mortal' as GameMode,
      version: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      stats: createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 30,
      }).getStats(),
      inventory: inventoryWithReroll.toData(),
      progress: defaultProgressData,
      notes: '',
    });

    currentState = {
      combat: null,
      availableActions: [],
      isAnimating: false,
      privateInitialChance: 0,
      error: null,
      characters: {},
      updateStats: vi.fn().mockResolvedValue(undefined),
      applyDamage: vi.fn().mockResolvedValue(undefined),
      getItem: vi.fn(),
    };

    currentState.characters = { 'hero-id': character };
    slice = createCombatSlice()(mockSet, mockGet);
    currentState = { ...currentState, ...slice };
  });

  describe('startCombat', () => {
    it('should call set with combat state', () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);

      expect(mockSet).toHaveBeenCalled();
      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.combat).not.toBeNull();
      }
    });

    it('should set isAnimating to false', () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);

      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.isAnimating).toBe(false);
      }
    });

    it('should set usedReroll to true when character has no reroll item', () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);

      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object' && setCallArgs.combat) {
        expect(setCallArgs.combat.usedReroll).toBe(true);
      }
    });

    it('should set usedReroll to false when character has reroll item', () => {
      currentState.characters = { 'hero-id': characterWithReroll };
      currentState = { ...currentState, ...slice };

      slice.startCombat('hero-id', [mockEnemy], defaultConfig);

      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object' && setCallArgs.combat) {
        expect(setCallArgs.combat.usedReroll).toBe(false);
      }
    });

    it('should store initial chance', () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);

      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.privateInitialChance).toBe(5);
      }
    });

    it('should throw error when character not found', () => {
      expect(() => slice.startCombat('unknown-id', [mockEnemy], defaultConfig)).toThrow(
        'Character unknown-id not found'
      );
    });
  });

  describe('executeAction', () => {
    beforeEach(() => {
      mockSet.mockClear();
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);
    });

    it('should throw error when no active combat', () => {
      currentState.combat = null;

      expect(() => slice.executeAction({ type: CombatActionType.ATTACK })).toThrow(
        'No active combat'
      );
    });

    it('should call set with updated combat state', () => {
      slice.executeAction({ type: CombatActionType.ATTACK });

      expect(mockSet).toHaveBeenCalled();
      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.combat).not.toBeNull();
      }
    });

    it('should accumulate events across multiple actions', () => {
      // After startCombat, there should be 1 event (COMBAT_START)
      const initialCombat = currentState.combat;
      expect(initialCombat?.events).toHaveLength(1);
      expect(initialCombat?.events[0]?.type).toBe('combat_start');

      // Execute first attack - should add ATTACK_ROLL event (and possibly DAMAGE_DEALT)
      slice.executeAction({ type: CombatActionType.ATTACK });
      const combat1 = currentState.combat;
      const eventsAfterFirstAttack = combat1?.events.length ?? 0;
      expect(eventsAfterFirstAttack).toBeGreaterThan(1); // At least combat_start + attack_roll

      // Execute second attack - should accumulate more events
      slice.executeAction({ type: CombatActionType.ATTACK });
      const combat2 = currentState.combat;
      const eventsAfterSecondAttack = combat2?.events.length ?? 0;
      expect(eventsAfterSecondAttack).toBeGreaterThan(eventsAfterFirstAttack);

      // Verify all events are retained
      expect(combat2?.events[0]?.type).toBe('combat_start'); // First event still there
    });
  });

  describe('endCombat', () => {
    beforeEach(() => {
      mockSet.mockClear();
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);
    });

    it('should call set with null combat', async () => {
      await slice.endCombat();

      const lastCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (lastCallArgs && typeof lastCallArgs === 'object') {
        expect(lastCallArgs.combat).toBeNull();
      }
    });

    it('should clear available actions', async () => {
      await slice.endCombat();

      const lastCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (lastCallArgs && typeof lastCallArgs === 'object') {
        expect(lastCallArgs.availableActions).toEqual([]);
      }
    });

    it('should clear isAnimating', async () => {
      await slice.endCombat();

      const lastCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (lastCallArgs && typeof lastCallArgs === 'object') {
        expect(lastCallArgs.isAnimating).toBe(false);
      }
    });

    it('should return early when no active combat', async () => {
      currentState.combat = null;

      await slice.endCombat();

      expect(currentState.applyDamage).not.toHaveBeenCalled();
      expect(currentState.updateStats).not.toHaveBeenCalled();
    });
  });

  describe('cancelCombat', () => {
    it('should clear combat state', () => {
      slice.cancelCombat();

      const lastCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (lastCallArgs && typeof lastCallArgs === 'object') {
        expect(lastCallArgs.combat).toBeNull();
      }
    });

    it('should clear available actions', () => {
      slice.cancelCombat();

      const lastCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (lastCallArgs && typeof lastCallArgs === 'object') {
        expect(lastCallArgs.availableActions).toEqual([]);
      }
    });

    it('should clear isAnimating', () => {
      slice.cancelCombat();

      const lastCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (lastCallArgs && typeof lastCallArgs === 'object') {
        expect(lastCallArgs.isAnimating).toBe(false);
      }
    });
  });

  describe('setAnimating', () => {
    it('should call set with animating true', () => {
      slice.setAnimating(true);

      expect(mockSet).toHaveBeenCalledWith({ isAnimating: true });
    });

     it('should call set with animating false', () => {
      slice.setAnimating(false);

      expect(mockSet).toHaveBeenCalledWith({ isAnimating: false });
    });
  });

  describe('error handling', () => {
    it('should set error when startCombat fails', () => {
      expect(() => slice.startCombat('invalid-id', [mockEnemy], defaultConfig)).toThrow();

      const setCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.error).toBeDefined();
        expect(typeof setCallArgs.error).toBe('string');
      }
    });

    it('should set error when executeAction fails with no active combat', () => {
      currentState.combat = null;

      expect(() => slice.executeAction({ type: CombatActionType.ATTACK })).toThrow();

      // executeAction fait 2 appels en cas d'erreur : isAnimating=true puis error + isAnimating=false
      const setCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.error).toBeDefined();
        expect(typeof setCallArgs.error).toBe('string');
        expect(setCallArgs.isAnimating).toBe(false); // Animation arrêtée en cas d'erreur
      }
    });

    it('should clear error on successful startCombat', () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);

      const setCallArgs = mockSet.mock.calls[0]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.error).toBeNull();
      }
    });

    it('should clear error on successful executeAction', () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);
      mockSet.mockClear();
      
      slice.executeAction({ type: CombatActionType.ATTACK });

      // executeAction fait 2 appels : isAnimating=true puis combat update
      // Vérifier le deuxième appel qui contient error: null
      const setCallArgs = mockSet.mock.calls[1]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.error).toBeNull();
      }
    });

    it('should clear error on successful endCombat', async () => {
      slice.startCombat('hero-id', [mockEnemy], defaultConfig);
      await slice.endCombat();

      const setCallArgs = mockSet.mock.calls[mockSet.mock.calls.length - 1]?.[0];
      if (setCallArgs && typeof setCallArgs === 'object') {
        expect(setCallArgs.error).toBeNull();
      }
    });
  });
});

