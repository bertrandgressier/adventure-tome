import { describe, it, expect } from 'vitest';
import {
  DICE_ROLL_RESULTS,
  COMBAT_MESSAGES,
  WEAPON_ABILITY_IDS,
} from '@/src/domain/services/combat/constants';

describe('Combat Constants', () => {
  describe('DICE_ROLL_RESULTS', () => {
    describe('isDouble', () => {
      it('should return true for matching dice (double 1s)', () => {
        expect(DICE_ROLL_RESULTS.isDouble(1, 1)).toBe(true);
      });

      it('should return true for matching dice (double 6s)', () => {
        expect(DICE_ROLL_RESULTS.isDouble(6, 6)).toBe(true);
      });

      it('should return false for different dice', () => {
        expect(DICE_ROLL_RESULTS.isDouble(3, 4)).toBe(false);
      });
    });

    describe('isHit', () => {
      it('should return true when roll is less than dexterity', () => {
        expect(DICE_ROLL_RESULTS.isHit(5, 8)).toBe(true);
      });

      it('should return true when roll equals dexterity', () => {
        expect(DICE_ROLL_RESULTS.isHit(8, 8)).toBe(true);
      });

      it('should return false when roll is greater than dexterity', () => {
        expect(DICE_ROLL_RESULTS.isHit(9, 8)).toBe(false);
      });
    });

    describe('isMiss', () => {
      it('should return false when roll is less than dexterity', () => {
        expect(DICE_ROLL_RESULTS.isMiss(5, 8)).toBe(false);
      });

      it('should return false when roll equals dexterity', () => {
        expect(DICE_ROLL_RESULTS.isMiss(8, 8)).toBe(false);
      });

      it('should return true when roll is greater than dexterity', () => {
        expect(DICE_ROLL_RESULTS.isMiss(9, 8)).toBe(true);
      });
    });
  });

  describe('COMBAT_MESSAGES', () => {
    describe('WEAPON_ABILITY.TRIGGERED', () => {
      it('should have message for extra attack', () => {
        expect(COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.EXTRA_ATTACK).toContain('DOUBLE');
        expect(COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.EXTRA_ATTACK).toContain('Attaque supplémentaire');
      });

      it('should generate heal on kill message with amount', () => {
        const message = COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.HEAL_ON_KILL(1);
        expect(message).toContain('Ennemi vaincu');
        expect(message).toContain('+1 PV');
      });

      it('should generate convert miss message with points spent', () => {
        const message = COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.CONVERT_MISS(1);
        expect(message).toContain('Flèche guidée');
        expect(message).toContain('-1 CHANCE');
      });

      it('should generate surprise bonus message with amount', () => {
        const message = COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.SURPRISE_BONUS(2);
        expect(message).toContain('SURPRISE');
        expect(message).toContain('+2 dégâts');
      });

      it('should have message for negate damage', () => {
        expect(COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.NEGATE_DAMAGE).toContain('Bouclier mystique');
        expect(COMBAT_MESSAGES.WEAPON_ABILITY.TRIGGERED.NEGATE_DAMAGE).toContain('annulés');
      });
    });

    describe('HISTORY messages', () => {
      it('should generate extra attack triggered message', () => {
        expect(COMBAT_MESSAGES.HISTORY.EXTRA_ATTACK_TRIGGERED).toContain('Lame de l\'Aube');
        expect(COMBAT_MESSAGES.HISTORY.EXTRA_ATTACK_TRIGGERED).toContain('Double');
      });

      it('should generate heal on kill message', () => {
        const message = COMBAT_MESSAGES.HISTORY.HEAL_ON_KILL_TRIGGERED(1, 26, 32);
        expect(message).toContain('Marteau de la Terre');
        expect(message).toContain('+1 PV');
        expect(message).toContain('26/32');
      });

      it('should generate convert miss message', () => {
        const message = COMBAT_MESSAGES.HISTORY.CONVERT_MISS_TRIGGERED(1, 4);
        expect(message).toContain('Arc des Vents');
        expect(message).toContain('Raté → Touché');
        expect(message).toContain('-1 CHANCE');
        expect(message).toContain('reste 4');
      });

      it('should generate surprise bonus message', () => {
        const message = COMBAT_MESSAGES.HISTORY.SURPRISE_BONUS_TRIGGERED(2, 4);
        expect(message).toContain('Dague des Ombres');
        expect(message).toContain('+2 dégâts');
        expect(message).toContain('total: 4');
      });

      it('should generate negate damage message', () => {
        const message = COMBAT_MESSAGES.HISTORY.NEGATE_DAMAGE_TRIGGERED(7);
        expect(message).toContain('Bâton du Sage');
        expect(message).toContain('7 dégâts annulés');
      });

      it('should generate generic ability message', () => {
        const message = COMBAT_MESSAGES.HISTORY.ABILITY_TRIGGERED('Super Pouvoir');
        expect(message).toContain('Super Pouvoir');
        expect(message).toContain('activé');
      });
    });

    describe('ATTACK messages', () => {
      it('should generate hit message', () => {
        const message = COMBAT_MESSAGES.ATTACK.HIT('Vous', "l'ennemi", 8);
        expect(message).toBe("Vous touche l'ennemi et inflige 8 dégâts");
      });

      it('should generate miss message', () => {
        const message = COMBAT_MESSAGES.ATTACK.MISS('Vous', "l'ennemi");
        expect(message).toBe("Vous rate l'ennemi");
      });

      it('should have double roll message', () => {
        expect(COMBAT_MESSAGES.ATTACK.DOUBLE_ROLL).toContain('DOUBLE');
      });
    });
  });

  describe('WEAPON_ABILITY_IDS', () => {
    it('should have all legendary weapon ability IDs', () => {
      expect(WEAPON_ABILITY_IDS.LAME_AUBE_EXTRA_ATTACK).toBe('lame-aube-extra-attack');
      expect(WEAPON_ABILITY_IDS.MARTEAU_VAMPIRIC).toBe('marteau-vampiric');
      expect(WEAPON_ABILITY_IDS.ARC_WIND_GUIDED).toBe('arc-wind-guided');
      expect(WEAPON_ABILITY_IDS.DAGUE_SURPRISE_STRIKE).toBe('dague-surprise-strike');
      expect(WEAPON_ABILITY_IDS.BATON_MYSTIC_SHIELD).toBe('baton-mystic-shield');
    });
  });
});
