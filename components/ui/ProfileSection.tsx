import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { cn } from '../../utils/cn';

export interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <View className={cn("mx-4 mb-6", className)}>
      <Text className="text-text-primary text-lg font-semibold mb-3 px-2">
        {title}
      </Text>
      <View className="bg-surface rounded-xl border border-divider shadow-sm shadow-black/5">
        {children}
      </View>
    </View>
  );
};

export const ProfileItem: React.FC<ProfileItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
  className,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  
  return (
    <Wrapper
      onPress={onPress}
      className={cn(
        "flex-row items-center p-4",
        onPress && "active:bg-background",
        className
      )}
      activeOpacity={0.6}
    >
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
        {icon}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-text-primary text-body-large font-medium">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-text-secondary text-sm mt-1">
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Element */}
      {rightElement || (showArrow && onPress && (
        <ChevronRight size={18} color="#757575" />
      ))}
    </Wrapper>
  );
};

export default ProfileSection;