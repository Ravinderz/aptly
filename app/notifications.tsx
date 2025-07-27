import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Bell, 
  Check, 
  Clock, 
  Settings,
  Trash2,
  MoreHorizontal
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer, ResponsiveCard, ResponsiveRow, ResponsiveText } from '@/components/ui/ResponsiveContainer';
import { safeGoBack } from '@/utils/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'maintenance' | 'billing' | 'security' | 'community' | 'emergency';
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionType?: 'approve' | 'view' | 'pay' | 'none';
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Visitor Approval Required',
    message: 'Rajesh Kumar wants to visit you today at 3:30 PM. Please approve or decline this request.',
    category: 'security',
    timestamp: '2024-01-15T09:30:00Z',
    isRead: false,
    priority: 'high',
    actionType: 'approve',
  },
  {
    id: '2',
    title: 'Maintenance Bill Generated',
    message: 'Your January maintenance bill of ₹5,420 has been generated. Due date: 31st January.',
    category: 'billing',
    timestamp: '2024-01-14T18:00:00Z',
    isRead: false,
    priority: 'medium',
    actionType: 'pay',
    actionUrl: '/(tabs)/services/billing'
  },
  {
    id: '3',
    title: 'Water Supply Interruption',
    message: 'Water supply will be interrupted tomorrow (16th Jan) from 10 AM to 2 PM for tank cleaning.',
    category: 'maintenance',
    timestamp: '2024-01-14T16:45:00Z',
    isRead: false,
    priority: 'medium',
    actionType: 'view'
  },
  {
    id: '4',
    title: 'Community Event: Holi Celebration',
    message: 'Join us for Holi celebration on 25th March at the clubhouse. Registration required.',
    category: 'community',
    timestamp: '2024-01-14T14:20:00Z',
    isRead: true,
    priority: 'low',
    actionType: 'view'
  },
  {
    id: '5',
    title: 'Gym Booking Confirmed',
    message: 'Your gym slot for tomorrow 7-8 AM has been confirmed. Please arrive on time.',
    category: 'community',
    timestamp: '2024-01-14T12:15:00Z',
    isRead: true,
    priority: 'low',
    actionType: 'none'
  }
];

const getCategoryColor = (category: Notification['category']) => {
  const colors = {
    maintenance: '#FF9800',
    billing: '#2196F3',
    security: '#F44336',
    community: '#4CAF50',
    emergency: '#E91E63'
  };
  return colors[category];
};

const getCategoryIcon = (category: Notification['category']) => {
  switch (category) {
    case 'maintenance': return '🔧';
    case 'billing': return '💳';
    case 'security': return '🔒';
    case 'community': return '🎉';
    case 'emergency': return '🚨';
    default: return '📱';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    } else if (notification.actionType === 'approve') {
      // Handle visitor approval
      console.log('Navigate to visitor approval');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-divider bg-surface">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => safeGoBack('/(tabs)')}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} color="#6366f1" />
          </Button>
          <Bell size={20} color="#6366f1" />
          <Text className="text-text-primary text-headline-large font-semibold ml-3">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View className="bg-error rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings/notifications')}
          className="p-2"
        >
          <Settings size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Filter and Actions */}
      <View className="flex-row items-center justify-between px-6 py-3 bg-surface border-b border-divider">
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-3 py-1 rounded-full ${
              filter === 'all' ? 'bg-primary' : 'bg-background border border-divider'
            }`}
          >
            <Text className={`text-sm font-medium ${
              filter === 'all' ? 'text-white' : 'text-text-secondary'
            }`}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full ${
              filter === 'unread' ? 'bg-primary' : 'bg-background border border-divider'
            }`}
          >
            <Text className={`text-sm font-medium ${
              filter === 'unread' ? 'text-white' : 'text-text-secondary'
            }`}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            className="flex-row items-center"
          >
            <Check size={16} color="#6366f1" />
            <Text className="text-primary text-sm font-medium ml-1">
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Bell size={48} color="#D1D5DB" />
            <Text className="text-text-secondary text-headline-medium font-medium mt-4 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </Text>
            <Text className="text-text-secondary text-body-medium text-center">
              {filter === 'unread' 
                ? 'All caught up! Check back later for new updates.'
                : 'When you have notifications, they\'ll appear here.'
              }
            </Text>
          </View>
        ) : (
          <View className="p-4 space-y-3">
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <Card className={`${!notification.isRead ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <View className="flex-row items-start p-4">
                    {/* Category Icon */}
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${getCategoryColor(notification.category)}20` }}
                    >
                      <Text className="text-lg">
                        {getCategoryIcon(notification.category)}
                      </Text>
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between mb-1">
                        <Text className={`text-body-large font-semibold flex-1 pr-2 ${
                          !notification.isRead ? 'text-text-primary' : 'text-text-secondary'
                        }`}>
                          {notification.title}
                        </Text>
                        
                        <View className="flex-row items-center">
                          {!notification.isRead && (
                            <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                          )}
                          <Text className="text-text-secondary text-xs">
                            {formatTimestamp(notification.timestamp)}
                          </Text>
                        </View>
                      </View>
                      
                      <Text className="text-text-secondary text-body-medium leading-5 mb-3">
                        {notification.message}
                      </Text>

                      {/* Action Buttons */}
                      {notification.actionType !== 'none' && (
                        <View className="flex-row gap-2">
                          {notification.actionType === 'approve' && (
                            <>
                              <Button size="sm" variant="primary" className="flex-1">
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                Decline
                              </Button>
                            </>
                          )}
                          {notification.actionType === 'pay' && (
                            <Button size="sm" variant="primary">
                              Pay Now
                            </Button>
                          )}
                          {notification.actionType === 'view' && (
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Actions Menu */}
                    <TouchableOpacity
                      onPress={() => deleteNotification(notification.id)}
                      className="p-2 ml-2"
                    >
                      <Trash2 size={16} color="#757575" />
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}