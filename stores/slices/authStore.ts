// AuthStore - Zustand implementation for authentication state management with REST API integration
import { AuthService } from '@/services';
import { BiometricService } from '@/services';
import type { UserProfileExtended as UserProfile } from '@/types/api';
import { SecureTokenStorage, SecureProfileStorage, SecureSessionStorage } from '@/utils/storage.secure';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from '../types';
import { SecurityGuardProfile, SecurityPermissions } from '@/types/security';
import { useApiError } from '@/hooks/useApiError';

// State interface matching the existing AuthContext
interface AuthState extends BaseStore {
  // Core auth state
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Security guard specific state
  securityProfile: SecurityGuardProfile | null;
  securityPermissions: SecurityPermissions | null;

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

  // Security guard methods
  setSecurityProfile: (profile: SecurityGuardProfile | null) => void;
  updateSecurityPermissions: (permissions: SecurityPermissions) => void;
  getSecurityPermissions: () => SecurityPermissions | null;
  initializeSecurityGuard: (user: UserProfile) => void;
  updateSecurityShift: (shiftData: any) => Promise<void>;

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
  securityProfile: null,
  securityPermissions: null,
  biometricEnabled: false,
  sessionId: null,
  lastLoginTime: null,
  setLoading: function (loading: boolean): void {
    throw new Error('Function not implemented.');
  },
  setError: function (error: string | null): void {
    throw new Error('Function not implemented.');
  },
  reset: function (): void {
    throw new Error('Function not implemented.');
  },
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
            
            // Initialize security profile and permissions if user is security guard
            if (userData.role === 'security_guard') {
              // Initialize full security guard profile
              get().initializeSecurityGuard(userData);
            } else {
              // Clear security data for non-security users
              state.securityProfile = null;
              state.securityPermissions = null;
            }
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
                securityProfile: null,
                securityPermissions: null,
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
                securityProfile: null,
                securityPermissions: null,
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

            // Check authentication status with REST service
            const isAuth = await AuthService.isAuthenticated();

            if (isAuth) {
              // Try to get stored profile first for faster loading
              try {
                const storedProfile = await AuthService.getStoredProfile();
                if (storedProfile) {
                  set((state) => {
                    state.user = storedProfile;
                    state.isAuthenticated = true;
                    state.isLoading = false;
                    state.loading = false;
                  });
                  
                  // Initialize security profile if needed
                  if (storedProfile.role === 'security_guard') {
                    get().initializeSecurityGuard(storedProfile);
                  }
                  
                  // Refresh user data in background
                  AuthService.getCurrentUser().then((currentUser) => {
                    if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(storedProfile)) {
                      set((state) => {
                        state.user = currentUser;
                      });
                    }
                  }).catch(console.warn);
                  
                  return;
                }
              } catch (profileError) {
                console.warn('⚠️ Failed to get stored profile:', profileError);
              }

              // Fetch current user from API
              try {
                const currentUser = await AuthService.getCurrentUser();
                
                if (currentUser) {
                  set((state) => {
                    state.user = currentUser;
                    state.isAuthenticated = true;
                    state.isLoading = false;
                    state.loading = false;
                  });
                  
                  // Initialize security profile if user is security guard
                  if (currentUser.role === 'security_guard') {
                    get().initializeSecurityGuard(currentUser);
                  }
                } else {
                  set((state) => {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.isLoading = false;
                    state.loading = false;
                  });
                }
              } catch (userError) {
                console.warn('⚠️ Failed to fetch current user:', userError);
                set((state) => {
                  state.isAuthenticated = false;
                  state.user = null;
                  state.isLoading = false;
                  state.loading = false;
                  state.error = 'Failed to load user profile';
                });
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
            console.warn('⚠️ Auth check failed:', error);
            set((state) => {
              state.isAuthenticated = false;
              state.user = null;
              state.isLoading = false;
              state.loading = false;
              state.error = null; // Don't set error for auth check failures
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

            const biometricResult =
              await BiometricService.authenticateWithBiometrics();

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

            const success = await BiometricService.enableBiometricAuth(
              get().user?.id || '',
            );
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
              state.error =
                error.message || 'Failed to enable biometric authentication';
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
              state.error =
                error.message || 'Failed to disable biometric authentication';
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
              console.warn('⚠️ Token refresh failed, logging out user');
              await get().logout();
            } else {
              console.log('✅ Token refreshed successfully');
            }
          } catch (error: any) {
            console.error('❌ Token refresh failed:', error);
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
            
            // Initialize security permissions for security guards
            if (user?.role === 'security_guard') {
              state.securityPermissions = {
                canCreateVisitor: true,
                canCheckInOut: true,
                canViewHistory: true,
                canHandleEmergency: true,
                canManageVehicles: true,
                canAccessReports: false,
                canModifyVisitorData: true,
                canOverrideApprovals: false,
              };
            } else {
              state.securityProfile = null;
              state.securityPermissions = null;
            }
          });
        },

        // Security guard methods
        setSecurityProfile: (profile: SecurityGuardProfile | null) => {
          set((state) => {
            state.securityProfile = profile;
          });
        },

        updateSecurityPermissions: (permissions: SecurityPermissions) => {
          set((state) => {
            state.securityPermissions = { ...state.securityPermissions, ...permissions };
          });
        },

        getSecurityPermissions: (): SecurityPermissions | null => {
          return get().securityPermissions;
        },

        initializeSecurityGuard: (user: UserProfile) => {
          if (user.role === 'security_guard') {
            set((state) => {
              // Create default security profile
              state.securityProfile = {
                id: user.id,
                userId: user.id,
                employeeId: `SG-${user.id.slice(-6).toUpperCase()}`,
                shiftPattern: 'MORNING', // Default shift
                department: 'SECURITY',
                permissions: {
                  canCreateVisitor: true,
                  canCheckInOut: true,
                  canViewHistory: true,
                  canHandleEmergency: true,
                  canManageVehicles: true,
                  canAccessReports: false,
                  canModifyVisitorData: true,
                  canOverrideApprovals: false,
                },
                currentShift: null,
                emergencyContacts: [],
                certifications: [],
                trainingRecords: [],
                performanceMetrics: {
                  totalVisitors: 0,
                  emergencyResponses: 0,
                  incidentsReported: 0,
                  rating: 0,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              // Set default permissions in state
              state.securityPermissions = {
                canCreateVisitor: true,
                canCheckInOut: true,
                canViewHistory: true,
                canHandleEmergency: true,
                canManageVehicles: true,
                canAccessReports: false,
                canModifyVisitorData: true,
                canOverrideApprovals: false,
              };
            });
          }
        },

        updateSecurityShift: async (shiftData: any) => {
          try {
            set((state) => {
              state.loading = true;
              state.error = null;
            });

            // Update security profile with shift data
            const result = await AuthService.updateSecurityGuardShift(get().user?.id || '', shiftData);
            
            if (result.success) {
              set((state) => {
                if (state.securityProfile) {
                  state.securityProfile.currentShift = shiftData;
                  state.securityProfile.updatedAt = new Date().toISOString();
                }
                state.loading = false;
              });
            } else {
              set((state) => {
                state.loading = false;
                state.error = result.error || 'Failed to update shift';
              });
            }
          } catch (error: any) {
            console.error('Failed to update security shift:', error);
            set((state) => {
              state.loading = false;
              state.error = error.message || 'Failed to update shift';
            });
          }
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
        storage: {
          getItem: async (name: string) => {
            try {
              // Get from secure storage first for sensitive data
              if (name === 'auth-storage') {
                const profile = await SecureProfileStorage.getProfileAsync();
                const lastLoginTime = await SecureSessionStorage.getLastLoginTimeAsync();
                const sessionData = {
                  user: profile,
                  isAuthenticated: !!profile,
                  securityProfile: null,
                  securityPermissions: null,
                  biometricEnabled: false,
                  lastLoginTime: lastLoginTime,
                };
                return sessionData;
              }
              return null;
            } catch (error) {
              console.warn(`Unable to get auth item '${name}':`, error);
              return null;
            }
          },
          setItem: async (name: string, value: any) => {
            try {
              // Store in secure storage for sensitive data
              if (name === 'auth-storage' && value?.user) {
                SecureProfileStorage.storeProfile(value.user);
                if (value.lastLoginTime) {
                  SecureSessionStorage.storeLastLoginTime(value.lastLoginTime);
                }
              }
            } catch (error) {
              console.warn(`Unable to set auth item '${name}':`, error);
            }
          },
          removeItem: async (name: string) => {
            try {
              if (name === 'auth-storage') {
                SecureProfileStorage.clearProfile();
                SecureSessionStorage.clearSession();
              }
            } catch (error) {
              console.warn(`Unable to remove auth item '${name}':`, error);
            }
          },
        },
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          securityProfile: state.securityProfile,
          securityPermissions: state.securityPermissions,
          biometricEnabled: state.biometricEnabled,
          lastLoginTime: state.lastLoginTime,
        }),
        version: 1,
        onRehydrateStorage: () => {
          console.log('🔄 Starting rehydration for: auth-storage');
          return (state, error) => {
            if (error) {
              console.error('❌ Error rehydrating auth-storage:', error);
              // Clear any corrupted auth state
              useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                securityProfile: null,
                securityPermissions: null,
                biometricEnabled: false,
                lastLoginTime: null,
              });
            } else {
              console.log('✅ Successfully rehydrated: auth-storage');
            }
          };
        },
        // Handle migration errors gracefully
        migrate: (persistedState: any, version: number) => {
          try {
            if (version === 0) {
              // Migration from version 0 to 1
              return {
                ...persistedState,
                securityProfile: persistedState.securityProfile || null,
                securityPermissions: persistedState.securityPermissions || null,
                biometricEnabled: persistedState.biometricEnabled || false,
                lastLoginTime: persistedState.lastLoginTime || null,
              };
            }
            return persistedState;
          } catch (error) {
            console.warn('Auth migration failed, using clean state:', error);
            return {
              user: null,
              isAuthenticated: false,
              securityProfile: null,
              securityPermissions: null,
              biometricEnabled: false,
              lastLoginTime: null,
            };
          }
        },
      },
    ),
    { name: 'AuthStore' },
  ),
);

// Selectors for optimized subscriptions
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsBiometricEnabled = () =>
  useAuthStore((state) => state.biometricEnabled);

export const useAuthActions = () =>
  useAuthStore((state) => ({
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

// Security-specific selectors
export const useSecurityProfile = () => useAuthStore((state) => state.securityProfile);
export const useSecurityPermissions = () => useAuthStore((state) => state.securityPermissions);
export const useIsSecurityGuard = () => useAuthStore((state) => state.user?.role === 'security_guard');

export const useSecurityActions = () =>
  useAuthStore((state) => ({
    setSecurityProfile: state.setSecurityProfile,
    updateSecurityPermissions: state.updateSecurityPermissions,
    getSecurityPermissions: state.getSecurityPermissions,
    initializeSecurityGuard: state.initializeSecurityGuard,
    updateSecurityShift: state.updateSecurityShift,
  }));

// Computed selectors
export const useAuthComputed = () =>
  useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    hasUser: !!state.user,
    hasProfile: !!state.user?.fullName,
    canAccessAdmin:
      state.user?.role === 'society_admin' ||
      state.user?.role === 'committee_member',
    isResident: state.user?.role === 'resident',
    isSecurityGuard: state.user?.role === 'security_guard',
    hasSecurityPermissions: !!state.securityPermissions,
    isLoading: state.isLoading,
    hasError: !!state.error,
  }));
