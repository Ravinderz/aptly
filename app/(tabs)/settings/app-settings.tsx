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
import AsyncStorage from '@react-native-async-storage/async-storage';
import LucideIcons from '@/components/ui/LucideIcons';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import StackHeader from '@/components/ui/headers/StackHeader';

// Default app preferences
const defaultPreferences = {
  language: 'en',
  theme: 'light',
  autoDownloadUpdates: true,
  offlineMode: false,
  cacheSizeLimit: 100, // MB
  debugMode: false,
  analytics: true,
  crashReporting: true
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

const themes = [
  { id: 'light', name: 'Light', icon: 'sunny-outline' },
  { id: 'dark', name: 'Dark', icon: 'moon-outline' },
  { id: 'system', name: 'System', icon: 'phone-portrait-outline' }
];

export default function AppSettingsPage() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    loadAppPreferences();
    calculateStorageUsage();
  }, []);

  const loadAppPreferences = async () => {
    try {
      const prefsString = await AsyncStorage.getItem('app_preferences');
      if (prefsString) {
        setPreferences(JSON.parse(prefsString));
      }
    } catch (error) {
      console.error('Error loading app preferences:', error);
    }
  };

  const calculateStorageUsage = async () => {
    try {
      // In a real app, calculate actual storage usage
      // For now, simulate with a random value
      setStorageUsed(Math.floor(Math.random() * 80 + 20));
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('app_preferences', JSON.stringify(preferences));
      await AsyncStorage.setItem('app_settings_last_updated', new Date().toISOString());
      showSuccessAlert('Success', 'App settings updated successfully');
    } catch (error) {
      showErrorAlert('Error', 'Failed to update app settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and may affect app performance temporarily. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, clear actual cache
              setStorageUsed(5); // Simulate cleared cache
              showSuccessAlert('Cache Cleared', 'App cache has been cleared successfully');
            } catch (error) {
              showErrorAlert('Error', 'Failed to clear cache');
            }
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset App Settings',
      'This will reset all app settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPreferences(defaultPreferences);
            showSuccessAlert('Reset Complete', 'App settings have been reset to defaults');
          }
        }
      ]
    );
  };

  const renderLanguageTheme = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Language & Theme
        </Text>
        
        <View className="space-y-4">
          {/* Language Selection */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-3">
              Language
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => setPreferences(prev => ({ ...prev, language: lang.code }))}
                  className={`flex-row items-center px-3 py-2 rounded-full border ${
                    preferences.language === lang.code
                      ? 'border-primary bg-primary/10'
                      : 'border-divider bg-background'
                  }`}
                >
                  <Text className="mr-2">{lang.flag}</Text>
                  <Text className={`text-body-small font-medium ${
                    preferences.language === lang.code ? 'text-primary' : 'text-text-secondary'
                  }`}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Selection */}
          <View>
            <Text className="text-body-medium font-medium text-text-primary mb-3">
              Theme
            </Text>
            <View className="flex-row gap-2">
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  onPress={() => setPreferences(prev => ({ ...prev, theme: theme.id }))}
                  className={`flex-1 flex-row items-center justify-center px-3 py-3 rounded-lg border ${
                    preferences.theme === theme.id
                      ? 'border-primary bg-primary/10'
                      : 'border-divider bg-background'
                  }`}
                >
                  <LucideIcons 
                    name={theme.icon as any} 
                    size={16} 
                    color={preferences.theme === theme.id ? '#6366f1' : '#757575'} 
                  />
                  <Text className={`ml-2 text-body-small font-medium ${
                    preferences.theme === theme.id ? 'text-primary' : 'text-text-secondary'
                  }`}>
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderDataSync = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Data & Sync
        </Text>
        
        <View className="space-y-4">
          {/* Auto Download Updates */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Auto Download Updates
              </Text>
              <Text className="text-body-small text-text-secondary">
                Automatically download app updates when available
              </Text>
            </View>
            <Switch
              value={preferences.autoDownloadUpdates}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, autoDownloadUpdates: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.autoDownloadUpdates ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Offline Mode */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Offline Mode
              </Text>
              <Text className="text-body-small text-text-secondary">
                Cache data for offline access when network is unavailable
              </Text>
            </View>
            <Switch
              value={preferences.offlineMode}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, offlineMode: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.offlineMode ? '#FFFFFF' : '#757575'}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderStoragePrivacy = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Storage & Privacy
        </Text>
        
        <View className="space-y-4">
          {/* Storage Usage */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-body-medium font-medium text-text-primary">
                Storage Usage
              </Text>
              <Text className="text-body-small text-text-secondary">
                {storageUsed} MB used
              </Text>
            </View>
            <View className="bg-background rounded-full h-2">
              <View 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${Math.min((storageUsed / 100) * 100, 100)}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-body-small text-text-secondary">0 MB</Text>
              <Text className="text-body-small text-text-secondary">100 MB limit</Text>
            </View>
          </View>

          {/* Clear Cache Button */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={handleClearCache}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Clear Cache
              </Text>
              <Text className="text-body-small text-text-secondary">
                Free up space by clearing temporary files
              </Text>
            </View>
            <LucideIcons name="trash-outline" size={20} color="#757575" />
          </TouchableOpacity>

          {/* Analytics */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Usage Analytics
              </Text>
              <Text className="text-body-small text-text-secondary">
                Help improve the app by sharing anonymous usage data
              </Text>
            </View>
            <Switch
              value={preferences.analytics}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, analytics: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.analytics ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Crash Reporting */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Crash Reporting
              </Text>
              <Text className="text-body-small text-text-secondary">
                Automatically report crashes to help fix issues
              </Text>
            </View>
            <Switch
              value={preferences.crashReporting}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, crashReporting: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.crashReporting ? '#FFFFFF' : '#757575'}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderDeveloperOptions = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Developer Options
        </Text>
        
        <View className="space-y-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Debug Mode
              </Text>
              <Text className="text-body-small text-text-secondary">
                Enable debug logging and developer tools
              </Text>
            </View>
            <Switch
              value={preferences.debugMode}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, debugMode: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.debugMode ? '#FFFFFF' : '#757575'}
            />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Show app logs */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                View Logs
              </Text>
              <Text className="text-body-small text-text-secondary">
                View recent app activity and error logs
              </Text>
            </View>
            <LucideIcons name="document-text-outline" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="App Settings"
        onBackPress={() => router.back()}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {renderLanguageTheme()}
        {renderDataSync()}
        {renderStoragePrivacy()}
        {renderDeveloperOptions()}

        {/* Action Buttons */}
        <View className="space-y-3">
          <Button
            variant="primary"
            onPress={handleSavePreferences}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save App Settings"}
          </Button>
          
          <Button
            variant="destructive"
            onPress={handleResetSettings}
          >
            Reset to Defaults
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}