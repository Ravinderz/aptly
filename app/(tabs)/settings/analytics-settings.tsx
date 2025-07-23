import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  Switch,
  Alert,
  Slider
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import context
import { useAnalytics } from '@/contexts/AnalyticsContext';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/ui/headers';

export default function AnalyticsSettingsPage() {
  const { 
    state, 
    updateAnalyticsPreferences, 
    canUserAccessAnalytics, 
    canUserExportData,
    canUserManageNotifications 
  } = useAnalytics();
  
  const [preferences, setPreferences] = useState(state.preferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreferences(state.preferences);
  }, [state.preferences]);

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await updateAnalyticsPreferences(preferences);
      Alert.alert('Success', 'Analytics preferences updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoRefresh = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, autoRefresh: enabled }));
  };

  const handleChangeReportFormat = (format: 'json' | 'csv' | 'pdf') => {
    setPreferences(prev => ({ ...prev, reportFormat: format }));
  };

  const handleChangeDataRetention = (days: number) => {
    setPreferences(prev => ({ ...prev, dataRetention: days }));
  };

  const handleChangeAlertThreshold = (type: 'performance' | 'errors' | 'usage', value: number) => {
    setPreferences(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [type]: value
      }
    }));
  };

  const renderDataSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Data Management
        </Text>
        
        <View className="space-y-4">
          {/* Auto Refresh */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Auto Refresh
              </Text>
              <Text className="text-body-small text-text-secondary">
                Automatically refresh analytics data every minute
              </Text>
            </View>
            <Switch
              value={preferences.autoRefresh}
              onValueChange={handleToggleAutoRefresh}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.autoRefresh ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          {/* Data Retention */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-2">
              Data Retention Period
            </Text>
            <Text className="text-body-small text-text-secondary mb-3">
              Keep analytics data for {preferences.dataRetention} days
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={30}
              maximumValue={730}
              step={30}
              value={preferences.dataRetention}
              onValueChange={handleChangeDataRetention}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#D1D5DB"
              thumbStyle={{ backgroundColor: '#6366f1' }}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-body-small text-text-secondary">30 days</Text>
              <Text className="text-body-small text-text-secondary">2 years</Text>
            </View>
          </View>

          {/* Report Format */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-3">
              Default Export Format
            </Text>
            <View className="flex-row gap-2">
              {(['json', 'csv', 'pdf'] as const).map((format) => (
                <TouchableOpacity
                  key={format}
                  onPress={() => handleChangeReportFormat(format)}
                  className={`flex-1 p-3 rounded-lg border ${
                    preferences.reportFormat === format
                      ? 'border-primary bg-primary/10'
                      : 'border-border-primary bg-surface-secondary'
                  }`}
                >
                  <Text className={`text-center text-body-small font-medium uppercase ${
                    preferences.reportFormat === format
                      ? 'text-primary'
                      : 'text-text-secondary'
                  }`}>
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderAlertSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Alert Thresholds
        </Text>
        <Text className="text-body-small text-text-secondary mb-4">
          Configure when to receive alerts based on system metrics
        </Text>
        
        <View className="space-y-6">
          {/* Performance Threshold */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-2">
              Performance Alert Threshold
            </Text>
            <Text className="text-body-small text-text-secondary mb-3">
              Alert when response time exceeds {preferences.alertThresholds.performance}ms
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={100}
              maximumValue={2000}
              step={50}
              value={preferences.alertThresholds.performance}
              onValueChange={(value) => handleChangeAlertThreshold('performance', value)}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#D1D5DB"
              thumbStyle={{ backgroundColor: '#6366f1' }}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-body-small text-text-secondary">100ms</Text>
              <Text className="text-body-small text-text-secondary">2000ms</Text>
            </View>
          </View>

          {/* Error Rate Threshold */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-2">
              Error Rate Alert Threshold
            </Text>
            <Text className="text-body-small text-text-secondary mb-3">
              Alert when error rate exceeds {preferences.alertThresholds.errors}%
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={preferences.alertThresholds.errors}
              onValueChange={(value) => handleChangeAlertThreshold('errors', value)}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#D1D5DB"
              thumbStyle={{ backgroundColor: '#6366f1' }}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-body-small text-text-secondary">1%</Text>
              <Text className="text-body-small text-text-secondary">20%</Text>
            </View>
          </View>

          {/* Usage Threshold */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-2">
              Resource Usage Alert Threshold
            </Text>
            <Text className="text-body-small text-text-secondary mb-3">
              Alert when resource usage exceeds {preferences.alertThresholds.usage}%
            </Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={50}
              maximumValue={95}
              step={5}
              value={preferences.alertThresholds.usage}
              onValueChange={(value) => handleChangeAlertThreshold('usage', value)}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#D1D5DB"
              thumbStyle={{ backgroundColor: '#6366f1' }}
            />
            <View className="flex-row justify-between mt-1">
              <Text className="text-body-small text-text-secondary">50%</Text>
              <Text className="text-body-small text-text-secondary">95%</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderPermissionsInfo = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Access Permissions
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
            {state.userRole === 'admin' ? 'Full access to all analytics features' :
             state.userRole === 'committee_member' ? 'Can view analytics and manage notifications' :
             'Limited access to basic metrics only'
            }
          </Text>
        </View>

        <View className="space-y-2">
          {[
            { check: canUserAccessAnalytics(), label: 'View detailed analytics' },
            { check: canUserExportData(), label: 'Export analytics data' },
            { check: canUserManageNotifications(), label: 'Manage notification campaigns' },
            { check: state.userRole === 'admin', label: 'Apply system optimizations' },
            { check: state.userRole === 'admin', label: 'View audit logs' }
          ].map((permission, index) => (
            <View key={index} className="flex-row items-center">
              <Ionicons 
                name={permission.check ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={permission.check ? "#10B981" : "#EF4444"} 
              />
              <Text className={`text-body-small ml-2 ${
                permission.check ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {permission.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  const renderDataActions = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Data Actions
        </Text>
        
        <View className="space-y-4">
          {canUserExportData() && (
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => {/* Trigger data export */}}
            >
              <View className="flex-1">
                <Text className="text-body-medium font-medium text-text-primary">
                  Export Analytics Data
                </Text>
                <Text className="text-body-small text-text-secondary">
                  Download complete analytics report in {preferences.reportFormat.toUpperCase()} format
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Clear cached data */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Clear Cache
              </Text>
              <Text className="text-body-small text-text-secondary">
                Remove locally cached analytics data
              </Text>
            </View>
            <Ionicons name="trash-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          {canUserAccessAnalytics() && (
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => router.push('/(tabs)/services/analytics')}
            >
              <View className="flex-1">
                <Text className="text-body-medium font-medium text-text-primary">
                  Analytics Dashboard
                </Text>
                <Text className="text-body-small text-text-secondary">
                  View detailed performance metrics and insights
                </Text>
              </View>
              <Ionicons name="analytics-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  if (!canUserAccessAnalytics()) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <TabHeader
          title="Analytics Settings"
          subtitle="Configure analytics preferences"
          onNotificationPress={() => console.log('Notifications pressed')}
          onHelpPress={() => console.log('Help pressed')}
          notificationCount={0}
          showBackButton
          onBackPress={() => router.back()}
        />
        
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            Access Restricted
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Analytics settings are only available to committee members and administrators.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TabHeader
        title="Analytics Settings"
        subtitle="Configure performance monitoring and data preferences"
        onNotificationPress={() => console.log('Notifications pressed')}
        onHelpPress={() => console.log('Help pressed')}
        notificationCount={0}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView className="flex-1 p-4">
        {renderDataSettings()}
        {renderAlertSettings()}
        {renderPermissionsInfo()}
        {renderDataActions()}

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