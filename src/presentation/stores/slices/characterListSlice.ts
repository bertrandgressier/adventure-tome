import { type StateCreator } from 'zustand';
import type { Character } from '@/src/domain/entities/Character';
import type { CharacterService } from '@/src/application/services/CharacterService';

export interface CharacterListSlice {
  characters: Record<string, Character>;
  isLoading: boolean;
  hasInitialLoad: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadOne: (id: string) => Promise<void>;
  refresh: (id: string) => Promise<void>;
  getCharacter: (id: string) => Character | null;
  getAllCharacters: () => Character[];
}

export const createCharacterListSlice = (service: CharacterService): StateCreator<
  CharacterListSlice,
  [['zustand/devtools', never]],
  [],
  CharacterListSlice
> => {
  return (set, get) => ({
    characters: {},
    isLoading: false,
    hasInitialLoad: false,
    error: null,

    loadAll: async () => {
      set({ isLoading: true, error: null }, false, 'character/loadAll:start');
      try {
        const characters = await service.getAllCharacters();
        const characterRecord = characters.reduce(
          (acc, char) => ({ ...acc, [char.id]: char }),
          {} as Record<string, Character>
        );
        set({ characters: characterRecord, isLoading: false, hasInitialLoad: true }, false, 'character/loadAll:success');
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erreur de chargement',
          isLoading: false,
        }, false, 'character/loadAll:error');
      }
    },

    loadOne: async (id: string) => {
      set({ isLoading: true, error: null }, false, 'character/loadOne:start');
      try {
        const character = await service.getCharacter(id);
        if (character) {
          set((state) => ({
            characters: { ...state.characters, [id]: character },
            isLoading: false,
            hasInitialLoad: true,
          }), false, 'character/loadOne:success');
        } else {
          set({ error: 'Personnage non trouvé', isLoading: false }, false, 'character/loadOne:notFound');
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erreur de chargement',
          isLoading: false,
        }, false, 'character/loadOne:error');
      }
    },

    refresh: async (id: string) => {
      await get().loadOne(id);
    },

    getCharacter: (id: string) => {
      return get().characters[id] || null;
    },

    getAllCharacters: () => {
      return Object.values(get().characters);
    },
  });
};
