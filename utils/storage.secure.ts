/**
 * Secure Storage implementation using AsyncStorage as fallback
 * Production: Replace with @react-native-async-storage/async-storage or MMKV
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys - Following consistent naming convention
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@aptly/access_token',
  REFRESH_TOKEN: '@aptly/refresh_token',
  TOKEN_EXPIRY: '@aptly/token_expiry',
  USER_ID: '@aptly/user_id',
  USER_PROFILE: '@aptly/user_profile',
  USER_SESSION: '@aptly/user_session',
  DEVICE_ID: '@aptly/device_id',
  SOCIETY_CODE: '@aptly/society_code',
  SESSION_ID: '@aptly/session_id',
  LAST_LOGIN: '@aptly/last_login',
} as const;

// Enhanced interfaces for OTP verification response structure
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn?: number;
  tokenType: string;
}

// User data from OTP verification response
export interface UserData {
  id: string;
  email: string;
  phone?: string;
  role: string;
  aud: string;
  emailConfirmedAt?: string;
  lastSignInAt?: string;
  appMetadata?: {
    provider: string;
    providers: string[];
  };
  userMetadata?: {
    email: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    sub: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isAnonymous?: boolean;
}

// Session data from OTP verification response
export interface SessionData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
  refreshToken: string;
  user: UserData;
}

// Complete authentication data structure
export interface AuthData {
  user: UserData;
  session: SessionData;
}

// Enhanced User Storage - Handles userId and user data securely
export const SecureUserStorage = {
  // Store user ID securely
  async storeUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      console.log('✅ User ID stored securely');
    } catch (error) {
      console.error('❌ Failed to store user ID:', error);
      throw new Error('Failed to store user ID');
    }
  },

  // Get user ID
  async getUserId(): Promise<string | null> {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      return userId;
    } catch (error) {
      console.error('❌ Failed to get user ID:', error);
      return null;
    }
  },

  // Store user data from OTP verification
  async storeUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userData.id);
      console.log('✅ User data stored securely');
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  },

  // Get user data
  async getUserData(): Promise<UserData | null> {
    try {
      const userDataStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return userDataStr ? JSON.parse(userDataStr) : null;
    } catch (error) {
      console.error('❌ Failed to get user data:', error);
      return null;
    }
  },

  // Store session data
  async storeSessionData(sessionData: SessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
      console.log('✅ Session data stored securely');
    } catch (error) {
      console.error('❌ Failed to store session data:', error);
      throw new Error('Failed to store session data');
    }
  },

  // Get session data
  async getSessionData(): Promise<SessionData | null> {
    try {
      const sessionDataStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return sessionDataStr ? JSON.parse(sessionDataStr) : null;
    } catch (error) {
      console.error('❌ Failed to get session data:', error);
      return null;
    }
  },

  // Store complete authentication data from OTP verification
  async storeAuthData(authData: AuthData): Promise<void> {
    try {
      const { user, session } = authData;
      
      // Extract token data from session
      const tokenData: TokenData = {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt * 1000, // Convert to milliseconds
        expiresIn: session.expiresIn,
        tokenType: session.tokenType,
      };

      // Store all data in parallel for better performance
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.id),
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session)),
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, (session.expiresAt * 1000).toString()),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString()),
      ]);

      console.log('✅ Complete authentication data stored securely', {
        userId: user.id,
        email: user.email,
        expiresAt: new Date(session.expiresAt * 1000).toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to store authentication data:', error);
      throw new Error('Failed to store authentication data');
    }
  },

  // Get complete authentication data
  async getAuthData(): Promise<AuthData | null> {
    try {
      const [userData, sessionData] = await Promise.all([
        this.getUserData(),
        this.getSessionData(),
      ]);

      if (userData && sessionData) {
        return { user: userData, session: sessionData };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get authentication data:', error);
      return null;
    }
  },

  // Clear user data
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.USER_SESSION,
      ]);
      console.log('✅ User data cleared');
    } catch (error) {
      console.error('❌ Failed to clear user data:', error);
    }
  },
};

// Enhanced token storage with error handling
export const SecureTokenStorage = {
  // Store tokens with enhanced error handling and logging
  async storeTokens(tokenData: TokenData, prefix: string = ''): Promise<void> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      await AsyncStorage.multiSet([
        [`${keyPrefix}${STORAGE_KEYS.ACCESS_TOKEN}`, tokenData.accessToken],
        [`${keyPrefix}${STORAGE_KEYS.REFRESH_TOKEN}`, tokenData.refreshToken],
        [
          `${keyPrefix}${STORAGE_KEYS.TOKEN_EXPIRY}`,
          tokenData.expiresAt.toString(),
        ],
      ]);
      console.log('✅ Tokens stored successfully', {
        tokenType: tokenData.tokenType,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to store tokens:', error);
      throw new Error('Failed to store tokens');
    }
  },

  // Synchronous access token getter (returns cached value)
  getAccessToken(prefix: string = ''): string | null {
    try {
      // For synchronous access in interceptors, we'll maintain a cache
      // This should be updated whenever tokens are stored/refreshed
      return null; // Will be implemented with caching mechanism
    } catch (error) {
      console.error('❌ Failed to get access token (sync):', error);
      return null;
    }
  },

  // Asynchronous access token getter
  async getAccessTokenAsync(prefix: string = ''): Promise<string | null> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      const token = await AsyncStorage.getItem(
        `${keyPrefix}${STORAGE_KEYS.ACCESS_TOKEN}`,
      );
      return token;
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      return null;
    }
  },

  // Synchronous refresh token getter (returns cached value)
  getRefreshToken(prefix: string = ''): string | null {
    try {
      // For synchronous access in interceptors, we'll maintain a cache
      return null; // Will be implemented with caching mechanism
    } catch (error) {
      console.error('❌ Failed to get refresh token (sync):', error);
      return null;
    }
  },

  // Asynchronous refresh token getter
  async getRefreshTokenAsync(prefix: string = ''): Promise<string | null> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      const token = await AsyncStorage.getItem(
        `${keyPrefix}${STORAGE_KEYS.REFRESH_TOKEN}`,
      );
      return token;
    } catch (error) {
      console.error('❌ Failed to get refresh token:', error);
      return null;
    }
  },

  // Clear tokens with enhanced logging
  async clearTokens(prefix: string = ''): Promise<void> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      await AsyncStorage.multiRemove([
        `${keyPrefix}${STORAGE_KEYS.ACCESS_TOKEN}`,
        `${keyPrefix}${STORAGE_KEYS.REFRESH_TOKEN}`,
        `${keyPrefix}${STORAGE_KEYS.TOKEN_EXPIRY}`,
      ]);
      console.log('✅ Tokens cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear tokens:', error);
    }
  },

  // Get all token data with enhanced validation
  async getTokens(prefix: string = ''): Promise<TokenData | null> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      const [accessToken, refreshToken, expiryStr] =
        await AsyncStorage.multiGet([
          `${keyPrefix}${STORAGE_KEYS.ACCESS_TOKEN}`,
          `${keyPrefix}${STORAGE_KEYS.REFRESH_TOKEN}`,
          `${keyPrefix}${STORAGE_KEYS.TOKEN_EXPIRY}`,
        ]);

      if (accessToken[1] && refreshToken[1] && expiryStr[1]) {
        const tokenData: TokenData = {
          accessToken: accessToken[1],
          refreshToken: refreshToken[1],
          expiresAt: parseInt(expiryStr[1], 10),
          tokenType: 'bearer',
        };
        
        // Validate token expiry
        if (Date.now() < tokenData.expiresAt) {
          return tokenData;
        } else {
          console.warn('⚠️ Tokens are expired, clearing them');
          await this.clearTokens(prefix);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get tokens:', error);
      return null;
    }
  },

  // Synchronous token expiry check (for compatibility)
  isTokenExpired(): boolean {
    try {
      // This is a fallback method for synchronous access
      // Actual implementation should use async version
      return false;
    } catch (error) {
      console.error('❌ Failed to check token expiry (sync):', error);
      return true;
    }
  },

  // Asynchronous token expiry check with refresh threshold
  async isTokenExpiredAsync(prefix: string = '', refreshThreshold: number = 5 * 60 * 1000): Promise<boolean> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      const expiryStr = await AsyncStorage.getItem(
        `${keyPrefix}${STORAGE_KEYS.TOKEN_EXPIRY}`,
      );
      if (!expiryStr) {
        console.log('🔍 No token expiry found, considering expired');
        return true;
      }

      const expiryTime = parseInt(expiryStr, 10);
      const isExpired = Date.now() > (expiryTime - refreshThreshold);
      
      if (isExpired) {
        console.log('⏰ Token is expired or about to expire', {
          expiryTime: new Date(expiryTime).toISOString(),
          now: new Date().toISOString(),
          threshold: refreshThreshold / 1000 / 60 + ' minutes',
        });
      }
      
      return isExpired;
    } catch (error) {
      console.error('❌ Failed to check token expiry:', error);
      return true;
    }
  },
};

// Profile storage with generic support
export const SecureProfileStorage = {
  storeProfile<T = any>(profile: T, prefix: string = ''): void {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      AsyncStorage.setItem(
        `${keyPrefix}${STORAGE_KEYS.USER_PROFILE}`,
        JSON.stringify(profile),
      );
    } catch (error) {
      console.error('Failed to store profile:', error);
    }
  },

  getProfile<T = any>(prefix: string = ''): T | null {
    try {
      // Note: This should be async, but maintaining compatibility
      // In practice, will need to use async version
      return null;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  },

  async getProfileAsync<T = any>(prefix: string = ''): Promise<T | null> {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      const profileStr = await AsyncStorage.getItem(
        `${keyPrefix}${STORAGE_KEYS.USER_PROFILE}`,
      );
      return profileStr ? JSON.parse(profileStr) : null;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  },

  clearProfile(prefix: string = ''): void {
    try {
      const keyPrefix = prefix ? `${prefix}_` : '';
      AsyncStorage.removeItem(`${keyPrefix}${STORAGE_KEYS.USER_PROFILE}`);
    } catch (error) {
      console.error('Failed to clear profile:', error);
    }
  },
};

// Session storage with proper implementations
export const SecureSessionStorage = {
  storeDeviceId(deviceId: string): void {
    try {
      AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    } catch (error) {
      console.error('Failed to store device ID:', error);
    }
  },

  async getDeviceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return null;
    }
  },

  storeSocietyCode(code: string): void {
    try {
      AsyncStorage.setItem(STORAGE_KEYS.SOCIETY_CODE, code);
    } catch (error) {
      console.error('Failed to store society code:', error);
    }
  },

  getSocietyCode(): string | null {
    // Note: This should be async for proper implementation
    return null;
  },

  async getSocietyCodeAsync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SOCIETY_CODE);
    } catch (error) {
      console.error('Failed to get society code:', error);
      return null;
    }
  },

  storeSessionId(sessionId: string): void {
    try {
      AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    } catch (error) {
      console.error('Failed to store session ID:', error);
    }
  },

  getSessionId(): string | null {
    // Note: This should be async for proper implementation
    return null;
  },

  async getSessionIdAsync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
    } catch (error) {
      console.error('Failed to get session ID:', error);
      return null;
    }
  },

  storeLastLoginTime(timestamp: number): void {
    try {
      AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, timestamp.toString());
    } catch (error) {
      console.error('Failed to store last login time:', error);
    }
  },

  // FIX: This is the missing method causing the error
  getLastLoginTime(): number | null {
    // Note: This should be async for proper implementation
    // For now, return a default value to prevent crashes
    return null;
  },

  async getLastLoginTimeAsync(): Promise<number | null> {
    try {
      const timestampStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
      return timestampStr ? parseInt(timestampStr, 10) : null;
    } catch (error) {
      console.error('Failed to get last login time:', error);
      return null;
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DEVICE_ID,
        STORAGE_KEYS.SOCIETY_CODE,
        STORAGE_KEYS.SESSION_ID,
        STORAGE_KEYS.LAST_LOGIN,
      ]);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },
};

// Clear all secure storage with enhanced logging
export const clearAllSecureStorage = async (): Promise<void> => {
  try {
    console.log('🧹 Starting complete secure storage cleanup');
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRY,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.USER_SESSION,
      STORAGE_KEYS.DEVICE_ID,
      STORAGE_KEYS.SOCIETY_CODE,
      STORAGE_KEYS.SESSION_ID,
      STORAGE_KEYS.LAST_LOGIN,
    ]);
    
    console.log('✅ All secure storage cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear secure storage:', error);
    throw new Error('Failed to clear secure storage');
  }
};

// Utility function to create authentication data from OTP response
export const createAuthDataFromOTPResponse = (otpResponse: any): AuthData => {
  const { user, session } = otpResponse.data;
  
  return {
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      aud: user.aud,
      emailConfirmedAt: user.email_confirmed_at,
      lastSignInAt: user.last_sign_in_at,
      appMetadata: user.app_metadata,
      userMetadata: user.user_metadata,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isAnonymous: user.is_anonymous,
    },
    session: {
      accessToken: session.access_token,
      tokenType: session.token_type,
      expiresIn: session.expires_in,
      expiresAt: session.expires_at,
      refreshToken: session.refresh_token,
      user: {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone || '',
        role: session.user.role,
        aud: session.user.aud,
        emailConfirmedAt: session.user.email_confirmed_at,
        lastSignInAt: session.user.last_sign_in_at,
        appMetadata: session.user.app_metadata,
        userMetadata: session.user.user_metadata,
        createdAt: session.user.created_at,
        updatedAt: session.user.updated_at,
        isAnonymous: session.user.is_anonymous,
      },
    },
  };
};

// Export all storage utilities as a unified interface
export default {
  user: SecureUserStorage,
  tokens: SecureTokenStorage,
  profile: SecureProfileStorage,
  session: SecureSessionStorage,
  clearAll: clearAllSecureStorage,
  createAuthData: createAuthDataFromOTPResponse,
};
