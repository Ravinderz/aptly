import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface SecurityQuickActionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  onPress: () => void;
  disabled?: boolean;
  badge?: {
    count: number;
    variant?: 'danger' | 'warning' | 'info';
  };
  className?: string;
}

/**
 * Security Quick Action Component
 * 
 * Features:
 * - Consistent action button styling
 * - Multiple visual variants
 * - Badge support for notifications
 * - Disabled state handling
 * - Icon integration
 */
const SecurityQuickAction = ({
  title,
  description,
  icon,
  variant = 'primary',
  onPress,
  disabled = false,
  badge,
  className
}: SecurityQuickActionProps) => {
  const variantStyles = {
    primary: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      desc: 'text-indigo-700'
    },
    secondary: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-900',
      desc: 'text-gray-600'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      desc: 'text-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      desc: 'text-amber-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      desc: 'text-green-700'
    }
  };

  const getBadgeStyles = (badgeVariant?: 'danger' | 'warning' | 'info') => {
    switch (badgeVariant) {
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Card 
        className={cn(
          'p-4 border relative',
          currentVariant.bg,
          currentVariant.border,
          disabled && 'opacity-50',
          className
        )}
      >
        {/* Badge */}
        {badge && badge.count > 0 && (
          <View 
            className={cn(
              'absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center z-10',
              getBadgeStyles(badge.variant)
            )}
          >
            <Text className="text-white text-xs font-bold">
              {badge.count > 99 ? '99+' : badge.count}
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          {icon && (
            <View className="mr-3">
              {icon}
            </View>
          )}
          
          <View className="flex-1">
            <Text className={cn('text-lg font-semibold', currentVariant.text)}>
              {title}
            </Text>
            {description && (
              <Text className={cn('text-sm mt-1', currentVariant.desc)}>
                {description}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

SecurityQuickAction.displayName = 'SecurityQuickAction';

export default SecurityQuickAction;