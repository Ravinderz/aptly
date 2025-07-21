import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, Calendar, Users, Zap, Shield, AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import HighlightCard from './ui/HighlightCard';

interface Notice {
  id: string;
  title: string;
  description: string;
  variant: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary';
  date: string;
  category: 'maintenance' | 'community' | 'security' | 'general';
  icon?: React.ReactNode;
}

const NoticeSection = () => {
  // Mock notice data - in production this would come from API
  const notices: Notice[] = [
    {
      id: '1',
      title: 'Water Supply Maintenance',
      description: 'Water supply will be interrupted tomorrow (Jan 20) from 10 AM to 2 PM for tank cleaning. Please store water in advance.',
      variant: 'warning',
      date: '2024-01-19',
      category: 'maintenance',
      icon: <Zap size={16} className="text-warning" />
    },
    {
      id: '2', 
      title: 'Society Meeting This Weekend',
      description: 'Monthly society meeting scheduled for Saturday 6 PM in the community hall. Agenda: Budget discussion and new rules.',
      variant: 'info',
      date: '2024-01-18',
      category: 'community',
      icon: <Users size={16} className="text-primary" />
    },
    {
      id: '3',
      title: 'New Security Guidelines',
      description: 'All visitors must now register via the app. Identity verification is mandatory for entry after 8 PM.',
      variant: 'primary',
      date: '2024-01-17',
      category: 'security',
      icon: <Shield size={16} className="text-primary" />
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance': return 'text-warning';
      case 'community': return 'text-primary';
      case 'security': return 'text-secondary';
      default: return 'text-text-secondary';
    }
  };

  if (notices.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Bell size={20} className="text-primary" />
          <Text className="text-headline-large text-text-primary ml-2">
            Society Notices
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-primary/10 rounded-full px-3 py-1"
          onPress={() => router.push('/(tabs)/notices')}
          activeOpacity={0.7}
        >
          <Text className="text-primary text-label-large font-semibold">View All</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Notice - Large */}
      {notices.length > 0 && (
        <HighlightCard
          title={notices[0].title}
          variant={notices[0].variant}
          size="lg"
          className="mb-4"
        >
          <Text className="text-text-secondary leading-6 mb-3">
            {notices[0].description}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar size={16} className="text-text-secondary" />
              <Text className="text-text-secondary text-body-medium ml-2">
                {formatDate(notices[0].date)}
              </Text>
            </View>
            <View className="flex-row items-center bg-background rounded-full px-3 py-1">
              {notices[0].icon}
              <Text className="text-text-secondary text-body-medium ml-2 capitalize">
                {notices[0].category}
              </Text>
            </View>
          </View>
        </HighlightCard>
      )}

      {/* Additional Notices - Compact */}
      {notices.length > 1 && (
        <View className="space-y-3">
          {notices.slice(1, 3).map((notice) => (
            <HighlightCard
              key={notice.id}
              title={notice.title}
              variant={notice.variant}
              size="sm"
            >
              <Text className="text-text-secondary leading-5 mb-2">
                {notice.description.length > 100 
                  ? `${notice.description.substring(0, 100)}...` 
                  : notice.description
                }
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={16} className="text-text-secondary" />
                  <Text className="text-text-secondary text-label-large ml-1">
                    {formatDate(notice.date)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {notice.icon}
                  <Text className="text-text-secondary text-label-large ml-1 capitalize">
                    {notice.category}
                  </Text>
                </View>
              </View>
            </HighlightCard>
          ))}
        </View>
      )}

      {/* Show more if there are additional notices */}
      {notices.length > 3 && (
        <TouchableOpacity 
          className="mt-4 bg-surface border border-divider rounded-xl p-4 items-center"
          onPress={() => router.push('/(tabs)/notices')}
          activeOpacity={0.7}
        >
          <Text className="text-primary font-medium">
            + {notices.length - 3} more notices
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NoticeSection;