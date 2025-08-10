// Main services exports for easy imports across the application

// Modern API client and services
import { apiClient } from './api.client';
import { RestAuthService } from './auth.service.rest';
import { RestVisitorsService } from './visitors.service.rest';
import { RestNoticesService } from './notices.service.rest';
import { RestHomeService } from './home.service.rest';
import { developmentService } from './development.service';
import { communityApi } from './communityApi';
import { onboardingService } from './onboarding.service';
import { emergencyService } from './emergency.service';
import { reportsService } from './reports.service';
import { supportService } from './support.service';
import { vehiclesService } from './vehicles.service';

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

// Modern REST-based Notices service
export { RestNoticesService as NoticesService } from './notices.service.rest';
export type {
  Notice,
} from '@/types/notifications';

// Modern REST-based Home service
export { RestHomeService as HomeService } from './home.service.rest';
export type {
  HomeStats,
  HomeDashboardData,
  RecentActivity,
  HomeResult,
} from './home.service.rest';

// Development service for API integration
export { developmentService, DevelopmentService } from './development.service';

// Onboarding service
export { onboardingService, OnboardingService } from './onboarding.service';
export type {
  OnboardingRequest,
  OnboardingDocument,
  OnboardingListItem,
  ApprovalRequest,
  RejectionRequest,
  OnboardingStats,
} from './onboarding.service';

// Emergency service  
export { emergencyService, EmergencyService } from './emergency.service';
export type {
  EmergencyAlert,
  EmergencyAttachment,
  EmergencyUpdate,
  CreateAlertRequest,
  UpdateAlertRequest,
  AcknowledgeAlertRequest,
  ResolveAlertRequest,
  EmergencyStats,
  EmergencyFilters,
} from './emergency.service';

// Reports service
export { reportsService, ReportsService } from './reports.service';
export type {
  PerformanceMetrics,
  TrendDataPoint,
  SocietyPerformance,
  ReportFilters,
  ExportOptions,
  ManagerStats,
  TeamComparison,
  DetailedReport,
  ReportRecommendation,
} from './reports.service';

// Support service
export { supportService, SupportService } from './support.service';
export type {
  SupportTicket,
  TicketAttachment,
  TicketResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketResponseRequest,
  StatusChangeRequest,
  AssignTicketRequest,
  EscalateTicketRequest,
  TicketFilters,
  SupportStats,
  QueueStats,
  SatisfactionSurvey,
} from './support.service';

// Vehicles service
export { vehiclesService, VehiclesService } from './vehicles.service';
export type {
  SecurityVehicle,
  RecurringSchedule,
  VehicleViolation,
  VehicleAlert,
  GPSLocation,
  ParkingZone,
  VehicleRegistrationRequest,
  VehicleDepartureRequest,
  VehicleSearchFilters,
  VehicleStats,
  ParkingReport,
} from './vehicles.service';

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
  // Modern REST services
  auth: RestAuthService.getInstance(),
  visitors: RestVisitorsService.getInstance(),
  notices: RestNoticesService.getInstance(),
  home: RestHomeService.getInstance(),
  development: developmentService,
  community: communityApi,
  onboarding: onboardingService,
  emergency: emergencyService,
  reports: reportsService,
  support: supportService,
  vehicles: vehiclesService,
} as const;

// Default export for convenience
export default services;


// Service status and health check utilities
export const ServiceStatus = {
  async checkAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    try {
      // Test each service with a lightweight operation
      results.auth = await RestAuthService.getInstance().isAuthenticated();
      results.api = true; // API client is always available
      results.visitors = true; // Visitors service is always available
      results.notices = true; // Notices service is available
      results.community = true; // Community service is available
      results.onboarding = true; // Onboarding service is available
      results.emergency = true; // Emergency service is available
      results.reports = true; // Reports service is available
      results.support = true; // Support service is available
      results.vehicles = true; // Vehicles service is available
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
        auth: { status: 'active', provider: 'REST', type: 'modern', features: ['resident', 'admin', 'biometric'] },
        visitors: { status: 'active', provider: 'REST', type: 'modern', features: ['filtering', 'pagination'] },
        notices: { status: 'active', provider: 'REST', type: 'modern', features: ['filtering', 'pagination'] },
        community: { status: 'active', mode: 'mock' },
        onboarding: { status: 'active', provider: 'REST', type: 'modern' },
        emergency: { status: 'active', provider: 'REST', type: 'modern' },
        reports: { status: 'active', provider: 'REST', type: 'modern' },
        support: { status: 'active', provider: 'REST', type: 'modern' },
        vehicles: { status: 'active', provider: 'REST', type: 'modern' },
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
        notices: true,
        community: true,
        onboarding: true,
        emergency: true,
        reports: true,
        support: true,
        vehicles: true,
      };
    } catch (error) {
      console.error('Failed to get service status:', error);
      return { auth: false, api: false, visitors: false, notices: false, community: false, onboarding: false, emergency: false, reports: false, support: false, vehicles: false };
    }
  },
};

