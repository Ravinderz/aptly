// Direct auth hook using only Zustand stores (no Context dependency)
import { useAuthStore } from '@/stores/slices/authStore';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useMemo } from 'react';
import { useSafeStoreSelector } from '@/stores/utils/storeHooks';

// Create stable selector outside component to prevent infinite loops
const authSelector = (state: any) => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  user: state.user,
  error: state.error,
  isBiometricEnabled: state.isBiometricEnabled,
});
// Assign displayName to prevent React DevTools issues
authSelector.displayName = 'authSelector';

// Fallback auth state for error scenarios
const authFallbackState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  isBiometricEnabled: false,
};

// Stable fallback actions object created outside component
const fallbackActions = {
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => {},
  authenticateWithBiometrics: async () => false,
  enableBiometric: async () => {},
  disableBiometric: async () => {},
  updateProfile: async () => {},
  refreshUserData: async () => {},
  clearError: () => {},
};

/**
 * Direct auth hook that uses stores directly without Context dependencies
 * This replaces useAuthMigration to avoid circular dependencies during initialization
 * Fixed: Follows Rules of Hooks - all hooks called at top level, same order every time
 */
export const useDirectAuth = () => {
  // FIXED: Use useSafeStoreSelector which handles errors internally without violating Rules of Hooks
  // This hook is ALWAYS called in the same order, no conditional hook calls
  const authState = useSafeStoreSelector(useAuthStore, authSelector, authFallbackState);

  // FIXED: Get actions with stable references - no try/catch around hook calls
  const actions = useMemo(() => {
    // Safe access to store state - this doesn't call hooks
    try {
      const store = useAuthStore.getState();
      if (!store) {
        console.warn('Auth store not initialized, using fallback actions');
        return fallbackActions;
      }
      
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
    } catch (error) {
      console.error('Error accessing auth store actions:', error);
      // Return stable fallback actions reference
      return fallbackActions;
    }
  }, []); // Empty dependency array is correct - these actions are stable from Zustand

  // Return stable object to prevent re-renders
  return useMemo(() => ({
    ...authState,
    ...actions,
    // Additional metadata
    isUsingStore: true,
    migrationStatus: 'active' as const,
  }), [authState, actions]);
};

// Assign displayName to prevent React DevTools issues
useDirectAuth.displayName = 'useDirectAuth';

// Stable selector for auth store feature flag (prevents displayName errors)
const authStoreFlagSelector = (state: any) => state.flags.USE_AUTH_STORE;
// Assign displayName to prevent React DevTools issues
authStoreFlagSelector.displayName = 'authStoreFlagSelector';

/**
 * Hook to check if auth store is active
 */
export const useIsAuthStoreActive = (): boolean => {
  return useFeatureFlagStore(authStoreFlagSelector);
};

// Assign displayName to prevent React DevTools issues
useIsAuthStoreActive.displayName = 'useIsAuthStoreActive';

