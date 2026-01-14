import { DiceService } from './DiceService';
import type {
  CombatState,
  CombatAction,
  CombatEvent,
  AvailableAction,
  DiceOverrides,
  CombatantConfig,
  EnemyConfig,
  DiceRoll,
  CombatConfig,
} from '../types/combat-v2';

export type CombatResult = {
  state: CombatState;
  events: CombatEvent[];
};

export class CombatEngine {
  private static generateId(): string {
    return `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createInitialState(
    characterId: string,
    player: CombatantConfig,
    enemies: EnemyConfig[],
    config: CombatConfig
  ): CombatState {
    const state: CombatState = {
      id: this.generateId(),
      characterId,
      player: {
        ...player,
        endurance: player.endurance,
      },
      enemies: enemies.map((enemy) => ({
        ...enemy,
        endurance: enemy.endurance,
      })),
      activeEnemyIndex: 0,
      phase: 'player_turn',
      roundNumber: 1,
      currentAttacker: config.firstAttacker ?? 'player',
      config: {
        fleeCost: config.fleeCost ?? 2,
        allowFlee: config.allowFlee,
        maxEnemies: config.maxEnemies,
        damageFormula: config.damageFormula,
        firstAttacker: config.firstAttacker ?? 'player',
      },
      usedAbilities: {},
      usedReroll: false,
      isFirstAttack: true,
      events: [
        {
          type: 'combat_start',
          timestamp: new Date().toISOString(),
          round: 1,
        },
      ],
    };

    return state;
  }

  static resolve(
    state: CombatState,
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    switch (action.type) {
      case 'attack':
        return this.resolveAttack(state, diceOverrides);
      case 'use_item':
        return this.resolveUseItem(state, action.payload as { itemId: string });
      case 'flee':
        return this.resolveFlee(state);
      case 'reroll':
        return this.resolveReroll(state, diceOverrides);
      case 'use_luck':
        return this.resolveUseLuck(state, diceOverrides);
      case 'block':
        return this.resolveBlock(state);
      case 'skip':
        return this.resolveSkip(state);
      default:
        return { state, events: [] };
    }
  }

  static getAvailableActions(state: CombatState): AvailableAction[] {
    const actions: AvailableAction[] = [];

    if (state.phase === 'player_turn') {
      actions.push({ action: { type: 'attack' }, enabled: true });

      const hasUsableItems = state.player.weapon.ability !== undefined;
      if (hasUsableItems) {
        actions.push({ action: { type: 'use_item', payload: {} }, enabled: true });
      }

      if (state.config.allowFlee) {
        const canFlee = state.player.endurance > (state.config.fleeCost ?? 2);
        actions.push({
          action: { type: 'flee' },
          enabled: canFlee,
          disabledReason: canFlee ? undefined : 'Endurance insuffisante pour fuir',
        });
      }
    }

    if (state.phase === 'player_attack') {
      if (state.lastRoll && !state.lastRoll.success) {
        if (!state.usedReroll) {
          actions.push({ action: { type: 'reroll' }, enabled: true });
        }
        actions.push({ action: { type: 'skip' }, enabled: true });
      }
    }

    if (state.phase === 'enemy_attack') {
      if (state.pendingDamage?.canUseLuck) {
        actions.push({ action: { type: 'use_luck' }, enabled: true });
      }
      if (state.pendingDamage?.canBlock) {
        actions.push({ action: { type: 'block' }, enabled: true });
      }
      actions.push({ action: { type: 'skip' }, enabled: true });
    }

    return actions;
  }

  static checkCombatEnd(state: CombatState): 'ongoing' | 'victory' | 'defeat' {
    if (state.player.endurance <= 0) {
      return 'defeat';
    }

    const allEnemiesDefeated = state.enemies.every(
      (enemy) => enemy.endurance <= 0
    );
    if (allEnemiesDefeated) {
      return 'victory';
    }

    return 'ongoing';
  }

  private static resolveAttack(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    const isPlayerAttacking = state.phase === 'player_turn';

    const attacker = isPlayerAttacking ? state.player : state.enemies[state.activeEnemyIndex];
    const dexterite = attacker.dexterite;

    const diceRoll = this.rollHitDice(diceOverrides?.hitDice);
    const hit = diceRoll.total <= dexterite;

    let newState = { ...state };
    const events: CombatEvent[] = [];

    events.push({
      type: 'attack_roll',
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      attacker: isPlayerAttacking ? 'player' : 'enemy',
      roll: diceRoll,
      hit,
    });

    newState.lastRoll = {
      ...diceRoll,
      success: hit,
    };

    if (isPlayerAttacking) {
      newState.phase = 'player_attack';
    } else {
      newState.phase = 'enemy_attack';
    }

    if (hit) {
      const damage = this.calculateDamage(attacker.weapon.bonus, diceOverrides?.damageDice);

      if (isPlayerAttacking) {
        const targetEnemy = newState.enemies[newState.activeEnemyIndex];
        const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

        newState.enemies = newState.enemies.map((enemy, index) =>
          index === newState.activeEnemyIndex
            ? { ...enemy, endurance: newEnemyEndurance }
            : enemy
        );

        events.push({
          type: 'damage_dealt',
          timestamp: new Date().toISOString(),
          round: state.roundNumber,
          attacker: 'player',
          damage,
        });

        newState = this.advancePhase(newState);
      } else {
        const pendingDamage: typeof state.pendingDamage = {
          amount: damage,
          canUseLuck: state.player.chance > 0,
          canBlock: false,
        };

        newState.pendingDamage = pendingDamage;
      }
    } else {
      if (!isPlayerAttacking) {
        newState = this.advancePhase(newState);
      }
    }

    return { state: newState, events };
  }

  private static resolveUseItem(
    state: CombatState,
    _payload: { itemId: string }
  ): CombatResult {
    return { state, events: [] };
  }

  private static resolveFlee(state: CombatState): CombatResult {
    const fleeCost = state.config.fleeCost ?? 2;
    const newEndurance = Math.max(0, state.player.endurance - fleeCost);

    const newState: CombatState = {
      ...state,
      player: { ...state.player, endurance: newEndurance },
      phase: 'defeat',
      events: [
        ...state.events,
        {
          type: 'flee',
          timestamp: new Date().toISOString(),
          round: state.roundNumber,
          attacker: 'player',
          damage: fleeCost,
        },
      ],
    };

    return { state: newState, events: newState.events };
  }

  private static resolveReroll(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    if (!state.lastRoll || state.usedReroll) {
      return { state, events: [] };
    }

    const diceRoll = this.rollHitDice(diceOverrides?.hitDice);
    const hit = diceRoll.total <= (state.phase === 'player_attack' ? state.player.dexterite : state.enemies[state.activeEnemyIndex].dexterite);

    const newState: CombatState = {
      ...state,
      lastRoll: {
        ...diceRoll,
        success: hit,
      },
      usedReroll: true,
      phase: 'player_turn',
    };

    const events: CombatEvent[] = [
      {
        type: 'attack_roll',
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: 'player',
        roll: diceRoll,
        hit,
      },
    ];

    if (hit) {
      const damage = this.calculateDamage(state.player.weapon.bonus, diceOverrides?.damageDice);
      const targetEnemy = newState.enemies[newState.activeEnemyIndex];
      const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

      newState.enemies = newState.enemies.map((enemy, index) =>
        index === newState.activeEnemyIndex
          ? { ...enemy, endurance: newEnemyEndurance }
          : enemy
      );

      events.push({
        type: 'damage_dealt',
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: 'player',
        damage,
      });

      newState.phase = 'enemy_turn';
    }

    return { state: newState, events };
  }

  private static resolveUseLuck(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    if (!state.pendingDamage || !state.pendingDamage.canUseLuck) {
      return { state, events: [] };
    }

    const diceRoll = this.rollHitDice(diceOverrides?.luckDice);
    const luckSuccess = diceRoll.total <= state.player.chance;

    let newEndurance = state.player.endurance;
    let damage = state.pendingDamage.amount;

    if (luckSuccess) {
      damage = Math.max(1, damage - 1);
    } else {
      damage = damage + 1;
    }

    newEndurance = Math.max(0, newEndurance - damage);

    let newState: CombatState = {
      ...state,
      player: { ...state.player, endurance: newEndurance },
      pendingDamage: undefined,
      phase: 'player_turn',
    };

    const events: CombatEvent[] = [
      {
        type: 'luck_test',
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: 'enemy',
        roll: diceRoll,
        luckResult: luckSuccess ? 'success' : 'failure',
      },
      {
        type: 'damage_dealt',
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: 'enemy',
        damage,
      },
    ];

    newState = this.advancePhase(newState);

    return { state: newState, events };
  }

  private static resolveBlock(state: CombatState): CombatResult {
    if (!state.pendingDamage || !state.pendingDamage.canBlock) {
      return { state, events: [] };
    }

    let newState: CombatState = {
      ...state,
      pendingDamage: undefined,
      phase: 'player_turn',
    };

    newState = this.advancePhase(newState);

    return { state: newState, events: [] };
  }

  private static resolveSkip(state: CombatState): CombatResult {
    let newState: CombatState = { ...state };

    if (state.phase === 'player_attack') {
      newState = this.advancePhase(newState);
    } else if (state.phase === 'enemy_attack' && state.pendingDamage) {
      const newEndurance = Math.max(0, state.player.endurance - state.pendingDamage.amount);

      newState = {
        ...state,
        player: { ...state.player, endurance: newEndurance },
        pendingDamage: undefined,
      };

      newState = this.advancePhase(newState);
    }

    return { state: newState, events: [] };
  }

  private static advancePhase(state: CombatState): CombatState {
    let newState: CombatState = { ...state };

    switch (state.phase) {
      case 'player_attack':
        newState.phase = 'enemy_turn';
        newState.currentAttacker = 'enemy';
        break;

      case 'enemy_attack':
        newState.phase = 'round_end';
        newState.currentAttacker = 'player';
        newState = this.advanceRound(newState);
        break;

      case 'round_end':
        newState.phase = 'player_turn';
        newState.currentAttacker = 'player';
        break;

      case 'enemy_turn':
        newState.phase = 'enemy_attack';
        newState.currentAttacker = 'enemy';
        break;

      default:
        break;
    }

    return newState;
  }

  private static advanceRound(state: CombatState): CombatState {
    const newState = { ...state };
    newState.roundNumber += 1;
    newState.isFirstAttack = false;
    newState.lastRoll = undefined;
    newState.pendingDamage = undefined;

    newState.events.push({
      type: 'round_end',
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
    });

    newState.events.push({
      type: 'round_start',
      timestamp: new Date().toISOString(),
      round: newState.roundNumber,
    });

    return newState;
  }

  private static rollHitDice(override?: [number, number]): DiceRoll {
    if (override) {
      return {
        dice1: override[0],
        dice2: override[1],
        total: override[0] + override[1],
        isDouble: override[0] === override[1],
      };
    }

    const dice = DiceService.rollMultiple(6, 2);
    return {
      dice1: dice[0],
      dice2: dice[1],
      total: dice[0] + dice[1],
      isDouble: dice[0] === dice[1],
    };
  }

  private static rollDamageDice(override?: number): number {
    if (override !== undefined) {
      return override;
    }
    return DiceService.roll1d6();
  }

  private static calculateDamage(weaponBonus: number, damageDiceOverride?: number): number {
    const damageDice = this.rollDamageDice(damageDiceOverride);
    return 1 + damageDice + weaponBonus;
  }
}
