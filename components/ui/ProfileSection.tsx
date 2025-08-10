import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { cn } from '../../utils/cn';

export interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  testID?: string;
}

export interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  testID?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  children,
  className,
  testID,
}) => {
  return (
    <View className={cn('mx-4 mb-6', className)} testID={testID}>
      <Text className="text-text-primary text-lg font-semibold mb-3 px-2" testID={testID ? `${testID}.title` : undefined}>
        {title}
      </Text>
      <View className="bg-surface rounded-xl border border-divider shadow-sm shadow-black/5" testID={testID ? `${testID}.container` : undefined}>
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
  testID,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      className={cn(
        'flex-row items-center p-4',
        onPress && 'active:bg-background',
        className,
      )}
      activeOpacity={0.6}
      testID={testID}>
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3" testID={testID ? `${testID}.icon` : undefined}>
        {icon}
      </View>

      {/* Content */}
      <View className="flex-1" testID={testID ? `${testID}.content` : undefined}>
        <Text className="text-text-primary text-body-large font-medium" testID={testID ? `${testID}.title` : undefined}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-text-secondary text-sm mt-1" testID={testID ? `${testID}.subtitle` : undefined}>{subtitle}</Text>
        )}
      </View>

      {/* Right Element */}
      {rightElement ||
        (showArrow && onPress && <ChevronRight size={18} color="#757575" />)}
    </Wrapper>
  );
};

export default ProfileSection;
