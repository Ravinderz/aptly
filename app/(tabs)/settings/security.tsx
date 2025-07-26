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
import { safeGoBack } from '@/utils/navigation';
import * as LocalAuthentication from 'expo-local-authentication';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import StackHeader from '@/components/ui/headers/StackHeader';

// Default security preferences
const defaultPreferences = {
  biometricLogin: false,
  appLock: false,
  autoLockTime: 5, // minutes
  twoFactorAuth: false,
  loginNotifications: true,
  deviceTrust: true,
  sessionTimeout: 30, // minutes
  encryptBackup: true
};

export default function SecuritySettingsPage() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    loadSecurityPreferences();
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricAvailable(hasHardware && isEnrolled);
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric Authentication');
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const loadSecurityPreferences = async () => {
    try {
      const prefsString = await AsyncStorage.getItem('security_preferences');
      if (prefsString) {
        setPreferences(JSON.parse(prefsString));
      }
    } catch (error) {
      console.error('Error loading security preferences:', error);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('security_preferences', JSON.stringify(preferences));
      await AsyncStorage.setItem('security_last_updated', new Date().toISOString());
      showSuccessAlert('Success', 'Security preferences updated successfully');
    } catch (error) {
      showErrorAlert('Error', 'Failed to update security preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && biometricAvailable) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Enable ${biometricType} for Aptly`,
          cancelLabel: 'Cancel',
          fallbackLabel: 'Use Password'
        });
        
        if (result.success) {
          setPreferences(prev => ({ ...prev, biometricLogin: enabled }));
        }
      } catch (error) {
        showErrorAlert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      setPreferences(prev => ({ ...prev, biometricLogin: enabled }));
    }
  };

  const handleResetSecurity = () => {
    Alert.alert(
      'Reset Security Settings',
      'This will reset all security settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPreferences(defaultPreferences);
            showSuccessAlert('Reset Complete', 'Security settings have been reset to defaults');
          }
        }
      ]
    );
  };

  const renderAuthenticationSettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Authentication
        </Text>
        
        <View className="space-y-4">
          {/* Biometric Login */}
          {biometricAvailable && (
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-body-medium font-medium text-text-primary">
                  {biometricType}
                </Text>
                <Text className="text-body-small text-text-secondary">
                  Use biometric authentication to secure app access
                </Text>
              </View>
              <Switch
                value={preferences.biometricLogin}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                thumbColor={preferences.biometricLogin ? '#FFFFFF' : '#757575'}
              />
            </View>
          )}

          {/* App Lock */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                App Lock
              </Text>
              <Text className="text-body-small text-text-secondary">
                Require authentication when opening the app
              </Text>
            </View>
            <Switch
              value={preferences.appLock}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, appLock: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.appLock ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Two Factor Auth */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Two-Factor Authentication
              </Text>
              <Text className="text-body-small text-text-secondary">
                Add extra security with SMS verification
              </Text>
            </View>
            <Switch
              value={preferences.twoFactorAuth}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, twoFactorAuth: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.twoFactorAuth ? '#FFFFFF' : '#757575'}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Privacy & Security
        </Text>
        
        <View className="space-y-4">
          {/* Login Notifications */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Login Notifications
              </Text>
              <Text className="text-body-small text-text-secondary">
                Get notified of new login attempts on your account
              </Text>
            </View>
            <Switch
              value={preferences.loginNotifications}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, loginNotifications: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.loginNotifications ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Device Trust */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Device Trust
              </Text>
              <Text className="text-body-small text-text-secondary">
                Remember this device to reduce authentication prompts
              </Text>
            </View>
            <Switch
              value={preferences.deviceTrust}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, deviceTrust: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.deviceTrust ? '#FFFFFF' : '#757575'}
            />
          </View>

          {/* Encrypt Backup */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-body-medium font-medium text-text-primary">
                Encrypted Backups
              </Text>
              <Text className="text-body-small text-text-secondary">
                Encrypt your data in cloud backups
              </Text>
            </View>
            <Switch
              value={preferences.encryptBackup}
              onValueChange={(enabled) => setPreferences(prev => ({ ...prev, encryptBackup: enabled }))}
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.encryptBackup ? '#FFFFFF' : '#757575'}
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderSecurityActions = () => (
    <Card className="mb-4">
      <View className="p-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-4">
          Security Actions
        </Text>
        
        <View className="space-y-4">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Navigate to active sessions */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Active Sessions
              </Text>
              <Text className="text-body-small text-text-secondary">
                View and manage devices logged into your account
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Navigate to login history */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Login History
              </Text>
              <Text className="text-body-small text-text-secondary">
                Review recent account access activity
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {/* Change password */}}
          >
            <View className="flex-1">
              <Text className="text-body-medium font-medium text-text-primary">
                Change Password
              </Text>
              <Text className="text-body-small text-text-secondary">
                Update your account password
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Security Settings"
        onBackPress={() => safeGoBack()}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {renderAuthenticationSettings()}
        {renderPrivacySettings()}
        {renderSecurityActions()}

        {/* Action Buttons */}
        <View className="space-y-3">
          <Button
            variant="primary"
            onPress={handleSavePreferences}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Security Settings"}
          </Button>
          
          <Button
            variant="destructive"
            onPress={handleResetSecurity}
          >
            Reset to Defaults
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}