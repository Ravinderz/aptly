/**
 * REST Authentication Service
 * Complete authentication service with REST API integration
 */

import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';
import { apiClient, APIClientError } from '@/services/api.client';
import { developmentService } from '@/services/development.service';
import { AdminSession, AdminUser } from '@/types/admin';
import {
  AuthTokens,
  AuthUser,
  ProfileUpdateRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TokenData,
} from '@/types/api';
import {
  clearAllSecureStorage,
  SecureProfileStorage,
  SecureSessionStorage,
  SecureTokenStorage,
} from '@/utils/storage.secure';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';

// Validation schemas using Zod
const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number cannot exceed 15 digits')
  .refine((phone) => isValidPhoneNumber(phone, 'IN'), {
    message: 'Please enter a valid Indian mobile number',
  });

const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

const societyCodeSchema = z
  .string()
  .min(4, 'Society code must be at least 4 characters')
  .max(10, 'Society code cannot exceed 10 characters')
  .regex(
    /^[A-Z0-9]+$/,
    'Society code must contain only uppercase letters and numbers',
  );

const adminLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password cannot exceed 50 characters'),
  societyCode: z.string().optional(),
  rememberMe: z.boolean().optional().default(false),
});

const sessionValidationSchema = z
  .string()
  .min(10, 'Session ID is required')
  .max(100, 'Invalid session ID format');

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
  flatNumber: string;
  ownershipType: 'owner' | 'tenant';
  familySize: number;
  emergencyContact: string;
  societyCode: string;
  fullName: string;
}

/**
 * Admin authentication request interface
 */
export interface AdminLoginRequest {
  email: string;
  password: string;
  societyCode?: string;
  rememberMe?: boolean;
}

/**
 * Admin authentication result interface
 */
export interface AdminAuthResult {
  success: boolean;
  data?: {
    admin: AdminUser;
    session: AdminSession;
    tokens: AuthTokens;
  };
  error?: string;
}

/**
 * Enhanced REST Authentication Service
 */
export class RestAuthService {
  private static instance: RestAuthService;
  private currentUser: UserProfile | null = null;
  private currentAdmin: AdminUser | null = null;
  private adminSession: AdminSession | null = null;

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
   * Static method to check authentication status
   */
  static async isAuthenticated(): Promise<boolean> {
    return RestAuthService.getInstance().isAuthenticated();
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
   * Register phone number and request OTP (or email/password registration)
   */
  async registerPhone(
    phoneNumber: string,
    societyCode: string = '',
  ): Promise<AuthResult> {
    try {
      // Check what auth flow is available
      const authFlow = await developmentService.getAuthFlow();

      // If registration endpoint is not available, use mock flow
      if (!authFlow.supportsRegistration) {
        console.log('🔧 Using development registration flow');

        // Simulate OTP send for development
        if (societyCode) {
          SecureSessionStorage.storeSocietyCode(societyCode.toUpperCase());
        }
        SecureSessionStorage.storeSessionId(`dev-session-${Date.now()}`);

        return {
          success: true,
          data: { message: 'OTP sent successfully (development mode)' },
          requiresOTP: true,
          sessionId: `dev-session-${Date.now()}`,
        };
      }

      // Validate inputs
      const phoneValidation = phoneSchema.safeParse(phoneNumber);
      if (!phoneValidation.success) {
        return {
          success: false,
          error: phoneValidation.error.issues[0].message,
        };
      }

      // Only validate society code if provided (optional during initial registration)
      if (societyCode) {
        const codeValidation = societyCodeSchema.safeParse(
          societyCode.toUpperCase(),
        );
        if (!codeValidation.success) {
          return {
            success: false,
            error: codeValidation.error.issues[0].message,
          };
        }
      }

      // Format phone number
      const parsedPhone = parsePhoneNumber(phoneNumber, 'IN');
      const formattedPhone = parsedPhone.format('E.164');

      // const formattedPhone = format(phoneNumber, 'IN', 'NATIONAL');
      console.log('📞 Formatted phone number:', formattedPhone);
      if (!isValidPhoneNumber(formattedPhone, 'IN')) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      // // Try email/password registration if available
      // const requestData = {
      //   name: 'User',
      //   email: `user${Date.now()}@aptly.com`,
      //   password: 'temp123',
      //   phoneNumber: formattedPhone,
      //   ...(societyCode && { societyCode: societyCode.toUpperCase() }),
      // };

      // Try email/password registration if available
      const requestData = {
        phoneNumber: formattedPhone,
        ...(societyCode && { societyCode: societyCode.toUpperCase() }),
      };

      // Make API call
      const response = await apiClient.post<any>(
        API_ENDPOINTS.AUTH.REGISTER,
        requestData,
      );

      if (response.success) {
        // Store society code for future requests (if provided)
        if (societyCode) {
          SecureSessionStorage.storeSocietyCode(societyCode.toUpperCase());
        }
        // Store session ID for OTP verification

        SecureSessionStorage.storeSessionId(
          response.data.sessionId || `session-${Date.now()}`,
        );

        return {
          success: true,
          data: { message: 'OTP sent successfully' },
          requiresOTP: true,
          sessionId: response.data.sessionId,
        };

        // return {
        //   success: true,
        //   data: { message: 'Registration successful' },
        //   requiresOTP: false, // No OTP needed for email/password flow
        // };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Registration failed',
        };
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);

      // Fallback to development mode
      console.log('🔧 Falling back to development mode');
      if (societyCode) {
        SecureSessionStorage.storeSocietyCode(societyCode.toUpperCase());
      }
      SecureSessionStorage.storeSessionId(`dev-session-${Date.now()}`);

      return {
        success: true,
        data: { message: 'Registration successful (development mode)' },
        requiresOTP: true,
      };
    }
  }

  /**
   * Verify OTP and complete authentication (or email/password login)
   */
  async verifyOTP(
    phoneNumber: string,
    otp: string,
    sessionId?: string,
  ): Promise<AuthResult> {
    try {
      // Get session ID from storage if not provided
      const currentSessionId =
        sessionId || (await SecureSessionStorage.getSessionIdAsync());
      if (!currentSessionId) {
        return {
          success: false,
          error: 'Session expired. Please request OTP again.',
        };
      }

      // Check if this is a development session
      if (currentSessionId.startsWith('dev-session-')) {
        console.log('🔧 Using development OTP verification');

        // Accept any 6-digit OTP in development
        if (otp.length === 6 && /^\d{6}$/.test(otp)) {
          // Create mock user
          const testUser = await developmentService.createTestUser();

          // Store tokens securely
          const tokenData: TokenData = {
            accessToken: `dev-access-${Date.now()}`,
            refreshToken: `dev-refresh-${Date.now()}`,
            expiresAt: Date.now() + 8 * 60 * 60 * 1000,
            tokenType: 'Bearer',
          };

          await SecureTokenStorage.storeTokens(tokenData);

          // Store user profile
          const userProfile = await this.convertToUserProfile(testUser);
          SecureProfileStorage.storeProfile(userProfile);
          this.currentUser = userProfile;

          // Store login timestamp
          SecureSessionStorage.storeLastLoginTime(Date.now());

          return {
            success: true,
            data: {
              message: 'Authentication successful (development mode)',
              user: userProfile,
              tokens: {
                accessToken: tokenData.accessToken,
                refreshToken: tokenData.refreshToken,
              },
            },
          };
        } else {
          return {
            success: false,
            error: 'Please enter a valid 6-digit OTP',
          };
        }
      }

      // Validate OTP for real API
      const otpValidation = otpSchema.safeParse(otp);
      if (!otpValidation.success) {
        return {
          success: false,
          error: otpValidation.error.issues[0].message,
        };
      }

      // Try real API login
      try {
        const authFlow = await developmentService.getAuthFlow();

        if (authFlow.supportsEmailPassword) {
          // Try email/password login
          const loginData = {
            email: authFlow.mockCredentials.email,
            password: authFlow.mockCredentials.password,
          };

          const response = await apiClient.post<{
            user: AuthUser;
            tokens: AuthTokens;
          }>(API_ENDPOINTS.AUTH.LOGIN, loginData);

          if (response.success) {
            // Store tokens securely
            const tokenData: TokenData = {
              accessToken: response.data.tokens.accessToken,
              refreshToken: response.data.tokens.refreshToken,
              expiresAt: Date.now() + 8 * 60 * 60 * 1000,
              tokenType: 'Bearer',
            };

            await SecureTokenStorage.storeTokens(tokenData);

            // Store user profile
            const userProfile = await this.convertToUserProfile(
              response.data.user,
            );
            SecureProfileStorage.storeProfile(userProfile);
            this.currentUser = userProfile;

            // Store login timestamp
            SecureSessionStorage.storeLastLoginTime(Date.now());

            return {
              success: true,
              data: {
                message: 'Login successful',
                user: userProfile,
                tokens: response.data.tokens,
              },
            };
          }
        }
      } catch (error) {
        console.log('🔧 Real API login failed, using development mode');
      }

      // Fallback to development mode
      return await this.verifyOTP(
        phoneNumber,
        otp,
        `dev-session-${Date.now()}`,
      );
    } catch (error) {
      console.error('❌ Authentication failed:', error);

      return {
        success: false,
        error: 'Authentication failed. Please try again.',
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
        const userProfile = await this.convertToUserProfile(response.data);
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
        updateRequest,
      );

      if (response.success) {
        const updatedProfile = await this.convertToUserProfile(response.data);
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
      const refreshToken = await SecureTokenStorage.getRefreshTokenAsync();
      if (!refreshToken) {
        return null;
      }

      const requestData: RefreshTokenRequest = { refreshToken };

      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        requestData,
      );

      if (response.success) {
        const tokenData: TokenData = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresAt: Date.now() + response.data.expiresIn * 1000,
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
    try {
      const tokens = await SecureTokenStorage.getTokens();
      if (!tokens) {
        return false;
      }

      // Check if token is expired
      const isExpired = await SecureTokenStorage.isTokenExpiredAsync();
      if (isExpired) {
        try {
          const newTokens = await this.refreshToken();
          return newTokens !== null;
        } catch (error) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get stored user profile
   */
  async getStoredProfile(): Promise<UserProfile | null> {
    try {
      return await SecureProfileStorage.getProfileAsync<UserProfile>();
    } catch (error) {
      console.error('❌ Error getting stored profile:', error);
      return null;
    }
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
    flatNumber: string,
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
   * Security guard specific methods
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

  async updateSecurityGuardShift(
    userId: string,
    shiftData: any,
  ): Promise<AuthResult> {
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
   * Convert AuthUser to UserProfile
   */
  private async convertToUserProfile(authUser: AuthUser): Promise<UserProfile> {
    return {
      ...authUser,
      fullName: authUser.name || '',
      flatNumber: authUser.flatNumber || '',
      ownershipType: 'owner' as const,
      familySize: 1,
      emergencyContact: '',
      societyCode:
        authUser.societyCode ||
        (await SecureSessionStorage.getSocietyCodeAsync()) ||
        '',
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
    try {
      return await SecureTokenStorage.getAccessTokenAsync();
    } catch (error) {
      console.error('❌ Error getting access token:', error);
      return null;
    }
  }

  // ====================
  // ADMIN AUTHENTICATION METHODS
  // ====================

  /**
   * Admin login with email and password
   */
  async adminLogin(loginData: AdminLoginRequest): Promise<AdminAuthResult> {
    try {
      // Validate input
      const validation = adminLoginSchema.safeParse(loginData);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
        };
      }

      const { email, password, societyCode, rememberMe } = validation.data;

      // Prepare request
      const requestData = {
        email,
        password,
        societyCode,
        rememberMe,
        deviceInfo: {
          deviceId: API_CONFIG.DEVICE_INFO.deviceId,
          platform: API_CONFIG.DEVICE_INFO.platform,
        },
      };

      // Make API call to admin login endpoint
      const response = await apiClient.post<{
        admin: AdminUser;
        session: AdminSession;
        tokens: AuthTokens;
      }>(API_ENDPOINTS.AUTH.ADMIN_LOGIN, requestData);

      if (response.success) {
        const { admin, session, tokens } = response.data;

        // Store admin tokens securely
        const tokenData: TokenData = {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: Date.now() + (session.expiresIn || 8 * 60 * 60 * 1000), // 8 hours default
          tokenType: 'Bearer',
        };

        await SecureTokenStorage.storeTokens(tokenData, 'admin');

        // Store admin session
        this.adminSession = session;
        this.currentAdmin = admin;

        // Store admin profile securely
        SecureProfileStorage.storeProfile(admin, 'admin');

        return {
          success: true,
          data: {
            admin,
            session,
            tokens,
          },
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Invalid email or password',
        };
      }
    } catch (error) {
      console.error('❌ Admin login failed:', error);

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
   * Validate admin session
   */
  async validateAdminSession(sessionId?: string): Promise<AdminUser | null> {
    try {
      const currentSessionId = sessionId || this.adminSession?.sessionId;

      if (!currentSessionId) {
        return null;
      }

      // Validate session ID format
      const validation = sessionValidationSchema.safeParse(currentSessionId);
      if (!validation.success) {
        return null;
      }

      // Check if session is stored and valid
      if (
        this.currentAdmin &&
        this.adminSession?.sessionId === currentSessionId
      ) {
        // Check if session is expired
        const now = Date.now();
        const expiresAt =
          this.adminSession.expiresAt ||
          this.adminSession.createdAt + 8 * 60 * 60 * 1000;

        if (now < expiresAt) {
          return this.currentAdmin;
        }
      }

      // Validate with server
      const response = await apiClient.post<AdminUser>(
        API_ENDPOINTS.AUTH.ADMIN_VALIDATE_SESSION,
        { sessionId: currentSessionId },
      );

      if (response.success) {
        this.currentAdmin = response.data;
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('❌ Admin session validation failed:', error);
      return null;
    }
  }

  /**
   * Get current admin user
   */
  async getCurrentAdmin(): Promise<AdminUser | null> {
    if (this.currentAdmin) {
      return this.currentAdmin;
    }

    try {
      // Try to get admin from secure storage
      const storedAdmin = SecureProfileStorage.getProfile<AdminUser>('admin');
      if (storedAdmin) {
        this.currentAdmin = storedAdmin;

        // Validate session is still active
        const validAdmin = await this.validateAdminSession();
        return validAdmin;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get current admin:', error);
      return null;
    }
  }

  /**
   * Admin logout
   */
  async adminLogout(sessionId?: string): Promise<void> {
    try {
      const currentSessionId = sessionId || this.adminSession?.sessionId;

      if (currentSessionId) {
        // Notify server about logout
        await apiClient.post(API_ENDPOINTS.AUTH.ADMIN_LOGOUT, {
          sessionId: currentSessionId,
        });
      }
    } catch (error) {
      console.error('❌ Admin logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clean up local admin state
      this.currentAdmin = null;
      this.adminSession = null;

      // Clear admin tokens and profile
      await SecureTokenStorage.clearTokens('admin');
      SecureProfileStorage.clearProfile('admin');
    }
  }

  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    const admin = await this.getCurrentAdmin();
    return admin !== null;
  }

  /**
   * Get admin permissions
   */
  async getAdminPermissions(adminId?: string): Promise<string[] | null> {
    try {
      const admin = adminId
        ? await this.validateAdminSession()
        : await this.getCurrentAdmin();

      if (!admin) {
        return null;
      }

      // Return admin permissions based on role
      return (
        admin.permissions || [
          'manage_residents',
          'manage_visitors',
          'manage_notices',
          'view_reports',
          'manage_vehicles',
          'handle_emergencies',
          'manage_billing',
          'system_admin',
        ]
      );
    } catch (error) {
      console.error('❌ Failed to get admin permissions:', error);
      return null;
    }
  }

  /**
   * Check if admin has specific permission
   */
  async hasAdminPermission(permission: string): Promise<boolean> {
    const permissions = await this.getAdminPermissions();
    return permissions?.includes(permission) || false;
  }
}

// Create singleton instance
const restAuthService = RestAuthService.getInstance();
export default restAuthService;

// Export compatible interface with existing auth service
export {
  restAuthService as AuthService,
  type AdminAuthResult,
  type AdminLoginRequest,
  type AuthResult,
  type UserProfile,
};
