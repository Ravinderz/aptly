import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Clock,
  Server,
  Lock,
  Ban,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface ErrorAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

interface BaseErrorProps {
  title: string;
  message: string;
  actions?: ErrorAction[];
  className?: string;
  showIcon?: boolean;
}

interface ErrorBannerProps extends BaseErrorProps {
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface ErrorCardProps extends BaseErrorProps {
  variant?: 'error' | 'warning' | 'info';
}

interface ErrorPageProps extends BaseErrorProps {
  variant?: 'error' | 'warning' | 'info';
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * ErrorBanner - Top banner for non-critical errors
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title,
  message,
  actions = [],
  variant = 'error',
  dismissible = true,
  onDismiss,
  showIcon = true,
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: <AlertTriangle size={20} color="#f59e0b" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-800',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: <AlertCircle size={20} color="#3b82f6" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-800',
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: <AlertCircle size={20} color="#dc2626" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <View className={cn(
      'border-l-4 p-4 mb-4',
      styles.container,
      className
    )}>
      <View className="flex-row">
        {showIcon && (
          <View className="flex-shrink-0 mr-3">
            {styles.icon}
          </View>
        )}
        
        <View className="flex-1 min-w-0">
          <Text className={cn('text-sm font-medium mb-1', styles.titleColor)}>
            {title}
          </Text>
          <Text className={cn('text-sm', styles.messageColor)}>
            {message}
          </Text>
          
          {actions.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  className={cn(
                    'px-3 py-1 rounded-md flex-row items-center',
                    variant === 'error' && 'bg-red-100',
                    variant === 'warning' && 'bg-yellow-100',
                    variant === 'info' && 'bg-blue-100'
                  )}
                >
                  {action.icon && (
                    <View className="mr-1">
                      {action.icon}
                    </View>
                  )}
                  <Text className={cn(
                    'text-sm font-medium',
                    variant === 'error' && 'text-red-700',
                    variant === 'warning' && 'text-yellow-700',
                    variant === 'info' && 'text-blue-700'
                  )}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {dismissible && onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            className="flex-shrink-0 ml-3 p-1"
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
          >
            <XCircle size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * ErrorCard - Card format for errors in content areas
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  message,
  actions = [],
  variant = 'error',
  showIcon = true,
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: <AlertTriangle size={24} color="#f59e0b" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-800',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: <AlertCircle size={24} color="#3b82f6" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-800',
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: <AlertCircle size={24} color="#dc2626" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={cn(styles.container, className)}>
      <View className="p-6 text-center items-center">
        {showIcon && (
          <View className="mb-4">
            {styles.icon}
          </View>
        )}
        
        <Text className={cn('text-lg font-semibold mb-2 text-center', styles.titleColor)}>
          {title}
        </Text>
        
        <Text className={cn('text-sm text-center mb-4 leading-relaxed', styles.messageColor)}>
          {message}
        </Text>
        
        {actions.length > 0 && (
          <View className="flex-row flex-wrap justify-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                onPress={action.onPress}
                variant={action.variant || 'outline'}
                size="sm"
                className="min-w-[100px]"
              >
                <View className="flex-row items-center">
                  {action.icon && (
                    <View className="mr-2">
                      {action.icon}
                    </View>
                  )}
                  <Text>{action.label}</Text>
                </View>
              </Button>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
};

/**
 * ErrorPage - Full page error states
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({
  title,
  message,
  actions = [],
  variant = 'error',
  showIcon = true,
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <AlertTriangle size={48} color="#f59e0b" />,
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
        };
      case 'info':
        return {
          icon: <AlertCircle size={48} color="#3b82f6" />,
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
        };
      default:
        return {
          icon: <AlertCircle size={48} color="#dc2626" />,
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <View className={cn('flex-1 items-center justify-center bg-gray-50 px-6', className)}>
      <View className="items-center max-w-sm">
        {showIcon && (
          <View className="mb-6">
            {styles.icon}
          </View>
        )}
        
        <Text className={cn('text-2xl font-bold mb-4 text-center', styles.titleColor)}>
          {title}
        </Text>
        
        <Text className={cn('text-base text-center mb-8 leading-relaxed', styles.messageColor)}>
          {message}
        </Text>
        
        {actions.length > 0 && (
          <View className="w-full space-y-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onPress={action.onPress}
                variant={action.variant || 'primary'}
                className="w-full"
              >
                <View className="flex-row items-center justify-center">
                  {action.icon && (
                    <View className="mr-2">
                      {action.icon}
                    </View>
                  )}
                  <Text>{action.label}</Text>
                </View>
              </Button>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * InlineError - Small inline error for forms
 */
export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className,
}) => {
  return (
    <View className={cn('flex-row items-center mt-1', className)}>
      <AlertCircle size={14} color="#dc2626" />
      <Text className="text-red-600 text-sm ml-1 flex-1">
        {message}
      </Text>
    </View>
  );
};

/**
 * Predefined Error Components for Common Scenarios
 */

// Network Error
export const NetworkError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <ErrorCard
    title="Connection Problem"
    message="Unable to connect to the server. Please check your internet connection and try again."
    actions={onRetry ? [{
      label: 'Retry',
      onPress: onRetry,
      variant: 'primary',
      icon: <RefreshCw size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// Server Error
export const ServerError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <ErrorCard
    title="Server Error"
    message="Something went wrong on our end. Our team has been notified. Please try again in a few moments."
    actions={onRetry ? [{
      label: 'Try Again',
      onPress: onRetry,
      variant: 'primary',
      icon: <RefreshCw size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// Unauthorized Error
export const UnauthorizedError: React.FC<{
  onLogin?: () => void;
  className?: string;
}> = ({ onLogin, className }) => (
  <ErrorCard
    title="Access Denied"
    message="You don't have permission to access this content. Please sign in or contact support."
    actions={onLogin ? [{
      label: 'Sign In',
      onPress: onLogin,
      variant: 'primary',
      icon: <Lock size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// Timeout Error
export const TimeoutError: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <ErrorCard
    title="Request Timeout"
    message="The request took too long to complete. This might be due to a slow connection."
    actions={onRetry ? [{
      label: 'Try Again',
      onPress: onRetry,
      variant: 'primary',
      icon: <Clock size={16} color="currentColor" />
    }] : []}
    className={className}
  />
);

// Maintenance Mode
export const MaintenanceError: React.FC<{
  estimatedTime?: string;
  className?: string;
}> = ({ estimatedTime, className }) => (
  <ErrorPage
    title="Under Maintenance"
    message={`We're currently performing scheduled maintenance to improve your experience. ${estimatedTime ? `Estimated completion: ${estimatedTime}` : `We'll be back soon!`}`}
    variant="warning"
    className={className}
  />
);

// Rate Limit Error
export const RateLimitError: React.FC<{
  resetTime?: string;
  className?: string;
}> = ({ resetTime, className }) => (
  <ErrorCard
    title="Too Many Requests"
    message={`You've exceeded the request limit. ${resetTime ? `Try again after ${resetTime}.` : 'Please wait a moment before trying again.'}`}
    variant="warning"
    className={className}
  />
);

// Export all components
export default {
  ErrorBanner,
  ErrorCard,
  ErrorPage,
  InlineError,
  NetworkError,
  ServerError,
  UnauthorizedError,
  TimeoutError,
  MaintenanceError,
  RateLimitError,
};

// Add display names
ErrorBanner.displayName = 'ErrorBanner';
ErrorCard.displayName = 'ErrorCard';
ErrorPage.displayName = 'ErrorPage';
InlineError.displayName = 'InlineError';
NetworkError.displayName = 'NetworkError';
ServerError.displayName = 'ServerError';
UnauthorizedError.displayName = 'UnauthorizedError';
TimeoutError.displayName = 'TimeoutError';
MaintenanceError.displayName = 'MaintenanceError';
RateLimitError.displayName = 'RateLimitError';