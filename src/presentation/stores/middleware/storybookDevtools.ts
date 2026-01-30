/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * Middleware Zustand pour logger les changements d'état dans Storybook
 * Permet de visualiser les actions et mutations du store dans la console
 */
export const storybookDevtools =
  <T>() =>
  <
    Mps extends [StoreMutatorIdentifier, unknown][] = [],
    Mcs extends [StoreMutatorIdentifier, unknown][] = []
  >(
    config: StateCreator<T, Mps, Mcs>
  ): StateCreator<T, Mps, Mcs> =>
  (set, get, api) =>
    config(
      ((args: any) => {
        // Log avant mutation
        const prevState = get();
        console.log('[Zustand] Previous state:', prevState);

        // Applique la mutation
        set(args);

        // Log après mutation
        const nextState = get();
        console.log('[Zustand] Next state:', nextState);

        // Log du diff (simple comparaison)
        if (typeof args === 'function') {
          console.log('[Zustand] Action: function');
        } else {
          console.log('[Zustand] Partial update:', args);
        }
      }) as any,
      get,
      api
    );
