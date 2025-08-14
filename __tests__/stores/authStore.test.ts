/**
 * Tests for AuthStore - Zustand authentication store
 */
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/slices/authStore';
// Updated to use types from the new service structure
import type { UserProfileExtended } from '@/types/api';

// Mock the modern REST auth service
jest.mock('@/services/auth.service.rest', () => ({
  __esModule: true,
  RestAuthService: {
    getInstance: jest.fn(() => ({
      isAuthenticated: jest.fn(),
      getCurrentUser: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
    })),
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

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.biometricEnabled).toBe(false);
  });

  it('should handle login successfully', () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: UserProfile = {
      id: '1',
      phoneNumber: '+919876543210',
      fullName: 'Test User',
      flatNumber: 'A-101',
      ownershipType: 'owner',
      familySize: 2,
      emergencyContact: '+919876543211',
      role: 'resident',
      societyId: 'society_1',
      societyCode: 'TEST001',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastLoginTime).toBeTruthy();
  });

  it('should handle logout successfully', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    // First login
    const mockUser: UserProfile = {
      id: '1',
      phoneNumber: '+919876543210',
      fullName: 'Test User',
      flatNumber: 'A-101',
      ownershipType: 'owner',
      familySize: 2,
      emergencyContact: '+919876543211',
      role: 'resident',
      societyId: 'society_1',
      societyCode: 'TEST001',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    act(() => {
      result.current.login(mockUser);
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.biometricEnabled).toBe(false);
  });

  it('should handle errors correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle loading states', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set some state
    const mockUser: UserProfile = {
      id: '1',
      phoneNumber: '+919876543210',
      fullName: 'Test User',
      flatNumber: 'A-101',
      ownershipType: 'owner',
      familySize: 2,
      emergencyContact: '+919876543211',
      role: 'resident',
      societyId: 'society_1',
      societyCode: 'TEST001',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    act(() => {
      result.current.login(mockUser);
      result.current.setError('Some error');
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.biometricEnabled).toBe(false);
  });

  it('should update user profile', async () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: UserProfile = {
      id: '1',
      phoneNumber: '+919876543210',
      fullName: 'Test User',
      flatNumber: 'A-101',
      ownershipType: 'owner',
      familySize: 2,
      emergencyContact: '+919876543211',
      role: 'resident',
      societyId: 'society_1',
      societyCode: 'TEST001',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    // Login first
    act(() => {
      result.current.login(mockUser);
    });

    // Update profile
    await act(async () => {
      await result.current.updateProfile({ fullName: 'Updated Name' });
    });

    expect(result.current.user?.fullName).toBe('Updated Name');
    expect(result.current.user?.id).toBe('1'); // Other fields should remain
  });
});

describe('AuthStore Selectors', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('should provide optimized selectors', () => {
    const { useAuthUser, useAuthLoading, useIsAuthenticated } = require('@/stores/slices/authStore');
    
    const { result: userResult } = renderHook(() => useAuthUser());
    const { result: loadingResult } = renderHook(() => useAuthLoading());
    const { result: authenticatedResult } = renderHook(() => useIsAuthenticated());

    expect(userResult.current).toBeNull();
    expect(loadingResult.current).toBe(true);
    expect(authenticatedResult.current).toBe(false);
  });

  it('should provide computed selectors', () => {
    const { useAuthComputed } = require('@/stores/slices/authStore');
    
    // Reset store to ensure clean state
    useAuthStore.getState().reset();
    
    const { result } = renderHook(() => useAuthComputed());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.hasUser).toBe(false);
    expect(result.current.hasProfile).toBe(false);
    expect(result.current.canAccessAdmin).toBe(false);
    expect(result.current.isResident).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });
});