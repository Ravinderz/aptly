// Main services exports for easy imports across the application

// Core API service
import APIService from './api.service';
import BillingService from './billing.service';
// Import the REST-based auth service
import { AuthService } from './auth.service.rest';

export { APIService } from './api.service';
export type { APIError, NetworkState, UploadResult } from './api.service';

// Authentication service
export { AuthService } from './auth.service.rest';
export type { AuthResult, UserProfile } from './auth.service.rest';

// Billing service
export { BillingService } from './billing.service';
export type {
  Bill,
  BillerInfo,
  BillPaymentRequest,
  GSTCalculation,
  PaymentRecord,
  RechargeRequest,
} from './billing.service';

export const services = {
  api: APIService,
  auth: AuthService,
  billing: BillingService,
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
      results.billing = true; // Billing service is mock-based
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
        auth: { status: 'active', provider: 'rest' },
        billing: { status: 'active', mode: 'mock' },
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
      await AuthService.isAuthenticated();

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
      // This can be expanded later if other services with unread counts are added
      return {
        notifications: 0,
        community: 0,
        total: 0,
      };
    } catch (error) {
      console.error('Failed to get unread counts:', error);
      return { notifications: 0, community: 0, total: 0 };
    }
  },
};
