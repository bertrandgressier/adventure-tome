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
import { CombatAutoPlayService } from '@/src/domain/services/combat/CombatAutoPlayService';
import type { DiceOverrides } from '@/src/domain/services/combat/DiceRoller';
import type { CharacterListSlice } from './characterListSlice';
import type { CharacterStatsSlice } from './characterStatsSlice';
import type { CharacterInventorySlice } from './characterInventorySlice';
import type { ItemsCatalogSlice } from './itemsCatalogSlice';
import { handleSliceError } from './sliceHelpers';

/**
 * Combat Slice - Gère l'état du combat V3
 * 
 * Centralise l'état du combat et délègue la logique métier au CombatEngine.
 * Suit le pattern des autres slices avec gestion d'erreur cohérente.
 */
export interface CombatSlice {
  /** État actuel du combat (null si pas de combat actif) */
  combat: CombatState | null;
  
  /** Actions disponibles pour le joueur dans l'état actuel */
  availableActions: AvailableAction[];
  
  /** Erreur éventuelle lors des opérations de combat */
  error: string | null;

  /**
   * Démarre un nouveau combat
   * @param characterId ID du personnage
   * @param enemy Configuration de l'ennemi
   * @param config Configuration du combat
   * @throws Error si le personnage n'est pas trouvé
   */
  startCombat: (
    characterId: string,
    enemy: EnemyConfig,
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

  /** @internal Valeur privée pour tracker la chance initiale */
  privateInitialChance: number;
}

type StoreState = CombatSlice & CharacterListSlice & CharacterStatsSlice & CharacterInventorySlice & ItemsCatalogSlice;

export const createCombatSlice = (): StateCreator<
  StoreState,
  [['zustand/devtools', never]],
  [],
  CombatSlice
> => {
  return (set, get) => ({
    combat: null,
    availableActions: [],
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

        const availableActions = CombatEngine.getAvailableActions(stateWithReroll);

        set({
          combat: stateWithReroll,
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

        // 1. Résoudre l'action utilisateur
        const result = CombatEngine.resolve(combat, action, diceOverrides);
        
        // 2. Auto-skip + auto-play ennemi immédiatement
        const finalState = CombatAutoPlayService.resolveAutoActions(result.state);
        
        const availableActions = CombatEngine.getAvailableActions(finalState);

        // Update state avec le résultat final (toutes les actions auto sont déjà résolues)
        const updatedCombat = {
          ...finalState,
          events: [...finalState.events, ...result.events],
        };

        set({
          combat: updatedCombat,
          availableActions,
          error: null,
        }, false, `combat/executeAction/${action.type}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
        set({ error: errorMessage }, false, 'combat/error');
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

        // Consommer les items utilisés pendant le combat
        // Trier par index décroissant pour éviter les décalages d'index
        const sortedUsedItems = [...combat.usedItems].sort((a, b) => b.itemIndex - a.itemIndex);
        for (const usedItem of sortedUsedItems) {
          await get().consumeItem(characterId, usedItem.itemIndex);
        }

        set({
          combat: null,
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
