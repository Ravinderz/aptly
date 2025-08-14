import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Edit3, Camera } from 'lucide-react-native';
import { cn } from '../../utils/cn';

export interface ProfileHeaderProps {
  userName: string;
  userRole: string;
  flatNumber: string;
  societyName: string;
  profileImageUrl?: string;
  onEditProfile?: () => void;
  onChangePhoto?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userName,
  userRole,
  flatNumber,
  societyName,
  profileImageUrl,
  onEditProfile,
  onChangePhoto,
}) => {
  return (
    <View
      className={cn(
        'bg-primary rounded-2xl p-6 mx-4 mt-4 mb-6',
        'shadow-lg shadow-black/20',
      )}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* Profile Image */}
          <View className="relative">
            <View className="w-20 h-20 rounded-full border-3 border-white overflow-hidden bg-white/20">
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
              activeOpacity={0.8}>
              <Camera size={14} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold mb-1">
              {userName}
            </Text>
            <Text className="text-white/90 text-sm font-medium mb-1">
              {userRole}
            </Text>
            <Text className="text-white/80 text-sm">
              Flat {flatNumber} • {societyName}
            </Text>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          onPress={onEditProfile}
          className="bg-white/20 rounded-full p-3"
          activeOpacity={0.8}>
          <Edit3 size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileHeader;
