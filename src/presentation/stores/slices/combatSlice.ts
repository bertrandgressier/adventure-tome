import type {
  CombatState,
  CombatAction,
  AvailableAction,
  EnemyConfig,
  CombatConfig,
} from '@/src/domain/types/combat-v2';
import { CombatEngine } from '@/src/domain/services/combat/CombatEngine';
import type { DiceOverrides } from '@/src/domain/services/combat/DiceRoller';
import type { CharacterListSlice } from './characterListSlice';
import type { CharacterStatsSlice } from './characterStatsSlice';
import type { CharacterInventorySlice } from './characterInventorySlice';
import type { ItemsCatalogSlice } from './itemsCatalogSlice';
import { handleSliceError } from './sliceHelpers';

/**
 * Combat Slice - Gère l'état du combat V2
 * 
 * Centralise l'état du combat et délègue la logique métier au CombatEngine.
 * Suit le pattern des autres slices avec gestion d'erreur cohérente.
 */
export interface CombatSlice {
  /** État actuel du combat (null si pas de combat actif) */
  combat: CombatState | null;
  
  /** Actions disponibles pour le joueur dans l'état actuel */
  availableActions: AvailableAction[];
  
  /** Indique si une animation est en cours */
  isAnimating: boolean;
  
  /** Erreur éventuelle lors des opérations de combat */
  error: string | null;

  /**
   * Démarre un nouveau combat
   * @param characterId ID du personnage
   * @param enemies Configuration des ennemis
   * @param config Configuration du combat
   * @throws Error si le personnage n'est pas trouvé
   */
  startCombat: (
    characterId: string,
    enemies: EnemyConfig[],
    config: CombatConfig
  ) => void;

  /**
   * Exécute une action de combat
   * @param action Action à exécuter
   * @param diceOverrides Overrides pour les dés (tests)
   * @throws Error si pas de combat actif
   */
  executeAction: (
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ) => void;

  /**
   * Termine le combat et persiste les changements au personnage
   * (dégâts, chance utilisée, items consommés)
   */
  endCombat: () => Promise<void>;

  /**
   * Annule le combat sans persister les changements
   */
  cancelCombat: () => void;

  /**
   * Contrôle l'état d'animation pour l'UI
   */
  setAnimating: (animating: boolean) => void;

  /** @internal Valeur privée pour tracker la chance initiale */
  privateInitialChance: number;
}

type StoreState = CombatSlice & CharacterListSlice & CharacterStatsSlice & CharacterInventorySlice & ItemsCatalogSlice;
type SetState = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;
type GetState = () => StoreState;

export const createCombatSlice = () => {
  return (set: SetState, get: GetState): CombatSlice => ({
    combat: null,
    availableActions: [],
    isAnimating: false,
    privateInitialChance: 0,
    error: null,

    startCombat: (characterId, enemies, config) => {
      try {
        const character = get().characters[characterId];
        if (!character) {
          throw new Error(`Character ${characterId} not found`);
        }

        const stats = character.getStats();
        const inventory = character.getInventory();

        const weapon = extractWeapon(inventory.weapon);

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
          enemies,
          config
        );

        // Fix: Utiliser spread pour créer un nouvel objet au lieu de muter
        const hasRerollItem = hasRerollRing(inventory.items);
        const stateWithReroll = {
          ...initialState,
          usedReroll: !hasRerollItem,
        };

        const availableActions = CombatEngine.getAvailableActions(stateWithReroll);

        set({
          combat: stateWithReroll,
          availableActions,
          isAnimating: false,
          privateInitialChance: stats.chanceInitiale,
          error: null,
        });
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

        const result = CombatEngine.resolve(combat, action, diceOverrides);

        const availableActions = CombatEngine.getAvailableActions(result.state);

        set({
          combat: result.state,
          availableActions,
          error: null,
        });
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
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

        set({
          combat: null,
          availableActions: [],
          isAnimating: false,
          privateInitialChance: 0,
          error: null,
        });
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    cancelCombat: () => {
      set({
        combat: null,
        availableActions: [],
        isAnimating: false,
        privateInitialChance: 0,
        error: null,
      });
    },

    setAnimating: (animating) => {
      set({ isAnimating: animating });
    }
  });
};

/**
 * Extrait la configuration de l'arme à partir de l'inventaire du personnage
 * @param weapon Arme du personnage (ou undefined si combat à mains nues)
 * @returns Configuration de l'arme pour le combat
 */
function extractWeapon(
  weapon: { name: string; attackPoints: number } | undefined
): import('@/src/domain/types/combatants').CombatWeapon {
  if (!weapon) {
    return {
      id: 'default-fist',
      name: 'Poings',
      bonus: 0
    };
  }

  return {
    id: `weapon-${weapon.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: weapon.name,
    bonus: weapon.attackPoints
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
