import AptlySearchBar from '@/components/ui/AptlySearchBar';
import { Card } from '@/components/ui/Card';
import { StackHeader } from '@/components/ui/headers';
import { Bell } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Notice {
  id: string;
  title: string;
  description: string;
  variant: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary';
  date: string;
  category: 'maintenance' | 'community' | 'security' | 'general';
  icon?: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  author: string;
  isRead: boolean;
}

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Notices' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'community', label: 'Community' },
  { key: 'security', label: 'Security' },
  { key: 'general', label: 'General' },
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, selectedFilter, searchQuery, filterNotices]);

  const loadNotices = async () => {
    try {
      // In production, this would be an API call
      const mockNotices: Notice[] = [
        {
          id: '1',
          title: 'Water Supply Maintenance',
          description:
            'Water supply will be interrupted tomorrow (Jan 20) from 10 AM to 2 PM for tank cleaning. Please store water in advance. The maintenance team will be cleaning the overhead tank and checking all pump connections.',
          variant: 'warning',
          date: '2024-01-19',
          category: 'maintenance',
          priority: 'high',
          author: 'Building Management',
          isRead: false,
        },
        {
          id: '2',
          title: 'Society Meeting This Weekend',
          description:
            'Monthly society meeting scheduled for Saturday 6 PM in the community hall. Agenda includes budget discussion, new security rules, festival celebration plans, and maintenance schedule updates.',
          variant: 'info',
          date: '2024-01-18',
          category: 'community',
          priority: 'medium',
          author: 'Society Committee',
          isRead: true,
        },
        {
          id: '3',
          title: 'New Security Guidelines',
          description:
            'All visitors must now register via the app. Identity verification is mandatory for entry after 8 PM. Security guards will strictly follow the new protocol.',
          variant: 'primary',
          date: '2024-01-17',
          category: 'security',
          priority: 'high',
          author: 'Security Team',
          isRead: false,
        },
        {
          id: '4',
          title: 'Holi Celebration 2024',
          description:
            'Join us for Holi celebrations on March 25th at the community garden. Colors, sweets, and music will be arranged. Contact organizing committee for volunteer opportunities.',
          variant: 'success',
          date: '2024-01-16',
          category: 'community',
          priority: 'low',
          author: 'Cultural Committee',
          isRead: true,
        },
        {
          id: '5',
          title: 'Lift Maintenance Schedule',
          description:
            'Lift #2 will be under maintenance from Jan 22-24. Please use Lift #1 or stairs during this period. Sorry for the inconvenience.',
          variant: 'warning',
          date: '2024-01-15',
          category: 'maintenance',
          priority: 'medium',
          author: 'Maintenance Team',
          isRead: false,
        },
        {
          id: '6',
          title: 'New Parking Rules',
          description:
            'Updated parking guidelines effective from Feb 1st. Two-wheelers should be parked in designated areas only. Violation fine: ₹200.',
          variant: 'info',
          date: '2024-01-14',
          category: 'general',
          priority: 'medium',
          author: 'Society Committee',
          isRead: true,
        },
      ];

      setNotices(mockNotices);
    } catch (error) {
      console.error('Error loading notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotices = () => {
    let filtered = notices;

    // Filter by category
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(
        (notice) => notice.category === selectedFilter,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(query) ||
          notice.description.toLowerCase().includes(query) ||
          notice.category.toLowerCase().includes(query),
      );
    }

    // Sort by date (newest first) and priority
    filtered.sort((a, b) => {
      const dateComparison =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setFilteredNotices(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#D32F2F';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const markAsRead = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((notice) =>
        notice.id === noticeId ? { ...notice, isRead: true } : notice,
      ),
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StackHeader
        title="All Notices"
        subtitle="Society announcements and updates"
        showBackButton={true}
        contentSpacing={false}
        actions={[
          {
            icon: Bell,
            onPress: () => console.log('Filter notices'),
          },
        ]}
      />

      {/* Search Bar */}
      <View className="p-4 pb-2">
        <AptlySearchBar
          placeholder="Search notices..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Filter Pills */}
      <View className="px-4 pb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}>
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedFilter === filter.key
                  ? 'bg-primary border-primary'
                  : 'bg-surface border-divider'
              }`}
              activeOpacity={0.7}>
              <Text
                className={`text-sm font-medium ${
                  selectedFilter === filter.key
                    ? 'text-white'
                    : 'text-text-primary'
                }`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notices List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-text-secondary">Loading notices...</Text>
          </View>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              onPress={() => markAsRead(notice.id)}
              activeOpacity={0.8}
              className="mb-4">
              <Card
                className={`${!notice.isRead ? 'border-primary border-2' : ''}`}>
                {/* Unread indicator */}
                {!notice.isRead && (
                  <View className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full" />
                )}

                {/* Priority indicator */}
                <View
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: getPriorityColor(notice.priority) }}
                />

                <View className="ml-2">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-4">
                      <Text
                        className={`text-body-large font-semibold ${
                          !notice.isRead
                            ? 'text-text-primary'
                            : 'text-text-secondary'
                        }`}>
                        {notice.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-text-secondary text-label-small capitalize mr-3">
                          {notice.category}
                        </Text>
                        <Text className="text-text-secondary text-label-small">
                          {notice.author}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-text-secondary text-label-small">
                        {formatDate(notice.date)}
                      </Text>
                      <View
                        className="mt-1 px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getPriorityColor(
                            notice.priority,
                          )}20`,
                        }}>
                        <Text
                          className="text-xs font-medium capitalize"
                          style={{ color: getPriorityColor(notice.priority) }}>
                          {notice.priority}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <Text className="text-text-secondary text-body-medium leading-5">
                    {notice.description}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Bell size={48} color="#757575" />
            <Text className="text-text-primary text-headline-small font-semibold mt-4 mb-2">
              No Notices Found
            </Text>
            <Text className="text-text-secondary text-center px-8">
              {searchQuery.trim()
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no notices in this category.'}
            </Text>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
