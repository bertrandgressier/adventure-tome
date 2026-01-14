import type { DiceRoll } from '../../types/combatants';

export interface DiceOverrides {
  hitDice?: [number, number];
  damageDice?: number;
  luckDice?: [number, number];
}

export class DiceRoller {
  static rollHitDice(override?: [number, number]): DiceRoll {
    if (override) {
      return {
        dice1: override[0],
        dice2: override[1],
        total: override[0] + override[1],
        isDouble: override[0] === override[1],
      };
    }

    const dice = Math.random() * 6 * 6;
    const dice1 = Math.floor(dice / 6) + 1;
    const dice2 = (dice % 6) + 1;

    return {
      dice1,
      dice2,
      total: dice1 + dice2,
      isDouble: dice1 === dice2,
    };
  }

  static rollDamageDice(override?: number): number {
    if (override !== undefined) {
      return override;
    }
    return Math.floor(Math.random() * 6) + 1;
  }

  static calculateDamage(weaponBonus: number, damageDiceOverride?: number): number {
    const damageDice = this.rollDamageDice(damageDiceOverride);
    return 1 + damageDice + weaponBonus;
  }
}
