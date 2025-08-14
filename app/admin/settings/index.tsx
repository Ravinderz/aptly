import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Settings,
  Bell,
  Shield,
  Monitor,
  AlertTriangle,
  Save,
  RefreshCw,
  Database,
  Users,
  Key,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
  <Card className="p-4 mb-4">
    <View className="flex-row items-center mb-4">
      {icon}
      <Text className="text-lg font-semibold text-gray-900 ml-3">
        {title}
      </Text>
    </View>
    {children}
  </Card>
);

interface SettingRowProps {
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  type?: 'switch' | 'button' | 'info';
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  subtitle,
  value,
  onValueChange,
  onPress,
  type = 'info',
  danger = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={type === 'info'}
    className={`py-3 ${type !== 'info' ? 'active:bg-gray-50' : ''}`}
  >
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className={`text-base font-medium ${
          danger ? 'text-red-600' : 'text-gray-900'
        }`}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-600 mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
          thumbColor={value ? '#ffffff' : '#ffffff'}
        />
      )}
    </View>
  </TouchableOpacity>
);

/**
 * Admin Settings - System configuration and preferences
 * 
 * Features:
 * - Notification preferences
 * - Security settings
 * - System configuration
 * - Maintenance mode toggle
 */
export default function AdminSettings() {
  const { 
    settings, 
    updateAdminSettings,
    enableMaintenanceMode,
    disableMaintenanceMode,
    refreshSystemCache,
    loading 
  } = useDirectAdmin();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateLocalSetting = (section: string, key: string, value: any) => {
    setLocalSettings(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [key]: value,
        },
      };
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleSaveSettings = async () => {
    if (!localSettings) return;
    
    try {
      await updateAdminSettings?.(localSettings);
      setHasUnsavedChanges(false);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleToggleMaintenanceMode = () => {
    const isMaintenanceMode = localSettings?.system?.maintenanceMode;
    
    Alert.alert(
      isMaintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode',
      isMaintenanceMode 
        ? 'This will make the system available to all users again.'
        : 'This will temporarily restrict access for system maintenance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isMaintenanceMode ? 'Disable' : 'Enable',
          style: isMaintenanceMode ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (isMaintenanceMode) {
                await disableMaintenanceMode?.();
              } else {
                await enableMaintenanceMode?.('Scheduled maintenance');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to toggle maintenance mode');
            }
          },
        },
      ]
    );
  };

  const handleRefreshCache = () => {
    Alert.alert(
      'Refresh System Cache',
      'This will clear all cached data and may temporarily affect performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          style: 'destructive',
          onPress: async () => {
            try {
              await refreshSystemCache?.();
              Alert.alert('Success', 'System cache refreshed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to refresh cache');
            }
          },
        },
      ]
    );
  };

  if (!localSettings) {
    return (
      <View className="flex-1 bg-gray-50">
        <AdminHeader 
          title="Admin Settings" 
          showBack
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Admin Settings" 
        subtitle="System configuration and preferences"
        showBack
      />

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          icon={<Bell size={20} color="#0284c7" />}
        >
          <SettingRow
            title="Email Notifications"
            subtitle="Receive notifications via email"
            type="switch"
            value={localSettings.notifications?.emailNotifications}
            onValueChange={(value) => updateLocalSetting('notifications', 'emailNotifications', value)}
          />
          
          <SettingRow
            title="Push Notifications"
            subtitle="Receive push notifications on mobile"
            type="switch"
            value={localSettings.notifications?.pushNotifications}
            onValueChange={(value) => updateLocalSetting('notifications', 'pushNotifications', value)}
          />
          
          <SettingRow
            title="SMS Notifications"
            subtitle="Receive critical alerts via SMS"
            type="switch"
            value={localSettings.notifications?.smsNotifications}
            onValueChange={(value) => updateLocalSetting('notifications', 'smsNotifications', value)}
          />
          
          <SettingRow
            title="Notification Frequency"
            subtitle={`Currently: ${localSettings.notifications?.notificationFrequency || 'immediate'}`}
            type="button"
            onPress={() => {
              // Open frequency selector modal
              console.log('Open frequency selector');
            }}
          />
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection
          title="Security"
          icon={<Shield size={20} color="#059669" />}
        >
          <SettingRow
            title="Two-Factor Authentication"
            subtitle="Require 2FA for admin access"
            type="switch"
            value={localSettings.security?.requireTwoFactorAuth}
            onValueChange={(value) => updateLocalSetting('security', 'requireTwoFactorAuth', value)}
          />
          
          <SettingRow
            title="Session Timeout"
            subtitle={`${localSettings.security?.sessionTimeout || 480} minutes`}
            type="button"
            onPress={() => {
              // Open timeout selector
              console.log('Open timeout selector');
            }}
          />
          
          <SettingRow
            title="Password Expiry"
            subtitle={`${localSettings.security?.passwordExpiryDays || 90} days`}
            type="button"
            onPress={() => {
              // Open expiry settings
              console.log('Open password expiry settings');
            }}
          />
          
          <SettingRow
            title="Login Attempt Limit"
            subtitle={`${localSettings.security?.loginAttemptLimit || 5} attempts`}
            type="button"
            onPress={() => {
              // Open attempt limit settings
              console.log('Open login attempt settings');
            }}
          />
        </SettingsSection>

        {/* Dashboard Settings */}
        <SettingsSection
          title="Dashboard"
          icon={<Monitor size={20} color="#7c3aed" />}
        >
          <SettingRow
            title="Default View"
            subtitle={`Opens to: ${localSettings.dashboard?.defaultView || 'overview'}`}
            type="button"
            onPress={() => {
              // Open view selector
              console.log('Open default view selector');
            }}
          />
          
          <SettingRow
            title="Auto Refresh"
            subtitle={`Every ${localSettings.dashboard?.refreshInterval || 300} seconds`}
            type="button"
            onPress={() => {
              // Open refresh interval settings
              console.log('Open refresh interval settings');
            }}
          />
          
          <SettingRow
            title="Advanced Metrics"
            subtitle="Show detailed performance metrics"
            type="switch"
            value={localSettings.dashboard?.showAdvancedMetrics}
            onValueChange={(value) => updateLocalSetting('dashboard', 'showAdvancedMetrics', value)}
          />
          
          <SettingRow
            title="Chart Type"
            subtitle={`Currently: ${localSettings.dashboard?.chartsType || 'line'} charts`}
            type="button"
            onPress={() => {
              // Open chart type selector
              console.log('Open chart type selector');
            }}
          />
        </SettingsSection>

        {/* System Settings */}
        <SettingsSection
          title="System"
          icon={<Database size={20} color="#ea580c" />}
        >
          <SettingRow
            title="Maintenance Mode"
            subtitle={
              localSettings.system?.maintenanceMode 
                ? "System is currently in maintenance mode" 
                : "System is fully operational"
            }
            type="switch"
            value={localSettings.system?.maintenanceMode}
            onValueChange={handleToggleMaintenanceMode}
            danger={localSettings.system?.maintenanceMode}
          />
          
          <SettingRow
            title="Debug Mode"
            subtitle="Enable detailed logging for troubleshooting"
            type="switch"
            value={localSettings.system?.debugMode}
            onValueChange={(value) => updateLocalSetting('system', 'debugMode', value)}
          />
          
          <SettingRow
            title="Log Level"
            subtitle={`Currently: ${localSettings.system?.logLevel || 'info'}`}
            type="button"
            onPress={() => {
              // Open log level selector
              console.log('Open log level selector');
            }}
          />
          
          <SettingRow
            title="Cache Expiry"
            subtitle={`${localSettings.system?.cacheExpiry || 60} minutes`}
            type="button"
            onPress={() => {
              // Open cache settings
              console.log('Open cache settings');
            }}
          />
        </SettingsSection>

        {/* System Actions */}
        <SettingsSection
          title="System Actions"
          icon={<AlertTriangle size={20} color="#dc2626" />}
        >
          <SettingRow
            title="Refresh System Cache"
            subtitle="Clear all cached data to improve performance"
            type="button"
            onPress={handleRefreshCache}
          />
          
          <SettingRow
            title="Export System Logs"
            subtitle="Download system logs for analysis"
            type="button"
            onPress={() => {
              // Export logs
              console.log('Export system logs');
            }}
          />
          
          <SettingRow
            title="Reset to Defaults"
            subtitle="Restore all settings to default values"
            type="button"
            onPress={() => {
              Alert.alert(
                'Reset Settings',
                'This will restore all settings to their default values. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Reset', 
                    style: 'destructive',
                    onPress: () => {
                      // Reset settings
                      console.log('Reset settings to defaults');
                    }
                  },
                ]
              );
            }}
            danger
          />
        </SettingsSection>

        {/* Save Button */}
        {hasUnsavedChanges && (
          <View className="mt-4 mb-6">
            <Button
              onPress={handleSaveSettings}
              variant="primary"
              disabled={loading}
            >
              Save Changes
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}