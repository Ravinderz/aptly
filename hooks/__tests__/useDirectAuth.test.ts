// Test for useDirectAuth hook to verify Rules of Hooks compliance
import { renderHook } from '@testing-library/react-native';
import { useDirectAuth } from '../useDirectAuth';

// Mock the store dependencies
jest.mock('@/stores/slices/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      login: jest.fn(),
      logout: jest.fn(),
      checkAuthStatus: jest.fn(),
      authenticateWithBiometrics: jest.fn(),
      enableBiometric: jest.fn(),
      disableBiometric: jest.fn(),
      updateProfile: jest.fn(),
      refreshUserData: jest.fn(),
      clearError: jest.fn(),
    })),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/stores/slices/featureFlagStore', () => ({
  useFeatureFlagStore: jest.fn((selector) => selector({ flags: { USE_AUTH_STORE: true } })),
}));

jest.mock('@/stores/utils/storeHooks', () => ({
  useSafeStoreSelector: jest.fn((store, selector, fallback) => {
    // Mock successful store selection
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      isBiometricEnabled: false,
    };
  }),
}));

describe('useDirectAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should follow Rules of Hooks - always call hooks in same order', () => {
    // First render
    const { result: result1, rerender } = renderHook(() => useDirectAuth());
    
    expect(result1.current).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      isBiometricEnabled: false,
      isUsingStore: true,
      migrationStatus: 'active',
    });

    // Re-render should not cause hook order issues
    rerender();
    const result2 = result1.current;
    
    expect(result2).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      isBiometricEnabled: false,
      isUsingStore: true,
      migrationStatus: 'active',
    });

    // Verify all action functions are present
    expect(typeof result2.login).toBe('function');
    expect(typeof result2.logout).toBe('function');
    expect(typeof result2.checkAuthStatus).toBe('function');
    expect(typeof result2.authenticateWithBiometrics).toBe('function');
    expect(typeof result2.enableBiometric).toBe('function');
    expect(typeof result2.disableBiometric).toBe('function');
    expect(typeof result2.updateProfile).toBe('function');
    expect(typeof result2.refreshUserData).toBe('function');
    expect(typeof result2.clearError).toBe('function');
  });

  it('should handle store errors gracefully without violating Rules of Hooks', () => {
    const { useSafeStoreSelector } = require('@/stores/utils/storeHooks');
    
    // Mock store error scenario
    useSafeStoreSelector.mockImplementationOnce((store, selector, fallback) => fallback);
    
    const { result } = renderHook(() => useDirectAuth());
    
    // Should return fallback state without crashing
    expect(result.current).toMatchObject({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
      isBiometricEnabled: false,
      isUsingStore: true,
      migrationStatus: 'active',
    });
  });

  it('should have stable action references', () => {
    const { result, rerender } = renderHook(() => useDirectAuth());
    
    const firstActions = {
      login: result.current.login,
      logout: result.current.logout,
      checkAuthStatus: result.current.checkAuthStatus,
    };
    
    // Re-render
    rerender();
    
    const secondActions = {
      login: result.current.login,
      logout: result.current.logout,
      checkAuthStatus: result.current.checkAuthStatus,
    };
    
    // Actions should be the same reference (stable)
    expect(firstActions.login).toBe(secondActions.login);
    expect(firstActions.logout).toBe(secondActions.logout);
    expect(firstActions.checkAuthStatus).toBe(secondActions.checkAuthStatus);
  });
});