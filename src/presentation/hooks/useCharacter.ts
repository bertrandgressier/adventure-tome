import { useEffect } from 'react';
import { useCharacterStore } from '@/src/presentation/providers/character-store-provider';
import type { Character } from '@/src/domain/entities/Character';
import type { StatsData } from '@/src/domain/value-objects/Stats';
import type { Weapon } from '@/src/domain/value-objects/Inventory';

interface UseCharacterResult {
  character: Character | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateName: (name: string) => Promise<void>;
  updateBook: (book: number) => Promise<void>;
  updateStats: (stats: Partial<StatsData>) => Promise<void>;
  applyDamage: (amount: number) => Promise<void>;
  heal: (amount: number) => Promise<void>;
  equipWeapon: (weapon: Weapon | null) => Promise<void>;
  addItem: (item: string) => Promise<void>;
  removeItem: (itemIndex: number) => Promise<void>;
  addBoulons: (amount: number) => Promise<void>;
  removeBoulons: (amount: number) => Promise<void>;
  setBoulons: (newValue: number) => Promise<void>;
  goToParagraph: (paragraph: number) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
  updateDaysElapsed: (days: number) => Promise<void>;
  updateNextWakeUpParagraph: (paragraph: number | undefined) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook React pour gérer un personnage via Zustand store.
 * 
 * Utilise le cache centralisé, pas de rechargement depuis IndexedDB.
 * Toutes les mutations sont automatiquement persistées.
 * 
 * @param characterId - ID du personnage
 * @returns État et actions pour le personnage
 */
export function useCharacter(characterId: string | null): UseCharacterResult {
  // Récupérer toutes les données et actions depuis le store
  const character = useCharacterStore((state) => characterId ? state.getCharacter(characterId) : null);
  const isLoading = useCharacterStore((state) => state.isLoading);
  const error = useCharacterStore((state) => state.error);
  const storeUpdateName = useCharacterStore((state) => state.updateName);
  const storeUpdateBook = useCharacterStore((state) => state.updateBook);
  const storeUpdateStats = useCharacterStore((state) => state.updateStats);
  const storeApplyDamage = useCharacterStore((state) => state.applyDamage);
  const storeHeal = useCharacterStore((state) => state.heal);
  const storeEquipWeapon = useCharacterStore((state) => state.equipWeapon);
  const storeAddItem = useCharacterStore((state) => state.addItem);
  const storeRemoveItem = useCharacterStore((state) => state.removeItem);
  const storeAddBoulons = useCharacterStore((state) => state.addBoulons);
  const storeRemoveBoulons = useCharacterStore((state) => state.removeBoulons);
  const storeSetBoulons = useCharacterStore((state) => state.setBoulons);
  const storeGoToParagraph = useCharacterStore((state) => state.goToParagraph);
  const storeUpdateNotes = useCharacterStore((state) => state.updateNotes);
  const storeUpdateDaysElapsed = useCharacterStore((state) => state.updateDaysElapsed);
  const storeUpdateNextWakeUpParagraph = useCharacterStore((state) => state.updateNextWakeUpParagraph);
  const storeLoadOne = useCharacterStore((state) => state.loadOne);

  // Charger le personnage si pas dans le cache
  useEffect(() => {
    if (characterId && !character && !isLoading) {
      storeLoadOne(characterId);
    }
  }, [characterId, character, isLoading, storeLoadOne]);

  // Wrappers des actions avec l'ID
  return {
    character,
    isLoading,
    error,

    updateName: async (name: string) => {
      if (!characterId) return;
      await storeUpdateName(characterId, name);
    },

    updateBook: async (book: number) => {
      if (!characterId) return;
      await storeUpdateBook(characterId, book);
    },

    updateStats: async (stats: Partial<StatsData>) => {
      if (!characterId) return;
      await storeUpdateStats(characterId, stats);
    },

    applyDamage: async (amount: number) => {
      if (!characterId) return;
      await storeApplyDamage(characterId, amount);
    },

    heal: async (amount: number) => {
      if (!characterId) return;
      await storeHeal(characterId, amount);
    },

    equipWeapon: async (weapon: Weapon | null) => {
      if (!characterId) return;
      await storeEquipWeapon(characterId, weapon);
    },

    addItem: async (item: string) => {
      if (!characterId) return;
      await storeAddItem(characterId, { name: item, possessed: true });
    },

    removeItem: async (itemIndex: number) => {
      if (!characterId) return;
      await storeRemoveItem(characterId, itemIndex);
    },

    addBoulons: async (amount: number) => {
      if (!characterId) return;
      await storeAddBoulons(characterId, amount);
    },

    removeBoulons: async (amount: number) => {
      if (!characterId) return;
      await storeRemoveBoulons(characterId, amount);
    },

    setBoulons: async (newValue: number) => {
      if (!characterId) return;
      await storeSetBoulons(characterId, newValue);
    },

    goToParagraph: async (paragraph: number) => {
      if (!characterId) return;
      await storeGoToParagraph(characterId, paragraph);
    },

    updateNotes: async (notes: string) => {
      if (!characterId) return;
      await storeUpdateNotes(characterId, notes);
    },

    updateDaysElapsed: async (days: number) => {
      if (!characterId) return;
      await storeUpdateDaysElapsed(characterId, days);
    },

    updateNextWakeUpParagraph: async (paragraph: number | undefined) => {
      if (!characterId) return;
      await storeUpdateNextWakeUpParagraph(characterId, paragraph);
    },

    refresh: async () => {
      if (!characterId) return;
      await storeLoadOne(characterId);
    },
  };
}
