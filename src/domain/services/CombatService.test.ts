import { describe, it, expect, beforeEach } from 'vitest';
import { CombatService } from './CombatService';
import type { Enemy } from '../types/combat';
import { Attacker } from '../types/Attacker';

describe('CombatService', () => {
  describe('rollTwoDice', () => {
    it('devrait retourner un nombre entre 2 et 12', () => {
      for (let i = 0; i < 100; i++) {
        const result = CombatService.rollTwoDice();
        expect(result).toBeGreaterThanOrEqual(2);
        expect(result).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('rollOneDie', () => {
    it('devrait retourner un nombre entre 1 et 6', () => {
      for (let i = 0; i < 100; i++) {
        const result = CombatService.rollOneDie();
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('checkHit', () => {
    it('devrait toucher si le jet est <= dextérité', () => {
      const result = CombatService.checkHit(10, 8);
      expect(result.hit).toBe(true);
      expect(result.roll).toBe(8);
    });

    it('ne devrait pas toucher si le jet est > dextérité', () => {
      const result = CombatService.checkHit(10, 11);
      expect(result.hit).toBe(false);
      expect(result.roll).toBe(11);
    });

    it('devrait accepter un jet de dés optionnel', () => {
      const result = CombatService.checkHit(10);
      expect(result.roll).toBeGreaterThanOrEqual(2);
      expect(result.roll).toBeLessThanOrEqual(12);
    });
  });

  describe('calculateDamage', () => {
    it('devrait calculer les dégâts = 1 + jet + arme', () => {
      const result = CombatService.calculateDamage(3, 4);
      expect(result.damage).toBe(8); // 1 + 4 + 3
      expect(result.diceRoll).toBe(4);
    });

    it('devrait accepter un jet de dés optionnel', () => {
      const result = CombatService.calculateDamage(2);
      expect(result.diceRoll).toBeGreaterThanOrEqual(1);
      expect(result.diceRoll).toBeLessThanOrEqual(6);
      expect(result.damage).toBe(1 + result.diceRoll + 2);
    });
  });

  describe('resolveCombatRound', () => {
    let enemy: Enemy;

    beforeEach(() => {
      enemy = {
        name: 'Gobelin',
        dexterite: 10,
        endurance: 15,
        enduranceMax: 15,
        attackPoints: 2
      };
    });

    it('devrait résoudre un round où le joueur touche', () => {
      const round = CombatService.resolveCombatRound(
        1,
        Attacker.PLAYER,
        12, // player dex
        20, // player endurance
        3,  // weapon damage
        enemy,
        15, // enemy endurance
        8,  // hit roll (8 <= 12 = touché)
        4   // damage roll
      );

      expect(round.roundNumber).toBe(1);
      expect(round.attacker).toBe(Attacker.PLAYER);
      expect(round.hitDiceRoll).toBe(8);
      expect(round.hitSuccess).toBe(true);
      expect(round.damageDiceRoll).toBe(4);
      expect(round.weaponDamage).toBe(3);
      expect(round.totalDamage).toBe(8); // 1 + 4 + 3
      expect(round.playerEnduranceAfter).toBe(20); // pas touché
      expect(round.enemyEnduranceAfter).toBe(7); // 15 - 8
    });

    it('devrait résoudre un round où le joueur rate', () => {
      const round = CombatService.resolveCombatRound(
        1,
        Attacker.PLAYER,
        10,
        20,
        3,
        enemy,
        15,
        11, // 11 > 10 = raté
        undefined
      );

      expect(round.hitSuccess).toBe(false);
      expect(round.damageDiceRoll).toBeUndefined();
      expect(round.totalDamage).toBeUndefined();
      expect(round.playerEnduranceAfter).toBe(20);
      expect(round.enemyEnduranceAfter).toBe(15); // pas de dégâts
    });

    it('devrait résoudre un round où l\'ennemi touche', () => {
      const round = CombatService.resolveCombatRound(
        2,
        Attacker.ENEMY,
        12,
        20,
        3,
        enemy,
        15,
        8, // 8 <= 10 (dex enemy) = touché
        5
      );

      expect(round.attacker).toBe(Attacker.ENEMY);
      expect(round.hitSuccess).toBe(true);
      expect(round.weaponDamage).toBe(2); // enemy weapon
      expect(round.totalDamage).toBe(8); // 1 + 5 + 2
      expect(round.playerEnduranceAfter).toBe(12); // 20 - 8
      expect(round.enemyEnduranceAfter).toBe(15); // pas touché
    });

    it('ne devrait pas descendre l\'endurance en dessous de 0', () => {
      const round = CombatService.resolveCombatRound(
        1,
        Attacker.PLAYER,
        12,
        20,
        10, // grosse arme
        enemy,
        5,  // enemy presque mort
        8,
        6
      );

      expect(round.totalDamage).toBe(17); // 1 + 6 + 10
      expect(round.enemyEnduranceAfter).toBe(0); // max(0, 5 - 17)
    });

    it('devrait générer des jets aléatoires si non fournis', () => {
      const round = CombatService.resolveCombatRound(
        1,
        Attacker.PLAYER,
        12,
        20,
        3,
        enemy,
        15
        // pas de jets fournis
      );

      expect(round.hitDiceRoll).toBeGreaterThanOrEqual(2);
      expect(round.hitDiceRoll).toBeLessThanOrEqual(12);
      
      if (round.hitSuccess) {
        expect(round.damageDiceRoll).toBeGreaterThanOrEqual(1);
        expect(round.damageDiceRoll).toBeLessThanOrEqual(6);
      }
    });
  });
});
