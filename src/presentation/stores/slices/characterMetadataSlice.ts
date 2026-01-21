import type { CharacterService } from '@/src/application/services/CharacterService';
import type { CharacterListSlice } from './characterListSlice';
import { handleSliceError } from './sliceHelpers';

export type CharacterMetadataSlice = {
  updateName: (id: string, name: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  goToParagraph: (id: string, paragraph: number) => Promise<void>;
  updateBook: (id: string, book: number) => Promise<void>;
  updateDaysElapsed: (id: string, days: number) => Promise<void>;
  updateNextWakeUpParagraph: (id: string, paragraph: number | undefined) => Promise<void>;
  updateSecondTalent: (id: string, secondTalent: string | undefined) => Promise<void>;
};

type StoreState = CharacterMetadataSlice & CharacterListSlice;
type SetState = (partial: Partial<StoreState> | ((state: StoreState) => Partial<StoreState>)) => void;
type GetState = () => StoreState;

export const createCharacterMetadataSlice = (service: CharacterService) => {
  return (set: SetState, get: GetState): CharacterMetadataSlice => ({
    updateName: async (id: string, name: string) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateCharacterName(id, name);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/updateName');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    updateBook: async (id: string, book: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateBook(id, book);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/updateBook');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    updateNotes: async (id: string, notes: string) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateNotes(id, notes);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/updateNotes');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    goToParagraph: async (id: string, paragraph: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.goToParagraph(id, paragraph);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/goToParagraph');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    updateDaysElapsed: async (id: string, days: number) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateDaysElapsed(id, days);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/updateDaysElapsed');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    updateNextWakeUpParagraph: async (id: string, paragraph: number | undefined) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateNextWakeUpParagraph(id, paragraph);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/updateNextWakeUpParagraph');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },

    updateSecondTalent: async (id: string, secondTalent: string | undefined) => {
      const character = get().characters[id];
      if (!character) return;

      try {
        const updated = await service.updateSecondTalent(id, secondTalent);
        set((state) => ({
          characters: { ...state.characters, [id]: updated },
        }), false, 'metadata/updateSecondTalent');
      } catch (error) {
        handleSliceError(set, error);
        throw error;
      }
    },
  });
};
