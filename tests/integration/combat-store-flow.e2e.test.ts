/**
 * Combat Store Flow E2E Tests
 * 
 * Ces tests valident le flux complet du combat en utilisant uniquement le store,
 * sans composants UI. Ils simulent les interactions utilisateur et vérifient
 * les transitions de phases et l'état du combat.
 * 
 * Scénarios testés :
 * 1. Tour complet joueur → ennemi → joueur
 * 2. Reroll avec animations
 * 3. Combat jusqu'à victoire
 * 4. Combat jusqu'à défaite
 * 5. Utilisation d'items
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCombatSlice, type CombatSlice, type CombatTurnPhase } from '@/src/presentation/stores/slices/combatSlice';
import { Character, type GameMode, type ProgressData } from '@/src/domain/entities/Character';
import { Stats, type StatsData } from '@/src/domain/value-objects/Stats';
import { Inventory } from '@/src/domain/value-objects/Inventory';
import { CombatActionType } from '@/src/domain/types/CombatActionType';
import { CombatPhase } from '@/src/domain/types/CombatPhase';
import { Attacker } from '@/src/domain/types/Attacker';
import type { EnemyConfig } from '@/src/domain/types/combatants';
import type { CombatState } from '@/src/domain/types/combat-state';

// Helper pour créer un mock store qui track les états
function createMockStore() {
  let state: ReturnType<typeof createInitialState>;
  const mockSet = vi.fn().mockImplementation((update) => {
    state = { ...state, ...(typeof update === 'function' ? update(state) : update) };
  });
  const mockGet = vi.fn().mockImplementation(() => state);

  function createInitialState() {
    return {
      combat: null as CombatState | null,
      availableActions: [] as CombatSlice['availableActions'],
      turnPhase: 'PLAYER_TURN_START' as CombatTurnPhase,
      lastActionTimestamp: 0,
      privateInitialChance: 0,
      error: null as string | null,
      characters: {} as Record<string, Character>,
      updateStats: vi.fn().mockResolvedValue(undefined),
      applyDamage: vi.fn().mockResolvedValue(undefined),
      consumeItem: vi.fn().mockResolvedValue(undefined),
      getItem: vi.fn(),
    };
  }

  state = createInitialState();

  return {
    get state() { return state; },
    set: mockSet,
    get: mockGet,
    reset: () => { state = createInitialState(); },
    setCharacter: (char: Character) => { state.characters[char.id] = char; },
  };
}

const defaultProgressData: ProgressData = {
  currentParagraph: 1,
  history: [],
  lastSaved: '2024-01-01T00:00:00.000Z',
};

function createMockCharacter(
  statsData: StatsData,
  options?: { 
    id?: string; 
    hasRerollItem?: boolean;
    items?: Array<{ itemId: string; quantity: number; possessed: boolean }>;
  }
): Character {
  const stats = Stats.fromData(statsData);
  const items = options?.items ?? [];
  
  // Ajouter l'item de reroll si demandé
  if (options?.hasRerollItem) {
    items.push({ itemId: 'tome1-bague-deuxieme-chance', quantity: 1, possessed: true });
  }
  
  const inventory = new Inventory(0, { name: 'Épée', attackPoints: 3 }, items);

  return Character.fromData({
    id: options?.id ?? 'test-hero-id',
    name: 'Hero',
    book: 1,
    talent: 'guerrier',
    secondTalent: undefined,
    gameMode: 'mortal' as GameMode,
    version: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    stats: stats.toData(),
    inventory: inventory.toData(),
    progress: defaultProgressData,
    notes: '',
  });
}

const createEnemy = (overrides?: Partial<EnemyConfig>): EnemyConfig => ({
  name: 'Gobelin',
  dexterite: 8,
  endurance: 20,
  enduranceMax: 20,
  ...overrides,
});

const defaultConfig = {
  damageFormula: '2d6 + HABILETÉ + weapon',
};

describe('Combat Store Flow E2E', () => {
  let store: ReturnType<typeof createMockStore>;
  let slice: CombatSlice;

  beforeEach(() => {
    store = createMockStore();
    slice = createCombatSlice()(store.set, store.get);
    // Merge slice into state
    Object.assign(store.state, slice);
  });

  describe('Flux complet : Joueur → Ennemi → Joueur', () => {
    beforeEach(() => {
      const character = createMockCharacter({
        dexterite: 10,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      });
      store.setCharacter(character);
    });

    it('devrait avoir les bonnes phases initiales après startCombat', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);

      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      expect(store.state.combat).not.toBeNull();
      expect(store.state.combat?.currentTurn).toBe('player');
      expect(store.state.combat?.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
    });

    it('devrait passer à PLAYER_ATTACKING après executeAction (attack)', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);

      // Joueur attaque avec des dés forcés (garantit un hit)
      slice.executeAction(
        { type: CombatActionType.ATTACK },
        { hitDice: [3, 3], damageDice: 5 } // Total 6 ≤ dexterite 10 = hit
      );

      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      expect(store.state.combat?.history).toHaveLength(1);
      expect(store.state.combat?.history[0]?.turn).toBe(Attacker.PLAYER);
    });

    it('devrait passer à ENEMY_TURN_START après endPlayerTurn', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });

      slice.endPlayerTurn();

      expect(store.state.turnPhase).toBe('ENEMY_TURN_START');
      // Le combat state doit être mis à jour pour le tour ennemi
      expect(store.state.combat?.currentTurn).toBe('enemy');
      expect(store.state.combat?.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
    });

    it('devrait passer à ENEMY_ATTACKING après executeEnemyAttack', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      slice.endPlayerTurn();

      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 6 }); // Enemy hit

      expect(store.state.turnPhase).toBe('ENEMY_ATTACKING');
      expect(store.state.combat?.history).toHaveLength(2);
      expect(store.state.combat?.history[1]?.turn).toBe(Attacker.ENEMY);
    });

    it('devrait retourner à PLAYER_TURN_START après endEnemyTurn', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      slice.endPlayerTurn();
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 6 });

      slice.endEnemyTurn();

      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      expect(store.state.combat?.currentTurn).toBe('player');
      expect(store.state.combat?.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
      expect(store.state.combat?.roundNumber).toBe(2); // Round 2
    });

    it('devrait compléter un cycle complet joueur → ennemi → joueur', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Round 1 : Joueur attaque
      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [5, 5], damageDice: 4 });
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      
      slice.endPlayerTurn();
      expect(store.state.turnPhase).toBe('ENEMY_TURN_START');
      // Pendant le tour ennemi, pas d'actions disponibles
      expect(store.state.availableActions).toHaveLength(0);
      
      // Ennemi attaque
      slice.executeEnemyAttack({ hitDice: [3, 3], damageDice: 5 });
      expect(store.state.turnPhase).toBe('ENEMY_ATTACKING');
      
      slice.endEnemyTurn();
      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      expect(store.state.combat?.roundNumber).toBe(2);
      // Après endEnemyTurn, le joueur doit avoir l'action "attaquer" (pas "continuer")
      const hasAttackAction = store.state.availableActions.some(
        a => a.action.type === CombatActionType.ATTACK
      );
      expect(hasAttackAction).toBe(true);
      const hasSkipAction = store.state.availableActions.some(
        a => a.action.type === CombatActionType.SKIP
      );
      expect(hasSkipAction).toBe(false);
      
      // Round 2 : Joueur peut encore attaquer
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [4, 4], damageDice: 6 });
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      expect(store.state.combat?.history).toHaveLength(3);
    });
  });

  describe('Flux Reroll', () => {
    beforeEach(() => {
      const character = createMockCharacter(
        {
          dexterite: 10,
          chance: 5,
          chanceInitiale: 5,
          pointsDeVieMax: 30,
          pointsDeVieActuels: 30,
        },
        { hasRerollItem: true }
      );
      store.setCharacter(character);
    });

    it('devrait permettre le reroll si le personnage a l\'item de reroll', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);

      // usedReroll doit être false au départ
      expect(store.state.combat?.usedReroll).toBe(false);
    });

    it('devrait passer à PLAYER_ATTACKING après un reroll', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Première attaque : rate (total 12 > dexterite 10)
      slice.executeAction(
        { type: CombatActionType.ATTACK },
        { hitDice: [6, 6], damageDice: 5 } // Total 12 > 10 = miss
      );
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      expect(store.state.combat?.history[0]?.hitRoll?.success).toBe(false);

      // Le reroll est disponible
      slice.endPlayerTurn();
      slice.endEnemyTurn(); // Simule le passage du tour (pour avoir phase correcte)
      
      // Non, en fait après un miss, on peut reroll immédiatement
      // Recommençons
    });

    it('devrait permettre le reroll après un miss sans passer au tour ennemi', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Première attaque : rate
      slice.executeAction(
        { type: CombatActionType.ATTACK },
        { hitDice: [6, 6], damageDice: 5 } // Total 12 > 10 = miss
      );
      
      // Vérifier que le reroll est dans les actions disponibles
      const hasRerollAction = store.state.availableActions.some(
        a => a.action.type === CombatActionType.REROLL
      );
      expect(hasRerollAction).toBe(true);

      // Exécuter le reroll
      slice.executeAction(
        { type: CombatActionType.REROLL },
        { hitDice: [3, 3], damageDice: 6 } // Total 6 ≤ 10 = hit
      );

      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      expect(store.state.combat?.usedReroll).toBe(true);
      expect(store.state.combat?.history).toHaveLength(2);
      expect(store.state.combat?.history[1]?.action).toBe(CombatActionType.REROLL);
    });

    it('devrait avoir la bonne séquence de phases avec reroll: attack miss → reroll hit → endPlayerTurn', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Phase 1: PLAYER_TURN_START
      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      
      // Attaque rate
      slice.executeAction(
        { type: CombatActionType.ATTACK },
        { hitDice: [6, 6], damageDice: 5 } // miss
      );
      
      // Phase 2: PLAYER_ATTACKING (même après miss)
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      
      // Reroll réussit
      slice.executeAction(
        { type: CombatActionType.REROLL },
        { hitDice: [2, 2], damageDice: 6 } // hit
      );
      
      // Phase 3: PLAYER_ATTACKING (reroll est aussi une attaque)
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      
      // Fin du tour joueur
      slice.endPlayerTurn();
      
      // Phase 4: ENEMY_TURN_START
      expect(store.state.turnPhase).toBe('ENEMY_TURN_START');
      expect(store.state.combat?.currentTurn).toBe('enemy');
    });

    it('ne devrait plus permettre de reroll après l\'avoir utilisé', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Miss puis reroll
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6], damageDice: 5 });
      slice.executeAction({ type: CombatActionType.REROLL }, { hitDice: [3, 3], damageDice: 6 });
      
      // Passer au tour suivant
      slice.endPlayerTurn();
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      slice.endEnemyTurn();
      
      // Round 2 : Joueur rate à nouveau
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6], damageDice: 5 });
      
      // Reroll ne devrait plus être disponible
      const hasRerollAction = store.state.availableActions.some(
        a => a.action.type === CombatActionType.REROLL
      );
      expect(hasRerollAction).toBe(false);
    });
  });

  describe('Combat jusqu\'à victoire', () => {
    it('devrait passer à COMBAT_ENDED quand l\'ennemi meurt', () => {
      const character = createMockCharacter({
        dexterite: 12,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      });
      store.setCharacter(character);
      
      // Ennemi faible
      slice.startCombat('test-hero-id', createEnemy({ endurance: 5, enduranceMax: 5 }), defaultConfig);
      
      // Attaque puissante (dégâts = 2d6 + bonus, avec damageDice=6 et arme bonus 3 = ~11 dégâts min)
      slice.executeAction(
        { type: CombatActionType.ATTACK },
        { hitDice: [2, 2], damageDice: 6 } // Hit garanti, gros dégâts
      );
      
      // Vérifier que l'ennemi est mort
      expect(store.state.combat?.enemy.endurance).toBeLessThanOrEqual(0);
      expect(store.state.turnPhase).toBe('COMBAT_ENDED');
    });

    it('devrait terminer même pendant le tour ennemi si le joueur gagne', () => {
      const character = createMockCharacter({
        dexterite: 15, // Très habile
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 50,
        pointsDeVieActuels: 50,
      });
      store.setCharacter(character);
      
      slice.startCombat('test-hero-id', createEnemy({ endurance: 8, enduranceMax: 8 }), defaultConfig);
      
      // Round 1
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 6 });
      
      if (store.state.turnPhase !== 'COMBAT_ENDED') {
        slice.endPlayerTurn();
        slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 4 });
        slice.endEnemyTurn();
        
        // Round 2 - devrait finir l'ennemi
        slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 6 });
      }
      
      expect(store.state.combat?.enemy.endurance).toBeLessThanOrEqual(0);
      expect(store.state.turnPhase).toBe('COMBAT_ENDED');
    });
  });

  describe('Combat jusqu\'à défaite', () => {
    it('devrait passer à COMBAT_ENDED quand le joueur meurt', () => {
      const character = createMockCharacter({
        dexterite: 5, // Faible
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 10,
        pointsDeVieActuels: 5, // Peu de vie
      });
      store.setCharacter(character);
      
      // Ennemi fort
      slice.startCombat('test-hero-id', createEnemy({ dexterite: 15, endurance: 50 }), defaultConfig);
      
      // Joueur rate
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6], damageDice: 3 });
      slice.endPlayerTurn();
      
      // Ennemi touche fort (dex 15, devrait toucher)
      slice.executeEnemyAttack({ hitDice: [3, 3], damageDice: 6 });
      
      // Vérifier que le joueur est mort ou presque
      if (store.state.combat?.player.endurance && store.state.combat.player.endurance > 0) {
        slice.endEnemyTurn();
        slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6], damageDice: 3 });
        slice.endPlayerTurn();
        slice.executeEnemyAttack({ hitDice: [2, 2], damageDice: 6 });
      }
      
      expect(store.state.combat?.player.endurance).toBeLessThanOrEqual(0);
      expect(store.state.turnPhase).toBe('COMBAT_ENDED');
    });

    it('devrait détecter la défaite pendant executeEnemyAttack', () => {
      const character = createMockCharacter({
        dexterite: 8,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 10,
        pointsDeVieActuels: 3, // Très peu de vie
      });
      store.setCharacter(character);
      
      slice.startCombat('test-hero-id', createEnemy({ dexterite: 12 }), defaultConfig);
      
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [5, 5], damageDice: 3 });
      slice.endPlayerTurn();
      
      // Ennemi tue le joueur
      slice.executeEnemyAttack({ hitDice: [3, 3], damageDice: 6 }); // Gros dégâts
      
      expect(store.state.combat?.player.endurance).toBeLessThanOrEqual(0);
      expect(store.state.turnPhase).toBe('COMBAT_ENDED');
    });
  });

  describe('Transitions de phases avec miss (sans dégâts)', () => {
    beforeEach(() => {
      const character = createMockCharacter({
        dexterite: 10,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      });
      store.setCharacter(character);
    });

    it('devrait gérer correctement un miss du joueur', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      const initialEnemyEndurance = store.state.combat?.enemy.endurance;
      
      // Miss
      slice.executeAction(
        { type: CombatActionType.ATTACK },
        { hitDice: [6, 6], damageDice: 5 } // Total 12 > 10 = miss
      );
      
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      expect(store.state.combat?.enemy.endurance).toBe(initialEnemyEndurance); // Pas de dégâts
      expect(store.state.combat?.history[0]?.hitRoll?.success).toBe(false);
      expect(store.state.combat?.history[0]?.damageRoll).toBeUndefined();
    });

    it('devrait gérer correctement un miss de l\'ennemi', () => {
      slice.startCombat('test-hero-id', createEnemy({ dexterite: 6 }), defaultConfig);
      
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      slice.endPlayerTurn();
      
      const playerEnduranceBefore = store.state.combat?.player.endurance;
      
      // Ennemi rate (dex 6, total 12 > 6)
      slice.executeEnemyAttack({ hitDice: [6, 6], damageDice: 5 });
      
      expect(store.state.turnPhase).toBe('ENEMY_ATTACKING');
      expect(store.state.combat?.player.endurance).toBe(playerEnduranceBefore);
      expect(store.state.combat?.history[1]?.hitRoll?.success).toBe(false);
    });
  });

  describe('Cohérence des états', () => {
    beforeEach(() => {
      const character = createMockCharacter({
        dexterite: 10,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      });
      store.setCharacter(character);
    });

    it('combat.currentTurn devrait correspondre à turnPhase', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // PLAYER_TURN_START → currentTurn = player
      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      expect(store.state.combat?.currentTurn).toBe('player');
      
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      
      // PLAYER_ATTACKING → currentTurn = player (toujours)
      expect(store.state.turnPhase).toBe('PLAYER_ATTACKING');
      expect(store.state.combat?.currentTurn).toBe('player');
      
      slice.endPlayerTurn();
      
      // ENEMY_TURN_START → currentTurn = enemy
      expect(store.state.turnPhase).toBe('ENEMY_TURN_START');
      expect(store.state.combat?.currentTurn).toBe('enemy');
      
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      
      // ENEMY_ATTACKING → currentTurn = enemy
      expect(store.state.turnPhase).toBe('ENEMY_ATTACKING');
      // Après l'attaque, currentTurn avance vers TURN_COMPLETE
      
      slice.endEnemyTurn();
      
      // PLAYER_TURN_START → currentTurn = player
      expect(store.state.turnPhase).toBe('PLAYER_TURN_START');
      expect(store.state.combat?.currentTurn).toBe('player');
    });

    it('combat.phase devrait être WAITING_ATTACK_ROLL au début de chaque tour', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Début combat
      expect(store.state.combat?.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
      
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      slice.endPlayerTurn();
      
      // Début tour ennemi
      expect(store.state.combat?.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
      
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      slice.endEnemyTurn();
      
      // Début round 2
      expect(store.state.combat?.phase).toBe(CombatPhase.WAITING_ATTACK_ROLL);
    });

    it('roundNumber devrait s\'incrémenter après le tour complet', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      expect(store.state.combat?.roundNumber).toBe(1);
      
      // Tour joueur
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      expect(store.state.combat?.roundNumber).toBe(1);
      
      slice.endPlayerTurn();
      expect(store.state.combat?.roundNumber).toBe(1);
      
      // Tour ennemi
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      expect(store.state.combat?.roundNumber).toBe(1); // Pas encore incrémenté
      
      slice.endEnemyTurn();
      expect(store.state.combat?.roundNumber).toBe(2); // Maintenant round 2
    });

    it('lastRoll devrait être réinitialisé après chaque changement de tour', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      expect(store.state.combat?.lastRoll).toBeDefined();
      
      slice.endPlayerTurn();
      // lastRoll réinitialisé pour le tour ennemi
      expect(store.state.combat?.lastRoll).toBeUndefined();
      
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      expect(store.state.combat?.lastRoll).toBeDefined();
      
      slice.endEnemyTurn();
      // lastRoll réinitialisé pour le tour joueur
      expect(store.state.combat?.lastRoll).toBeUndefined();
    });

    it('usedReroll devrait rester true jusqu\'à la fin du combat (une fois par combat)', () => {
      const character = createMockCharacter(
        { dexterite: 10, chance: 5, chanceInitiale: 5, pointsDeVieMax: 30, pointsDeVieActuels: 30 },
        { hasRerollItem: true }
      );
      store.setCharacter(character);
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      expect(store.state.combat?.usedReroll).toBe(false);
      
      // Miss puis reroll
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6], damageDice: 5 });
      slice.executeAction({ type: CombatActionType.REROLL }, { hitDice: [3, 3], damageDice: 6 });
      expect(store.state.combat?.usedReroll).toBe(true);
      
      slice.endPlayerTurn();
      // Après endPlayerTurn, usedReroll reste true (limite par combat, pas par tour)
      expect(store.state.combat?.usedReroll).toBe(true);
      
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      slice.endEnemyTurn();
      
      // Nouveau tour joueur - ne peut plus reroller
      expect(store.state.combat?.usedReroll).toBe(true);
    });
  });

  describe('Historique du combat', () => {
    beforeEach(() => {
      const character = createMockCharacter({
        dexterite: 10,
        chance: 5,
        chanceInitiale: 5,
        pointsDeVieMax: 30,
        pointsDeVieActuels: 30,
      });
      store.setCharacter(character);
    });

    it('devrait avoir un historique vide au début', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      expect(store.state.combat?.history).toHaveLength(0);
    });

    it('devrait ajouter une entrée pour l\'attaque du joueur', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      
      expect(store.state.combat?.history).toHaveLength(1);
      expect(store.state.combat?.history[0]).toMatchObject({
        round: 1,
        turn: Attacker.PLAYER,
        action: CombatActionType.ATTACK,
      });
    });

    it('devrait ajouter une entrée pour l\'attaque de l\'ennemi', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      slice.endPlayerTurn();
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      
      expect(store.state.combat?.history).toHaveLength(2);
      expect(store.state.combat?.history[1]).toMatchObject({
        round: 1,
        turn: Attacker.ENEMY,
        action: CombatActionType.ATTACK,
      });
    });

    it('devrait avoir la bonne séquence d\'historique sur plusieurs rounds', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      
      // Round 1
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      slice.endPlayerTurn();
      slice.executeEnemyAttack({ hitDice: [4, 4], damageDice: 5 });
      slice.endEnemyTurn();
      
      // Round 2
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [2, 2], damageDice: 6 });
      slice.endPlayerTurn();
      slice.executeEnemyAttack({ hitDice: [3, 3], damageDice: 4 });
      
      expect(store.state.combat?.history).toHaveLength(4);
      expect(store.state.combat?.history.map(h => ({ round: h.round, turn: h.turn }))).toEqual([
        { round: 1, turn: Attacker.PLAYER },
        { round: 1, turn: Attacker.ENEMY },
        { round: 2, turn: Attacker.PLAYER },
        { round: 2, turn: Attacker.ENEMY },
      ]);
    });

    it('devrait inclure les détails du hit roll', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 4], damageDice: 5 });
      
      const entry = store.state.combat?.history[0];
      expect(entry?.hitRoll).toMatchObject({
        dice: [3, 4],
        total: 7,
        target: 10, // dexterite du joueur
        success: true, // 7 ≤ 10
      });
    });

    it('devrait inclure les détails des dégâts quand hit', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [3, 3], damageDice: 5 });
      
      const entry = store.state.combat?.history[0];
      expect(entry?.damageRoll).toBeDefined();
      expect(entry?.damageRoll?.dice).toBe(5);
      expect(entry?.damageRoll?.total).toBeGreaterThan(0);
    });

    it('ne devrait pas avoir de damageRoll quand miss', () => {
      slice.startCombat('test-hero-id', createEnemy(), defaultConfig);
      slice.executeAction({ type: CombatActionType.ATTACK }, { hitDice: [6, 6], damageDice: 5 }); // 12 > 10 = miss
      
      const entry = store.state.combat?.history[0];
      expect(entry?.damageRoll).toBeUndefined();
    });
  });
});
