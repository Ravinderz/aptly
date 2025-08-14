// Store creation utilities for Zustand stores
import { create } from 'zustand';
import { devtools, persist, PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createSafeStorage } from './storageManager';
import { PersistOptions as LocalPersistOptions } from '../types';

export interface CreateStoreOptions<T> {
  name: string;
  persist?: LocalPersistOptions<T>;
  enableDevtools?: boolean;
}


/**
 * Safe storage adapter for Zustand persistence
 */
const createZustandStorage = (storeName: string) => {
  const safeStorage = createSafeStorage(storeName);
  
  return {
    getItem: async (name: string) => {
      try {
        const value = await safeStorage.getItem(name);
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: any) => {
      try {
        await safeStorage.setItem(name, JSON.stringify(value));
      } catch {
        // Fail silently to prevent app crashes
      }
    },
    removeItem: async (name: string) => {
      try {
        await safeStorage.removeItem(name);
      } catch {
        // Fail silently to prevent app crashes
      }
    },
  };
};

/**
 * Creates a Zustand store with standardized middleware and robust error handling
 * Includes Immer for immutable updates, DevTools for debugging, and optional persistence
 */
export const createStore = <T>(
  config: (set: any, get: any) => T,
  options: CreateStoreOptions<T>
) => {
  const { name, persist: persistOptions, enableDevtools = true } = options;

  if (persistOptions) {
    // With persistence
    const persistConfig: PersistOptions<T, T> = {
      name: persistOptions.name,
      storage: createZustandStorage(persistOptions.name),
      partialize: persistOptions.partialize as any,
      version: persistOptions.version || 1,
      migrate: persistOptions.migrate as any,
      onRehydrateStorage: () => {
        console.log(`🔄 Starting rehydration for: ${persistOptions.name}`);
        return (state, error) => {
          if (error) {
            console.error(`❌ Error rehydrating ${persistOptions.name}:`, error);
          } else {
            console.log(`✅ Successfully rehydrated: ${persistOptions.name}`);
          }
        };
      },
      skipHydration: false,
    };

    if (enableDevtools && __DEV__) {
      return create<T>()(
        devtools(
          persist(immer(config), persistConfig),
          { name }
        )
      );
    } else {
      return create<T>()(
        persist(immer(config), persistConfig)
      );
    }
  } else {
    // Without persistence
    if (enableDevtools && __DEV__) {
      return create<T>()(
        devtools(immer(config), { name })
      );
    } else {
      return create<T>()(immer(config));
    }
  }
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