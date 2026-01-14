import type { CombatState, CombatEvent } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';
import type { DiceRoll } from '../../types/combatants';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

export class AttackResolver {
  static resolve(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    const isPlayerAttacking = state.phase === CombatPhase.PLAYER_TURN;
    const attacker = isPlayerAttacking ? state.player : state.enemies[state.activeEnemyIndex];
    const dexterite = attacker.dexterite;

    const diceRoll = DiceRoller.rollHitDice(diceOverrides?.hitDice);
    const hit = diceRoll.total <= dexterite;

    let newState = { ...state };
    const events: CombatEvent[] = [];

    events.push({
      type: CombatEventType.ATTACK_ROLL,
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
      newState.phase = CombatPhase.PLAYER_ATTACK;
    } else {
      newState.phase = CombatPhase.ENEMY_ATTACK;
    }

    if (hit) {
      const abilityBonus = newState.pendingDamage?.abilityBonus || 0;
      const damage = DiceRoller.calculateDamage(attacker.weapon.bonus, diceOverrides?.damageDice) + abilityBonus;

      if (isPlayerAttacking) {
        const targetEnemy = newState.enemies[newState.activeEnemyIndex];
        const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

        newState.enemies = newState.enemies.map((enemy: typeof newState.enemies[0], index: number) =>
          index === newState.activeEnemyIndex
            ? { ...enemy, endurance: newEnemyEndurance }
            : enemy
        );

        events.push({
          type: CombatEventType.DAMAGE_DEALT,
          timestamp: new Date().toISOString(),
          round: state.roundNumber,
          attacker: 'player',
          damage,
        });

        if (newEnemyEndurance === 0) {
          const killedEnemy = targetEnemy;
          const killTrigger = WeaponAbilityResolver.checkTriggers(
            newState,
            'on_kill',
            { killedEnemy }
          );

          if (killTrigger) {
            const abilityResult = WeaponAbilityResolver.resolveAbility(
              newState,
              killTrigger.id,
              { killedEnemy }
            );
            newState = abilityResult.state;
            events.push(...abilityResult.events);
          }
        }

        if (diceRoll.dice1 === diceRoll.dice2) {
          const doubleTrigger = WeaponAbilityResolver.checkTriggers(
            newState,
            'on_double',
            { roll: { ...diceRoll, isDouble: true, success: true } }
          );

          if (doubleTrigger) {
            const abilityResult = WeaponAbilityResolver.resolveAbility(newState, doubleTrigger.id);
            newState = abilityResult.state;
            events.push(...abilityResult.events);
          }
        }

        newState = { ...newState, phase: PhaseManager.advancePhase(newState) };
      } else {
        const pendingDamage: typeof state.pendingDamage = {
          amount: damage,
          canUseLuck: state.player.chance > 0,
          canBlock: false,
        };

        newState.pendingDamage = pendingDamage;
      }
    } else {
      if (isPlayerAttacking) {
        const missTrigger = WeaponAbilityResolver.checkTriggers(
          newState,
          'on_miss',
          { roll: { ...diceRoll, isDouble: false, success: false } }
        );

        if (missTrigger) {
          const abilityResult = WeaponAbilityResolver.resolveAbility(newState, missTrigger.id);
          newState = abilityResult.state;
          events.push(...abilityResult.events);
        }
      } else {
        newState = { ...newState, phase: CombatPhase.PLAYER_TURN };
      }
    }

    return { state: newState, events };
  }
}
