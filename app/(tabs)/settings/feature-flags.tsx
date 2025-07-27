/**
 * Feature Flag Settings Screen
 * 
 * Allows users and admins to control which features are enabled in the app.
 * Provides organized grouping and detailed descriptions for each feature.
 */

import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Settings, Eye, EyeOff, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer, ResponsiveCard, ResponsiveRow, ResponsiveText } from '@/components/ui/ResponsiveContainer';
import { useFeatureFlags, FeatureGroup } from '@/contexts/FeatureFlagContext';
import { FEATURE_FLAG_METADATA, getFeaturesByGroup, applyFeatureFlagPreset } from '@/utils/featureFlags';

interface FeatureGroupSectionProps {
  group: FeatureGroup;
  expanded: boolean;
  onToggleExpanded: () => void;
}

const FeatureGroupSection: React.FC<FeatureGroupSectionProps> = ({
  group,
  expanded,
  onToggleExpanded,
}) => {
  const { flags, isFeatureEnabled, enableFeature, disableFeature } = useFeatureFlags();
  const features = getFeaturesByGroup(group);

  const groupTitles = {
    analytics: 'Analytics & Reporting',
    governance: 'Governance & Voting',
    community: 'Community Features',
    billing: 'Billing & Payments',
    maintenance: 'Maintenance & Services',
    visitor: 'Visitor Management',
    admin: 'Admin Features',
    notifications: 'Notifications',
    advanced: 'Advanced Features',
    experimental: 'Experimental Features',
    regional: 'Regional Features',
  };

  const groupDescriptions = {
    analytics: 'Data insights and performance tracking',
    governance: 'Society governance and decision making',
    community: 'Social features and community interaction',
    billing: 'Payment processing and financial management',
    maintenance: 'Service requests and vendor management',
    visitor: 'Guest access and security features',
    admin: 'Administrative controls and management',
    notifications: 'Alert and notification systems',
    advanced: 'Power user and technical features',
    experimental: 'Beta features under development',
    regional: 'Location-specific features and compliance',
  };

  const groupIcons = {
    analytics: '📊',
    governance: '🗳️',
    community: '👥',
    billing: '💳',
    maintenance: '🔧',
    visitor: '🚪',
    admin: '⚙️',
    notifications: '🔔',
    advanced: '🚀',
    experimental: '🧪',
    regional: '🌍',
  };

  const enabledCount = features.filter(feature => isFeatureEnabled(feature)).length;
  const totalCount = features.length;

  return (
    <ResponsiveCard className="mb-4">
      <TouchableOpacity onPress={onToggleExpanded}>
        <ResponsiveRow justify="between" align="center" className="p-4">
          <ResponsiveRow align="center" gap="md">
            <Text className="text-2xl">{groupIcons[group]}</Text>
            <View>
              <ResponsiveText variant="headline" size="small" className="font-semibold">
                {groupTitles[group]}
              </ResponsiveText>
              <ResponsiveText variant="body" size="small" className="text-text-secondary">
                {groupDescriptions[group]}
              </ResponsiveText>
            </View>
          </ResponsiveRow>
          <ResponsiveRow align="center" gap="sm">
            <View className="bg-primary/10 rounded-full px-3 py-1">
              <ResponsiveText variant="label" size="small" className="text-primary font-medium">
                {enabledCount}/{totalCount}
              </ResponsiveText>
            </View>
            {expanded ? <EyeOff size={20} color="#6366f1" /> : <Eye size={20} color="#6366f1" />}
          </ResponsiveRow>
        </ResponsiveRow>
      </TouchableOpacity>

      {expanded && (
        <View className="px-4 pb-4 space-y-3">
          {features.map((feature) => {
            const metadata = FEATURE_FLAG_METADATA[feature];
            const isEnabled = isFeatureEnabled(feature);
            
            return (
              <View key={feature} className="bg-background rounded-xl p-4">
                <ResponsiveRow justify="between" align="center" className="mb-2">
                  <View className="flex-1 mr-4">
                    <ResponsiveText variant="body" size="medium" className="font-medium">
                      {metadata.name}
                    </ResponsiveText>
                    <ResponsiveText variant="body" size="small" className="text-text-secondary">
                      {metadata.description}
                    </ResponsiveText>
                    
                    {/* Feature metadata badges */}
                    <ResponsiveRow gap="sm" className="mt-2">
                      {metadata.requiredPermissions && (
                        <View className="bg-warning/10 rounded-full px-2 py-1">
                          <ResponsiveText variant="label" size="small" className="text-warning">
                            Requires Permissions
                          </ResponsiveText>
                        </View>
                      )}
                      {metadata.dependencies && (
                        <View className="bg-blue-500/10 rounded-full px-2 py-1">
                          <ResponsiveText variant="label" size="small" className="text-blue-700">
                            Has Dependencies
                          </ResponsiveText>
                        </View>
                      )}
                      {metadata.environments && !metadata.environments.includes('production') && (
                        <View className="bg-orange-500/10 rounded-full px-2 py-1">
                          <ResponsiveText variant="label" size="small" className="text-orange-700">
                            Dev/Staging Only
                          </ResponsiveText>
                        </View>
                      )}
                      {metadata.rolloutPercentage && metadata.rolloutPercentage < 100 && (
                        <View className="bg-purple-500/10 rounded-full px-2 py-1">
                          <ResponsiveText variant="label" size="small" className="text-purple-700">
                            {metadata.rolloutPercentage}% Rollout
                          </ResponsiveText>
                        </View>
                      )}
                    </ResponsiveRow>
                  </View>
                  
                  <Switch
                    value={isEnabled}
                    onValueChange={(value) => {
                      if (value) {
                        enableFeature(feature);
                      } else {
                        disableFeature(feature);
                      }
                    }}
                    trackColor={{ false: '#E5E7EB', true: '#6366f1' }}
                    thumbColor={isEnabled ? '#FFFFFF' : '#F3F4F6'}
                  />
                </ResponsiveRow>
              </View>
            );
          })}
        </View>
      )}
    </ResponsiveCard>
  );
};

export default function FeatureFlagSettings() {
  const router = useRouter();
  const { flags, updateFlags, resetToDefaults, isLoading } = useFeatureFlags();
  const [expandedGroups, setExpandedGroups] = useState<Set<FeatureGroup>>(new Set(['billing', 'maintenance']));
  const [showAdvanced, setShowAdvanced] = useState(__DEV__);

  const toggleGroupExpanded = (group: FeatureGroup) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAllGroups = () => {
    const allGroups: FeatureGroup[] = ['analytics', 'governance', 'community', 'billing', 'maintenance', 'visitor', 'admin', 'notifications', 'advanced', 'experimental', 'regional'];
    setExpandedGroups(new Set(allGroups));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const applyPreset = (presetName: 'resident' | 'admin' | 'developer') => {
    Alert.alert(
      'Apply Feature Preset',
      `This will update your feature flags to the ${presetName} preset. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            const preset = applyFeatureFlagPreset(presetName);
            await updateFlags(preset);
          },
        },
      ]
    );
  };

  const resetFlags = () => {
    Alert.alert(
      'Reset Feature Flags',
      'This will reset all feature flags to their default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
  };

  const visibleGroups: FeatureGroup[] = showAdvanced 
    ? ['analytics', 'governance', 'community', 'billing', 'maintenance', 'visitor', 'admin', 'notifications', 'advanced', 'experimental', 'regional']
    : ['billing', 'maintenance', 'visitor', 'community', 'notifications'];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ResponsiveContainer type="flex" centerContent>
          <ResponsiveText variant="body" size="medium" className="text-text-secondary">
            Loading feature flags...
          </ResponsiveText>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <Settings size={24} color="#6366f1" />
        <ResponsiveText variant="headline" size="large" className="font-semibold ml-3">
          Feature Settings
        </ResponsiveText>
      </View>

      <ResponsiveContainer type="scroll" padding="md" gap="md">
        {/* Control Panel */}
        <ResponsiveCard>
          <View className="p-4 space-y-4">
            <ResponsiveText variant="headline" size="medium" className="font-semibold">
              Quick Actions
            </ResponsiveText>
            
            {/* View Controls */}
            <ResponsiveRow gap="md">
              <Button
                variant="outline"
                size="sm"
                onPress={expandAllGroups}
                className="flex-1"
              >
                <Text className="text-primary">Expand All</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={collapseAllGroups}
                className="flex-1"
              >
                <Text className="text-primary">Collapse All</Text>
              </Button>
            </ResponsiveRow>

            {/* Advanced Toggle */}
            <ResponsiveRow justify="between" align="center">
              <View>
                <ResponsiveText variant="body" size="medium" className="font-medium">
                  Show Advanced Features
                </ResponsiveText>
                <ResponsiveText variant="body" size="small" className="text-text-secondary">
                  Include admin, experimental, and developer features
                </ResponsiveText>
              </View>
              <Switch
                value={showAdvanced}
                onValueChange={setShowAdvanced}
                trackColor={{ false: '#E5E7EB', true: '#6366f1' }}
                thumbColor={showAdvanced ? '#FFFFFF' : '#F3F4F6'}
              />
            </ResponsiveRow>

            {/* Presets */}
            {showAdvanced && (
              <View className="space-y-2">
                <ResponsiveText variant="body" size="medium" className="font-medium">
                  Feature Presets
                </ResponsiveText>
                <ResponsiveRow gap="sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => applyPreset('resident')}
                    className="flex-1"
                  >
                    <Text className="text-primary text-xs">Resident</Text>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => applyPreset('admin')}
                    className="flex-1"
                  >
                    <Text className="text-primary text-xs">Admin</Text>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => applyPreset('developer')}
                    className="flex-1"
                  >
                    <Text className="text-primary text-xs">Developer</Text>
                  </Button>
                </ResponsiveRow>
              </View>
            )}

            {/* Reset */}
            <Button
              variant="outline"
              onPress={resetFlags}
              className="items-center"
            >
              <ResponsiveRow align="center" gap="sm">
                <RotateCcw size={16} color="#6366f1" />
                <Text className="text-primary">Reset to Defaults</Text>
              </ResponsiveRow>
            </Button>
          </View>
        </ResponsiveCard>

        {/* Feature Groups */}
        <View className="space-y-2">
          <ResponsiveText variant="headline" size="medium" className="font-semibold">
            Feature Categories
          </ResponsiveText>
          
          {visibleGroups.map((group) => (
            <FeatureGroupSection
              key={group}
              group={group}
              expanded={expandedGroups.has(group)}
              onToggleExpanded={() => toggleGroupExpanded(group)}
            />
          ))}
        </View>

        {/* Debug Info (Dev Only) */}
        {__DEV__ && (
          <ResponsiveCard>
            <View className="p-4">
              <ResponsiveText variant="headline" size="medium" className="font-semibold mb-2">
                Debug Information
              </ResponsiveText>
              <ResponsiveText variant="body" size="small" className="text-text-secondary font-mono">
                Total Features: {Object.keys(flags).length}
              </ResponsiveText>
              <ResponsiveText variant="body" size="small" className="text-text-secondary font-mono">
                Enabled: {Object.values(flags).filter(Boolean).length}
              </ResponsiveText>
              <ResponsiveText variant="body" size="small" className="text-text-secondary font-mono">
                Environment: {__DEV__ ? 'development' : 'production'}
              </ResponsiveText>
            </View>
          </ResponsiveCard>
        )}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}