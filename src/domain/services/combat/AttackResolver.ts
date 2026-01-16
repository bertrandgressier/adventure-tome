import type { CombatState, CombatEvent } from '../../types/combat-v2';
import { CombatPhase } from '../../types/CombatPhase';
import { Attacker } from '../../types/Attacker';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';

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
      attacker: isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
      roll: diceRoll,
      hit,
    });

    newState.lastRoll = {
      ...diceRoll,
      success: hit,
      isDouble: diceRoll.dice1 === diceRoll.dice2,
    };

    if (isPlayerAttacking) {
      newState.phase = CombatPhase.PLAYER_ATTACK;
    } else {
      newState.phase = CombatPhase.ENEMY_ATTACK;
    }

    if (hit) {
      const damage = DiceRoller.calculateDamage(attacker.totalDamageBonus, diceOverrides?.damageDice);

      if (isPlayerAttacking) {
        const targetEnemy = newState.enemies[newState.activeEnemyIndex];
        const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);
        const killedEnemy = newEnemyEndurance === 0;

        newState.enemies = newState.enemies.map((enemy: typeof newState.enemies[0], index: number) =>
          index === newState.activeEnemyIndex
            ? { ...enemy, endurance: newEnemyEndurance }
            : enemy
        );

        events.push({
          type: CombatEventType.DAMAGE_DEALT,
          timestamp: new Date().toISOString(),
          round: state.roundNumber,
          attacker: Attacker.PLAYER,
          damage,
        });

        // Check weapon abilities BEFORE advancing phase (to avoid state corruption)
        const killAbility = WeaponAbilityResolver.checkAutoTrigger(
          newState,
          WeaponAbilityTrigger.ON_KILL,
          { killedEnemy }
        );
        if (killAbility) {
          const killResult = WeaponAbilityResolver.resolveAbility(newState, killAbility.id);
          newState = killResult.state;
          events.push(...killResult.events);
        }

        const doubleAbility = WeaponAbilityResolver.checkAutoTrigger(
          newState,
          WeaponAbilityTrigger.ON_DOUBLE,
          { roll: newState.lastRoll }
        );
        if (doubleAbility) {
          const doubleResult = WeaponAbilityResolver.resolveAbility(newState, doubleAbility.id);
          newState = doubleResult.state;
          events.push(...doubleResult.events);
        }

        // Advance phase AFTER abilities are resolved
        newState = { ...newState, phase: PhaseManager.advancePhase(newState) };
      } else {
        const pendingDamage: typeof state.pendingDamage = {
          amount: damage,
          canBlock: false,
        };

        newState.pendingDamage = pendingDamage;
      }
    } else {
      if (!isPlayerAttacking) {
        newState = { ...newState, phase: CombatPhase.PLAYER_TURN };
      }
      // Note: ON_MISS abilities (like Arc des Vents) are NOT auto-resolved.
      // They are detected by CombatValidator and made available as manual actions.
    }

    return { state: newState, events };
  }
}
