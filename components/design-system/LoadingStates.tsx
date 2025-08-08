import React from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { Loader2 } from 'lucide-react-native';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  className?: string;
}

interface SkeletonProps {
  width?: number | string;
  height?: number;
  className?: string;
  animated?: boolean;
}

interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
}

interface LoadingListProps {
  itemCount?: number;
  itemHeight?: number;
  showDividers?: boolean;
  className?: string;
}

interface PageLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

interface InlineLoadingProps {
  text?: string;
  size?: 'small' | 'medium';
  className?: string;
}

/**
 * LoadingSpinner - Basic loading spinner with text
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#6366f1',
  text,
  className,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 40;
      default: return 28;
    }
  };

  return (
    <View className={cn('items-center justify-center py-4', className)}>
      <ActivityIndicator size={getSizeValue()} color={color} />
      {text && (
        <Text className="text-gray-600 text-sm mt-2 text-center">
          {text}
        </Text>
      )}
    </View>
  );
};

/**
 * Skeleton - Animated skeleton placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  className,
  animated = true,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const opacity = animated 
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
      })
    : 0.3;

  return (
    <Animated.View
      className={cn('bg-gray-200 rounded', className)}
      style={{
        width,
        height,
        opacity,
      }}
    />
  );
};

/**
 * LoadingCard - Skeleton for card-like content
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  showImage = false,
  className,
}) => {
  return (
    <View className={cn('bg-white p-4 rounded-xl border border-gray-200', className)}>
      {/* Header with Avatar */}
      {showAvatar && (
        <View className="flex-row items-center mb-3">
          <Skeleton width={40} height={40} className="rounded-full mr-3" />
          <View className="flex-1">
            <Skeleton width="60%" height={16} className="mb-2" />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      )}

      {/* Image Placeholder */}
      {showImage && (
        <Skeleton width="100%" height={200} className="mb-3 rounded-lg" />
      )}

      {/* Content Lines */}
      <View className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '75%' : '100%'}
            height={14}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-end mt-4 space-x-2">
        <Skeleton width={80} height={32} className="rounded-md" />
        <Skeleton width={80} height={32} className="rounded-md" />
      </View>
    </View>
  );
};

/**
 * LoadingList - Skeleton for list items
 */
export const LoadingList: React.FC<LoadingListProps> = ({
  itemCount = 5,
  itemHeight = 72,
  showDividers = true,
  className,
}) => {
  return (
    <View className={cn('bg-white', className)}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index}>
          <View 
            className="flex-row items-center px-4 py-3"
            style={{ minHeight: itemHeight }}
          >
            <Skeleton width={40} height={40} className="rounded-full mr-3" />
            <View className="flex-1">
              <Skeleton width="70%" height={16} className="mb-2" />
              <Skeleton width="45%" height={12} />
            </View>
            <Skeleton width={24} height={24} className="rounded" />
          </View>
          {showDividers && index < itemCount - 1 && (
            <View className="h-px bg-gray-200 mx-4" />
          )}
        </View>
      ))}
    </View>
  );
};

/**
 * LoadingGrid - Skeleton for grid layouts
 */
export const LoadingGrid: React.FC<{
  itemCount?: number;
  columns?: number;
  className?: string;
}> = ({
  itemCount = 6,
  columns = 2,
  className,
}) => {
  return (
    <View className={cn('flex-row flex-wrap', className)}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View
          key={index}
          className="p-2"
          style={{ width: `${100 / columns}%` }}
        >
          <View className="bg-white p-4 rounded-xl border border-gray-200">
            <Skeleton width="100%" height={120} className="mb-3 rounded-lg" />
            <Skeleton width="80%" height={16} className="mb-2" />
            <Skeleton width="60%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * PageLoading - Full page loading with optional progress
 */
export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  className,
}) => {
  return (
    <View className={cn('flex-1 items-center justify-center bg-gray-50 px-4', className)}>
      <View className="items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-lg font-medium text-gray-900 mt-4 text-center">
          {message}
        </Text>
        
        {showProgress && (
          <View className="w-64 mt-4">
            <View className="w-full bg-gray-200 rounded-full h-2">
              <View 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </View>
            <Text className="text-sm text-gray-600 text-center mt-2">
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * InlineLoading - Small loading indicator for inline use
 */
export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = 'Loading...',
  size = 'small',
  className,
}) => {
  const iconSize = size === 'small' ? 16 : 20;
  
  return (
    <View className={cn('flex-row items-center justify-center py-2', className)}>
      <ActivityIndicator size={iconSize} color="#6366f1" />
      <Text className={cn(
        'ml-2 text-gray-600',
        size === 'small' ? 'text-sm' : 'text-base'
      )}>
        {text}
      </Text>
    </View>
  );
};

/**
 * LoadingButton - Loading state for buttons
 */
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({
  loading = false,
  children,
  className,
}) => {
  return (
    <View className={cn('flex-row items-center justify-center', className)}>
      {loading && (
        <ActivityIndicator size="small" color="currentColor" style={{ marginRight: 8 }} />
      )}
      {children}
    </View>
  );
};

/**
 * PulsingDot - Animated dot for real-time status
 */
export const PulsingDot: React.FC<{
  color?: string;
  size?: number;
  className?: string;
}> = ({
  color = '#10b981',
  size = 8,
  className,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scaleValue]);

  return (
    <Animated.View
      className={cn('rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        transform: [{ scale: scaleValue }],
      }}
    />
  );
};

/**
 * LoadingOverlay - Semi-transparent overlay with loading
 */
export const LoadingOverlay: React.FC<{
  visible?: boolean;
  message?: string;
  className?: string;
}> = ({
  visible = true,
  message = 'Loading...',
  className,
}) => {
  if (!visible) return null;

  return (
    <View className={cn(
      'absolute inset-0 bg-black/50 items-center justify-center z-50',
      className
    )}>
      <View className="bg-white p-6 rounded-xl items-center min-w-[200px]">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-900 font-medium mt-3 text-center">
          {message}
        </Text>
      </View>
    </View>
  );
};

// Export all components
export default {
  LoadingSpinner,
  Skeleton,
  LoadingCard,
  LoadingList,
  LoadingGrid,
  PageLoading,
  InlineLoading,
  LoadingButton,
  PulsingDot,
  LoadingOverlay,
};

// Add display names
LoadingSpinner.displayName = 'LoadingSpinner';
Skeleton.displayName = 'Skeleton';
LoadingCard.displayName = 'LoadingCard';
LoadingList.displayName = 'LoadingList';
LoadingGrid.displayName = 'LoadingGrid';
PageLoading.displayName = 'PageLoading';
InlineLoading.displayName = 'InlineLoading';
LoadingButton.displayName = 'LoadingButton';
PulsingDot.displayName = 'PulsingDot';
LoadingOverlay.displayName = 'LoadingOverlay';