import type { CombatState, CombatEvent } from '../../types/combat-state';
import { Attacker } from '../../types/Attacker';
import type { DiceOverrides } from './DiceRoller';
import { DiceRoller } from './DiceRoller';
import { PhaseManager } from './PhaseManager';
import { CombatEventType } from '../../types/CombatEventType';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { WeaponAbilityTrigger } from '../../types/WeaponAbilityTrigger';
import { HistoryManager } from './HistoryManager';
import { CombatActionType } from '../../types/CombatActionType';

export interface ActionResolutionResult {
  state: CombatState;
  events: CombatEvent[];
}

// Type guard to check if state is V3 - NOTE: In V3, ALL states have currentTurn
// So resolveV2 is never called (dead code)
function isStateV3(state: CombatState | CombatState): state is CombatState {
  return 'currentTurn' in state && typeof state.currentTurn === 'string';
}

export class AttackResolver {
  static resolve(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    // All states are V3 now (have currentTurn), so directly call resolveV3
    return this.resolveV3(state, diceOverrides);
  }

  /* V2 CODE - DEAD CODE - Commented out to fix TypeScript build
  private static resolveV2(
    state: CombatState,
    diceOverrides?: DiceOverrides
  ): ActionResolutionResult {
    const isPlayerAttacking = state.phase === 'player_turn' as const;
    const attacker = isPlayerAttacking ? state.player : state.enemy;
    const dexterite = attacker.dexterite;

    // Capture HP avant l'action
    const hpBefore = HistoryManager.createHPSnapshot(state);

    const diceRoll = DiceRoller.rollHitDice(diceOverrides?.hitDice);
    const hit = diceRoll.total <= dexterite;

    let newState = { ...state };
    const events: CombatEvent[] = [];

    // Check for ON_SURPRISE ability BEFORE attack (first attack only)
    if (isPlayerAttacking && newState.isFirstAttack) {
      const surpriseAbility = WeaponAbilityResolver.checkAutoTrigger(
        newState,
        WeaponAbilityTrigger.ON_SURPRISE,
        {}
      );
      if (surpriseAbility) {
        const surpriseResult = WeaponAbilityResolver.resolveAbility(newState, surpriseAbility.id);
        newState = surpriseResult.state;
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

    if (isPlayerAttacking) {
      newState.phase = 'player_attack' as const;
    } else {
      newState.phase = 'enemy_attack' as const;
    }

    let damageDealt = 0;
    let damageDiceRolled = 0;

    if (hit) {
      const attackerBonus = isPlayerAttacking ? newState.player.totalDamageBonus : attacker.totalDamageBonus;
      damageDiceRolled = DiceRoller.rollDamageDice(diceOverrides?.damageDice);
      const damage = 1 + damageDiceRolled + attackerBonus;
      damageDealt = damage;

      if (isPlayerAttacking) {
        const targetEnemy = newState.enemy;
        const newEnemyEndurance = Math.max(0, targetEnemy.endurance - damage);
        const killedEnemy = newEnemyEndurance === 0;

        newState.enemy = { ...newState.enemy, endurance: newEnemyEndurance };

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
        const phaseUpdate = PhaseManager.advancePhase(newState, {});
        newState = { ...newState, ...phaseUpdate };
      } else {
        const pendingDamage: typeof state.pendingDamage = {
          amount: damage,
          canBlock: false,
        };

        newState.pendingDamage = pendingDamage;
      }
    } else {
      if (!isPlayerAttacking) {
        newState = { ...newState, phase: 'player_turn' as const };
      }
      // Note: ON_MISS abilities (like Arc des Vents) are NOT auto-resolved.
      // They are detected by CombatValidator and made available as manual actions.
    }

    // Capture HP après l'action
    const hpAfter = HistoryManager.createHPSnapshot(newState);

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
            isPlayerAttacking ? state.player.totalDamageBonus : attacker.totalDamageBonus,
            damageDealt
          )
        : undefined,
      hpBefore,
      hpAfter,
      timestamp: new Date().toISOString(),
      description: HistoryManager.generateAttackDescription(
        isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
        hit,
        hit ? damageDealt : undefined
      ),
    };

    newState.history = HistoryManager.addEntry(newState, historyEntry);

    return { state: newState, events };
  }
  END OF V2 DEAD CODE */

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
        // Copy back changed fields from V2 result
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

    if (hit) {
      // Calculate and apply damage
      const damageDiceRolled = DiceRoller.rollDamageDice(diceOverrides?.damageDice);
      const baseDamage = damageDiceRolled; // rollDamageDice returns a number
      const totalDamageBonus = isPlayerAttacking ? state.player.totalDamageBonus : 0; // Enemy has no weapons
      const damage = baseDamage + totalDamageBonus;
      const damageDealt = Math.max(0, damage);

      events.push({
        type: CombatEventType.DAMAGE_ROLL,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
        roll: damageDiceRolled,
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
            { total: diceRoll.total, dice1: diceRoll.dice1, dice2: 0 },
            isPlayerAttacking ? state.player.totalDamageBonus : 0,
            hit ? Math.max(0, diceRoll.total + (isPlayerAttacking ? state.player.totalDamageBonus : 0)) : 0
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
