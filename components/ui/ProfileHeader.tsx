import { Camera, Edit3 } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { cn } from '../../utils/cn';

export interface ProfileHeaderProps {
  userName: string;
  userRole: string;
  flatNumber: string;
  societyName: string;
  profileImageUrl?: string;
  onEditProfile?: () => void;
  onChangePhoto?: () => void;
  testID?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userRole,
  flatNumber,
  societyName,
  profileImageUrl,
  onEditProfile,
  onChangePhoto,
  testID,
}) => {
  return (
    <View
      className={cn(
        'bg-primary rounded-2xl p-6 mx-4 mt-4 mb-6',
        'shadow-lg shadow-black/20',
      )}
      testID={testID}>
      <View className="flex-row items-center justify-between" testID={testID ? `${testID}.container` : undefined}>
        <View className="flex-row items-center flex-1" testID={testID ? `${testID}.user-info` : undefined}>
          {/* Profile Image */}
          <View className="relative" testID={testID ? `${testID}.avatar-container` : undefined}>
            <View className="w-20 h-20 rounded-full border-3 border-white overflow-hidden bg-white/20" testID={testID ? `${testID}.avatar` : undefined}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Camera Icon for Photo Change */}
            <TouchableOpacity
              onPress={onChangePhoto}
              className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-sm"
              activeOpacity={0.8}
              testID={testID ? `${testID}.change-photo-button` : undefined}>
              <Camera size={14} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="ml-4 flex-1" testID={testID ? `${testID}.details` : undefined}>
            <Text className="text-white text-xl font-bold mb-1" testID={testID ? `${testID}.name` : undefined}>
              {userName}
            </Text>
            <Text className="text-white/90 text-sm font-medium mb-1" testID={testID ? `${testID}.role` : undefined}>
              {userRole}
            </Text>
            <Text className="text-white/80 text-sm" testID={testID ? `${testID}.address` : undefined}>
              Flat {flatNumber} • {societyName}
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={onEditProfile}
          className="bg-white/20 rounded-full p-3"
          activeOpacity={0.8}
          testID={testID ? `${testID}.edit-button` : undefined}>
          <Edit3 size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileHeader;
