import { type StateCreator } from 'zustand';
import type {
  CombatState,
  CombatAction,
  AvailableAction,
} from '@/src/domain/types/combat-state';
import type {
  EnemyConfig,
  CombatConfig,
  CombatWeapon,
  WeaponAbility,
} from '@/src/domain/types/combatants';
import type { CatalogItem, WeaponAbilityDefinition } from '@/src/domain/types/items';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import { PhaseManager } from '@/src/domain/services/combat/PhaseManager';
import type { DiceOverrides } from '@/src/domain/services/combat/DiceRoller';
import type { CharacterListSlice } from './characterListSlice';
import type { CharacterStatsSlice } from './characterStatsSlice';
import type { CharacterInventorySlice } from './characterInventorySlice';
import type { ItemsCatalogSlice } from './itemsCatalogSlice';
import { handleSliceError } from './sliceHelpers';

/**
 * Phase de tour du combat
 * Reflète la RÉALITÉ de ce qui se passe dans le combat
 * Pas de simulation - chaque phase correspond à un état réel
 */
export type CombatTurnPhase = 
  | 'PLAYER_TURN_START'    // Début du tour joueur - attend action
  | 'PLAYER_ATTACKING'     // Joueur a attaqué - résultat calculé, animation en cours
  | 'ENEMY_TURN_START'     // Début du tour ennemi - affiche "Tour de l'ennemi"
  | 'ENEMY_ATTACKING'      // Ennemi attaque - résultat calculé, animation en cours
  | 'COMBAT_ENDED';        // Combat terminé (victoire ou défaite)

/**
 * Combat Slice - Gère l'état du combat V3
 * 
 * Architecture simplifiée :
 * - turnPhase : Phase réelle du combat (pas de simulation)
 * - Les animations réagissent aux changements de phase
 * - L'orchestrateur fait avancer les phases après les animations
 */
export interface CombatSlice {
  /** État actuel du combat (null si pas de combat actif) */
  combat: CombatState | null;
  
  /** Actions disponibles pour le joueur dans l'état actuel */
  availableActions: AvailableAction[];
  
  /** Phase actuelle du tour (reflète la réalité du combat) */
  turnPhase: CombatTurnPhase;
  
  /** Timestamp de la dernière action (pour déclencher animations React) */
  lastActionTimestamp: number;
  
  /** Erreur éventuelle lors des opérations de combat */
  error: string | null;

  /**
   * Démarre un nouveau combat
   */
  startCombat: (
    characterId: string,
    enemy: EnemyConfig,
    config: CombatConfig
  ) => void;

  /**
   * Exécute une action de combat du joueur
   * Phase passe à PLAYER_ATTACKING
   */
  executeAction: (
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ) => void;

  /**
   * Termine le tour du joueur, passe au tour ennemi
   * Phase passe à ENEMY_TURN_START
   */
  endPlayerTurn: () => void;

  /**
   * Exécute l'attaque de l'ennemi
   * Phase passe à ENEMY_ATTACKING
   */
  executeEnemyAttack: (diceOverrides?: DiceOverrides) => void;

  /**
   * Termine le tour ennemi, retour au joueur
   * Phase passe à PLAYER_TURN_START
   */
  endEnemyTurn: () => void;

  /**
   * Termine le combat et persiste les changements au personnage
   */
  endCombat: () => Promise<void>;

  /**
   * Annule le combat sans persister les changements
   */
  cancelCombat: () => void;

  /** @internal Valeur privée pour tracker la chance initiale */
  privateInitialChance: number;
}

type StoreState = CombatSlice & CharacterListSlice & CharacterStatsSlice & CharacterInventorySlice & ItemsCatalogSlice;

/**
 * Vérifie si le joueur a des objets utilisables en combat
 */
function hasUsableItems(get: () => StoreState, characterId: string): boolean {
  const character = get().characters[characterId];
  if (!character) return false;
  
  const inventory = character.getInventory();
  const getItem = get().getItem;
  
  return inventory.items.some(itemRef => {
    if (!itemRef.possessed || itemRef.quantity <= 0) return false;
    
    const item = getItem(itemRef.itemId);
    if (!item) return false;
    
    // Objets consommables en combat : ceux qui ont un effet direct (heal ou damage)
    // Exclut les objets passifs (bague, etc.) qui n'ont qu'un "effect" descriptif
    return (item.type === 'active' || item.type === 'special') &&
      (item.healAmount !== undefined || item.damageToEnemy !== undefined);
  });
}

export const createCombatSlice = (): StateCreator<
  StoreState,
  [['zustand/devtools', never]],
  [],
  CombatSlice
> => {
  return (set, get) => ({
    combat: null,
    availableActions: [],
    turnPhase: 'PLAYER_TURN_START' as CombatTurnPhase,
    lastActionTimestamp: 0,
    privateInitialChance: 0,
    error: null,

    startCombat: (characterId, enemy, config) => {
      try {
        const character = get().characters[characterId];
        if (!character) {
          throw new Error(`Character ${characterId} not found`);
        }

        const stats = character.getStats();
        const inventory = character.getInventory();

        const weapon = extractWeapon(inventory.weapon, get().getItem);

        const playerConfig = {
          name: character.name,
          dexterite: stats.dexterite,
          endurance: stats.pointsDeVieActuels,
          enduranceMax: stats.pointsDeVieMax,
          chance: stats.chance,
          weapon,
        };

        const initialState = CombatEngine.createInitialState(
          characterId,
          playerConfig,
          enemy,
          config
        );

        // Fix: Utiliser spread pour créer un nouvel objet au lieu de muter
        const hasRerollItem = hasRerollRing(inventory.items);
        const stateWithReroll = {
          ...initialState,
          usedReroll: !hasRerollItem,
        };

        const hasItems = hasUsableItems(get, characterId);
        const availableActions = CombatEngine.getAvailableActions(stateWithReroll, hasItems);

        set({
          combat: stateWithReroll,
          turnPhase: 'PLAYER_TURN_START',
          lastActionTimestamp: Date.now(),
          availableActions,
          privateInitialChance: stats.chanceInitiale,
          error: null,
        }, false, 'combat/startCombat');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    executeAction: (action, diceOverrides) => {
      try {
        const { combat } = get();
        if (!combat) {
          throw new Error('No active combat');
        }

        // Résoudre l'action utilisateur
        const result = CombatEngine.resolve(combat, action, diceOverrides);
        
        const hasItems = hasUsableItems(get, combat.characterId);
        const availableActions = CombatEngine.getAvailableActions(result.state, hasItems);

        const updatedCombat = {
          ...result.state,
          events: [...result.state.events, ...result.events],
        };

        // Déterminer la nouvelle phase
        const isAttack = action.type === 'attack' || action.type === 'reroll';
        const isSkip = action.type === 'skip';
        const isEnded = updatedCombat.player.endurance <= 0 || updatedCombat.enemy.endurance <= 0;
        
        const turnPhase: CombatTurnPhase = isEnded 
          ? 'COMBAT_ENDED' 
          : isAttack 
            ? 'PLAYER_ATTACKING'
            : isSkip
              ? 'ENEMY_TURN_START' // SKIP passe directement au tour ennemi
              : 'PLAYER_TURN_START';

        set({
          combat: updatedCombat,
          turnPhase,
          lastActionTimestamp: Date.now(),
          availableActions,
          error: null,
        }, false, `combat/executeAction/${action.type}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
        set({ error: errorMessage }, false, 'combat/error');
        throw error;
      }
    },

    endPlayerTurn: () => {
      const { combat } = get();
      if (!combat) return;

      // Vérifier si le combat est terminé
      const isEnded = combat.player.endurance <= 0 || combat.enemy.endurance <= 0;
      
      if (isEnded) {
        set({
          turnPhase: 'COMBAT_ENDED',
          lastActionTimestamp: Date.now(),
          availableActions: [],
        }, false, 'combat/endPlayerTurn');
        return;
      }

      // Avancer vers le tour de l'ennemi dans le CombatState
      const nextTurnState = PhaseManager.skipToNextTurn(combat);
      const updatedCombat: CombatState = {
        ...combat,
        phase: nextTurnState.phase,
        currentTurn: nextTurnState.currentTurn,
        roundNumber: nextTurnState.roundNumber,
        // Réinitialiser lastRoll pour le nouveau tour
        // NE PAS réinitialiser usedReroll - le reroll est limité à une fois par COMBAT
        lastRoll: undefined,
      };
      
      // Tour ennemi = pas d'actions manuelles disponibles
      set({
        combat: updatedCombat,
        turnPhase: 'ENEMY_TURN_START',
        lastActionTimestamp: Date.now(),
        availableActions: [], // Aucune action pendant le tour ennemi
      }, false, 'combat/endPlayerTurn');
    },

    executeEnemyAttack: (diceOverrides) => {
      try {
        const { combat } = get();
        if (!combat) {
          throw new Error('No active combat');
        }

        // Résoudre l'attaque ennemi
        const attackAction: CombatAction = { type: 'attack' };
        const result = CombatEngine.resolve(combat, attackAction, diceOverrides);

        const updatedCombat = {
          ...result.state,
          events: [...result.state.events, ...result.events],
        };

        // TOUJOURS passer par ENEMY_ATTACKING pour que l'orchestrateur puisse jouer les animations
        // L'orchestrateur passera à COMBAT_ENDED après les animations via endEnemyTurn()
        set({
          combat: updatedCombat,
          turnPhase: 'ENEMY_ATTACKING',
          lastActionTimestamp: Date.now(),
          availableActions: [], // Pas d'actions pendant le tour ennemi
          error: null,
        }, false, 'combat/executeEnemyAttack');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur attaque ennemi';
        set({ error: errorMessage }, false, 'combat/error');
        throw error;
      }
    },

    endEnemyTurn: () => {
      const { combat } = get();
      if (!combat) return;

      // Vérifier si le combat est terminé
      const isEnded = combat.player.endurance <= 0 || combat.enemy.endurance <= 0;
      
      if (isEnded) {
        set({
          turnPhase: 'COMBAT_ENDED',
          lastActionTimestamp: Date.now(),
          availableActions: [],
        }, false, 'combat/endEnemyTurn');
        return;
      }

      // Avancer vers le tour du joueur dans le CombatState
      const nextTurnState = PhaseManager.skipToNextTurn(combat);
      const updatedCombat: CombatState = {
        ...combat,
        phase: nextTurnState.phase,
        currentTurn: nextTurnState.currentTurn,
        roundNumber: nextTurnState.roundNumber,
        // Réinitialiser lastRoll pour le nouveau tour
        // NE PAS réinitialiser usedReroll - le reroll est limité à une fois par COMBAT
        lastRoll: undefined,
      };
      
      // Recalculer les actions disponibles pour le nouveau tour
      const hasItems = hasUsableItems(get, combat.characterId);
      const availableActions = CombatEngine.getAvailableActions(updatedCombat, hasItems);
      
      set({
        combat: updatedCombat,
        turnPhase: 'PLAYER_TURN_START',
        lastActionTimestamp: Date.now(),
        availableActions,
      }, false, 'combat/endEnemyTurn');
    },

    endCombat: async () => {
      try {
        const { combat, privateInitialChance } = get();
        if (!combat) return;

        const damageTaken = combat.player.enduranceMax - combat.player.endurance;
        const chanceUsed = privateInitialChance - combat.player.chance;
        const characterId = combat.characterId;

        if (damageTaken > 0) {
          await get().applyDamage(characterId, damageTaken);
        }

        if (chanceUsed > 0) {
          await get().updateStats(characterId, {
            chance: combat.player.chance
          });
        }

        // Consommer les items utilisés pendant le combat
        // Trier par index décroissant pour éviter les décalages d'index
        const sortedUsedItems = [...combat.usedItems].sort((a, b) => b.itemIndex - a.itemIndex);
        for (const usedItem of sortedUsedItems) {
          await get().consumeItem(characterId, usedItem.itemIndex);
        }

        set({
          combat: null,
          turnPhase: 'PLAYER_TURN_START',
          lastActionTimestamp: 0,
          availableActions: [],
          privateInitialChance: 0,
          error: null,
        }, false, 'combat/endCombat');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    cancelCombat: () => {
      set({
        combat: null,
        turnPhase: 'PLAYER_TURN_START',
        lastActionTimestamp: 0,
        availableActions: [],
        privateInitialChance: 0,
        error: null,
      }, false, 'combat/cancelCombat');
    },
  });
};

/**
 * Extrait la configuration de l'arme à partir de l'inventaire du personnage
 * Recherche les abilities dans le catalog via itemId (source de vérité)
 * @param weapon Arme du personnage (ou undefined si combat à mains nues)
 * @param getItem Fonction pour récupérer un item du catalog
 * @returns Configuration de l'arme pour le combat
 */
function extractWeapon(
  weapon: { itemId?: string; name: string; attackPoints: number } | undefined,
  getItem: (itemId: string) => CatalogItem | undefined
): CombatWeapon {
  if (!weapon) {
    return {
      id: 'default-fist',
      name: 'Poings',
      bonus: 0
    };
  }

  // Chercher l'arme dans le catalog par itemId (priorité) ou par nom (fallback)
  const catalogWeapon = weapon.itemId
    ? getItem(weapon.itemId)
    : findWeaponInCatalogByName(weapon.name, getItem);

  const baseWeapon: CombatWeapon = {
    id: catalogWeapon?.id ?? weapon.itemId ?? `weapon-${weapon.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: weapon.name,
    bonus: weapon.attackPoints
  };

  // Ajouter la première ability si l'arme est légendaire
  if (catalogWeapon?.abilities && catalogWeapon.abilities.length > 0) {
    baseWeapon.ability = mapAbilityDefinitionToWeaponAbility(catalogWeapon.abilities[0]);
  }

  return baseWeapon;
}

/**
 * Recherche une arme dans le catalog par son nom (fallback pour données legacy)
 * Compare les noms en ignorant la casse et les accents
 */
function findWeaponInCatalogByName(
  weaponName: string,
  getItem: (itemId: string) => CatalogItem | undefined
): CatalogItem | undefined {
  // Liste des IDs d'armes légendaires connues (Tome 3)
  const legendaryWeaponIds = [
    'tome3-lame-aube-eternelle',
    'tome3-marteau-terre',
    'tome3-arc-vents',
    'tome3-dague-ombres',
    'tome3-baton-sage'
  ];

  const normalizedName = normalizeString(weaponName);

  for (const id of legendaryWeaponIds) {
    const item = getItem(id);
    if (item && normalizeString(item.name) === normalizedName) {
      return item;
    }
  }

  return undefined;
}

/**
 * Normalise une string pour comparaison (minuscules, sans accents)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Convertit une WeaponAbilityDefinition du catalog en WeaponAbility pour le combat
 */
function mapAbilityDefinitionToWeaponAbility(def: WeaponAbilityDefinition): WeaponAbility {
  return {
    id: def.id,
    name: def.name,
    trigger: def.trigger,
    effect: def.effect,
    usesPerCombat: def.usesPerCombat,
    costChance: def.costChance
  };
}

/**
 * Vérifie si le personnage possède un anneau de deuxième chance
 * @param items Items de l'inventaire du personnage
 * @returns true si le personnage possède un anneau de reroll
 */
function hasRerollRing(items: readonly import('@/src/domain/types/items').InventoryItemRef[]): boolean {
  return items.some(itemRef =>
    itemRef.possessed &&
    (itemRef.itemId === 'tome1-bague-deuxieme-chance' ||
     itemRef.itemId === 'tome2-bague-deuxieme-chance' ||
     itemRef.itemId === 'tome3-bague-deuxieme-chance')
  );
}
