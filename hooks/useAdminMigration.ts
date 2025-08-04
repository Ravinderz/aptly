/**
 * Migration hook for gradual transition from Admin contexts to AdminStore
 * 
 * Provides seamless interface compatibility between Context and Store implementations
 * with feature flag controlled migration support.
 */
import { useAdminStore, type AdminUser, type AdminAnalytics, type AdminSettings, type AdminAction, type SocietyManagementItem } from '@/stores/slices/adminStore';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

// Context interface (based on expected AdminContext structure)
interface AdminContextType {
  // Core data
  adminUser: AdminUser | null;
  analytics: AdminAnalytics | null;
  settings: AdminSettings | null;
  societyManagementItems: SocietyManagementItem[];
  
  // State
  loading: boolean;
  error: string | null;
  
  // Basic operations
  loadDashboard: () => Promise<void>;
  loadAdminProfile: () => Promise<void>;
  updateAdminProfile: (updates: Partial<AdminUser>) => Promise<void>;
  manageSociety: (societyId: string, action: AdminAction) => Promise<void>;
  updateAdminSettings: (settings: Partial<AdminSettings>) => Promise<void>;
}

/**
 * Migration hook that provides admin functionality
 * Switches between Context and Store based on feature flag
 */
export const useAdminMigration = (): AdminContextType & {
  // Additional store-only methods
  loadAnalytics?: (timeRange?: '7d' | '30d' | '90d' | '1y') => Promise<void>;
  loadManagementItems?: () => Promise<void>;
  approveSociety?: (societyId: string, reason?: string) => Promise<void>;
  suspendSociety?: (societyId: string, reason: string) => Promise<void>;
  activateSociety?: (societyId: string, reason?: string) => Promise<void>;
  bulkManageSocieties?: (societyIds: string[], action: Omit<AdminAction, 'id' | 'targetId' | 'performedAt'>) => Promise<void>;
  assignManagementItems?: (itemIds: string[], assignedTo: string) => Promise<void>;
  updateManagementItem?: (itemId: string, updates: Partial<SocietyManagementItem>) => Promise<void>;
  resolveManagementItem?: (itemId: string, resolution: string) => Promise<void>;
  closeManagementItem?: (itemId: string) => Promise<void>;
  
  // UI state management
  dashboardView?: 'overview' | 'societies' | 'analytics' | 'support';
  analyticsTimeRange?: '7d' | '30d' | '90d' | '1y';
  setDashboardView?: (view: 'overview' | 'societies' | 'analytics' | 'support') => void;
  setAnalyticsTimeRange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  
  // Search and filtering
  searchQuery?: string;
  managementFilter?: 'all' | 'pending' | 'in_progress' | 'high_priority';
  setSearchQuery?: (query: string) => void;
  setManagementFilter?: (filter: 'all' | 'pending' | 'in_progress' | 'high_priority') => void;
  clearFilters?: () => void;
  
  // Selection management
  selectedManagementItems?: string[];
  selectManagementItems?: (ids: string[]) => void;
  toggleManagementItemSelection?: (id: string) => void;
  selectAllManagementItems?: () => void;
  clearSelection?: () => void;
  
  // Utility methods
  getFilteredManagementItems?: () => SocietyManagementItem[];
  getPendingApprovalsCount?: () => number;
  getHighPriorityItemsCount?: () => number;
  getAssignedItemsCount?: (adminId: string) => number;
  
  // System operations
  enableMaintenanceMode?: (reason: string) => Promise<void>;
  disableMaintenanceMode?: () => Promise<void>;
  refreshSystemCache?: () => Promise<void>;
} => {
  const { isFeatureEnabled } = useFeatureFlags();
  const useStore = isFeatureEnabled('USE_ADMIN_STORE' as any);
  
  const adminStore = useAdminStore();
  
  if (useStore) {
    // Return full store functionality
    return {
      // Core data (Context-compatible)
      adminUser: adminStore.adminUser,
      analytics: adminStore.analytics,
      settings: adminStore.settings,
      societyManagementItems: adminStore.societyManagementItems,
      
      // State
      loading: adminStore.loading,
      error: adminStore.error,
      
      // Basic operations (Context-compatible)
      loadDashboard: adminStore.loadDashboard,
      loadAdminProfile: adminStore.loadAdminProfile,
      updateAdminProfile: adminStore.updateAdminProfile,
      manageSociety: adminStore.manageSociety,
      updateAdminSettings: adminStore.updateAdminSettings,
      
      // Store-only methods
      loadAnalytics: adminStore.loadAnalytics,
      loadManagementItems: adminStore.loadManagementItems,
      approveSociety: adminStore.approveSociety,
      suspendSociety: adminStore.suspendSociety,
      activateSociety: adminStore.activateSociety,
      bulkManageSocieties: adminStore.bulkManageSocieties,
      assignManagementItems: adminStore.assignManagementItems,
      updateManagementItem: adminStore.updateManagementItem,
      resolveManagementItem: adminStore.resolveManagementItem,
      closeManagementItem: adminStore.closeManagementItem,
      
      // UI state management
      dashboardView: adminStore.dashboardView,
      analyticsTimeRange: adminStore.analyticsTimeRange,
      setDashboardView: adminStore.setDashboardView,
      setAnalyticsTimeRange: adminStore.setAnalyticsTimeRange,
      
      // Search and filtering
      searchQuery: adminStore.searchQuery,
      managementFilter: adminStore.managementFilter,
      setSearchQuery: adminStore.setSearchQuery,
      setManagementFilter: adminStore.setManagementFilter,
      clearFilters: adminStore.clearFilters,
      
      // Selection management
      selectedManagementItems: adminStore.selectedManagementItems,
      selectManagementItems: adminStore.selectManagementItems,
      toggleManagementItemSelection: adminStore.toggleManagementItemSelection,
      selectAllManagementItems: adminStore.selectAllManagementItems,
      clearSelection: adminStore.clearSelection,
      
      // Utility methods
      getFilteredManagementItems: adminStore.getFilteredManagementItems,
      getPendingApprovalsCount: adminStore.getPendingApprovalsCount,
      getHighPriorityItemsCount: adminStore.getHighPriorityItemsCount,
      getAssignedItemsCount: adminStore.getAssignedItemsCount,
      
      // System operations
      enableMaintenanceMode: adminStore.enableMaintenanceMode,
      disableMaintenanceMode: adminStore.disableMaintenanceMode,
      refreshSystemCache: adminStore.refreshSystemCache,
    };
  }
  
  // Return fallback implementation (Context would be used here in real app)
  // For now, returning a basic mock implementation
  return {
    // Core data
    adminUser: null,
    analytics: null,
    settings: null,
    societyManagementItems: [],
    
    // State
    loading: false,
    error: null,
    
    // Basic operations - stub implementations
    loadDashboard: async () => {
      console.warn('loadDashboard not available in fallback mode - enable USE_ADMIN_STORE');
    },
    
    loadAdminProfile: async () => {
      console.warn('loadAdminProfile not available in fallback mode - enable USE_ADMIN_STORE');
    },
    
    updateAdminProfile: async (updates: Partial<AdminUser>) => {
      console.warn('updateAdminProfile not available in fallback mode - enable USE_ADMIN_STORE');
    },
    
    manageSociety: async (societyId: string, action: AdminAction) => {
      console.warn('manageSociety not available in fallback mode - enable USE_ADMIN_STORE');
    },
    
    updateAdminSettings: async (settings: Partial<AdminSettings>) => {
      console.warn('updateAdminSettings not available in fallback mode - enable USE_ADMIN_STORE');
    },
    
    // Store-only method stubs
    loadAnalytics: async (timeRange?: '7d' | '30d' | '90d' | '1y') => {
      console.warn('loadAnalytics not available in fallback mode');
    },
    
    loadManagementItems: async () => {
      console.warn('loadManagementItems not available in fallback mode');
    },
    
    approveSociety: async (societyId: string, reason?: string) => {
      console.warn('approveSociety not available in fallback mode');
    },
    
    suspendSociety: async (societyId: string, reason: string) => {
      console.warn('suspendSociety not available in fallback mode');
    },
    
    activateSociety: async (societyId: string, reason?: string) => {
      console.warn('activateSociety not available in fallback mode');
    },
    
    bulkManageSocieties: async (societyIds: string[], action: Omit<AdminAction, 'id' | 'targetId' | 'performedAt'>) => {
      console.warn('bulkManageSocieties not available in fallback mode');
    },
    
    assignManagementItems: async (itemIds: string[], assignedTo: string) => {
      console.warn('assignManagementItems not available in fallback mode');
    },
    
    updateManagementItem: async (itemId: string, updates: Partial<SocietyManagementItem>) => {
      console.warn('updateManagementItem not available in fallback mode');
    },
    
    resolveManagementItem: async (itemId: string, resolution: string) => {
      console.warn('resolveManagementItem not available in fallback mode');
    },
    
    closeManagementItem: async (itemId: string) => {
      console.warn('closeManagementItem not available in fallback mode');
    },
    
    // UI state management stubs
    dashboardView: 'overview' as const,
    analyticsTimeRange: '30d' as const,
    setDashboardView: (view: 'overview' | 'societies' | 'analytics' | 'support') => {
      console.warn('setDashboardView not available in fallback mode');
    },
    
    setAnalyticsTimeRange: (range: '7d' | '30d' | '90d' | '1y') => {
      console.warn('setAnalyticsTimeRange not available in fallback mode');
    },
    
    // Search and filtering stubs
    searchQuery: '',
    managementFilter: 'all' as const,
    setSearchQuery: (query: string) => {
      console.warn('setSearchQuery not available in fallback mode');
    },
    
    setManagementFilter: (filter: 'all' | 'pending' | 'in_progress' | 'high_priority') => {
      console.warn('setManagementFilter not available in fallback mode');
    },
    
    clearFilters: () => {
      console.warn('clearFilters not available in fallback mode');
    },
    
    // Selection management stubs
    selectedManagementItems: [],
    selectManagementItems: (ids: string[]) => {
      console.warn('selectManagementItems not available in fallback mode');
    },
    
    toggleManagementItemSelection: (id: string) => {
      console.warn('toggleManagementItemSelection not available in fallback mode');
    },
    
    selectAllManagementItems: () => {
      console.warn('selectAllManagementItems not available in fallback mode');
    },
    
    clearSelection: () => {
      console.warn('clearSelection not available in fallback mode');
    },
    
    // Utility method stubs
    getFilteredManagementItems: () => {
      console.warn('getFilteredManagementItems not available in fallback mode');
      return [];
    },
    
    getPendingApprovalsCount: () => {
      console.warn('getPendingApprovalsCount not available in fallback mode');
      return 0;
    },
    
    getHighPriorityItemsCount: () => {
      console.warn('getHighPriorityItemsCount not available in fallback mode');
      return 0;
    },
    
    getAssignedItemsCount: (adminId: string) => {
      console.warn('getAssignedItemsCount not available in fallback mode');
      return 0;
    },
    
    // System operation stubs
    enableMaintenanceMode: async (reason: string) => {
      console.warn('enableMaintenanceMode not available in fallback mode');
    },
    
    disableMaintenanceMode: async () => {
      console.warn('disableMaintenanceMode not available in fallback mode');
    },
    
    refreshSystemCache: async () => {
      console.warn('refreshSystemCache not available in fallback mode');
    },
  };
};

/**
 * Hook to check if we're currently using the store implementation
 */
export const useIsAdminStoreActive = (): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled('USE_ADMIN_STORE' as any);
};

/**
 * Hook for admin dashboard utilities
 */
export const useAdminDashboard = () => {
  const admin = useAdminMigration();
  
  return {
    dashboardView: admin.dashboardView || 'overview',
    setDashboardView: admin.setDashboardView,
    analytics: admin.analytics,
    loading: admin.loading,
    error: admin.error,
    loadDashboard: admin.loadDashboard,
    loadAnalytics: admin.loadAnalytics,
    analyticsTimeRange: admin.analyticsTimeRange || '30d',
    setAnalyticsTimeRange: admin.setAnalyticsTimeRange,
    
    // Quick stats
    pendingApprovals: admin.getPendingApprovalsCount?.() || 0,
    highPriorityItems: admin.getHighPriorityItemsCount?.() || 0,
    totalSocieties: admin.analytics?.overview.totalSocieties || 0,
    totalUsers: admin.analytics?.overview.totalUsers || 0,
    monthlyRevenue: admin.analytics?.revenue.monthlyRevenue || 0,
  };
};

/**
 * Hook for society management operations
 */
export const useAdminSocietyManagement = () => {
  const admin = useAdminMigration();
  
  return {
    managementItems: admin.getFilteredManagementItems?.() || [],
    selectedItems: admin.selectedManagementItems || [],
    loading: admin.loading,
    error: admin.error,
    
    // Operations
    approveSociety: admin.approveSociety,
    suspendSociety: admin.suspendSociety,
    activateSociety: admin.activateSociety,
    updateManagementItem: admin.updateManagementItem,
    resolveManagementItem: admin.resolveManagementItem,
    closeManagementItem: admin.closeManagementItem,
    
    // Bulk operations
    bulkManageSocieties: admin.bulkManageSocieties,
    assignManagementItems: admin.assignManagementItems,
    
    // Selection
    selectItems: admin.selectManagementItems,
    toggleItemSelection: admin.toggleManagementItemSelection,
    selectAllItems: admin.selectAllManagementItems,
    clearSelection: admin.clearSelection,
    
    // Filtering
    searchQuery: admin.searchQuery || '',
    setSearchQuery: admin.setSearchQuery,
    managementFilter: admin.managementFilter || 'all',
    setManagementFilter: admin.setManagementFilter,
    clearFilters: admin.clearFilters,
  };
};

/**
 * Hook for admin profile and settings
 */
export const useAdminProfile = () => {
  const admin = useAdminMigration();
  
  return {
    adminUser: admin.adminUser,
    settings: admin.settings,
    loading: admin.loading,
    error: admin.error,
    
    // Operations
    loadProfile: admin.loadAdminProfile,
    updateProfile: admin.updateAdminProfile,
    updateSettings: admin.updateAdminSettings,
    
    // User info
    fullName: admin.adminUser?.fullName || '',
    email: admin.adminUser?.email || '',
    role: admin.adminUser?.role || 'admin',
    permissions: admin.adminUser?.permissions || [],
    assignedSocieties: admin.adminUser?.assignedSocieties || [],
    
    // Settings shortcuts
    notificationSettings: admin.settings?.notifications,
    securitySettings: admin.settings?.security,
    dashboardSettings: admin.settings?.dashboard,
    systemSettings: admin.settings?.system,
  };
};

/**
 * Hook for admin analytics
 */
export const useAdminAnalytics = () => {
  const admin = useAdminMigration();
  
  return {
    analytics: admin.analytics,
    loading: admin.loading,
    error: admin.error,
    timeRange: admin.analyticsTimeRange || '30d',
    
    // Operations
    loadAnalytics: admin.loadAnalytics,
    setTimeRange: admin.setAnalyticsTimeRange,
    
    // Quick access to metrics
    overview: admin.analytics?.overview,
    societies: admin.analytics?.societies,
    users: admin.analytics?.users,
    revenue: admin.analytics?.revenue,
    support: admin.analytics?.support,
    
    // Computed values
    growthRate: admin.analytics?.overview.growthRate || 0,
    churnRate: admin.analytics?.overview.churnRate || 0,
    occupancyRate: admin.analytics?.societies.averageOccupancyRate || 0,
    satisfactionScore: admin.analytics?.support.customerSatisfactionScore || 0,
  };
};

/**
 * Hook for system operations
 */
export const useAdminSystem = () => {
  const admin = useAdminMigration();
  
  return {
    settings: admin.settings?.system,
    loading: admin.loading,
    error: admin.error,
    
    // System operations
    enableMaintenanceMode: admin.enableMaintenanceMode,
    disableMaintenanceMode: admin.disableMaintenanceMode,
    refreshSystemCache: admin.refreshSystemCache,
    
    // System status
    maintenanceMode: admin.settings?.system?.maintenanceMode || false,
    debugMode: admin.settings?.system?.debugMode || false,
    logLevel: admin.settings?.system?.logLevel || 'info',
  };
};

/**
 * Development helper for admin migration validation
 */
export const useAdminMigrationValidator = () => {
  if (__DEV__) {
    const admin = useAdminMigration();
    const isStoreActive = useIsAdminStoreActive();
    
    // Validate essential methods are available
    const requiredMethods = [
      'loadDashboard', 'loadAdminProfile', 'updateAdminProfile', 
      'manageSociety', 'updateAdminSettings'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof admin[method as keyof typeof admin] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      console.warn('Admin migration validation: Missing methods:', missingMethods);
    }
    
    // Validate admin user structure when store is active
    if (isStoreActive && admin.adminUser) {
      const requiredUserFields = ['id', 'email', 'fullName', 'role', 'permissions'];
      const missingUserFields = requiredUserFields.filter(field => 
        !admin.adminUser![field as keyof AdminUser]
      );
      
      if (missingUserFields.length > 0) {
        console.warn('Admin migration validation: Missing admin user fields:', missingUserFields);
      }
    }
    
    // Validate analytics structure
    if (isStoreActive && admin.analytics) {
      const requiredAnalyticsFields = ['overview', 'societies', 'users', 'revenue', 'support'];
      const missingAnalyticsFields = requiredAnalyticsFields.filter(field => 
        !admin.analytics![field as keyof AdminAnalytics]
      );
      
      if (missingAnalyticsFields.length > 0) {
        console.warn('Admin migration validation: Missing analytics fields:', missingAnalyticsFields);
      }
    }
  }
};