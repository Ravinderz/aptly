import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  Switch,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';
import { validateIndianPhoneNumber } from '@/utils/validation';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StackHeader } from '@/components/ui/headers/StackHeader';

interface EmergencySettings {
  receiveAlerts: boolean;
  alertTypes: {
    fire: boolean;
    medical: boolean;
    security: boolean;
    natural: boolean;
    maintenance: boolean;
  };
  escalationEnabled: boolean;
  escalationDelay: number;
  backupContact: string;
  locationSharing: boolean;
  soundAlerts: boolean;
  vibrationAlerts: boolean;
}

const defaultSettings: EmergencySettings = {
  receiveAlerts: true,
  alertTypes: {
    fire: true,
    medical: true,
    security: true,
    natural: true,
    maintenance: false
  },
  escalationEnabled: true,
  escalationDelay: 15,
  backupContact: '',
  locationSharing: false,
  soundAlerts: true,
  vibrationAlerts: true
};

export default function EmergencySettingsPage() {
  const [settings, setSettings] = useState<EmergencySettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('emergency_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading emergency settings:', error);
    }
  };

  const saveSettings = async () => {
    // Validate backup contact if provided
    if (settings.backupContact && !validateIndianPhoneNumber(settings.backupContact)) {
      setPhoneError('Please enter a valid Indian mobile number');
      return;
    }

    try {
      setIsSaving(true);
      await AsyncStorage.setItem('emergency_settings', JSON.stringify(settings));
      showSuccessAlert('Success', 'Emergency settings updated successfully');
    } catch (error) {
      showErrorAlert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof EmergencySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAlertTypeToggle = (type: keyof EmergencySettings['alertTypes'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      alertTypes: { ...prev.alertTypes, [type]: value }
    }));
  };

  const handleBackupContactChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setSettings(prev => ({ ...prev, backupContact: cleaned }));
    setPhoneError('');
  };

  const escalationDelayOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' }
  ];

  const alertTypeLabels = {
    fire: { name: 'Fire Emergency', icon: '🔥', description: 'Fire outbreaks and smoke detection' },
    medical: { name: 'Medical Emergency', icon: '🚑', description: 'Health emergencies and medical assistance' },
    security: { name: 'Security Alert', icon: '🚨', description: 'Security breaches and safety concerns' },
    natural: { name: 'Natural Disaster', icon: '🌪️', description: 'Earthquakes, floods, and weather alerts' },
    maintenance: { name: 'Critical Maintenance', icon: '⚠️', description: 'Urgent maintenance and infrastructure issues' }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Emergency Settings"
        onBackPress={() => router.back()}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Main Alert Settings */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Alert Preferences
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Receive Emergency Alerts
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Get notified about emergencies in your society
                  </Text>
                </View>
                <Switch
                  value={settings.receiveAlerts}
                  onValueChange={(value) => handleToggle('receiveAlerts', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={settings.receiveAlerts ? '#FFFFFF' : '#757575'}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Sound Alerts
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Play alert sounds for emergency notifications
                  </Text>
                </View>
                <Switch
                  value={settings.soundAlerts}
                  onValueChange={(value) => handleToggle('soundAlerts', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={settings.soundAlerts ? '#FFFFFF' : '#757575'}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Vibration Alerts
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Vibrate device for emergency notifications
                  </Text>
                </View>
                <Switch
                  value={settings.vibrationAlerts}
                  onValueChange={(value) => handleToggle('vibrationAlerts', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={settings.vibrationAlerts ? '#FFFFFF' : '#757575'}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Alert Types */}
        {settings.receiveAlerts && (
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Alert Types
              </Text>
              
              <View className="space-y-3">
                {Object.entries(alertTypeLabels).map(([key, label]) => (
                  <View key={key} className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg mr-2">{label.icon}</Text>
                        <Text className="text-body-medium font-medium text-text-primary">
                          {label.name}
                        </Text>
                      </View>
                      <Text className="text-body-small text-text-secondary">
                        {label.description}
                      </Text>
                    </View>
                    <Switch
                      value={settings.alertTypes[key as keyof typeof settings.alertTypes]}
                      onValueChange={(value) => handleAlertTypeToggle(key as keyof typeof settings.alertTypes, value)}
                      trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                      thumbColor={settings.alertTypes[key as keyof typeof settings.alertTypes] ? '#FFFFFF' : '#757575'}
                    />
                  </View>
                ))}
              </View>
            </View>
          </Card>
        )}

        {/* Escalation Settings */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Escalation Settings
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Enable Escalation
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Automatically escalate unacknowledged alerts
                  </Text>
                </View>
                <Switch
                  value={settings.escalationEnabled}
                  onValueChange={(value) => handleToggle('escalationEnabled', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={settings.escalationEnabled ? '#FFFFFF' : '#757575'}
                />
              </View>

              {settings.escalationEnabled && (
                <View>
                  <Text className="text-body-medium font-medium text-text-primary mb-3">
                    Escalation Delay
                  </Text>
                  <View className="space-y-2">
                    {escalationDelayOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSettings(prev => ({ ...prev, escalationDelay: option.value }))}
                        className={`p-3 rounded-lg border ${
                          settings.escalationDelay === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-divider bg-background'
                        }`}
                      >
                        <Text className={`text-body-medium ${
                          settings.escalationDelay === option.value ? 'text-primary font-medium' : 'text-text-primary'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Backup Contact */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Backup Contact
            </Text>
            
            <View className="mb-4">
              <Text className="text-body-medium font-medium text-text-primary mb-2">
                Emergency Contact Number
              </Text>
              <TextInput
                className={`bg-background border rounded-lg px-4 py-3 text-text-primary text-body-large ${
                  phoneError ? 'border-error' : 'border-divider'
                }`}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#757575"
                value={settings.backupContact}
                onChangeText={handleBackupContactChange}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {phoneError ? (
                <Text className="text-error text-body-small mt-1">
                  {phoneError}
                </Text>
              ) : (
                <Text className="text-text-secondary text-body-small mt-1">
                  This contact will be notified if you don't respond to emergency alerts
                </Text>
              )}
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-body-medium font-medium text-text-primary">
                  Share Location
                </Text>
                <Text className="text-body-small text-text-secondary">
                  Share your location with emergency responders
                </Text>
              </View>
              <Switch
                value={settings.locationSharing}
                onValueChange={(value) => handleToggle('locationSharing', value)}
                trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                thumbColor={settings.locationSharing ? '#FFFFFF' : '#757575'}
              />
            </View>
          </View>
        </Card>

        {/* Information Card */}
        <Card className="mb-6 bg-error/10 border-error/20">
          <Text className="text-error text-body-medium font-medium mb-2">
            🚨 Emergency Response
          </Text>
          <Text className="text-text-secondary text-body-small leading-5">
            Emergency alerts are critical for your safety. Disabling certain alert types may put you at risk during actual emergencies. Please configure these settings carefully.
          </Text>
        </Card>

        {/* Save Button */}
        <Button
          title={isSaving ? "Saving..." : "Save Settings"}
          variant="primary"
          onPress={saveSettings}
          disabled={isSaving}
          icon="save-outline"
        />
      </ScrollView>
    </SafeAreaView>
  );
}