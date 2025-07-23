import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Types
import type { 
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  IntelligentDelivery,
  NotificationChannel,
  NotificationCategory,
  NotificationPriority,
  CampaignStatus
} from '../../types/analytics';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserAvatar } from '../ui/UserAvatar';
import { AlertCard } from '../ui/AlertCard';

interface NotificationManagerProps {
  templates: NotificationTemplate[];
  campaigns: NotificationCampaign[];
  userPreferences: NotificationPreference[];
  intelligentDelivery: IntelligentDelivery[];
  onCreateTemplate: (template: Partial<NotificationTemplate>) => Promise<void>;
  onCreateCampaign: (campaign: Partial<NotificationCampaign>) => Promise<void>;
  onUpdatePreferences: (userId: string, preferences: Partial<NotificationPreference>) => Promise<void>;
  onSendNotification: (campaignId: string) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  templates,
  campaigns,
  userPreferences,
  intelligentDelivery,
  onCreateTemplate,
  onCreateCampaign,
  onUpdatePreferences,
  onSendNotification,
  currentUserId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'preferences' | 'analytics'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<NotificationCampaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [userPrefs, setUserPrefs] = useState<NotificationPreference | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canManageNotifications = userRole === 'admin' || userRole === 'committee_member';
  const canCreateCampaigns = userRole === 'admin';

  // Find current user's preferences
  useEffect(() => {
    const currentUserPrefs = userPreferences.find(prefs => prefs.userId === currentUserId);
    setUserPrefs(currentUserPrefs || null);
  }, [userPreferences, currentUserId]);

  // Campaign analytics
  const campaignAnalytics = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.deliveryStats.sent, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveryStats.delivered, 0);
    const avgOpenRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.engagementMetrics.openRate, 0) / campaigns.length 
      : 0;
    const avgClickRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.engagementMetrics.clickRate, 0) / campaigns.length 
      : 0;

    return {
      activeCampaigns,
      totalSent,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      avgOpenRate,
      avgClickRate,
      completedCampaigns: campaigns.filter(c => c.status === 'completed').length
    };
  }, [campaigns]);

  const handleSendCampaign = async (campaign: NotificationCampaign) => {
    Alert.alert(
      'Send Campaign',
      `Send "${campaign.name}" to ${campaign.recipientCount} recipients?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await onSendNotification(campaign.id);
              Alert.alert('Success', 'Campaign sent successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to send campaign.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const renderCampaignCard = (campaign: NotificationCampaign) => {
    const statusStyle = getStatusStyle(campaign.status);
    const deliveryRate = campaign.deliveryStats.sent > 0 
      ? (campaign.deliveryStats.delivered / campaign.deliveryStats.sent) * 100 
      : 0;

    return (
      <TouchableOpacity
        key={campaign.id}
        onPress={() => setSelectedCampaign(campaign)}
        className="mb-3"
      >
        <Card>
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-body-large font-semibold text-text-primary mb-1">
                  {campaign.name}
                </Text>
                <Text className="text-body-medium text-text-secondary mb-2" numberOfLines={2}>
                  {campaign.description}
                </Text>
                
                <View className="flex-row items-center gap-2">
                  <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                    <Text className={`text-label-small font-medium ${statusStyle.text}`}>
                      {campaign.status.toUpperCase()}
                    </Text>
                  </View>
                  
                  {campaign.isABTest && (
                    <View className="px-2 py-1 rounded-full bg-purple-50">
                      <Text className="text-label-small font-medium text-purple-700">A/B TEST</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View className="items-end">
                <Text className="text-body-small text-text-secondary">
                  {campaign.recipientCount.toLocaleString()} recipients
                </Text>
                {campaign.scheduledAt && (
                  <Text className="text-body-small text-text-secondary">
                    {new Date(campaign.scheduledAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>

            {/* Campaign Metrics */}
            {campaign.status !== 'draft' && (
              <View className="mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-body-small font-medium text-text-primary">Performance</Text>
                  <Text className="text-body-small text-text-secondary">
                    {deliveryRate.toFixed(1)}% delivered
                  </Text>
                </View>
                
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-body-small text-text-secondary">Open Rate</Text>
                    <Text className="text-body-medium font-semibold text-primary">
                      {campaign.engagementMetrics.openRate.toFixed(1)}%
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-body-small text-text-secondary">Click Rate</Text>
                    <Text className="text-body-medium font-semibold text-success">
                      {campaign.engagementMetrics.clickRate.toFixed(1)}%
                    </Text>
                  </View>
                  
                  {campaign.engagementMetrics.conversionRate > 0 && (
                    <View className="flex-1">
                      <Text className="text-body-small text-text-secondary">Conversion</Text>
                      <Text className="text-body-medium font-semibold text-warning">
                        {campaign.engagementMetrics.conversionRate.toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-2">
              {campaign.status === 'draft' && canCreateCampaigns ? (
                <Button
                  title="Send Now"
                  variant="primary"
                  size="small"
                  onPress={() => handleSendCampaign(campaign)}
                  disabled={isProcessing}
                  className="flex-1"
                />
              ) : campaign.status === 'scheduled' ? (
                <View className="flex-1 bg-warning/10 border border-warning/20 rounded-lg p-2">
                  <Text className="text-body-small text-warning text-center">
                    Scheduled
                  </Text>
                </View>
              ) : campaign.status === 'running' ? (
                <View className="flex-1 bg-primary/10 border border-primary/20 rounded-lg p-2">
                  <Text className="text-body-small text-primary text-center">
                    Running
                  </Text>
                </View>
              ) : (
                <Button
                  title="View Report"
                  variant="secondary"
                  size="small"
                  onPress={() => router.push(`/notifications/campaigns/${campaign.id}`)}
                  className="flex-1"
                />
              )}
              
              <Button
                title="Details"
                variant="ghost"
                size="small"
                onPress={() => setSelectedCampaign(campaign)}
                icon="information-circle-outline"
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderTemplateCard = (template: NotificationTemplate) => {
    const categoryStyle = getCategoryStyle(template.category);
    const priorityStyle = getPriorityStyle(template.priority);

    return (
      <TouchableOpacity
        key={template.id}
        onPress={() => setSelectedTemplate(template)}
        className="mb-3"
      >
        <Card>
          <View className="p-4">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <Text className="text-body-large font-semibold text-text-primary mb-1">
                  {template.name}
                </Text>
                <Text className="text-body-medium text-text-secondary mb-2">
                  {template.subject}
                </Text>
                
                <View className="flex-row items-center gap-2">
                  <View className={`px-2 py-1 rounded-full ${categoryStyle.bg}`}>
                    <Text className={`text-label-small font-medium ${categoryStyle.text}`}>
                      {formatCategory(template.category)}
                    </Text>
                  </View>
                  
                  <View className={`px-2 py-1 rounded-full ${priorityStyle.bg}`}>
                    <Text className={`text-label-small font-medium ${priorityStyle.text}`}>
                      {template.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="items-end">
                <View className={`w-3 h-3 rounded-full ${template.isActive ? 'bg-success' : 'bg-gray-400'}`} />
                <Text className="text-body-small text-text-secondary mt-1">
                  {template.channels.length} channel{template.channels.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Template Variables */}
            {template.variables.length > 0 && (
              <View className="mb-2">
                <Text className="text-body-small font-medium text-text-primary mb-1">
                  Variables:
                </Text>
                <View className="flex-row flex-wrap gap-1">
                  {template.variables.slice(0, 3).map((variable) => (
                    <View key={variable.name} className="bg-surface-secondary px-2 py-1 rounded">
                      <Text className="text-label-small text-text-secondary">
                        {variable.name}
                      </Text>
                    </View>
                  ))}
                  {template.variables.length > 3 && (
                    <View className="bg-surface-secondary px-2 py-1 rounded">
                      <Text className="text-label-small text-text-secondary">
                        +{template.variables.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row gap-2">
              {canCreateCampaigns && (
                <Button
                  title="Create Campaign"
                  variant="primary"
                  size="small"
                  onPress={() => router.push(`/notifications/campaigns/create?template=${template.id}`)}
                  className="flex-1"
                />
              )}
              
              <Button
                title="Preview"
                variant="secondary"
                size="small"
                onPress={() => setSelectedTemplate(template)}
                className="flex-1"
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderPreferences = () => {
    if (!userPrefs) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="settings-outline" size={64} color="#9CA3AF" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            No Preferences Set
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Your notification preferences will appear here.
          </Text>
        </View>
      );
    }

    const updateChannelPreference = async (channel: NotificationChannel, enabled: boolean) => {
      const updatedPrefs = {
        ...userPrefs,
        channels: {
          ...userPrefs.channels,
          [channel]: { ...userPrefs.channels[channel], enabled }
        }
      };
      setUserPrefs(updatedPrefs);
      await onUpdatePreferences(currentUserId, updatedPrefs);
    };

    const updateCategoryPreference = async (category: NotificationCategory, enabled: boolean) => {
      const updatedPrefs = {
        ...userPrefs,
        categories: {
          ...userPrefs.categories,
          [category]: { ...userPrefs.categories[category], enabled }
        }
      };
      setUserPrefs(updatedPrefs);
      await onUpdatePreferences(currentUserId, updatedPrefs);
    };

    return (
      <ScrollView className="p-4">
        {/* Channel Preferences */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Delivery Channels
            </Text>
            
            <View className="space-y-3">
              {Object.entries(userPrefs.channels).map(([channel, preference]) => (
                <View key={channel} className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Ionicons 
                      name={getChannelIcon(channel as NotificationChannel)} 
                      size={20} 
                      color="#6B7280" 
                    />
                    <Text className="text-body-medium text-text-primary ml-3">
                      {formatChannel(channel as NotificationChannel)}
                    </Text>
                  </View>
                  <Switch
                    value={preference.enabled}
                    onValueChange={(enabled) => updateChannelPreference(channel as NotificationChannel, enabled)}
                    trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                    thumbColor={preference.enabled ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Category Preferences */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Notification Categories
            </Text>
            
            <View className="space-y-3">
              {Object.entries(userPrefs.categories).map(([category, preference]) => (
                <View key={category} className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-body-medium text-text-primary">
                      {formatCategory(category as NotificationCategory)}
                    </Text>
                    <Text className="text-body-small text-text-secondary">
                      Frequency: {preference.frequency}
                    </Text>
                  </View>
                  <Switch
                    value={preference.enabled}
                    onValueChange={(enabled) => updateCategoryPreference(category as NotificationCategory, enabled)}
                    trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                    thumbColor={preference.enabled ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Quiet Hours */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Quiet Hours
            </Text>
            
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-body-medium text-text-primary">
                Enable Do Not Disturb
              </Text>
              <Switch
                value={userPrefs.quietHours.enabled}
                onValueChange={async (enabled) => {
                  const updatedPrefs = {
                    ...userPrefs,
                    quietHours: { ...userPrefs.quietHours, enabled }
                  };
                  setUserPrefs(updatedPrefs);
                  await onUpdatePreferences(currentUserId, updatedPrefs);
                }}
                trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                thumbColor={userPrefs.quietHours.enabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            
            {userPrefs.quietHours.enabled && (
              <View className="bg-surface-secondary p-3 rounded-lg">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-body-small text-text-secondary">Start Time</Text>
                  <Text className="text-body-small font-medium text-text-primary">
                    {userPrefs.quietHours.startTime}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-body-small text-text-secondary">End Time</Text>
                  <Text className="text-body-small font-medium text-text-primary">
                    {userPrefs.quietHours.endTime}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Privacy & Consent
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-body-medium text-text-primary">
                    Data Processing Consent
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Allow processing of personal data for notifications
                  </Text>
                </View>
                <Switch
                  value={userPrefs.dataProcessingConsent}
                  onValueChange={async (consent) => {
                    const updatedPrefs = { ...userPrefs, dataProcessingConsent: consent };
                    setUserPrefs(updatedPrefs);
                    await onUpdatePreferences(currentUserId, updatedPrefs);
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={userPrefs.dataProcessingConsent ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-body-medium text-text-primary">
                    Analytics Consent
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    Help improve notification performance
                  </Text>
                </View>
                <Switch
                  value={userPrefs.analyticsConsent}
                  onValueChange={async (consent) => {
                    const updatedPrefs = { ...userPrefs, analyticsConsent: consent };
                    setUserPrefs(updatedPrefs);
                    await onUpdatePreferences(currentUserId, updatedPrefs);
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#6366f1' }}
                  thumbColor={userPrefs.analyticsConsent ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  };

  const renderAnalytics = () => (
    <ScrollView className="p-4">
      {/* Overview Stats */}
      <View className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <View className="p-4 items-center">
            <Text className="text-display-small font-bold text-primary">
              {campaignAnalytics.activeCampaigns}
            </Text>
            <Text className="text-body-small text-text-secondary text-center">
              Active Campaigns
            </Text>
          </View>
        </Card>

        <Card>
          <View className="p-4 items-center">
            <Text className="text-display-small font-bold text-success">
              {campaignAnalytics.deliveryRate.toFixed(1)}%
            </Text>
            <Text className="text-body-small text-text-secondary text-center">
              Delivery Rate
            </Text>
          </View>
        </Card>

        <Card>
          <View className="p-4 items-center">
            <Text className="text-display-small font-bold text-warning">
              {campaignAnalytics.avgOpenRate.toFixed(1)}%
            </Text>
            <Text className="text-body-small text-text-secondary text-center">
              Avg Open Rate
            </Text>
          </View>
        </Card>

        <Card>
          <View className="p-4 items-center">
            <Text className="text-display-small font-bold text-text-primary">
              {campaignAnalytics.totalSent.toLocaleString()}
            </Text>
            <Text className="text-body-small text-text-secondary text-center">
              Total Sent
            </Text>
          </View>
        </Card>
      </View>

      {/* Channel Performance */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Channel Performance
          </Text>
          
          {/* Sample channel data - would come from props */}
          {[
            { channel: 'push', openRate: 45.2, clickRate: 12.8, deliveryRate: 98.5 },
            { channel: 'email', openRate: 28.7, clickRate: 8.3, deliveryRate: 94.2 },
            { channel: 'sms', openRate: 92.1, clickRate: 15.6, deliveryRate: 99.8 },
            { channel: 'in_app', openRate: 76.4, clickRate: 22.1, deliveryRate: 100.0 }
          ].map((data) => (
            <View key={data.channel} className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <Ionicons 
                  name={getChannelIcon(data.channel as NotificationChannel)} 
                  size={16} 
                  color="#6B7280" 
                />
                <Text className="text-body-medium text-text-primary ml-3 flex-1">
                  {formatChannel(data.channel as NotificationChannel)}
                </Text>
              </View>
              <View className="flex-row gap-4">
                <Text className="text-body-small text-text-secondary">
                  {data.openRate.toFixed(1)}%
                </Text>
                <Text className="text-body-small text-success">
                  {data.clickRate.toFixed(1)}%
                </Text>
                <Text className="text-body-small text-primary">
                  {data.deliveryRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Intelligent Delivery Insights */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Smart Delivery Insights
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Users with Optimized Timing</Text>
              <Text className="text-body-large font-semibold text-primary">
                {intelligentDelivery.length}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Avg Engagement Improvement</Text>
              <Text className="text-body-large font-semibold text-success">
                +23.4%
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Churn Risk Users Identified</Text>
              <Text className="text-body-large font-semibold text-warning">
                {intelligentDelivery.filter(user => user.churnRisk > 0.7).length}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Recent Campaign Performance */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Recent Campaign Performance
          </Text>
          
          {campaigns
            .filter(c => c.status === 'completed')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map((campaign) => (
              <View key={campaign.id} className="flex-row items-center justify-between py-2 border-b border-border-primary last:border-b-0">
                <View className="flex-1">
                  <Text className="text-body-medium font-medium text-text-primary">
                    {campaign.name}
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    {campaign.recipientCount} recipients • {new Date(campaign.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-body-small text-primary">
                    {campaign.engagementMetrics.openRate.toFixed(1)}% open
                  </Text>
                  <Text className="text-body-small text-success">
                    {campaign.engagementMetrics.clickRate.toFixed(1)}% click
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </Card>
    </ScrollView>
  );

  const renderCreateCampaignButton = () => {
    if (!canCreateCampaigns) return null;

    return (
      <Card className="mb-4">
        <TouchableOpacity 
          onPress={() => router.push('/notifications/campaigns/create')}
          className="p-4 items-center"
        >
          <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
            <Ionicons name="add-circle" size={32} color="#6366f1" />
          </View>
          <Text className="text-headline-small font-medium text-text-primary mb-1">
            Create Campaign
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Send targeted notifications to your community
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Notification Center
        </Text>
        <Text className="text-body-large text-text-secondary">
          Intelligent notification delivery and campaign management
        </Text>
      </View>

      {/* Analytics Banner */}
      {canManageNotifications && (
        <View className="p-4 bg-primary/5 border-b border-border-primary">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-body-large font-semibold text-text-primary">
                {campaignAnalytics.activeCampaigns} Active Campaign{campaignAnalytics.activeCampaigns !== 1 ? 's' : ''}
              </Text>
              <Text className="text-body-small text-text-secondary">
                {campaignAnalytics.avgOpenRate.toFixed(1)}% avg open rate • {campaignAnalytics.deliveryRate.toFixed(1)}% delivery rate
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-display-small font-bold text-primary">
                {campaignAnalytics.totalSent.toLocaleString()}
              </Text>
              <Text className="text-body-small text-text-secondary">Total sent</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'campaigns', label: 'Campaigns', icon: 'megaphone-outline', count: campaigns.filter(c => c.status === 'running').length },
          { key: 'templates', label: 'Templates', icon: 'document-outline', count: templates.filter(t => t.isActive).length },
          { key: 'preferences', label: 'Preferences', icon: 'settings-outline' },
          { key: 'analytics', label: 'Analytics', icon: 'analytics-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center relative">
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#6366f1' : '#6B7280'} 
              />
              <Text className={`text-body-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
              {tab.count && tab.count > 0 && (
                <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                  <Text className="text-white text-xs font-medium">
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {activeTab === 'campaigns' && (
          <ScrollView className="p-4">
            {renderCreateCampaignButton()}
            
            {campaigns.length > 0 ? (
              campaigns
                .sort((a, b) => {
                  // Sort by status priority, then by date
                  const statusPriority = { running: 0, scheduled: 1, draft: 2, completed: 3, cancelled: 4 };
                  const aPriority = statusPriority[a.status] || 5;
                  const bPriority = statusPriority[b.status] || 5;
                  
                  if (aPriority !== bPriority) return aPriority - bPriority;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .map(renderCampaignCard)
            ) : (
              <View className="items-center py-8">
                <Ionicons name="megaphone-outline" size={48} color="#9CA3AF" />
                <Text className="text-headline-small text-text-secondary mt-4 mb-2">
                  No Campaigns Yet
                </Text>
                <Text className="text-body-medium text-text-secondary text-center">
                  Create your first notification campaign to engage your community.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'templates' && (
          <ScrollView className="p-4">
            {canManageNotifications && (
              <Card className="mb-4">
                <TouchableOpacity 
                  onPress={() => router.push('/notifications/templates/create')}
                  className="p-4 items-center"
                >
                  <View className="w-16 h-16 bg-success/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="add-circle" size={32} color="#10B981" />
                  </View>
                  <Text className="text-headline-small font-medium text-text-primary mb-1">
                    Create Template
                  </Text>
                  <Text className="text-body-medium text-text-secondary text-center">
                    Design reusable notification templates
                  </Text>
                </TouchableOpacity>
              </Card>
            )}
            
            {templates.length > 0 ? (
              templates
                .filter(t => t.isActive || canManageNotifications)
                .map(renderTemplateCard)
            ) : (
              <View className="items-center py-8">
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text className="text-headline-small text-text-secondary mt-4 mb-2">
                  No Templates Available
                </Text>
                <Text className="text-body-medium text-text-secondary text-center">
                  Notification templates will appear here.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'analytics' && canManageNotifications && renderAnalytics()}
      </View>
    </View>
  );
};

// Helper functions
const getStatusStyle = (status: CampaignStatus) => {
  const styles = {
    draft: { bg: 'bg-gray-50', text: 'text-gray-700' },
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700' },
    running: { bg: 'bg-green-50', text: 'text-green-700' },
    paused: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    completed: { bg: 'bg-purple-50', text: 'text-purple-700' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700' }
  };
  return styles[status] || styles.draft;
};

const getCategoryStyle = (category: NotificationCategory) => {
  const styles = {
    maintenance: { bg: 'bg-orange-50', text: 'text-orange-700' },
    billing: { bg: 'bg-green-50', text: 'text-green-700' },
    visitor: { bg: 'bg-blue-50', text: 'text-blue-700' },
    emergency: { bg: 'bg-red-50', text: 'text-red-700' },
    community: { bg: 'bg-purple-50', text: 'text-purple-700' },
    governance: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    system: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[category] || styles.system;
};

const getPriorityStyle = (priority: NotificationPriority) => {
  const styles = {
    critical: { bg: 'bg-red-50', text: 'text-red-700' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700' },
    normal: { bg: 'bg-blue-50', text: 'text-blue-700' },
    low: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[priority] || styles.normal;
};

const getChannelIcon = (channel: NotificationChannel) => {
  const icons = {
    push: 'notifications-outline',
    email: 'mail-outline',
    sms: 'chatbox-outline',
    in_app: 'phone-portrait-outline',
    whatsapp: 'logo-whatsapp'
  };
  return icons[channel] || 'notifications-outline';
};

const formatChannel = (channel: NotificationChannel): string => {
  const names = {
    push: 'Push Notifications',
    email: 'Email',
    sms: 'SMS',
    in_app: 'In-App',
    whatsapp: 'WhatsApp'
  };
  return names[channel] || channel;
};

const formatCategory = (category: NotificationCategory): string => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default NotificationManager;