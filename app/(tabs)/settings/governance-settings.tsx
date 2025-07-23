import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { useGovernance } from '@/contexts/GovernanceContext';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/ui/headers';

export default function GovernanceSettingsPage() {
  const { state, updateUserPreferences, canUserPerformAction } = useGovernance();
  const [preferences, setPreferences] = useState(state.preferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreferences(state.preferences);
  }, [state.preferences]);

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await updateUserPreferences(preferences);
      Alert.alert('Success', 'Governance preferences updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, notifications: enabled }));
  };

  const handleToggleEmailAlerts = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, emailAlerts: enabled }));
  };

  const renderNotificationSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Notification Preferences
        </Text>
        
        <View className="space-y-4">
          {/* Push Notifications */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Push Notifications
              </Text>
              <Text className="text-body-small text-text-secondary">
                Receive notifications for voting, emergencies, and policy updates
              </Text>
            </View>
            <Switch
              value={preferences.notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.notifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          {/* Email Alerts */}
          <View className="flex-row items-center justify-between">
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
              thumbColor={preferences.emailAlerts ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          {/* Emergency Contacts */}
          <View className="pt-4 border-t border-border-primary">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-body-medium font-medium text-text-primary">
                Emergency Contacts
              </Text>
              <TouchableOpacity
                onPress={() => {/* Navigate to emergency contacts management */}}
                className="flex-row items-center"
              >
                <Text className="text-primary text-body-small mr-1">
                  {preferences.emergencyContacts.length} contacts
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6366f1" />
              </TouchableOpacity>
            </View>
            <Text className="text-body-small text-text-secondary mb-3">
              Manage your emergency contact list for escalation chains
            </Text>
            <Button
              title="Manage Contacts"
              variant="secondary"
              size="small"
              onPress={() => {/* Navigate to emergency contacts management */}}
              icon="people-outline"
            />
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
            <View className={`w-3 h-3 rounded-full mr-2 ${
              state.userRole === 'admin' ? 'bg-error' :
              state.userRole === 'committee_member' ? 'bg-warning' : 'bg-success'
            }`} />
            <Text className="text-body-medium font-semibold text-text-primary capitalize">
              {state.userRole.replace('_', ' ')}
            </Text>
          </View>
          <Text className="text-body-small text-text-secondary">
            {state.userRole === 'admin' ? 'Full access to all governance features' :
             state.userRole === 'committee_member' ? 'Can create campaigns and manage emergencies' :
             'Can vote and view governance information'
            }
          </Text>
        </View>

        <View className="space-y-2">
          {[
            { action: 'vote', label: 'Vote in campaigns and policies' },
            { action: 'create_campaign', label: 'Create voting campaigns' },
            { action: 'create_emergency', label: 'Create emergency alerts' },
            { action: 'create_policy', label: 'Propose new policies' },
            { action: 'view_analytics', label: 'View governance analytics' }
          ].map((permission) => (
            <View key={permission.action} className="flex-row items-center">
              <Ionicons 
                name={canUserPerformAction(permission.action) ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={canUserPerformAction(permission.action) ? "#10B981" : "#EF4444"} 
              />
              <Text className={`text-body-small ml-2 ${
                canUserPerformAction(permission.action) ? 'text-text-primary' : 'text-text-secondary'
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
            onPress={() => {/* Navigate to data export */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Export My Data
              </Text>
              <Text className="text-body-small text-text-secondary">
                Download your voting history and participation data
              </Text>
            </View>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Navigate to privacy settings */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Privacy Settings
              </Text>
              <Text className="text-body-small text-text-secondary">
                Manage how your data is used in governance processes
              </Text>
            </View>
            <Ionicons name="shield-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Show audit log */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Activity Log
              </Text>
              <Text className="text-body-small text-text-secondary">
                View your governance activity history
              </Text>
            </View>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
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
            onPress={() => {/* Navigate to voting preferences */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Voting Preferences
              </Text>
              <Text className="text-body-small text-text-secondary">
                Configure anonymous voting and reminder settings
              </Text>
            </View>
            <Ionicons name="ballot-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Navigate to emergency settings */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Emergency Settings
              </Text>
              <Text className="text-body-small text-text-secondary">
                Configure emergency alert preferences and escalation
              </Text>
            </View>
            <Ionicons name="warning-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          {canUserPerformAction('view_analytics') && (
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => router.push('/(tabs)/services/analytics')}
            >
              <View className="flex-1">
                <Text className="text-body-medium font-medium text-text-primary">
                  Analytics Dashboard
                </Text>
                <Text className="text-body-small text-text-secondary">
                  View detailed governance analytics and insights
                </Text>
              </View>
              <Ionicons name="analytics-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TabHeader
        title="Governance Settings"
        subtitle="Configure your democratic participation preferences"
        onNotificationPress={() => console.log('Notifications pressed')}
        onHelpPress={() => console.log('Help pressed')}
        notificationCount={0}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView className="flex-1 p-4">
        {renderNotificationSettings()}
        {renderPermissionsInfo()}
        {renderDataSettings()}
        {renderAdvancedSettings()}

        {/* Save Button */}
        <View className="pt-4">
          <Button
            title={isSaving ? "Saving..." : "Save Preferences"}
            variant="primary"
            onPress={handleSavePreferences}
            disabled={isSaving || JSON.stringify(preferences) === JSON.stringify(state.preferences)}
            icon="save-outline"
          />
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