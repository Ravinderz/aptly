// ThemeStore - Zustand implementation for theme management
import { adminTheme } from '@/utils/adminTheme';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BaseStore } from '../types';

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';
export type UserMode = 'resident' | 'admin';

// Color scheme interface
export interface ColorScheme {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContrast: string;

  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryContrast: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Background colors
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
}

// Light theme color schemes
const lightColorScheme: ColorScheme = {
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

// Dark theme color schemes
const darkColorScheme: ColorScheme = {
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',
  primaryContrast: '#000000',
  secondary: '#34d399',
  secondaryLight: '#6ee7b7',
  secondaryDark: '#10b981',
  secondaryContrast: '#000000',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  background: '#111827',
  surface: '#1f2937',
  surfaceElevated: '#374151',
  surfaceHover: '#4b5563',
  textPrimary: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  textInverse: '#111827',
  border: '#374151',
  borderLight: '#4b5563',
  borderDark: '#1f2937',
};

// Admin color scheme (from adminTheme)
const adminColorScheme: ColorScheme = {
  primary: adminTheme.primary,
  primaryLight: adminTheme.primaryLight,
  primaryDark: adminTheme.primaryDark,
  primaryContrast: adminTheme.primaryContrast,
  secondary: adminTheme.secondary,
  secondaryLight: adminTheme.secondaryLight,
  secondaryDark: adminTheme.secondaryDark,
  secondaryContrast: adminTheme.secondaryContrast,
  success: adminTheme.success,
  warning: adminTheme.warning,
  error: adminTheme.error,
  info: adminTheme.info,
  background: adminTheme.background,
  surface: adminTheme.surface,
  surfaceElevated: adminTheme.surfaceElevated,
  surfaceHover: adminTheme.surfaceHover,
  textPrimary: adminTheme.textPrimary,
  textSecondary: adminTheme.textSecondary,
  textTertiary: adminTheme.textTertiary,
  textInverse: adminTheme.textInverse,
  border: adminTheme.border,
  borderLight: adminTheme.borderLight,
  borderDark: adminTheme.borderDark,
};

// State interface
interface ThemeState extends BaseStore {
  // Current theme settings
  themeMode: ThemeMode;
  userMode: UserMode;
  colors: ColorScheme;
  systemThemeDetected: ThemeMode;

  // Theme preferences
  followSystemTheme: boolean;
  adminThemeEnabled: boolean;
  highContrastMode: boolean;

  // Custom theme support
  customColors: Partial<ColorScheme>;
  hasCustomTheme: boolean;
}

// Actions interface
interface ThemeActions {
  // Theme mode control
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSystemTheme: (systemMode: ThemeMode) => void;

  // User mode control
  setUserMode: (mode: UserMode) => void;
  toggleUserMode: () => void;

  // Theme preferences
  setFollowSystemTheme: (follow: boolean) => void;
  setHighContrastMode: (enabled: boolean) => void;

  // Custom theme support
  updateCustomColors: (colors: Partial<ColorScheme>) => void;
  resetCustomColors: () => void;
  applyPresetTheme: (preset: 'light' | 'dark' | 'admin') => void;

  // Utility methods
  getCurrentColors: () => ColorScheme;
  getStatusColor: (status: string) => string;
  refreshTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

// Get colors based on current theme settings
const getColorsForTheme = (
  themeMode: ThemeMode,
  userMode: UserMode,
  systemTheme: ThemeMode,
  followSystem: boolean,
  customColors: Partial<ColorScheme>,
): ColorScheme => {
  let baseColors: ColorScheme;

  // Determine effective theme mode
  const effectiveMode = followSystem ? systemTheme : themeMode;

  // Select base color scheme
  if (userMode === 'admin') {
    baseColors = adminColorScheme;
  } else {
    baseColors = effectiveMode === 'dark' ? darkColorScheme : lightColorScheme;
  }

  // Apply custom colors if any
  return { ...baseColors, ...customColors };
};

// Initial state
const getInitialColors = () =>
  getColorsForTheme('light', 'resident', 'light', false, {});

const initialState: ThemeState = {
  themeMode: 'system',
  userMode: 'resident',
  colors: getInitialColors(),
  systemThemeDetected: 'light',
  followSystemTheme: true,
  adminThemeEnabled: false,
  highContrastMode: false,
  customColors: {},
  hasCustomTheme: false,
  loading: false,
  error: null,
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
 * ThemeStore - Zustand store for theme management
 *
 * Features:
 * - Light/Dark theme support
 * - Admin/Resident theme modes
 * - System theme detection
 * - Custom color schemes
 * - High contrast mode
 * - Persistent theme preferences
 */
export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Theme mode control
        setThemeMode: (mode: ThemeMode) => {
          set((state) => {
            state.themeMode = mode;
            state.followSystemTheme = mode === 'system';
            state.colors = getColorsForTheme(
              mode,
              state.userMode,
              state.systemThemeDetected,
              state.followSystemTheme,
              state.customColors,
            );
          });
        },

        toggleTheme: () => {
          const currentMode = get().themeMode;
          const newMode = currentMode === 'light' ? 'dark' : 'light';
          get().setThemeMode(newMode);
        },

        setSystemTheme: (systemMode: ThemeMode) => {
          set((state) => {
            state.systemThemeDetected = systemMode;
            if (state.followSystemTheme) {
              state.colors = getColorsForTheme(
                state.themeMode,
                state.userMode,
                systemMode,
                state.followSystemTheme,
                state.customColors,
              );
            }
          });
        },

        // User mode control
        setUserMode: (mode: UserMode) => {
          set((state) => {
            state.userMode = mode;
            state.adminThemeEnabled = mode === 'admin';
            state.colors = getColorsForTheme(
              state.themeMode,
              mode,
              state.systemThemeDetected,
              state.followSystemTheme,
              state.customColors,
            );
          });
        },

        toggleUserMode: () => {
          const currentMode = get().userMode;
          const newMode = currentMode === 'resident' ? 'admin' : 'resident';
          get().setUserMode(newMode);
        },

        // Theme preferences
        setFollowSystemTheme: (follow: boolean) => {
          set((state) => {
            state.followSystemTheme = follow;
            if (!follow && state.themeMode === 'system') {
              state.themeMode = state.systemThemeDetected;
            }
            state.colors = getColorsForTheme(
              state.themeMode,
              state.userMode,
              state.systemThemeDetected,
              follow,
              state.customColors,
            );
          });
        },

        setHighContrastMode: (enabled: boolean) => {
          set((state) => {
            state.highContrastMode = enabled;
            // Could modify colors here for high contrast
            if (enabled) {
              // Apply high contrast modifications
              state.colors = {
                ...state.colors,
                textPrimary:
                  state.colors.textPrimary === lightColorScheme.textPrimary
                    ? '#000000'
                    : '#ffffff',
                border:
                  state.colors.border === lightColorScheme.border
                    ? '#000000'
                    : '#ffffff',
              };
            } else {
              // Restore normal colors
              state.colors = getColorsForTheme(
                state.themeMode,
                state.userMode,
                state.systemThemeDetected,
                state.followSystemTheme,
                state.customColors,
              );
            }
          });
        },

        // Custom theme support
        updateCustomColors: (colors: Partial<ColorScheme>) => {
          set((state) => {
            state.customColors = { ...state.customColors, ...colors };
            state.hasCustomTheme = Object.keys(state.customColors).length > 0;
            state.colors = getColorsForTheme(
              state.themeMode,
              state.userMode,
              state.systemThemeDetected,
              state.followSystemTheme,
              state.customColors,
            );
          });
        },

        resetCustomColors: () => {
          set((state) => {
            state.customColors = {};
            state.hasCustomTheme = false;
            state.colors = getColorsForTheme(
              state.themeMode,
              state.userMode,
              state.systemThemeDetected,
              state.followSystemTheme,
              {},
            );
          });
        },

        applyPresetTheme: (preset: 'light' | 'dark' | 'admin') => {
          set((state) => {
            switch (preset) {
              case 'light':
                state.themeMode = 'light';
                state.userMode = 'resident';
                state.followSystemTheme = false;
                break;
              case 'dark':
                state.themeMode = 'dark';
                state.userMode = 'resident';
                state.followSystemTheme = false;
                break;
              case 'admin':
                state.userMode = 'admin';
                state.adminThemeEnabled = true;
                break;
            }

            state.customColors = {};
            state.hasCustomTheme = false;
            state.colors = getColorsForTheme(
              state.themeMode,
              state.userMode,
              state.systemThemeDetected,
              state.followSystemTheme,
              state.customColors,
            );
          });
        },

        // Utility methods
        getCurrentColors: (): ColorScheme => {
          return get().colors;
        },

        getStatusColor: (status: string): string => {
          const colors = get().colors;
          const statusColors: Record<string, string> = {
            success: colors.success,
            approved: colors.success,
            completed: colors.success,
            published: colors.success,

            warning: colors.warning,
            pending: colors.warning,
            in_progress: colors.warning,
            high_priority: colors.warning,

            error: colors.error,
            danger: colors.error,
            rejected: colors.error,
            overdue: colors.error,
            emergency: colors.error,

            info: colors.info,
            draft: colors.info,
            normal: colors.textSecondary,
          };

          return statusColors[status] || colors.textSecondary;
        },

        refreshTheme: () => {
          const state = get();
          set((draft) => {
            draft.colors = getColorsForTheme(
              state.themeMode,
              state.userMode,
              state.systemThemeDetected,
              state.followSystemTheme,
              state.customColors,
            );
          });
        },

        // BaseStore methods
        setLoading: (loading: boolean) => {
          set((state) => {
            state.loading = loading;
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
        name: 'theme-storage',
        partialize: (state) => ({
          themeMode: state.themeMode,
          userMode: state.userMode,
          followSystemTheme: state.followSystemTheme,
          adminThemeEnabled: state.adminThemeEnabled,
          highContrastMode: state.highContrastMode,
          customColors: state.customColors,
          hasCustomTheme: state.hasCustomTheme,
        }),
        version: 1,
      },
    ),
    { name: 'ThemeStore' },
  ),
);

// Selectors for optimized subscriptions
export const useThemeMode = () => useThemeStore((state) => state.themeMode);
export const useUserMode = () => useThemeStore((state) => state.userMode);
export const useThemeColors = () => useThemeStore((state) => state.colors);
export const useIsAdminTheme = () =>
  useThemeStore((state) => state.userMode === 'admin');
export const useIsDarkTheme = () =>
  useThemeStore((state) => {
    const { themeMode, systemThemeDetected, followSystemTheme } = state;
    const effectiveMode = followSystemTheme ? systemThemeDetected : themeMode;
    return effectiveMode === 'dark';
  });

export const useThemeActions = () =>
  useThemeStore((state) => ({
    setThemeMode: state.setThemeMode,
    toggleTheme: state.toggleTheme,
    setUserMode: state.setUserMode,
    toggleUserMode: state.toggleUserMode,
    setFollowSystemTheme: state.setFollowSystemTheme,
    setHighContrastMode: state.setHighContrastMode,
    updateCustomColors: state.updateCustomColors,
    resetCustomColors: state.resetCustomColors,
    applyPresetTheme: state.applyPresetTheme,
    getStatusColor: state.getStatusColor,
    refreshTheme: state.refreshTheme,
  }));

// Computed selectors
export const useThemeComputed = () =>
  useThemeStore((state) => ({
    isDarkMode: (() => {
      const effectiveMode = state.followSystemTheme
        ? state.systemThemeDetected
        : state.themeMode;
      return effectiveMode === 'dark';
    })(),
    isAdminMode: state.userMode === 'admin',
    isSystemTheme: state.themeMode === 'system',
    hasCustomization: state.hasCustomTheme || state.highContrastMode,
    effectiveTheme: state.followSystemTheme
      ? state.systemThemeDetected
      : state.themeMode,
  }));
