import { createStore } from 'zustand/vanilla';
import type { CharacterStore } from '@/src/presentation/stores/characterStore';
import type { CombatState } from '@/src/domain/types/combat-v2';

/**
 * Crée un store mocké avec un état initial personnalisé
 * Utilisé dans les stories pour tester différents états
 */
export function createMockStore(
  initialState?: Partial<CharacterStore>
): ReturnType<typeof createStore<CharacterStore>> {
  const defaultState: CharacterStore = {
    characters: {},
    isLoading: false,
    error: null,
    combat: null,
    availableActions: [],
    isAnimating: false,
    customItems: {},
    catalogItems: {},

    // Méthodes vides par défaut (peuvent être overridées)
    loadAll: async () => {},
    getCharacter: () => undefined,
    create: async () => ({ id: '', name: '', book: 'L1' } as const),
    delete: async () => {},
    updateStats: async () => {},
    applyDamage: async () => {},
    heal: async () => {},
    updateInventory: async () => {},
    equipWeapon: async () => {},
    unequipWeapon: async () => {},
    addItem: async () => {},
    removeItem: async () => {},
    updateName: async () => {},
    updateNotes: async () => {},
    updateProgress: async () => {},
    startCombat: () => {},
    performAction: () => {},
    endCombat: () => {},
    setAnimating: () => {},
    addCustomItem: () => {},
    removeCustomItem: () => {},
    updateCustomItem: () => {},
    loadCatalog: async () => {},
  };

  return createStore<CharacterStore>()(() => ({
    ...defaultState,
    ...initialState,
  }));
}

/**
 * Crée un état de combat mocké pour les stories
 */
export function createMockCombatState(
  overrides?: Partial<CombatState>
): CombatState {
  return {
    characterId: 'test-character',
    phase: 'idle',
    round: 1,
    player: {
      name: 'Héros',
      currentEndurance: 20,
      maxEndurance: 20,
      habilete: 12,
      weaponBonus: 0,
      weapon: null,
    },
    enemies: [
      {
        id: 'enemy-1',
        name: 'Gobelin',
        currentEndurance: 6,
        maxEndurance: 6,
        habilete: 5,
      },
    ],
    config: {
      allowFlee: true,
      allowItems: true,
      deathOnDefeat: false,
    },
    history: [],
    ...overrides,
  };
}
