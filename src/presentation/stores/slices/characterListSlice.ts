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

type SetState = (partial: Partial<CharacterListSlice> | ((state: CharacterListSlice) => Partial<CharacterListSlice>)) => void;
type GetState = () => CharacterListSlice;

export const createCharacterListSlice = (service: CharacterService) => {
  return (set: SetState, get: GetState): CharacterListSlice => ({
    characters: {},
    isLoading: false,
    hasInitialLoad: false,
    error: null,

    loadAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const characters = await service.getAllCharacters();
        const characterRecord = characters.reduce(
          (acc, char) => ({ ...acc, [char.id]: char }),
          {} as Record<string, Character>
        );
        set({ characters: characterRecord, isLoading: false, hasInitialLoad: true });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erreur de chargement',
          isLoading: false,
        });
      }
    },

    loadOne: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const character = await service.getCharacter(id);
        if (character) {
          set((state) => ({
            characters: { ...state.characters, [id]: character },
            isLoading: false,
            hasInitialLoad: true,
          }));
        } else {
          set({ error: 'Personnage non trouvé', isLoading: false });
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Erreur de chargement',
          isLoading: false,
        });
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
