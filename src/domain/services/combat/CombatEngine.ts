import type {
  CombatState,
  CombatAction,
  CombatEvent,
} from '../../types/combat-v2';
import { CombatActionType } from '../../types/CombatActionType';
import { CombatPhase } from '../../types/CombatPhase';
import { CombatEventType } from '../../types/CombatEventType';
import { Attacker } from '../../types/Attacker';
import type { PlayerConfig, EnemyConfig } from '../../types/combatants';
import type { DiceOverrides } from './DiceRoller';
import { AttackResolver } from './AttackResolver';
import { ReactionResolver } from './ReactionResolver';
import { CombatValidator } from './CombatValidator';
import { WeaponAbilityResolver } from './WeaponAbilityResolver';
import { ItemResolver, type CombatUsableItem } from './ItemResolver';

export type CombatResult = {
  state: CombatState;
  events: CombatEvent[];
};

export class CombatEngine {
  private static generateId(): string {
    return `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createInitialState(
    characterId: string,
    player: PlayerConfig,
    enemy: EnemyConfig,
    config: { damageFormula: string; firstAttacker?: Attacker; isSurprise?: boolean }
  ): CombatState {
    const weaponDamage = player.weapon.bonus;
    const passiveDamageBonus = 0;
    const totalDamageBonus = weaponDamage + passiveDamageBonus;

    // Les ennemis n'ont pas d'arme - pas de bonus de dégâts
    const enemyWeaponDamage = 0;
    const enemyPassiveDamageBonus = 0;
    const enemyTotalDamageBonus = 0;

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
        endurance: enemy.endurance,
        weaponDamage: enemyWeaponDamage,
        passiveDamageBonus: enemyPassiveDamageBonus,
        totalDamageBonus: enemyTotalDamageBonus,
      },
      phase: CombatPhase.PLAYER_TURN,
      roundNumber: 1,
      currentAttacker: config.firstAttacker ?? Attacker.PLAYER,
      config: {
        damageFormula: config.damageFormula,
        firstAttacker: config.firstAttacker ?? Attacker.PLAYER,
        isSurprise: config.isSurprise ?? false,
      },
      usedAbilities: {},
      usedReroll: false,
      isFirstAttack: true,
      usedItems: [],
      events: [
        {
          type: CombatEventType.COMBAT_START,
          timestamp: new Date().toISOString(),
          round: 1,
        },
      ],
    };

    return state;
  }

  static resolve(
    state: CombatState,
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ): CombatResult {
    const combatEndStatus = CombatValidator.checkCombatEnd(state);
    if (combatEndStatus !== 'ongoing') {
      return { state, events: [] };
    }

    switch (action.type) {
      case CombatActionType.ATTACK:
        return AttackResolver.resolve(state, diceOverrides);
      case CombatActionType.USE_ITEM:
        const item = action.payload as CombatUsableItem | undefined;
        if (!item) {
          return { state, events: [] };
        }
        return ItemResolver.resolve(state, item);
      case CombatActionType.REROLL:
        return ReactionResolver.resolveReroll(state, diceOverrides);
      case CombatActionType.BLOCK:
        return ReactionResolver.resolveBlock(state);
      case CombatActionType.SKIP:
        return ReactionResolver.resolveSkip(state);
      case CombatActionType.WEAPON_ABILITY:
        const { abilityId } = action.payload as { abilityId: string };
        return WeaponAbilityResolver.resolveAbility(state, abilityId);
      default:
        return { state, events: [] };
    }
  }

  static getAvailableActions(state: CombatState) {
    return CombatValidator.getAvailableActions(state);
  }

  static checkCombatEnd(state: CombatState) {
    return CombatValidator.checkCombatEnd(state);
  }
}
