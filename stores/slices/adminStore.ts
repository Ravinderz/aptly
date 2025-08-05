/**
 * AdminStore - Zustand store for admin panel functionality
 *
 * Handles administrative features, permissions, society management,
 * analytics, and admin-specific operations.
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BaseStore } from '../types';

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'society_admin' | 'support';
  permissions: AdminPermission[];
  assignedSocieties: string[]; // Society IDs
  department: string;
  profileImage?: string;
  phoneNumber?: string;
  lastLoginAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermission {
  resource: string; // e.g., 'societies', 'users', 'billing', 'analytics'
  actions: string[]; // e.g., ['read', 'write', 'delete', 'manage']
  scope: 'global' | 'assigned_societies' | 'own';
}

export interface AdminAnalytics {
  overview: {
    totalSocieties: number;
    totalUsers: number;
    totalRevenue: number;
    activeSubscriptions: number;
    growthRate: number;
    churnRate: number;
  };
  societies: {
    newSocietiesThisMonth: number;
    activeSocieties: number;
    pendingApprovals: number;
    suspendedSocieties: number;
    averageOccupancyRate: number;
  };
  users: {
    totalActiveUsers: number;
    newUsersThisMonth: number;
    userRetentionRate: number;
    averageSessionDuration: number;
  };
  revenue: {
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenueGrowth: number;
    averageRevenuePerSociety: number;
  };
  support: {
    openTickets: number;
    resolvedTicketsThisMonth: number;
    averageResolutionTime: number;
    customerSatisfactionScore: number;
  };
}

export interface AdminAction {
  id: string;
  type: 'approve' | 'suspend' | 'activate' | 'delete' | 'update' | 'notify';
  targetType: 'society' | 'user' | 'subscription' | 'ticket';
  targetId: string;
  reason?: string;
  metadata?: Record<string, any>;
  performedBy: string;
  performedAt: string;
}

export interface AdminSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };
  security: {
    requireTwoFactorAuth: boolean;
    sessionTimeout: number; // minutes
    passwordExpiryDays: number;
    loginAttemptLimit: number;
  };
  dashboard: {
    defaultView: 'overview' | 'societies' | 'analytics' | 'support';
    refreshInterval: number; // seconds
    showAdvancedMetrics: boolean;
    chartsType: 'line' | 'bar' | 'pie';
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    cacheExpiry: number; // minutes
  };
}

export interface SocietyManagementItem {
  id: string;
  societyId: string;
  societyName: string;
  action:
    | 'approval_pending'
    | 'payment_overdue'
    | 'compliance_review'
    | 'technical_issue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Admin store state
interface AdminState extends BaseStore {
  // Core data
  adminUser: AdminUser | null;
  analytics: AdminAnalytics | null;
  settings: AdminSettings | null;

  // Management data
  societyManagementItems: SocietyManagementItem[];
  actionHistory: AdminAction[];

  // UI state
  selectedManagementItems: string[];
  dashboardView: 'overview' | 'societies' | 'analytics' | 'support';
  analyticsTimeRange: '7d' | '30d' | '90d' | '1y';

  // Filters and search
  managementFilter: 'all' | 'pending' | 'in_progress' | 'high_priority';
  searchQuery: string;

  // Cache
  lastAnalyticsUpdate: number | null;
  lastManagementItemsUpdate: number | null;
}

// Store actions
interface AdminActions {
  // Authentication and profile
  loadAdminProfile: () => Promise<void>;
  updateAdminProfile: (updates: Partial<AdminUser>) => Promise<void>;
  updateAdminSettings: (settings: Partial<AdminSettings>) => Promise<void>;

  // Dashboard and analytics
  loadDashboard: () => Promise<void>;
  loadAnalytics: (
    timeRange?: AdminState['analyticsTimeRange'],
  ) => Promise<void>;
  setDashboardView: (view: AdminState['dashboardView']) => void;
  setAnalyticsTimeRange: (range: AdminState['analyticsTimeRange']) => void;

  // Society management
  loadManagementItems: () => Promise<void>;
  manageSociety: (societyId: string, action: AdminAction) => Promise<void>;
  approveSociety: (societyId: string, reason?: string) => Promise<void>;
  suspendSociety: (societyId: string, reason: string) => Promise<void>;
  activateSociety: (societyId: string, reason?: string) => Promise<void>;

  // Bulk operations
  bulkManageSocieties: (
    societyIds: string[],
    action: Omit<AdminAction, 'id' | 'targetId' | 'performedAt'>,
  ) => Promise<void>;
  assignManagementItems: (
    itemIds: string[],
    assignedTo: string,
  ) => Promise<void>;

  // Action history
  loadActionHistory: (targetId?: string) => Promise<void>;

  // Management item operations
  updateManagementItem: (
    itemId: string,
    updates: Partial<SocietyManagementItem>,
  ) => Promise<void>;
  resolveManagementItem: (itemId: string, resolution: string) => Promise<void>;
  closeManagementItem: (itemId: string) => Promise<void>;

  // Search and filtering
  setSearchQuery: (query: string) => void;
  setManagementFilter: (filter: AdminState['managementFilter']) => void;
  clearFilters: () => void;

  // Selection management
  selectManagementItems: (ids: string[]) => void;
  toggleManagementItemSelection: (id: string) => void;
  selectAllManagementItems: () => void;
  clearSelection: () => void;

  // Utility methods
  getManagementItemById: (id: string) => SocietyManagementItem | undefined;
  getFilteredManagementItems: () => SocietyManagementItem[];
  getPendingApprovalsCount: () => number;
  getHighPriorityItemsCount: () => number;
  getAssignedItemsCount: (adminId: string) => number;

  // System operations
  enableMaintenanceMode: (reason: string) => Promise<void>;
  disableMaintenanceMode: () => Promise<void>;
  refreshSystemCache: () => Promise<void>;
}

type AdminStore = AdminState & AdminActions;

// Initial state
const initialState: AdminState = {
  // Base store
  loading: false,
  error: null,

  // Core data
  adminUser: null,
  analytics: null,
  settings: null,

  // Management data
  societyManagementItems: [],
  actionHistory: [],

  // UI state
  selectedManagementItems: [],
  dashboardView: 'overview',
  analyticsTimeRange: '30d',

  // Filters
  managementFilter: 'all',
  searchQuery: '',

  // Cache
  lastAnalyticsUpdate: null,
  lastManagementItemsUpdate: null,
  setLoading: function (loading: boolean): void {
    throw new Error('Function not implemented.');
  },
  setError: function (error: string | null): void {
    throw new Error('Function not implemented.');
  },
  reset: function (): void {
    throw new Error('Function not implemented.');
  },
};

// Mock admin service (replace with actual service)
const adminService = {
  async getAdminProfile(): Promise<AdminUser> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      id: 'admin_123',
      email: 'admin@aptly.com',
      fullName: 'Admin User',
      role: 'admin',
      permissions: [
        {
          resource: 'societies',
          actions: ['read', 'write', 'delete', 'manage'],
          scope: 'global',
        },
        {
          resource: 'users',
          actions: ['read', 'write'],
          scope: 'assigned_societies',
        },
        {
          resource: 'analytics',
          actions: ['read'],
          scope: 'global',
        },
      ],
      assignedSocieties: ['society_1', 'society_2'],
      department: 'Operations',
      phoneNumber: '+91-9876543210',
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  },

  async getAnalytics(timeRange: string): Promise<AdminAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      overview: {
        totalSocieties: 145,
        totalUsers: 3420,
        totalRevenue: 2450000,
        activeSubscriptions: 138,
        growthRate: 0.12,
        churnRate: 0.03,
      },
      societies: {
        newSocietiesThisMonth: 8,
        activeSocieties: 138,
        pendingApprovals: 7,
        suspendedSocieties: 2,
        averageOccupancyRate: 0.87,
      },
      users: {
        totalActiveUsers: 3420,
        newUsersThisMonth: 245,
        userRetentionRate: 0.89,
        averageSessionDuration: 1800, // 30 minutes
      },
      revenue: {
        monthlyRevenue: 245000,
        yearlyRevenue: 2450000,
        revenueGrowth: 0.15,
        averageRevenuePerSociety: 17755,
      },
      support: {
        openTickets: 23,
        resolvedTicketsThisMonth: 89,
        averageResolutionTime: 4.2, // hours
        customerSatisfactionScore: 4.6,
      },
    };
  },

  async getManagementItems(): Promise<SocietyManagementItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      {
        id: 'mgmt_1',
        societyId: 'society_1',
        societyName: 'Green Valley Society',
        action: 'approval_pending',
        priority: 'high',
        status: 'open',
        description: 'New society registration awaiting approval',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'mgmt_2',
        societyId: 'society_2',
        societyName: 'Blue Ridge Apartments',
        action: 'payment_overdue',
        priority: 'medium',
        assignedTo: 'admin_123',
        dueDate: '2024-01-20T00:00:00Z',
        status: 'in_progress',
        description: 'Monthly subscription payment is 15 days overdue',
        createdAt: '2024-01-05T14:30:00Z',
        updatedAt: '2024-01-12T09:15:00Z',
      },
    ];
  },

  async performSocietyAction(
    societyId: string,
    action: AdminAction,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    // In real implementation, would make API call
  },

  async updateManagementItem(
    itemId: string,
    updates: Partial<SocietyManagementItem>,
  ): Promise<SocietyManagementItem> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    // Mock updated item
    return {
      id: itemId,
      societyId: 'society_1',
      societyName: 'Updated Society',
      action: 'approval_pending',
      priority: 'medium',
      status: 'resolved',
      description: 'Updated description',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: new Date().toISOString(),
      ...updates,
    };
  },

  async getSettings(): Promise<AdminSettings> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationFrequency: 'daily',
      },
      security: {
        requireTwoFactorAuth: true,
        sessionTimeout: 480, // 8 hours
        passwordExpiryDays: 90,
        loginAttemptLimit: 5,
      },
      dashboard: {
        defaultView: 'overview',
        refreshInterval: 300, // 5 minutes
        showAdvancedMetrics: true,
        chartsType: 'line',
      },
      system: {
        maintenanceMode: false,
        debugMode: false,
        logLevel: 'info',
        cacheExpiry: 60, // 1 hour
      },
    };
  },

  async updateSettings(
    settings: Partial<AdminSettings>,
  ): Promise<AdminSettings> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const currentSettings = await this.getSettings();
    return { ...currentSettings, ...settings };
  },
};

// Create the Zustand store
export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Base store methods
        setLoading: (loading: boolean) =>
          set((state) => {
            state.loading = loading;
          }),

        setError: (error: string | null) =>
          set((state) => {
            state.error = error;
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),

        // Authentication and profile
        loadAdminProfile: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const adminUser = await adminService.getAdminProfile();

            set((state) => {
              state.adminUser = adminUser;
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load admin profile';
              state.loading = false;
            });
          }
        },

        updateAdminProfile: async (updates: Partial<AdminUser>) => {
          if (!get().adminUser) return;

          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // In real implementation, would make API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            set((state) => {
              if (state.adminUser) {
                Object.assign(state.adminUser, updates);
                state.adminUser.updatedAt = new Date().toISOString();
              }
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update admin profile';
              state.loading = false;
            });
          }
        },

        updateAdminSettings: async (
          settingsUpdates: Partial<AdminSettings>,
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const updatedSettings =
              await adminService.updateSettings(settingsUpdates);

            set((state) => {
              state.settings = updatedSettings;
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update settings';
              state.loading = false;
            });
          }
        },

        // Dashboard and analytics
        loadDashboard: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const [analytics, managementItems, settings] = await Promise.all([
              adminService.getAnalytics(get().analyticsTimeRange),
              adminService.getManagementItems(),
              adminService.getSettings(),
            ]);

            set((state) => {
              state.analytics = analytics;
              state.societyManagementItems = managementItems;
              state.settings = settings;
              state.lastAnalyticsUpdate = Date.now();
              state.lastManagementItemsUpdate = Date.now();
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load dashboard';
              state.loading = false;
            });
          }
        },

        loadAnalytics: async (timeRange?: AdminState['analyticsTimeRange']) => {
          if (timeRange) {
            set((state) => {
              state.analyticsTimeRange = timeRange;
            });
          }

          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const analytics = await adminService.getAnalytics(
              get().analyticsTimeRange,
            );

            set((state) => {
              state.analytics = analytics;
              state.lastAnalyticsUpdate = Date.now();
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load analytics';
              state.loading = false;
            });
          }
        },

        setDashboardView: (view: AdminState['dashboardView']) =>
          set((state) => {
            state.dashboardView = view;
          }),

        setAnalyticsTimeRange: (range: AdminState['analyticsTimeRange']) =>
          set((state) => {
            state.analyticsTimeRange = range;
          }),

        // Society management
        loadManagementItems: async () => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const items = await adminService.getManagementItems();

            set((state) => {
              state.societyManagementItems = items;
              state.lastManagementItemsUpdate = Date.now();
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to load management items';
              state.loading = false;
            });
          }
        },

        manageSociety: async (societyId: string, action: AdminAction) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            await adminService.performSocietyAction(societyId, action);

            set((state) => {
              // Add to action history
              state.actionHistory.unshift({
                ...action,
                id: `action_${Date.now()}`,
                performedAt: new Date().toISOString(),
              });

              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to perform society action';
              state.loading = false;
            });
            throw error;
          }
        },

        approveSociety: async (societyId: string, reason?: string) => {
          const action: AdminAction = {
            id: '',
            type: 'approve',
            targetType: 'society',
            targetId: societyId,
            reason,
            performedBy: get().adminUser?.id || '',
            performedAt: '',
          };

          await get().manageSociety(societyId, action);
        },

        suspendSociety: async (societyId: string, reason: string) => {
          const action: AdminAction = {
            id: '',
            type: 'suspend',
            targetType: 'society',
            targetId: societyId,
            reason,
            performedBy: get().adminUser?.id || '',
            performedAt: '',
          };

          await get().manageSociety(societyId, action);
        },

        activateSociety: async (societyId: string, reason?: string) => {
          const action: AdminAction = {
            id: '',
            type: 'activate',
            targetType: 'society',
            targetId: societyId,
            reason,
            performedBy: get().adminUser?.id || '',
            performedAt: '',
          };

          await get().manageSociety(societyId, action);
        },

        // Bulk operations
        bulkManageSocieties: async (
          societyIds: string[],
          actionTemplate: Omit<AdminAction, 'id' | 'targetId' | 'performedAt'>,
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const actions = societyIds.map((societyId) => ({
              ...actionTemplate,
              id: `action_${Date.now()}_${societyId}`,
              targetId: societyId,
              performedAt: new Date().toISOString(),
            }));

            // Perform all actions
            await Promise.all(
              actions.map((action) =>
                adminService.performSocietyAction(action.targetId, action),
              ),
            );

            set((state) => {
              // Add all actions to history
              state.actionHistory.unshift(...actions);
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error =
                error.message || 'Failed to perform bulk operations';
              state.loading = false;
            });
            throw error;
          }
        },

        assignManagementItems: async (
          itemIds: string[],
          assignedTo: string,
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // Update each item
            await Promise.all(
              itemIds.map((id) =>
                adminService.updateManagementItem(id, { assignedTo }),
              ),
            );

            set((state) => {
              itemIds.forEach((id) => {
                const item = state.societyManagementItems.find(
                  (item) => item.id === id,
                );
                if (item) {
                  item.assignedTo = assignedTo;
                  item.updatedAt = new Date().toISOString();
                }
              });
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error =
                error.message || 'Failed to assign management items';
              state.loading = false;
            });
            throw error;
          }
        },

        // Action history
        loadActionHistory: async (targetId?: string) => {
          // In real implementation, would load from API
          // For now, using existing action history
        },

        // Management item operations
        updateManagementItem: async (
          itemId: string,
          updates: Partial<SocietyManagementItem>,
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const updatedItem = await adminService.updateManagementItem(
              itemId,
              updates,
            );

            set((state) => {
              const index = state.societyManagementItems.findIndex(
                (item) => item.id === itemId,
              );
              if (index !== -1) {
                state.societyManagementItems[index] = updatedItem;
              }
              state.loading = false;
            });
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to update management item';
              state.loading = false;
            });
            throw error;
          }
        },

        resolveManagementItem: async (itemId: string, resolution: string) => {
          await get().updateManagementItem(itemId, {
            status: 'resolved',
            description: resolution,
          });
        },

        closeManagementItem: async (itemId: string) => {
          await get().updateManagementItem(itemId, {
            status: 'closed',
          });
        },

        // Search and filtering
        setSearchQuery: (query: string) =>
          set((state) => {
            state.searchQuery = query;
          }),

        setManagementFilter: (filter: AdminState['managementFilter']) =>
          set((state) => {
            state.managementFilter = filter;
          }),

        clearFilters: () =>
          set((state) => {
            state.searchQuery = '';
            state.managementFilter = 'all';
          }),

        // Selection management
        selectManagementItems: (ids: string[]) =>
          set((state) => {
            state.selectedManagementItems = ids;
          }),

        toggleManagementItemSelection: (id: string) =>
          set((state) => {
            const index = state.selectedManagementItems.indexOf(id);
            if (index === -1) {
              state.selectedManagementItems.push(id);
            } else {
              state.selectedManagementItems.splice(index, 1);
            }
          }),

        selectAllManagementItems: () =>
          set((state) => {
            const filteredItems = get().getFilteredManagementItems();
            state.selectedManagementItems = filteredItems.map(
              (item) => item.id,
            );
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedManagementItems = [];
          }),

        // Utility methods
        getManagementItemById: (id: string) => {
          return get().societyManagementItems.find((item) => item.id === id);
        },

        getFilteredManagementItems: () => {
          const state = get();
          let filtered = [...state.societyManagementItems];

          // Apply search filter
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (item) =>
                item.societyName.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.action.toLowerCase().includes(query),
            );
          }

          // Apply status filter
          switch (state.managementFilter) {
            case 'pending':
              filtered = filtered.filter((item) => item.status === 'open');
              break;
            case 'in_progress':
              filtered = filtered.filter(
                (item) => item.status === 'in_progress',
              );
              break;
            case 'high_priority':
              filtered = filtered.filter(
                (item) =>
                  item.priority === 'high' || item.priority === 'critical',
              );
              break;
          }

          return filtered;
        },

        getPendingApprovalsCount: () => {
          return get().societyManagementItems.filter(
            (item) =>
              item.action === 'approval_pending' && item.status === 'open',
          ).length;
        },

        getHighPriorityItemsCount: () => {
          return get().societyManagementItems.filter(
            (item) =>
              (item.priority === 'high' || item.priority === 'critical') &&
              item.status !== 'closed',
          ).length;
        },

        getAssignedItemsCount: (adminId: string) => {
          return get().societyManagementItems.filter(
            (item) => item.assignedTo === adminId && item.status !== 'closed',
          ).length;
        },

        // System operations
        enableMaintenanceMode: async (reason: string) => {
          await get().updateAdminSettings({
            system: {
              ...get().settings?.system,
              maintenanceMode: true,
            },
          });
        },

        disableMaintenanceMode: async () => {
          await get().updateAdminSettings({
            system: {
              ...get().settings?.system,
              maintenanceMode: false,
            },
          });
        },

        refreshSystemCache: async () => {
          set((state) => {
            state.loading = true;
          });

          try {
            // Simulate cache refresh
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Reload all data
            await get().loadDashboard();
          } catch (error: any) {
            set((state) => {
              state.error = error.message || 'Failed to refresh system cache';
              state.loading = false;
            });
          }
        },
      })),
      {
        name: 'admin-storage',
        storage: {
          getItem: async (name: string) => {
            try {
              const value = await AsyncStorage.getItem(name);
              return value ? JSON.parse(value) : null;
            } catch (error) {
              console.warn(`Unable to get admin item '${name}', storage unavailable:`, error);
              return null;
            }
          },
          setItem: async (name: string, value: any) => {
            try {
              // Properly serialize objects to strings for AsyncStorage
              const serialized = JSON.stringify(value);
              await AsyncStorage.setItem(name, serialized);
            } catch (error) {
              console.warn(`Unable to set admin item '${name}', storage unavailable:`, error);
            }
          },
          removeItem: async (name: string) => {
            try {
              await AsyncStorage.removeItem(name);
            } catch (error) {
              console.warn(`Unable to remove admin item '${name}', storage unavailable:`, error);
            }
          },
        },
        partialize: (state) => ({
          adminUser: state.adminUser,
          settings: state.settings,
          dashboardView: state.dashboardView,
          analyticsTimeRange: state.analyticsTimeRange,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.warn('⚠️ AdminStore rehydration failed:', error);
          } else {
            console.log('✅ AdminStore rehydrated successfully');
          }
        },
      },
    ),
    { name: 'AdminStore' },
  ),
);

// Selector hooks for optimized re-renders with proper caching
export const useAdminUser = () => useAdminStore((state) => state.adminUser);
export const useAdminLoading = () => useAdminStore((state) => state.loading);
export const useAdminError = () => useAdminStore((state) => state.error);
export const useAdminAnalytics = () => useAdminStore((state) => state.analytics);
export const useAdminSettings = () => useAdminStore((state) => state.settings);

// Fixed: Cache filtered items to prevent new array creation on every call
const filteredItemsCache = new WeakMap();
export const useAdminManagementItems = () =>
  useAdminStore((state) => {
    const cacheKey = `${state.searchQuery}-${state.managementFilter}-${state.societyManagementItems.length}`;
    
    if (!filteredItemsCache.has(state)) {
      filteredItemsCache.set(state, new Map());
    }
    
    const stateCache = filteredItemsCache.get(state);
    if (stateCache.has(cacheKey)) {
      return stateCache.get(cacheKey);
    }
    
    const filtered = state.getFilteredManagementItems();
    stateCache.set(cacheKey, filtered);
    return filtered;
  });

// Fixed: Create stable action object to prevent re-renders
let cachedActions: any = null;
export const useAdminActions = () => {
  if (!cachedActions) {
    const state = useAdminStore.getState();
    cachedActions = {
      loadDashboard: state.loadDashboard,
      loadAnalytics: state.loadAnalytics,
      manageSociety: state.manageSociety,
      approveSociety: state.approveSociety,
      suspendSociety: state.suspendSociety,
      activateSociety: state.activateSociety,
      updateManagementItem: state.updateManagementItem,
      setSearchQuery: state.setSearchQuery,
      setManagementFilter: state.setManagementFilter,
    };
  }
  return cachedActions;
};
