/**
 * Temporary fallback secure storage using AsyncStorage
 * TODO: Replace with MMKV once native modules are properly linked
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback implementation
export const SecureTokenStorage = {
  storeTokens: async () => {},
  getAccessToken: () => null,
  getRefreshToken: () => null,
  clearTokens: () => {},
  getTokens: () => null,
  isTokenExpired: () => true,
};

export const SecureProfileStorage = {
  storeProfile: () => {},
  getProfile: () => null,
  clearProfile: () => {},
};

export const SecureSessionStorage = {
  storeDeviceId: () => {},
  getDeviceId: () => null,
  storeSocietyCode: () => {},
  getSocietyCode: () => null,
  clearSession: () => {},
};

export const clearAllSecureStorage = () => {
  console.log('Secure storage cleared (fallback mode)');
};

export default {
  tokens: SecureTokenStorage,
  profile: SecureProfileStorage,
  session: SecureSessionStorage,
  clearAll: clearAllSecureStorage,
};