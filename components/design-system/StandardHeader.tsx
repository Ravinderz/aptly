import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Settings, 
  Menu, 
  LogOut,
  MoreHorizontal 
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useDirectNotification } from '@/hooks/useDirectNotification';
import { cn } from '@/utils/cn';

export interface StandardHeaderProps {
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Show back button */
  showBack?: boolean;
  /** Show notifications bell */
  showNotifications?: boolean;
  /** Show settings gear */
  showSettings?: boolean;
  /** Show menu hamburger */
  showMenu?: boolean;
  /** Show logout button */
  showLogout?: boolean;
  /** Custom action button */
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    label?: string;
  };
  /** Background color variant */
  variant?: 'default' | 'primary' | 'secondary' | 'transparent';
  /** Custom menu press handler */
  onMenuPress?: () => void;
  /** Custom back press handler */
  onBackPress?: () => void;
  /** Custom logout handler */
  onLogout?: () => void;
  /** Additional header content */
  children?: React.ReactNode;
  /** Show role indicator badge */
  showRoleIndicator?: boolean;
  /** Custom style class */
  className?: string;
}

/**
 * StandardHeader - Unified header component for all app sections
 * 
 * Features:
 * - Consistent design across all modules
 * - Flexible action configuration
 * - Automatic notification badge
 * - Role-based styling
 * - Accessibility support
 * - Mobile-optimized touch targets
 */
export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  showSettings = false,
  showMenu = false,
  showLogout = false,
  rightAction,
  variant = 'default',
  onMenuPress,
  onBackPress,
  onLogout,
  children,
  showRoleIndicator = false,
  className,
}) => {
  const router = useRouter();
  const { user, logout } = useDirectAuth();
  const { unreadCount } = useDirectNotification();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleSettings = () => {
    // Navigate to appropriate settings based on user role
    const settingsRoute = user?.role === 'super_admin' 
      ? '/admin/settings/'
      : user?.role === 'community_manager'
      ? '/manager/settings/'
      : '/(tabs)/settings/';
    router.push(settingsRoute);
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-blue-600',
          text: 'text-white',
          subtitleText: 'text-blue-100',
          iconColor: '#ffffff',
        };
      case 'secondary':
        return {
          container: 'bg-gray-100',
          text: 'text-gray-900',
          subtitleText: 'text-gray-600',
          iconColor: '#374151',
        };
      case 'transparent':
        return {
          container: 'bg-transparent',
          text: 'text-gray-900',
          subtitleText: 'text-gray-600',
          iconColor: '#374151',
        };
      default:
        return {
          container: 'bg-white border-b border-gray-200',
          text: 'text-gray-900',
          subtitleText: 'text-gray-600',
          iconColor: '#374151',
        };
    }
  };

  const styles = getVariantStyles();
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const headerHeight = subtitle ? 88 : 72;

  return (
    <View className={cn(styles.container, className)}>
      <View style={{ paddingTop: statusBarHeight }}>
        <View className="flex-row items-center justify-between px-4 py-4">
          {/* Left Section */}
          <View className="flex-row items-center flex-1">
            {showBack && (
              <TouchableOpacity
                onPress={handleBack}
                className="mr-3 p-2 -ml-2"
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft size={24} color={styles.iconColor} />
              </TouchableOpacity>
            )}
            
            {showMenu && (
              <TouchableOpacity
                onPress={onMenuPress}
                className="mr-3 p-2 -ml-2"
                accessibilityRole="button"
                accessibilityLabel="Open menu"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Menu size={24} color={styles.iconColor} />
              </TouchableOpacity>
            )}

            <View className="flex-1">
              <Text 
                className={cn('text-xl font-bold', styles.text)}
                numberOfLines={1}
                accessibilityRole="header"
              >
                {title}
              </Text>
              {subtitle && (
                <Text 
                  className={cn('text-sm mt-1', styles.subtitleText)}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* Right Section */}
          <View className="flex-row items-center">
            {showNotifications && (
              <TouchableOpacity
                onPress={handleNotifications}
                className="p-2 relative mr-1"
                accessibilityRole="button"
                accessibilityLabel={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bell size={24} color={styles.iconColor} />
                {unreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                    <Text className="text-white text-xs font-semibold">
                      {unreadCount > 99 ? '99+' : String(unreadCount)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {showSettings && (
              <TouchableOpacity
                onPress={handleSettings}
                className="p-2 mr-1"
                accessibilityRole="button"
                accessibilityLabel="Settings"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Settings size={24} color={styles.iconColor} />
              </TouchableOpacity>
            )}

            {rightAction && (
              <TouchableOpacity
                onPress={rightAction.onPress}
                className="p-2 mr-1"
                accessibilityRole="button"
                accessibilityLabel={rightAction.label || 'Action'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {rightAction.icon}
              </TouchableOpacity>
            )}

            {showLogout && (
              <TouchableOpacity
                onPress={handleLogout}
                className="p-2"
                accessibilityRole="button"
                accessibilityLabel="Logout"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <LogOut size={24} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Role Indicator */}
        {showRoleIndicator && user?.role && (
          <View className="px-4 pb-3">
            <View className={cn(
              'self-start px-3 py-1 rounded-full',
              user.role === 'super_admin' && 'bg-blue-100',
              user.role === 'community_manager' && 'bg-green-100',
              user.role === 'security_guard' && 'bg-purple-100'
            )}>
              <Text className={cn(
                'text-xs font-semibold uppercase',
                user.role === 'super_admin' && 'text-blue-800',
                user.role === 'community_manager' && 'text-green-800',
                user.role === 'security_guard' && 'text-purple-800'
              )}>
                {user.role === 'super_admin' && 'SUPER ADMIN MODE'}
                {user.role === 'community_manager' && 'COMMUNITY MANAGER MODE'}
                {user.role === 'security_guard' && 'SECURITY MODE'}
              </Text>
            </View>
          </View>
        )}

        {/* Custom Content */}
        {children && (
          <View className="px-4 pb-3">
            {children}
          </View>
        )}
      </View>
    </View>
  );
};

// Add display name for React DevTools
StandardHeader.displayName = 'StandardHeader';