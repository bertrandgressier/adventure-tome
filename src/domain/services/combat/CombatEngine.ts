import type {
  CombatState,
  CombatAction,
  CombatEvent,
} from '../../types/combat-state';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatPhaseV3 } from '../../types/CombatPhaseV3';
import { CombatEventType } from '../../types/CombatEventType';
import { Attacker } from '../../types/Attacker';
import type { PlayerConfig, EnemyConfig, CombatConfig } from '../../types/combatants';
import type { DiceOverrides } from './DiceRoller';
import type { AvailableAction } from '../../types/combat-state';
import { ItemResolver, type CombatUsableItem } from './ItemResolver';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { PhaseManager } from './PhaseManager';
import { CombatValidator } from './CombatValidator';

export type CombatResult = {
  state: CombatState;
  events: CombatEvent[];
};

/**
 * CombatEngine - Moteur de combat avec phases simplifiées
 * 
 * Utilise PhaseManager et CombatValidator pour gérer l'état et les transitions
 * Compatible avec les resolvers existants via adaptation des types
 */
export class CombatEngine {
  private static generateId(): string {
    return `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crée l'état initial du combat V3
   */
  static createInitialState(
    characterId: string,
    player: PlayerConfig,
    enemy: EnemyConfig,
    config: CombatConfig & { firstAttacker?: 'player' | 'enemy'; isSurprise?: boolean }
  ): CombatState {
    const weaponDamage = player.weapon.bonus;
    const passiveDamageBonus = 0;
    const totalDamageBonus = weaponDamage + passiveDamageBonus;

    // Les ennemis n'ont pas d'arme - pas de bonus de dégâts
    const enemyTotalDamageBonus = 0;

    const firstAttacker = config.firstAttacker || 'player';
    
    const state: CombatState = {
      id: this.generateId(),
      characterId,
      player: {
        ...player,
        endurance: player.endurance,
        weaponDamage,
        passiveDamageBonus,
        totalDamageBonus,
      },
      enemy: {
        ...enemy,
        endurance: enemy.enduranceMax,
        weaponDamage: 0,
        passiveDamageBonus: 0,
        totalDamageBonus: enemyTotalDamageBonus,
      },
      phase: PhaseManager.getInitialPhase(),
      currentTurn: PhaseManager.getInitialTurn(firstAttacker),
      roundNumber: 1,
      usedAbilities: {},
      usedReroll: false,
      isFirstAttack: true,
      config,
      events: [],
      usedItems: [],
      history: [],
    };

    return state;
  }

  /**
   * Obtient les actions disponibles pour l'état actuel
   */
  static getAvailableActions(state: CombatState): AvailableAction[] {
    return CombatValidator.getAvailableActions(state);
  }

  /**
   * Résout une action de combat
   */
  static resolve(
    state: CombatState,
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    // Vérifier si le combat est déjà terminé
    const combatStatus = CombatValidator.checkCombatEnd(state);
    if (combatStatus !== 'ongoing') {
      return { state, events: [] };
    }

    const newState = { ...state };
    const events: CombatEvent[] = [];

    // Résoudre l'action selon son type
    switch (action.type) {
      case CombatActionType.ATTACK:
        return this.resolveAttack(newState, diceOverrides);

      case CombatActionType.REROLL:
        return this.resolveReroll(newState, diceOverrides);

      case CombatActionType.SKIP:
        return this.resolveSkip(newState);

      case CombatActionType.USE_ITEM:
        return this.resolveUseItem(newState, action.payload as CombatUsableItem, diceOverrides);

      case CombatActionType.WEAPON_ABILITY:
        return this.resolveWeaponAbility(newState, action.payload as { abilityId: string });

      default:
        // Action inconnue, retourner l'état inchangé
        return { state: newState, events };
    }
  }

  /**
   * Résout une attaque (player ou enemy selon currentTurn)
   */
  private static resolveAttack(state: CombatState, diceOverrides?: DiceOverrides): CombatResult {
    if (state.phase !== CombatPhaseV3.WAITING_ATTACK_ROLL) {
      return { state, events: [] };
    }

    const isPlayerAttacking = state.currentTurn === 'player';
    const attacker = isPlayerAttacking ? state.player : state.enemy;
    const dexterite = attacker.dexterite;

    // Simuler le DiceRoller pour les tests avec des overrides simples
    const dice1 = diceOverrides?.hitDice?.[0] ?? Math.floor(Math.random() * 6) + 1;
    const dice2 = diceOverrides?.hitDice?.[1] ?? Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    const hit = total <= dexterite;

    const newState = { ...state };
    const events: CombatEvent[] = [];

    // Mark first attack as done
    if (newState.isFirstAttack) {
      newState.isFirstAttack = false;
    }

    // Add attack roll event
    events.push({
      type: CombatEventType.ATTACK_ROLL,
      timestamp: new Date().toISOString(),
      round: state.roundNumber,
      attacker: isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
      roll: { dice1, dice2, total },
      hit,
    });

    newState.lastRoll = {
      dice1,
      dice2,
      total,
      success: hit,
      isDouble: dice1 === dice2,
    };

    if (hit) {
      // Calculate and apply damage
      const damageDice = diceOverrides?.damageDice ?? Math.floor(Math.random() * 6) + 1;
      const baseDamage = damageDice;
      const totalDamageBonus = isPlayerAttacking ? state.player.totalDamageBonus : 0; // Enemy has no weapons
      const damage = baseDamage + totalDamageBonus;
      const damageDealt = Math.max(0, damage);

      events.push({
        type: CombatEventType.DAMAGE_ROLL,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: isPlayerAttacking ? Attacker.PLAYER : Attacker.ENEMY,
        roll: { dice1: damageDice, total: damageDice },
        damage: damageDealt,
      });

      if (isPlayerAttacking) {
        newState.enemy.endurance = Math.max(0, newState.enemy.endurance - damageDealt);
      } else {
        newState.player.endurance = Math.max(0, newState.player.endurance - damageDealt);
      }
    }

    // Check if combat ended
    const combatEnded = CombatValidator.checkCombatEnd(newState) !== 'ongoing';
    
    // Avancer la phase selon le résultat
    const phaseUpdate = PhaseManager.advancePhase(newState, { hit, combatEnded });
    
    const finalState: CombatState = {
      ...newState,
      phase: phaseUpdate.phase,
      currentTurn: phaseUpdate.currentTurn,
      roundNumber: phaseUpdate.roundNumber,
    };

    // Ajouter événement de fin si le combat est terminé
    const finalEvents = [...events];
    if (combatEnded) {
      const combatResult = CombatValidator.checkCombatEnd(finalState);
      if (combatResult !== 'ongoing') {
        finalEvents.push(CombatValidator.createCombatEndEvent(finalState, combatResult));
      }
    }

    return { state: finalState, events: finalEvents };
  }

  /**
   * Résout un reroll (uniquement joueur)
   */
  private static resolveReroll(state: CombatState, diceOverrides?: DiceOverrides): CombatResult {
    if (state.currentTurn !== 'player' || !state.lastRoll || state.usedReroll) {
      return { state, events: [] };
    }

    const dice1 = diceOverrides?.hitDice?.[0] ?? Math.floor(Math.random() * 6) + 1;
    const dice2 = diceOverrides?.hitDice?.[1] ?? Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    const dexterite = state.player.dexterite;
    const hit = total <= dexterite;

    const newState: CombatState = {
      ...state,
      lastRoll: {
        dice1,
        dice2,
        total,
        success: hit,
        isDouble: dice1 === dice2,
      },
      usedReroll: true,
    };

    const events: CombatEvent[] = [
      {
        type: CombatEventType.ATTACK_ROLL,
        timestamp: new Date().toISOString(),
        round: state.roundNumber,
        attacker: Attacker.PLAYER,
        roll: { dice1, dice2, total },
        hit,
      },
    ];

    return { state: newState, events };
  }

  /**
   * Résout une action SKIP (passer au tour suivant)
   */
  private static resolveSkip(state: CombatState): CombatResult {
    const phaseUpdate = PhaseManager.skipToNextTurn(state);
    
    const newState: CombatState = {
      ...state,
      phase: phaseUpdate.phase,
      currentTurn: phaseUpdate.currentTurn,
      roundNumber: phaseUpdate.roundNumber,
    };

    return { state: newState, events: [] };
  }

  /**
   * Résout l'utilisation d'un item
   */
  private static resolveUseItem(
    state: CombatState,
    item: CombatUsableItem
  ): CombatResult {
    // Pour la compatibilité, on peut adapter temporairement
    const adaptedStateV2 = this.adaptStateV3ToV2(state);
    const result = ItemResolver.resolve(adaptedStateV2, item);
    const newStateV3 = this.adaptStateV2ToV3(result.state, state);

    return { state: newStateV3, events: result.events };
  }

  /**
   * Résout l'utilisation d'une capacité d'arme
   */
  private static resolveWeaponAbility(
    state: CombatState,
    payload: { abilityId: string }
  ): CombatResult {
    // Pour la compatibilité, on peut adapter temporairement
    const adaptedStateV2 = this.adaptStateV3ToV2(state);
    const result = WeaponAbilityResolver.resolveAbility(adaptedStateV2, payload.abilityId);
    const newStateV3 = this.adaptStateV2ToV3(result.state, state);

    return { state: newStateV3, events: result.events };
  }

  /**
   * Adapte un état V3 vers V2 pour compatibilité avec les resolvers existants
   */
  private static adaptStateV3ToV2(stateV3: CombatState): Record<string, unknown> {
    // Mapping des phases V3 vers V2 (approximatif, pour compatibilité)
    let phaseV2: string;
    let currentAttacker: string;

    switch (stateV3.phase) {
      case CombatPhaseV3.WAITING_ATTACK_ROLL:
        phaseV2 = stateV3.currentTurn === 'player' ? 'player_turn' : 'enemy_turn';
        currentAttacker = stateV3.currentTurn;
        break;
      case CombatPhaseV3.WAITING_DAMAGE_ROLL:
        phaseV2 = stateV3.currentTurn === 'player' ? 'enemy_reaction' : 'player_reaction';
        currentAttacker = stateV3.currentTurn;
        break;
      case CombatPhaseV3.TURN_COMPLETE:
        phaseV2 = 'turn_end';
        currentAttacker = stateV3.currentTurn;
        break;
      case CombatPhaseV3.ENDED:
        phaseV2 = 'ended';
        currentAttacker = stateV3.currentTurn;
        break;
      default:
        phaseV2 = 'player_turn';
        currentAttacker = 'player';
    }

    return {
      ...stateV3,
      phase: phaseV2,
      currentAttacker,
    };
  }

  /**
   * Adapte un état V2 vers V3 après résolution
   */
  private static adaptStateV2ToV3(stateV2: Record<string, unknown>, originalV3: CombatState): CombatState {
    return {
      ...originalV3,
      player: stateV2.player as CombatState['player'],
      enemy: stateV2.enemy as CombatState['enemy'],
      lastRoll: stateV2.lastRoll as CombatState['lastRoll'],
      pendingDamage: stateV2.pendingDamage as CombatState['pendingDamage'],
      usedAbilities: stateV2.usedAbilities as Record<string, number>,
      usedReroll: stateV2.usedReroll as boolean,
      isFirstAttack: stateV2.isFirstAttack as boolean,
      pendingExtraAttack: stateV2.pendingExtraAttack as boolean | undefined,
      events: stateV2.events as CombatEvent[],
      usedItems: stateV2.usedItems as CombatState['usedItems'],
      history: stateV2.history as CombatState['history'],
    };
  }
}