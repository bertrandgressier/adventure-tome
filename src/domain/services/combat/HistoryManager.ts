import type {
  CombatHistoryEntry,
  HitRollDetails,
  DamageRollDetails,
  HPSnapshot,
} from '../../types/combat-history';
import type { CombatState } from '../../types/combat-v2';
import type { CombatActionType } from '../../types/CombatActionType';
import type { Attacker } from '../../types/Attacker';
import type { DiceRoll } from '../../types/combatants';

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
