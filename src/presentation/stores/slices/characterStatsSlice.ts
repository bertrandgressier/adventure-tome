import { type StateCreator } from 'zustand';
import type { CharacterService } from '@/src/application/services/CharacterService';
import type { StatsData } from '@/src/domain/value-objects/Stats';
import type { CharacterListSlice } from './characterListSlice';
import { handleSliceError } from './sliceHelpers';

export interface CharacterStatsSlice {
  updateStats: (id: string, stats: Partial<StatsData>) => Promise<void>;
  applyDamage: (id: string, amount: number) => Promise<void>;
  heal: (id: string, amount: number) => Promise<void>;
}

type StoreState = CharacterStatsSlice & CharacterListSlice;

export const createCharacterStatsSlice = (service: CharacterService): StateCreator<
  StoreState,
  [['zustand/devtools', never]],
  [],
  CharacterStatsSlice
> => {
  return (set, get) => ({
    updateStats: async (id: string, stats: Partial<StatsData>) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateCharacterStats(id, stats);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'character/updateStats');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    applyDamage: async (id: string, amount: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.applyDamage(id, amount);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'character/applyDamage');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    heal: async (id: string, amount: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.healCharacter(id, amount);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'character/heal');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },
  });
};
