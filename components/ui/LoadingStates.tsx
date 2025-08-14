/**
 * Standardized Loading States and Error Components
 * Provides consistent loading, error, and empty state handling across the app
 */

import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import { Button } from './Button';
import { Card } from './Card';

// Loading Components
export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#6366f1',
  className = '',
}) => (
  <View className={`items-center justify-center ${className}`}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
}) => (
  <View
    className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}
  />
);

export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  showAvatar = false,
  className = '',
}) => (
  <Card className={`p-4 ${className}`}>
    <View className="space-y-3">
      {showAvatar && (
        <View className="flex-row items-center space-x-3">
          <Skeleton width="w-12" height="h-12" className="rounded-full" />
          <View className="flex-1 space-y-2">
            <Skeleton width="w-24" height="h-3" />
            <Skeleton width="w-16" height="h-3" />
          </View>
        </View>
      )}
      
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-3"
        />
      ))}
    </View>
  </Card>
);

export interface SkeletonListProps {
  itemCount?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  itemCount = 5,
  showAvatar = false,
  className = '',
}) => (
  <View className={`space-y-3 ${className}`}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <SkeletonCard
        key={index}
        lines={3}
        showAvatar={showAvatar}
      />
    ))}
  </View>
);

// Error Components
export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
  className = '',
}) => (
  <Card className={`p-6 bg-red-50 border-red-200 ${className}`}>
    <View className="items-center">
      {showIcon && <AlertTriangle size={48} color="#dc2626" />}
      
      <Text className="text-lg font-semibold text-red-900 mt-4 mb-2 text-center">
        {title}
      </Text>
      
      <Text className="text-red-700 text-center mb-4">
        {message}
      </Text>
      
      {onRetry && (
        <Button
          onPress={onRetry}
          variant="outline"
          className="border-red-300 bg-white"
        >
          <View className="flex-row items-center">
            <RefreshCw size={16} color="#dc2626" />
            <Text className="text-red-600 font-medium ml-2">{retryText}</Text>
          </View>
        </Button>
      )}
    </View>
  </Card>
);

export interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  className = '',
}) => (
  <ErrorMessage
    title="Connection Problem"
    message="Please check your internet connection and try again."
    onRetry={onRetry}
    retryText="Retry"
    showIcon={false}
    className={className}
  >
    <WifiOff size={48} color="#dc2626" />
  </ErrorMessage>
);

export interface NotFoundErrorProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
  className?: string;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  title = 'Not Found',
  message = 'The requested resource could not be found.',
  onGoBack,
  className = '',
}) => (
  <Card className={`p-6 bg-gray-50 ${className}`}>
    <View className="items-center">
      <Text className="text-6xl">🔍</Text>
      
      <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2 text-center">
        {title}
      </Text>
      
      <Text className="text-gray-600 text-center mb-4">
        {message}
      </Text>
      
      {onGoBack && (
        <Button onPress={onGoBack} variant="outline">
          Go Back
        </Button>
      )}
    </View>
  </Card>
);

// Empty State Components
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <Card className={`p-8 bg-gray-50 ${className}`}>
    <View className="items-center">
      {icon && <View className="mb-4">{icon}</View>}
      
      <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      
      {description && (
        <Text className="text-gray-600 text-center mb-4">
          {description}
        </Text>
      )}
      
      {action && (
        <Button onPress={action.onPress} variant="primary">
          {action.label}
        </Button>
      )}
    </View>
  </Card>
);

// Loading Wrapper Component
export interface LoadingWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onRetry?: () => void;
  skeletonProps?: {
    type?: 'spinner' | 'skeleton' | 'card' | 'list';
    itemCount?: number;
    showAvatar?: boolean;
  };
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  error,
  isEmpty = false,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  skeletonProps = { type: 'spinner' },
}) => {
  // Show loading state
  if (isLoading) {
    if (loadingComponent) return <>{loadingComponent}</>;
    
    switch (skeletonProps.type) {
      case 'skeleton':
        return <SkeletonCard lines={3} showAvatar={skeletonProps.showAvatar} />;
      case 'card':
        return <SkeletonCard lines={4} showAvatar={skeletonProps.showAvatar} />;
      case 'list':
        return (
          <SkeletonList
            itemCount={skeletonProps.itemCount || 5}
            showAvatar={skeletonProps.showAvatar}
          />
        );
      default:
        return <LoadingSpinner className="py-8" />;
    }
  }
  
  // Show error state
  if (error) {
    if (errorComponent) return <>{errorComponent}</>;
    
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      return <NetworkError onRetry={onRetry} />;
    }
    
    return (
      <ErrorMessage
        message={error.message || 'An unexpected error occurred'}
        onRetry={onRetry}
      />
    );
  }
  
  // Show empty state
  if (isEmpty) {
    if (emptyComponent) return <>{emptyComponent}</>;
    
    return (
      <EmptyState
        title="No data available"
        description="There's nothing to show here yet."
      />
    );
  }
  
  // Show content
  return <>{children}</>;
};

// Hook for managing async states
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
}

export function useAsyncState<T>(
  initialData: T | null = null
): [AsyncState<T>, {
  setLoading: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
  reset: () => void;
}] {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isEmpty: false,
  });

  const setLoading = React.useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
  }, []);

  const setData = React.useCallback((data: T) => {
    setState({
      data,
      isLoading: false,
      error: null,
      isEmpty: !data || (Array.isArray(data) && data.length === 0),
    });
  }, []);

  const setError = React.useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
    }));
  }, []);

  const reset = React.useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isEmpty: false,
    });
  }, [initialData]);

  return [state, { setLoading, setData, setError, reset }];
}

// Export all components and types
export type {
  LoadingSpinnerProps,
  SkeletonProps,
  SkeletonCardProps,
  SkeletonListProps,
  ErrorMessageProps,
  NetworkErrorProps,
  NotFoundErrorProps,
  EmptyStateProps,
  LoadingWrapperProps,
  AsyncState,
};