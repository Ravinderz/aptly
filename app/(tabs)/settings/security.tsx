import LucideIcons from '@/components/ui/LucideIcons';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import { safeGoBack } from '@/utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import {
  Alert,
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

// Default security preferences
const defaultPreferences = {
  biometricLogin: false,
  appLock: false,
  autoLockTime: 5, // minutes
  twoFactorAuth: false,
  loginNotifications: true,
  deviceTrust: true,
  sessionTimeout: 30, // minutes
  encryptBackup: true,
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
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setBiometricAvailable(hasHardware && isEnrolled);

      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricType('Face ID');
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT,
        )
      ) {
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
      await AsyncStorage.setItem(
        'security_preferences',
        JSON.stringify(preferences),
      );
      await AsyncStorage.setItem(
        'security_last_updated',
        new Date().toISOString(),
      );
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
          fallbackLabel: 'Use Password',
        });

        if (result.success) {
          setPreferences((prev) => ({ ...prev, biometricLogin: enabled }));
        }
      } catch (error) {
        showErrorAlert('Error', 'Failed to enable biometric authentication');
      }
    } else {
      setPreferences((prev) => ({ ...prev, biometricLogin: enabled }));
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
            showSuccessAlert(
              'Reset Complete',
              'Security settings have been reset to defaults',
            );
          },
        },
      ],
    );
  };

  const renderAuthenticationSettings = () => (
    <Card className="mb-4" testID="settings.security.authentication-card">
      <View className="p-4">
        <Text
          className="text-headline-small font-semibold text-text-primary mb-4"
          testID="settings.security.authentication-title">
          Authentication
        </Text>

        <View
          className="space-y-4"
          testID="settings.security.authentication-options">
          {/* Biometric Login */}
          {biometricAvailable && (
            <View
              className="flex-row items-center justify-between"
              testID="settings.security.biometric-login">
              <View className="flex-1 mr-4">
                <Text
                  className="text-body-medium font-medium text-text-primary"
                  testID="settings.security.biometric-login.title">
                  {biometricType}
                </Text>
                <Text
                  className="text-body-small text-text-secondary"
                  testID="settings.security.biometric-login.description">
                  Use biometric authentication to secure app access
                </Text>
              </View>
              <Switch
                value={preferences.biometricLogin}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                thumbColor={preferences.biometricLogin ? '#FFFFFF' : '#757575'}
                testID="settings.security.biometric-login.switch"
              />
            </View>
          )}

          {/* App Lock */}
          <View
            className="flex-row items-center justify-between"
            testID="settings.security.app-lock">
            <View className="flex-1 mr-4">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.app-lock.title">
                App Lock
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.app-lock.description">
                Require authentication when opening the app
              </Text>
            </View>
            <Switch
              value={preferences.appLock}
              onValueChange={(enabled) =>
                setPreferences((prev) => ({ ...prev, appLock: enabled }))
              }
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.appLock ? '#FFFFFF' : '#757575'}
              testID="settings.security.app-lock.switch"
            />
          </View>

          {/* Two Factor Auth */}
          <View
            className="flex-row items-center justify-between"
            testID="settings.security.two-factor-auth">
            <View className="flex-1 mr-4">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.two-factor-auth.title">
                Two-Factor Authentication
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.two-factor-auth.description">
                Add extra security with SMS verification
              </Text>
            </View>
            <Switch
              value={preferences.twoFactorAuth}
              onValueChange={(enabled) =>
                setPreferences((prev) => ({ ...prev, twoFactorAuth: enabled }))
              }
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.twoFactorAuth ? '#FFFFFF' : '#757575'}
              testID="settings.security.two-factor-auth.switch"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderPrivacySettings = () => (
    <Card className="mb-4" testID="settings.security.privacy-card">
      <View className="p-4">
        <Text
          className="text-headline-small font-semibold text-text-primary mb-4"
          testID="settings.security.privacy-title">
          Privacy & Security
        </Text>

        <View className="space-y-4" testID="settings.security.privacy-options">
          {/* Login Notifications */}
          <View
            className="flex-row items-center justify-between"
            testID="settings.security.login-notifications">
            <View className="flex-1 mr-4">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.login-notifications.title">
                Login Notifications
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.login-notifications.description">
                Get notified of new login attempts on your account
              </Text>
            </View>
            <Switch
              value={preferences.loginNotifications}
              onValueChange={(enabled) =>
                setPreferences((prev) => ({
                  ...prev,
                  loginNotifications: enabled,
                }))
              }
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={
                preferences.loginNotifications ? '#FFFFFF' : '#757575'
              }
              testID="settings.security.login-notifications.switch"
            />
          </View>

          {/* Device Trust */}
          <View
            className="flex-row items-center justify-between"
            testID="settings.security.device-trust">
            <View className="flex-1 mr-4">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.device-trust.title">
                Device Trust
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.device-trust.description">
                Remember this device to reduce authentication prompts
              </Text>
            </View>
            <Switch
              value={preferences.deviceTrust}
              onValueChange={(enabled) =>
                setPreferences((prev) => ({ ...prev, deviceTrust: enabled }))
              }
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.deviceTrust ? '#FFFFFF' : '#757575'}
              testID="settings.security.device-trust.switch"
            />
          </View>

          {/* Encrypt Backup */}
          <View
            className="flex-row items-center justify-between"
            testID="settings.security.encrypt-backup">
            <View className="flex-1 mr-4">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.encrypt-backup.title">
                Encrypted Backups
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.encrypt-backup.description">
                Encrypt your data in cloud backups
              </Text>
            </View>
            <Switch
              value={preferences.encryptBackup}
              onValueChange={(enabled) =>
                setPreferences((prev) => ({ ...prev, encryptBackup: enabled }))
              }
              trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
              thumbColor={preferences.encryptBackup ? '#FFFFFF' : '#757575'}
              testID="settings.security.encrypt-backup.switch"
            />
          </View>
        </View>
      </View>
    </Card>
  );

  const renderSecurityActions = () => (
    <Card className="mb-4" testID="settings.security.actions-card">
      <View className="p-4">
        <Text
          className="text-headline-small font-semibold text-text-primary mb-4"
          testID="settings.security.actions-title">
          Security Actions
        </Text>

        <View className="space-y-4" testID="settings.security.actions-list">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              /* Navigate to active sessions */
            }}
            testID="settings.security.active-sessions-button">
            <View className="flex-1">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.active-sessions.title">
                Active Sessions
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.active-sessions.description">
                View and manage devices logged into your account
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              /* Navigate to login history */
            }}
            testID="settings.security.login-history-button">
            <View className="flex-1">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.login-history.title">
                Login History
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.login-history.description">
                Review recent account access activity
              </Text>
            </View>
            <LucideIcons name="chevron-forward" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            onPress={() => {
              /* Change password */
            }}
            testID="settings.security.change-password-button">
            <View className="flex-1">
              <Text
                className="text-body-medium font-medium text-text-primary"
                testID="settings.security.change-password.title">
                Change Password
              </Text>
              <Text
                className="text-body-small text-text-secondary"
                testID="settings.security.change-password.description">
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
    <SafeAreaView
      className="flex-1 bg-background"
      testID="settings.security.screen">
      <StackHeader
        title="Security Settings"
        onBackPress={() => safeGoBack()}
        testID="settings.security.header"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        testID="settings.security.scroll">
        {renderAuthenticationSettings()}
        {renderPrivacySettings()}
        {renderSecurityActions()}

        {/* Action Buttons */}
        <View className="space-y-3" testID="settings.security.action-buttons">
          <Button
            variant="primary"
            onPress={handleSavePreferences}
            disabled={isSaving}
            testID="settings.security.save-button">
            {isSaving ? 'Saving...' : 'Save Security Settings'}
          </Button>

          <Button
            variant="destructive"
            onPress={handleResetSecurity}
            testID="settings.security.reset-button">
            Reset to Defaults
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
