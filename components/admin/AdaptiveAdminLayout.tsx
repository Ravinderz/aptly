import React, { ReactNode, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Building2,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { useDirectSociety } from '@/hooks/useDirectSociety';
import { AdminRole } from '@/types/admin';
import SocietySelector from './SocietySelector';
import { RoleBadge, MultiSocietyRole } from './RoleBasedRenderer';
import PermissionGate from './PermissionGate';

interface AdaptiveAdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSocietySelector?: boolean;
  showNotifications?: boolean;
  showQuickActions?: boolean;
  layout?: 'default' | 'compact' | 'full-width';
  rightActions?: ReactNode;
}

interface NotificationItem {
  id: string;
  type: 'approval' | 'alert' | 'system' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
  actionRequired?: boolean;
}

const AdaptiveAdminLayout: React.FC<AdaptiveAdminLayoutProps> = ({
  children,
  title,
  subtitle,
  showSocietySelector = true,
  showNotifications = true,
  showQuickActions = true,
  layout = 'default',
  rightActions,
}) => {
  const {
    adminUser,
    currentMode,
    switchToResidentMode,
    activeSociety,
    checkPermission,
  } = useDirectAdmin();

  const { currentSociety } = useDirectSociety();
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock notifications - replace with actual notification service
  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'approval',
      title: 'Pending Approvals',
      message: '5 visitor approvals require your attention',
      timestamp: new Date().toISOString(),
      read: false,
      urgent: false,
      actionRequired: true,
    },
    {
      id: '2',
      type: 'emergency',
      title: 'Security Alert',
      message: 'Unauthorized access attempt in Building A',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false,
      urgent: true,
      actionRequired: true,
    },
    {
      id: '3',
      type: 'system',
      title: 'System Update',
      message: 'Maintenance scheduled for this weekend',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
      urgent: false,
      actionRequired: false,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter((n) => n.urgent && !n.read).length;

  const getLayoutClasses = () => {
    switch (layout) {
      case 'compact':
        return 'px-4';
      case 'full-width':
        return 'px-0';
      default:
        return 'px-6';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'approval':
        return '⏳';
      case 'alert':
        return '⚠️';
      case 'system':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    // Implement logout logic
    console.log('Logout clicked');
  };

  const handleSwitchToResident = () => {
    setShowUserMenu(false);
    switchToResidentMode();
  };

  if (currentMode !== 'admin' || !adminUser) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Shield size={48} className="text-text-secondary mb-4" />
        <Text className="text-headline-medium font-semibold text-text-primary text-center mb-2">
          Admin Access Required
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          Please switch to admin mode to access this content.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Admin Header */}
      <View className="bg-surface border-b border-divider">
        <View
          className={`flex-row items-center justify-between py-4 ${getLayoutClasses()}`}>
          {/* Left Section - Title and Society */}
          <View className="flex-1 mr-4">
            {title && (
              <Text className="text-headline-large font-bold text-text-primary">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-body-medium text-text-secondary">
                {subtitle}
              </Text>
            )}

            {/* Society Context */}
            {activeSociety && (
              <View className="flex-row items-center mt-2">
                <Building2 size={16} className="text-primary mr-2" />
                <Text className="text-body-medium text-text-primary">
                  {activeSociety.name}
                </Text>
                <MultiSocietyRole />
              </View>
            )}
          </View>

          {/* Right Section - Actions */}
          <View className="flex-row items-center space-x-3">
            {rightActions}

            {/* Society Selector */}
            {showSocietySelector && (
              <PermissionGate resource="society" action="switch" renderEmpty>
                <SocietySelector compact />
              </PermissionGate>
            )}

            {/* Notifications */}
            {showNotifications && (
              <TouchableOpacity
                onPress={() => setShowNotificationPanel(true)}
                className="relative p-2">
                <Bell size={20} className="text-text-secondary" />
                {unreadCount > 0 && (
                  <View
                    className={`absolute -top-1 -right-1 rounded-full w-5 h-5 items-center justify-center ${
                      urgentCount > 0 ? 'bg-red-500' : 'bg-primary'
                    }`}>
                    <Text className="text-white text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* User Menu */}
            <TouchableOpacity
              onPress={() => setShowUserMenu(!showUserMenu)}
              className="flex-row items-center p-2">
              <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
                <Text className="text-white font-bold text-sm">
                  {adminUser.name.charAt(0)}
                </Text>
              </View>
              <ChevronDown size={16} className="text-text-secondary" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Role Badge */}
        <View className={`pb-3 ${getLayoutClasses()}`}>
          <RoleBadge role={adminUser.role} size="sm" />
        </View>
      </View>

      {/* User Menu Dropdown */}
      {showUserMenu && (
        <View className="absolute top-20 right-6 bg-surface rounded-xl border border-divider shadow-lg z-50 min-w-[200px]">
          <View className="p-4 border-b border-divider">
            <Text className="text-body-large font-semibold text-text-primary">
              {adminUser.name}
            </Text>
            <Text className="text-body-medium text-text-secondary">
              {adminUser.email}
            </Text>
          </View>

          <View className="py-2">
            <TouchableOpacity
              onPress={handleSwitchToResident}
              className="flex-row items-center px-4 py-3">
              <Shield size={16} className="text-text-secondary mr-3" />
              <Text className="text-body-medium text-text-primary">
                Switch to Resident Mode
              </Text>
            </TouchableOpacity>

            <PermissionGate resource="settings" action="read" renderEmpty>
              <TouchableOpacity className="flex-row items-center px-4 py-3">
                <Settings size={16} className="text-text-secondary mr-3" />
                <Text className="text-body-medium text-text-primary">
                  Settings
                </Text>
              </TouchableOpacity>
            </PermissionGate>

            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center px-4 py-3 border-t border-divider">
              <LogOut size={16} className="text-red-600 mr-3" />
              <Text className="text-body-medium text-red-600">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <View className="absolute top-0 right-0 bottom-0 w-80 bg-surface border-l border-divider shadow-lg z-50">
          <View className="flex-row items-center justify-between p-4 border-b border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary">
              Notifications
            </Text>
            <TouchableOpacity onPress={() => setShowNotificationPanel(false)}>
              <X size={20} className="text-text-secondary" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {notifications.map((notification) => (
              <View
                key={notification.id}
                className={`p-4 border-b border-divider ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}>
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-lg mr-2">
                      {getNotificationIcon(notification.type)}
                    </Text>
                    <Text className="text-body-large font-semibold text-text-primary flex-1">
                      {notification.title}
                    </Text>
                    {notification.urgent && (
                      <View className="bg-red-100 rounded-full px-2 py-1">
                        <Text className="text-red-600 text-xs font-bold">
                          URGENT
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text className="text-body-medium text-text-secondary mb-2">
                  {notification.message}
                </Text>

                <View className="flex-row items-center justify-between">
                  <Text className="text-label-medium text-text-secondary">
                    {formatTimeAgo(notification.timestamp)}
                  </Text>

                  {notification.actionRequired && (
                    <TouchableOpacity className="bg-primary rounded-lg px-3 py-1">
                      <Text className="text-white text-label-medium font-medium">
                        Take Action
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Content */}
      <View className="flex-1">{children}</View>

      {/* Overlay for panels */}
      {(showNotificationPanel || showUserMenu) && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowNotificationPanel(false);
            setShowUserMenu(false);
          }}
          className="absolute inset-0 bg-black/20 z-40"
        />
      )}
    </View>
  );
};

export default AdaptiveAdminLayout;
