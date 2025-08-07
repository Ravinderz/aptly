import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Settings, Menu, ArrowLeft, LogOut } from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useDirectNotification } from '@/hooks/useDirectNotification';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  showMenu?: boolean;
  showLogout?: boolean;
  onMenuPress?: () => void;
  onLogout?: () => void;
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
export const AdminHeader = ({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  showSettings = false,
  showMenu = false,
  showLogout = false,
  onMenuPress,
  onLogout,
}: AdminHeaderProps) => {
  const router = useRouter();
  const { user, logout } = useDirectAuth();
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

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await logout();
        router.replace('/welcome');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
                    {unreadCount > 9 ? '9+' : String(unreadCount)}
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

          {showLogout && (
            <TouchableOpacity
              onPress={handleLogout}
              className="p-2"
            >
              <LogOut size={24} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role Mode Indicators */}
      {user?.role === 'super_admin' && (
        <View className="mt-3 flex-row items-center">
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-800 text-xs font-semibold">
              SUPER ADMIN MODE
            </Text>
          </View>
        </View>
      )}
      
      {user?.role === 'community_manager' && (
        <View className="mt-3 flex-row items-center">
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-800 text-xs font-semibold">
              COMMUNITY MANAGER MODE
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Add proper named export with displayName for React DevTools
AdminHeader.displayName = 'AdminHeader';