import type {
  CombatState,
  CombatEvent,
} from '../../types/combat-v2';
import type { WeaponAbility, DiceRoll, EnemyState } from '../../types/combatants';
import { CombatEventType } from '../../types/CombatEventType';

export interface AbilityResolutionResult {
  state: CombatState;
  events: CombatEvent[];
  triggered: boolean;
}

export interface TriggerContext {
  roll?: DiceRoll;
  killedEnemy?: EnemyState;
}

export interface AbilityContext {
  incomingDamage?: number;
  killedEnemy?: EnemyState;
}

export class WeaponAbilityResolver {
  static checkTriggers(
    state: CombatState,
    trigger: 'on_double' | 'on_kill' | 'on_miss' | 'on_surprise',
    context: TriggerContext
  ): WeaponAbility | null {
    const weapon = state.player.weapon;

    if (!weapon || !weapon.ability) {
      return null;
    }

    const ability = weapon.ability;

    if (ability.trigger !== trigger) {
      return null;
    }

    switch (trigger) {
      case 'on_double':
        return context.roll?.isDouble ? ability : null;

      case 'on_kill':
        return context.killedEnemy ? ability : null;

      case 'on_surprise':
        if (!state.isFirstAttack) {
          return null;
        }
        return ability;

      case 'on_miss':
        return context.roll?.success === false ? ability : null;

      default:
        return null;
    }
  }

  static resolveAbility(
    state: CombatState,
    abilityId: string,
    context?: AbilityContext
  ): AbilityResolutionResult {
    const weapon = state.player.weapon;

    if (!weapon || !weapon.ability || weapon.ability.id !== abilityId) {
      return { state, events: [], triggered: false };
    }

    const ability = weapon.ability;

    switch (abilityId) {
      case 'lame-aube-double-attack':
        return this.resolveLameAube(state);

      case 'marteau-vampiric':
        return this.resolveMarteauTerre(state, context?.killedEnemy);

      case 'arc-wind-guided':
        return this.resolveArcVents(state);

      case 'dague-surprise-strike':
        return this.resolveDagueOmbres(state);

      case 'baton-mystic-shield':
        return this.resolveBatonSage(state, context?.incomingDamage);

      default:
        return { state, events: [], triggered: false };
    }
  }

  static canUseAbility(
    state: CombatState,
    abilityId: string
  ): { canUse: boolean; reason?: string } {
    const weapon = state.player.weapon;

    if (!weapon || !weapon.ability || weapon.ability.id !== abilityId) {
      return { canUse: false, reason: 'Arme non équipée' };
    }

    const ability = weapon.ability;
    const usedCount = state.usedAbilities[abilityId] || 0;

    if (ability.usesPerCombat && usedCount >= ability.usesPerCombat) {
      return { canUse: false, reason: 'Capacité déjà utilisée' };
    }

    switch (abilityId) {
      case 'arc-wind-guided':
        if (state.player.chance < (ability.costChance || 1)) {
          return { canUse: false, reason: 'Pas assez de CHANCE' };
        }
        break;

      case 'baton-mystic-shield':
        if (!state.pendingDamage || state.pendingDamage.amount === 0) {
          return { canUse: false, reason: 'Aucun dégât en attente' };
        }
        break;

      default:
        break;
    }

    return { canUse: true };
  }

  private static resolveLameAube(
    state: CombatState
  ): AbilityResolutionResult {
    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        abilityId: 'lame-aube-double-attack',
      },
    ];

    const newState: CombatState = {
      ...state,
      pendingExtraAttack: true,
      usedAbilities: {
        ...state.usedAbilities,
        'lame-aube-double-attack': (state.usedAbilities['lame-aube-double-attack'] || 0) + 1,
      },
    };

    return { state: newState, events, triggered: true };
  }

  private static resolveMarteauTerre(
    state: CombatState,
    killedEnemy?: EnemyState
  ): AbilityResolutionResult {
    if (!killedEnemy) {
      return { state, events: [], triggered: false };
    }

    const healAmount = 1;
    const newEndurance = Math.min(
      state.player.enduranceMax,
      state.player.endurance + healAmount
    );

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        abilityId: 'marteau-vampiric',
      },
      {
        type: CombatEventType.HEAL,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        healAmount,
      },
    ];

    const newState: CombatState = {
      ...state,
      player: {
        ...state.player,
        endurance: newEndurance,
      },
      usedAbilities: {
        ...state.usedAbilities,
        'marteau-vampiric': (state.usedAbilities['marteau-vampiric'] || 0) + 1,
      },
    };

    return { state: newState, events, triggered: true };
  }

  private static resolveArcVents(
    state: CombatState
  ): AbilityResolutionResult {
    const costChance = 1;

    if (state.player.chance < costChance) {
      return { state, events: [], triggered: false };
    }

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        abilityId: 'arc-wind-guided',
      },
    ];

    const newState: CombatState = {
      ...state,
      player: {
        ...state.player,
        chance: state.player.chance - costChance,
      },
      lastRoll: state.lastRoll ? {
        ...state.lastRoll,
        success: true,
      } : undefined,
      usedAbilities: {
        ...state.usedAbilities,
        'arc-wind-guided': (state.usedAbilities['arc-wind-guided'] || 0) + 1,
      },
    };

    return { state: newState, events, triggered: true };
  }

  private static resolveDagueOmbres(
    state: CombatState
  ): AbilityResolutionResult {
    const bonusDamage = 2;

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        abilityId: 'dague-surprise-strike',
      },
    ];

    const newState: CombatState = {
      ...state,
      pendingDamage: state.pendingDamage ? {
        ...state.pendingDamage,
        abilityBonus: bonusDamage,
      } : {
        amount: 0,
        canUseLuck: false,
        canBlock: false,
        abilityBonus: bonusDamage,
      },
      usedAbilities: {
        ...state.usedAbilities,
        'dague-surprise-strike': (state.usedAbilities['dague-surprise-strike'] || 0) + 1,
      },
    };

    return { state: newState, events, triggered: true };
  }

  private static resolveBatonSage(
    state: CombatState,
    _incomingDamage?: number
  ): AbilityResolutionResult {
    if (!state.pendingDamage || state.pendingDamage.amount === 0) {
      return { state, events: [], triggered: false };
    }

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ABILITY_USED,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        abilityId: 'baton-mystic-shield',
      },
    ];

    const newState: CombatState = {
      ...state,
      pendingDamage: {
        ...state.pendingDamage,
        amount: 0,
      },
      usedAbilities: {
        ...state.usedAbilities,
        'baton-mystic-shield': (state.usedAbilities['baton-mystic-shield'] || 0) + 1,
      },
    };

    return { state: newState, events, triggered: true };
  }
}
