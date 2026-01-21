import type { CombatState, CombatEvent } from '../../types/combat-state';
import type { AvailableAction } from '../../types/combat-state';
import { CombatPhase } from '../../types/CombatPhase';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatEventType } from '../../types/CombatEventType';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';

export class CombatValidator {
  static checkCombatEnd(state: CombatState): 'ongoing' | 'victory' | 'defeat' {
    if (state.player.endurance <= 0) {
      return 'defeat';
    }

    // V3: Check if all enemies are dead (support both V2 single enemy and V3 enemies array)
    const allEnemiesDead = state.enemies 
      ? state.enemies.every(enemy => enemy.endurance <= 0)
      : state.enemy?.endurance <= 0;

    if (allEnemiesDead) {
      return 'victory';
    }

    return 'ongoing';
  }

  static getAvailableActions(state: CombatState): AvailableAction[] {
    const actions: AvailableAction[] = [];

    // WAITING_ATTACK_ROLL - selon qui joue
    if (state.phase === CombatPhase.WAITING_ATTACK_ROLL) {
      if (state.currentTurn === 'player') {
        actions.push({ action: { type: CombatActionType.ATTACK }, enabled: true });

        // TODO: Items consommables (potions, etc.) - pas les weapon abilities
        // const hasUsableItems = ...;
        // if (hasUsableItems) {
        //   actions.push({ action: { type: CombatActionType.USE_ITEM, payload: {} }, enabled: true });
        // }

        // Weapon abilities (MANUAL trigger) - ajoutées ici, pas à la fin
        const weaponAbility = state.player.weapon.ability;
        if (weaponAbility && weaponAbility.trigger === WeaponAbilityTrigger.MANUAL) {
          const { canUse, reason } = WeaponAbilityResolver.canUseAbility(state, weaponAbility.id);
          actions.push({
            action: {
              type: CombatActionType.WEAPON_ABILITY,
              payload: { abilityId: weaponAbility.id },
            },
            enabled: canUse,
            disabledReason: canUse ? undefined : reason,
          });
        }
      }
      // Enemy turn: actions automatiques (pas d'actions manuelles)
      return actions;
    }

    // WAITING_DAMAGE_ROLL - automatique, passe à turn_complete via SKIP
    if (state.phase === CombatPhase.WAITING_DAMAGE_ROLL) {
      // Les dégâts sont appliqués automatiquement
      // Le joueur peut simplement passer (via SKIP implicite)
      // Enemy damage roll est aussi automatique
    }

    // TURN_COMPLETE - skip to next turn or reroll if player missed and hasn't used reroll
    if (state.phase === CombatPhase.TURN_COMPLETE) {
      // Allow reroll if: player's turn just ended, they missed, haven't used reroll yet
      if (
        state.currentTurn === 'player' &&
        state.lastRoll &&
        !state.lastRoll.success &&
        !state.usedReroll
      ) {
        actions.push({ action: { type: CombatActionType.REROLL }, enabled: true });
      }
      
      // Toujours proposer SKIP (sera auto-skip si pas d'autres actions)
      actions.push({ action: { type: CombatActionType.SKIP }, enabled: true });
    }

    // Weapon abilities contextuelles (ON_MISS, ON_ENEMY_HIT)
    const weaponAbility = state.player.weapon.ability;
    if (
      weaponAbility &&
      state.currentTurn === 'player' &&
      this.isAbilityAvailableInCurrentPhase(state, weaponAbility.trigger)
    ) {
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
   * Vérifie si une capacité d'arme est disponible dans la phase actuelle
   */
  private static isAbilityAvailableInCurrentPhase(
    state: CombatState,
    trigger: WeaponAbilityTrigger
  ): boolean {
    switch (trigger) {
      case WeaponAbilityTrigger.ON_MISS:
        // Disponible après un raté (turn_complete après miss)
        return (
          state.phase === CombatPhase.TURN_COMPLETE &&
          state.lastRoll !== undefined &&
          !state.lastRoll.success
        );

      case WeaponAbilityTrigger.ON_ENEMY_HIT:
        // Disponible quand l'ennemi attaque (waiting_damage_roll en enemy turn)
        return state.phase === CombatPhase.WAITING_DAMAGE_ROLL && state.currentTurn === 'enemy';

      case WeaponAbilityTrigger.MANUAL:
        // Disponible pendant waiting_attack_roll (player turn)
        return state.phase === CombatPhase.WAITING_ATTACK_ROLL && state.currentTurn === 'player';

      case WeaponAbilityTrigger.ON_DOUBLE:
      case WeaponAbilityTrigger.ON_KILL:
      case WeaponAbilityTrigger.ON_SURPRISE:
        // Auto-triggered, jamais manuel
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
      attacker: state.currentTurn === 'player' ? 'player' : 'enemy',
      result,
    };
  }

  /**
   * Vérifie si l'état actuel nécessite un auto-skip
   * (phase TURN_COMPLETE sans actions manuelles disponibles)
   */
  static shouldAutoSkip(state: CombatState): boolean {
    if (state.phase !== CombatPhase.TURN_COMPLETE) {
      return false;
    }

    // Si le combat est terminé, pas d'auto-skip
    if (this.checkCombatEnd(state) !== 'ongoing') {
      return false;
    }

    // Vérifier s'il y a des actions manuelles disponibles (REROLL, weapon abilities)
    const actions = this.getAvailableActions(state);
    const hasManualActions = actions.some(a => a.action.type !== CombatActionType.SKIP);

    return !hasManualActions;
  }

  /**
   * Vérifie si le tour de l'ennemi doit être déclenché automatiquement
   */
  static shouldAutoPlayEnemy(state: CombatState): boolean {
    return (
      state.currentTurn === 'enemy' &&
      state.phase === CombatPhase.WAITING_ATTACK_ROLL &&
      this.checkCombatEnd(state) === 'ongoing'
    );
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
