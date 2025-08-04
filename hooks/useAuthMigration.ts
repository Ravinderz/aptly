// Migration hook for gradual transition from AuthContext to AuthStore
import { useContext } from 'react';
import { useAuthStore } from '@/stores/slices/authStore';
import AuthContext, { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

/**
 * Migration hook that switches between AuthContext and AuthStore based on feature flag
 * This enables gradual rollout of Zustand migration
 */
export const useAuthMigration = () => {
  const { isFeatureEnabled } = useFeatureFlags();
  const useStore = isFeatureEnabled('USE_AUTH_STORE' as any); // Type assertion for new flag
  
  // Get both context and store data
  const contextAuth = useAuth();
  const storeAuth = useAuthStore();
  
  // Return the appropriate implementation based on feature flag
  if (useStore) {
    // Transform store interface to match context interface exactly
    return {
      isAuthenticated: storeAuth.isAuthenticated,
      isLoading: storeAuth.isLoading,
      user: storeAuth.user,
      login: storeAuth.login,
      logout: storeAuth.logout,
      checkAuthStatus: storeAuth.checkAuthStatus,
      authenticateWithBiometrics: storeAuth.authenticateWithBiometrics,
      isBiometricEnabled: storeAuth.isBiometricEnabled,
      
      // Additional store-only methods (optional)
      enableBiometric: storeAuth.enableBiometric,
      disableBiometric: storeAuth.disableBiometric,
      updateProfile: storeAuth.updateProfile,
      refreshUserData: storeAuth.refreshUserData,
      clearError: storeAuth.clearError,
      error: storeAuth.error,
    };
  }
  
  // Return context implementation
  return {
    ...contextAuth,
    // Add default implementations for store-only methods to maintain compatibility
    enableBiometric: async () => {
      console.warn('enableBiometric not available in context mode');
    },
    disableBiometric: async () => {
      console.warn('disableBiometric not available in context mode');
    },
    updateProfile: async () => {
      console.warn('updateProfile not available in context mode');
    },
    refreshUserData: async () => {
      console.warn('refreshUserData not available in context mode');
    },
    clearError: () => {
      console.warn('clearError not available in context mode');
    },
    error: null,
  };
};

/**
 * Hook to check if we're currently using the store implementation
 */
export const useIsAuthStoreActive = (): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled('USE_AUTH_STORE' as any);
};

/**
 * Development helper to validate both implementations have the same data
 * Only runs in development mode
 */
export const useAuthMigrationValidator = () => {
  if (__DEV__) {
    const contextAuth = useAuth();
    const storeAuth = useAuthStore();
    const isStoreActive = useIsAuthStoreActive();
    
    // Log any discrepancies between context and store data
    if (contextAuth.isAuthenticated !== storeAuth.isAuthenticated) {
      console.warn('Auth migration: isAuthenticated mismatch', {
        context: contextAuth.isAuthenticated,
        store: storeAuth.isAuthenticated,
        activeImplementation: isStoreActive ? 'store' : 'context',
      });
    }
    
    if (contextAuth.isLoading !== storeAuth.isLoading) {
      console.warn('Auth migration: isLoading mismatch', {
        context: contextAuth.isLoading,
        store: storeAuth.isLoading,
        activeImplementation: isStoreActive ? 'store' : 'context',
      });
    }
    
    if (contextAuth.user?.id !== storeAuth.user?.id) {
      console.warn('Auth migration: user data mismatch', {
        context: contextAuth.user?.id,
        store: storeAuth.user?.id,
        activeImplementation: isStoreActive ? 'store' : 'context',
      });
    }
  }
};

/**
 * Utility hook for emergency rollback
 * Forces the app to use context implementation regardless of feature flag
 */
export const useAuthEmergencyFallback = () => {
  const contextAuth = useAuth();
  
  return {
    ...contextAuth,
    // Add stub methods for store-only functionality
    enableBiometric: async () => {},
    disableBiometric: async () => {},
    updateProfile: async () => {},
    refreshUserData: async () => {},
    clearError: () => {},
    error: null,
  };
};