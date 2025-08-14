// FeatureFlagStore - Zustand implementation for feature flag management
import { FeatureFlags, FeatureGroup, DEFAULT_FEATURE_FLAGS } from '../../types/featureFlags';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from '../types';

// State interface matching the existing FeatureFlagContext
interface FeatureFlagState extends BaseStore {
  flags: FeatureFlags;
  isLoading: boolean;
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  societyId?: string;
}

// Actions interface matching the existing FeatureFlagContext
interface FeatureFlagActions {
  // Flag management
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  enableFeature: (feature: keyof FeatureFlags) => Promise<void>;
  disableFeature: (feature: keyof FeatureFlags) => Promise<void>;
  updateFlags: (newFlags: Partial<FeatureFlags>) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Group operations
  getFeatureGroup: (group: FeatureGroup) => Partial<FeatureFlags>;
  enableFeatureGroup: (group: FeatureGroup) => Promise<void>;
  disableFeatureGroup: (group: FeatureGroup) => Promise<void>;

  // Remote configuration
  loadRemoteFlags: () => Promise<void>;
  refreshFlags: () => Promise<void>;

  // Environment and context
  setEnvironment: (
    environment: 'development' | 'staging' | 'production',
  ) => void;
  setUserContext: (userId?: string, societyId?: string) => void;

  // Migration utilities
  enableMigrationFlags: (flags: string[]) => Promise<void>;
  disableMigrationFlags: (flags: string[]) => Promise<void>;
  getMigrationStatus: () => Record<string, boolean>;
}

type FeatureFlagStore = FeatureFlagState & FeatureFlagActions;


// Feature groups mapping
const FEATURE_GROUPS: Record<FeatureGroup, (keyof FeatureFlags)[]> = {
  analytics: [
    'analytics_dashboard',
    'advanced_analytics',
    'usage_metrics',
    'performance_monitoring',
  ],
  governance: [
    'governance_center',
    'voting_system',
    'emergency_management',
    'policy_management',
  ],
  community: [
    'community_posts',
    'community_mentions',
    'community_reactions',
    'community_polls',
  ],
  billing: [
    'online_payments',
    'auto_pay',
    'payment_analytics',
    'bill_reminders',
    'multi_payment_gateways',
  ],
  maintenance: [
    'maintenance_tracking',
    'vendor_management',
    'service_requests',
    'common_area_booking',
  ],
  visitor: [
    'visitor_pre_approval',
    'visitor_qr_codes',
    'visitor_notifications',
    'visitor_analytics',
  ],
  admin: [
    'admin_dashboard',
    'multi_society_management',
    'role_based_access',
    'audit_logging',
  ],
  notifications: [
    'push_notifications',
    'email_notifications',
    'sms_notifications',
    'in_app_notifications',
  ],
  advanced: ['biometric_auth', 'offline_mode', 'data_sync', 'backup_restore'],
  experimental: [
    'ai_suggestions',
    'predictive_analytics',
    'smart_reminders',
    'voice_commands',
  ],
  regional: [
    'gst_compliance',
    'indian_payment_methods',
    'local_language_support',
    'regional_holidays',
  ],
  migration: [
    'USE_AUTH_STORE',
    'USE_SOCIETY_STORE',
    'USE_ADMIN_STORE',
    'USE_THEME_STORE',
    'USE_NOTIFICATION_STORE',
    'USE_FEATURE_FLAG_STORE',
  ],
};

// Environment-specific overrides
const ENVIRONMENT_OVERRIDES = {
  development: {
    advanced_analytics: true,
    performance_monitoring: true,
    experimental_features: true,
  },
  staging: {
    emergency_management: true,
    policy_management: true,
    multi_payment_gateways: true,
  },
  production: {
    // Production uses default values
  },
};

// Initial state
const initialState: FeatureFlagState = {
  flags: DEFAULT_FEATURE_FLAGS,
  isLoading: true,
  loading: true, // BaseStore property
  error: null,
  environment: 'production',
  userId: undefined,
  societyId: undefined,
  setLoading: function (loading: boolean): void {
    throw new Error('Function not implemented.');
  },
  setError: function (error: string | null): void {
    throw new Error('Function not implemented.');
  },
  reset: function (): void {
    throw new Error('Function not implemented.');
  },
};

const STORAGE_KEY = '@aptly_feature_flags';
const REMOTE_CONFIG_URL = 'https://api.aptly.app/v4/feature-flags';

/**
 * FeatureFlagStore - Zustand store for feature flag management
 *
 * Features:
 * - Remote configuration support
 * - Environment-specific overrides
 * - Group operations for bulk flag management
 * - User and society context support
 * - Migration flag utilities
 * - Persistent storage with AsyncStorage
 */

export const useFeatureFlagStore = create<FeatureFlagStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Flag checking
        isFeatureEnabled: (feature: keyof FeatureFlags): boolean => {
          return get().flags[feature] === true;
        },

        // Individual flag management
        enableFeature: async (feature: keyof FeatureFlags) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            const newFlags = { ...get().flags, [feature]: true };
            await saveFlags(newFlags);

            set((state) => {
              state.flags = newFlags;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to enable feature:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to enable feature';
            });
          }
        },

        disableFeature: async (feature: keyof FeatureFlags) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            const newFlags = { ...get().flags, [feature]: false };
            await saveFlags(newFlags);

            set((state) => {
              state.flags = newFlags;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to disable feature:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to disable feature';
            });
          }
        },

        updateFlags: async (newFlags: Partial<FeatureFlags>) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            const updatedFlags = { ...get().flags, ...newFlags };
            await saveFlags(updatedFlags);

            set((state) => {
              state.flags = updatedFlags;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to update flags:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to update flags';
            });
          }
        },

        resetToDefaults: async () => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            await AsyncStorage.removeItem(STORAGE_KEY);

            set((state) => {
              state.flags = DEFAULT_FEATURE_FLAGS;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to reset flags:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to reset flags';
            });
          }
        },

        // Group operations
        getFeatureGroup: (group: FeatureGroup): Partial<FeatureFlags> => {
          const groupKeys = FEATURE_GROUPS[group];
          const flags = get().flags;
          const groupFlags: Partial<FeatureFlags> = {};

          groupKeys.forEach((key) => {
            groupFlags[key] = flags[key];
          });

          return groupFlags;
        },

        enableFeatureGroup: async (group: FeatureGroup) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            const groupKeys = FEATURE_GROUPS[group];
            const updates: Partial<FeatureFlags> = {};

            groupKeys.forEach((key) => {
              updates[key] = true;
            });

            await get().updateFlags(updates);
          } catch (error: any) {
            console.error('Failed to enable feature group:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to enable feature group';
            });
          }
        },

        disableFeatureGroup: async (group: FeatureGroup) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            const groupKeys = FEATURE_GROUPS[group];
            const updates: Partial<FeatureFlags> = {};

            groupKeys.forEach((key) => {
              updates[key] = false;
            });

            await get().updateFlags(updates);
          } catch (error: any) {
            console.error('Failed to disable feature group:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to disable feature group';
            });
          }
        },

        // Remote configuration
        loadRemoteFlags: async () => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            const { environment, userId, societyId } = get();
            const remoteFlags = await fetchRemoteFlags(
              environment,
              userId,
              societyId,
            );

            if (remoteFlags) {
              const currentFlags = get().flags;
              const mergedFlags = { ...currentFlags, ...remoteFlags };

              set((state) => {
                state.flags = mergedFlags;
                state.loading = false;
              });

              // Save merged flags locally
              await saveFlags(mergedFlags);
            } else {
              set((state) => {
                state.loading = false;
              });
            }
          } catch (error: any) {
            console.error('Failed to load remote flags:', error);
            set((state) => {
              state.loading = false;
              state.error =
                error.message || 'Failed to load remote configuration';
            });
          }
        },

        refreshFlags: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.loading = true;
              state.error = null;
            });

            // 1. Start with default flags
            let loadedFlags = { ...DEFAULT_FEATURE_FLAGS };

            // 2. Apply environment overrides
            const { environment } = get();
            if (ENVIRONMENT_OVERRIDES[environment]) {
              loadedFlags = {
                ...loadedFlags,
                ...ENVIRONMENT_OVERRIDES[environment],
              };
            }

            // 3. Load locally stored flags
            const storedFlags = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedFlags) {
              const parsedFlags = JSON.parse(storedFlags);
              loadedFlags = { ...loadedFlags, ...parsedFlags };
            }

            // 4. Fetch remote configuration
            try {
              const { userId, societyId } = get();
              const remoteFlags = await fetchRemoteFlags(
                environment,
                userId,
                societyId,
              );
              if (remoteFlags) {
                loadedFlags = { ...loadedFlags, ...remoteFlags };
              }
            } catch (error) {
              console.log('Remote feature flags not available:', error);
            }

            set((state) => {
              state.flags = loadedFlags;
              state.isLoading = false;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to refresh flags:', error);
            set((state) => {
              state.flags = DEFAULT_FEATURE_FLAGS;
              state.isLoading = false;
              state.loading = false;
              state.error = error.message || 'Failed to refresh flags';
            });
          }
        },

        // Environment and context
        setEnvironment: (
          environment: 'development' | 'staging' | 'production',
        ) => {
          set((state) => {
            state.environment = environment;
          });
          // Refresh flags with new environment
          get().refreshFlags();
        },

        setUserContext: (userId?: string, societyId?: string) => {
          set((state) => {
            state.userId = userId;
            state.societyId = societyId;
          });
          // Refresh flags with new context
          get().refreshFlags();
        },

        // Migration utilities
        enableMigrationFlags: async (flags: string[]) => {
          try {
            const updates: Partial<FeatureFlags> = {};
            flags.forEach((flag) => {
              if (flag in DEFAULT_FEATURE_FLAGS) {
                updates[flag as keyof FeatureFlags] = true;
              }
            });

            await get().updateFlags(updates);
            console.log('Migration flags enabled:', flags);
          } catch (error: any) {
            console.error('Failed to enable migration flags:', error);
            throw error;
          }
        },

        disableMigrationFlags: async (flags: string[]) => {
          try {
            const updates: Partial<FeatureFlags> = {};
            flags.forEach((flag) => {
              if (flag in DEFAULT_FEATURE_FLAGS) {
                updates[flag as keyof FeatureFlags] = false;
              }
            });

            await get().updateFlags(updates);
            console.log('Migration flags disabled:', flags);
          } catch (error: any) {
            console.error('Failed to disable migration flags:', error);
            throw error;
          }
        },

        getMigrationStatus: (): Record<string, boolean> => {
          const migrationFlags = FEATURE_GROUPS.migration;
          const flags = get().flags;
          const status: Record<string, boolean> = {};

          migrationFlags.forEach((flag) => {
            status[flag] = flags[flag];
          });

          return status;
        },

        // BaseStore methods
        setLoading: (loading: boolean) => {
          set((state) => {
            state.loading = loading;
            state.isLoading = loading;
          });
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },

        reset: () => {
          set((state) => {
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'feature-flags-storage',
        storage: {
          getItem: async (name: string) => {
            try {
              const value = await AsyncStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            } catch (error) {
              console.warn(`Unable to get item '${name}', storage unavailable:`, error);
              return null;
            }
          },
          setItem: async (name: string, value: any) => {
            try {
              await AsyncStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.warn(`Unable to set item '${name}', storage unavailable:`, error);
            }
          },
          removeItem: async (name: string) => {
            try {
              await AsyncStorage.removeItem(name);
            } catch (error) {
              console.warn(`Unable to remove item '${name}', storage unavailable:`, error);
            }
          },
        },
        partialize: (state) => ({
          flags: state.flags,
          environment: state.environment,
          userId: state.userId,
          societyId: state.societyId,
        }),
        version: 1,
        onRehydrateStorage: () => {
          console.log('🔄 Starting rehydration for: feature-flags-storage');
          return (state, error) => {
            if (error) {
              console.error('❌ Error rehydrating feature-flags-storage:', error);
            } else {
              console.log('✅ Successfully rehydrated: feature-flags-storage');
            }
          };
        },
        // Handle migration errors gracefully
        migrate: (persistedState: any, version: number) => {
          try {
            if (version === 0) {
              // Migration from version 0 to 1
              return {
                ...persistedState,
                flags: { ...DEFAULT_FEATURE_FLAGS, ...persistedState.flags },
              };
            }
            return persistedState;
          } catch (error) {
            console.warn('Migration failed, using default state:', error);
            return {
              flags: DEFAULT_FEATURE_FLAGS,
              environment: 'production',
            };
          }
        },
      },
    ),
    { name: 'FeatureFlagStore' },
  ),
);

// Helper functions
const saveFlags = async (flags: FeatureFlags): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    console.log('✅ Feature flags saved successfully');
  } catch (error: any) {
    console.warn('⚠️ Failed to save feature flags to storage:', error);
    // Don't throw error - allow app to continue without persistence
  }
};

const fetchRemoteFlags = async (
  environment: string,
  userId?: string,
  societyId?: string,
): Promise<Partial<FeatureFlags> | null> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (societyId) params.append('societyId', societyId);
    params.append('environment', environment);

    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${REMOTE_CONFIG_URL}?${params.toString()}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const remoteFlags = await response.json();
      console.log('✅ Remote feature flags loaded successfully');
      return remoteFlags;
    } else {
      console.warn(`⚠️ Remote config returned ${response.status}: ${response.statusText}`);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ Remote config request timed out');
    } else if (error.message?.includes('Network request failed')) {
      console.warn('⚠️ Network unavailable, using cached flags');
    } else {
      console.warn('⚠️ Remote feature flags unavailable:', error.message);
    }
  }
  return null;
};

// Selectors for optimized subscriptions
export const useFeatureFlag = (feature: keyof FeatureFlags) =>
  useFeatureFlagStore((state) => state.flags[feature]);

export const useFeatureFlagLoading = () =>
  useFeatureFlagStore((state) => state.isLoading);

export const useFeatureFlagError = () =>
  useFeatureFlagStore((state) => state.error);

export const useFeatureFlagActions = () =>
  useFeatureFlagStore((state) => ({
    isFeatureEnabled: state.isFeatureEnabled,
    enableFeature: state.enableFeature,
    disableFeature: state.disableFeature,
    updateFlags: state.updateFlags,
    resetToDefaults: state.resetToDefaults,
    getFeatureGroup: state.getFeatureGroup,
    enableFeatureGroup: state.enableFeatureGroup,
    disableFeatureGroup: state.disableFeatureGroup,
    loadRemoteFlags: state.loadRemoteFlags,
    refreshFlags: state.refreshFlags,
  }));

export const useMigrationFlags = () =>
  useFeatureFlagStore((state) => ({
    enableMigrationFlags: state.enableMigrationFlags,
    disableMigrationFlags: state.disableMigrationFlags,
    getMigrationStatus: state.getMigrationStatus,
    authStoreEnabled: state.flags.USE_AUTH_STORE,
    societyStoreEnabled: state.flags.USE_SOCIETY_STORE,
    adminStoreEnabled: state.flags.USE_ADMIN_STORE,
    themeStoreEnabled: state.flags.USE_THEME_STORE,
    notificationStoreEnabled: state.flags.USE_NOTIFICATION_STORE,
    featureFlagStoreEnabled: state.flags.USE_FEATURE_FLAG_STORE,
  }));
