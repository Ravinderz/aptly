// Migration hook for gradual transition from FeatureFlagContext to FeatureFlagStore
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';

/**
 * Migration hook that switches between FeatureFlagContext and FeatureFlagStore based on feature flag
 * This enables gradual rollout of Zustand migration for feature flags
 */
export const useFeatureFlagMigration = () => {
  const contextFlags = useFeatureFlags();
  const storeFlags = useFeatureFlagStore();
  
  // Check if we should use the store implementation
  // We use the context to check initially, then switch to store if enabled
  const useStore = contextFlags.isFeatureEnabled('USE_FEATURE_FLAG_STORE');
  
  if (useStore) {
    // Transform store interface to match context interface exactly
    return {
      flags: storeFlags.flags,
      isFeatureEnabled: storeFlags.isFeatureEnabled,
      enableFeature: storeFlags.enableFeature,
      disableFeature: storeFlags.disableFeature,
      updateFlags: storeFlags.updateFlags,
      resetToDefaults: storeFlags.resetToDefaults,
      getFeatureGroup: storeFlags.getFeatureGroup,
      isLoading: storeFlags.isLoading,
      
      // Additional store-only methods
      enableFeatureGroup: storeFlags.enableFeatureGroup,
      disableFeatureGroup: storeFlags.disableFeatureGroup,
      loadRemoteFlags: storeFlags.loadRemoteFlags,
      refreshFlags: storeFlags.refreshFlags,
      setEnvironment: storeFlags.setEnvironment,
      setUserContext: storeFlags.setUserContext,
      enableMigrationFlags: storeFlags.enableMigrationFlags,
      disableMigrationFlags: storeFlags.disableMigrationFlags,
      getMigrationStatus: storeFlags.getMigrationStatus,
      error: storeFlags.error,
    };
  }
  
  // Return context implementation with stub methods for store-only functionality
  return {
    ...contextFlags,
    // Add default implementations for store-only methods
    enableFeatureGroup: async () => {
      console.warn('enableFeatureGroup not available in context mode');
    },
    disableFeatureGroup: async () => {
      console.warn('disableFeatureGroup not available in context mode');
    },
    loadRemoteFlags: async () => {
      console.warn('loadRemoteFlags not available in context mode');
    },
    refreshFlags: async () => {
      console.warn('refreshFlags not available in context mode - use manual reload');
    },
    setEnvironment: () => {
      console.warn('setEnvironment not available in context mode');
    },
    setUserContext: () => {
      console.warn('setUserContext not available in context mode');
    },
    enableMigrationFlags: async () => {
      console.warn('enableMigrationFlags not available in context mode');
    },
    disableMigrationFlags: async () => {
      console.warn('disableMigrationFlags not available in context mode');
    },
    getMigrationStatus: () => {
      console.warn('getMigrationStatus not available in context mode');
      return {};
    },
    error: null,
  };
};

/**
 * Hook to check if we're currently using the store implementation
 */
export const useIsFeatureFlagStoreActive = (): boolean => {
  const contextFlags = useFeatureFlags();
  return contextFlags.isFeatureEnabled('USE_FEATURE_FLAG_STORE');
};

/**
 * Development helper to validate both implementations have the same data
 */
export const useFeatureFlagMigrationValidator = () => {
  if (__DEV__) {
    const contextFlags = useFeatureFlags();
    const storeFlags = useFeatureFlagStore();
    const isStoreActive = useIsFeatureFlagStoreActive();
    
    // Compare core flag states
    const contextFlagKeys = Object.keys(contextFlags.flags) as Array<keyof typeof contextFlags.flags>;
    const storeFlagKeys = Object.keys(storeFlags.flags) as Array<keyof typeof storeFlags.flags>;
    
    // Check for missing flags
    const missingInStore = contextFlagKeys.filter(key => !(key in storeFlags.flags));
    const missingInContext = storeFlagKeys.filter(key => !(key in contextFlags.flags));
    
    if (missingInStore.length > 0) {
      console.warn('Feature flags missing in store:', missingInStore);
    }
    
    if (missingInContext.length > 0) {
      console.warn('Feature flags missing in context:', missingInContext);
    }
    
    // Check for flag value mismatches (only for common flags)
    const commonFlags = contextFlagKeys.filter(key => key in storeFlags.flags);
    const mismatches = commonFlags.filter(
      key => contextFlags.flags[key] !== storeFlags.flags[key]
    );
    
    if (mismatches.length > 0) {
      console.warn('Feature flag value mismatches detected:', {
        mismatches: mismatches.map(flag => ({
          flag,
          context: contextFlags.flags[flag],
          store: storeFlags.flags[flag],
        })),
        activeImplementation: isStoreActive ? 'store' : 'context',
      });
    }
    
    // Loading state comparison
    if (contextFlags.isLoading !== storeFlags.isLoading) {
      console.warn('Feature flag loading state mismatch:', {
        context: contextFlags.isLoading,
        store: storeFlags.isLoading,
        activeImplementation: isStoreActive ? 'store' : 'context',
      });
    }
  }
};

/**
 * Utility hook for emergency rollback
 * Forces the app to use context implementation regardless of feature flag
 */
export const useFeatureFlagEmergencyFallback = () => {
  const contextFlags = useFeatureFlags();
  
  return {
    ...contextFlags,
    // Add stub methods for store-only functionality
    enableFeatureGroup: async () => {},
    disableFeatureGroup: async () => {},
    loadRemoteFlags: async () => {},
    refreshFlags: async () => {},
    setEnvironment: () => {},
    setUserContext: () => {},
    enableMigrationFlags: async () => {},
    disableMigrationFlags: async () => {},
    getMigrationStatus: () => ({}),
    error: null,
  };
};

/**
 * Convenience hook to access migration-specific functionality
 */
export const useMigrationControl = () => {
  const { isFeatureEnabled, enableFeature, disableFeature, updateFlags } = useFeatureFlagMigration();
  
  return {
    // Check current migration status
    isAuthStoreMigrated: isFeatureEnabled('USE_AUTH_STORE'),
    isSocietyStoreMigrated: isFeatureEnabled('USE_SOCIETY_STORE'),
    isAdminStoreMigrated: isFeatureEnabled('USE_ADMIN_STORE'),
    isThemeStoreMigrated: isFeatureEnabled('USE_THEME_STORE'),
    isNotificationStoreMigrated: isFeatureEnabled('USE_NOTIFICATION_STORE'),
    isFeatureFlagStoreMigrated: isFeatureEnabled('USE_FEATURE_FLAG_STORE'),
    
    // Migration control methods
    enableAllMigrations: async () => {
      await updateFlags({
        USE_AUTH_STORE: true,
        USE_SOCIETY_STORE: true,
        USE_ADMIN_STORE: true,
        USE_THEME_STORE: true,
        USE_NOTIFICATION_STORE: true,
        USE_FEATURE_FLAG_STORE: true,
      } as any);
    },
    
    disableAllMigrations: async () => {
      await updateFlags({
        USE_AUTH_STORE: false,
        USE_SOCIETY_STORE: false,
        USE_ADMIN_STORE: false,
        USE_THEME_STORE: false,
        USE_NOTIFICATION_STORE: false,
        USE_FEATURE_FLAG_STORE: false,
      } as any);
    },
    
    enableAuthStoreMigration: () => enableFeature('USE_AUTH_STORE'),
    disableAuthStoreMigration: () => disableFeature('USE_AUTH_STORE'),
    
    enableSocietyStoreMigration: () => enableFeature('USE_SOCIETY_STORE'),
    disableSocietyStoreMigration: () => disableFeature('USE_SOCIETY_STORE'),
    
    // Get overall migration progress
    getMigrationProgress: () => {
      const flags = [
        'USE_AUTH_STORE',
        'USE_SOCIETY_STORE', 
        'USE_ADMIN_STORE',
        'USE_THEME_STORE',
        'USE_NOTIFICATION_STORE',
        'USE_FEATURE_FLAG_STORE',
      ];
      
      const enabled = flags.filter(flag => isFeatureEnabled(flag as any));
      return {
        total: flags.length,
        enabled: enabled.length,
        percentage: Math.round((enabled.length / flags.length) * 100),
        remaining: flags.filter(flag => !isFeatureEnabled(flag as any)),
      };
    },
  };
};