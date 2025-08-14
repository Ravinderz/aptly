// Base store interfaces and types for Zustand stores

export interface BaseStore {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface StoreSlice<T> {
  state: T;
  actions: Record<string, (...args: any[]) => void | Promise<void>>;
}

// Store persistence options
export interface PersistOptions<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => T;
}

// Common action types
export interface AsyncAction<T = void> {
  (payload?: T): Promise<void>;
}

export interface SyncAction<T = void> {
  (payload: T): void;
}

// Import the actual FeatureFlags type from the separate types file
export type { FeatureFlags, FeatureGroup } from '../types/featureFlags';

// Migration feature flag keys - these will be added to the existing FeatureFlags
export const MIGRATION_FEATURE_FLAGS = {
  USE_AUTH_STORE: 'USE_AUTH_STORE',
  USE_SOCIETY_STORE: 'USE_SOCIETY_STORE', 
  USE_ADMIN_STORE: 'USE_ADMIN_STORE',
  USE_THEME_STORE: 'USE_THEME_STORE',
  USE_NOTIFICATION_STORE: 'USE_NOTIFICATION_STORE',
  USE_FEATURE_FLAG_STORE: 'USE_FEATURE_FLAG_STORE',
} as const;

// Migration rollout percentages for gradual deployment
export const ROLLOUT_PERCENTAGES = {
  WEEK_1: 10,  // 10% of users
  WEEK_2: 25,  // 25% of users  
  WEEK_3: 50,  // 50% of users
  WEEK_4: 100, // All users
} as const;