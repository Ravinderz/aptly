import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { cn } from '@/utils/cn';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const buttonVariants = {
  primary: 'bg-primary border-primary',
  secondary: 'bg-secondary border-secondary',
  success: 'bg-secondary border-secondary',
  destructive: 'bg-red-600 border-red-600',
  outline: 'bg-transparent border-primary border-2',
  ghost: 'bg-transparent border-transparent',
};

const buttonSizes = {
  sm: 'px-3 py-2 min-h-[36px]',
  md: 'px-6 py-3 min-h-[44px]',
  lg: 'px-8 py-4 min-h-[52px]',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  success: 'text-white',
  destructive: 'text-white',
  outline: 'text-primary',
  ghost: 'text-primary',
};

const textSizes = {
  sm: 'text-sm font-medium',
  md: 'text-body-large font-semibold',
  lg: 'text-headline-medium font-semibold',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  className,
  fullWidth = false,
  testID,
  accessible,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      testID={testID}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      className={cn(
        'rounded-lg flex-row items-center justify-center',
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' ? '#6366f1' : '#FFFFFF'
          }
          className="mr-2"
        />
      )}
      {typeof children === 'string' ? (
        <Text className={cn(textVariants[variant], textSizes[size])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

Button.displayName = 'Button';

export default Button;
