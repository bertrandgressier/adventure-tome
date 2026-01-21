import { describe, it, expect } from 'vitest';
import { CombatValidator } from '../../../src/domain/services/combat/CombatValidator';
import { CombatPhase } from '../../../src/domain/types/CombatPhase';
import { CombatActionType } from '../../../src/domain/types/CombatActionType';
import { WeaponAbilityTrigger } from '../../../src/domain/types/WeaponAbilityTrigger';
import { WeaponEffectType } from '../../../src/domain/types/WeaponEffectType';
import type { CombatState } from '../../../src/domain/types/combat-state';
import { CombatEventType } from '../../../src/domain/types/CombatEventType';

describe('CombatValidator', () => {
  const createMockState = (
    phase: CombatPhase,
    currentTurn: 'player' | 'enemy',
    overrides?: Partial<CombatState>
  ): CombatState => ({
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
    roundNumber: 1,
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

  describe('checkCombatEnd', () => {
    it('should return ongoing when both combatants are alive', () => {
      const state = createMockState(CombatPhase.WAITING_ATTACK_ROLL, 'player');
      const result = CombatValidator.checkCombatEnd(state);
      expect(result).toBe('ongoing');
    });

    it('should return victory when enemy endurance reaches 0', () => {
      const state = createMockState(CombatPhase.WAITING_DAMAGE_ROLL, 'player', {
        enemy: {
          name: 'Goblin',
          dexterite: 8,
          endurance: 0,
          enduranceMax: 10,
          weaponDamage: 0,
          passiveDamageBonus: 0,
          totalDamageBonus: 0,
        },
      });
      const result = CombatValidator.checkCombatEnd(state);
      expect(result).toBe('victory');
    });

    it('should return defeat when player endurance reaches 0', () => {
      const state = createMockState(CombatPhase.WAITING_DAMAGE_ROLL, 'enemy', {
        player: {
          name: 'Hero',
          dexterite: 10,
          endurance: 0,
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
      });
      const result = CombatValidator.checkCombatEnd(state);
      expect(result).toBe('defeat');
    });
  });

  describe('getAvailableActions - WAITING_ATTACK_ROLL', () => {
    it('should return ATTACK and WEAPON_ABILITY during player turn with MANUAL ability', () => {
      const state = createMockState(CombatPhase.WAITING_ATTACK_ROLL, 'player', {
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
            id: 'legendary-sword',
            name: 'Épée Légendaire',
            bonus: 3,
            ability: {
              id: 'double-strike',
              name: 'Double frappe',
              trigger: WeaponAbilityTrigger.MANUAL,
              effect: { type: WeaponEffectType.EXTRA_ATTACK },
              usesPerCombat: 1,
            },
          },
        },
      });

      const actions = CombatValidator.getAvailableActions(state);

      expect(actions).toHaveLength(2);
      expect(actions.find((a) => a.action.type === CombatActionType.ATTACK)).toBeDefined();
      expect(actions.find((a) => a.action.type === CombatActionType.WEAPON_ABILITY)).toBeDefined();
    });

    it('should return only ATTACK during player turn without weapon ability', () => {
      const state = createMockState(CombatPhase.WAITING_ATTACK_ROLL, 'player');

      const actions = CombatValidator.getAvailableActions(state);

      expect(actions).toHaveLength(1);
      expect(actions[0].action.type).toBe(CombatActionType.ATTACK);
    });

    it('should return empty actions during enemy turn (automatic)', () => {
      const state = createMockState(CombatPhase.WAITING_ATTACK_ROLL, 'enemy');

      const actions = CombatValidator.getAvailableActions(state);

      expect(actions).toHaveLength(0);
    });
  });

  describe('getAvailableActions - TURN_COMPLETE', () => {
    it('should return SKIP action', () => {
      const state = createMockState(CombatPhase.TURN_COMPLETE, 'player');

      const actions = CombatValidator.getAvailableActions(state);

      expect(actions).toHaveLength(1);
      expect(actions[0].action.type).toBe(CombatActionType.SKIP);
      expect(actions[0].enabled).toBe(true);
    });
  });

  describe('getAvailableActions - ENDED', () => {
    it('should return no actions when combat is ended', () => {
      const state = createMockState(CombatPhase.ENDED, 'player', {
        enemy: {
          name: 'Goblin',
          dexterite: 8,
          endurance: 0,
          enduranceMax: 10,
          weaponDamage: 0,
          passiveDamageBonus: 0,
          totalDamageBonus: 0,
        },
      });

      const actions = CombatValidator.getAvailableActions(state);

      expect(actions).toHaveLength(0);
    });
  });

  describe('getAvailableActions - weapon abilities by trigger', () => {
    it('should show ON_MISS ability after a missed attack', () => {
      const state = createMockState(CombatPhase.TURN_COMPLETE, 'player', {
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
            id: 'arc-des-vents',
            name: 'Arc des Vents',
            bonus: 2,
            ability: {
              id: 'convert-miss',
              name: 'Convertir raté',
              trigger: WeaponAbilityTrigger.ON_MISS,
              effect: { type: WeaponEffectType.CONVERT_MISS_TO_HIT },
              usesPerCombat: 1,
            },
          },
        },
        lastRoll: {
          dice1: 6,
          dice2: 6,
          total: 12,
          success: false,
        },
      });

      const actions = CombatValidator.getAvailableActions(state);

      const weaponAbilityAction = actions.find(
        (a) => a.action.type === CombatActionType.WEAPON_ABILITY
      );
      expect(weaponAbilityAction).toBeDefined();
      expect(weaponAbilityAction?.enabled).toBe(true);
    });

    it('should NOT show ON_MISS ability when attack hit', () => {
      const state = createMockState(CombatPhase.TURN_COMPLETE, 'player', {
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
            id: 'arc-des-vents',
            name: 'Arc des Vents',
            bonus: 2,
            ability: {
              id: 'convert-miss',
              name: 'Convertir raté',
              trigger: WeaponAbilityTrigger.ON_MISS,
              effect: { type: WeaponEffectType.CONVERT_MISS_TO_HIT },
              usesPerCombat: 1,
            },
          },
        },
        lastRoll: {
          dice1: 2,
          dice2: 3,
          total: 5,
          success: true,
        },
      });

      const actions = CombatValidator.getAvailableActions(state);

      const weaponAbilityAction = actions.find(
        (a) => a.action.type === CombatActionType.WEAPON_ABILITY
      );
      expect(weaponAbilityAction).toBeUndefined();
    });

    it('should NOT show auto-triggered abilities (ON_DOUBLE, ON_KILL, ON_SURPRISE)', () => {
      const state = createMockState(CombatPhase.WAITING_ATTACK_ROLL, 'player', {
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
            id: 'auto-trigger-weapon',
            name: 'Arme Auto',
            bonus: 2,
            ability: {
              id: 'on-double',
              name: 'Sur double',
              trigger: WeaponAbilityTrigger.ON_DOUBLE,
              effect: { type: WeaponEffectType.EXTRA_ATTACK },
            },
          },
        },
      });

      const actions = CombatValidator.getAvailableActions(state);

      const weaponAbilityAction = actions.find(
        (a) => a.action.type === CombatActionType.WEAPON_ABILITY
      );
      expect(weaponAbilityAction).toBeUndefined();
    });
  });

  describe('createCombatEndEvent', () => {
    it('should create victory event', () => {
      const state = createMockState(CombatPhase.ENDED, 'player', {
        enemy: {
          name: 'Goblin',
          dexterite: 8,
          endurance: 0,
          enduranceMax: 10,
          weaponDamage: 0,
          passiveDamageBonus: 0,
          totalDamageBonus: 0,
        },
      });

      const event = CombatValidator.createCombatEndEvent(state, 'victory');

      expect(event.type).toBe(CombatEventType.COMBAT_END);
      expect(event.result).toBe('victory');
      expect(event.round).toBe(1);
      expect(event.attacker).toBe('player');
    });

    it('should create defeat event', () => {
      const state = createMockState(CombatPhase.ENDED, 'enemy', {
        player: {
          name: 'Hero',
          dexterite: 10,
          endurance: 0,
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
      });

      const event = CombatValidator.createCombatEndEvent(state, 'defeat');

      expect(event.type).toBe(CombatEventType.COMBAT_END);
      expect(event.result).toBe('defeat');
      expect(event.attacker).toBe('enemy');
    });
  });

  describe('createRoundStartEvent', () => {
    it('should create round start event', () => {
      const event = CombatValidator.createRoundStartEvent(2);

      expect(event.type).toBe(CombatEventType.ROUND_START);
      expect(event.round).toBe(2);
      expect(event.timestamp).toBeDefined();
    });
  });

  describe('createRoundEndEvent', () => {
    it('should create round end event', () => {
      const event = CombatValidator.createRoundEndEvent(1);

      expect(event.type).toBe(CombatEventType.ROUND_END);
      expect(event.round).toBe(1);
      expect(event.timestamp).toBeDefined();
    });
  });
});
