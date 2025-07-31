/**
 * Universal Responsive Design System
 *
 * This system provides responsive utilities that work across all screen sizes
 * without hardcoding specific device dimensions. Uses relative units and
 * flexible layouts that adapt naturally to any screen size.
 */

import { Dimensions, PixelRatio } from 'react-native';

// Get current screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Responsive dimension utilities using percentage-based scaling
 */
export const responsive = {
  // Width percentages
  width: (percentage: number) => (screenWidth * percentage) / 100,

  // Height percentages
  height: (percentage: number) => (screenHeight * percentage) / 100,

  // Font scaling based on screen width
  fontSize: (size: number) => {
    const scale = screenWidth / 375; // Base on iPhone X width
    const newSize = size * scale;
    return Math.max(12, Math.min(newSize, size * 1.3)); // Min 12px, max 130% of original
  },

  // Spacing that adapts to screen size
  spacing: (base: number) => {
    const scale = Math.min(screenWidth / 375, screenHeight / 812);
    return Math.max(4, base * scale);
  },
};

/**
 * Universal layout classes that work on any screen size
 */
export const universalStyles = {
  // Container constraints
  container: {
    maxWidth: '100%',
    paddingHorizontal: responsive.width(4), // 4% of screen width
    overflow: 'hidden' as const,
  },

  // Card spacing that scales with screen
  cardSpacing: {
    marginBottom: responsive.spacing(16),
    marginHorizontal: responsive.width(4),
  },

  // Flexible text that doesn't overflow
  flexibleText: {
    flexShrink: 1,
    flexWrap: 'wrap' as const,
    numberOfLines: 1,
  },

  // Input containers that adapt
  inputContainer: {
    minHeight: responsive.height(6), // 6% of screen height
    paddingHorizontal: responsive.spacing(16),
    paddingVertical: responsive.spacing(12),
  },

  // Button sizing that scales
  button: {
    minHeight: responsive.height(6),
    paddingHorizontal: responsive.spacing(24),
    paddingVertical: responsive.spacing(16),
  },

  // List item spacing
  listItem: {
    paddingVertical: responsive.spacing(12),
    marginBottom: responsive.spacing(8),
  },
};

/**
 * Tailwind class generators for responsive design
 */
export const responsiveClasses = {
  // Container with universal padding
  container: () =>
    `w-full max-w-full overflow-hidden px-[${responsive.width(4)}px]`,

  // Card with responsive margins
  card: () =>
    `mb-[${responsive.spacing(16)}px] mx-[${responsive.width(4)}px] overflow-hidden`,

  // Flexible text container
  textContainer: () => `flex-1 flex-shrink min-w-0`,

  // Input with adaptive height
  input: () =>
    `min-h-[${responsive.height(6)}px] px-[${responsive.spacing(16)}px] py-[${responsive.spacing(12)}px]`,

  // Button with scalable sizing
  button: () =>
    `min-h-[${responsive.height(6)}px] px-[${responsive.spacing(24)}px] py-[${responsive.spacing(16)}px]`,

  // List item spacing
  listItem: () =>
    `py-[${responsive.spacing(12)}px] mb-[${responsive.spacing(8)}px]`,

  // Safe spacing for content
  contentSpacing: () => `gap-[${responsive.spacing(16)}px]`,

  // Icon sizing that scales
  iconSize: (base: number = 20) =>
    Math.max(16, Math.min(base * (screenWidth / 375), base * 1.5)),
};

/**
 * Layout utilities for preventing common issues
 */
export const layoutUtils = {
  // Prevent text overflow
  preventTextOverflow: {
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden' as const,
  },

  // Prevent container overflow
  preventContainerOverflow: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden' as const,
  },

  // Flexible row that wraps properly
  flexibleRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
    gap: responsive.spacing(8),
  },

  // Safe flex container
  safeFlexContainer: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },

  // Responsive grid
  responsiveGrid: (columns: number) => ({
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: responsive.spacing(12),
    '> *': {
      flex: `0 0 ${Math.floor(100 / columns) - 2}%`,
      maxWidth: `${Math.floor(100 / columns) - 2}%`,
    },
  }),
};

/**
 * Chart and graph responsive utilities
 */
export const chartUtils = {
  // Chart container with proper constraints
  chartContainer: {
    width: responsive.width(92), // 92% of screen width
    maxWidth: responsive.width(92),
    overflow: 'hidden' as const,
    alignSelf: 'center' as const,
  },

  // Bar chart responsive sizing
  barChart: {
    width: responsive.width(88),
    height: responsive.height(25), // 25% of screen height
    maxHeight: 300,
    minHeight: 200,
  },

  // Pie chart sizing
  pieChart: {
    width: Math.min(responsive.width(80), responsive.height(40)),
    height: Math.min(responsive.width(80), responsive.height(40)),
  },
};

/**
 * Typography scale that adapts to screen size
 */
export const adaptiveTypography = {
  displayLarge: responsive.fontSize(32),
  displayMedium: responsive.fontSize(28),
  displaySmall: responsive.fontSize(24),
  headlineLarge: responsive.fontSize(22),
  headlineMedium: responsive.fontSize(20),
  headlineSmall: responsive.fontSize(18),
  bodyLarge: responsive.fontSize(16),
  bodyMedium: responsive.fontSize(14),
  bodySmall: responsive.fontSize(12),
  labelLarge: responsive.fontSize(14),
  labelMedium: responsive.fontSize(12),
  labelSmall: responsive.fontSize(10),
};

/**
 * Utility to check if content needs scrolling
 */
export const scrollUtils = {
  shouldScroll: (contentHeight: number) => contentHeight > screenHeight * 0.8,

  scrollContainerStyle: {
    flexGrow: 1,
    paddingBottom: responsive.spacing(20),
  },

  keyboardAvoidingStyle: {
    flex: 1,
    behavior: 'padding' as const,
    keyboardVerticalOffset: responsive.height(10),
  },
};

/**
 * Export current screen info for debugging
 */
export const screenInfo = {
  width: screenWidth,
  height: screenHeight,
  pixelRatio: PixelRatio.get(),
  aspectRatio: screenWidth / screenHeight,
  isTablet: screenWidth >= 768,
  isLandscape: screenWidth > screenHeight,
};
