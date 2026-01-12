'use client';

import { type ReactNode, createContext, useContext, useEffect, useMemo } from 'react';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import {
  type CharacterStore,
  createCharacterStore,
} from '@/src/presentation/stores/characterStore';

export type CharacterStoreApi = ReturnType<typeof createCharacterStore>;

export const CharacterStoreContext = createContext<CharacterStoreApi | undefined>(
  undefined
);

export interface CharacterStoreProviderProps {
  children: ReactNode;
}

export const CharacterStoreProvider = ({ children }: CharacterStoreProviderProps) => {
  const store = useMemo(() => createCharacterStore(), []);

  useEffect(() => {
    store.getState().loadAll();
  }, [store]);

  return (
    <CharacterStoreContext.Provider value={store}>
      {children}
    </CharacterStoreContext.Provider>
  );
};

export function useCharacterStore<T>(
  selector: (store: CharacterStore) => T
): T {
  const store = useContext(CharacterStoreContext);

  if (!store) {
    throw new Error('useCharacterStore must be used within CharacterStoreProvider');
  }

  return useStoreWithEqualityFn(store, selector, shallow);
}
