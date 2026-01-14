import type { DiceRoll } from '../../types/combatants';
import { DiceService } from '../DiceService';

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

    const dice1 = DiceService.roll1d6();
    const dice2 = DiceService.roll1d6();

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
    return DiceService.roll1d6();
  }

  static calculateDamage(weaponBonus: number, damageDiceOverride?: number): number {
    const damageDice = this.rollDamageDice(damageDiceOverride);
    return 1 + damageDice + weaponBonus;
  }
}
