// Migration hook for gradual transition from Theme contexts to ThemeStore
import { useThemeStore, type ThemeMode, type UserMode, type ColorScheme } from '@/stores/slices/themeStore';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

// Since there's no existing ThemeContext, we create a compatible interface
interface ThemeContextType {
  themeMode: ThemeMode;
  userMode: UserMode;
  colors: ColorScheme;
  isDarkMode: boolean;
  isAdminMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setUserMode: (mode: UserMode) => void;
  toggleUserMode: () => void;
  getStatusColor: (status: string) => string;
}

/**
 * Migration hook that provides theme functionality
 * Since there's no existing ThemeContext, this acts as the primary theme interface
 * but still uses the feature flag to control whether to use the store
 */
export const useThemeMigration = (): ThemeContextType & {
  // Additional store-only methods
  setFollowSystemTheme?: (follow: boolean) => void;
  setHighContrastMode?: (enabled: boolean) => void;
  updateCustomColors?: (colors: Partial<ColorScheme>) => void;
  resetCustomColors?: () => void;
  applyPresetTheme?: (preset: 'light' | 'dark' | 'admin') => void;
  refreshTheme?: () => void;
  error?: string | null;
} => {
  const { isFeatureEnabled } = useFeatureFlags();
  const useStore = isFeatureEnabled('USE_THEME_STORE' as any);
  
  const storeTheme = useThemeStore();
  
  if (useStore) {
    // Return full store functionality
    return {
      themeMode: storeTheme.themeMode,
      userMode: storeTheme.userMode,
      colors: storeTheme.colors,
      isDarkMode: (() => {
        const effectiveMode = storeTheme.followSystemTheme ? storeTheme.systemThemeDetected : storeTheme.themeMode;
        return effectiveMode === 'dark';
      })(),
      isAdminMode: storeTheme.userMode === 'admin',
      setThemeMode: storeTheme.setThemeMode,
      toggleTheme: storeTheme.toggleTheme,
      setUserMode: storeTheme.setUserMode,
      toggleUserMode: storeTheme.toggleUserMode,
      getStatusColor: storeTheme.getStatusColor,
      
      // Store-only methods
      setFollowSystemTheme: storeTheme.setFollowSystemTheme,
      setHighContrastMode: storeTheme.setHighContrastMode,
      updateCustomColors: storeTheme.updateCustomColors,
      resetCustomColors: storeTheme.resetCustomColors,
      applyPresetTheme: storeTheme.applyPresetTheme,
      refreshTheme: storeTheme.refreshTheme,
      error: storeTheme.error,
    };
  }
  
  // Return fallback implementation (basic theme functionality)
  // This is a simple implementation since there's no existing context to migrate from
  const fallbackColors: ColorScheme = {
    primary: '#6366f1',
    primaryLight: '#8b5cf6',
    primaryDark: '#4338ca',
    primaryContrast: '#ffffff',
    secondary: '#10b981',
    secondaryLight: '#34d399',
    secondaryDark: '#059669',
    secondaryContrast: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#f1f5f9',
    surfaceHover: '#e2e8f0',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderDark: '#d1d5db',
  };
  
  return {
    themeMode: 'light' as ThemeMode,
    userMode: 'resident' as UserMode,
    colors: fallbackColors,
    isDarkMode: false,
    isAdminMode: false,
    setThemeMode: () => {
      console.warn('setThemeMode not available in fallback mode - enable USE_THEME_STORE');
    },
    toggleTheme: () => {
      console.warn('toggleTheme not available in fallback mode - enable USE_THEME_STORE');
    },
    setUserMode: () => {
      console.warn('setUserMode not available in fallback mode - enable USE_THEME_STORE');
    },
    toggleUserMode: () => {
      console.warn('toggleUserMode not available in fallback mode - enable USE_THEME_STORE');
    },
    getStatusColor: (status: string) => {
      const statusColors: Record<string, string> = {
        success: fallbackColors.success,
        warning: fallbackColors.warning,
        error: fallbackColors.error,
        info: fallbackColors.info,
      };
      return statusColors[status] || fallbackColors.textSecondary;
    },
    
    // Stub methods for store-only functionality
    setFollowSystemTheme: () => {
      console.warn('setFollowSystemTheme not available in fallback mode');
    },
    setHighContrastMode: () => {
      console.warn('setHighContrastMode not available in fallback mode');
    },
    updateCustomColors: () => {
      console.warn('updateCustomColors not available in fallback mode');
    },
    resetCustomColors: () => {
      console.warn('resetCustomColors not available in fallback mode');
    },
    applyPresetTheme: () => {
      console.warn('applyPresetTheme not available in fallback mode');
    },
    refreshTheme: () => {
      console.warn('refreshTheme not available in fallback mode');
    },
    error: null,
  };
};

/**
 * Hook to check if we're currently using the store implementation
 */
export const useIsThemeStoreActive = (): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled('USE_THEME_STORE' as any);
};

/**
 * Hook for theme-aware styling
 * Returns current colors and utility functions for theming components
 */
export const useThemedStyles = () => {
  const theme = useThemeMigration();
  
  return {
    colors: theme.colors,
    isDark: theme.isDarkMode,
    isAdmin: theme.isAdminMode,
    
    // Utility functions for creating themed styles
    createThemedStyle: (lightStyle: any, darkStyle?: any, adminStyle?: any) => {
      if (theme.isAdminMode && adminStyle) {
        return adminStyle;
      }
      if (theme.isDarkMode && darkStyle) {
        return darkStyle;
      }
      return lightStyle;
    },
    
    // Get appropriate text color for background
    getTextColorForBackground: (backgroundColor: string) => {
      // Simple contrast calculation - in real app, use proper contrast ratio
      const isDarkBackground = backgroundColor.includes('#0') || backgroundColor.includes('#1') || backgroundColor.includes('#2');
      return isDarkBackground ? theme.colors.textInverse : theme.colors.textPrimary;
    },
    
    // Get status color with fallback
    getStatusColorSafe: (status: string, fallback?: string) => {
      return theme.getStatusColor(status) || fallback || theme.colors.textSecondary;
    },
  };
};

/**
 * Hook for admin theme utilities
 * Provides admin-specific theming functions
 */
export const useAdminTheme = () => {
  const theme = useThemeMigration();
  
  return {
    isAdminMode: theme.isAdminMode,
    colors: theme.colors,
    
    // Admin-specific utilities
    getAdminCardStyle: () => ({
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    }),
    
    getAdminHeaderStyle: () => ({
      backgroundColor: theme.colors.primary,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.secondary,
    }),
    
    getAdminButtonStyle: (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
      const baseStyle = {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
      
      switch (variant) {
        case 'primary':
          return {
            ...baseStyle,
            backgroundColor: theme.colors.primary,
          };
        case 'secondary':
          return {
            ...baseStyle,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.colors.primary,
          };
        case 'accent':
          return {
            ...baseStyle,
            backgroundColor: theme.colors.secondary,
          };
        default:
          return baseStyle;
      }
    },
  };
};

/**
 * Development helper for theme validation
 */
export const useThemeMigrationValidator = () => {
  if (__DEV__) {
    const theme = useThemeMigration();
    const storeTheme = useThemeStore();
    const isStoreActive = useIsThemeStoreActive();
    
    // Validate color scheme completeness
    const requiredColorKeys = [
      'primary', 'secondary', 'success', 'warning', 'error', 'info',
      'background', 'surface', 'textPrimary', 'textSecondary', 'border'
    ];
    
    const missingColors = requiredColorKeys.filter(key => !theme.colors[key as keyof ColorScheme]);
    
    if (missingColors.length > 0) {
      console.warn('Theme validation: Missing color keys:', missingColors);
    }
    
    // Validate theme consistency when store is active
    if (isStoreActive) {
      if (theme.themeMode !== storeTheme.themeMode) {
        console.warn('Theme migration: themeMode mismatch', {
          theme: theme.themeMode,
          store: storeTheme.themeMode,
        });
      }
      
      if (theme.userMode !== storeTheme.userMode) {
        console.warn('Theme migration: userMode mismatch', {
          theme: theme.userMode,
          store: storeTheme.userMode,
        });
      }
    }
  }
};