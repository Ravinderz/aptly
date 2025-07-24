import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const cardVariants = {
  default: 'bg-surface border-divider border',
  elevated: 'bg-surface shadow-md shadow-black/10',
  outlined: 'bg-surface border-border-color border-2',
};

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <View
      className={cn(
        'rounded-xl',
        cardVariants[variant],
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};

Card.displayName = 'Card';

export const CardHeader: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('mb-4', className)} {...props}>
    {children}
  </View>
);

CardHeader.displayName = 'CardHeader';

export const CardContent: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('', className)} {...props}>
    {children}
  </View>
);

CardContent.displayName = 'CardContent';

export const CardFooter: React.FC<ViewProps & { className?: string }> = ({
  children,
  className,
  ...props
}) => (
  <View className={cn('mt-4 flex-row justify-end', className)} {...props}>
    {children}
  </View>
);

CardFooter.displayName = 'CardFooter';

Card.displayName = 'Card';

export default Card;