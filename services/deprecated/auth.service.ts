import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  requiresOTP?: boolean;
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName: string;
  flatNumber: string;
  ownershipType: 'owner' | 'tenant';
  familySize: number;
  emergencyContact: string;
  role: 'resident' | 'committee_member' | 'society_admin' | 'security_guard';
  societyId: string;
  societyCode: string;
  isVerified: boolean;
  createdAt: string;
}

export class AuthService {
  private static instance: AuthService;
  private baseURL = 'https://api.aptly.app/v4'; // Replace with actual API URL
  private currentUser: UserProfile | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Phone Registration
  async registerPhone(
    phoneNumber: string,
    societyCode: string,
  ): Promise<AuthResult> {
    try {
      // For demo purposes, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate Indian phone number
      const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
      const indianMobileRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

      if (!indianMobileRegex.test(cleanNumber)) {
        return {
          success: false,
          error: 'Please enter a valid Indian mobile number',
        };
      }

      // Validate society code
      if (!societyCode || societyCode.length < 4) {
        return {
          success: false,
          error: 'Please enter a valid society code',
        };
      }

      return {
        success: true,
        data: { message: 'OTP sent successfully' },
        requiresOTP: true,
        sessionId: `session_${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // OTP Verification
  async verifyOTP(
    phoneNumber: string,
    otp: string,
    sessionId?: string,
  ): Promise<AuthResult> {
    try {
      // For demo purposes, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Accept demo OTP: 123456
      if (otp !== '123456') {
        return {
          success: false,
          error: 'Invalid OTP. Use 123456 for demo.',
        };
      }

      // Generate demo tokens
      const tokens = {
        accessToken: `demo_access_token_${Date.now()}`,
        refreshToken: `demo_refresh_token_${Date.now()}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      // Store tokens securely
      await this.storeTokens(tokens);

      return {
        success: true,
        data: {
          message: 'OTP verified successfully',
          user: null, // Profile will be created in next step
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Society Association
  async associateWithSociety(
    userId: string,
    societyId: string,
    flatNumber: string,
  ): Promise<AuthResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${this.baseURL}/auth/associate-society`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          societyId,
          flatNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to associate with society',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Create User Profile
  async createProfile(profileData: Partial<UserProfile>): Promise<AuthResult> {
    try {
      // For demo purposes, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      // Create complete user profile
      const completeProfile: UserProfile = {
        id: profileData.id || `user_${Date.now()}`,
        phoneNumber: profileData.phoneNumber || '',
        fullName: profileData.fullName || '',
        flatNumber: profileData.flatNumber || '',
        ownershipType: profileData.ownershipType || 'owner',
        familySize: profileData.familySize || 1,
        emergencyContact: profileData.emergencyContact || '',
        role: profileData.role || 'resident',
        societyId: profileData.societyId || 'society_1',
        societyCode: profileData.societyCode || 'DEMO001',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      this.currentUser = completeProfile;
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify(completeProfile),
      );

      return {
        success: true,
        data: completeProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Get Current User
  async getCurrentUser(): Promise<UserProfile | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));
        return data.user;
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }

    return null;
  }

  // Refresh Token
  async refreshToken(): Promise<TokenPair | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) return null;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const tokens: TokenPair = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        };

        await this.storeTokens(tokens);
        return tokens;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }

    return null;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      if (token) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all stored data
      await this.clearTokens();
      await AsyncStorage.removeItem('userProfile');
      this.currentUser = null;
    }
  }

  // Token Management
  private async storeTokens(tokens: TokenPair): Promise<void> {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    await AsyncStorage.setItem('tokenExpiresAt', tokens.expiresAt.toString());
  }

  public async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');

      if (!token || !expiresAt) return null;

      // Check if token is expired
      if (Date.now() >= parseInt(expiresAt)) {
        // Try to refresh token
        const newTokens = await this.refreshToken();
        return newTokens?.accessToken || null;
      }

      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  private async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await AsyncStorage.removeItem('tokenExpiresAt');
  }

  // Check Authentication Status
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  // Get User Profile from Storage
  async getStoredProfile(): Promise<UserProfile | null> {
    try {
      const profileString = await AsyncStorage.getItem('userProfile');
      return profileString ? JSON.parse(profileString) : null;
    } catch (error) {
      console.error('Failed to get stored profile:', error);
      return null;
    }
  }

  // Security Guard specific methods
  async validateSecurityGuardRole(user: UserProfile): Promise<boolean> {
    return user.role === 'security_guard';
  }

  async getSecurityGuardPermissions(userId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // For demo purposes, return default permissions
      // In production, this would fetch from API
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
    } catch (error) {
      console.error('Failed to get security guard permissions:', error);
      return null;
    }
  }

  async updateSecurityGuardShift(userId: string, shiftData: any): Promise<AuthResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      // For demo purposes, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

  // Role-based authentication helpers
  async isSecurityGuard(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'security_guard';
  }

  async hasSecurityAccess(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'security_guard' && user?.isVerified === true;
  }
}

export default AuthService.getInstance();
