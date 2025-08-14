/**
 * Integration tests for the complete Zustand migration system
 */
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/slices/authStore';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useThemeStore } from '@/stores/slices/themeStore';
import { resetAllStores, emergencyRollback } from '@/stores';

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

describe('Zustand Migration Integration', () => {
  beforeEach(async () => {
    // Reset all stores before each test
    await resetAllStores();
    jest.clearAllMocks();
  });

  it('should initialize all stores with correct initial state', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Auth store initial state
    expect(authResult.current.user).toBeNull();
    expect(authResult.current.isAuthenticated).toBe(false);
    expect(authResult.current.isLoading).toBe(true);
    expect(authResult.current.error).toBeNull();

    // Feature flag store initial state
    expect(flagResult.current.flags).toBeDefined();
    expect(flagResult.current.isLoading).toBe(true);
    expect(flagResult.current.flags.USE_AUTH_STORE).toBe(false);
    expect(flagResult.current.flags.USE_FEATURE_FLAG_STORE).toBe(false);
    expect(flagResult.current.flags.USE_THEME_STORE).toBe(false);

    // Theme store initial state
    expect(themeResult.current.themeMode).toBe('system');
    expect(themeResult.current.userMode).toBe('resident');
    expect(themeResult.current.colors).toBeDefined();
    expect(themeResult.current.followSystemTheme).toBe(true);
  });

  it('should handle migration flag changes correctly', async () => {
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());

    // Enable AuthStore migration
    await act(async () => {
      await flagResult.current.enableFeature('USE_AUTH_STORE');
    });

    expect(flagResult.current.isFeatureEnabled('USE_AUTH_STORE')).toBe(true);

    // Enable multiple migration flags
    await act(async () => {
      await flagResult.current.updateFlags({
        USE_AUTH_STORE: true,
        USE_THEME_STORE: true,
        USE_FEATURE_FLAG_STORE: true,
      });
    });

    expect(flagResult.current.isFeatureEnabled('USE_AUTH_STORE')).toBe(true);
    expect(flagResult.current.isFeatureEnabled('USE_THEME_STORE')).toBe(true);
    expect(flagResult.current.isFeatureEnabled('USE_FEATURE_FLAG_STORE')).toBe(true);
  });

  it('should support gradual rollout patterns', async () => {
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());

    // Week 1: Enable AuthStore only
    await act(async () => {
      await flagResult.current.enableMigrationFlags(['USE_AUTH_STORE']);
    });

    let migrationStatus = flagResult.current.getMigrationStatus();
    expect(migrationStatus.USE_AUTH_STORE).toBe(true);
    expect(migrationStatus.USE_THEME_STORE).toBe(false);

    // Week 2: Add FeatureFlagStore
    await act(async () => {
      await flagResult.current.enableMigrationFlags(['USE_FEATURE_FLAG_STORE']);
    });

    migrationStatus = flagResult.current.getMigrationStatus();
    expect(migrationStatus.USE_AUTH_STORE).toBe(true);
    expect(migrationStatus.USE_FEATURE_FLAG_STORE).toBe(true);

    // Week 3: Add ThemeStore
    await act(async () => {
      await flagResult.current.enableMigrationFlags(['USE_THEME_STORE']);
    });

    migrationStatus = flagResult.current.getMigrationStatus();
    expect(migrationStatus.USE_THEME_STORE).toBe(true);
  });

  it('should handle theme mode changes correctly', () => {
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Test theme mode changes
    act(() => {
      themeResult.current.setThemeMode('dark');
    });

    expect(themeResult.current.themeMode).toBe('dark');
    expect(themeResult.current.followSystemTheme).toBe(false);

    // Test user mode changes
    act(() => {
      themeResult.current.setUserMode('admin');
    });

    expect(themeResult.current.userMode).toBe('admin');
    expect(themeResult.current.adminThemeEnabled).toBe(true);

    // Test theme toggle
    act(() => {
      themeResult.current.toggleTheme();
    });

    expect(themeResult.current.themeMode).toBe('light');
  });

  it('should provide status color utilities', () => {
    const { result: themeResult } = renderHook(() => useThemeStore());

    const successColor = themeResult.current.getStatusColor('success');
    const errorColor = themeResult.current.getStatusColor('error');
    const unknownColor = themeResult.current.getStatusColor('unknown_status');

    expect(successColor).toBeDefined();
    expect(successColor).toMatch(/^#[0-9a-f]{6}$/i); // Valid hex color
    expect(errorColor).toBeDefined();
    expect(errorColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(unknownColor).toBeDefined();
  });

  it('should support feature flag groups', async () => {
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());

    // Test getting a feature group
    const migrationGroup = flagResult.current.getFeatureGroup('migration');
    expect(migrationGroup).toBeDefined();
    expect(migrationGroup.USE_AUTH_STORE).toBe(false);

    // Test enabling a feature group
    await act(async () => {
      await flagResult.current.enableFeatureGroup('migration');
    });

    const updatedMigrationGroup = flagResult.current.getFeatureGroup('migration');
    expect(updatedMigrationGroup.USE_AUTH_STORE).toBe(true);
    expect(updatedMigrationGroup.USE_THEME_STORE).toBe(true);

    // Test disabling a feature group
    await act(async () => {
      await flagResult.current.disableFeatureGroup('migration');
    });

    const disabledMigrationGroup = flagResult.current.getFeatureGroup('migration');
    expect(disabledMigrationGroup.USE_AUTH_STORE).toBe(false);
  });

  it('should handle store reset functionality', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Modify some state
    act(() => {
      authResult.current.setError('Test error');
      themeResult.current.setThemeMode('dark');
    });

    expect(authResult.current.error).toBe('Test error');
    expect(themeResult.current.themeMode).toBe('dark');

    // Reset stores
    act(() => {
      authResult.current.reset();
      themeResult.current.reset();
    });

    expect(authResult.current.error).toBeNull();
    expect(themeResult.current.themeMode).toBe('system');
  });

  it('should support custom theme colors', () => {
    const { result: themeResult } = renderHook(() => useThemeStore());

    const customColors = {
      primary: '#ff0000',
      secondary: '#00ff00',
    };

    act(() => {
      themeResult.current.updateCustomColors(customColors);
    });

    expect(themeResult.current.hasCustomTheme).toBe(true);
    expect(themeResult.current.colors.primary).toBe('#ff0000');
    expect(themeResult.current.colors.secondary).toBe('#00ff00');

    // Reset custom colors
    act(() => {
      themeResult.current.resetCustomColors();
    });

    expect(themeResult.current.hasCustomTheme).toBe(false);
    expect(themeResult.current.colors.primary).not.toBe('#ff0000');
  });

  it('should handle high contrast mode', () => {
    const { result: themeResult } = renderHook(() => useThemeStore());

    act(() => {
      themeResult.current.setHighContrastMode(true);
    });

    expect(themeResult.current.highContrastMode).toBe(true);
    // High contrast mode should modify colors
    expect(themeResult.current.colors.textPrimary).toBeDefined();

    act(() => {
      themeResult.current.setHighContrastMode(false);
    });

    expect(themeResult.current.highContrastMode).toBe(false);
  });

  it('should persist important state', async () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Set some state that should persist
    await act(async () => {
      await flagResult.current.enableFeature('USE_AUTH_STORE');
    });

    act(() => {
      themeResult.current.setThemeMode('dark');
      themeResult.current.setUserMode('admin');
    });

    // Verify state is set
    expect(flagResult.current.isFeatureEnabled('USE_AUTH_STORE')).toBe(true);
    expect(themeResult.current.themeMode).toBe('dark');
    expect(themeResult.current.userMode).toBe('admin');

    // Note: In a real test, we would test actual persistence by 
    // simulating app restart, but that's complex in unit tests
  });

  it('should handle errors gracefully', async () => {
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());

    // Test error handling in feature flag operations
    // Note: We'd need to mock failures to test error cases properly
    expect(flagResult.current.error).toBeNull();

    // Verify error clearing works
    act(() => {
      flagResult.current.setError('Test error');
    });

    expect(flagResult.current.error).toBe('Test error');

    act(() => {
      flagResult.current.setError(null);
    });

    expect(flagResult.current.error).toBeNull();
  });
});

describe('Migration System Performance', () => {
  beforeEach(async () => {
    await resetAllStores();
  });

  it('should perform store operations efficiently', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());
    const { result: themeResult } = renderHook(() => useThemeStore());

    const startTime = performance.now();

    // Perform multiple operations
    act(() => {
      authResult.current.setLoading(true);
      authResult.current.setError('Test');
      authResult.current.clearError();
      
      flagResult.current.setLoading(true);
      flagResult.current.setLoading(false);
      
      themeResult.current.setThemeMode('dark');
      themeResult.current.toggleTheme();
      themeResult.current.setUserMode('admin');
      themeResult.current.toggleUserMode();
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // All operations should complete quickly (< 10ms for this simple test)
    expect(duration).toBeLessThan(10);
  });

  it('should handle multiple rapid state updates', () => {
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Perform rapid theme changes
    act(() => {
      for (let i = 0; i < 100; i++) {
        themeResult.current.toggleTheme();
      }
    });

    // Should end up in the expected state (100 toggles from 'system' = 'light' after even number of toggles)
    // The toggleTheme function switches between 'light' and 'dark', starting from 'system' becomes 'light'
    expect(themeResult.current.themeMode).toBe('light');
  });
});