// Direct notification hook using only Zustand stores (no Context dependency)
import { 
  useNotificationStore, 
  type Notification, 
  type NotificationSettings, 
  type NotificationStats 
} from '@/stores/slices/notificationStore';
import { useMemo, useCallback } from 'react';

/**
 * Direct notification hook that uses stores directly without Context dependencies
 * This replaces useNotificationMigration to avoid circular dependencies during initialization
 */
export const useDirectNotification = () => {
  // Get notification store state
  const notifications = useNotificationStore((state) => state.notifications);
  const settings = useNotificationStore((state) => state.settings);
  const stats = useNotificationStore((state) => state.stats);
  const loading = useNotificationStore((state) => state.loading);
  const error = useNotificationStore((state) => state.error);
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());
  const permissionStatus = useNotificationStore((state) => state.permissionStatus);

  // Get notification actions with stable callbacks
  const loadNotifications = useCallback(useNotificationStore.getState().loadNotifications, []);
  const markAsRead = useCallback(useNotificationStore.getState().markAsRead, []);
  const markAllAsRead = useCallback(useNotificationStore.getState().markAllAsRead, []);
  const deleteNotification = useCallback(useNotificationStore.getState().deleteNotification, []);
  const updateSettings = useCallback(useNotificationStore.getState().updateSettings, []);
  const requestPermission = useCallback(useNotificationStore.getState().requestPermission, []);
  
  // Additional store operations
  const loadNotificationStats = useCallback(useNotificationStore.getState().loadNotificationStats, []);
  const markAsUnread = useCallback(useNotificationStore.getState().markAsUnread, []);
  const deleteAllNotifications = useCallback(useNotificationStore.getState().deleteAllNotifications, []);
  const bulkMarkAsRead = useCallback(useNotificationStore.getState().bulkMarkAsRead, []);
  const bulkDeleteNotifications = useCallback(useNotificationStore.getState().bulkDeleteNotifications, []);
  const updateCategoryPreference = useCallback(useNotificationStore.getState().updateCategoryPreference, []);
  const registerPushToken = useCallback(useNotificationStore.getState().registerPushToken, []);
  const deactivatePushToken = useCallback(useNotificationStore.getState().deactivatePushToken, []);

  // Utility functions
  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: 'low' | 'medium' | 'high' | 'urgent') => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Fixed: Create stable actions object to prevent re-renders
  const stableActions = useMemo(() => ({
    // Basic operations
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    requestPermission,
    
    // Additional store operations
    loadNotificationStats,
    markAsUnread,
    deleteAllNotifications,
    bulkMarkAsRead,
    bulkDeleteNotifications,
    updateCategoryPreference,
    registerPushToken,
    deactivatePushToken,
    
    // Utility functions
    getNotificationsByCategory,
    getUnreadNotifications,
    getNotificationsByPriority,
  }), [
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    requestPermission,
    loadNotificationStats,
    markAsUnread,
    deleteAllNotifications,
    bulkMarkAsRead,
    bulkDeleteNotifications,
    updateCategoryPreference,
    registerPushToken,
    deactivatePushToken,
    getNotificationsByCategory,
    getUnreadNotifications,
    getNotificationsByPriority,
  ]);

  // Fixed: Create stable state object to prevent re-renders
  const stableState = useMemo(() => ({
    // Core data
    notifications,
    settings,
    stats,
    
    // State
    loading,
    error,
    unreadCount,
    permissionStatus,
    
    // Metadata
    isUsingStore: true,
    migrationStatus: 'active' as const,
  }), [
    notifications,
    settings,
    stats,
    loading,
    error,
    unreadCount,
    permissionStatus,
  ]);

  // Return stable combined object to prevent infinite re-renders
  return useMemo(() => ({
    ...stableState,
    ...stableActions,
  }), [stableState, stableActions]);
};

/**
 * Emergency fallback that provides basic notification state
 */
export const useNotificationFallback = () => {
  return {
    notifications: [],
    settings: null,
    stats: null,
    loading: false,
    error: null,
    unreadCount: 0,
    permissionStatus: 'not-determined' as const,
    loadNotifications: async () => {},
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {},
    updateSettings: async () => {},
    requestPermission: async () => 'denied' as const,
    loadNotificationStats: async () => {},
    markAsUnread: async () => {},
    deleteAllNotifications: async () => {},
    bulkMarkAsRead: async () => {},
    bulkDeleteNotifications: async () => {},
    updateCategoryPreference: async () => {},
    registerPushToken: async () => {},
    deactivatePushToken: async () => {},
    getNotificationsByCategory: () => [],
    getUnreadNotifications: () => [],
    getNotificationsByPriority: () => [],
    isUsingStore: false,
    migrationStatus: 'fallback',
  };
};