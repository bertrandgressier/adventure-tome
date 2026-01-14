import type { CombatState, CombatEvent } from '../../types/combat-v2';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatPhase } from '../../types/CombatPhase';
import type { CombatantState, DiceRoll } from '../../types/combatants';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';

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
      newState.phase = PhaseManager.advancePhase(newState);
    } else {
      newState.phase = PhaseManager.advancePhase(newState);
    }

    if (hit) {
      const damage = DiceRoller.calculateDamage(attacker.weapon.bonus, diceOverrides?.damageDice);

      if (isPlayerAttacking) {
        const targetEnemy = newState.enemies[newState.activeEnemyIndex];
        const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);

        newState.enemies = newState.enemies.map((enemy: typeof newState.enemies[0], index: number) =>
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
        newState.phase = PhaseManager.advancePhase(newState);
      }
    }

    return { state: newState, events };
  }
}
