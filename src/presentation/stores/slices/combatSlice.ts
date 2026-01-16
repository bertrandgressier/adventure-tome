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

export interface CombatSlice {
  combat: CombatState | null;
  availableActions: AvailableAction[];
  isAnimating: boolean;

  startCombat: (
    characterId: string,
    enemies: EnemyConfig[],
    config: CombatConfig
  ) => void;

  executeAction: (
    action: CombatAction,
    diceOverrides?: DiceOverrides
  ) => void;

  endCombat: () => Promise<void>;

  cancelCombat: () => void;

  setAnimating: (animating: boolean) => void;

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

    startCombat: (characterId, enemies, config) => {
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

      const hasRerollItem = hasRerollRing(inventory.items);
      if (!hasRerollItem) {
        initialState.usedReroll = true;
      }

      const availableActions = CombatEngine.getAvailableActions(initialState);

      set({
        combat: initialState,
        availableActions,
        isAnimating: false,
        privateInitialChance: stats.chanceInitiale
      });
    },

    executeAction: (action, diceOverrides) => {
      const { combat } = get();
      if (!combat) {
        throw new Error('No active combat');
      }

      const result = CombatEngine.resolve(combat, action, diceOverrides);

      const availableActions = CombatEngine.getAvailableActions(result.state);

      set({
        combat: result.state,
        availableActions
      });
    },

    endCombat: async () => {
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
        privateInitialChance: 0
      });
    },

    cancelCombat: () => {
      set({
        combat: null,
        availableActions: [],
        isAnimating: false,
        privateInitialChance: 0
      });
    },

    setAnimating: (animating) => {
      set({ isAnimating: animating });
    }
  });
};

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

function hasRerollRing(items: readonly import('@/src/domain/types/items').InventoryItemRef[]): boolean {
  return items.some(itemRef =>
    itemRef.possessed &&
    (itemRef.itemId === 'tome1-bague-deuxieme-chance' ||
     itemRef.itemId === 'tome2-bague-deuxieme-chance' ||
     itemRef.itemId === 'tome3-bague-deuxieme-chance')
  );
}
