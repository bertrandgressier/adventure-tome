import type { CombatState, CombatEvent, AvailableAction } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatEventType } from '../../types/CombatEventType';
import { Attacker } from '../../types/Attacker';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';
import { COMBAT_MESSAGES } from './constants';

export class CombatValidator {
  static checkCombatEnd(state: CombatState): 'ongoing' | 'victory' | 'defeat' {
    if (state.player.endurance <= 0) {
      return 'defeat';
    }

    const allEnemiesDefeated = state.enemies.every(
      (enemy: typeof state.enemies[0]) => enemy.endurance <= 0
    );
    if (allEnemiesDefeated) {
      return 'victory';
    }

    return 'ongoing';
  }

  static getAvailableActions(state: CombatState): AvailableAction[] {
    const actions: AvailableAction[] = [];

    if (state.phase === CombatPhase.PLAYER_TURN) {
      actions.push({ action: { type: CombatActionType.ATTACK }, enabled: true });

      const hasUsableItems = state.player.weapon.ability !== undefined;
      if (hasUsableItems) {
        actions.push({ action: { type: CombatActionType.USE_ITEM, payload: {} }, enabled: true });
      }

      if (state.config.allowFlee) {
        const canFlee = state.player.endurance > (state.config.fleeCost ?? 2);
        actions.push({
          action: { type: CombatActionType.FLEE },
          enabled: canFlee,
          disabledReason: canFlee ? undefined : COMBAT_MESSAGES.FLEE.INSUFFICIENT_ENDURANCE,
        });
      }
    }

    if (state.phase === CombatPhase.PLAYER_ATTACK) {
      if (state.lastRoll && !state.lastRoll.success) {
        if (!state.usedReroll) {
          actions.push({ action: { type: CombatActionType.REROLL }, enabled: true });
        }
        actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
      }
    }

    if (state.phase === CombatPhase.PLAYER_ATTACK) {
      if (state.player.chance > 0) {
        actions.push({ action: { type: CombatActionType.SPEND_CHANCE, payload: {} }, enabled: true });
      }
    }

    if (state.phase === CombatPhase.ENEMY_ATTACK) {
      if (state.pendingDamage?.canBlock) {
        actions.push({ action: { type: CombatActionType.BLOCK }, enabled: true });
      }
      actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
    }

    // Add WEAPON_ABILITY action only in appropriate context
    const weaponAbility = state.player.weapon.ability;
    if (weaponAbility && this.isAbilityAvailableInCurrentPhase(state, weaponAbility.trigger)) {
      const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, weaponAbility.id);
      actions.push({
        action: { type: CombatActionType.WEAPON_ABILITY, payload: { abilityId: weaponAbility.id } },
        enabled: canUse,
        disabledReason: canUse ? undefined : reason,
      });
    }

    return actions;
  }

  /**
   * Check if a weapon ability is contextually available in the current phase
   */
  private static isAbilityAvailableInCurrentPhase(
    state: CombatState,
    trigger: WeaponAbilityTrigger
  ): boolean {
    switch (trigger) {
      case WeaponAbilityTrigger.ON_MISS:
        // ON_MISS abilities (Arc des Vents) available only after a missed attack
        return (
          state.phase === CombatPhase.PLAYER_ATTACK &&
          state.lastRoll !== undefined &&
          !state.lastRoll.success
        );

      case WeaponAbilityTrigger.ON_ENEMY_HIT:
        // ON_ENEMY_HIT abilities (Bâton du Sage) available only when enemy deals damage
        return state.phase === CombatPhase.ENEMY_ATTACK && state.pendingDamage !== undefined;

      case WeaponAbilityTrigger.MANUAL:
        // MANUAL abilities always available during player turn
        return state.phase === CombatPhase.PLAYER_TURN;

      case WeaponAbilityTrigger.ON_DOUBLE:
      case WeaponAbilityTrigger.ON_KILL:
      case WeaponAbilityTrigger.ON_SURPRISE:
        // These are auto-triggered, never manual
        return false;

      default:
        return false;
    }
  }

  static createCombatEndEvent(state: CombatState, result: 'victory' | 'defeat'): CombatEvent {
    return {
      type: CombatEventType.COMBAT_END,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      attacker: Attacker.PLAYER,
      result,
    };
  }

  static createRoundStartEvent(roundNumber: number): CombatEvent {
    return {
      type: CombatEventType.ROUND_START,
      timestamp: new Date().toISOString(),
      round: roundNumber,
    };
  }

  static createRoundEndEvent(roundNumber: number): CombatEvent {
    return {
      type: CombatEventType.ROUND_END,
      timestamp: new Date().toISOString(),
      round: roundNumber,
    };
  }
}
