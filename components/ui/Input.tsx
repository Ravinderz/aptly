import React, { forwardRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { cn } from '../../utils/cn';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  testID?: string;
}

const inputVariants = {
  default: 'border-border-color border bg-surface',
  filled: 'bg-background border-transparent border',
  outlined: 'border-primary border-2 bg-surface',
};

const inputSizes = {
  sm: 'px-3 py-2 min-h-[36px] text-body-small',
  md: 'px-4 py-3 min-h-[44px] text-body-large',
  lg: 'px-4 py-4 min-h-[52px] text-headline-medium',
};

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      testID,
      ...props
    },
    ref,
  ) => {
    return (
      <View className={cn('w-full', containerClassName)} testID={testID ? `${testID}.container` : undefined}>
        {label && (
          <Text 
            className="text-text-primary text-label-medium font-medium mb-2"
            testID={testID ? `${testID}.label` : undefined}
          >
            {label}
          </Text>
        )}

        <View className="relative">
          {leftIcon && (
            <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              {leftIcon}
            </View>
          )}

          <TextInput
            ref={ref}
            testID={testID ? `${testID}.field` : undefined}
            className={cn(
              'rounded-lg text-text-primary font-inter',
              inputVariants[variant],
              inputSizes[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error',
              className,
            )}
            placeholderTextColor="rgb(var(--color-text-secondary))"
            {...props}
          />

          {rightIcon && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              {rightIcon}
            </View>
          )}
        </View>

        {(error || helperText) && (
          <Text
            className={cn(
              'text-label-small mt-1',
              error ? 'text-error' : 'text-text-secondary',
            )}
            testID={testID ? `${testID}.${error ? 'error' : 'helper'}` : undefined}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
