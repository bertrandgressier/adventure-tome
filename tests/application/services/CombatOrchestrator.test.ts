import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatOrchestrator, type CombatPersistenceChanges } from '@/src/application/services/CombatOrchestrator';
import { Character, type GameMode } from '@/src/domain/entities/Character';
import { Stats, type StatsData } from '@/src/domain/value-objects/Stats';
import { Inventory } from '@/src/domain/value-objects/Inventory';
import type { ProgressData } from '@/src/domain/entities/Character';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import type { EnemyConfig } from '@/src/domain/types/combatants';
import type { CharacterService } from '@/src/application/services/CharacterService';
import { CombatEventType } from '@/src/domain/types/CombatEventType';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import type { CombatState, CombatEvent } from '@/src/domain/types/combat-state';

const defaultProgressData: ProgressData = {
  currentParagraph: 1,
  history: [],
  lastSaved: '2024-01-01T00:00:00.000Z',
};

function createMockCharacter(statsData: StatsData, inventory?: Inventory): Character {
  const stats = Stats.fromData(statsData);
  const defaultInventory = new Inventory(0, { name: 'Épée', attackPoints: 3 }, []);

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
    inventory: (inventory ?? defaultInventory).toData(),
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

describe('CombatOrchestrator', () => {
  let orchestrator: CombatOrchestrator;
  let mockCharacterService: CharacterService;

  beforeEach(() => {
    mockCharacterService = {
      getCharacter: vi.fn(),
      applyDamage: vi.fn(),
      updateCharacterStats: vi.fn(),
      removeItemQuantity: vi.fn(),
    } as unknown as CharacterService;

    orchestrator = new CombatOrchestrator(mockCharacterService, vi.fn());
  });

  describe('prepareCombatantFromCharacter', () => {
    it('should extract basic stats', () => {
      const character = createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 28,
      });

      const combatant = orchestrator.prepareCombatantFromCharacter(character);

      expect(combatant.name).toBe('Hero');
      expect(combatant.dexterite).toBe(7);
      expect(combatant.chance).toBe(5);
      expect(combatant.endurance).toBe(28);
      expect(combatant.enduranceMax).toBe(32);
    });

    it('should extract weapon from inventory', () => {
      const inventory = new Inventory(0, { name: 'Épée', attackPoints: 3 }, []);
      const character = createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 28,
      }, inventory);

      const combatant = orchestrator.prepareCombatantFromCharacter(character);

      expect(combatant.weapon.name).toBe('Épée');
      expect(combatant.weapon.bonus).toBe(3);
    });

    it('should use default weapon if none equipped', () => {
      const inventory = new Inventory(0, undefined, []);
      const character = createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 28,
      }, inventory);

      const combatant = orchestrator.prepareCombatantFromCharacter(character);

      expect(combatant.weapon.name).toBe('Poings');
      expect(combatant.weapon.bonus).toBe(0);
    });
  });

  describe('calculatePersistenceChanges', () => {
    it('should calculate damage taken', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const finalState: CombatState = { ...initialState, player: { ...initialState.player, endurance: 20 } };

      const changes = orchestrator.calculatePersistenceChanges(initialState, finalState);

      expect(changes.damageTaken).toBe(10);
    });

    it('should track chance used', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const finalState: CombatState = { ...initialState, player: { ...initialState.player, chance: 3 } };

      const changes = orchestrator.calculatePersistenceChanges(initialState, finalState);

      expect(changes.newChance).toBe(3);
    });

    it('should track items consumed from events', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const itemEvents: CombatEvent[] = [
        { type: 'item_used' as CombatEventType, itemId: 'potion', timestamp: new Date().toISOString() },
        { type: 'item_used' as CombatEventType, itemId: 'potion', timestamp: new Date().toISOString() },
      ] as unknown as CombatEvent[];

      const finalState: CombatState = { ...initialState, events: [...initialState.events, ...itemEvents] };

      const changes = orchestrator.calculatePersistenceChanges(initialState, finalState);

      expect(changes.itemsToRemove).toContainEqual({ itemId: 'potion', quantity: 2 });
    });

    it('should account for HP gained from abilities', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const abilityEvent: CombatEvent = {
        type: CombatEventType.WEAPON_ABILITY,
        abilityId: 'marteau-vampiric',
        healAmount: 2,
        timestamp: new Date().toISOString()
      };

      const finalState: CombatState = {
        ...initialState,
        player: { ...initialState.player, endurance: 28 },
        events: [...initialState.events, abilityEvent]
      };

      const changes = orchestrator.calculatePersistenceChanges(initialState, finalState);

      expect(changes.hpGained).toBe(2);
    });

    it('should calculate net damage (damage - healing)', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const abilityEvent: CombatEvent = {
        type: CombatEventType.WEAPON_ABILITY,
        abilityId: 'marteau-vampiric',
        healAmount: 2,
        timestamp: new Date().toISOString()
      };

      const finalState: CombatState = {
        ...initialState,
        player: { ...initialState.player, endurance: 28 },
        events: [...initialState.events, abilityEvent]
      };

      const changes = orchestrator.calculatePersistenceChanges(initialState, finalState);

      expect(changes.damageTaken).toBe(0);
    });
  });

  describe('persistCombatChanges', () => {
    it('should call applyDamage for damage taken', async () => {
      const changes: CombatPersistenceChanges = {
        damageTaken: 10,
        newChance: 5,
        itemsToRemove: [],
      };

      await orchestrator.persistCombatChanges('char-id', changes);

      expect(mockCharacterService.applyDamage).toHaveBeenCalledWith('char-id', 10);
    });

    it('should update chance if changed', async () => {
      const changes: CombatPersistenceChanges = {
        damageTaken: 0,
        newChance: 3,
        itemsToRemove: [],
      };

      mockCharacterService.getCharacter = vi.fn().mockResolvedValue(createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 30,
      }));

      await orchestrator.persistCombatChanges('char-id', changes);

      expect(mockCharacterService.updateCharacterStats).toHaveBeenCalledWith('char-id', { chance: 3 });
    });

    it('should not update chance if unchanged', async () => {
      const changes: CombatPersistenceChanges = {
        damageTaken: 0,
        newChance: 5,
        itemsToRemove: [],
      };

      mockCharacterService.getCharacter = vi.fn().mockResolvedValue(createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 30,
      }));

      await orchestrator.persistCombatChanges('char-id', changes);

      expect(mockCharacterService.updateCharacterStats).not.toHaveBeenCalled();
    });

    it('should remove consumed items', async () => {
      const changes: CombatPersistenceChanges = {
        damageTaken: 0,
        newChance: 5,
        itemsToRemove: [
          { itemId: 'potion', quantity: 2 },
        ],
      };

      await orchestrator.persistCombatChanges('char-id', changes);

      expect(mockCharacterService.removeItemQuantity).toHaveBeenCalledWith('char-id', 'potion', 2);
    });
  });

  describe('generateCombatSummary', () => {
    it('should generate complete summary', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const extraEvents: CombatEvent[] = [
        { type: CombatEventType.DAMAGE_DEALT, damage: 8, timestamp: new Date().toISOString(), attacker: 'player' },
        { type: CombatEventType.DAMAGE_DEALT, damage: 5, timestamp: new Date().toISOString(), attacker: 'player' },
      ];

      const finalState: CombatState = {
        ...initialState,
        phase: CombatPhase.VICTORY,
        roundNumber: 3,
        player: { ...initialState.player, endurance: 25, chance: 4 },
        events: [...initialState.events, ...extraEvents]
      };

      const summary = orchestrator.generateCombatSummary(initialState, finalState);

      expect(summary.result).toBe('victory');
      expect(summary.rounds).toBe(3);
      expect(summary.damageTaken).toBe(5);
      expect(summary.damageDealt).toBe(13);
      expect(summary.itemsConsumed).toEqual([]);
      expect(summary.chanceUsed).toBe(1);
    });

    it('should detect defeat as result', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const finalState: CombatState = {
        ...initialState,
        phase: CombatPhase.DEFEAT,
      };

      const summary = orchestrator.generateCombatSummary(initialState, finalState);
      expect(summary.result).toBe('defeat');
    });

    it('should detect flee as result', () => {
      const initialState = CombatEngine.createInitialState(
        'char-id',
        {
          name: 'Hero',
          dexterite: 7,
          endurance: 30,
          enduranceMax: 32,
          chance: 5,
          weapon: { id: 'weapon-epée', name: 'Épée', bonus: 3 },
        },
        [mockEnemy],
        defaultConfig
      );

      const fleeEvent = {
        type: CombatEventType.FLEE,
        success: true,
        timestamp: new Date().toISOString()
      } as unknown as CombatEvent;

      const finalState: CombatState = {
        ...initialState,
        phase: CombatPhase.DEFEAT,
        events: [...initialState.events, fleeEvent]
      };

      const summary = orchestrator.generateCombatSummary(initialState, finalState);
      expect(summary.result).toBe('fled');
    });
  });
});
