/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

import Constants from 'expo-constants';

// Environment configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api/v1' 
    : 'https://api.aptly.app/v1',
  
  // Request timeouts (in milliseconds)
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Token refresh threshold (refresh when token expires in less than 5 minutes)
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Device info
  get DEVICE_INFO() {
    return {
      platform: Constants.platform?.ios ? 'ios' : 'android',
      deviceId: Constants.installationId || 'unknown',
      appVersion: Constants.expoConfig?.version || '1.0.0',
      buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
    };
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    PHONE_REGISTER: '/auth/phone/register',
    VERIFY_OTP: '/auth/phone/verify',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
  },
  
  // Society
  SOCIETY: {
    VERIFY_CODE: '/society/verify',
    JOIN: '/society/join',
    GET_INFO: (societyId: string) => `/society/${societyId}`,
    MEMBERS: (societyId: string) => `/society/${societyId}/members`,
  },
  
  // Visitors
  VISITORS: {
    LIST: '/visitors',
    CREATE: '/visitors',
    GET: (id: string) => `/visitors/${id}`,
    UPDATE: (id: string) => `/visitors/${id}`,
    DELETE: (id: string) => `/visitors/${id}`,
    CHECK_IN: (id: string) => `/visitors/${id}/check-in`,
    CHECK_OUT: (id: string) => `/visitors/${id}/check-out`,
    APPROVE: (id: string) => `/visitors/${id}/approve`,
    REJECT: (id: string) => `/visitors/${id}/reject`,
    QR_CODE: (id: string) => `/visitors/${id}/qr-code`,
  },
  
  // Community
  COMMUNITY: {
    POSTS: '/community/posts',
    POST: (id: string) => `/community/posts/${id}`,
    COMMENTS: (postId: string) => `/community/posts/${postId}/comments`,
    COMMENT: (postId: string, commentId: string) => `/community/posts/${postId}/comments/${commentId}`,
    LIKE_POST: (postId: string) => `/community/posts/${postId}/like`,
    LIKE_COMMENT: (postId: string, commentId: string) => `/community/posts/${postId}/comments/${commentId}/like`,
  },
  
  // Maintenance
  MAINTENANCE: {
    REQUESTS: '/maintenance/requests',
    REQUEST: (id: string) => `/maintenance/requests/${id}`,
    COMMON_AREA: '/maintenance/common-area',
  },
  
  // Notices
  NOTICES: {
    LIST: '/notices',
    GET: (id: string) => `/notices/${id}`,
    CREATE: '/notices',
    UPDATE: (id: string) => `/notices/${id}`,
    DELETE: (id: string) => `/notices/${id}`,
  },
  
  // Billing
  BILLING: {
    BILLS: '/billing/bills',
    BILL: (id: string) => `/billing/bills/${id}`,
    PAYMENT: (billId: string) => `/billing/bills/${billId}/payment`,
    PAYMENT_HISTORY: '/billing/payments',
  },
  
  // File Upload
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
    AVATAR: '/upload/avatar',
    DOCUMENT: '/upload/document',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    RESIDENTS: '/analytics/residents',
    VISITORS: '/analytics/visitors',
    MAINTENANCE: '/analytics/maintenance',
    BILLING: '/analytics/billing',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    REGISTER_TOKEN: '/notifications/register-token',
  },
} as const;

// Error messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'Access denied. You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Request retry configuration
export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000),
  retryCondition: (error: any) => {
    // Retry on network errors and 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
} as const;