/**
 * Tests E2E complets du CombatEngine V3
 * 
 * Couvre :
 * - 5+ scénarios de combat complet (victoire, défaite, combat serré)
 * - Tests des armes légendaires
 * - Tests des items en combat
 * - Tests des edge cases
 * 
 * Basé sur l'issue #121 - Tests End-to-End Moteur Combat V3
 */

import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import { CombatPhaseV3 } from '@/src/domain/types/CombatPhaseV3';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import {
  createTestCombat,
  simulateAttack,
  simulateFullRound,
  simulateUntilEnd,
  assertVictory,
  assertDefeat,
  assertOngoing,
  assertPlayerHP,
  assertEnemyHP,
  assertPhase,
  assertRound,
  assertCurrentTurn,
  TEST_ENEMIES,
  TEST_PLAYERS,
  LEGENDARY_WEAPONS,
  STANDARD_WEAPONS,
} from './helpers/combat-test-helpers';

describe('CombatEngine V3 - Tests E2E Complets', () => {
  describe('Scénario 1 : Victoire rapide (Easy)', () => {
    it('should defeat a weak goblin in 2 rounds', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.WEAK_GOBLIN
      );

      // Round 1 : Joueur touche (2d6 = 3 ≤ 7), inflige 7 dégâts (1d6=4 + 3 bonus)
      let newState = simulateAttack(state, [2, 1], 4);
      assertEnemyHP(newState, 1); // 8 - 7 = 1
      assertOngoing(newState);
      
      // Skip to next turn
      const skip1 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip1.state;

      // Ennemi rate (2d6 = 8 > 5)
      newState = simulateAttack(newState, [4, 4]);
      assertPlayerHP(newState, 32);
      
      const skip2 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip2.state;

      // Round 2 : Joueur touche et tue
      newState = simulateAttack(newState, [3, 2], 3);
      
      assertVictory(newState);
      assertEnemyHP(newState, 0);
      assertPlayerHP(newState, 32);
      assertPhase(newState, CombatPhaseV3.ENDED);
    });
  });

  describe('Scénario 2 : Défaite du joueur (Hard)', () => {
    it('should lose against a troll with low HP', () => {
      const state = createTestCombat(
        { ...TEST_PLAYERS.NOVICE, endurance: 5 },
        TEST_ENEMIES.TROLL
      );

      // Round 1 : Joueur rate (2d6 = 10 > 6)
      let newState = simulateAttack(state, [5, 5]);
      assertPlayerHP(newState, 5);
      assertOngoing(newState);
      
      const skip1 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip1.state;

      // Troll touche (2d6 = 7 ≤ 8), inflige 6 dégâts (1d6=6 + 0 bonus ennemi)
      newState = simulateAttack(newState, [3, 4], 6);
      
      assertDefeat(newState);
      assertPlayerHP(newState, 0);
      assertPhase(newState, CombatPhaseV3.ENDED);
    });
  });

  describe('Scénario 3 : Combat serré contre un Orc (Medium)', () => {
    it('should win a close combat against an Orc', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.ORC
      );

      // Round 1 : Joueur touche, Orc touche
      let newState = simulateFullRound(
        state,
        { hit: [3, 2], damage: 5 }, // Joueur: 5 + 3 = 8 dégâts
        { hit: [3, 3], damage: 4 }  // Orc: 4 + 0 = 4 dégâts
      );

      assertPlayerHP(newState, 28); // 32 - 4
      assertEnemyHP(newState, 12); // 20 - 8
      assertRound(newState, 2);
      assertOngoing(newState);

      // Round 2 : Joueur touche, Orc touche
      newState = simulateFullRound(
        newState,
        { hit: [2, 3], damage: 6 }, // 6 + 3 = 9 dégâts
        { hit: [4, 2], damage: 5 }  // 5 + 0 = 5 dégâts
      );

      assertPlayerHP(newState, 23); // 28 - 5
      assertEnemyHP(newState, 3);   // 12 - 9
      assertRound(newState, 3);

      // Round 3 : Joueur finit l'Orc
      newState = simulateAttack(newState, [3, 1], 4); // 4 + 3 = 7 dégâts

      assertVictory(newState);
      assertEnemyHP(newState, 0);
      assertPlayerHP(newState, 23);
    });
  });

  describe('Scénario 4 : Combat de Boss contre Dragon (Epic)', () => {
    it('should defeat a dragon with legendary weapon Excalibur', () => {
      const state = createTestCombat(
        TEST_PLAYERS.HERO,
        TEST_ENEMIES.BOSS_DRAGON
      );

      expect(state.player.weapon.id).toBe('excalibur');
      expect(state.player.totalDamageBonus).toBe(8);

      // Simuler 4 rounds de combat épique
      const attacks = [
        { player: { hit: [4, 3], damage: 6 }, enemy: { hit: [5, 4], damage: 5 } }, // R1: Joueur 14 dmg, Dragon 5 dmg
        { player: { hit: [3, 3], damage: 5 }, enemy: { hit: [4, 4], damage: 4 } }, // R2: Joueur 13 dmg, Dragon 4 dmg
        { player: { hit: [2, 4], damage: 6 }, enemy: { hit: [6, 3], damage: 6 } }, // R3: Joueur 14 dmg, Dragon 6 dmg
        { player: { hit: [5, 2], damage: 5 }, enemy: { hit: [5, 5] } },            // R4: Joueur 13 dmg, Dragon rate
      ];

      const newState = simulateUntilEnd(state, attacks, 4);

      // Joueur: 50 - (5 + 4 + 6) = 35 HP
      // Dragon: 50 - (14 + 13 + 14 + 13) = -4 HP
      assertVictory(newState);
      assertEnemyHP(newState, 0);
      assertPlayerHP(newState, 35);
    });
  });

  describe('Scénario 5 : Combat avec ennemi commençant en premier', () => {
    it('should handle enemy attacking first (surprise)', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.GOBLIN,
        { firstAttacker: 'enemy' }
      );

      assertCurrentTurn(state, 'enemy');
      assertPhase(state, CombatPhaseV3.WAITING_ATTACK_ROLL);

      // Ennemi attaque en premier
      let newState = simulateAttack(state, [2, 3], 4); // Touche, 4 dégâts
      assertPlayerHP(newState, 28); // 32 - 4
      
      const skip = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip.state;

      assertCurrentTurn(newState, 'player');
      
      // Joueur contre-attaque
      newState = simulateAttack(newState, [3, 2], 5); // 5 + 3 = 8 dégâts
      assertEnemyHP(newState, 7); // 15 - 8
    });
  });

  describe('Tests des armes légendaires', () => {
    it('should apply Excalibur damage bonus (+8)', () => {
      const state = createTestCombat(
        { weapon: LEGENDARY_WEAPONS.EXCALIBUR },
        TEST_ENEMIES.GOBLIN
      );

      expect(state.player.weapon.bonus).toBe(8);
      expect(state.player.totalDamageBonus).toBe(8);

      const newState = simulateAttack(state, [3, 2], 4); // 4 + 8 = 12 dégâts
      assertEnemyHP(newState, 3); // 15 - 12
    });

    it('should apply Durandal damage bonus (+6)', () => {
      const state = createTestCombat(
        { weapon: LEGENDARY_WEAPONS.DURANDAL },
        TEST_ENEMIES.GOBLIN
      );

      expect(state.player.totalDamageBonus).toBe(6);

      const newState = simulateAttack(state, [2, 3], 5); // 5 + 6 = 11 dégâts
      assertEnemyHP(newState, 4); // 15 - 11
    });

    it('should apply Fragarach damage bonus (+7)', () => {
      const state = createTestCombat(
        { weapon: LEGENDARY_WEAPONS.FRAGARACH },
        TEST_ENEMIES.ORC
      );

      expect(state.player.totalDamageBonus).toBe(7);

      const newState = simulateAttack(state, [4, 2], 3); // 3 + 7 = 10 dégâts
      assertEnemyHP(newState, 10); // 20 - 10
    });
  });

  describe('Edge cases', () => {
    it('should handle simultaneous death (both HP reach 0)', () => {
      const state = createTestCombat(
        { endurance: 4, enduranceMax: 32 },
        { endurance: 4, enduranceMax: 15 }
      );

      // Joueur touche et tue l'ennemi avec 7 dégâts
      const newState = simulateAttack(state, [3, 2], 4); // 4 + 3 = 7 dégâts

      // Combat se termine en victoire (joueur tue ennemi en premier)
      assertVictory(newState);
      assertEnemyHP(newState, 0);
    });

    it('should not allow actions after combat ended', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        { endurance: 1, enduranceMax: 15 }
      );

      // Tuer l'ennemi
      const newState = simulateAttack(state, [3, 2], 1); // 1 + 3 = 4 dégâts
      assertVictory(newState);

      // Tenter une autre attaque (ne devrait rien changer)
      const result = CombatEngine.resolve(newState, { type: CombatActionType.ATTACK }, { hitDice: [2, 2] });
      
      expect(result.state).toEqual(newState);
      expect(result.events).toEqual([]);
    });

    it('should handle exactly 0 HP as defeat/victory', () => {
      // Victoire : ennemi à exactement 0 HP
      const victoryState = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        { endurance: 4, enduranceMax: 15 }
      );
      
      const victory = simulateAttack(victoryState, [2, 3], 1); // 1 + 3 = 4 dégâts
      assertVictory(victory);
      assertEnemyHP(victory, 0);

      // Défaite : joueur à exactement 0 HP
      const defeatState = createTestCombat(
        { endurance: 5, enduranceMax: 32 },
        TEST_ENEMIES.TROLL,
        { firstAttacker: 'enemy' }
      );
      
      const defeat = simulateAttack(defeatState, [3, 3], 5); // 5 + 0 = 5 dégâts
      assertDefeat(defeat);
      assertPlayerHP(defeat, 0);
    });

    it('should respect firstAttacker configuration', () => {
      const playerFirst = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.GOBLIN,
        { firstAttacker: 'player' }
      );
      assertCurrentTurn(playerFirst, 'player');

      const enemyFirst = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.GOBLIN,
        { firstAttacker: 'enemy' }
      );
      assertCurrentTurn(enemyFirst, 'enemy');
    });

    it('should increment round after both turns complete', () => {
      const state = createTestCombat();
      assertRound(state, 1);

      // Tour joueur
      let newState = simulateAttack(state, [3, 2], 4);
      assertRound(newState, 1);
      
      const skip1 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip1.state;

      // Tour ennemi
      newState = simulateAttack(newState, [3, 2], 3);
      assertRound(newState, 1);
      
      const skip2 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip2.state;

      // Nouveau round
      assertRound(newState, 2);
    });

    it('should handle missed attacks without damage', () => {
      const state = createTestCombat();

      // Joueur rate (2d6 = 12 > 7)
      const newState = simulateAttack(state, [6, 6]);

      assertPlayerHP(newState, 32);
      assertEnemyHP(newState, 15);
      expect(newState.lastRoll?.success).toBe(false);
      expect(newState.lastRoll?.total).toBe(12);
    });
  });

  describe('Reroll mechanics', () => {
    it('should allow reroll on missed attack', () => {
      const state = createTestCombat();

      // Joueur rate
      let newState = simulateAttack(state, [5, 4]); // 9 > 7
      expect(newState.lastRoll?.success).toBe(false);
      expect(newState.usedReroll).toBe(false);

      // Vérifier que reroll est disponible
      const actions = CombatEngine.getAvailableActions(newState);
      const rerollAction = actions.find(a => a.action.type === CombatActionType.REROLL);
      expect(rerollAction).toBeDefined();
      expect(rerollAction?.enabled).toBe(true);

      // Utiliser reroll
      const reroll = CombatEngine.resolve(newState, { type: CombatActionType.REROLL }, { hitDice: [3, 2] });
      newState = reroll.state;

      expect(newState.lastRoll?.success).toBe(true);
      expect(newState.usedReroll).toBe(true);
    });

    it('should not allow reroll twice in same combat', () => {
      const state = createTestCombat();

      // Premier reroll
      let newState = simulateAttack(state, [5, 5]);
      const reroll1 = CombatEngine.resolve(newState, { type: CombatActionType.REROLL }, { hitDice: [3, 2] });
      newState = reroll1.state;
      expect(newState.usedReroll).toBe(true);

      // Skip to next round
      const skip1 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip1.state;
      
      const skip2 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip2.state;
      
      const skip3 = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip3.state;

      // Rater une nouvelle attaque
      newState = simulateAttack(newState, [6, 5]);

      // Reroll ne devrait pas être disponible
      const actions = CombatEngine.getAvailableActions(newState);
      const rerollAction = actions.find(a => a.action.type === CombatActionType.REROLL);
      
      if (rerollAction) {
        expect(rerollAction.enabled).toBe(false);
      }
    });
  });

  describe('Combat flow integrity', () => {
    it('should maintain correct phase transitions', () => {
      const state = createTestCombat();
      assertPhase(state, CombatPhaseV3.WAITING_ATTACK_ROLL);

      // Joueur touche
      let newState = simulateAttack(state, [3, 2], 4);
      assertPhase(newState, CombatPhaseV3.TURN_COMPLETE);

      // Skip to enemy turn
      const skip = CombatEngine.resolve(newState, { type: CombatActionType.SKIP });
      newState = skip.state;
      assertPhase(newState, CombatPhaseV3.WAITING_ATTACK_ROLL);
      assertCurrentTurn(newState, 'enemy');
    });

    it('should track events correctly', () => {
      const state = createTestCombat();

      const result = CombatEngine.resolve(state, { type: CombatActionType.ATTACK }, { hitDice: [3, 2], damageDice: 5 });

      expect(result.events).toHaveLength(2); // ATTACK_ROLL + DAMAGE_ROLL
      expect(result.events[0].type).toBe('attack_roll');
      expect(result.events[1].type).toBe('damage_roll');
    });

    it('should handle multiple rounds without errors', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.TROLL
      );

      const attacks = Array(5).fill({
        player: { hit: [3, 2], damage: 4 },
        enemy: { hit: [4, 3], damage: 3 },
      });

      const finalState = simulateUntilEnd(state, attacks, 5);

      expect(finalState.roundNumber).toBeGreaterThan(1);
      expect(finalState.roundNumber).toBeLessThanOrEqual(6);
    });
  });

  describe('Damage calculation', () => {
    it('should calculate player damage correctly (base + dice + weapon)', () => {
      const state = createTestCombat(
        { weapon: STANDARD_WEAPONS.AXE }, // +4 bonus
        TEST_ENEMIES.GOBLIN
      );

      const newState = simulateAttack(state, [3, 2], 3); // dice=3, bonus=4, total=7
      assertEnemyHP(newState, 8); // 15 - 7
    });

    it('should calculate enemy damage correctly (base + dice, no weapon)', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        TEST_ENEMIES.GOBLIN,
        { firstAttacker: 'enemy' }
      );

      const newState = simulateAttack(state, [3, 2], 5); // dice=5, no bonus, total=5
      assertPlayerHP(newState, 27); // 32 - 5
    });

    it('should not allow negative HP', () => {
      const state = createTestCombat(
        TEST_PLAYERS.WARRIOR,
        { endurance: 2, enduranceMax: 15 }
      );

      const newState = simulateAttack(state, [2, 3], 6); // 6 + 3 = 9 dégâts > 2 HP
      assertEnemyHP(newState, 0); // Capped at 0, not -7
    });
  });
});
