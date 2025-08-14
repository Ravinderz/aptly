/**
 * UI utility functions for the Aptly app
 * These functions provide common UI-related functionality
 */

import { Dimensions, Platform, StatusBar } from 'react-native';

/**
 * Get device dimensions with safe area considerations
 */
export const getDeviceDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const screenData = Dimensions.get('screen');

  return {
    window: { width, height },
    screen: screenData,
    isSmallDevice: width < 375,
    isTablet: width >= 768,
  };
};

/**
 * Get safe area top padding for Android
 */
export const getSafeAreaTop = (): number => {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
};

/**
 * Generate consistent avatar background colors based on name
 * @param name - Name to generate color for
 * @returns Tailwind color class
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-warning',
    'bg-error/80',
    'bg-primary/80',
    'bg-secondary/80',
  ];

  if (!name) return colors[0];

  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Generate notification badge color based on priority
 * @param priority - Priority level
 * @returns Object with background and text color classes
 */
export const getPriorityColors = (
  priority: 'low' | 'medium' | 'high' | 'emergency',
) => {
  switch (priority) {
    case 'emergency':
      return {
        background: 'bg-error',
        text: 'text-white',
        border: 'border-error',
        icon: 'text-error',
      };
    case 'high':
      return {
        background: 'bg-warning',
        text: 'text-white',
        border: 'border-warning',
        icon: 'text-warning',
      };
    case 'medium':
      return {
        background: 'bg-primary',
        text: 'text-white',
        border: 'border-primary',
        icon: 'text-primary',
      };
    case 'low':
    default:
      return {
        background: 'bg-secondary',
        text: 'text-white',
        border: 'border-secondary',
        icon: 'text-secondary',
      };
  }
};

/**
 * Generate status colors for various states
 * @param status - Status value
 * @returns Color classes for the status
 */
export const getStatusColors = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (
    ['approved', 'completed', 'success', 'active', 'paid'].includes(
      normalizedStatus,
    )
  ) {
    return {
      background: 'bg-secondary/10',
      text: 'text-secondary',
      border: 'border-secondary',
    };
  }

  if (['pending', 'in-progress', 'processing'].includes(normalizedStatus)) {
    return {
      background: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning',
    };
  }

  if (
    ['rejected', 'failed', 'error', 'cancelled', 'overdue'].includes(
      normalizedStatus,
    )
  ) {
    return {
      background: 'bg-error/10',
      text: 'text-error',
      border: 'border-error',
    };
  }

  // Default/neutral status
  return {
    background: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary',
  };
};

/**
 * Generate gradient classes for different card types
 * @param type - Card type
 * @returns Gradient background class
 */
export const getCardGradient = (
  type: 'primary' | 'secondary' | 'success' | 'warning' | 'error',
): string => {
  switch (type) {
    case 'primary':
      return 'bg-gradient-to-br from-primary/5 to-primary/10';
    case 'secondary':
      return 'bg-gradient-to-br from-secondary/5 to-secondary/10';
    case 'success':
      return 'bg-gradient-to-br from-secondary/5 to-secondary/10';
    case 'warning':
      return 'bg-gradient-to-br from-warning/5 to-warning/10';
    case 'error':
      return 'bg-gradient-to-br from-error/5 to-error/10';
    default:
      return 'bg-surface';
  }
};

/**
 * Get appropriate icon size based on component size
 * @param size - Component size
 * @returns Icon size in pixels
 */
export const getIconSize = (size: 'sm' | 'md' | 'lg' | 'xl'): number => {
  switch (size) {
    case 'sm':
      return 16;
    case 'md':
      return 20;
    case 'lg':
      return 24;
    case 'xl':
      return 28;
    default:
      return 20;
  }
};

/**
 * Generate consistent spacing based on design system
 * @param multiplier - Multiplier for 8px base unit
 * @returns Spacing value in pixels
 */
export const getSpacing = (multiplier: number): number => {
  return multiplier * 8; // 8px base unit
};

/**
 * Haptic feedback wrapper (placeholder for actual haptic implementation)
 * @param type - Type of haptic feedback
 */
export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error',
) => {
  // In a real app, this would use Haptics from expo-haptics
  // For now, this is a placeholder for future implementation
  console.log(`Haptic feedback: ${type}`);
};

/**
 * Generate accessibility labels
 * @param element - Element type
 * @param content - Content description
 * @param state - Current state (optional)
 * @returns Accessibility label
 */
export const getAccessibilityLabel = (
  element: string,
  content: string,
  state?: string,
): string => {
  let label = `${element}, ${content}`;
  if (state) {
    label += `, ${state}`;
  }
  return label;
};

/**
 * Check if device is in dark mode (placeholder for theme detection)
 * @returns Boolean indicating dark mode
 */
export const isDarkMode = (): boolean => {
  // In a real app, this would check system/user theme preference
  // For now, returning false as the app uses light theme
  return false;
};

/**
 * Generate shadow styles based on elevation
 * @param elevation - Shadow elevation (0-5)
 * @returns Shadow style classes
 */
export const getShadowStyle = (elevation: number): string => {
  switch (elevation) {
    case 0:
      return '';
    case 1:
      return 'shadow-sm shadow-black/5';
    case 2:
      return 'shadow shadow-black/10';
    case 3:
      return 'shadow-md shadow-black/15';
    case 4:
      return 'shadow-lg shadow-black/20';
    case 5:
      return 'shadow-xl shadow-black/25';
    default:
      return 'shadow shadow-black/10';
  }
};
