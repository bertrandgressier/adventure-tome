import type { Character, GameMode } from '@/src/domain/entities/Character';
import type { CharacterService } from '@/src/application/services/CharacterService';
import type { StatsData } from '@/src/domain/value-objects/Stats';
import type { CharacterListSlice } from './characterListSlice';

export interface CharacterMutationSlice {
  createCharacter: (data: {
    name: string;
    book: number;
    talent: string;
    secondTalent?: string;
    gameMode: GameMode;
    stats: StatsData;
  }) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
}

type StoreState = CharacterMutationSlice & CharacterListSlice;
type SetState = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;

export const createCharacterMutationSlice = (service: CharacterService) => {
  return (set: SetState): CharacterMutationSlice => ({
    createCharacter: async (data) => {
      set({ error: null }, false, 'character/createCharacter:start');
      try {
        const character = await service.createCharacter(data);
        set((state) => ({
          characters: { ...state.characters, [character.id]: character },
        }), false, 'character/createCharacter:success');
        return character;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur de création';
        set({ error: errorMessage }, false, 'character/createCharacter:error');
        throw error;
      }
    },

    deleteCharacter: async (id: string) => {
      set({ error: null }, false, 'character/deleteCharacter:start');
      try {
        await service.deleteCharacter(id);
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _deletedId, ...rest } = state.characters;
          return { characters: rest };
        }, false, 'character/deleteCharacter:success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur de suppression';
        set({ error: errorMessage }, false, 'character/deleteCharacter:error');
        throw error;
      }
    },
  });
};
