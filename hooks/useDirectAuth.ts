// Direct auth hook using only Zustand stores (no Context dependency)
import { useAuthStore } from '@/stores/slices/authStore';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useMemo, useCallback } from 'react';
import { useStoreWithSelector } from '@/stores/utils/storeHooks';

/**
 * Direct auth hook that uses stores directly without Context dependencies
 * This replaces useAuthMigration to avoid circular dependencies during initialization
 */
export const useDirectAuth = () => {
  // Fixed: Create stable selector outside component to prevent infinite loops
  const stableAuthSelector = useCallback((state: any) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
    isBiometricEnabled: state.isBiometricEnabled,
  }), []);

  // Use stable store selector to prevent getSnapshot infinite loops
  const authState = useStoreWithSelector(
    useAuthStore,
    stableAuthSelector
  );

  // Fixed: Get actions with stable references using proper memoization
  const actions = useMemo(() => {
    const store = useAuthStore.getState();
    return {
      login: store.login,
      logout: store.logout,
      checkAuthStatus: store.checkAuthStatus,
      authenticateWithBiometrics: store.authenticateWithBiometrics,
      enableBiometric: store.enableBiometric,
      disableBiometric: store.disableBiometric,
      updateProfile: store.updateProfile,
      refreshUserData: store.refreshUserData,
      clearError: store.clearError,
    };
  }, []); // Empty dependency array is correct - these actions are stable

  // Return stable object to prevent re-renders
  return useMemo(() => ({
    ...authState,
    ...actions,
    // Additional metadata
    isUsingStore: true,
    migrationStatus: 'active' as const,
  }), [authState, actions]);
};

/**
 * Hook to check if auth store is active
 */
export const useIsAuthStoreActive = (): boolean => {
  return useFeatureFlagStore((state) => state.flags.USE_AUTH_STORE);
};

/**
 * Emergency fallback that provides basic auth state
 */
export const useAuthFallback = () => {
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: async () => {},
    logout: async () => {},
    checkAuthStatus: async () => {},
    authenticateWithBiometrics: async () => {},
    isBiometricEnabled: false,
    enableBiometric: async () => {},
    disableBiometric: async () => {},
    updateProfile: async () => {},
    refreshUserData: async () => {},
    clearError: () => {},
    error: null,
    isUsingStore: false,
    migrationStatus: 'fallback',
  };
};