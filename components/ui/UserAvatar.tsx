import React from 'react';
import { Text, View } from 'react-native';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | number;
  testID?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'md', testID }) => {
  const getLetters = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  // Handle numeric size
  if (typeof size === 'number') {
    return (
      <View
        className="bg-primary/10 rounded-full items-center justify-center"
        style={{ width: size, height: size }}
        testID={testID}>
        <Text className="text-primary font-bold text-body-medium">
          {getLetters(name)}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`bg-primary/10 rounded-full items-center justify-center ${sizeClasses[size as keyof typeof sizeClasses]}`}
      testID={testID}>
      <Text className="text-primary font-bold">{getLetters(name)}</Text>
    </View>
  );
};

export default UserAvatar;
