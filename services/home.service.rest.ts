/**
 * REST Home Service
 * Dashboard and home screen data service with API integration
 */

import { apiClient, APIClientError } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import { developmentService } from '@/services/development.service';

export interface HomeStats {
  totalVisitors: number;
  activeVisitors: number;
  todayVisitors: number;
  thisWeekVisitors: number;
  pendingApprovals: number;
  totalNotices: number;
  activeNotices: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon?: string;
  user?: string;
}

export interface HomeDashboardData {
  stats: HomeStats;
  recentActivity: RecentActivity[];
  upcomingEvents: any[];
  notifications: any[];
  weatherInfo?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
}

export interface HomeResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}

/**
 * REST Home Service Class
 */
export class RestHomeService {
  private static instance: RestHomeService;

  private constructor() {}

  static getInstance(): RestHomeService {
    if (!RestHomeService.instance) {
      RestHomeService.instance = new RestHomeService();
    }
    return RestHomeService.instance;
  }

  /**
   * Get home dashboard data
   */
  async getDashboardData(): Promise<HomeResult> {
    return await developmentService.tryRealAPIOrMock(
      async () => {
        const response = await apiClient.get<HomeDashboardData>(
          API_ENDPOINTS.HOME.DASHBOARD
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          throw new Error(response.error?.message || 'Failed to fetch dashboard data');
        }
      },
      {
        success: true,
        data: developmentService.getMockData('dashboardStats'),
      },
      'getDashboardData'
    );
  }

  /**
   * Get home statistics
   */
  async getHomeStats(): Promise<HomeResult> {
    return await developmentService.tryRealAPIOrMock(
      async () => {
        const response = await apiClient.get<HomeStats>(
          API_ENDPOINTS.HOME.STATS
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          throw new Error(response.error?.message || 'Failed to fetch home statistics');
        }
      },
      {
        success: true,
        data: {
          totalVisitors: 245,
          activeVisitors: 3,
          todayVisitors: 12,
          thisWeekVisitors: 67,
          pendingApprovals: 2,
          totalNotices: 5,
          activeNotices: 2,
        },
      },
      'getHomeStats'
    );
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<HomeResult> {
    return await developmentService.tryRealAPIOrMock(
      async () => {
        const response = await apiClient.get<RecentActivity[]>(
          `${API_ENDPOINTS.HOME.DASHBOARD}/activity`,
          { params: { limit } }
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          throw new Error(response.error?.message || 'Failed to fetch recent activity');
        }
      },
      {
        success: true,
        data: developmentService.getMockData('dashboardStats').recentActivity.slice(0, limit),
      },
      'getRecentActivity'
    );
  }

  /**
   * Get visitor analytics
   */
  async getVisitorAnalytics(period: 'today' | 'week' | 'month' = 'week'): Promise<HomeResult> {
    return await developmentService.tryRealAPIOrMock(
      async () => {
        const response = await apiClient.get<any>(
          `${API_ENDPOINTS.HOME.STATS}/visitors`,
          { params: { period } }
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          throw new Error(response.error?.message || 'Failed to fetch visitor analytics');
        }
      },
      {
        success: true,
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              name: 'Visitors',
              data: [12, 8, 15, 10, 18, 6, 9],
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            }
          ],
          summary: {
            total: 78,
            average: 11.1,
            peak: 18,
            peakDay: 'Friday',
          }
        },
      },
      'getVisitorAnalytics'
    );
  }

  /**
   * Get notices for home screen
   */
  async getHomeNotices(limit: number = 5): Promise<HomeResult> {
    return await developmentService.tryRealAPIOrMock(
      async () => {
        const response = await apiClient.get<any[]>(
          API_ENDPOINTS.NOTICES.LIST,
          { params: { limit, active: true } }
        );

        if (response.success) {
          return {
            success: true,
            data: response.data,
          };
        } else {
          throw new Error(response.error?.message || 'Failed to fetch notices');
        }
      },
      {
        success: true,
        data: developmentService.getMockData('notices').filter((notice: any) => notice.isActive).slice(0, limit),
      },
      'getHomeNotices'
    );
  }

  /**
   * Get quick actions based on user role
   */
  async getQuickActions(userRole: string): Promise<HomeResult> {
    const allActions = {
      resident: [
        { id: 'create-visitor', title: 'Add Visitor', icon: 'user-plus', action: 'navigate', target: '/visitors/create' },
        { id: 'view-notices', title: 'View Notices', icon: 'bell', action: 'navigate', target: '/notices' },
        { id: 'emergency', title: 'Emergency', icon: 'alert-triangle', action: 'emergency' },
        { id: 'complaints', title: 'Complaints', icon: 'message-square', action: 'navigate', target: '/complaints' },
      ],
      security_guard: [
        { id: 'visitor-checkin', title: 'Check-in Visitor', icon: 'user-check', action: 'navigate', target: '/visitors/checkin' },
        { id: 'visitor-checkout', title: 'Check-out Visitor', icon: 'user-x', action: 'navigate', target: '/visitors/checkout' },
        { id: 'emergency-alert', title: 'Emergency Alert', icon: 'alert-triangle', action: 'emergency' },
        { id: 'patrol-log', title: 'Patrol Log', icon: 'clipboard', action: 'navigate', target: '/security/patrol' },
      ],
      admin: [
        { id: 'manage-visitors', title: 'Manage Visitors', icon: 'users', action: 'navigate', target: '/admin/visitors' },
        { id: 'create-notice', title: 'Create Notice', icon: 'plus-circle', action: 'navigate', target: '/notices/create' },
        { id: 'view-reports', title: 'View Reports', icon: 'bar-chart', action: 'navigate', target: '/reports' },
        { id: 'system-settings', title: 'System Settings', icon: 'settings', action: 'navigate', target: '/admin/settings' },
      ],
    };

    return {
      success: true,
      data: allActions[userRole as keyof typeof allActions] || allActions.resident,
    };
  }

  /**
   * Get weather information (mock implementation)
   */
  async getWeatherInfo(): Promise<HomeResult> {
    return {
      success: true,
      data: {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        location: 'Bangalore, Karnataka',
        icon: 'partly-cloudy',
      },
    };
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<HomeResult> {
    try {
      const [dashboardData, stats, activity, notices] = await Promise.all([
        this.getDashboardData(),
        this.getHomeStats(),
        this.getRecentActivity(5),
        this.getHomeNotices(3),
      ]);

      if (dashboardData.success && stats.success && activity.success && notices.success) {
        return {
          success: true,
          data: {
            dashboard: dashboardData.data,
            stats: stats.data,
            activity: activity.data,
            notices: notices.data,
            lastRefresh: new Date().toISOString(),
          },
        };
      } else {
        return {
          success: false,
          error: 'Failed to refresh dashboard data',
        };
      }
    } catch (error) {
      console.error('❌ Failed to refresh dashboard:', error);
      return {
        success: false,
        error: 'Failed to refresh dashboard data',
      };
    }
  }
}

// Create singleton instance
export const restHomeService = RestHomeService.getInstance();
export default restHomeService;