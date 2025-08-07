import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface SecurityStatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'red' | 'amber' | 'gray';
  trend?: {
    value: number;
    label: string;
  };
  onPress?: () => void;
  className?: string;
}

/**
 * Reusable Security Status Card Component
 * 
 * Features:
 * - Consistent styling for security metrics
 * - Color-coded status indicators
 * - Trend indicators
 * - Touch interaction support
 * - Icon integration
 */
const SecurityStatusCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'gray',
  trend,
  onPress,
  className
}: SecurityStatusCardProps) => {
  const colorClasses = {
    green: {
      text: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    red: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    amber: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    },
    gray: {
      text: 'text-gray-600',
      bg: 'bg-white',
      border: 'border-gray-200'
    }
  };

  const currentColor = colorClasses[color];

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card 
        className={cn(
          'p-4',
          currentColor.bg,
          color !== 'gray' && `border ${currentColor.border}`,
          className
        )}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">
              {title}
            </Text>
            <Text className={cn('text-2xl font-bold', currentColor.text)}>
              {value}
            </Text>
            {subtitle && (
              <Text className="text-xs text-gray-500 mt-1">
                {subtitle}
              </Text>
            )}
            {trend && (
              <View className="flex-row items-center mt-1">
                <View className={cn('w-2 h-2 rounded-full mr-1', 
                  trend.value > 0 ? 'bg-green-500' : 
                  trend.value < 0 ? 'bg-red-500' : 'bg-gray-400'
                )} />
                <Text className="text-xs text-gray-500">
                  {trend.label}
                </Text>
              </View>
            )}
          </View>
          {icon && (
            <View className="ml-3">
              {icon}
            </View>
          )}
        </View>
      </Card>
    </CardComponent>
  );
};

SecurityStatusCard.displayName = 'SecurityStatusCard';

export default SecurityStatusCard;