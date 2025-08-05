import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Settings, Menu, ArrowLeft } from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useDirectNotification } from '@/hooks/useDirectNotification';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  showMenu?: boolean;
  onMenuPress?: () => void;
}

/**
 * AdminHeader - Standardized header for admin pages
 * 
 * Features:
 * - Consistent design across admin module
 * - Notification badges
 * - Navigation controls
 * - User context display
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  showSettings = false,
  showMenu = false,
  onMenuPress,
}) => {
  const router = useRouter();
  const { user } = useDirectAuth();
  const { unreadCount } = useDirectNotification();

  const handleBack = () => {
    router.back();
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleSettings = () => {
    router.push('/admin/settings/');
  };

  return (
    <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
      <View className="flex-row items-center justify-between">
        {/* Left Section */}
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              className="mr-3 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          )}
          
          {showMenu && (
            <TouchableOpacity
              onPress={onMenuPress}
              className="mr-3 p-2 -ml-2"
            >
              <Menu size={24} color="#374151" />
            </TouchableOpacity>
          )}

          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-sm text-gray-600 mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right Section */}
        <View className="flex-row items-center space-x-2">
          {showNotifications && (
            <TouchableOpacity
              onPress={handleNotifications}
              className="p-2 relative"
            >
              <Bell size={24} color="#374151" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                  <Text className="text-white text-xs font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showSettings && (
            <TouchableOpacity
              onPress={handleSettings}
              className="p-2"
            >
              <Settings size={24} color="#374151" />
            </TouchableOpacity>
          )}

          {/* User Avatar */}
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center ml-2">
            <Text className="text-white text-sm font-semibold">
              {(user?.fullName || user?.name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Admin Mode Indicator */}
      {user?.role === 'super_admin' && (
        <View className="mt-3 flex-row items-center">
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-800 text-xs font-semibold">
              SUPER ADMIN MODE
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};