// AuthStore - Zustand implementation for authentication state management
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AuthService, { UserProfile, AuthResult } from '@/services/auth.service';
import BiometricService from '@/services/biometric.service';
import { BaseStore } from '../types';

// State interface matching the existing AuthContext
interface AuthState extends BaseStore {
  // Core auth state
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Biometric state
  biometricEnabled: boolean;
  
  // Session information
  sessionId: string | null;
  lastLoginTime: number | null;
}

// Actions interface matching the existing AuthContext methods
interface AuthActions {
  // Authentication methods
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  
  // Biometric methods
  authenticateWithBiometrics: () => Promise<boolean>;
  isBiometricEnabled: () => Promise<boolean>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  
  // Profile methods
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  
  // Token management
  refreshToken: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  setUser: (user: UserProfile | null) => void;
}

type AuthStore = AuthState & AuthActions;

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loading: true, // BaseStore property
  error: null,
  biometricEnabled: false,
  sessionId: null,
  lastLoginTime: null,
};

/**
 * AuthStore - Zustand store for authentication state management
 * 
 * Features:
 * - Automatic token refresh
 * - Biometric authentication support
 * - Persistent session management
 * - Error handling with automatic recovery
 * - DevTools integration for debugging
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Authentication methods
        login: (userData: UserProfile) => {
          set((state) => {
            state.user = userData;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.loading = false;
            state.error = null;
            state.lastLoginTime = Date.now();
          });
        },
        
        logout: async () => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            // Call service logout
            await AuthService.logout();
            await BiometricService.disableBiometricAuth();
            
            // Reset state
            set((state) => {
              Object.assign(state, {
                ...initialState,
                isLoading: false,
                loading: false,
              });
            });
          } catch (error: any) {
            console.error('Logout failed:', error);
            // Still clear local state even if API call fails
            set((state) => {
              Object.assign(state, {
                ...initialState,
                isLoading: false,
                loading: false,
                error: error.message || 'Logout failed',
              });
            });
          }
        },
        
        checkAuthStatus: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.loading = true;
              state.error = null;
            });
            
            // Check if user has valid tokens
            const isAuth = await AuthService.isAuthenticated();
            
            if (isAuth) {
              // Try to get user profile
              const storedProfile = await AuthService.getStoredProfile();
              if (storedProfile) {
                set((state) => {
                  state.user = storedProfile;
                  state.isAuthenticated = true;
                  state.isLoading = false;
                  state.loading = false;
                });
              } else {
                // Try to fetch current user from API
                const currentUser = await AuthService.getCurrentUser();
                if (currentUser) {
                  set((state) => {
                    state.user = currentUser;
                    state.isAuthenticated = true;
                    state.isLoading = false;
                    state.loading = false;
                  });
                } else {
                  set((state) => {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.isLoading = false;
                    state.loading = false;
                  });
                }
              }
            } else {
              set((state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.isLoading = false;
                state.loading = false;
              });
            }
          } catch (error: any) {
            console.error('Auth check failed:', error);
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.isLoading = false;
              state.loading = false;
              state.error = error.message || 'Authentication check failed';
            });
          }
        },
        
        // Biometric authentication methods
        authenticateWithBiometrics: async (): Promise<boolean> => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            const biometricResult = await BiometricService.authenticateWithBiometrics();
            
            if (biometricResult.success) {
              const userId = await BiometricService.getBiometricUserId();
              if (userId) {
                // Check if user still has valid session
                const isAuth = await AuthService.isAuthenticated();
                if (isAuth) {
                  const storedProfile = await AuthService.getStoredProfile();
                  if (storedProfile && storedProfile.id === userId) {
                    set((state) => {
                      state.user = storedProfile;
                      state.isAuthenticated = true;
                      state.loading = false;
                      state.lastLoginTime = Date.now();
                    });
                    return true;
                  }
                }
              }
            }
            
            set((state) => {
              state.loading = false;
            });
            return false;
          } catch (error: any) {
            console.error('Biometric authentication failed:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Biometric authentication failed';
            });
            return false;
          }
        },
        
        isBiometricEnabled: async (): Promise<boolean> => {
          try {
            const enabled = await BiometricService.isBiometricEnabled();
            set((state) => {
              state.biometricEnabled = enabled;
            });
            return enabled;
          } catch (error: any) {
            console.error('Failed to check biometric status:', error);
            return false;
          }
        },
        
        enableBiometric: async () => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            const success = await BiometricService.enableBiometricAuth(get().user?.id || '');
            if (success) {
              set((state) => {
                state.biometricEnabled = true;
                state.loading = false;
              });
            } else {
              set((state) => {
                state.loading = false;
                state.error = 'Failed to enable biometric authentication';
              });
            }
          } catch (error: any) {
            console.error('Failed to enable biometric:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to enable biometric authentication';
            });
          }
        },
        
        disableBiometric: async () => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            await BiometricService.disableBiometricAuth();
            set((state) => {
              state.biometricEnabled = false;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to disable biometric:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to disable biometric authentication';
            });
          }
        },
        
        // Profile management
        updateProfile: async (profileUpdates: Partial<UserProfile>) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            const currentUser = get().user;
            if (!currentUser) {
              throw new Error('No user logged in');
            }
            
            const updatedProfile = { ...currentUser, ...profileUpdates };
            
            // In a real app, this would make an API call
            // For now, just update local state
            set((state) => {
              state.user = updatedProfile;
              state.loading = false;
            });
          } catch (error: any) {
            console.error('Failed to update profile:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to update profile';
            });
          }
        },
        
        refreshUserData: async () => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            const currentUser = await AuthService.getCurrentUser();
            if (currentUser) {
              set((state) => {
                state.user = currentUser;
                state.loading = false;
              });
            } else {
              set((state) => {
                state.loading = false;
                state.error = 'Failed to refresh user data';
              });
            }
          } catch (error: any) {
            console.error('Failed to refresh user data:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to refresh user data';
            });
          }
        },
        
        // Token management
        refreshToken: async () => {
          try {
            set((state) => {
              state.error = null;
            });
            
            const newTokens = await AuthService.refreshToken();
            if (!newTokens) {
              // Token refresh failed, logout user
              await get().logout();
            }
          } catch (error: any) {
            console.error('Token refresh failed:', error);
            set((state) => {
              state.error = error.message || 'Session expired';
            });
            // Auto-logout on token refresh failure
            await get().logout();
          }
        },
        
        // Utility methods
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },
        
        setUser: (user: UserProfile | null) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          });
        },
        
        // BaseStore methods
        setLoading: (loading: boolean) => {
          set((state) => {
            state.loading = loading;
            state.isLoading = loading;
          });
        },
        
        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },
        
        reset: () => {
          set((state) => {
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          biometricEnabled: state.biometricEnabled,
          lastLoginTime: state.lastLoginTime,
        }),
        version: 1,
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors for optimized subscriptions
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsBiometricEnabled = () => useAuthStore((state) => state.biometricEnabled);

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  checkAuthStatus: state.checkAuthStatus,
  authenticateWithBiometrics: state.authenticateWithBiometrics,
  isBiometricEnabled: state.isBiometricEnabled,
  enableBiometric: state.enableBiometric,
  disableBiometric: state.disableBiometric,
  updateProfile: state.updateProfile,
  refreshUserData: state.refreshUserData,
  refreshToken: state.refreshToken,
  clearError: state.clearError,
}));

// Computed selectors
export const useAuthComputed = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  hasUser: !!state.user,
  hasProfile: !!state.user?.fullName,
  canAccessAdmin: state.user?.role === 'society_admin' || state.user?.role === 'committee_member',
  isResident: state.user?.role === 'resident',
  isLoading: state.isLoading,
  hasError: !!state.error,
}));