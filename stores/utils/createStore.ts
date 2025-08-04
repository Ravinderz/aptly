// Store creation utilities for Zustand stores
import { create } from 'zustand';
import { devtools, persist, PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { PersistOptions as LocalPersistOptions } from '../types';

export interface CreateStoreOptions<T> {
  name: string;
  persist?: LocalPersistOptions<T>;
  enableDevtools?: boolean;
}

/**
 * Creates a Zustand store with standardized middleware
 * Includes Immer for immutable updates, DevTools for debugging, and optional persistence
 */
export const createStore = <T>(
  config: (set: any, get: any) => T,
  options: CreateStoreOptions<T>
) => {
  const { name, persist: persistOptions, enableDevtools = true } = options;

  let store = create<T>()(
    immer(config)
  );

  // Add persistence if specified
  if (persistOptions) {
    const persistConfig: PersistOptions<T> = {
      name: persistOptions.name,
      partialize: persistOptions.partialize,
      version: persistOptions.version || 1,
      migrate: persistOptions.migrate,
    };

    store = create<T>()(
      persist(
        immer(config),
        persistConfig
      )
    );
  }

  // Add devtools if enabled
  if (enableDevtools && typeof window !== 'undefined') {
    const finalConfig = persistOptions 
      ? persist(immer(config), persistOptions as any)
      : immer(config);

    store = create<T>()(
      devtools(
        finalConfig,
        { name }
      )
    );
  }

  return store;
};

/**
 * Creates a store slice for composition
 */
export const createSlice = <T>(
  initialState: T,
  actions: Record<string, (set: any, get: any, ...args: any[]) => void | Promise<void>>
) => {
  return (set: any, get: any) => ({
    ...initialState,
    ...Object.entries(actions).reduce((acc, [key, action]) => {
      acc[key] = (...args: any[]) => action(set, get, ...args);
      return acc;
    }, {} as any),
  });
};