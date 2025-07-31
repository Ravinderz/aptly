// Main services exports for easy imports across the application

// Core API service
export { APIService } from './api.service';
export type { APIError, UploadResult, NetworkState } from './api.service';

// Authentication service
export { AuthService } from './auth.service';
export type { AuthResult, TokenPair, UserProfile } from './auth.service';

// Community service
export { communityApi } from './communityApi';
export type {
  Post,
  Comment,
  CreatePostRequest,
  CreateCommentRequest,
  User,
} from '@/types/community';

// Billing service
export { BillingService } from './billing.service';
export type {
  Bill,
  PaymentRecord,
  BillPaymentRequest,
  RechargeRequest,
  BillerInfo,
  GSTCalculation,
} from './billing.service';

// Governance service
export { GovernanceService } from './governance.service';
export type {
  Proposal,
  VotingResults,
  Vote,
  Meeting,
  AgendaItem,
  Attendee,
  Committee,
  CommitteeMember,
  Announcement,
  Complaint,
} from './governance.service';

// Notification service
export { NotificationService } from './notification.service';
export type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  PushTokenInfo,
} from './notification.service';

// Maintenance service
export { MaintenanceService } from './maintenance.service';
export type {
  MaintenanceRequest,
  MaintenanceStaff,
  Vendor,
  MaintenanceAnalytics,
  ScheduledMaintenance,
  ChecklistItem,
} from './maintenance.service';

// Biometric service (existing)
export { BiometricService } from './biometric.service';

// Admin services (existing)
export * from './admin/adminAuthService';
export * from './admin/authService';
export * from './admin/roleManager';

// Service instances for direct use
import APIService from './api.service';
import AuthService from './auth.service';
import { communityApi } from './communityApi';
import BillingService from './billing.service';
import GovernanceService from './governance.service';
import NotificationService from './notification.service';
import MaintenanceService from './maintenance.service';

export const services = {
  api: APIService,
  auth: AuthService,
  community: communityApi,
  billing: BillingService,
  governance: GovernanceService,
  notification: NotificationService,
  maintenance: MaintenanceService,
} as const;

// Default export for convenience
export default services;

// Service status and health check utilities
export const ServiceStatus = {
  async checkAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    try {
      // Test each service with a lightweight operation
      results.auth = await AuthService.isAuthenticated();
      results.api = true; // API service is always available
      results.community = true; // Community service is mock-based
      results.billing = true; // Billing service is mock-based
      results.governance = true; // Governance service is mock-based
      results.notification = true; // Notification service is mock-based
      results.maintenance = true; // Maintenance service is mock-based
    } catch (error) {
      console.error('Service health check failed:', error);
      // Set failed services to false
      Object.keys(results).forEach((key) => {
        if (results[key] === undefined) {
          results[key] = false;
        }
      });
    }

    return results;
  },

  async getServiceInfo() {
    return {
      version: '1.0.0',
      environment: 'development',
      services: {
        api: { status: 'active', baseURL: 'https://api.aptly.app/v4' },
        auth: { status: 'active', provider: 'custom' },
        community: { status: 'active', mode: 'mock' },
        billing: { status: 'active', mode: 'mock' },
        governance: { status: 'active', mode: 'mock' },
        notification: { status: 'active', mode: 'mock' },
        maintenance: { status: 'active', mode: 'mock' },
      },
      lastHealthCheck: new Date().toISOString(),
    };
  },
};

// Utility functions for common operations
export const ServiceHelpers = {
  // Initialize all services (call this in app startup)
  async initializeServices(userId?: string) {
    try {
      // Initialize auth service
      const isAuthenticated = await AuthService.isAuthenticated();

      if (isAuthenticated && userId) {
        // Load user preferences
        await NotificationService.getUserPreferences(userId);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize services:', error);
      return false;
    }
  },

  // Cleanup services (call this on logout)
  async cleanupServices() {
    try {
      await AuthService.logout();
      // Other cleanup operations can be added here
      return true;
    } catch (error) {
      console.error('Failed to cleanup services:', error);
      return false;
    }
  },

  // Get unread counts for badges
  async getUnreadCounts(userId: string) {
    try {
      const [notifications, communityPosts] = await Promise.all([
        NotificationService.getUnreadCount(userId),
        // Add other unread count services here
        Promise.resolve(0), // Placeholder for community unread count
      ]);

      return {
        notifications,
        community: communityPosts,
        total: notifications + communityPosts,
      };
    } catch (error) {
      console.error('Failed to get unread counts:', error);
      return { notifications: 0, community: 0, total: 0 };
    }
  },
};
