/**
 * ResponsiveContainer Component
 *
 * Universal container component that applies responsive design principles
 * without hardcoding screen sizes. Provides consistent spacing, overflow
 * protection, and flexible layouts that work on any device.
 */

import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  responsiveClasses,
  layoutUtils,
  scrollUtils,
} from '@/utils/responsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  // Layout options
  type?: 'view' | 'scroll' | 'flex';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  // Content options
  preventOverflow?: boolean;
  centerContent?: boolean;
  // Scroll options (when type='scroll')
  showScrollIndicator?: boolean;
  keyboardAware?: boolean;
  // Style overrides
  className?: string;
  style?: any;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  type = 'view',
  padding = 'md',
  gap = 'md',
  preventOverflow = true,
  centerContent = false,
  showScrollIndicator = false,
  keyboardAware = true,
  className = '',
  style,
}) => {
  // Generate responsive classes
  const containerClass = responsiveClasses.container();
  const contentSpacingClass = responsiveClasses.contentSpacing();

  // Padding mapping
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  // Gap mapping
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const baseClasses = [
    containerClass,
    paddingClasses[padding],
    gapClasses[gap],
    preventOverflow ? 'overflow-hidden' : '',
    centerContent ? 'items-center justify-center' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const baseStyle = [
    preventOverflow ? layoutUtils.preventContainerOverflow : {},
    centerContent ? { alignItems: 'center', justifyContent: 'center' } : {},
    style,
  ];

  if (type === 'scroll') {
    return (
      <ScrollView
        className={baseClasses}
        style={baseStyle}
        contentContainerStyle={scrollUtils.scrollContainerStyle}
        showsVerticalScrollIndicator={showScrollIndicator}
        keyboardShouldPersistTaps={keyboardAware ? 'handled' : 'never'}>
        {children}
      </ScrollView>
    );
  }

  if (type === 'flex') {
    return (
      <View
        className={`${baseClasses} flex-1`}
        style={[...baseStyle, layoutUtils.safeFlexContainer]}>
        {children}
      </View>
    );
  }

  return (
    <View className={baseClasses} style={baseStyle}>
      {children}
    </View>
  );
};

/**
 * Responsive Card Component
 * Card that maintains proper spacing and overflow protection
 */
interface ResponsiveCardProps {
  children: ReactNode;
  variant?: 'default' | 'surface' | 'elevated';
  className?: string;
  style?: any;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style,
}) => {
  const cardClass = responsiveClasses.card();

  const variantClasses = {
    default: 'bg-background border border-divider',
    surface: 'bg-surface border border-divider',
    elevated: 'bg-surface shadow-md',
  };

  const cardClasses = [
    cardClass,
    variantClasses[variant],
    'rounded-xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View
      className={cardClasses}
      style={[layoutUtils.preventContainerOverflow, style]}>
      {children}
    </View>
  );
};

/**
 * Responsive Row Component
 * Flexible row that handles wrapping and spacing automatically
 */
interface ResponsiveRowProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveRow: React.FC<ResponsiveRowProps> = ({
  children,
  align = 'center',
  justify = 'start',
  wrap = true,
  gap = 'md',
  className = '',
}) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const rowClasses = [
    'flex-row',
    wrap ? 'flex-wrap' : '',
    alignClasses[align],
    justifyClasses[justify],
    gapClasses[gap],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View className={rowClasses} style={layoutUtils.preventContainerOverflow}>
      {children}
    </View>
  );
};

/**
 * Responsive Text Component
 * Text that handles overflow and sizing automatically
 */
interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'display' | 'headline' | 'body' | 'label';
  size?: 'small' | 'medium' | 'large';
  numberOfLines?: number;
  className?: string;
  style?: any;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  size = 'medium',
  numberOfLines,
  className = '',
  style,
}) => {
  const Text = require('react-native').Text;

  const variantSizeClasses = {
    display: {
      small: 'text-display-small',
      medium: 'text-display-medium',
      large: 'text-display-large',
    },
    headline: {
      small: 'text-headline-small',
      medium: 'text-headline-medium',
      large: 'text-headline-large',
    },
    body: {
      small: 'text-body-small',
      medium: 'text-body-medium',
      large: 'text-body-large',
    },
    label: {
      small: 'text-label-small',
      medium: 'text-label-medium',
      large: 'text-label-large',
    },
  };

  const textClasses = [
    variantSizeClasses[variant][size],
    'text-text-primary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Text
      className={textClasses}
      style={[layoutUtils.preventTextOverflow, style]}
      numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

/**
 * Responsive Button Component
 * Button with universal sizing and spacing
 */
interface ResponsiveButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: any;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style,
}) => {
  const TouchableOpacity = require('react-native').TouchableOpacity;
  const buttonClass = responsiveClasses.button();

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border border-primary bg-transparent',
    ghost: 'bg-transparent',
  };

  const sizeClasses = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  };

  const buttonClasses = [
    buttonClass,
    variantClasses[variant],
    sizeClasses[size],
    'rounded-xl items-center justify-center',
    disabled ? 'opacity-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TouchableOpacity
      className={buttonClasses}
      style={style}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};
