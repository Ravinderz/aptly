import AuthService, { UserProfile } from '@/services/auth.service';
import BiometricService from '@/services/biometric.service';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  isBiometricEnabled: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Check if user has valid tokens
      const isAuth = await AuthService.isAuthenticated();

      if (isAuth) {
        // Try to get user profile
        const storedProfile = await AuthService.getStoredProfile();
        if (storedProfile) {
          setUser(storedProfile);
          setIsAuthenticated(true);
        } else {
          // Try to fetch current user from API
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: UserProfile) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      await BiometricService.disableBiometricAuth();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
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
              setUser(storedProfile);
              setIsAuthenticated(true);
              return true;
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const isBiometricEnabled = async (): Promise<boolean> => {
    return await BiometricService.isBiometricEnabled();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuthStatus,
    authenticateWithBiometrics,
    isBiometricEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
