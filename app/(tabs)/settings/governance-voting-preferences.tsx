import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  Switch
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StackHeader } from '@/components/ui/headers/StackHeader';

interface VotingPreferences {
  anonymousVoting: boolean;
  reminderNotifications: boolean;
  autoReminder: boolean;
  reminderHours: number;
  publicProfile: boolean;
  showVotingHistory: boolean;
}

const defaultPreferences: VotingPreferences = {
  anonymousVoting: true,
  reminderNotifications: true,
  autoReminder: false,
  reminderHours: 24,
  publicProfile: false,
  showVotingHistory: true
};

export default function VotingPreferencesPage() {
  const [preferences, setPreferences] = useState<VotingPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('voting_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading voting preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem('voting_preferences', JSON.stringify(preferences));
      showSuccessAlert('Success', 'Voting preferences updated successfully');
    } catch (error) {
      showErrorAlert('Error', 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof VotingPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const reminderOptions = [
    { value: 1, label: '1 hour before' },
    { value: 6, label: '6 hours before' },
    { value: 24, label: '1 day before' },
    { value: 48, label: '2 days before' },
    { value: 72, label: '3 days before' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="Voting Preferences"
        onBackPress={() => router.back()}
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Privacy Settings */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Privacy Settings
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Anonymous Voting
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Your vote will not be linked to your identity in results
                  </Text>
                </View>
                <Switch
                  value={preferences.anonymousVoting}
                  onValueChange={(value) => handleToggle('anonymousVoting', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={preferences.anonymousVoting ? '#FFFFFF' : '#757575'}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Public Profile
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Show your voting participation in community profiles
                  </Text>
                </View>
                <Switch
                  value={preferences.publicProfile}
                  onValueChange={(value) => handleToggle('publicProfile', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={preferences.publicProfile ? '#FFFFFF' : '#757575'}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Show Voting History
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Display your past voting activity in your profile
                  </Text>
                </View>
                <Switch
                  value={preferences.showVotingHistory}
                  onValueChange={(value) => handleToggle('showVotingHistory', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={preferences.showVotingHistory ? '#FFFFFF' : '#757575'}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Reminder Settings */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Reminder Settings
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-body-medium font-medium text-text-primary">
                    Voting Reminders
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Get notified about upcoming votes and deadlines
                  </Text>
                </View>
                <Switch
                  value={preferences.reminderNotifications}
                  onValueChange={(value) => handleToggle('reminderNotifications', value)}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={preferences.reminderNotifications ? '#FFFFFF' : '#757575'}
                />
              </View>

              {preferences.reminderNotifications && (
                <>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <Text className="text-body-medium font-medium text-text-primary">
                        Auto Reminders
                      </Text>
                      <Text className="text-body-small text-text-secondary">
                        Automatically send reminders for all active votes
                      </Text>
                    </View>
                    <Switch
                      value={preferences.autoReminder}
                      onValueChange={(value) => handleToggle('autoReminder', value)}
                      trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                      thumbColor={preferences.autoReminder ? '#FFFFFF' : '#757575'}
                    />
                  </View>

                  {preferences.autoReminder && (
                    <View>
                      <Text className="text-body-medium font-medium text-text-primary mb-3">
                        Reminder Timing
                      </Text>
                      <View className="space-y-2">
                        {reminderOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            onPress={() => setPreferences(prev => ({ ...prev, reminderHours: option.value }))}
                            className={`p-3 rounded-lg border ${
                              preferences.reminderHours === option.value
                                ? 'border-primary bg-primary/10'
                                : 'border-divider bg-background'
                            }`}
                          >
                            <Text className={`text-body-medium ${
                              preferences.reminderHours === option.value ? 'text-primary font-medium' : 'text-text-primary'
                            }`}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </Card>

        {/* Information Card */}
        <Card className="mb-6 bg-secondary/10 border-secondary/20">
          <Text className="text-secondary text-body-medium font-medium mb-2">
            🗳️ Voting Privacy
          </Text>
          <Text className="text-text-secondary text-body-small leading-5">
            Your privacy is important. Anonymous voting ensures your choices remain confidential while still allowing for transparent results and participation tracking.
          </Text>
        </Card>

        {/* Save Button */}
        <Button
          title={isSaving ? "Saving..." : "Save Preferences"}
          variant="primary"
          onPress={savePreferences}
          disabled={isSaving}
          icon="save-outline"
        />
      </ScrollView>
    </SafeAreaView>
  );
}