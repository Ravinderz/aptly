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
  role: 'resident' | 'committee_member' | 'society_admin';
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
  async registerPhone(phoneNumber: string, societyCode: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          societyCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
          requiresOTP: true,
          sessionId: data.sessionId
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to send OTP'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  // OTP Verification
  async verifyOTP(phoneNumber: string, otp: string, sessionId?: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
          sessionId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens securely
        await this.storeTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt
        });

        return {
          success: true,
          data: data.user
        };
      } else {
        return {
          success: false,
          error: data.message || 'Invalid OTP'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  // Society Association
  async associateWithSociety(userId: string, societyId: string, flatNumber: string): Promise<AuthResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${this.baseURL}/auth/associate-society`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          societyId,
          flatNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to associate with society'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  // Create User Profile
  async createProfile(profileData: Partial<UserProfile>): Promise<AuthResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${this.baseURL}/auth/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        this.currentUser = data.user;
        await AsyncStorage.setItem('userProfile', JSON.stringify(data.user));
        
        return {
          success: true,
          data: data.user
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to create profile'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error. Please check your connection.'
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
          'Authorization': `Bearer ${token}`
        }
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
          expiresAt: data.expiresAt
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
            'Authorization': `Bearer ${token}`
          }
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

  private async getAccessToken(): Promise<string | null> {
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
}

export default AuthService.getInstance();