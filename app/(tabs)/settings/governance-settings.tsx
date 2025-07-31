import LucideIcons from '@/components/ui/LucideIcons';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { safeGoBack } from '@/utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import StackHeader from '@/components/ui/headers/StackHeader';

// Default governance preferences
const defaultPreferences = {
  notifications: true,
  emailAlerts: false,
  emergencyContacts: [],
};

// Default state
const defaultState = {
  userRole: 'resident' as 'resident' | 'committee_member' | 'admin',
  preferences: defaultPreferences,
  lastUpdated: null as string | null,
};

// Helper function to check user permissions
const canUserPerformAction = (action: string, userRole: string): boolean => {
  const permissions = {
    create_campaign: ['admin', 'committee_member'],
    manage_emergency: ['admin', 'committee_member'],
    view_analytics: ['admin', 'committee_member'],
    manage_policies: ['admin'],
  };

  return (
    permissions[action as keyof typeof permissions]?.includes(userRole) || false
  );
};

// Helper function to update preferences
const updateUserPreferences = async (
  newPreferences: typeof defaultPreferences,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      'governance_preferences',
      JSON.stringify(newPreferences),
    );
    await AsyncStorage.setItem(
      'governance_last_updated',
      new Date().toISOString(),
    );
  } catch (error) {
    throw new Error('Failed to save preferences');
  }
};

// Helper function to load preferences
const loadUserPreferences = async () => {
  try {
    const prefsString = await AsyncStorage.getItem('governance_preferences');
    const roleString = (await AsyncStorage.getItem('user_role')) || 'resident';
    const lastUpdated = await AsyncStorage.getItem('governance_last_updated');

    return {
      userRole: roleString as 'resident' | 'committee_member' | 'admin',
      preferences: prefsString ? JSON.parse(prefsString) : defaultPreferences,
      lastUpdated,
    };
  } catch (error) {
    return defaultState;
  }
};

export default function GovernanceSettingsPage() {
  const [state, setState] = useState(defaultState);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load preferences on component mount
    loadUserPreferences().then((loadedState) => {
      setState(loadedState);
      setPreferences(loadedState.preferences);
    });
  }, []);

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await updateUserPreferences(preferences);
      showSuccessAlert(
        'Success',
        'Governance preferences updated successfully',
      );
    } catch (error) {
      showErrorAlert('Error', 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, notifications: enabled }));
  };

  const handleToggleEmailAlerts = (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, emailAlerts: enabled }));
  };

  const renderNotificationSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Notification Preferences
        </Text>

        <View className="space-y-4">
          {/* Push Notifications */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Push Notifications
              </Text>
              <Text className="text-body-small text-text-secondary">
                Receive notifications for voting, emergencies, and policy
                updates
              </Text>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.notifications ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Email Alerts */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Email Alerts
              </Text>
              <Text className="text-body-small text-text-secondary">
                Get email notifications for important governance updates
              </Text>
            </View>
            <Switch
              value={preferences.emailAlerts}
              onValueChange={handleToggleEmailAlerts}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.emailAlerts ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Emergency Contacts */}
          <View className="pt-4 border-t border-border-primary">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-body-medium font-medium text-text-primary">
                Emergency Contacts
              </Text>
              <TouchableOpacity
                onPress={() => {
                  /* Navigate to emergency contacts management */
                }}
                className="flex-row items-center">
                <Text className="text-primary text-body-small mr-1">
                  {preferences.emergencyContacts.length} contacts
                </Text>
                <LucideIcons name="chevron-forward" size={16} color="#6366f1" />
              </TouchableOpacity>
            </View>
            <Text className="text-body-small text-text-secondary mb-3">
              Manage your emergency contact list for escalation chains
            </Text>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => {
                /* Navigate to emergency contacts management */
              }}>
              Manage Emergency Contacts
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderPermissionsInfo = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Your Permissions
        </Text>

        <View className="bg-surface-secondary p-3 rounded-lg mb-4">
          <View className="flex-row items-center mb-2">
            <View
              className={`w-3 h-3 rounded-full mr-2 ${
                state.userRole === 'admin'
                  ? 'bg-error'
                  : state.userRole === 'committee_member'
                    ? 'bg-warning'
                    : 'bg-success'
              }`}
            />
            <Text className="text-body-medium font-semibold text-text-primary capitalize">
              {state.userRole.replace('_', ' ')}
            </Text>
          </View>
          <Text className="text-body-small text-text-secondary">
            {state.userRole === 'admin'
              ? 'Full access to all governance features'
              : state.userRole === 'committee_member'
                ? 'Can create campaigns and manage emergencies'
                : 'Can vote and view governance information'}
          </Text>
        </View>

        <View className="space-y-2">
          {[
            { action: 'vote', label: 'Vote in campaigns and policies' },
            { action: 'create_campaign', label: 'Create voting campaigns' },
            { action: 'create_emergency', label: 'Create emergency alerts' },
            { action: 'create_policy', label: 'Propose new policies' },
            { action: 'view_analytics', label: 'View governance analytics' },
          ].map((permission) => (
            <View key={permission.action} className="flex-row items-center">
              <LucideIcons
                name={
                  canUserPerformAction(permission.action, state.userRole)
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={16}
                color={
                  canUserPerformAction(permission.action, state.userRole)
                    ? '#4CAF50'
                    : '#D32F2F'
                }
              />
              <Text
                className={`text-body-small ml-2 ${
                  canUserPerformAction(permission.action, state.userRole)
                    ? 'text-text-primary'
                    : 'text-text-secondary'
                }`}>
                {permission.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  const renderDataSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Data & Privacy
        </Text>

        <View className="space-y-4">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              /* Navigate to data export */
            }}>
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Export My Data
              </Text>
              <Text className="text-body-small text-text-secondary">
                Download your voting history and participation data
              </Text>
            </View>
            <LucideIcons name="download-outline" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              /* Navigate to privacy settings */
            }}>
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Privacy Settings
              </Text>
              <Text className="text-body-small text-text-secondary">
                Manage how your data is used in governance processes
              </Text>
            </View>
            <LucideIcons name="shield-outline" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              /* Show audit log */
            }}>
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Activity Log
              </Text>
              <Text className="text-body-small text-text-secondary">
                View your governance activity history
              </Text>
            </View>
            <LucideIcons name="time-outline" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderAdvancedSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Advanced Settings
        </Text>

        <View className="space-y-4">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() =>
              router.push('/(tabs)/settings/governance-voting-preferences')
            }>
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Voting Preferences
              </Text>
              <Text className="text-body-small text-text-secondary">
                Configure anonymous voting and reminder settings
              </Text>
            </View>
            <LucideIcons name="ballot-outline" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() =>
              router.push('/(tabs)/settings/governance-emergency-settings')
            }>
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Emergency Settings
              </Text>
              <Text className="text-body-small text-text-secondary">
                Configure emergency alert preferences and escalation
              </Text>
            </View>
            <LucideIcons name="warning-outline" size={20} color="#757575" />
          </TouchableOpacity>

          {canUserPerformAction('view_analytics', state.userRole) && (
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => router.push('/(tabs)/services/analytics')}>
              <View className="flex-1">
                <Text className="text-body-medium font-medium text-text-primary">
                  Analytics Dashboard
                </Text>
                <Text className="text-body-small text-text-secondary">
                  View detailed governance analytics and insights
                </Text>
              </View>
              <LucideIcons name="analytics-outline" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Governance Settings"
        onBackPress={() => safeGoBack()}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {renderNotificationSettings()}
        {renderPermissionsInfo()}
        {renderDataSettings()}
        {renderAdvancedSettings()}

        {/* Save Button */}
        <View className="pt-4">
          <Button
            variant="primary"
            onPress={handleSavePreferences}
            disabled={
              isSaving ||
              JSON.stringify(preferences) === JSON.stringify(state.preferences)
            }>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </View>

        {/* Last Updated */}
        {state.lastUpdated && (
          <View className="mt-4 items-center">
            <Text className="text-body-small text-text-secondary">
              Last updated: {new Date(state.lastUpdated).toLocaleString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
