import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { storybookDevtools } from './storybookDevtools';

describe('storybookDevtools middleware', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log state changes', () => {
    interface TestState {
      count: number;
      increment: () => void;
    }

    const store = createStore<TestState>()(
      storybookDevtools()((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }))
    );

    // Clear initial logs
    consoleLogSpy.mockClear();

    // Trigger state change
    store.getState().increment();

    // Should log previous state, next state, and action
    expect(consoleLogSpy).toHaveBeenCalledWith('[Zustand] Previous state:', expect.objectContaining({ count: 0 }));
    expect(consoleLogSpy).toHaveBeenCalledWith('[Zustand] Next state:', expect.objectContaining({ count: 1 }));
    expect(consoleLogSpy).toHaveBeenCalledWith('[Zustand] Action: function');
  });

  it('should log partial updates', () => {
    interface TestState {
      count: number;
      name: string;
      update: (name: string) => void;
    }

    const store = createStore<TestState>()(
      storybookDevtools()((set) => ({
        count: 0,
        name: 'initial',
        update: (name: string) => set({ name }),
      }))
    );

    consoleLogSpy.mockClear();

    store.getState().update('updated');

    expect(consoleLogSpy).toHaveBeenCalledWith('[Zustand] Partial update:', { name: 'updated' });
  });

  it('should not interfere with normal state operations', () => {
    interface TestState {
      count: number;
      increment: () => void;
    }

    const store = createStore<TestState>()(
      storybookDevtools()((set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }))
    );

    expect(store.getState().count).toBe(0);
    store.getState().increment();
    expect(store.getState().count).toBe(1);
    store.getState().increment();
    expect(store.getState().count).toBe(2);
  });
});
