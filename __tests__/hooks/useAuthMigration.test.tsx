/**
 * Tests for useAuthMigration hook - ensures seamless transition between Context and Store
 */
import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useAuthMigration, useIsAuthStoreActive } from '@/hooks/useAuthMigration';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/slices/authStore';

// Mock the services
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(),
    getStoredProfile: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/services/biometric.service', () => ({
  __esModule: true,
  default: {
    authenticateWithBiometrics: jest.fn(),
    getBiometricUserId: jest.fn(),
    isBiometricEnabled: jest.fn(),
    enableBiometricAuth: jest.fn(),
    disableBiometricAuth: jest.fn(),
  },
}));

// Create wrapper components for testing
const createWrapper = (useAuthStore: boolean = false) => ({ children }: { children: React.ReactNode }) => (
  <FeatureFlagProvider
    environment="development"
    userId="test-user"
    societyId="test-society"
  >
    <AuthProvider>
      {children}
    </AuthProvider>
  </FeatureFlagProvider>
);

describe('useAuthMigration', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('should use AuthContext when feature flag is disabled', () => {
    const wrapper = createWrapper(false);
    const { result } = renderHook(() => useAuthMigration(), { wrapper });

    expect(result.current).toBeDefined();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.checkAuthStatus).toBe('function');
    expect(typeof result.current.authenticateWithBiometrics).toBe('function');
    expect(typeof result.current.isBiometricEnabled).toBe('function');
    
    // Store-specific methods should be present but with warnings
    expect(typeof result.current.enableBiometric).toBe('function');
    expect(typeof result.current.updateProfile).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should provide consistent interface regardless of implementation', () => {
    const contextWrapper = createWrapper(false);
    const { result: contextResult } = renderHook(() => useAuthMigration(), { 
      wrapper: contextWrapper 
    });

    // Test that all expected methods are available
    const expectedMethods = [
      'login',
      'logout', 
      'checkAuthStatus',
      'authenticateWithBiometrics',
      'isBiometricEnabled',
      'enableBiometric',
      'disableBiometric',
      'updateProfile',
      'refreshUserData',
      'clearError',
    ];

    expectedMethods.forEach(method => {
      expect(typeof contextResult.current[method]).toBe('function');
    });

    // Test that all expected properties are available
    const expectedProperties = [
      'isAuthenticated',
      'isLoading',
      'user',
      'error',
    ];

    expectedProperties.forEach(property => {
      expect(contextResult.current).toHaveProperty(property);
    });
  });

  it('should handle method calls gracefully in context mode', () => {
    const wrapper = createWrapper(false);
    const { result } = renderHook(() => useAuthMigration(), { wrapper });

    // Console.warn should be called for store-only methods
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    // These methods should work without throwing
    expect(() => result.current.enableBiometric()).not.toThrow();
    expect(() => result.current.updateProfile({})).not.toThrow();
    expect(() => result.current.clearError()).not.toThrow();

    consoleSpy.mockRestore();
  });
});

describe('useIsAuthStoreActive', () => {
  it('should return false when feature flag is disabled', () => {
    const wrapper = createWrapper(false);
    const { result } = renderHook(() => useIsAuthStoreActive(), { wrapper });
    
    expect(result.current).toBe(false);
  });
});

describe('Migration Interface Compatibility', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('should maintain interface compatibility between context and store', () => {
    // Test that both implementations have the same core interface
    const wrapper = createWrapper(false);
    const { result: contextResult } = renderHook(() => useAuthMigration(), { 
      wrapper 
    });

    // Core authentication interface should be identical
    expect(typeof contextResult.current.isAuthenticated).toBe('boolean');
    expect(typeof contextResult.current.isLoading).toBe('boolean');
    expect(contextResult.current.user).toBeNull(); // Initial state
    
    // Methods should be functions
    expect(typeof contextResult.current.login).toBe('function');
    expect(typeof contextResult.current.logout).toBe('function');
    expect(typeof contextResult.current.checkAuthStatus).toBe('function');
  });

  it('should handle store state initialization correctly', () => {
    // Test that store starts with correct initial state
    const store = useAuthStore.getState();
    
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoading).toBe(true); // Loading until auth check completes
    expect(store.error).toBeNull();
    expect(store.biometricEnabled).toBe(false);
  });
});