import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { cn } from '../../utils/cn';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onPress?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onPress,
  variant = 'default',
  className,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      className={cn(
        'bg-surface rounded-xl border border-divider p-4',
        'shadow-sm shadow-black/5',
        onPress && 'active:bg-background',
        variant === 'compact' && 'p-3',
        className,
      )}
      activeOpacity={0.7}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            {icon && (
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-2">
                {icon}
              </View>
            )}
            <Text
              className={cn(
                'font-medium text-text-secondary',
                variant === 'compact' ? 'text-xs' : 'text-sm',
              )}>
              {title}
            </Text>
          </View>

          <Text
            className={cn(
              'font-bold text-text-primary mb-1',
              variant === 'compact' ? 'text-lg' : 'text-2xl',
            )}>
            {value}
          </Text>

          {subtitle && (
            <Text className="text-text-secondary text-xs">{subtitle}</Text>
          )}

          {trend && (
            <View className="flex-row items-center mt-1">
              <Text
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-secondary' : 'text-error',
                )}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </Text>
            </View>
          )}
        </View>

        {onPress && <ChevronRight size={16} color="#757575" />}
      </View>
    </Wrapper>
  );
};

export default DashboardCard;
