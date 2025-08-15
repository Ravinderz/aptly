/**
 * Authentication Types
 * Type definitions for authentication, user data, and session management
 * Based on the actual OTP verification API response structure
 */

// User identity data from provider
export interface UserIdentity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
  };
  provider: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
}

// App metadata structure
export interface AppMetadata {
  provider: string;
  providers: string[];
}

// User metadata structure
export interface UserMetadata {
  email: string;
  email_verified: boolean;
  phone_verified: boolean;
  sub: string;
}

// Complete user data structure from API response
export interface AuthUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at?: string;
  phone: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: AppMetadata;
  user_metadata?: UserMetadata;
  identities?: UserIdentity[];
  created_at?: string;
  updated_at?: string;
  is_anonymous?: boolean;
}

// Session data structure from API response
export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: AuthUser;
}

// Complete OTP verification response structure
export interface OTPVerificationResponse {
  success: boolean;
  data: {
    user: AuthUser;
    session: AuthSession;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Email registration request
export interface EmailRegistrationRequest {
  email: string;
  // Add other fields as needed
}

// Email registration response
export interface EmailRegistrationResponse {
  success: boolean;
  data?: {
    sessionId: string;
    // Add other response fields
  };
  error?: {
    code: string;
    message: string;
  };
}

// OTP verification request
export interface OTPVerificationRequest {
  sessionId: string;
  otpCode: string;
  email: string;
}

// Generic API response wrapper
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication state for stores
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

// Token refresh request
export interface TokenRefreshRequest {
  refreshToken: string;
}

// Token refresh response
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

// Session validation request
export interface SessionValidationRequest {
  sessionId: string;
}

// Session validation response
export interface SessionValidationResponse {
  success: boolean;
  data: {
    isValid: boolean;
    session?: AuthSession;
  };
}

// Authentication error types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_INVALID = 'SESSION_INVALID',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED = 'PHONE_NOT_VERIFIED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
}

// Authentication error interface
export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
  details?: any;
}

// Login credentials for different authentication methods
export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  otpCode?: string;
  sessionId?: string;
}

// Biometric authentication options
export interface BiometricAuthOptions {
  promptMessage: string;
  fallbackLabel?: string;
  cancelLabel?: string;
}

// Device information for security
export interface DeviceInfo {
  deviceId: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  screenSize?: string;
}

// Security context for authentication
export interface SecurityContext {
  deviceInfo: DeviceInfo;
  lastLoginLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  loginAttempts: number;
  lastFailedAttempt?: Date;
  isTrustedDevice: boolean;
}

// User profile update request
export interface UserProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  photo?: string;
}

// Logout request
export interface LogoutRequest {
  sessionId?: string;
  allDevices?: boolean;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password reset verification
export interface PasswordResetVerification {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export type {
  AuthUser as User,
  AuthSession as Session,
  AuthState as State,
  AuthResponse as Response,
  AuthError as Error,
};