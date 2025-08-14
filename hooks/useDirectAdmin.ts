// Direct admin hook using only Zustand stores (no Context dependency)
import { 
  useAdminStore, 
  useAdminUser, 
  useAdminLoading, 
  useAdminError, 
  useAdminAnalytics, 
  useAdminSettings, 
  useAdminManagementItems, 
  useAdminActions 
} from '@/stores/slices/adminStore';
import { useSocietyStore } from '@/stores/slices/societyStore';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useMemo, useCallback } from 'react';

/**
 * Direct admin hook that uses stores directly without Context dependencies
 * This replaces useAdminMigration to avoid circular dependencies during initialization
 */
export const useDirectAdmin = () => {
  // Get admin store state
  const adminUser = useAdminUser();
  const loading = useAdminLoading();
  const error = useAdminError();
  const analytics = useAdminAnalytics();
  const settings = useAdminSettings();
  const societyManagementItems = useAdminManagementItems();
  
  // Get admin actions with stable callbacks
  const {
    loadDashboard,
    loadAnalytics,
    manageSociety,
    approveSociety,
    suspendSociety,
    activateSociety,
    updateManagementItem,
    setSearchQuery,
    setManagementFilter,
  } = useAdminActions();

  // Fixed: Get actions without creating new callbacks on every render
  const adminStoreActions = useMemo(() => {
    const state = useAdminStore.getState();
    return {
      loadAdminProfile: state.loadAdminProfile,
      updateAdminProfile: state.updateAdminProfile,
      updateAdminSettings: state.updateAdminSettings,
      loadManagementItems: state.loadManagementItems,
      bulkManageSocieties: state.bulkManageSocieties,
      assignManagementItems: state.assignManagementItems,
      resolveManagementItem: state.resolveManagementItem,
      closeManagementItem: state.closeManagementItem,
      getFilteredManagementItems: state.getFilteredManagementItems,
      getPendingApprovalsCount: state.getPendingApprovalsCount,
      getHighPriorityItemsCount: state.getHighPriorityItemsCount,
      getAssignedItemsCount: state.getAssignedItemsCount,
      selectManagementItems: state.selectManagementItems,
      toggleManagementItemSelection: state.toggleManagementItemSelection,
      selectAllManagementItems: state.selectAllManagementItems,
      clearSelection: state.clearSelection,
      clearFilters: state.clearFilters,
      enableMaintenanceMode: state.enableMaintenanceMode,
      disableMaintenanceMode: state.disableMaintenanceMode,
      refreshSystemCache: state.refreshSystemCache,
      setDashboardView: state.setDashboardView,
      setAnalyticsTimeRange: state.setAnalyticsTimeRange,
    };
  }, []);

  // Get UI state
  const dashboardView = useAdminStore((state) => state.dashboardView);
  const analyticsTimeRange = useAdminStore((state) => state.analyticsTimeRange);
  
  // Get search and filter state
  const searchQuery = useAdminStore((state) => state.searchQuery);
  const managementFilter = useAdminStore((state) => state.managementFilter);
  const selectedManagementItems = useAdminStore((state) => state.selectedManagementItems);

  // Get society data
  const activeSociety = useSocietyStore((state) => state.currentSociety);
  const availableSocieties = useSocietyStore((state) => state.societies);
  const currentMode = 'admin'; // Fixed: Direct mode setting for admin

  // Permission checking function
  const checkPermission = useCallback((permission: string, action: string) => {
    if (!adminUser) return false;
    
    // Super admin has all permissions
    if (adminUser?.role === 'super_admin') return true;
    
    // Check specific permissions
    const userPermission = adminUser?.permissions?.find(p => p?.resource === permission);
    if (!userPermission) return false;
    
    return userPermission?.actions?.includes(action) || userPermission?.actions?.includes('manage') || false;
  }, [adminUser]);

  // Mock escalation path function (replace with actual implementation)
  const getEscalationPath = useCallback((issue: string) => {
    if (!adminUser) return [];
    
    // Simple escalation logic based on current role
    const escalationMap: Record<string, string[]> = {
      'maintenance_admin': ['community_manager', 'super_admin'],
      'financial_manager': ['community_manager', 'super_admin'],
      'security_admin': ['community_manager', 'super_admin'],
      'community_manager': ['super_admin'],
      'super_admin': [], // No escalation needed
    };
    
    return escalationMap[adminUser?.role || 'maintenance_admin'] || [];
  }, [adminUser]);

  // Memoize the return object to prevent infinite re-renders
  return useMemo(() => ({
    // Core data
    adminUser,
    analytics,
    settings,
    societyManagementItems,
    activeSociety,
    availableSocieties,
    
    // State
    loading,
    error,
    currentMode,
    
    // UI state
    dashboardView,
    analyticsTimeRange,
    
    // Basic operations
    loadDashboard,
    loadAdminProfile: adminStoreActions.loadAdminProfile,
    updateAdminProfile: adminStoreActions.updateAdminProfile,
    manageSociety,
    updateAdminSettings: adminStoreActions.updateAdminSettings,
    checkPermission,
    
    // Additional store operations
    loadAnalytics,
    loadManagementItems: adminStoreActions.loadManagementItems,
    approveSociety,
    suspendSociety,
    activateSociety,
    bulkManageSocieties: adminStoreActions.bulkManageSocieties,
    assignManagementItems: adminStoreActions.assignManagementItems,
    updateManagementItem,
    resolveManagementItem: adminStoreActions.resolveManagementItem,
    closeManagementItem: adminStoreActions.closeManagementItem,
    
    // UI state management
    setDashboardView: adminStoreActions.setDashboardView,
    setAnalyticsTimeRange: adminStoreActions.setAnalyticsTimeRange,
    setSearchQuery,
    setManagementFilter,
    
    // Search and filter state
    searchQuery,
    managementFilter,
    selectedManagementItems,
    
    // Additional methods
    getFilteredManagementItems: adminStoreActions.getFilteredManagementItems,
    getPendingApprovalsCount: adminStoreActions.getPendingApprovalsCount,
    getHighPriorityItemsCount: adminStoreActions.getHighPriorityItemsCount,
    getAssignedItemsCount: adminStoreActions.getAssignedItemsCount,
    selectManagementItems: adminStoreActions.selectManagementItems,
    toggleManagementItemSelection: adminStoreActions.toggleManagementItemSelection,
    selectAllManagementItems: adminStoreActions.selectAllManagementItems,
    clearSelection: adminStoreActions.clearSelection,
    clearFilters: adminStoreActions.clearFilters,
    enableMaintenanceMode: adminStoreActions.enableMaintenanceMode,
    disableMaintenanceMode: adminStoreActions.disableMaintenanceMode,
    refreshSystemCache: adminStoreActions.refreshSystemCache,
    getEscalationPath,
    
    // Metadata
    isUsingStore: true,
    migrationStatus: 'active' as const,
  }), [
    adminUser,
    analytics,
    settings,
    societyManagementItems,
    activeSociety,
    availableSocieties,
    loading,
    error,
    currentMode,
    dashboardView,
    analyticsTimeRange,
    loadDashboard,
    manageSociety,
    checkPermission,
    loadAnalytics,
    approveSociety,
    suspendSociety,
    activateSociety,
    updateManagementItem,
    setSearchQuery,
    setManagementFilter,
    searchQuery,
    managementFilter,
    selectedManagementItems,
    getEscalationPath,
    adminStoreActions, // Single reference to all admin store actions
  ]);
};

// Stable selector for admin store feature flag (prevents displayName errors)
const adminStoreFlagSelector = (state: any) => state.flags.USE_ADMIN_STORE;
adminStoreFlagSelector.displayName = 'adminStoreFlagSelector';

/**
 * Hook to check if admin store is active
 */
export const useIsAdminStoreActive = (): boolean => {
  return useFeatureFlagStore(adminStoreFlagSelector);
};

/**
 * Emergency fallback that provides basic admin state
 */
export const useAdminFallback = () => {
  return {
    adminUser: null,
    analytics: null,
    settings: null,
    societyManagementItems: [],
    activeSociety: null,
    loading: false,
    error: null,
    currentMode: 'resident' as const,
    dashboardView: 'overview' as const,
    analyticsTimeRange: '30d' as const,
    loadDashboard: async () => {},
    loadAdminProfile: async () => {},
    updateAdminProfile: async () => {},
    manageSociety: async () => {},
    updateAdminSettings: async () => {},
    checkPermission: () => false,
    loadAnalytics: async () => {},
    loadManagementItems: async () => {},
    approveSociety: async () => {},
    suspendSociety: async () => {},
    activateSociety: async () => {},
    bulkManageSocieties: async () => {},
    assignManagementItems: async () => {},
    updateManagementItem: async () => {},
    resolveManagementItem: async () => {},
    closeManagementItem: async () => {},
    setDashboardView: () => {},
    setAnalyticsTimeRange: () => {},
    setSearchQuery: () => {},
    setManagementFilter: () => {},
    isUsingStore: false,
    migrationStatus: 'fallback',
  };
};