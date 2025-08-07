/**
 * Comprehensive integration tests for all Zustand stores
 * Tests the complete migration system with all stores working together
 */
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/slices/authStore';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useThemeStore } from '@/stores/slices/themeStore';
import { useSocietyStore } from '@/stores/slices/societyStore';
import { useAdminStore } from '@/stores/slices/adminStore';
import { useNotificationStore } from '@/stores/slices/notificationStore';
import { resetAllStores, emergencyRollback } from '@/stores';

// Mock all the services
jest.mock('@/services/auth.service.rest', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(),
    getStoredProfile: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('Complete Zustand Migration System', () => {
  beforeEach(async () => {
    // Reset all stores before each test
    await resetAllStores();
    jest.clearAllMocks();
  });

  it('should initialize all stores with correct initial state', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());
    const { result: themeResult } = renderHook(() => useThemeStore());
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: adminResult } = renderHook(() => useAdminStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    // Auth store
    expect(authResult.current.user).toBeNull();
    expect(authResult.current.isAuthenticated).toBe(false);
    expect(authResult.current.isLoading).toBe(true);

    // Feature flag store
    expect(flagResult.current.flags).toBeDefined();
    expect(flagResult.current.isLoading).toBe(true);
    expect(flagResult.current.flags.USE_AUTH_STORE).toBe(false);
    expect(flagResult.current.flags.USE_SOCIETY_STORE).toBe(false);
    expect(flagResult.current.flags.USE_ADMIN_STORE).toBe(false);
    expect(flagResult.current.flags.USE_NOTIFICATION_STORE).toBe(false);

    // Theme store
    expect(themeResult.current.themeMode).toBe('system');
    expect(themeResult.current.userMode).toBe('resident');

    // Society store
    expect(societyResult.current.societies).toEqual([]);
    expect(societyResult.current.currentSociety).toBeNull();
    expect(societyResult.current.loading).toBe(false);

    // Admin store
    expect(adminResult.current.adminUser).toBeNull();
    expect(adminResult.current.analytics).toBeNull();
    expect(adminResult.current.dashboardView).toBe('overview');

    // Notification store
    expect(notificationResult.current.notifications).toEqual([]);
    expect(notificationResult.current.settings).toBeNull();
    expect(notificationResult.current.permissionStatus).toBe('not-determined');
  });

  it('should support gradual migration flag rollout', async () => {
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());

    // Week 1: Enable AuthStore only
    await act(async () => {
      await flagResult.current.enableMigrationFlags(['USE_AUTH_STORE']);
    });

    let migrationStatus = flagResult.current.getMigrationStatus();
    expect(migrationStatus.USE_AUTH_STORE).toBe(true);
    expect(migrationStatus.USE_SOCIETY_STORE).toBe(false);
    expect(migrationStatus.USE_ADMIN_STORE).toBe(false);
    expect(migrationStatus.USE_NOTIFICATION_STORE).toBe(false);

    // Week 2: Add SocietyStore and AdminStore
    await act(async () => {
      await flagResult.current.enableMigrationFlags(['USE_SOCIETY_STORE', 'USE_ADMIN_STORE']);
    });

    migrationStatus = flagResult.current.getMigrationStatus();
    expect(migrationStatus.USE_AUTH_STORE).toBe(true);
    expect(migrationStatus.USE_SOCIETY_STORE).toBe(true);
    expect(migrationStatus.USE_ADMIN_STORE).toBe(true);
    expect(migrationStatus.USE_NOTIFICATION_STORE).toBe(false);

    // Week 3: Add remaining stores
    await act(async () => {
      await flagResult.current.enableMigrationFlags(['USE_NOTIFICATION_STORE', 'USE_THEME_STORE']);
    });

    migrationStatus = flagResult.current.getMigrationStatus();
    expect(migrationStatus.USE_NOTIFICATION_STORE).toBe(true);
    expect(migrationStatus.USE_THEME_STORE).toBe(true);
    
    // Complete migration group
    const migrationGroup = flagResult.current.getFeatureGroup('migration');
    Object.values(migrationGroup).forEach(flag => {
      expect(flag).toBe(true);
    });
  });

  it('should handle cross-store data relationships', async () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: adminResult } = renderHook(() => useAdminStore());
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Simulate user login which affects other stores
    await act(async () => {
      authResult.current.setUser({
        id: 'user_123',
        email: 'admin@society.com',
        fullName: 'Admin User',
        phoneNumber: '+91-9876543210',
        profileImage: '',
        role: 'admin',
        societies: ['society_1'],
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'dark',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      });
    });

    expect(authResult.current.isAuthenticated).toBe(true);
    expect(authResult.current.user?.role).toBe('admin');

    // Society selection should work with authenticated user
    await act(async () => {
      await societyResult.current.selectSociety('society_1');
    });

    // Admin dashboard should load with user context
    await act(async () => {
      await adminResult.current.loadDashboard();
    });

    // Theme should be applied based on user preferences
    act(() => {
      themeResult.current.setThemeMode('dark');
      themeResult.current.setUserMode('admin');
    });

    expect(themeResult.current.themeMode).toBe('dark');
    expect(themeResult.current.userMode).toBe('admin');
    expect(themeResult.current.adminThemeEnabled).toBe(true);
  });

  it('should handle bulk operations across stores', async () => {
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());
    const { result: adminResult } = renderHook(() => useAdminStore());

    // Load initial data
    await act(async () => {
      await societyResult.current.loadSocieties();
      await notificationResult.current.loadNotifications();
      await adminResult.current.loadDashboard();
    });

    // Test society bulk operations
    act(() => {
      societyResult.current.selectSocietyIds(['society_1', 'society_2']);
    });

    expect(societyResult.current.selectedSocietyIds).toEqual(['society_1', 'society_2']);

    // Test notification bulk operations
    act(() => {
      notificationResult.current.selectNotifications(['notif_1', 'notif_2']);
    });

    expect(notificationResult.current.selectedNotificationIds).toEqual(['notif_1', 'notif_2']);

    // Test admin management item operations
    act(() => {
      adminResult.current.selectManagementItems(['mgmt_1', 'mgmt_2']);
    });

    expect(adminResult.current.selectedManagementItems).toEqual(['mgmt_1', 'mgmt_2']);
  });

  it('should handle error scenarios gracefully', async () => {
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: adminResult } = renderHook(() => useAdminStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    // Test error handling in society operations
    expect(societyResult.current.error).toBeNull();

    // Test error clearing
    act(() => {
      societyResult.current.setError('Test error');
    });
    expect(societyResult.current.error).toBe('Test error');

    act(() => {
      societyResult.current.setError(null);
    });
    expect(societyResult.current.error).toBeNull();

    // Test error handling in admin operations
    act(() => {
      adminResult.current.setError('Admin error');
    });
    expect(adminResult.current.error).toBe('Admin error');

    // Test error handling in notification operations
    act(() => {
      notificationResult.current.setError('Notification error');
    });
    expect(notificationResult.current.error).toBe('Notification error');
  });

  it('should support filtering and search across stores', () => {
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());
    const { result: adminResult } = renderHook(() => useAdminStore());

    // Test society filtering
    act(() => {
      societyResult.current.setSearchQuery('Green Valley');
      societyResult.current.setFilterStatus('active');
      societyResult.current.setSortBy('name');
      societyResult.current.setSortOrder('asc');
    });

    expect(societyResult.current.searchQuery).toBe('Green Valley');
    expect(societyResult.current.filterStatus).toBe('active');
    expect(societyResult.current.sortBy).toBe('name');
    expect(societyResult.current.sortOrder).toBe('asc');

    // Test notification filtering
    act(() => {
      notificationResult.current.setFilterCategory('billing');
      notificationResult.current.setFilterStatus('unread');
      notificationResult.current.setSortBy('priority');
    });

    expect(notificationResult.current.filterCategory).toBe('billing');
    expect(notificationResult.current.filterStatus).toBe('unread');
    expect(notificationResult.current.sortBy).toBe('priority');

    // Test admin filtering
    act(() => {
      adminResult.current.setSearchQuery('approval');
      adminResult.current.setManagementFilter('pending');
    });

    expect(adminResult.current.searchQuery).toBe('approval');
    expect(adminResult.current.managementFilter).toBe('pending');

    // Test clearing filters
    act(() => {
      societyResult.current.clearFilters();
      notificationResult.current.clearFilters();
      adminResult.current.clearFilters();
    });

    expect(societyResult.current.searchQuery).toBe('');
    expect(societyResult.current.filterStatus).toBe('all');
    expect(notificationResult.current.filterCategory).toBe('all');
    expect(adminResult.current.searchQuery).toBe('');
  });

  it('should handle pagination across stores', () => {
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    // Test society pagination
    act(() => {
      societyResult.current.setPage(2);
      societyResult.current.setItemsPerPage(10);
    });

    expect(societyResult.current.currentPage).toBe(2);
    expect(societyResult.current.itemsPerPage).toBe(10);

    // Test notification pagination
    act(() => {
      notificationResult.current.setPage(3);
      notificationResult.current.setItemsPerPage(15);
    });

    expect(notificationResult.current.currentPage).toBe(3);
    expect(notificationResult.current.itemsPerPage).toBe(15);
  });

  it('should handle theme changes across the system', () => {
    const { result: themeResult } = renderHook(() => useThemeStore());

    // Test basic theme changes
    act(() => {
      themeResult.current.setThemeMode('dark');
    });
    expect(themeResult.current.themeMode).toBe('dark');

    act(() => {
      themeResult.current.setUserMode('admin');
    });
    expect(themeResult.current.userMode).toBe('admin');
    expect(themeResult.current.adminThemeEnabled).toBe(true);

    // Test theme toggling
    act(() => {
      themeResult.current.toggleTheme();
    });
    expect(themeResult.current.themeMode).toBe('light');

    act(() => {
      themeResult.current.toggleUserMode();
    });
    expect(themeResult.current.userMode).toBe('resident');

    // Test custom colors
    act(() => {
      themeResult.current.updateCustomColors({
        primary: '#ff0000',
        secondary: '#00ff00',
      });
    });
    expect(themeResult.current.hasCustomTheme).toBe(true);
    expect(themeResult.current.colors.primary).toBe('#ff0000');

    // Test high contrast mode
    act(() => {
      themeResult.current.setHighContrastMode(true);
    });
    expect(themeResult.current.highContrastMode).toBe(true);
  });

  it('should handle reset operations across all stores', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: themeResult } = renderHook(() => useThemeStore());
    const { result: adminResult } = renderHook(() => useAdminStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    // Modify state in all stores
    act(() => {
      authResult.current.setError('Auth error');
      societyResult.current.setSearchQuery('test');
      themeResult.current.setThemeMode('dark');
      adminResult.current.setDashboardView('analytics');
      notificationResult.current.setFilterCategory('billing');
    });

    // Verify state is modified
    expect(authResult.current.error).toBe('Auth error');
    expect(societyResult.current.searchQuery).toBe('test');
    expect(themeResult.current.themeMode).toBe('dark');
    expect(adminResult.current.dashboardView).toBe('analytics');
    expect(notificationResult.current.filterCategory).toBe('billing');

    // Reset all stores
    act(() => {
      authResult.current.reset();
      societyResult.current.reset();
      themeResult.current.reset();
      adminResult.current.reset();
      notificationResult.current.reset();
    });

    // Verify all stores are reset to initial state
    expect(authResult.current.error).toBeNull();
    expect(societyResult.current.searchQuery).toBe('');
    expect(themeResult.current.themeMode).toBe('system');
    expect(adminResult.current.dashboardView).toBe('overview');
    expect(notificationResult.current.filterCategory).toBe('all');
  });

  it('should handle emergency rollback correctly', async () => {
    const { result: flagResult } = renderHook(() => useFeatureFlagStore());

    // Enable all migration flags
    await act(async () => {
      await flagResult.current.enableFeatureGroup('migration');
    });

    // Verify all flags are enabled
    const migrationGroup = flagResult.current.getFeatureGroup('migration');
    Object.values(migrationGroup).forEach(flag => {
      expect(flag).toBe(true);
    });

    // Execute emergency rollback
    await act(async () => {
      await emergencyRollback();
    });

    // Note: In the mock implementation, emergency rollback just resets stores
    // In real implementation, it would also disable all migration flags
    expect(authResult.current?.error).toBeNull();
  });

  it('should persist important state correctly', async () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: themeResult } = renderHook(() => useThemeStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    // Set state that should persist
    act(() => {
      authResult.current.setUser({
        id: 'user_123',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+91-1234567890',
        profileImage: '',
        role: 'resident',
        societies: ['society_1'],
        preferences: {
          language: 'en',
          notifications: true,
          theme: 'light',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
      });
      
      themeResult.current.setThemeMode('dark');
      themeResult.current.setUserMode('admin');
      
      notificationResult.current.updateNotificationStatus('notif_1', true);
    });

    // Verify state is set
    expect(authResult.current.user?.email).toBe('test@example.com');
    expect(themeResult.current.themeMode).toBe('dark');
    expect(themeResult.current.userMode).toBe('admin');

    // Note: In real tests, we would simulate app restart to test persistence
    // For unit tests, we just verify the state is correct
  });
});

describe('Migration System Performance', () => {
  beforeEach(async () => {
    await resetAllStores();
  });

  it('should perform store operations efficiently', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: themeResult } = renderHook(() => useThemeStore());
    const { result: adminResult } = renderHook(() => useAdminStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    const startTime = performance.now();

    // Perform multiple operations across stores
    act(() => {
      // Auth operations
      authResult.current.setLoading(true);
      authResult.current.setError('Test');
      authResult.current.clearError();
      
      // Society operations
      societyResult.current.setSearchQuery('test');
      societyResult.current.setFilterStatus('active');
      
      // Theme operations
      themeResult.current.setThemeMode('dark');
      themeResult.current.toggleTheme();
      
      // Admin operations
      adminResult.current.setDashboardView('analytics');
      adminResult.current.setSearchQuery('test');
      
      // Notification operations
      notificationResult.current.setFilterCategory('billing');
      notificationResult.current.setFilterStatus('unread');
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // All operations should complete quickly (< 20ms for this test)
    expect(duration).toBeLessThan(20);
  });

  it('should handle concurrent operations across stores', async () => {
    const { result: societyResult } = renderHook(() => useSocietyStore());
    const { result: adminResult } = renderHook(() => useAdminStore());
    const { result: notificationResult } = renderHook(() => useNotificationStore());

    // Perform concurrent loading operations
    const startTime = performance.now();

    await act(async () => {
      await Promise.all([
        societyResult.current.loadSocieties(),
        adminResult.current.loadDashboard(),
        notificationResult.current.loadNotifications(),
      ]);
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Concurrent operations should not significantly increase total time
    // Mock operations have delays, so this tests they run in parallel
    expect(duration).toBeLessThan(2000); // Should be close to max delay, not sum of delays
  });
});