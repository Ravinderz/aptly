/**
 * NotificationStore - Zustand store for push notifications and alerts
 * 
 * Handles notification management, push token registration,
 * notification settings, and notification history.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { BaseStore } from '../types';

// Notification types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'alert' | 'reminder';
  category: 'system' | 'society' | 'billing' | 'maintenance' | 'security' | 'social' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Metadata
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  deepLink?: string;
  
  // Targeting
  targetUserId?: string;
  targetSocietyId?: string;
  targetRole?: string[];
  
  // Status
  isRead: boolean;
  isActionable: boolean;
  expiresAt?: string;
  
  // Timestamps
  scheduledAt?: string;
  sentAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  // Global settings
  enabled: boolean;
  
  // Channel preferences
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  
  // Category preferences
  categories: {
    system: boolean;
    society: boolean;
    billing: boolean;
    maintenance: boolean;
    security: boolean;
    social: boolean;
    general: boolean;
  };
  
  // Timing preferences
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
  };
  
  // Priority filtering
  minimumPriority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Frequency limits
  maxNotificationsPerHour: number;
  maxNotificationsPerDay: number;
  
  // Sound and vibration
  sound: boolean;
  vibration: boolean;
  customSoundUrl?: string;
}

export interface PushTokenInfo {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  deviceName?: string;
  appVersion: string;
  isActive: boolean;
  registeredAt: string;
  lastUsedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  readToday: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  type: Notification['type'];
  category: Notification['category'];
  priority: Notification['priority'];
  scheduledAt: string;
  targetUserId?: string;
  targetSocietyId?: string;
  data?: Record<string, any>;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    endDate?: string;
  };
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Notification store state
interface NotificationState extends BaseStore {
  // Core data
  notifications: Notification[];
  settings: NotificationSettings | null;
  pushTokens: PushTokenInfo[];
  scheduledNotifications: NotificationSchedule[];
  
  // UI state
  selectedNotificationIds: string[];
  filterCategory: 'all' | Notification['category'];
  filterType: 'all' | Notification['type'];
  filterStatus: 'all' | 'read' | 'unread';
  sortBy: 'sentAt' | 'readAt' | 'priority' | 'type';
  sortOrder: 'asc' | 'desc';
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  
  // Stats
  stats: NotificationStats | null;
  
  // Permission status
  permissionStatus: 'granted' | 'denied' | 'not-determined' | 'provisional';
  
  // Cache
  lastFetchTime: number | null;
  cacheExpiry: number; // 2 minutes default for notifications
}

// Store actions
interface NotificationActions {
  // Notification management
  loadNotifications: (force?: boolean) => Promise<void>;
  loadNotificationStats: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  
  // Bulk operations
  bulkMarkAsRead: (notificationIds: string[]) => Promise<void>;
  bulkDeleteNotifications: (notificationIds: string[]) => Promise<void>;
  
  // Settings management
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateCategoryPreference: (category: keyof NotificationSettings['categories'], enabled: boolean) => Promise<void>;
  
  // Push token management
  registerPushToken: (tokenInfo: Omit<PushTokenInfo, 'registeredAt' | 'lastUsedAt' | 'isActive'>) => Promise<void>;
  updatePushToken: (token: string, updates: Partial<PushTokenInfo>) => Promise<void>;
  deactivatePushToken: (token: string) => Promise<void>;
  loadPushTokens: () => Promise<void>;
  
  // Permission management
  requestPermission: () => Promise<'granted' | 'denied'>;
  checkPermissionStatus: () => Promise<NotificationState['permissionStatus']>;
  openNotificationSettings: () => void;
  
  // Local notifications (for reminders, etc.)
  scheduleLocalNotification: (schedule: Omit<NotificationSchedule, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  cancelScheduledNotification: (scheduleId: string) => Promise<void>;
  loadScheduledNotifications: () => Promise<void>;
  
  // Filtering and search
  setFilterCategory: (category: NotificationState['filterCategory']) => void;
  setFilterType: (type: NotificationState['filterType']) => void;
  setFilterStatus: (status: NotificationState['filterStatus']) => void;
  setSortBy: (sortBy: NotificationState['sortBy']) => void;
  setSortOrder: (order: NotificationState['sortOrder']) => void;
  clearFilters: () => void;
  
  // Selection management
  selectNotifications: (ids: string[]) => void;
  toggleNotificationSelection: (id: string) => void;
  selectAllNotifications: () => void;
  clearSelection: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  
  // Utility methods
  getNotificationById: (id: string) => Notification | undefined;
  getFilteredNotifications: () => Notification[];
  getPaginatedNotifications: () => Notification[];
  getUnreadCount: () => number;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  getRecentNotifications: (hours?: number) => Notification[];
  
  // Cache management
  isCacheValid: () => boolean;
  refreshCache: () => Promise<void>;
  clearCache: () => void;
  
  // Real-time updates (for when push notifications are received)
  addIncomingNotification: (notification: Notification) => void;
  updateNotificationStatus: (notificationId: string, isRead: boolean) => void;
}

type NotificationStore = NotificationState & NotificationActions;

// Initial state
const initialState: NotificationState = {
  // Base store
  loading: false,
  error: null,
  
  // Core data
  notifications: [],
  settings: null,
  pushTokens: [],
  scheduledNotifications: [],
  
  // UI state
  selectedNotificationIds: [],
  filterCategory: 'all',
  filterType: 'all',
  filterStatus: 'all',
  sortBy: 'sentAt',
  sortOrder: 'desc',
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 20,
  totalItems: 0,
  
  // Stats
  stats: null,
  
  // Permission
  permissionStatus: 'not-determined',
  
  // Cache
  lastFetchTime: null,
  cacheExpiry: 2 * 60 * 1000, // 2 minutes
};

// Mock notification service (replace with actual service)
const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 'notif_1',
        title: 'Maintenance Scheduled',
        body: 'Water maintenance scheduled for tomorrow 10:00 AM - 2:00 PM',
        type: 'info',
        category: 'maintenance',
        priority: 'medium',
        targetSocietyId: 'society_1',
        isRead: false,
        isActionable: true,
        actionUrl: '/maintenance/details/123',
        sentAt: '2024-01-15T09:00:00Z',
        createdAt: '2024-01-15T08:45:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      },
      {
        id: 'notif_2',
        title: 'Payment Due',
        body: 'Your monthly maintenance fee is due in 3 days',
        type: 'warning',
        category: 'billing',
        priority: 'high',
        targetUserId: 'user_123',
        isRead: true,
        isActionable: true,
        actionUrl: '/billing/pay',
        sentAt: '2024-01-14T16:30:00Z',
        readAt: '2024-01-14T18:15:00Z',
        createdAt: '2024-01-14T16:30:00Z',
        updatedAt: '2024-01-14T18:15:00Z',
      },
    ] as Notification[];
  },

  async getNotificationSettings(): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      enabled: true,
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      categories: {
        system: true,
        society: true,
        billing: true,
        maintenance: true,
        security: true,
        social: false,
        general: true,
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
      minimumPriority: 'medium',
      maxNotificationsPerHour: 5,
      maxNotificationsPerDay: 20,
      sound: true,
      vibration: true,
    };
  },

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const currentSettings = await this.getNotificationSettings();
    return { ...currentSettings, ...settings };
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  async getNotificationStats(): Promise<NotificationStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      total: 45,
      unread: 8,
      readToday: 12,
      byCategory: {
        system: 5,
        society: 12,
        billing: 8,
        maintenance: 10,
        security: 3,
        social: 2,
        general: 5,
      },
      byPriority: {
        low: 15,
        medium: 20,
        high: 8,
        urgent: 2,
      },
      byType: {
        info: 20,
        success: 8,
        warning: 12,
        error: 3,
        announcement: 2,
      },
    };
  },

  async registerPushToken(tokenInfo: Omit<PushTokenInfo, 'registeredAt' | 'lastUsedAt' | 'isActive'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real implementation, would register with push notification service
  },

  async scheduleNotification(schedule: Omit<NotificationSchedule, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return `schedule_${Date.now()}`;
  },
};

// Create the Zustand store
export const useNotificationStore = create<NotificationStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Base store methods
        setLoading: (loading: boolean) => set((state) => {
          state.loading = loading;
        }),

        setError: (error: string | null) => set((state) => {
          state.error = error;
        }),

        reset: () => set((state) => {
          Object.assign(state, initialState);
        }),

        // Notification management
        loadNotifications: async (force = false) => {
          const state = get();
          
          // Check cache validity unless forced
          if (!force && state.isCacheValid()) {
            return;
          }
          
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const notifications = await notificationService.getNotifications();
            
            set((state) => {
              state.notifications = notifications;
              state.totalItems = notifications.length;
              state.loading = false;
              state.lastFetchTime = Date.now();
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load notifications';
              state.loading = false;
            });
          }
        },

        loadNotificationStats: async () => {
          try {
            const stats = await notificationService.getNotificationStats();
            
            set((state) => {
              state.stats = stats;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load notification stats';
            });
          }
        },

        markAsRead: async (notificationId: string) => {
          try {
            await notificationService.markNotificationAsRead(notificationId);
            
            set((state) => {
              const notification = state.notifications.find(n => n.id === notificationId);
              if (notification) {
                notification.isRead = true;
                notification.readAt = new Date().toISOString();
                notification.updatedAt = new Date().toISOString();
              }
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to mark notification as read';
            });
            throw error;
          }
        },

        markAsUnread: async (notificationId: string) => {
          try {
            // In real implementation, would make API call
            await new Promise(resolve => setTimeout(resolve, 200));
            
            set((state) => {
              const notification = state.notifications.find(n => n.id === notificationId);
              if (notification) {
                notification.isRead = false;
                notification.readAt = undefined;
                notification.updatedAt = new Date().toISOString();
              }
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to mark notification as unread';
            });
            throw error;
          }
        },

        markAllAsRead: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const unreadNotifications = get().notifications.filter(n => !n.isRead);
            
            // Mark all as read in API
            await Promise.all(
              unreadNotifications.map(n => notificationService.markNotificationAsRead(n.id))
            );
            
            set((state) => {
              const now = new Date().toISOString();
              state.notifications.forEach(notification => {
                if (!notification.isRead) {
                  notification.isRead = true;
                  notification.readAt = now;
                  notification.updatedAt = now;
                }
              });
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to mark all notifications as read';
              state.loading = false;
            });
            throw error;
          }
        },

        deleteNotification: async (notificationId: string) => {
          try {
            await notificationService.deleteNotification(notificationId);
            
            set((state) => {
              state.notifications = state.notifications.filter(n => n.id !== notificationId);
              state.totalItems = state.notifications.length;
              
              // Remove from selection if selected
              state.selectedNotificationIds = state.selectedNotificationIds.filter(id => id !== notificationId);
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to delete notification';
            });
            throw error;
          }
        },

        deleteAllNotifications: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // Delete all notifications
            await Promise.all(
              get().notifications.map(n => notificationService.deleteNotification(n.id))
            );
            
            set((state) => {
              state.notifications = [];
              state.totalItems = 0;
              state.selectedNotificationIds = [];
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to delete all notifications';
              state.loading = false;
            });
            throw error;
          }
        },

        // Bulk operations
        bulkMarkAsRead: async (notificationIds: string[]) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            await Promise.all(
              notificationIds.map(id => notificationService.markNotificationAsRead(id))
            );
            
            set((state) => {
              const now = new Date().toISOString();
              notificationIds.forEach(id => {
                const notification = state.notifications.find(n => n.id === id);
                if (notification) {
                  notification.isRead = true;
                  notification.readAt = now;
                  notification.updatedAt = now;
                }
              });
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to mark notifications as read';
              state.loading = false;
            });
            throw error;
          }
        },

        bulkDeleteNotifications: async (notificationIds: string[]) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            await Promise.all(
              notificationIds.map(id => notificationService.deleteNotification(id))
            );
            
            set((state) => {
              state.notifications = state.notifications.filter(n => !notificationIds.includes(n.id));
              state.totalItems = state.notifications.length;
              state.selectedNotificationIds = [];
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to delete notifications';
              state.loading = false;
            });
            throw error;
          }
        },

        // Settings management
        loadSettings: async () => {
          try {
            const settings = await notificationService.getNotificationSettings();
            
            set((state) => {
              state.settings = settings;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load notification settings';
            });
          }
        },

        updateSettings: async (settingsUpdate: Partial<NotificationSettings>) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const updatedSettings = await notificationService.updateNotificationSettings(settingsUpdate);
            
            set((state) => {
              state.settings = updatedSettings;
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update notification settings';
              state.loading = false;
            });
            throw error;
          }
        },

        updateCategoryPreference: async (category: keyof NotificationSettings['categories'], enabled: boolean) => {
          const currentSettings = get().settings;
          if (!currentSettings) return;

          const updatedSettings = {
            ...currentSettings,
            categories: {
              ...currentSettings.categories,
              [category]: enabled,
            },
          };

          await get().updateSettings(updatedSettings);
        },

        // Push token management
        registerPushToken: async (tokenInfo: Omit<PushTokenInfo, 'registeredAt' | 'lastUsedAt' | 'isActive'>) => {
          try {
            await notificationService.registerPushToken(tokenInfo);
            
            set((state) => {
              const newToken: PushTokenInfo = {
                ...tokenInfo,
                isActive: true,
                registeredAt: new Date().toISOString(),
                lastUsedAt: new Date().toISOString(),
              };
              
              // Remove existing token for same device if exists
              state.pushTokens = state.pushTokens.filter(t => t.deviceId !== tokenInfo.deviceId);
              state.pushTokens.push(newToken);
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to register push token';
            });
            throw error;
          }
        },

        updatePushToken: async (token: string, updates: Partial<PushTokenInfo>) => {
          try {
            // In real implementation, would make API call
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set((state) => {
              const tokenIndex = state.pushTokens.findIndex(t => t.token === token);
              if (tokenIndex !== -1) {
                state.pushTokens[tokenIndex] = { ...state.pushTokens[tokenIndex], ...updates };
              }
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update push token';
            });
            throw error;
          }
        },

        deactivatePushToken: async (token: string) => {
          await get().updatePushToken(token, { isActive: false });
        },

        loadPushTokens: async () => {
          // In real implementation, would load from API
          // For now, using existing tokens in state
        },

        // Permission management
        requestPermission: async () => {
          try {
            // In React Native, would use @react-native-async-storage/async-storage or similar
            // For now, simulating permission request
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const granted = Math.random() > 0.3; // Simulate 70% grant rate
            const status = granted ? 'granted' : 'denied';
            
            set((state) => {
              state.permissionStatus = status;
            });
            
            return status;
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to request notification permission';
            });
            return 'denied';
          }
        },

        checkPermissionStatus: async () => {
          try {
            // In real implementation, would check actual permission status
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const status = get().permissionStatus;
            return status;
          } catch (error: any) {
            return 'not-determined';
          }
        },

        openNotificationSettings: () => {
          // In React Native, would open device notification settings
          // For now, just log
          console.log('Opening notification settings...');
        },

        // Local notifications
        scheduleLocalNotification: async (schedule: Omit<NotificationSchedule, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
          try {
            const scheduleId = await notificationService.scheduleNotification(schedule);
            
            set((state) => {
              const newSchedule: NotificationSchedule = {
                ...schedule,
                id: scheduleId,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              state.scheduledNotifications.push(newSchedule);
            });
            
            return scheduleId;
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to schedule notification';
            });
            throw error;
          }
        },

        cancelScheduledNotification: async (scheduleId: string) => {
          try {
            // In real implementation, would cancel via notification service
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set((state) => {
              const scheduleIndex = state.scheduledNotifications.findIndex(s => s.id === scheduleId);
              if (scheduleIndex !== -1) {
                state.scheduledNotifications[scheduleIndex].status = 'cancelled';
                state.scheduledNotifications[scheduleIndex].updatedAt = new Date().toISOString();
              }
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to cancel scheduled notification';
            });
            throw error;
          }
        },

        loadScheduledNotifications: async () => {
          // In real implementation, would load from API
          // For now, using existing scheduled notifications in state
        },

        // Filtering and search
        setFilterCategory: (category: NotificationState['filterCategory']) => set((state) => {
          state.filterCategory = category;
          state.currentPage = 1;
        }),

        setFilterType: (type: NotificationState['filterType']) => set((state) => {
          state.filterType = type;
          state.currentPage = 1;
        }),

        setFilterStatus: (status: NotificationState['filterStatus']) => set((state) => {
          state.filterStatus = status;
          state.currentPage = 1;
        }),

        setSortBy: (sortBy: NotificationState['sortBy']) => set((state) => {
          state.sortBy = sortBy;
        }),

        setSortOrder: (order: NotificationState['sortOrder']) => set((state) => {
          state.sortOrder = order;
        }),

        clearFilters: () => set((state) => {
          state.filterCategory = 'all';
          state.filterType = 'all';
          state.filterStatus = 'all';
          state.sortBy = 'sentAt';
          state.sortOrder = 'desc';
          state.currentPage = 1;
        }),

        // Selection management
        selectNotifications: (ids: string[]) => set((state) => {
          state.selectedNotificationIds = ids;
        }),

        toggleNotificationSelection: (id: string) => set((state) => {
          const index = state.selectedNotificationIds.indexOf(id);
          if (index === -1) {
            state.selectedNotificationIds.push(id);
          } else {
            state.selectedNotificationIds.splice(index, 1);
          }
        }),

        selectAllNotifications: () => set((state) => {
          const filteredNotifications = get().getFilteredNotifications();
          state.selectedNotificationIds = filteredNotifications.map(n => n.id);
        }),

        clearSelection: () => set((state) => {
          state.selectedNotificationIds = [];
        }),

        // Pagination
        setPage: (page: number) => set((state) => {
          state.currentPage = page;
        }),

        setItemsPerPage: (count: number) => set((state) => {
          state.itemsPerPage = count;
          state.currentPage = 1;
        }),

        // Utility methods
        getNotificationById: (id: string) => {
          return get().notifications.find(n => n.id === id);
        },

        getFilteredNotifications: () => {
          const state = get();
          let filtered = [...state.notifications];

          // Apply category filter
          if (state.filterCategory !== 'all') {
            filtered = filtered.filter(n => n.category === state.filterCategory);
          }

          // Apply type filter
          if (state.filterType !== 'all') {
            filtered = filtered.filter(n => n.type === state.filterType);
          }

          // Apply status filter
          if (state.filterStatus !== 'all') {
            filtered = filtered.filter(n => {
              if (state.filterStatus === 'read') return n.isRead;
              if (state.filterStatus === 'unread') return !n.isRead;
              return true;
            });
          }

          // Apply sorting
          filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (state.sortBy) {
              case 'sentAt':
                aValue = new Date(a.sentAt).getTime();
                bValue = new Date(b.sentAt).getTime();
                break;
              case 'readAt':
                aValue = a.readAt ? new Date(a.readAt).getTime() : 0;
                bValue = b.readAt ? new Date(b.readAt).getTime() : 0;
                break;
              case 'priority':
                const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
                aValue = priorityOrder[a.priority];
                bValue = priorityOrder[b.priority];
                break;
              case 'type':
                aValue = a.type;
                bValue = b.type;
                break;
              default:
                return 0;
            }

            if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });

          return filtered;
        },

        getPaginatedNotifications: () => {
          const filtered = get().getFilteredNotifications();
          const state = get();
          const startIndex = (state.currentPage - 1) * state.itemsPerPage;
          const endIndex = startIndex + state.itemsPerPage;
          return filtered.slice(startIndex, endIndex);
        },

        getUnreadCount: () => {
          return get().notifications.filter(n => !n.isRead).length;
        },

        getNotificationsByCategory: (category: Notification['category']) => {
          return get().notifications.filter(n => n.category === category);
        },

        getRecentNotifications: (hours = 24) => {
          const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).getTime();
          return get().notifications.filter(n => 
            new Date(n.sentAt).getTime() > cutoffTime
          );
        },

        // Cache management
        isCacheValid: () => {
          const state = get();
          if (!state.lastFetchTime) return false;
          return Date.now() - state.lastFetchTime < state.cacheExpiry;
        },

        refreshCache: async () => {
          await get().loadNotifications(true);
        },

        clearCache: () => set((state) => {
          state.notifications = [];
          state.stats = null;
          state.lastFetchTime = null;
          state.totalItems = 0;
        }),

        // Real-time updates
        addIncomingNotification: (notification: Notification) => set((state) => {
          // Add to beginning of notifications array
          state.notifications.unshift(notification);
          state.totalItems = state.notifications.length;
        }),

        updateNotificationStatus: (notificationId: string, isRead: boolean) => set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.isRead = isRead;
            if (isRead && !notification.readAt) {
              notification.readAt = new Date().toISOString();
            } else if (!isRead) {
              notification.readAt = undefined;
            }
            notification.updatedAt = new Date().toISOString();
          }
        }),
      })),
      {
        name: 'notification-storage',
        partialize: (state) => ({
          settings: state.settings,
          permissionStatus: state.permissionStatus,
          pushTokens: state.pushTokens,
          // Don't persist notifications - they should be fresh loaded
        }),
      }
    ),
    { name: 'NotificationStore' }
  )
);

// Selector hooks for optimized re-renders
export const useNotificationList = () => useNotificationStore(state => state.getPaginatedNotifications());
export const useNotificationLoading = () => useNotificationStore(state => state.loading);
export const useNotificationError = () => useNotificationStore(state => state.error);
export const useNotificationSettings = () => useNotificationStore(state => state.settings);
export const useNotificationStats = () => useNotificationStore(state => state.stats);
export const useUnreadCount = () => useNotificationStore(state => state.getUnreadCount());
export const useNotificationPermission = () => useNotificationStore(state => state.permissionStatus);
export const useNotificationActions = () => useNotificationStore(state => ({
  loadNotifications: state.loadNotifications,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  deleteNotification: state.deleteNotification,
  updateSettings: state.updateSettings,
  requestPermission: state.requestPermission,
  setFilterCategory: state.setFilterCategory,
  setFilterStatus: state.setFilterStatus,
  clearFilters: state.clearFilters,
}));