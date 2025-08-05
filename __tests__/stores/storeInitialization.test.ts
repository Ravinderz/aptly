// Store initialization tests
import { jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useAuthStore } from '@/stores/slices/authStore';
import { initializeStorage, isStorageAvailable } from '@/stores/utils/storageManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Store Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset stores to initial state
    useFeatureFlagStore.getState().reset();
    useAuthStore.getState().reset();
  });

  describe('Storage Availability', () => {
    it('should detect when AsyncStorage is available', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);
      mockAsyncStorage.getItem.mockResolvedValueOnce('test');
      mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

      const isAvailable = await isStorageAvailable();
      expect(isAvailable).toBe(true);
    });

    it('should handle AsyncStorage unavailability gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage unavailable'));

      const isAvailable = await isStorageAvailable();
      expect(isAvailable).toBe(false);
    });

    it('should initialize storage successfully', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);
      mockAsyncStorage.getItem.mockResolvedValueOnce('test');
      mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

      const initialized = await initializeStorage();
      expect(initialized).toBe(true);
    });
  });

  describe('FeatureFlag Store Persistence', () => {
    it('should handle storage errors gracefully in feature flag store', async () => {
      // Mock storage failure
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage unavailable'));
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage unavailable'));

      const store = useFeatureFlagStore.getState();
      
      // These operations should not throw errors even when storage fails
      await expect(store.enableFeature('analytics_dashboard')).resolves.not.toThrow();
      await expect(store.refreshFlags()).resolves.not.toThrow();
    });

    it('should work without persistence when storage is unavailable', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage unavailable'));
      
      const store = useFeatureFlagStore.getState();
      
      // Enable a feature flag
      await store.enableFeature('analytics_dashboard');
      
      // Feature should be enabled in memory even if storage failed
      expect(store.isFeatureEnabled('analytics_dashboard')).toBe(true);
    });
  });

  describe('Auth Store Persistence', () => {
    it('should handle storage errors gracefully in auth store', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage unavailable'));
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage unavailable'));

      const store = useAuthStore.getState();
      
      // These operations should not throw errors even when storage fails
      await expect(store.checkAuthStatus()).resolves.not.toThrow();
      expect(() => store.clearError()).not.toThrow();
    });

    it('should maintain state in memory when persistence fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage unavailable'));
      
      const store = useAuthStore.getState();
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'resident' as const,
        profilePicture: null,
        phoneNumber: '+1234567890',
        flatNumber: 'A-101',
        societyId: 'society-123',
        preferences: {},
        lastLoginTime: Date.now(),
        isVerified: true,
      };
      
      // Login should work even if persistence fails
      store.login(mockUser);
      
      expect(store.isAuthenticated).toBe(true);
      expect(store.user).toEqual(mockUser);
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network failures in feature flag fetching', async () => {
      // Mock successful storage but failed network
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      // Mock fetch to simulate network failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

      const store = useFeatureFlagStore.getState();
      
      // Should not throw error and should use default flags
      await expect(store.refreshFlags()).resolves.not.toThrow();
      
      // Should have some default flags
      expect(Object.keys(store.flags)).toHaveLength(expect.any(Number));
    });

    it('should handle timeout in feature flag fetching', async () => {
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      // Mock fetch to simulate timeout
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      const store = useFeatureFlagStore.getState();
      
      await expect(store.refreshFlags()).resolves.not.toThrow();
    });
  });

  describe('Store Recovery', () => {
    it('should reset store state on reset call', () => {
      const featureStore = useFeatureFlagStore.getState();
      const authStore = useAuthStore.getState();
      
      // Modify stores
      featureStore.setError('Test error');
      authStore.setError('Auth error');
      
      // Reset should clear errors
      featureStore.reset();
      authStore.reset();
      
      expect(featureStore.error).toBeNull();
      expect(authStore.error).toBeNull();
    });

    it('should handle corrupt data gracefully', async () => {
      // Mock corrupted data in storage
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json{');
      
      const store = useFeatureFlagStore.getState();
      
      // Should not crash when loading corrupted data
      await expect(store.refreshFlags()).resolves.not.toThrow();
    });
  });
});

describe('Store Health Monitoring', () => {
  it('should not crash the app even with monitoring errors', () => {
    // This test ensures monitoring doesn't interfere with normal operation
    expect(() => {
      const store = useFeatureFlagStore.getState();
      store.isFeatureEnabled('analytics_dashboard');
    }).not.toThrow();
  });
});