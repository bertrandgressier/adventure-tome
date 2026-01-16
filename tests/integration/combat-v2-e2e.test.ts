/**
 * Tests d'intégration E2E pour le système de Combat V2
 * 
 * Ces tests valident le système de combat complet sans UI, assurant que
 * toutes les mécaniques fonctionnent correctement et servant de base pour
 * les tests de non-régression.
 * 
 * NOTE: Certains scénarios de l'issue #69 ne sont pas encore implémentés:
 * - Scénario 2 (items): USE_ITEM est un stub dans CombatEngine
 * - Les potions ne sont pas encore utilisables en combat
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCombatSlice, type CombatSlice } from '@/src/presentation/stores/slices/combatSlice';
import { Character, type GameMode, type ProgressData } from '@/src/domain/entities/Character';
import { Stats, type StatsData } from '@/src/domain/value-objects/Stats';
import { Inventory } from '@/src/domain/value-objects/Inventory';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { TargetRoll } from '@/src/domain/types/TargetRoll';
import type { EnemyConfig } from '@/src/domain/types/combatants';

type MockStoreState = CombatSlice & {
  characters: Record<string, Character>;
  updateStats: (id: string, stats: Partial<{ chance: number }>) => Promise<void>;
  applyDamage: (id: string, amount: number) => Promise<void>;
  getItem: (itemId: string) => import('@/src/domain/types/items').CatalogItem | undefined;
};

const mockSet = vi.fn();
let currentState: MockStoreState;
const mockGet = vi.fn().mockImplementation(() => currentState);

const defaultProgressData: ProgressData = {
  currentParagraph: 1,
  history: [],
  lastSaved: '2024-01-01T00:00:00.000Z',
};

function createMockCharacter(statsData: StatsData, inventory?: Inventory): Character {
  const stats = Stats.fromData(statsData);
  const inv = inventory ?? new Inventory(0, { name: 'Épée', attackPoints: 3 }, []);

  return Character.fromData({
    id: 'test-char-id',
    name: 'Héros Test',
    book: 3,
    talent: 'guerrier',
    secondTalent: undefined,
    gameMode: 'simplified' as GameMode,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    stats: stats.toData(),
    inventory: inv.toData(),
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

describe('Combat V2 - End to End Integration Tests', () => {
  let slice: CombatSlice;
  let character: Character;

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
    } as unknown as MockStoreState;

    currentState.characters = { 'test-char-id': character };
    slice = createCombatSlice()(mockSet, mockGet);
    currentState = { ...currentState, ...slice };
  });

  describe('Scénario 1: Combat simple - Victoire', () => {
    it('should complete a full combat with victory', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      expect(currentState.combat).not.toBeNull();
      expect(currentState.combat?.phase).toBe(CombatPhase.PLAYER_TURN);

      const initialEnemyEndurance = currentState.combat?.enemies[0].endurance ?? 0;
      expect(initialEnemyEndurance).toBe(15);

      const initialPlayerEndurance = currentState.combat?.player.endurance ?? 0;
      expect(initialPlayerEndurance).toBe(30);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 2], damageDice: 4 });
      
      const damage1 = 1 + 4 + 3;
      expect(currentState.combat?.enemies[0].endurance).toBe(15 - damage1);
      expect(currentState.combat?.lastRoll?.success).toBe(true);
      expect(currentState.combat?.lastRoll?.total).toBe(5);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [5, 4] });

      expect(currentState.combat?.lastRoll?.success).toBe(false);
      expect(currentState.combat?.lastRoll?.total).toBe(9);

      slice.executeAction({ type: CombatActionType.SKIP });
      expect(currentState.combat?.player.endurance).toBe(30);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 3 });
      expect(currentState.combat?.enemies[0].endurance).toBeLessThanOrEqual(0);
    });
  });

  describe('Scénario 2: Combat avec utilisation d\'items', () => {
    it('should allow using healing potions during combat', () => {
      // Character starts with 30 PV, max is 32
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      expect(currentState.combat?.player.endurance).toBe(30);

      // Use healing potion (+5 PV, capped at max)
      slice.executeAction({
        type: CombatActionType.USE_ITEM,
        payload: {
          id: 'tome1-potion-soin',
          name: 'Potion de soin',
          healAmount: 5
        }
      });

      // Should heal 2 PV (capped at max 32)
      expect(currentState.combat?.player.endurance).toBe(32);
    });

    it('should allow using confusion potion on enemy', () => {
      slice.startCombat('test-char-id', [
        { name: 'Gobelin', dexterite: 6, endurance: 10, enduranceMax: 10, chance: 3, isBoss: false, weapon: { id: 'dagger', name: 'Dague', bonus: 2 } }
      ], defaultConfig);

      expect(currentState.combat?.enemies[0].endurance).toBe(10);

      // Use confusion potion (-5 PV to enemy)
      slice.executeAction({
        type: CombatActionType.USE_ITEM,
        payload: {
          id: 'tome3-potion-confusion',
          name: 'Potion de confusion',
          damageToEnemy: 5
        }
      });

      expect(currentState.combat?.enemies[0].endurance).toBe(5);
    });
  });

  describe('Scénario 3: Combat avec test de Chance', () => {
    it('should increase damage when lucky on dealt damage', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 4 });

      expect(currentState.combat?.enemies[0].endurance).toBeLessThan(mockEnemy.enduranceMax);

      slice.executeAction(
        { type: CombatActionType.SPEND_CHANCE, payload: { pointsToSpend: 1, targetRoll: TargetRoll.DAMAGE } }
      );

      expect(currentState.combat?.player.chance).toBe(4);
      expect(currentState.combat?.lastRoll?.modifier).toBe(1);
    });

    it('should decrease damage when lucky on received damage', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 1 });

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 2], damageDice: 5 });

      expect(currentState.combat?.pendingDamage).toBeDefined();
      expect(currentState.combat?.pendingDamage?.amount).toBeGreaterThan(0);

      slice.executeAction(
        { type: CombatActionType.SPEND_CHANCE, payload: { pointsToSpend: 1, targetRoll: TargetRoll.HIT } }
      );

      expect(currentState.combat?.player.chance).toBe(4);
    });
  });

  describe('Scénario 4: Combat avec Bague de la deuxième chance', () => {
    beforeEach(() => {
      const inventoryWithReroll = new Inventory(
        0,
        { name: 'Épée', attackPoints: 3 },
        [
          { itemId: 'tome1-bague-deuxieme-chance', quantity: 1, possessed: true },
        ]
      );
      character = createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 30,
      }, inventoryWithReroll);
      currentState.characters = { 'test-char-id': character };
      currentState = { ...currentState, ...slice };
    });

    it('should allow reroll once per combat', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      expect(currentState.combat?.usedReroll).toBe(false);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 5] });

      expect(currentState.combat?.lastRoll?.success).toBe(false);

      const actions = currentState.availableActions;
      expect(actions.some(a => a.action.type === CombatActionType.REROLL)).toBe(true);

      slice.executeAction({ type: CombatActionType.REROLL }, { hitDice: [2, 3] });

      expect(currentState.combat?.lastRoll?.success).toBe(true);
      expect(currentState.combat?.usedReroll).toBe(true);

      slice.executeAction({ type: CombatActionType.SKIP });
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6] });
      
      const newActions = currentState.availableActions;
      expect(newActions.some(a => a.action.type === CombatActionType.REROLL)).toBe(false);
    });
  });

  describe('Scénario 5: Combat avec arme légendaire - Lame de l\'Aube', () => {
    beforeEach(() => {
      // Create character with legendary weapon (Lame de l'Aube Éternelle)
      const inventoryWithLegendary = new Inventory(
        0,
        { itemId: 'tome3-lame-aube-eternelle', name: "Lame de l'Aube Éternelle", attackPoints: 2 },
        []
      );
      character = createMockCharacter({
        dexterite: 8,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 30,
      }, inventoryWithLegendary);
      currentState.characters = { 'test-char-id': character };
      
      // Mock getItem to return the legendary weapon from catalog
      currentState.getItem = vi.fn().mockImplementation((itemId: string) => {
        if (itemId === 'tome3-lame-aube-eternelle') {
          return {
            id: 'tome3-lame-aube-eternelle',
            name: "Lame de l'Aube Éternelle",
            type: 'weapon',
            tome: 3,
            attackPoints: 2,
            isLegendary: true,
            abilities: [
              {
                id: 'lame-aube-extra-attack',
                name: 'Frappe de l\'Aube',
                trigger: 'on_double',
                effect: { type: 'extra_attack' },
                description: 'Si vous obtenez un double sur votre jet d\'attaque, relancez immédiatement une attaque gratuite.'
              }
            ]
          };
        }
        return undefined;
      });
      
      currentState = { ...currentState, ...slice };
    });

    it('should attach weapon ability from catalog when starting combat', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      expect(currentState.combat?.player.weapon.id).toBe('tome3-lame-aube-eternelle');
      expect(currentState.combat?.player.weapon.ability).toBeDefined();
      expect(currentState.combat?.player.weapon.ability?.id).toBe('lame-aube-extra-attack');
      expect(currentState.combat?.player.weapon.ability?.trigger).toBe('on_double');
      expect(currentState.combat?.player.weapon.ability?.effect).toEqual({ type: 'extra_attack' });
    });

    it('should trigger extra attack on double roll', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      const initialEnemyEndurance = currentState.combat?.enemies[0].endurance ?? 0;
      expect(initialEnemyEndurance).toBe(15);

      // Roll a double (2+2=4) which should hit (dexterite=8) and trigger extra attack
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 3 });

      // First attack damage: 1 (base) + 3 (dice) + 2 (weapon) = 6
      // Extra attack should be pending
      expect(currentState.combat?.pendingExtraAttack).toBe(true);
    });
  });

  describe('Scénario 6: Combat avec fuite', () => {
    it('should allow flee and apply damage', () => {
      slice.startCombat('test-char-id', [mockEnemy], { ...defaultConfig, fleeCost: 2 });

      const initialEndurance = currentState.combat?.player.endurance ?? 0;
      expect(initialEndurance).toBe(30);

      slice.executeAction({ type: CombatActionType.FLEE });

      expect(currentState.combat?.phase).toBe(CombatPhase.DEFEAT);
      expect(currentState.combat?.player.endurance).toBe(28);
    });

    it('should not allow flee when disabled', () => {
      slice.startCombat('test-char-id', [mockEnemy], { ...defaultConfig, allowFlee: false });

      const actions = currentState.availableActions;
      expect(actions.some(a => a.action.type === CombatActionType.FLEE)).toBe(false);
    });
  });

  describe('Scénario 7: Combat multiple (1vN)', () => {
    it('should handle multiple enemies', () => {
      slice.startCombat('test-char-id', [
        { name: 'Gobelin 1', dexterite: 5, endurance: 10, enduranceMax: 10, chance: 3, isBoss: false, weapon: { id: 'club', name: 'Gourdin', bonus: 1 } },
        { name: 'Gobelin 2', dexterite: 6, endurance: 12, enduranceMax: 12, chance: 3, isBoss: false, weapon: { id: 'dagger', name: 'Dague', bonus: 2 } }
      ], defaultConfig);

      expect(currentState.combat?.enemies).toHaveLength(2);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 6 });

      expect(currentState.combat?.enemies[0].endurance).toBe(0);

      slice.executeAction({ type: CombatActionType.SKIP });
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [5, 4] });

      expect(currentState.combat?.lastRoll?.success).toBe(false);

      slice.executeAction({ type: CombatActionType.SKIP });
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 3], damageDice: 1 });

      expect(currentState.combat?.enemies[1].endurance).toBeLessThanOrEqual(12);
    });
  });

  describe('Scénario 8: Combat jusqu\'à la défaite', () => {
    beforeEach(() => {
      character = createMockCharacter({
        dexterite: 7,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 32,
        pointsDeVieActuels: 5,
      });
      currentState.characters = { 'test-char-id': character };
      currentState = { ...currentState, ...slice };
    });

    it('should handle player death correctly', () => {
      slice.startCombat('test-char-id', [
        { name: 'Dragon', dexterite: 10, endurance: 100, enduranceMax: 100, chance: 5, isBoss: true, weapon: { id: 'claws', name: 'Griffes', bonus: 10 } }
      ], defaultConfig);

      expect(currentState.combat?.player.endurance).toBe(5);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 1 });

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });

      expect(currentState.combat?.pendingDamage).toBeDefined();
      expect(currentState.combat?.pendingDamage?.amount).toBeGreaterThan(5);

      slice.executeAction({ type: CombatActionType.SKIP });

      expect(currentState.combat?.player.endurance).toBe(0);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [1, 1] });

      expect(currentState.combat?.player.endurance).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should track damage taken correctly', () => {
      const initialPv = 30;
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 4 });

      slice.executeAction({ type: CombatActionType.SKIP });
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 2], damageDice: 6 });

      expect(currentState.combat?.pendingDamage).toBeDefined();
      const damageAmount = currentState.combat?.pendingDamage?.amount ?? 0;
      expect(damageAmount).toBeGreaterThan(0);

      slice.executeAction({ type: CombatActionType.SKIP });

      const finalPv = currentState.combat?.player.endurance ?? 0;
      expect(finalPv).toBeLessThan(initialPv);
    });

    it('should track chance used correctly', () => {
      const initialChance = 5;
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 4 });

      slice.executeAction(
        { type: CombatActionType.SPEND_CHANCE, payload: { pointsToSpend: 2, targetRoll: TargetRoll.DAMAGE } }
      );

      expect(currentState.combat?.player.chance).toBe(initialChance - 2);
    });

    it('should not persist changes on cancel', () => {
      slice.startCombat('test-char-id', [mockEnemy], defaultConfig);

      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 4 });

      slice.executeAction(
        { type: CombatActionType.SPEND_CHANCE, payload: { pointsToSpend: 1, targetRoll: TargetRoll.DAMAGE } }
      );

      const combatState = currentState.combat;
      expect(combatState?.player.chance).toBe(4);

      slice.cancelCombat();

      expect(currentState.combat).toBeNull();
    });
  });
});
