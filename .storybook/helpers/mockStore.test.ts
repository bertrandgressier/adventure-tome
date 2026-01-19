import { describe, it, expect } from 'vitest';
import { createMockStore, createMockCombatState } from './mockStore';

describe('Storybook helpers', () => {
  describe('createMockStore', () => {
    it('should create a store with default state', () => {
      const store = createMockStore();
      const state = store.getState();

      expect(state.characters).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.combat).toBeNull();
      expect(state.availableActions).toEqual([]);
      expect(state.isAnimating).toBe(false);
      expect(state.customItems).toEqual({});
      expect(state.catalogItems).toEqual({});
    });

    it('should allow overriding initial state', () => {
      const store = createMockStore({
        isLoading: true,
        error: 'Test error',
        combat: createMockCombatState(),
      });
      const state = store.getState();

      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('Test error');
      expect(state.combat).toBeDefined();
      expect(state.combat?.phase).toBe('idle');
    });

    it('should have all required methods', () => {
      const store = createMockStore();
      const state = store.getState();

      expect(typeof state.loadAll).toBe('function');
      expect(typeof state.getCharacter).toBe('function');
      expect(typeof state.create).toBe('function');
      expect(typeof state.delete).toBe('function');
      expect(typeof state.startCombat).toBe('function');
      expect(typeof state.performAction).toBe('function');
      expect(typeof state.endCombat).toBe('function');
    });
  });

  describe('createMockCombatState', () => {
    it('should create a valid combat state with defaults', () => {
      const combat = createMockCombatState();

      expect(combat.characterId).toBe('test-character');
      expect(combat.phase).toBe('idle');
      expect(combat.round).toBe(1);
      expect(combat.player.name).toBe('Héros');
      expect(combat.player.currentEndurance).toBe(20);
      expect(combat.player.maxEndurance).toBe(20);
      expect(combat.player.habilete).toBe(12);
      expect(combat.enemies).toHaveLength(1);
      expect(combat.enemies[0].name).toBe('Gobelin');
      expect(combat.config.allowFlee).toBe(true);
      expect(combat.config.allowItems).toBe(true);
      expect(combat.history).toEqual([]);
    });

    it('should allow overriding combat state', () => {
      const combat = createMockCombatState({
        phase: 'playerTurn',
        round: 5,
        player: {
          name: 'Guerrier',
          currentEndurance: 10,
          maxEndurance: 25,
          habilete: 14,
          weaponBonus: 3,
          weapon: { id: 'sword', name: 'Excalibur', bonus: 3 },
        },
      });

      expect(combat.phase).toBe('playerTurn');
      expect(combat.round).toBe(5);
      expect(combat.player.name).toBe('Guerrier');
      expect(combat.player.currentEndurance).toBe(10);
      expect(combat.player.maxEndurance).toBe(25);
      expect(combat.player.habilete).toBe(14);
      expect(combat.player.weaponBonus).toBe(3);
    });

    it('should allow overriding enemies', () => {
      const combat = createMockCombatState({
        enemies: [
          {
            id: 'boss-1',
            name: 'Dragon',
            currentEndurance: 50,
            maxEndurance: 50,
            habilete: 18,
          },
          {
            id: 'minion-1',
            name: 'Orc',
            currentEndurance: 8,
            maxEndurance: 8,
            habilete: 7,
          },
        ],
      });

      expect(combat.enemies).toHaveLength(2);
      expect(combat.enemies[0].name).toBe('Dragon');
      expect(combat.enemies[1].name).toBe('Orc');
    });

    it('should allow overriding config', () => {
      const combat = createMockCombatState({
        config: {
          allowFlee: false,
          allowItems: false,
          deathOnDefeat: true,
        },
      });

      expect(combat.config.allowFlee).toBe(false);
      expect(combat.config.allowItems).toBe(false);
      expect(combat.config.deathOnDefeat).toBe(true);
    });
  });
});
