import type {
  CombatHistoryEntry,
  HitRollDetails,
  DamageRollDetails,
  HPSnapshot,
} from '../../types/combat-history';
import type { CombatState } from '../../types/combat-state';
import type { CombatActionType } from '../../types/CombatActionType';
import type { Attacker } from '../../types/Attacker';
import type { DiceRoll } from '../../types/combatants';
import { COMBAT_MESSAGES, WEAPON_ABILITY_IDS } from './constants';

export class HistoryManager {
  /**
   * Génère un ID unique pour une entrée d'historique
   */
  private static generateId(): string {
    return `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Crée un snapshot des HP actuels
   */
  static createHPSnapshot(state: CombatState): HPSnapshot {
    return {
      player: state.player.endurance,
      enemy: state.enemy.endurance,
    };
  }

  /**
   * Convertit un DiceRoll en HitRollDetails
   */
  static createHitRollDetails(
    roll: DiceRoll,
    target: number
  ): HitRollDetails {
    return {
      dice: [roll.dice1, roll.dice2],
      target,
      success: roll.success ?? false,
      total: roll.total,
    };
  }

  /**
   * Crée un DamageRollDetails à partir des informations de dégâts
   */
  static createDamageRollDetails(
    dice: number,
    bonus: number,
    total: number
  ): DamageRollDetails {
    return {
      dice,
      bonus,
      total,
    };
  }

  /**
   * Ajoute une entrée à l'historique du combat
   */
  static addEntry(
    state: CombatState,
    entry: Omit<CombatHistoryEntry, 'id'>
  ): CombatHistoryEntry[] {
    const fullEntry: CombatHistoryEntry = {
      id: this.generateId(),
      ...entry,
    };

    return [...state.history, fullEntry];
  }

  /**
   * Filtre l'historique par round
   */
  static filterByRound(
    history: CombatHistoryEntry[],
    round: number
  ): CombatHistoryEntry[] {
    return history.filter((entry) => entry.round === round);
  }

  /**
   * Filtre l'historique par tour (player/enemy)
   */
  static filterByTurn(
    history: CombatHistoryEntry[],
    turn: Attacker
  ): CombatHistoryEntry[] {
    return history.filter((entry) => entry.turn === turn);
  }

  /**
   * Filtre l'historique par type d'action
   */
  static filterByAction(
    history: CombatHistoryEntry[],
    action: CombatActionType
  ): CombatHistoryEntry[] {
    return history.filter((entry) => entry.action === action);
  }

  /**
   * Récupère la dernière entrée de l'historique
   */
  static getLastEntry(
    history: CombatHistoryEntry[]
  ): CombatHistoryEntry | undefined {
    return history[history.length - 1];
  }

  /**
   * Génère une description textuelle pour une attaque
   */
  static generateAttackDescription(
    attacker: Attacker,
    hit: boolean,
    damage?: number
  ): string {
    const attackerName = attacker === 'player' ? 'Vous' : "L'ennemi";
    const targetName = attacker === 'player' ? "l'ennemi" : 'vous';

    if (hit && damage !== undefined) {
      return `${attackerName} ${attacker === 'player' ? 'touchez' : 'touche'} ${targetName} et ${attacker === 'player' ? 'infligez' : 'inflige'} ${damage} dégâts`;
    } else {
      return `${attackerName} ${attacker === 'player' ? 'ratez' : 'rate'} ${targetName}`;
    }
  }

  /**
   * Génère une description pour l'utilisation d'un objet
   */
  static generateItemDescription(itemName: string): string {
    return `Vous utilisez ${itemName}`;
  }

  /**
   * Génère une description pour l'utilisation d'une capacité d'arme
   */
  static generateAbilityDescription(abilityName: string): string {
    return `Vous utilisez ${abilityName}`;
  }

  /**
   * Génère une description détaillée pour un déclenchement de capacité d'arme
   * @param abilityId ID de la capacité
   * @param context Contexte du déclenchement (heal amount, damage, etc.)
   */
  static generateWeaponAbilityTriggeredDescription(
    abilityId: string,
    context: {
      healAmount?: number;
      currentHp?: number;
      maxHp?: number;
      chanceSpent?: number;
      chanceRemaining?: number;
      bonusDamage?: number;
      totalDamage?: number;
      negatedDamage?: number;
      abilityName?: string;
    } = {}
  ): string {
    switch (abilityId) {
      case WEAPON_ABILITY_IDS.LAME_AUBE_EXTRA_ATTACK:
        return COMBAT_MESSAGES.HISTORY.EXTRA_ATTACK_TRIGGERED;

      case WEAPON_ABILITY_IDS.MARTEAU_VAMPIRIC:
        return COMBAT_MESSAGES.HISTORY.HEAL_ON_KILL_TRIGGERED(
          context.healAmount ?? 1,
          context.currentHp ?? 0,
          context.maxHp ?? 0
        );

      case WEAPON_ABILITY_IDS.ARC_WIND_GUIDED:
        return COMBAT_MESSAGES.HISTORY.CONVERT_MISS_TRIGGERED(
          context.chanceSpent ?? 1,
          context.chanceRemaining ?? 0
        );

      case WEAPON_ABILITY_IDS.DAGUE_SURPRISE_STRIKE:
        return COMBAT_MESSAGES.HISTORY.SURPRISE_BONUS_TRIGGERED(
          context.bonusDamage ?? 2,
          context.totalDamage ?? 0
        );

      case WEAPON_ABILITY_IDS.BATON_MYSTIC_SHIELD:
        return COMBAT_MESSAGES.HISTORY.NEGATE_DAMAGE_TRIGGERED(
          context.negatedDamage ?? 0
        );

      default:
        return COMBAT_MESSAGES.HISTORY.ABILITY_TRIGGERED(
          context.abilityName ?? abilityId
        );
    }
  }

  /**
   * Génère une description pour un blocage
   */
  static generateBlockDescription(damage: number): string {
    return `Vous bloquez ${damage} dégâts`;
  }

  /**
   * Génère une description pour un reroll
   */
  static generateRerollDescription(): string {
    return 'Vous relancez les dés';
  }
}
