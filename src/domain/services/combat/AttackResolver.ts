import type { CombatState, CombatEvent } from '../../types/combat-state';
import { Attacker } from '../../types/Attacker';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { CombatEventType } from '../../types/CombatEventType';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';
import { HistoryManager } from './HistoryManager';
import { CombatActionType } from '../../types/CombatActionType';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

export class AttackResolver {
  static resolve(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    return this.resolveV3(state, diceOverrides);
  }

  private static resolveV3(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    const isPlayerAttacking = state.currentTurn === 'player';
    const attacker = isPlayerAttacking ? state.player : state.enemy;
    const dexterite = attacker.dexterite;

    // Capture HP avant l'action
    const hpBefore = HistoryManager.createHPSnapshot(state as CombatState);

    const diceRoll = DiceRoller.rollHitDice(diceOverrides?.hitDice);
    const hit = diceRoll.total <= dexterite;

    const newState = { ...state };
    const events: CombatEvent[] = [];

    // Check for ON_SURPRISE ability BEFORE attack (first attack only)
    if (isPlayerAttacking && newState.isFirstAttack) {
      const surpriseAbility = WeaponAbilityResolver.checkAutoTrigger(
        newState as CombatState,
        WeaponAbilityTrigger.ON_SURPRISE,
        {}
      );
      if (surpriseAbility) {
        const surpriseResult = WeaponAbilityResolver.resolveAbility(newState as CombatState, surpriseAbility.id);
        newState.player = surpriseResult.state.player;
        newState.enemy = surpriseResult.state.enemy;
        newState.usedAbilities = surpriseResult.state.usedAbilities;
        events.push(...surpriseResult.events);
      }
      // Mark first attack as done
      newState.isFirstAttack = false;
    }

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

    let damageDiceRolled = 0;
    let damageDealt = 0;

    if (hit) {
      // Calculate and apply damage (formule officielle: 1 + 1d6 + DOMMAGES ACTUELS)
      damageDiceRolled = DiceRoller.rollDamageDice(diceOverrides?.damageDice);
      const baseDamage = damageDiceRolled; // rollDamageDice returns a number
      const totalDamageBonus = isPlayerAttacking ? state.player.totalDamageBonus : 0; // Enemy has no weapons
      const damage = 1 + baseDamage + totalDamageBonus; // Formule officielle
      damageDealt = Math.max(0, damage);

      events.push({
        type: CombatEventType.DAMAGE_DEALT,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
        roll: { dice1: damageDiceRolled, dice2: 0, total: damageDiceRolled },
        damage: damageDealt,
      });

      if (isPlayerAttacking) {
        newState.enemy.endurance = Math.max(0, newState.enemy.endurance - damageDealt);
      } else {
        newState.player.endurance = Math.max(0, newState.player.endurance - damageDealt);
      }

      // Check for weapon abilities on successful attack
      if (isPlayerAttacking && newState.lastRoll?.isDouble) {
        const doubleAbility = WeaponAbilityResolver.checkAutoTrigger(
          newState as CombatState,
          WeaponAbilityTrigger.ON_DOUBLE,
          { roll: newState.lastRoll }
        );
        if (doubleAbility) {
          const doubleResult = WeaponAbilityResolver.resolveAbility(newState as CombatState, doubleAbility.id);
          newState.player = doubleResult.state.player;
          newState.enemy = doubleResult.state.enemy;
          newState.usedAbilities = doubleResult.state.usedAbilities;
          newState.pendingExtraAttack = doubleResult.state.pendingExtraAttack; // Propagate pendingExtraAttack
          events.push(...doubleResult.events);
        }
      }

      // Check for ON_KILL ability if enemy was defeated
      if (isPlayerAttacking && newState.enemy.endurance <= 0) {
        const killAbility = WeaponAbilityResolver.checkAutoTrigger(
          newState as CombatState,
          WeaponAbilityTrigger.ON_KILL,
          {}
        );
        if (killAbility) {
          const killResult = WeaponAbilityResolver.resolveAbility(newState as CombatState, killAbility.id);
          newState.player = killResult.state.player;
          newState.enemy = killResult.state.enemy;
          newState.usedAbilities = killResult.state.usedAbilities;
          events.push(...killResult.events);
        }
      }
    }

    // Capture HP après l'action
    const hpAfter = HistoryManager.createHPSnapshot(newState as CombatState);

    // Enregistrer dans l'historique
    const historyEntry = {
      round: state.roundNumber,
      turn: isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
      action: CombatActionType.ATTACK,
      hitRoll: HistoryManager.createHitRollDetails(
        { ...diceRoll, success: hit },
        dexterite
      ),
      damageRoll: hit
        ? HistoryManager.createDamageRollDetails(
            damageDiceRolled,
            isPlayerAttacking ? newState.player.totalDamageBonus : 0,
            damageDealt
          )
        : undefined,
      hpBefore,
      hpAfter,
      timestamp: new Date().toISOString(),
      description: HistoryManager.generateAttackDescription(
        isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
        hit,
        hit ? Math.max(0, diceRoll.total + (isPlayerAttacking ? state.player.totalDamageBonus : 0)) : undefined
      ),
    };

    newState.history = HistoryManager.addEntry(newState as CombatState, historyEntry);

    return { state: newState, events };
  }
}
