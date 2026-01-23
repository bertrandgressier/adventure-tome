import type { CombatState, CombatEvent } from '../../types/combat-state';
import type { WeaponAbility, DiceRoll, PendingDamage } from '../../types/combatants';
import { CombatEventType } from '../../types/CombatEventType';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';
import { COMBAT_MESSAGES, WEAPON_ABILITY_IDS } from './constants';
import { PhaseManager } from './PhaseManager';
import { HistoryManager } from './HistoryManager';

/**
 * Type union des états de combat compatibles avec WeaponAbilityResolver
 */
export type CompatibleCombatState = CombatState;

/**
 * Interface commune minimale pour les vérifications d'armes légendaires
 */
export interface WeaponAbilityCheckState {
  player: {
    weapon: {
      ability?: WeaponAbility;
    };
    chance: number;
  };
  usedAbilities: Record<string, number>;
  pendingDamage?: PendingDamage;
}

export interface TriggerContext {
  roll?: DiceRoll;
  killedEnemy?: boolean;
  incomingDamage?: number;
}

export interface AbilityResolutionResult {
  state: CombatState;
  events: CombatEvent[];
  triggered: boolean;
}

export class WeaponAbilityResolver {
  static checkAutoTrigger(
    state: CombatState,
    trigger: WeaponAbilityTrigger,
    context: TriggerContext
  ): WeaponAbility | null {
    const weapon = state.player.weapon;
    if (!weapon?.ability || weapon.ability.trigger !== trigger) {
      return null;
    }

    switch (trigger) {
      case WeaponAbilityTrigger.ON_DOUBLE:
        return context.roll?.isDouble ? weapon.ability : null;

      case WeaponAbilityTrigger.ON_KILL:
        return context.killedEnemy ? weapon.ability : null;

      case WeaponAbilityTrigger.ON_MISS:
        return context.roll && !context.roll.success ? weapon.ability : null;

      case WeaponAbilityTrigger.ON_SURPRISE:
        if (!state.config.isSurprise) return null;
        if (!state.isFirstAttack) return null;
        return weapon.ability;

      default:
        return null;
    }
  }

  static canUseAbility(
    state: WeaponAbilityCheckState,
    abilityId: string
  ): { canUse: boolean; reason?: string } {
    const weapon = state.player.weapon;
    if (!weapon?.ability || weapon.ability.id !== abilityId) {
      return { canUse: false, reason: COMBAT_MESSAGES.WEAPON_ABILITY.WEAPON_REQUIRED };
    }

    const ability = weapon.ability;

    if (ability.costChance && state.player.chance < ability.costChance) {
      return { canUse: false, reason: COMBAT_MESSAGES.WEAPON_ABILITY.INSUFFICIENT_CHANCE };
    }

    if (ability.usesPerCombat && (state.usedAbilities[abilityId] ?? 0) >= ability.usesPerCombat) {
      return { canUse: false, reason: COMBAT_MESSAGES.WEAPON_ABILITY.ALREADY_USED };
    }

    if (ability.effect.type === 'negate_damage' && !state.pendingDamage) {
      return { canUse: false, reason: COMBAT_MESSAGES.WEAPON_ABILITY.NO_DAMAGE_TO_BLOCK };
    }

    return { canUse: true };
  }

  static resolveAbility(
    state: CombatState,
    abilityId: string
  ): AbilityResolutionResult {
    const weapon = state.player.weapon;
    if (!weapon?.ability || weapon.ability.id !== abilityId) {
      return { state, events: [], triggered: false };
    }

    const ability = weapon.ability;
    const canUse = this.canUseAbility(state, abilityId);

    if (!canUse.canUse) {
      return { state, events: [], triggered: false };
    }

    switch (ability.effect.type) {
      case 'extra_attack':
        return this.resolveExtraAttack(state, abilityId);

      case 'heal_on_kill':
        return this.resolveHealOnKill(state, abilityId, ability.effect.amount);

      case 'convert_miss_to_hit':
        return this.resolveConvertMiss(state, abilityId);

      case 'bonus_damage':
        return this.resolveBonusDamage(state, abilityId, ability.effect.amount);

      case 'negate_damage':
        return this.resolveNegateDamage(state, abilityId);

      default:
        return { state, events: [], triggered: false };
    }
  }

  private static resolveExtraAttack(state: CombatState, abilityId: string): AbilityResolutionResult {
    const newState = {
      ...state,
      pendingExtraAttack: true,
    };

    const description = HistoryManager.generateWeaponAbilityTriggeredDescription(
      WEAPON_ABILITY_IDS.LAME_AUBE_EXTRA_ATTACK
    );

    const event: CombatEvent = {
      type: CombatEventType.WEAPON_ABILITY,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      abilityId,
      description,
    };

    return { state: newState, events: [event], triggered: true };
  }

  private static resolveHealOnKill(state: CombatState, abilityId: string, amount: number): AbilityResolutionResult {
    const currentEndurance = state.player.endurance;
    const maxEndurance = state.player.enduranceMax;
    const newEndurance = Math.min(maxEndurance, currentEndurance + amount);

    const newState = {
      ...state,
      player: {
        ...state.player,
        endurance: newEndurance,
      },
    };

    const description = HistoryManager.generateWeaponAbilityTriggeredDescription(
      WEAPON_ABILITY_IDS.MARTEAU_VAMPIRIC,
      {
        healAmount: amount,
        currentHp: newEndurance,
        maxHp: maxEndurance,
      }
    );

    const event: CombatEvent = {
      type: CombatEventType.WEAPON_ABILITY,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      abilityId,
      healAmount: amount,
      description,
    };

    return { state: newState, events: [event], triggered: true };
  }

  private static resolveConvertMiss(state: CombatState, abilityId: string): AbilityResolutionResult {
    const weapon = state.player.weapon;
    const ability = weapon.ability;
    if (!ability) {
      return { state, events: [], triggered: false };
    }
    const costChance = ability.costChance ?? 0;
    const newChance = state.player.chance - costChance;

    const newState = {
      ...state,
      player: {
        ...state.player,
        chance: newChance,
      },
    };

    const description = HistoryManager.generateWeaponAbilityTriggeredDescription(
      WEAPON_ABILITY_IDS.ARC_WIND_GUIDED,
      {
        chanceSpent: costChance,
        chanceRemaining: newChance,
      }
    );

    const event: CombatEvent = {
      type: CombatEventType.WEAPON_ABILITY,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      abilityId,
      pointsSpent: ability.costChance,
      description,
    };

    return { state: newState, events: [event], triggered: true };
  }

  private static resolveBonusDamage(state: CombatState, abilityId: string, amount: number): AbilityResolutionResult {
    const newTotalDamageBonus = state.player.totalDamageBonus + amount;
    
    const newState = {
      ...state,
      player: {
        ...state.player,
        totalDamageBonus: newTotalDamageBonus,
      },
    };

    const description = HistoryManager.generateWeaponAbilityTriggeredDescription(
      WEAPON_ABILITY_IDS.DAGUE_SURPRISE_STRIKE,
      {
        bonusDamage: amount,
        totalDamage: newTotalDamageBonus,
      }
    );

    const event: CombatEvent = {
      type: CombatEventType.WEAPON_ABILITY,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      abilityId,
      description,
    };

    return { state: newState, events: [event], triggered: true };
  }

  private static resolveNegateDamage(state: CombatState, abilityId: string): AbilityResolutionResult {
    const usageCount = (state.usedAbilities[abilityId] ?? 0) + 1;
    const negatedDamage = state.pendingDamage?.amount ?? 0;

    const newState = {
      ...state,
      pendingDamage: undefined,
      usedAbilities: {
        ...state.usedAbilities,
        [abilityId]: usageCount,
      },
      roundNumber: state.roundNumber + 1,
    };

    // Advance phase using PhaseManager
    const phaseUpdate = PhaseManager.advancePhase(newState, {});
    const finalState = { ...newState, ...phaseUpdate };

    const description = HistoryManager.generateWeaponAbilityTriggeredDescription(
      WEAPON_ABILITY_IDS.BATON_MYSTIC_SHIELD,
      {
        negatedDamage,
      }
    );

    const event: CombatEvent = {
      type: CombatEventType.WEAPON_ABILITY,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      abilityId,
      description,
    };

    return { state: finalState, events: [event], triggered: true };
  }
}
