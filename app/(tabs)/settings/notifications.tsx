import React, { useState } from 'react';
import { ScrollView, SafeAreaView, View, Text, Switch } from 'react-native';
import { ArrowLeft, Bell, BellOff, Clock, Moon } from 'lucide-react-native';
import { router } from 'expo-router';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

interface NotificationSetting {
  id: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  subcategories?: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
}

export default function NotificationPreferences() {
  const [notificationSettings, setNotificationSettings] = useState<
    NotificationSetting[]
  >([
    {
      id: 'maintenance',
      category: 'Maintenance',
      description: 'Maintenance requests and updates',
      icon: <Bell size={20} color="#6366f1" />,
      enabled: true,
      subcategories: [
        { id: 'maintenance_created', name: 'Request created', enabled: true },
        { id: 'maintenance_assigned', name: 'Vendor assigned', enabled: true },
        { id: 'maintenance_completed', name: 'Work completed', enabled: true },
        {
          id: 'maintenance_feedback',
          name: 'Feedback requested',
          enabled: false,
        },
      ],
    },
    {
      id: 'billing',
      category: 'Billing',
      description: 'Bill generation and payment reminders',
      icon: <Bell size={20} color="#6366f1" />,
      enabled: true,
      subcategories: [
        { id: 'bill_generated', name: 'New bill generated', enabled: true },
        { id: 'payment_due', name: 'Payment due reminder', enabled: true },
        { id: 'payment_overdue', name: 'Overdue payment alert', enabled: true },
        { id: 'payment_confirmed', name: 'Payment confirmed', enabled: false },
      ],
    },
    {
      id: 'events',
      category: 'Society Events',
      description: 'Community events and announcements',
      icon: <Bell size={20} color="#6366f1" />,
      enabled: true,
      subcategories: [
        { id: 'event_created', name: 'New event announced', enabled: true },
        { id: 'event_reminder', name: 'Event reminders', enabled: true },
        { id: 'event_cancelled', name: 'Event cancellations', enabled: true },
      ],
    },
    {
      id: 'security',
      category: 'Security',
      description: 'Visitor approvals and security alerts',
      icon: <Bell size={20} color="#6366f1" />,
      enabled: true,
      subcategories: [
        {
          id: 'visitor_approval',
          name: 'Visitor approval requests',
          enabled: true,
        },
        {
          id: 'visitor_arrived',
          name: 'Visitor arrival notifications',
          enabled: true,
        },
        { id: 'security_alerts', name: 'Security alerts', enabled: true },
      ],
    },
    {
      id: 'committee',
      category: 'Committee',
      description: 'Committee meetings and decisions',
      icon: <Bell size={20} color="#6366f1" />,
      enabled: false,
      subcategories: [
        { id: 'meeting_scheduled', name: 'Meeting scheduled', enabled: false },
        { id: 'voting_open', name: 'Voting open', enabled: false },
        {
          id: 'decisions_announced',
          name: 'Decisions announced',
          enabled: false,
        },
      ],
    },
    {
      id: 'amenities',
      category: 'Amenities',
      description: 'Booking confirmations and reminders',
      icon: <Bell size={20} color="#6366f1" />,
      enabled: true,
      subcategories: [
        { id: 'booking_confirmed', name: 'Booking confirmed', enabled: true },
        { id: 'booking_reminder', name: 'Booking reminders', enabled: true },
        { id: 'booking_cancelled', name: 'Booking cancelled', enabled: true },
      ],
    },
  ]);

  const [doNotDisturbSettings, setDoNotDisturbSettings] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
    allowEmergency: true,
  });

  const [deliveryChannels, setDeliveryChannels] = useState({
    push: true,
    email: false,
    sms: false,
  });

  const toggleMainCategory = (categoryId: string) => {
    setNotificationSettings((prev) =>
      prev.map((setting) =>
        setting.id === categoryId
          ? {
              ...setting,
              enabled: !setting.enabled,
              subcategories: setting.subcategories?.map((sub) => ({
                ...sub,
                enabled: !setting.enabled,
              })),
            }
          : setting,
      ),
    );
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
    setNotificationSettings((prev) =>
      prev.map((setting) =>
        setting.id === categoryId
          ? {
              ...setting,
              subcategories: setting.subcategories?.map((sub) =>
                sub.id === subcategoryId
                  ? { ...sub, enabled: !sub.enabled }
                  : sub,
              ),
            }
          : setting,
      ),
    );
  };

  const toggleDoNotDisturb = () => {
    setDoNotDisturbSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleDeliveryChannel = (channel: 'push' | 'email' | 'sms') => {
    setDeliveryChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-divider bg-surface">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          className="mr-2 p-2">
          <ArrowLeft size={20} color="#6366f1" />
        </Button>
        <Text className="text-text-primary text-headline-large font-semibold">
          Notification Preferences
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Do Not Disturb */}
        <View className="p-4">
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Moon size={20} color="#6366f1" />
                </View>
                <View>
                  <Text className="text-text-primary text-body-large font-semibold">
                    Do Not Disturb
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {doNotDisturbSettings.enabled
                      ? `${doNotDisturbSettings.startTime} - ${doNotDisturbSettings.endTime}`
                      : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={doNotDisturbSettings.enabled}
                onValueChange={toggleDoNotDisturb}
                trackColor={{ false: '#E0E0E0', true: '#6366f1' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {doNotDisturbSettings.enabled && (
              <View className="bg-background rounded-lg p-3">
                <Text className="text-text-secondary text-sm mb-2">
                  During these hours, only emergency notifications will be
                  shown.
                </Text>
                <View className="flex-row items-center">
                  <Clock size={14} color="#757575" />
                  <Text className="text-text-secondary text-sm ml-1">
                    {doNotDisturbSettings.startTime} to{' '}
                    {doNotDisturbSettings.endTime}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Notification Categories */}
        <View className="px-4">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Notification Categories
          </Text>

          {notificationSettings.map((setting) => (
            <Card key={setting.id} className="mb-4">
              {/* Main Category */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                    {setting.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-body-large font-semibold">
                      {setting.category}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {setting.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => toggleMainCategory(setting.id)}
                  trackColor={{ false: '#E0E0E0', true: '#6366f1' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Subcategories */}
              {setting.enabled && setting.subcategories && (
                <View className="bg-background rounded-lg p-3">
                  {setting.subcategories.map((subcategory, index) => (
                    <View key={subcategory.id}>
                      <View className="flex-row items-center justify-between py-2">
                        <Text className="text-text-primary text-sm font-medium flex-1">
                          {subcategory.name}
                        </Text>
                        <Switch
                          value={subcategory.enabled}
                          onValueChange={() =>
                            toggleSubcategory(setting.id, subcategory.id)
                          }
                          trackColor={{ false: '#E0E0E0', true: '#6366f1' }}
                          thumbColor="#FFFFFF"
                          style={{
                            transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                          }}
                        />
                      </View>
                      {index < (setting.subcategories?.length || 0) - 1 && (
                        <View className="h-px bg-divider" />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {!setting.enabled && (
                <View className="bg-background rounded-lg p-3">
                  <View className="flex-row items-center">
                    <BellOff size={16} color="#757575" />
                    <Text className="text-text-secondary text-sm ml-2">
                      All notifications disabled for this category
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* Delivery Channels */}
        <View className="px-4">
          <Text className="text-text-primary text-lg font-semibold mb-3">
            Delivery Channels
          </Text>

          <Card>
            <Text className="text-text-secondary text-sm mb-4">
              Choose how you want to receive notifications
            </Text>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-text-primary text-body-large">
                  Push Notifications
                </Text>
                <Switch
                  value={deliveryChannels.push}
                  onValueChange={() => toggleDeliveryChannel('push')}
                  trackColor={{ false: '#E0E0E0', true: '#6366f1' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="h-px bg-divider" />

              <View className="flex-row items-center justify-between">
                <Text className="text-text-primary text-body-large">Email</Text>
                <Switch
                  value={deliveryChannels.email}
                  onValueChange={() => toggleDeliveryChannel('email')}
                  trackColor={{ false: '#E0E0E0', true: '#6366f1' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="h-px bg-divider" />

              <View className="flex-row items-center justify-between">
                <Text className="text-text-primary text-body-large">SMS</Text>
                <Switch
                  value={deliveryChannels.sms}
                  onValueChange={() => toggleDeliveryChannel('sms')}
                  trackColor={{ false: '#E0E0E0', true: '#6366f1' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </Card>
        </View>

        {/* Info Card */}
        <View className="px-4 mt-6">
          <Card className="bg-secondary/10 border-secondary/20">
            <Text className="text-secondary text-sm font-medium mb-2">
              🔔 Notification Tips
            </Text>
            <Text className="text-text-secondary text-sm leading-5">
              • Emergency notifications override Do Not Disturb{'\n'}• You can
              customize preferences for each category{'\n'}• Push notifications
              require app permissions{'\n'}• Email/SMS may have additional
              charges
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
