// Main services exports for easy imports across the application

// Modern API client and services
import { apiClient } from './api.client';
import { RestAuthService } from './auth.service.rest';
import { RestVisitorsService } from './visitors.service.rest';
import { communityApi } from './communityApi';

// Re-export API client
export { apiClient, APIClientError } from './api.client';
export type { APIResponse, APIError } from '@/types/api';

// Modern REST-based Authentication service
export { RestAuthService as AuthService } from './auth.service.rest';
export type {
  AuthResult,
  LoginRequest,
  LoginResponse,
  OTPVerificationRequest,
  AuthTokens,
  AuthUser,
  UserProfileExtended,
} from '@/types/api';

// Modern REST-based Visitors service
export { RestVisitorsService as VisitorsService } from './visitors.service.rest';
export type {
  Visitor,
  VisitorCreateRequest,
  VisitorListQuery,
  VisitorStats,
} from '@/types/api';

// Community service
export type {
  Comment,
  CreateCommentRequest,
  CreatePostRequest,
  Post,
  User,
} from '@/types/community';
export { communityApi } from './communityApi';

// Biometric service (existing - preserved as requested)
export { BiometricService } from './biometric.service';

// Admin services (existing)
export * from './admin/authService';
export * from './admin/roleManager';

export const services = {
  api: apiClient,
  auth: RestAuthService.getInstance(),
  visitors: RestVisitorsService.getInstance(),
  community: communityApi,
} as const;

// Default export for convenience
export default services;

// Legacy compatibility exports (deprecated - use modern services instead)
export const LegacyServices = {
  warning: 'These exports point to deprecated services. Use modern REST services instead.',
  // For backwards compatibility - these will be removed in future versions
  get APIService() {
    console.warn('APIService is deprecated. Use apiClient instead.');
    return require('./deprecated/api.service').APIService;
  },
  get AuthService() {
    console.warn('Legacy AuthService is deprecated. Use RestAuthService instead.');
    return require('./deprecated/auth.service').AuthService;
  },
  get BillingService() {
    console.warn('BillingService is deprecated and moved to deprecated folder.');
    return require('./deprecated/billing.service').BillingService;
  },
};

// Service status and health check utilities
export const ServiceStatus = {
  async checkAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    try {
      // Test each service with a lightweight operation
      results.auth = await RestAuthService.getInstance().isAuthenticated();
      results.api = true; // API client is always available
      results.visitors = true; // Visitors service is always available
      results.community = true; // Community service is mock-based
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
      version: '2.0.0',
      environment: 'development',
      services: {
        api: { status: 'active', baseURL: 'https://api.aptly.app/v4', type: 'REST' },
        auth: { status: 'active', provider: 'REST', type: 'modern' },
        visitors: { status: 'active', provider: 'REST', type: 'modern' },
        community: { status: 'active', mode: 'mock' },
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
      const authService = RestAuthService.getInstance();
      const isAuthenticated = await authService.isAuthenticated();

      if (isAuthenticated && userId) {
        // Load user profile if needed
        await authService.getCurrentUser();
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
      await RestAuthService.getInstance().logout();
      // Other cleanup operations can be added here
      return true;
    } catch (error) {
      console.error('Failed to cleanup services:', error);
      return false;
    }
  },

  // Get essential service status
  async getServiceStatus() {
    try {
      const authStatus = await RestAuthService.getInstance().isAuthenticated();
      return {
        auth: authStatus,
        api: true,
        visitors: true,
        community: true,
      };
    } catch (error) {
      console.error('Failed to get service status:', error);
      return { auth: false, api: false, visitors: false, community: false };
    }
  },
};

// Deprecated services notice - for migration reference
export const DEPRECATED_SERVICES_NOTICE = {
  message: 'Legacy services have been moved to services/deprecated folder',
  migratedServices: [
    'api.service.ts → api.client.ts (REST-based HTTP client)',
    'auth.service.ts → auth.service.rest.ts (REST authentication)',
    'billing.service.ts → deprecated (unused mock service)',
    'governance.service.ts → deprecated (unused mock service)',
    'maintenance.service.ts → deprecated (unused mock service)',
    'notification.service.ts → deprecated (minimal usage mock service)',
    'admin/adminAuthService.ts → deprecated (unused admin service)',
  ],
  currentServices: [
    'api.client.ts - Modern HTTP client with interceptors',
    'auth.service.rest.ts - REST-based authentication',
    'visitors.service.rest.ts - REST-based visitor management',
    'communityApi.ts - Community features',
    'biometric.service.ts - Biometric authentication',
    'admin/authService.ts - Admin authentication',
    'admin/roleManager.ts - Role-based access control',
  ],
};
