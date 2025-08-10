/**
 * API Configuration
 * Central configuration for all API-related settings
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Environment-based configuration
const ENV = process.env.NODE_ENV || 'development';

/**
 * API Base URLs for different environments
 */
const API_BASE_URLS = {
  development: 'http://localhost:3000',
  staging: 'https://api-staging.aptly.com',
  production: 'https://api.aptly.com',
} as const;

/**
 * Main API Configuration
 */
export const API_CONFIG = {
  // Base URL based on environment
  BASE_URL: API_BASE_URLS[ENV as keyof typeof API_BASE_URLS] || API_BASE_URLS.development,
  
  // Request timeout (30 seconds)
  TIMEOUT: 30000,
  
  // Token refresh threshold (5 minutes before expiry)
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
    'X-Platform': 'mobile',
  },
  
  // Device information
  DEVICE_INFO: {
    platform: Device.osName || 'unknown',
    deviceId: Constants.sessionId || 'unknown',
    appVersion: Constants.expoConfig?.version || '1.0.0',
  },
} as const;

/**
 * API Endpoints - V4 Backend Implementation (Updated from API Discovery)
 */
export const API_ENDPOINTS = {
  // System health and info
  SYSTEM: {
    HEALTH: '/health',
    API_INFO: '/api',
  },

  // V4 Authentication endpoints
  AUTH: {
    // Regular user authentication
    LOGIN: '/api/v4/auth/login',
    REGISTER: '/api/v4/auth/register',
    PHONE_REGISTER: '/api/v4/auth/register', // Uses same endpoint as register
    VERIFY_OTP: '/api/v4/auth/login', // Uses login endpoint with OTP
    REFRESH_TOKEN: '/api/v4/auth/refresh',
    LOGOUT: '/api/v4/auth/logout',
    ME: '/api/v4/user/profile', // Updated to correct user profile endpoint
    UPDATE_PROFILE: '/api/v4/user/profile',
    // Admin authentication (not available in current API)
    ADMIN_LOGIN: '/api/v4/admin/login', // May not be available
    ADMIN_LOGOUT: '/api/v4/admin/logout',
    ADMIN_VALIDATE_SESSION: '/api/v4/admin/validate-session',
    // Not implemented yet
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // V4 Society management endpoints
  SOCIETIES: {
    LIST: '/api/v4/societies',
    CREATE: '/api/v4/societies',
    DETAILS: (id: string) => `/api/v4/societies/${id}`,
    UPDATE: (id: string) => `/api/v4/societies/${id}`,
    // Not implemented yet
    DELETE: (id: string) => `/api/societies/${id}`,
    MEMBERS: (id: string) => `/api/societies/${id}/members`,
  },

  // V4 Visitor management endpoints
  VISITORS: {
    LIST: '/api/v4/visitors',
    CREATE: '/api/v4/visitors',
    DETAILS: (id: string) => `/api/v4/visitors/${id}`,
    UPDATE: (id: string) => `/api/v4/visitors/${id}`,
    // Legacy endpoints (not available)
    CHECK_IN: (id: string) => `/api/visitors/${id}/check-in`,
    CHECK_OUT: (id: string) => `/api/visitors/${id}/check-out`,
  },

  // V4 Home dashboard endpoints
  HOME: {
    DASHBOARD: '/api/v4/home',
    STATS: '/api/v4/home/stats',
  },

  // V4 Maintenance service endpoints
  MAINTENANCE: {
    LIST: '/api/v4/services/maintenance',
    CREATE: '/api/v4/services/maintenance',
    DETAILS: (id: string) => `/api/v4/services/maintenance/${id}`,
    UPDATE: (id: string) => `/api/v4/services/maintenance/${id}`,
  },

  // V4 Billing service endpoints
  BILLING: {
    LIST: '/api/v4/services/billing',
    CREATE: '/api/v4/services/billing',
    DETAILS: (id: string) => `/api/v4/services/billing/${id}`,
    UPDATE: (id: string) => `/api/v4/services/billing/${id}`,
  },

  // Notice management endpoints (separate from V4)
  NOTICES: {
    LIST: '/api/notices',
    LIST_ALL: '/api/notices/all',
    GET: (id: string) => `/api/notices/${id}`,
    CREATE: '/api/notices',
    UPDATE: (id: string) => `/api/notices/${id}`,
    DELETE: (id: string) => `/api/notices/${id}`,
    DEACTIVATE: (id: string) => `/api/notices/${id}/deactivate`,
    STATISTICS: '/api/notices/statistics',
    CLEANUP: '/api/notices/cleanup',
  },

  // Community management endpoints
  COMMUNITY: {
    POSTS: '/api/community/posts',
    USERS: '/api/community/users',
    COMMENTS: '/api/community/comments',
  },

  // User management endpoints (to be implemented)
  USERS: {
    PROFILE: '/api/users/profile',
    SOCIETIES: '/api/users/societies',
    PERMISSIONS: '/api/users/permissions',
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },

  // Admin endpoints (to be implemented - map to V4 where possible)
  ADMIN: {
    DASHBOARD: '/api/v4/home/stats', // Use home stats for now
    USERS: '/api/admin/users',
    SOCIETIES: '/api/v4/societies', // Use V4 societies endpoint
    COMPLAINTS: '/api/admin/complaints',
    ONBOARDING: '/api/admin/onboarding',
    ONBOARDING_REQUEST: (id: string) => `/api/admin/onboarding/${id}`,
  },

  // Manager endpoints (to be implemented - map to V4 where possible)
  MANAGER: {
    DASHBOARD: '/api/v4/home/stats', // Use home stats for now
    TEAMS: '/api/manager/teams',
    REPORTS: '/api/manager/reports',
    SUPPORT: '/api/v4/services/maintenance', // Use maintenance for support tickets
    ANALYTICS: '/api/manager/analytics',
  },

  // Security endpoints (to be implemented)
  SECURITY: {
    DASHBOARD: '/api/security/dashboard',
    INCIDENTS: '/api/security/incidents',
    EMERGENCY: '/api/security/emergency',
    VEHICLES: '/api/security/vehicles',
    AUDIT_LOGS: '/api/security/audit-logs',
    ACCESS_CONTROL: '/api/security/access-control',
  },

  // File upload endpoints (to be implemented)
  UPLOADS: {
    IMAGES: '/api/uploads/images',
    DOCUMENTS: '/api/uploads/documents',
    AVATARS: '/api/uploads/avatars',
  },
} as const;

/**
 * API Error Messages
 */
export const API_ERRORS = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
  retryCondition: (error: any) => {
    // Retry on network errors and 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  // Cache TTL in milliseconds
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SHORT_TTL: 60 * 1000, // 1 minute
  LONG_TTL: 30 * 60 * 1000, // 30 minutes
  
  // Cache keys
  KEYS: {
    USER_PROFILE: 'user_profile',
    SOCIETIES: 'societies',
    PERMISSIONS: 'permissions',
    DASHBOARD_DATA: 'dashboard_data',
  },
} as const;

/**
 * WebSocket Configuration (for real-time features)
 */
export const WS_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL.replace('http', 'ws'),
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 3000,
  HEARTBEAT_INTERVAL: 30000,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Development Configuration
 */
export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  ENABLE_MOCK_DATA: false, // Set to false to use real API (V4 backend integrated)
  API_DELAY: __DEV__ ? 500 : 0, // Simulate API delay in development
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
} as const;