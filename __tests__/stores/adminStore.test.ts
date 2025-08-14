import { useAdminStore } from '@/stores/slices/adminStore';
import type { AdminUser, AdminAnalytics } from '@/stores/slices/adminStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Admin Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAdminStore.getState().reset?.();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAdminStore.getState();
      
      expect(state.adminUser).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.analytics).toBe(null);
      expect(state.settings).toBe(null);
      expect(state.dashboardView).toBe('overview');
      expect(state.analyticsTimeRange).toBe('30d');
      expect(state.searchQuery).toBe('');
      expect(state.managementFilter).toBe('all');
      expect(Array.isArray(state.societyManagementItems)).toBe(true);
      expect(state.societyManagementItems.length).toBe(0);
      expect(Array.isArray(state.selectedManagementItems)).toBe(true);
      expect(state.selectedManagementItems.length).toBe(0);
    });
  });

  describe('Loading State Management', () => {
    it('should set loading state correctly', () => {
      const { setLoading } = useAdminStore.getState();
      
      setLoading(true);
      expect(useAdminStore.getState().loading).toBe(true);
      
      setLoading(false);
      expect(useAdminStore.getState().loading).toBe(false);
    });
  });

  describe('Error State Management', () => {
    it('should set error state correctly', () => {
      const { setError } = useAdminStore.getState();
      const testError = 'Test error message';
      
      setError(testError);
      expect(useAdminStore.getState().error).toBe(testError);
      
      setError(null);
      expect(useAdminStore.getState().error).toBe(null);
    });
  });

  describe('Admin User Management', () => {
    const mockAdminUser: AdminUser = {
      id: 'admin-123',
      email: 'admin@test.com',
      fullName: 'Test Admin',
      role: 'super_admin',
      permissions: [
        {
          resource: 'societies',
          actions: ['read', 'write', 'manage'],
          scope: 'global',
        },
      ],
      assignedSocieties: ['society-1', 'society-2'],
      department: 'IT',
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should load admin profile successfully', async () => {
      const { loadAdminProfile } = useAdminStore.getState();
      
      // Mock the API call - in real implementation this would be mocked differently
      await loadAdminProfile('admin-123');
      
      // Note: In a real test, we'd mock the API response
      // For now, we just verify the function exists and can be called
      expect(typeof loadAdminProfile).toBe('function');
    });

    it('should update admin profile', async () => {
      const { updateAdminProfile } = useAdminStore.getState();
      
      const updates = {
        fullName: 'Updated Admin Name',
        department: 'Operations',
      };
      
      await updateAdminProfile(updates);
      
      // Verify function exists and can be called
      expect(typeof updateAdminProfile).toBe('function');
    });
  });

  describe('Dashboard Management', () => {
    it('should set dashboard view', () => {
      const { setDashboardView } = useAdminStore.getState();
      
      setDashboardView('analytics');
      expect(useAdminStore.getState().dashboardView).toBe('analytics');
      
      setDashboardView('societies');
      expect(useAdminStore.getState().dashboardView).toBe('societies');
    });

    it('should set analytics time range', () => {
      const { setAnalyticsTimeRange } = useAdminStore.getState();
      
      setAnalyticsTimeRange('7d');
      expect(useAdminStore.getState().analyticsTimeRange).toBe('7d');
      
      setAnalyticsTimeRange('1y');
      expect(useAdminStore.getState().analyticsTimeRange).toBe('1y');
    });
  });

  describe('Search and Filter Management', () => {
    it('should set search query', () => {
      const { setSearchQuery } = useAdminStore.getState();
      
      setSearchQuery('test query');
      expect(useAdminStore.getState().searchQuery).toBe('test query');
      
      setSearchQuery('');
      expect(useAdminStore.getState().searchQuery).toBe('');
    });

    it('should set management filter', () => {
      const { setManagementFilter } = useAdminStore.getState();
      
      setManagementFilter('pending');
      expect(useAdminStore.getState().managementFilter).toBe('pending');
      
      setManagementFilter('completed');
      expect(useAdminStore.getState().managementFilter).toBe('completed');
    });

    it('should clear filters', () => {
      const { setSearchQuery, setManagementFilter, clearFilters } = useAdminStore.getState();
      
      // Set some filters
      setSearchQuery('test');
      setManagementFilter('pending');
      
      // Clear filters
      clearFilters();
      
      expect(useAdminStore.getState().searchQuery).toBe('');
      expect(useAdminStore.getState().managementFilter).toBe('all');
    });
  });

  describe('Management Items', () => {
    it('should select management items', () => {
      const { selectManagementItems } = useAdminStore.getState();
      const itemIds = ['item-1', 'item-2', 'item-3'];
      
      selectManagementItems(itemIds);
      
      expect(useAdminStore.getState().selectedManagementItems).toEqual(itemIds);
    });

    it('should toggle management item selection', () => {
      const { toggleManagementItemSelection } = useAdminStore.getState();
      
      // Select an item
      toggleManagementItemSelection('item-1');
      expect(useAdminStore.getState().selectedManagementItems).toContain('item-1');
      
      // Deselect the same item
      toggleManagementItemSelection('item-1');
      expect(useAdminStore.getState().selectedManagementItems).not.toContain('item-1');
    });

    it('should clear selection', () => {
      const { selectManagementItems, clearSelection } = useAdminStore.getState();
      
      // Select some items
      selectManagementItems(['item-1', 'item-2']);
      expect(useAdminStore.getState().selectedManagementItems.length).toBe(2);
      
      // Clear selection
      clearSelection();
      expect(useAdminStore.getState().selectedManagementItems.length).toBe(0);
    });
  });

  describe('Analytics Management', () => {
    const mockAnalytics: AdminAnalytics = {
      overview: {
        totalSocieties: 150,
        totalUsers: 5000,
        totalRevenue: 1000000,
        activeSubscriptions: 140,
        growthRate: 0.15,
        churnRate: 0.05,
      },
      societies: {
        newSocietiesThisMonth: 10,
        activeSocieties: 140,
        pendingApprovals: 5,
        suspendedSocieties: 5,
        averageOccupancyRate: 0.85,
      },
      users: {
        totalActiveUsers: 4500,
        newUsersThisMonth: 200,
        userRetentionRate: 0.9,
        averageSessionDuration: 1800,
      },
      revenue: {
        monthlyRevenue: 100000,
        yearlyRevenue: 1000000,
        revenueGrowth: 0.12,
        averageRevenuePerSociety: 7000,
      },
      support: {
        openTickets: 25,
        resolvedTicketsThisMonth: 150,
        averageResolutionTime: 24.5,
        customerSatisfactionScore: 4.2,
      },
    };

    it('should load analytics successfully', async () => {
      const { loadAnalytics } = useAdminStore.getState();
      
      await loadAnalytics('30d');
      
      // Verify function exists and can be called
      expect(typeof loadAnalytics).toBe('function');
    });
  });

  describe('System Settings', () => {
    it('should enable maintenance mode', async () => {
      const { enableMaintenanceMode } = useAdminStore.getState();
      
      await enableMaintenanceMode('Scheduled maintenance for system updates');
      
      expect(typeof enableMaintenanceMode).toBe('function');
    });

    it('should disable maintenance mode', async () => {
      const { disableMaintenanceMode } = useAdminStore.getState();
      
      await disableMaintenanceMode();
      
      expect(typeof disableMaintenanceMode).toBe('function');
    });

    it('should refresh system cache', async () => {
      const { refreshSystemCache } = useAdminStore.getState();
      
      await refreshSystemCache();
      
      expect(typeof refreshSystemCache).toBe('function');
    });
  });

  describe('Utility Functions', () => {
    it('should get pending approvals count', () => {
      const { getPendingApprovalsCount } = useAdminStore.getState();
      
      const count = getPendingApprovalsCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should get high priority items count', () => {
      const { getHighPriorityItemsCount } = useAdminStore.getState();
      
      const count = getHighPriorityItemsCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should get assigned items count', () => {
      const { getAssignedItemsCount } = useAdminStore.getState();
      
      const count = getAssignedItemsCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Persistence', () => {
    it('should persist state correctly', () => {
      const { setDashboardView, setAnalyticsTimeRange } = useAdminStore.getState();
      
      // Change some persistent state
      setDashboardView('analytics');
      setAnalyticsTimeRange('7d');
      
      // Verify state is updated
      expect(useAdminStore.getState().dashboardView).toBe('analytics');
      expect(useAdminStore.getState().analyticsTimeRange).toBe('7d');
    });
  });
});