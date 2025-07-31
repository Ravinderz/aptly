import { clsx } from 'clsx';
import React from 'react';
import { Text, View, ViewProps } from 'react-native';

export interface HighlightCardProps extends ViewProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const HighlightCard: React.FC<HighlightCardProps> = ({
  title,
  children,
  variant = 'info',
  size = 'md',
  className,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'bg-warning/5 border-warning/20',
          title: 'text-warning',
        };
      case 'success':
        return {
          container: 'bg-success/5 border-success/20',
          title: 'text-success',
        };
      case 'error':
        return {
          container: 'bg-error/5 border-error/20',
          title: 'text-error',
        };
      case 'primary':
        return {
          container: 'bg-primary/5 border-primary/20',
          title: 'text-primary',
        };
      case 'secondary':
        return {
          container: 'bg-secondary/5 border-secondary/20',
          title: 'text-secondary',
        };
      case 'info':
      default:
        return {
          container: 'bg-primary/5 border-primary/20',
          title: 'text-primary',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'rounded-lg p-3',
          title: 'text-sm font-semibold mb-1',
          content: 'text-xs',
        };
      case 'lg':
        return {
          container: 'rounded-2xl p-6',
          title: 'text-lg font-bold mb-3',
          content: 'text-base',
        };
      case 'md':
      default:
        return {
          container: 'rounded-xl p-4',
          title: 'text-base font-semibold mb-2',
          content: 'text-sm',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      className={clsx(
        variantStyles.container,
        sizeStyles.container,
        'border',
        className,
      )}
      {...props}>
      {title && (
        <Text className={clsx(variantStyles.title, sizeStyles.title)}>
          {title}
        </Text>
      )}
      <View className={clsx('leading-5', sizeStyles.content)}>
        {typeof children === 'string' ? (
          <Text className="text-text-secondary leading-5">{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

export default HighlightCard;
