import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { DateTimeInputProps } from '@/types/pickers';

export default function DateTimeInput({
  type,
  value,
  onPress,
  placeholder,
  error,
  disabled = false,
  icon,
  label,
}: DateTimeInputProps) {
  return (
    <View className="flex-1">
      {label && (
        <Text className="text-headline-medium font-semibold text-text-primary mb-2">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        className={`relative ${disabled ? 'opacity-50' : ''}`}
        activeOpacity={0.7}>
        {/* Icon */}
        {icon && (
          <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
            {icon}
          </View>
        )}

        {/* Input Field */}
        <View
          className={`w-full p-4 ${icon ? 'pl-12' : ''} border rounded-xl bg-surface min-h-14 justify-center ${
            error
              ? 'border-error'
              : disabled
                ? 'border-divider/50'
                : 'border-divider'
          }`}>
          <Text
            className={`text-body-large ${
              value ? 'text-text-primary' : 'text-text-secondary'
            }`}>
            {value || placeholder}
          </Text>
        </View>

        {/* Selection Indicator */}
        <View className="absolute right-4 top-0 bottom-0 justify-center">
          <View className="w-2 h-2 bg-primary rounded-full opacity-60" />
        </View>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text className="text-error text-body-medium mt-2">{error}</Text>
      )}
    </View>
  );
}
