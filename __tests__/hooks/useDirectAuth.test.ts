import { renderHook, act } from '@testing-library/react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';

// Create mock store state and actions
const mockAuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  isBiometricEnabled: false,
};

const mockAuthActions = {
  login: jest.fn(),
  logout: jest.fn(),
  checkAuthStatus: jest.fn(),
  authenticateWithBiometrics: jest.fn(),
  enableBiometric: jest.fn(),
  disableBiometric: jest.fn(),
  updateProfile: jest.fn(),
  refreshUserData: jest.fn(),
  clearError: jest.fn(),
};

// Create a mock function that also has store methods
const mockUseAuthStore = jest.fn(() => ({ ...mockAuthState, ...mockAuthActions }));
mockUseAuthStore.getState = jest.fn(() => ({ ...mockAuthState, ...mockAuthActions }));
mockUseAuthStore.setState = jest.fn();
mockUseAuthStore.subscribe = jest.fn();

jest.mock('@/stores/slices/authStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

// Mock the store hooks
jest.mock('@/stores/utils/storeHooks', () => ({
  useStoreWithSelector: jest.fn((store, selector) => {
    return selector({ ...mockAuthState, ...mockAuthActions });
  }),
}));

// Mock the feature flag store
jest.mock('@/stores/slices/featureFlagStore', () => ({
  useFeatureFlagStore: jest.fn((selector) => {
    const mockState = {
      flags: {
        USE_AUTH_STORE: true,
      },
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

describe('useDirectAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useDirectAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isBiometricEnabled).toBe(false);
    expect(result.current.isUsingStore).toBe(true);
    expect(result.current.migrationStatus).toBe('active');
  });

  it('should provide auth actions', () => {
    const { result } = renderHook(() => useDirectAuth());
    
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.checkAuthStatus).toBe('function');
    expect(typeof result.current.authenticateWithBiometrics).toBe('function');
    expect(typeof result.current.enableBiometric).toBe('function');
    expect(typeof result.current.disableBiometric).toBe('function');
    expect(typeof result.current.updateProfile).toBe('function');
    expect(typeof result.current.refreshUserData).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should have stable action references', () => {
    const { result, rerender } = renderHook(() => useDirectAuth());
    
    const firstLogin = result.current.login;
    const firstLogout = result.current.logout;
    
    rerender();
    
    expect(result.current.login).toBe(firstLogin);
    expect(result.current.logout).toBe(firstLogout);
  });

  it('should return consistent object reference when state unchanged', () => {
    const { result, rerender } = renderHook(() => useDirectAuth());
    
    const firstResult = result.current;
    rerender();
    
    // Actions should be stable
    expect(result.current.login).toBe(firstResult.login);
    expect(result.current.logout).toBe(firstResult.logout);
  });
});

describe('useIsAuthStoreActive Hook', () => {
  it('should return true when USE_AUTH_STORE flag is enabled', () => {
    const { useIsAuthStoreActive } = require('@/hooks/useDirectAuth');
    const { result } = renderHook(() => useIsAuthStoreActive());
    
    expect(result.current).toBe(true);
  });
});

describe('useAuthFallback Hook', () => {
  it('should return fallback auth state', () => {
    const { useAuthFallback } = require('@/hooks/useDirectAuth');
    const { result } = renderHook(() => useAuthFallback());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isUsingStore).toBe(false);
    expect(result.current.migrationStatus).toBe('fallback');
    
    // All actions should be no-op functions
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.checkAuthStatus).toBe('function');
  });

  it('should provide no-op functions for all actions', async () => {
    const { useAuthFallback } = require('@/hooks/useDirectAuth');
    const { result } = renderHook(() => useAuthFallback());
    
    // These should not throw errors
    await act(async () => {
      await result.current.login();
      await result.current.logout();
      await result.current.checkAuthStatus();
      await result.current.authenticateWithBiometrics();
      await result.current.enableBiometric();
      await result.current.disableBiometric();
      await result.current.updateProfile();
      await result.current.refreshUserData();
      result.current.clearError();
    });
    
    // State should remain unchanged
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });
});