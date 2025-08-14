/**
 * Development Service
 * Handles API integration during development phase when some endpoints are not yet available
 * Provides mock data and graceful fallbacks
 */

import { apiClient } from './api.client';
import { API_ENDPOINTS } from '@/config/api.config';

export interface DevelopmentConfig {
  useRealAPI: boolean;
  mockDelay: number;
  enableLogging: boolean;
}

export interface MockData {
  users: any[];
  visitors: any[];
  societies: any[];
  notices: any[];
  dashboardStats: any;
}

export class DevelopmentService {
  private static instance: DevelopmentService;
  private config: DevelopmentConfig;
  private mockData: MockData;

  private constructor() {
    this.config = {
      useRealAPI: true, // Try real API first, fallback to mock
      mockDelay: 500, // Simulate network delay
      enableLogging: __DEV__,
    };

    this.initializeMockData();
  }

  static getInstance(): DevelopmentService {
    if (!DevelopmentService.instance) {
      DevelopmentService.instance = new DevelopmentService();
    }
    return DevelopmentService.instance;
  }

  /**
   * Initialize mock data for development
   */
  private initializeMockData(): void {
    this.mockData = {
      users: [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@aptly.com',
          phoneNumber: '+919876543210',
          societyCode: 'APT001',
          flatNumber: 'A-101',
          role: 'resident',
          isVerified: true,
          avatar: null,
        },
        {
          id: 'user-2',
          name: 'Security Guard',
          email: 'security@aptly.com',
          phoneNumber: '+919876543211',
          societyCode: 'APT001',
          flatNumber: 'Gate-1',
          role: 'security_guard',
          isVerified: true,
          avatar: null,
        },
      ],
      visitors: [
        {
          id: 'visitor-1',
          name: 'Jane Smith',
          phoneNumber: '+919876543212',
          purpose: 'Personal Visit',
          hostName: 'John Doe',
          hostFlat: 'A-101',
          status: 'checked_in',
          checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          checkOutTime: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'visitor-2',
          name: 'Mike Johnson',
          phoneNumber: '+919876543213',
          purpose: 'Delivery',
          hostName: 'John Doe',
          hostFlat: 'A-101',
          status: 'checked_out',
          checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          checkOutTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ],
      societies: [
        {
          id: 'society-1',
          name: 'Aptly Gardens',
          code: 'APT001',
          address: '123 Tech City, Bangalore, Karnataka 560001',
          totalFlats: 120,
          occupiedFlats: 95,
          adminName: 'Admin User',
          adminEmail: 'admin@aptly.com',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      notices: [
        {
          id: 'notice-1',
          title: 'Maintenance Work Scheduled',
          content: 'Water supply will be disrupted tomorrow from 10 AM to 2 PM.',
          type: 'maintenance',
          priority: 'high',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: ['all'],
        },
        {
          id: 'notice-2',
          title: 'Community Meeting',
          content: 'Monthly community meeting scheduled for next Saturday at 6 PM.',
          type: 'event',
          priority: 'medium',
          isActive: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: ['all'],
        },
      ],
      dashboardStats: {
        totalVisitors: 245,
        activeVisitors: 3,
        todayVisitors: 12,
        thisWeekVisitors: 67,
        pendingApprovals: 2,
        totalNotices: 5,
        activeNotices: 2,
        recentActivity: [
          {
            id: 'activity-1',
            type: 'visitor_checkin',
            message: 'Jane Smith checked in to visit A-101',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'activity-2',
            type: 'notice_created',
            message: 'New maintenance notice posted',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'activity-3',
            type: 'visitor_checkout',
            message: 'Mike Johnson checked out',
            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          },
        ],
      },
    };
  }

  /**
   * Test if server is available
   */
  async isServerAvailable(): Promise<boolean> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SYSTEM.HEALTH, {
        timeout: 5000,
      });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test specific endpoint availability
   */
  async isEndpointAvailable(endpoint: string, method: string = 'GET'): Promise<boolean> {
    try {
      const response = await apiClient.request({
        method: method as any,
        url: endpoint,
        timeout: 5000,
        validateStatus: (status) => status !== 404,
      });
      return true;
    } catch (error: any) {
      // 404 means endpoint doesn't exist
      if (error.response?.status === 404) {
        return false;
      }
      // Other errors (401, 400, etc.) mean endpoint exists but request is invalid
      return true;
    }
  }

  /**
   * Get development authentication flow
   */
  async getAuthFlow(): Promise<{
    supportsPhoneOTP: boolean;
    supportsEmailPassword: boolean;
    supportsRegistration: boolean;
    mockCredentials: any;
  }> {
    const registerAvailable = await this.isEndpointAvailable('/api/v4/auth/register', 'POST');
    const loginAvailable = await this.isEndpointAvailable('/api/v4/auth/login', 'POST');

    return {
      supportsPhoneOTP: false, // Not implemented in current API
      supportsEmailPassword: loginAvailable,
      supportsRegistration: registerAvailable,
      mockCredentials: {
        email: 'test@aptly.com',
        password: 'test123',
        phoneNumber: '+919876543210',
        name: 'Test User',
        societyCode: 'APT001',
      },
    };
  }

  /**
   * Simulate API delay
   */
  private async simulateDelay(): Promise<void> {
    if (this.config.mockDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.mockDelay));
    }
  }

  /**
   * Log development info
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`🔧 [DevService] ${message}`, data || '');
    }
  }

  /**
   * Try real API first, fallback to mock
   */
  async tryRealAPIOrMock<T>(
    realAPICall: () => Promise<T>,
    mockData: T,
    operationName: string
  ): Promise<T> {
    if (!this.config.useRealAPI) {
      this.log(`Using mock data for ${operationName}`);
      await this.simulateDelay();
      return mockData;
    }

    try {
      this.log(`Trying real API for ${operationName}`);
      const result = await realAPICall();
      this.log(`Real API success for ${operationName}`);
      return result;
    } catch (error: any) {
      this.log(`Real API failed for ${operationName}, using mock data:`, error.message);
      await this.simulateDelay();
      return mockData;
    }
  }

  /**
   * Get mock data by type
   */
  getMockData(type: keyof MockData): any {
    return this.mockData[type];
  }

  /**
   * Add mock data
   */
  addMockData(type: keyof MockData, data: any): void {
    if (Array.isArray(this.mockData[type])) {
      (this.mockData[type] as any[]).push(data);
    } else {
      this.mockData[type] = data;
    }
  }

  /**
   * Update mock data
   */
  updateMockData(type: keyof MockData, id: string, data: any): void {
    if (Array.isArray(this.mockData[type])) {
      const index = (this.mockData[type] as any[]).findIndex(item => item.id === id);
      if (index !== -1) {
        (this.mockData[type] as any[])[index] = { ...this.mockData[type][index], ...data };
      }
    }
  }

  /**
   * Remove mock data
   */
  removeMockData(type: keyof MockData, id: string): void {
    if (Array.isArray(this.mockData[type])) {
      this.mockData[type] = (this.mockData[type] as any[]).filter(item => item.id !== id);
    }
  }

  /**
   * Get server status report
   */
  async getServerStatus(): Promise<{
    serverAvailable: boolean;
    endpoints: {
      auth: { register: boolean; login: boolean; profile: boolean };
      visitors: { list: boolean; create: boolean; update: boolean };
      home: { dashboard: boolean; stats: boolean };
      notices: { list: boolean; create: boolean };
    };
  }> {
    const serverAvailable = await this.isServerAvailable();

    if (!serverAvailable) {
      return {
        serverAvailable: false,
        endpoints: {
          auth: { register: false, login: false, profile: false },
          visitors: { list: false, create: false, update: false },
          home: { dashboard: false, stats: false },
          notices: { list: false, create: false },
        },
      };
    }

    // Test key endpoints
    const endpoints = {
      auth: {
        register: await this.isEndpointAvailable('/api/v4/auth/register', 'POST'),
        login: await this.isEndpointAvailable('/api/v4/auth/login', 'POST'),
        profile: await this.isEndpointAvailable('/api/v4/user/profile', 'GET'),
      },
      visitors: {
        list: await this.isEndpointAvailable('/api/v4/visitors', 'GET'),
        create: await this.isEndpointAvailable('/api/v4/visitors', 'POST'),
        update: await this.isEndpointAvailable('/api/v4/visitors/test', 'PUT'),
      },
      home: {
        dashboard: await this.isEndpointAvailable('/api/v4/home', 'GET'),
        stats: await this.isEndpointAvailable('/api/v4/home/stats', 'GET'),
      },
      notices: {
        list: await this.isEndpointAvailable('/api/notices', 'GET'),
        create: await this.isEndpointAvailable('/api/notices', 'POST'),
      },
    };

    return {
      serverAvailable: true,
      endpoints,
    };
  }

  /**
   * Create a test user for development
   */
  async createTestUser(): Promise<any> {
    const testUser = {
      id: `test-user-${Date.now()}`,
      name: 'Test User',
      email: 'test@aptly.com',
      phoneNumber: '+919876543210',
      societyCode: 'APT001',
      flatNumber: 'A-101',
      role: 'resident',
      isVerified: true,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    this.addMockData('users', testUser);
    return testUser;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DevelopmentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): DevelopmentConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const developmentService = DevelopmentService.getInstance();
export default developmentService;