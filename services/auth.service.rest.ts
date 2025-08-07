/**
 * REST Authentication Service
 * Complete authentication service with REST API integration
 */

import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';
import { apiClient, APIClientError } from '@/services/api.client';
import { 
  SecureTokenStorage, 
  SecureProfileStorage, 
  SecureSessionStorage, 
  SecureBiometricStorage,
  clearAllSecureStorage 
} from '@/utils/storage.secure';
import { API_ENDPOINTS, API_CONFIG } from '@/config/api.config';
import {
  APIResponse,
  LoginRequest,
  LoginResponse,
  OTPVerificationRequest,
  AuthTokens,
  AuthUser,
  ProfileUpdateRequest,
  TokenData,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UserProfileExtended,
  DeviceInfo
} from '@/types/api';

// Validation schemas using Zod
const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
  .refine((phone) => isValidPhoneNumber(phone, 'IN'), {
    message: 'Please enter a valid Indian mobile number'
  });

const otpSchema = z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

const societyCodeSchema = z.string()
  .min(4, 'Society code must be at least 4 characters')
  .max(10, 'Society code cannot exceed 10 characters')
  .regex(/^[A-Z0-9]+$/, 'Society code must contain only uppercase letters and numbers');

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  requiresOTP?: boolean;
  sessionId?: string;
}

/**
 * User profile interface (compatible with existing code)
 */
export interface UserProfile extends AuthUser {
  // Additional fields for backward compatibility
  flatNumber: string;
  ownershipType: 'owner' | 'tenant';
  familySize: number;
  emergencyContact: string;
  societyCode: string;
  fullName: string;
}

/**
 * Enhanced REST Authentication Service
 */
export class RestAuthService {
  private static instance: RestAuthService;
  private currentUser: UserProfile | null = null;

  private constructor() {
    // Initialize device info
    this.initializeDeviceInfo();
  }

  static getInstance(): RestAuthService {
    if (!RestAuthService.instance) {
      RestAuthService.instance = new RestAuthService();
    }
    return RestAuthService.instance;
  }

  /**
   * Initialize device information
   */
  private async initializeDeviceInfo(): Promise<void> {
    try {
      const deviceId = API_CONFIG.DEVICE_INFO.deviceId;
      SecureSessionStorage.storeDeviceId(deviceId);
    } catch (error) {
      console.warn('⚠️ Failed to initialize device info:', error);
    }
  }

  /**
   * Register phone number and request OTP
   */
  async registerPhone(phoneNumber: string, societyCode: string): Promise<AuthResult> {
    try {
      // Validate inputs
      const phoneValidation = phoneSchema.safeParse(phoneNumber);
      if (!phoneValidation.success) {
        return {
          success: false,
          error: phoneValidation.error.issues[0].message,
        };
      }

      const codeValidation = societyCodeSchema.safeParse(societyCode.toUpperCase());
      if (!codeValidation.success) {
        return {
          success: false,
          error: codeValidation.error.issues[0].message,
        };
      }

      // Format phone number
      const parsedPhone = parsePhoneNumber(phoneNumber, 'IN');
      const formattedPhone = parsedPhone.format('E.164');

      // Prepare request
      const requestData: LoginRequest = {
        phoneNumber: formattedPhone,
        countryCode: 'IN',
      };

      // Make API call
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.PHONE_REGISTER,
        requestData
      );

      if (response.success) {
        // Store society code for future requests
        SecureSessionStorage.storeSocietyCode(societyCode.toUpperCase());
        SecureSessionStorage.storeSessionId(response.data.sessionId);

        return {
          success: true,
          data: { message: 'OTP sent successfully' },
          requiresOTP: true,
          sessionId: response.data.sessionId,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to send OTP',
        };
      }
    } catch (error) {
      console.error('❌ Phone registration failed:', error);
      
      if (error instanceof APIClientError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Verify OTP and complete authentication
   */
  async verifyOTP(phoneNumber: string, otp: string, sessionId?: string): Promise<AuthResult> {
    try {
      // Validate OTP
      const otpValidation = otpSchema.safeParse(otp);
      if (!otpValidation.success) {
        return {
          success: false,
          error: otpValidation.error.issues[0].message,
        };
      }

      // Get session ID from storage if not provided
      const currentSessionId = sessionId || SecureSessionStorage.getSessionId();
      if (!currentSessionId) {
        return {
          success: false,
          error: 'Session expired. Please request OTP again.',
        };
      }

      // Format phone number
      const parsedPhone = parsePhoneNumber(phoneNumber, 'IN');
      const formattedPhone = parsedPhone.format('E.164');

      // Prepare request
      const requestData: OTPVerificationRequest = {
        sessionId: currentSessionId,
        otp,
      };

      // Make API call
      const response = await apiClient.post<{ user: AuthUser; tokens: AuthTokens }>(
        API_ENDPOINTS.AUTH.VERIFY_OTP,
        requestData
      );

      if (response.success) {
        // Store tokens securely
        const tokenData: TokenData = {
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          expiresAt: Date.now() + (8 * 60 * 60 * 1000), // Default 8 hours
          tokenType: 'Bearer',
        };

        await SecureTokenStorage.storeTokens(tokenData);

        // Store user profile
        const userProfile = this.convertToUserProfile(response.data.user);
        SecureProfileStorage.storeProfile(userProfile);
        this.currentUser = userProfile;

        // Store login timestamp
        SecureSessionStorage.storeLastLoginTime(Date.now());

        return {
          success: true,
          data: {
            message: 'OTP verified successfully',
            user: userProfile,
            tokens: response.data.tokens,
          },
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Invalid OTP. Please try again.',
        };
      }
    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      
      if (error instanceof APIClientError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await apiClient.get<AuthUser>(API_ENDPOINTS.AUTH.ME);

      if (response.success) {
        const userProfile = this.convertToUserProfile(response.data);
        SecureProfileStorage.storeProfile(userProfile);
        this.currentUser = userProfile;
        return userProfile;
      }
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
    }

    return null;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<AuthResult> {
    try {
      const updateRequest: ProfileUpdateRequest = {
        name: profileData.name || profileData.fullName,
        email: profileData.email,
        avatar: profileData.avatar,
      };

      const response = await apiClient.patch<AuthUser>(
        API_ENDPOINTS.AUTH.UPDATE_PROFILE,
        updateRequest
      );

      if (response.success) {
        const updatedProfile = this.convertToUserProfile(response.data);
        SecureProfileStorage.storeProfile(updatedProfile);
        this.currentUser = updatedProfile;

        return {
          success: true,
          data: updatedProfile,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      
      if (error instanceof APIClientError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<TokenData | null> {
    try {
      const refreshToken = SecureTokenStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const requestData: RefreshTokenRequest = { refreshToken };

      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        requestData
      );

      if (response.success) {
        const tokenData: TokenData = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: Date.now() + (response.data.expiresIn * 1000),
          tokenType: 'Bearer',
        };

        await SecureTokenStorage.storeTokens(tokenData);
        return tokenData;
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
    }

    return null;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout API
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('⚠️ Logout API call failed:', error);
    } finally {
      // Clear all stored data
      await clearAllSecureStorage();
      this.currentUser = null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = SecureTokenStorage.getTokens();
    if (!tokens) {
      return false;
    }

    // Check if token is expired
    if (SecureTokenStorage.isTokenExpired()) {
      try {
        const newTokens = await this.refreshToken();
        return newTokens !== null;
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get stored user profile
   */
  async getStoredProfile(): Promise<UserProfile | null> {
    return SecureProfileStorage.getProfile<UserProfile>();
  }

  /**
   * Create user profile (for new users)
   */
  async createProfile(profileData: Partial<UserProfile>): Promise<AuthResult> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        return { success: false, error: 'Authentication required' };
      }

      // For now, we'll update the profile instead of creating a new one
      // In a real implementation, this would be a separate endpoint
      return await this.updateProfile(profileData);
    } catch (error) {
      console.error('❌ Profile creation failed:', error);
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Associate user with society (if needed)
   */
  async associateWithSociety(
    userId: string, 
    societyId: string, 
    flatNumber: string
  ): Promise<AuthResult> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SOCIETY.JOIN, {
        userId,
        societyId,
        flatNumber,
      });

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to associate with society',
        };
      }
    } catch (error) {
      console.error('❌ Society association failed:', error);
      
      if (error instanceof APIClientError) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Security guard specific methods (for backward compatibility)
   */
  async validateSecurityGuardRole(user: UserProfile): Promise<boolean> {
    return user.role === 'security_guard';
  }

  async getSecurityGuardPermissions(userId: string): Promise<any> {
    try {
      // In a real implementation, this would be a dedicated endpoint
      const user = await this.getCurrentUser();
      if (user?.role === 'security_guard') {
        return {
          canCreateVisitor: true,
          canCheckInOut: true,
          canViewHistory: true,
          canHandleEmergency: true,
          canManageVehicles: true,
          canAccessReports: false,
          canModifyVisitorData: true,
          canOverrideApprovals: false,
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get security guard permissions:', error);
      return null;
    }
  }

  async updateSecurityGuardShift(userId: string, shiftData: any): Promise<AuthResult> {
    try {
      // In a real implementation, this would be a dedicated endpoint
      return {
        success: true,
        data: { message: 'Shift updated successfully', shift: shiftData },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update shift information',
      };
    }
  }

  async isSecurityGuard(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'security_guard';
  }

  async hasSecurityAccess(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'security_guard' && user?.isVerified === true;
  }

  /**
   * Convert AuthUser to UserProfile for backward compatibility
   */
  private convertToUserProfile(authUser: AuthUser): UserProfile {
    return {
      ...authUser,
      fullName: authUser.name || '',
      flatNumber: authUser.flatNumber || '',
      ownershipType: 'owner' as const,
      familySize: 1,
      emergencyContact: '',
      societyCode: authUser.societyCode || SecureSessionStorage.getSocietyCode() || '',
    };
  }

  /**
   * Refresh user data from server
   */
  async refreshUserData(): Promise<void> {
    try {
      await this.getCurrentUser();
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
    }
  }

  /**
   * Get access token (for direct access)
   */
  async getAccessToken(): Promise<string | null> {
    return SecureTokenStorage.getAccessToken();
  }
}

// Create singleton instance
const restAuthService = RestAuthService.getInstance();
export default restAuthService;

// Export compatible interface with existing auth service
export {
  restAuthService as AuthService,
  type UserProfile,
  type AuthResult,
};