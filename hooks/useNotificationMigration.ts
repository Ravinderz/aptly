/**
 * Migration hook for gradual transition from Notification contexts to NotificationStore
 * 
 * Provides seamless interface compatibility between Context and Store implementations
 * with feature flag controlled migration support.
 */
import { useNotificationStore, type Notification, type NotificationSettings, type NotificationStats } from '@/stores/slices/notificationStore';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

// Context interface (based on expected NotificationContext structure)
interface NotificationContextType {
  // Core data
  notifications: Notification[];
  settings: NotificationSettings | null;
  stats: NotificationStats | null;
  
  // State
  loading: boolean;
  error: string | null;
  unreadCount: number;
  
  // Basic operations
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  
  // Permission
  permissionStatus: 'granted' | 'denied' | 'not-determined' | 'provisional';
  requestPermission: () => Promise<'granted' | 'denied'>;
}

/**
 * Migration hook that provides notification functionality
 * Switches between Context and Store based on feature flag
 */
export const useNotificationMigration = (): NotificationContextType & {
  // Additional store-only methods
  loadNotificationStats?: () => Promise<void>;
  markAsUnread?: (notificationId: string) => Promise<void>;
  deleteAllNotifications?: () => Promise<void>;
  bulkMarkAsRead?: (notificationIds: string[]) => Promise<void>;
  bulkDeleteNotifications?: (notificationIds: string[]) => Promise<void>;
  updateCategoryPreference?: (category: keyof NotificationSettings['categories'], enabled: boolean) => Promise<void>;
  
  // Push token management
  registerPushToken?: (tokenInfo: any) => Promise<void>;
  deactivatePushToken?: (token: string) => Promise<void>;
  
  // Local notifications
  scheduleLocalNotification?: (schedule: any) => Promise<string>;
  cancelScheduledNotification?: (scheduleId: string) => Promise<void>;
  
  // Filtering and search
  filterCategory?: 'all' | Notification['category'];
  filterType?: 'all' | Notification['type'];
  filterStatus?: 'all' | 'read' | 'unread';
  setFilterCategory?: (category: 'all' | Notification['category']) => void;
  setFilterType?: (type: 'all' | Notification['type']) => void;
  setFilterStatus?: (status: 'all' | 'read' | 'unread') => void;
  clearFilters?: () => void;
  
  // Selection management
  selectedNotificationIds?: string[];
  selectNotifications?: (ids: string[]) => void;
  toggleNotificationSelection?: (id: string) => void;
  selectAllNotifications?: () => void;
  clearSelection?: () => void;
  
  // Pagination
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  setPage?: (page: number) => void;
  setItemsPerPage?: (count: number) => void;
  
  // Utility methods
  getFilteredNotifications?: () => Notification[];
  getPaginatedNotifications?: () => Notification[];
  getNotificationsByCategory?: (category: Notification['category']) => Notification[];
  getRecentNotifications?: (hours?: number) => Notification[];
  
  // Real-time updates
  addIncomingNotification?: (notification: Notification) => void;
  updateNotificationStatus?: (notificationId: string, isRead: boolean) => void;
} => {
  const { isFeatureEnabled } = useFeatureFlags();
  const useStore = isFeatureEnabled('USE_NOTIFICATION_STORE' as any);
  
  const notificationStore = useNotificationStore();
  
  if (useStore) {
    // Return full store functionality
    return {
      // Core data (Context-compatible)
      notifications: notificationStore.notifications,
      settings: notificationStore.settings,
      stats: notificationStore.stats,
      
      // State
      loading: notificationStore.loading,
      error: notificationStore.error,
      unreadCount: notificationStore.getUnreadCount(),
      
      // Permission
      permissionStatus: notificationStore.permissionStatus,
      
      // Basic operations (Context-compatible)
      loadNotifications: () => notificationStore.loadNotifications(),
      markAsRead: notificationStore.markAsRead,
      markAllAsRead: notificationStore.markAllAsRead,
      deleteNotification: notificationStore.deleteNotification,
      updateSettings: notificationStore.updateSettings,
      requestPermission: notificationStore.requestPermission,
      
      // Store-only methods
      loadNotificationStats: notificationStore.loadNotificationStats,
      markAsUnread: notificationStore.markAsUnread,
      deleteAllNotifications: notificationStore.deleteAllNotifications,
      bulkMarkAsRead: notificationStore.bulkMarkAsRead,
      bulkDeleteNotifications: notificationStore.bulkDeleteNotifications,
      updateCategoryPreference: notificationStore.updateCategoryPreference,
      
      // Push token management
      registerPushToken: notificationStore.registerPushToken,
      deactivatePushToken: notificationStore.deactivatePushToken,
      
      // Local notifications
      scheduleLocalNotification: notificationStore.scheduleLocalNotification,
      cancelScheduledNotification: notificationStore.cancelScheduledNotification,
      
      // Filtering and search
      filterCategory: notificationStore.filterCategory,
      filterType: notificationStore.filterType,
      filterStatus: notificationStore.filterStatus,
      setFilterCategory: notificationStore.setFilterCategory,
      setFilterType: notificationStore.setFilterType,
      setFilterStatus: notificationStore.setFilterStatus,
      clearFilters: notificationStore.clearFilters,
      
      // Selection management
      selectedNotificationIds: notificationStore.selectedNotificationIds,
      selectNotifications: notificationStore.selectNotifications,
      toggleNotificationSelection: notificationStore.toggleNotificationSelection,
      selectAllNotifications: notificationStore.selectAllNotifications,
      clearSelection: notificationStore.clearSelection,
      
      // Pagination
      currentPage: notificationStore.currentPage,
      itemsPerPage: notificationStore.itemsPerPage,
      totalItems: notificationStore.totalItems,
      setPage: notificationStore.setPage,
      setItemsPerPage: notificationStore.setItemsPerPage,
      
      // Utility methods
      getFilteredNotifications: notificationStore.getFilteredNotifications,
      getPaginatedNotifications: notificationStore.getPaginatedNotifications,
      getNotificationsByCategory: notificationStore.getNotificationsByCategory,
      getRecentNotifications: notificationStore.getRecentNotifications,
      
      // Real-time updates
      addIncomingNotification: notificationStore.addIncomingNotification,
      updateNotificationStatus: notificationStore.updateNotificationStatus,
    };
  }
  
  // Return fallback implementation (Context would be used here in real app)
  // For now, returning a basic mock implementation
  return {
    // Core data
    notifications: [],
    settings: null,
    stats: null,
    
    // State
    loading: false,
    error: null,
    unreadCount: 0,
    
    // Permission
    permissionStatus: 'not-determined' as const,
    
    // Basic operations - stub implementations
    loadNotifications: async () => {
      console.warn('loadNotifications not available in fallback mode - enable USE_NOTIFICATION_STORE');
    },
    
    markAsRead: async (notificationId: string) => {
      console.warn('markAsRead not available in fallback mode - enable USE_NOTIFICATION_STORE');
    },
    
    markAllAsRead: async () => {
      console.warn('markAllAsRead not available in fallback mode - enable USE_NOTIFICATION_STORE');
    },
    
    deleteNotification: async (notificationId: string) => {
      console.warn('deleteNotification not available in fallback mode - enable USE_NOTIFICATION_STORE');
    },
    
    updateSettings: async (settings: Partial<NotificationSettings>) => {
      console.warn('updateSettings not available in fallback mode - enable USE_NOTIFICATION_STORE');
    },
    
    requestPermission: async () => {
      console.warn('requestPermission not available in fallback mode - enable USE_NOTIFICATION_STORE');
      return 'denied' as const;
    },
    
    // Store-only method stubs
    loadNotificationStats: async () => {
      console.warn('loadNotificationStats not available in fallback mode');
    },
    
    markAsUnread: async (notificationId: string) => {
      console.warn('markAsUnread not available in fallback mode');
    },
    
    deleteAllNotifications: async () => {
      console.warn('deleteAllNotifications not available in fallback mode');
    },
    
    bulkMarkAsRead: async (notificationIds: string[]) => {
      console.warn('bulkMarkAsRead not available in fallback mode');
    },
    
    bulkDeleteNotifications: async (notificationIds: string[]) => {
      console.warn('bulkDeleteNotifications not available in fallback mode');
    },
    
    updateCategoryPreference: async (category: keyof NotificationSettings['categories'], enabled: boolean) => {
      console.warn('updateCategoryPreference not available in fallback mode');
    },
    
    // Push token management stubs
    registerPushToken: async (tokenInfo: any) => {
      console.warn('registerPushToken not available in fallback mode');
    },
    
    deactivatePushToken: async (token: string) => {
      console.warn('deactivatePushToken not available in fallback mode');
    },
    
    // Local notification stubs
    scheduleLocalNotification: async (schedule: any) => {
      console.warn('scheduleLocalNotification not available in fallback mode');
      return '';
    },
    
    cancelScheduledNotification: async (scheduleId: string) => {
      console.warn('cancelScheduledNotification not available in fallback mode');
    },
    
    // Filtering and search stubs
    filterCategory: 'all' as const,
    filterType: 'all' as const,
    filterStatus: 'all' as const,
    setFilterCategory: (category: 'all' | Notification['category']) => {
      console.warn('setFilterCategory not available in fallback mode');
    },
    
    setFilterType: (type: 'all' | Notification['type']) => {
      console.warn('setFilterType not available in fallback mode');
    },
    
    setFilterStatus: (status: 'all' | 'read' | 'unread') => {
      console.warn('setFilterStatus not available in fallback mode');
    },
    
    clearFilters: () => {
      console.warn('clearFilters not available in fallback mode');
    },
    
    // Selection management stubs
    selectedNotificationIds: [],
    selectNotifications: (ids: string[]) => {
      console.warn('selectNotifications not available in fallback mode');
    },
    
    toggleNotificationSelection: (id: string) => {
      console.warn('toggleNotificationSelection not available in fallback mode');
    },
    
    selectAllNotifications: () => {
      console.warn('selectAllNotifications not available in fallback mode');
    },
    
    clearSelection: () => {
      console.warn('clearSelection not available in fallback mode');
    },
    
    // Pagination stubs
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    setPage: (page: number) => {
      console.warn('setPage not available in fallback mode');
    },
    
    setItemsPerPage: (count: number) => {
      console.warn('setItemsPerPage not available in fallback mode');
    },
    
    // Utility method stubs
    getFilteredNotifications: () => {
      console.warn('getFilteredNotifications not available in fallback mode');
      return [];
    },
    
    getPaginatedNotifications: () => {
      console.warn('getPaginatedNotifications not available in fallback mode');
      return [];
    },
    
    getNotificationsByCategory: (category: Notification['category']) => {
      console.warn('getNotificationsByCategory not available in fallback mode');
      return [];
    },
    
    getRecentNotifications: (hours?: number) => {
      console.warn('getRecentNotifications not available in fallback mode');
      return [];
    },
    
    // Real-time update stubs
    addIncomingNotification: (notification: Notification) => {
      console.warn('addIncomingNotification not available in fallback mode');
    },
    
    updateNotificationStatus: (notificationId: string, isRead: boolean) => {
      console.warn('updateNotificationStatus not available in fallback mode');
    },
  };
};

/**
 * Hook to check if we're currently using the store implementation
 */
export const useIsNotificationStoreActive = (): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled('USE_NOTIFICATION_STORE' as any);
};

/**
 * Hook for notification filtering and search
 */
export const useNotificationFilters = () => {
  const notification = useNotificationMigration();
  
  return {
    filterCategory: notification.filterCategory || 'all',
    filterType: notification.filterType || 'all',
    filterStatus: notification.filterStatus || 'all',
    setFilterCategory: notification.setFilterCategory,
    setFilterType: notification.setFilterType,
    setFilterStatus: notification.setFilterStatus,
    clearFilters: notification.clearFilters,
    
    // Computed values
    hasActiveFilters: (
      (notification.filterCategory && notification.filterCategory !== 'all') ||
      (notification.filterType && notification.filterType !== 'all') ||
      (notification.filterStatus && notification.filterStatus !== 'all')
    ),
    
    filteredNotifications: notification.getFilteredNotifications?.() || [],
    filteredCount: notification.getFilteredNotifications?.().length || 0,
  };
};

/**
 * Hook for notification selection management
 */
export const useNotificationSelection = () => {
  const notification = useNotificationMigration();
  
  return {
    selectedIds: notification.selectedNotificationIds || [],
    selectIds: notification.selectNotifications,
    toggleSelection: notification.toggleNotificationSelection,
    selectAll: notification.selectAllNotifications,
    clearSelection: notification.clearSelection,
    selectedCount: notification.selectedNotificationIds?.length || 0,
    hasSelection: (notification.selectedNotificationIds?.length || 0) > 0,
    
    // Bulk operations
    bulkMarkAsRead: async () => {
      if (notification.bulkMarkAsRead && notification.selectedNotificationIds?.length) {
        await notification.bulkMarkAsRead(notification.selectedNotificationIds);
        notification.clearSelection?.();
      }
    },
    
    bulkDelete: async () => {
      if (notification.bulkDeleteNotifications && notification.selectedNotificationIds?.length) {
        await notification.bulkDeleteNotifications(notification.selectedNotificationIds);
        notification.clearSelection?.();
      }
    },
  };
};

/**
 * Hook for notification pagination
 */
export const useNotificationPagination = () => {
  const notification = useNotificationMigration();
  
  const totalPages = Math.ceil((notification.totalItems || 0) / (notification.itemsPerPage || 20));
  
  return {
    currentPage: notification.currentPage || 1,
    itemsPerPage: notification.itemsPerPage || 20,
    totalItems: notification.totalItems || 0,
    totalPages,
    setPage: notification.setPage,
    setItemsPerPage: notification.setItemsPerPage,
    hasNextPage: (notification.currentPage || 1) < totalPages,
    hasPrevPage: (notification.currentPage || 1) > 1,
    paginatedNotifications: notification.getPaginatedNotifications?.() || [],
  };
};

/**
 * Hook for notification settings management
 */
export const useNotificationSettingsManagement = () => {
  const notification = useNotificationMigration();
  
  return {
    settings: notification.settings,
    loading: notification.loading,
    error: notification.error,
    
    // Operations
    updateSettings: notification.updateSettings,
    updateCategoryPreference: notification.updateCategoryPreference,
    
    // Settings shortcuts
    notificationsEnabled: notification.settings?.enabled ?? true,
    pushEnabled: notification.settings?.pushNotifications ?? true,
    emailEnabled: notification.settings?.emailNotifications ?? true,
    smsEnabled: notification.settings?.smsNotifications ?? false,
    inAppEnabled: notification.settings?.inAppNotifications ?? true,
    
    // Category preferences
    categoryPreferences: notification.settings?.categories || {},
    
    // Quiet hours
    quietHours: notification.settings?.quietHours || { enabled: false, startTime: '22:00', endTime: '08:00' },
    
    // Quick toggles
    togglePushNotifications: async () => {
      if (notification.settings && notification.updateSettings) {
        await notification.updateSettings({
          pushNotifications: !notification.settings.pushNotifications,
        });
      }
    },
    
    toggleCategory: async (category: keyof NotificationSettings['categories']) => {
      if (notification.updateCategoryPreference && notification.settings) {
        const currentValue = notification.settings.categories[category];
        await notification.updateCategoryPreference(category, !currentValue);
      }
    },
  };
};

/**
 * Hook for notification permission management
 */
export const useNotificationPermissions = () => {
  const notification = useNotificationMigration();
  
  return {
    permissionStatus: notification.permissionStatus,
    loading: notification.loading,
    error: notification.error,
    
    // Operations
    requestPermission: notification.requestPermission,
    
    // Computed values
    hasPermission: notification.permissionStatus === 'granted',
    permissionDenied: notification.permissionStatus === 'denied',
    permissionNotDetermined: notification.permissionStatus === 'not-determined',
    provisionalPermission: notification.permissionStatus === 'provisional',
    
    // Helper methods
    canReceiveNotifications: notification.permissionStatus === 'granted' || notification.permissionStatus === 'provisional',
    needsPermissionRequest: notification.permissionStatus === 'not-determined',
    shouldShowPermissionRationale: notification.permissionStatus === 'denied',
  };
};

/**
 * Hook for notification stats and metrics
 */
export const useNotificationStats = () => {
  const notification = useNotificationMigration();
  
  return {
    stats: notification.stats,
    loading: notification.loading,
    error: notification.error,
    unreadCount: notification.unreadCount,
    
    // Load stats
    loadStats: notification.loadNotificationStats,
    
    // Quick access to metrics
    totalNotifications: notification.stats?.total || 0,
    unreadNotifications: notification.stats?.unread || 0,
    readToday: notification.stats?.readToday || 0,
    
    // Category breakdown
    categoryStats: notification.stats?.byCategory || {},
    priorityStats: notification.stats?.byPriority || {},
    typeStats: notification.stats?.byType || {},
    
    // Computed values
    readPercentage: notification.stats ? 
      ((notification.stats.total - notification.stats.unread) / notification.stats.total * 100) : 0,
    
    mostActiveCategory: notification.stats ? 
      Object.entries(notification.stats.byCategory).reduce((max, [cat, count]) => 
        count > (notification.stats!.byCategory[max] || 0) ? cat : max, 'general') : 'general',
  };
};

/**
 * Hook for real-time notification handling
 */
export const useNotificationRealtime = () => {
  const notification = useNotificationMigration();
  
  return {
    // Real-time operations
    addIncomingNotification: notification.addIncomingNotification,
    updateNotificationStatus: notification.updateNotificationStatus,
    
    // Helper methods
    handleIncomingPushNotification: (pushData: any) => {
      if (notification.addIncomingNotification) {
        // Convert push data to Notification format
        const notificationData: Notification = {
          id: pushData.id || `push_${Date.now()}`,
          title: pushData.title || '',
          body: pushData.body || '',
          type: pushData.type || 'info',
          category: pushData.category || 'general',
          priority: pushData.priority || 'medium',
          data: pushData.data,
          imageUrl: pushData.imageUrl,
          actionUrl: pushData.actionUrl,
          deepLink: pushData.deepLink,
          isRead: false,
          isActionable: !!pushData.actionUrl || !!pushData.deepLink,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        notification.addIncomingNotification(notificationData);
      }
    },
    
    markAsReadOptimistically: (notificationId: string) => {
      // Update UI immediately, then sync with server
      notification.updateNotificationStatus?.(notificationId, true);
      notification.markAsRead?.(notificationId).catch(() => {
        // Revert on error
        notification.updateNotificationStatus?.(notificationId, false);
      });
    },
  };
};

/**
 * Development helper for notification migration validation
 */
export const useNotificationMigrationValidator = () => {
  if (__DEV__) {
    const notification = useNotificationMigration();
    const isStoreActive = useIsNotificationStoreActive();
    
    // Validate essential methods are available
    const requiredMethods = [
      'loadNotifications', 'markAsRead', 'markAllAsRead', 
      'deleteNotification', 'updateSettings', 'requestPermission'
    ];
    
    const missingMethods = requiredMethods.filter(method => 
      typeof notification[method as keyof typeof notification] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      console.warn('Notification migration validation: Missing methods:', missingMethods);
    }
    
    // Validate notification structure when store is active
    if (isStoreActive && notification.notifications.length > 0) {
      const sampleNotification = notification.notifications[0];
      const requiredFields = ['id', 'title', 'body', 'type', 'category', 'priority', 'isRead', 'sentAt'];
      const missingFields = requiredFields.filter(field => 
        !sampleNotification[field as keyof Notification]
      );
      
      if (missingFields.length > 0) {
        console.warn('Notification migration validation: Missing notification fields:', missingFields);
      }
    }
    
    // Validate settings structure
    if (isStoreActive && notification.settings) {
      const requiredSettingsFields = ['enabled', 'pushNotifications', 'categories'];
      const missingSettingsFields = requiredSettingsFields.filter(field => 
        notification.settings![field as keyof NotificationSettings] === undefined
      );
      
      if (missingSettingsFields.length > 0) {
        console.warn('Notification migration validation: Missing settings fields:', missingSettingsFields);
      }
    }
  }
};