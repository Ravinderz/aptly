import { APIService } from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'bill' | 'maintenance' | 'community' | 'governance' | 'security' | 'announcement' | 'reminder';
  category: 'info' | 'warning' | 'success' | 'error' | 'urgent';
  isRead: boolean;
  data?: any; // Additional data for navigation or actions
  actionUrl?: string; // Deep link or navigation route
  imageUrl?: string;
  sound?: 'default' | 'custom' | 'silent';
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: Date; // For scheduled notifications
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
  userId: string;
  senderId?: string;
  senderName?: string;
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  categories: {
    bills: boolean;
    maintenance: boolean;
    community: boolean;
    governance: boolean;
    security: boolean;
    announcements: boolean;
    reminders: boolean;
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  frequency: {
    immediate: boolean;
    digest: boolean; // Daily digest
    digestTime: string; // HH:mm format
  };
  updatedAt: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  last7Days: { date: string; count: number }[];
}

export interface PushTokenInfo {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  userId: string;
  isActive: boolean;
  lastUpdated: Date;
}

// Mock data
let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    title: 'Electricity Bill Due Tomorrow',
    body: 'Your BESCOM electricity bill of ₹2,450.50 is due tomorrow. Pay now to avoid late fees.',
    type: 'bill',
    category: 'warning',
    isRead: false,
    data: { billId: 'bill1', amount: 2450.50 },
    actionUrl: '/services/billing/bill1',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    userId: 'user1',
    senderId: 'system',
    senderName: 'Aptly System'
  },
  {
    id: 'notif2',
    title: 'New Community Post',
    body: 'Neha Gupta posted about Holi celebration planning. Join the discussion!',
    type: 'community',
    category: 'info',
    isRead: false,
    data: { postId: 'post4', userId: 'user4' },
    actionUrl: '/community/post4',
    priority: 'normal',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    userId: 'user1',
    senderId: 'user4',
    senderName: 'Neha Gupta'
  },
  {
    id: 'notif3',
    title: 'Water Supply Maintenance',
    body: 'Water supply will be interrupted on Saturday from 10 AM to 4 PM. Please store water in advance.',
    type: 'announcement',
    category: 'warning',
    isRead: true,
    data: { announcementId: 'announcement1' },
    actionUrl: '/notices',
    priority: 'high',
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    userId: 'user1',
    senderId: 'user5',
    senderName: 'Society Admin'
  },
  {
    id: 'notif4',
    title: 'Voting Reminder',
    body: 'Don\'t forget to vote on the Solar Panel installation proposal. Voting ends in 3 days.',
    type: 'governance',
    category: 'info',
    isRead: false,
    data: { proposalId: 'proposal1' },
    actionUrl: '/services/governance',
    priority: 'normal',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    userId: 'user1',
    senderId: 'system',
    senderName: 'Governance System'
  },
  {
    id: 'notif5',
    title: 'Maintenance Request Update',
    body: 'Your lift maintenance request has been assigned to our technician and will be resolved by tomorrow.',
    type: 'maintenance',
    category: 'success',
    isRead: true,
    data: { requestId: 'request123' },
    actionUrl: '/services/maintenance/request123',
    priority: 'normal',
    readAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    userId: 'user1',
    senderId: 'system',
    senderName: 'Maintenance Team'
  }
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: 'user1',
  enabled: true,
  categories: {
    bills: true,
    maintenance: true,
    community: true,
    governance: true,
    security: true,
    announcements: true,
    reminders: true
  },
  channels: {
    push: true,
    email: true,
    sms: false,
    inApp: true
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00'
  },
  frequency: {
    immediate: true,
    digest: false,
    digestTime: '08:00'
  },
  updatedAt: new Date()
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class NotificationService {
  private static instance: NotificationService;
  private apiService: APIService;
  private preferences: NotificationPreferences | null = null;

  private constructor() {
    this.apiService = APIService.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Get all notifications for user
  async getNotifications(
    userId: string, 
    filters?: { 
      type?: string; 
      category?: string; 
      isRead?: boolean; 
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    await delay(400);
    
    try {
      let notifications = MOCK_NOTIFICATIONS.filter(n => n.userId === userId);
      
      // Apply filters
      if (filters?.type) {
        notifications = notifications.filter(n => n.type === filters.type);
      }
      
      if (filters?.category) {
        notifications = notifications.filter(n => n.category === filters.category);
      }
      
      if (filters?.isRead !== undefined) {
        notifications = notifications.filter(n => n.isRead === filters.isRead);
      }
      
      // Sort by creation date (newest first)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Apply pagination
      if (filters?.offset !== undefined) {
        notifications = notifications.slice(filters.offset);
      }
      
      if (filters?.limit !== undefined) {
        notifications = notifications.slice(0, filters.limit);
      }
      
      return notifications;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    await delay(200);
    
    try {
      const notification = MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date();
        return true;
      }
      return false;
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    await delay(300);
    
    try {
      let updatedCount = 0;
      notificationIds.forEach(id => {
        const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date();
          updatedCount++;
        }
      });
      return updatedCount;
    } catch (error) {
      throw new Error('Failed to mark notifications as read');
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<number> {
    await delay(500);
    
    try {
      let updatedCount = 0;
      MOCK_NOTIFICATIONS.forEach(notification => {
        if (notification.userId === userId && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date();
          updatedCount++;
        }
      });
      return updatedCount;
    } catch (error) {
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    await delay(250);
    
    try {
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        MOCK_NOTIFICATIONS.splice(index, 1);
        return true;
      }
      return false;
    } catch (error) {
      throw new Error('Failed to delete notification');
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    await delay(300);
    
    try {
      const userNotifications = MOCK_NOTIFICATIONS.filter(n => n.userId === userId);
      const unread = userNotifications.filter(n => !n.isRead);
      
      // Count by type
      const byType: Record<string, number> = {};
      userNotifications.forEach(n => {
        byType[n.type] = (byType[n.type] || 0) + 1;
      });
      
      // Count by category
      const byCategory: Record<string, number> = {};
      userNotifications.forEach(n => {
        byCategory[n.category] = (byCategory[n.category] || 0) + 1;
      });
      
      // Last 7 days data
      const last7Days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = userNotifications.filter(n => {
          const nDate = n.createdAt.toISOString().split('T')[0];
          return nDate === dateStr;
        }).length;
        
        last7Days.push({ date: dateStr, count });
      }
      
      return {
        total: userNotifications.length,
        unread: unread.length,
        byType,
        byCategory,
        last7Days
      };
    } catch (error) {
      throw new Error('Failed to fetch notification statistics');
    }
  }

  // Send notification (for admin/system use)
  async sendNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    await delay(600);
    
    try {
      const newNotification: Notification = {
        ...notificationData,
        id: `notif_${Date.now()}`,
        createdAt: new Date(),
        isRead: false
      };
      
      // Check user preferences
      const preferences = await this.getUserPreferences(notificationData.userId);
      if (!this.shouldSendNotification(newNotification, preferences)) {
        throw new Error('Notification blocked by user preferences');
      }
      
      MOCK_NOTIFICATIONS.unshift(newNotification);
      
      // In production, this would trigger push notification, email, etc.
      this.triggerPushNotification(newNotification);
      
      return newNotification;
    } catch (error) {
      throw new Error('Failed to send notification');
    }
  }

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    if (this.preferences && this.preferences.userId === userId) {
      return this.preferences;
    }
    
    await delay(200);
    
    try {
      // In production, fetch from API or local storage
      const stored = await AsyncStorage.getItem(`notification_preferences_${userId}`);
      if (stored) {
        this.preferences = JSON.parse(stored);
        return this.preferences!;
      }
      
      // Return default preferences
      this.preferences = { ...DEFAULT_PREFERENCES, userId };
      return this.preferences;
    } catch (error) {
      throw new Error('Failed to fetch notification preferences');
    }
  }

  // Update user notification preferences
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    await delay(400);
    
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences,
        userId,
        updatedAt: new Date()
      };
      
      // Store locally
      await AsyncStorage.setItem(
        `notification_preferences_${userId}`, 
        JSON.stringify(updatedPreferences)
      );
      
      this.preferences = updatedPreferences;
      
      // In production, sync with backend
      // await this.apiService.updateNotificationPreferences(updatedPreferences);
      
      return updatedPreferences;
    } catch (error) {
      throw new Error('Failed to update notification preferences');
    }
  }

  // Register push token
  async registerPushToken(tokenInfo: Omit<PushTokenInfo, 'lastUpdated'>): Promise<boolean> {
    await delay(300);
    
    try {
      // In production, this would register the token with the backend
      const tokenData = {
        ...tokenInfo,
        lastUpdated: new Date()
      };
      
      await AsyncStorage.setItem(`push_token_${tokenInfo.userId}`, JSON.stringify(tokenData));
      
      return true;
    } catch (error) {
      throw new Error('Failed to register push token');
    }
  }

  // Schedule notification
  async scheduleNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>,
    scheduleTime: Date
  ): Promise<string> {
    await delay(300);
    
    try {
      const scheduledNotification: Notification = {
        ...notificationData,
        id: `scheduled_${Date.now()}`,
        createdAt: new Date(),
        isRead: false,
        scheduledFor: scheduleTime
      };
      
      // In production, this would use a job queue or scheduling service
      
      return scheduledNotification.id;
    } catch (error) {
      throw new Error('Failed to schedule notification');
    }
  }

  // Test notification (for debugging)
  async testNotification(userId: string): Promise<Notification> {
    const testNotification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
      title: 'Test Notification',
      body: 'This is a test notification from the Aptly app.',
      type: 'announcement',
      category: 'info',
      priority: 'normal',
      userId,
      senderId: 'system',
      senderName: 'Test System'
    };
    
    return this.sendNotification(testNotification);
  }

  // Private helper methods
  private shouldSendNotification(notification: Notification, preferences: NotificationPreferences): boolean {
    if (!preferences.enabled) return false;
    
    // Check category preferences
    const categoryKey = notification.type as keyof typeof preferences.categories;
    if (!preferences.categories[categoryKey]) return false;
    
    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= preferences.quietHours.startTime && currentTime <= preferences.quietHours.endTime) {
        // Only send urgent notifications during quiet hours
        return notification.priority === 'high' && notification.category === 'urgent';
      }
    }
    
    return true;
  }

  private async triggerPushNotification(notification: Notification): Promise<void> {
    // In production, this would integrate with Firebase Cloud Messaging, 
    // Apple Push Notification Service, etc.
    
    // TODO: Implement actual push notification service
    if (__DEV__) {
      console.log('Push notification triggered:', {
        title: notification.title,
        body: notification.body,
        data: notification.data
      });
    }
  }

  // Get unread count for badges
  async getUnreadCount(userId: string): Promise<number> {
    await delay(100);
    
    try {
      const unreadCount = MOCK_NOTIFICATIONS.filter(n => 
        n.userId === userId && !n.isRead
      ).length;
      
      return unreadCount;
    } catch (error) {
      throw new Error('Failed to get unread count');
    }
  }

  // Clear all notifications for user
  async clearAllNotifications(userId: string): Promise<number> {
    await delay(400);
    
    try {
      const initialLength = MOCK_NOTIFICATIONS.length;
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.filter(n => n.userId !== userId);
      const deletedCount = initialLength - MOCK_NOTIFICATIONS.length;
      
      return deletedCount;
    } catch (error) {
      throw new Error('Failed to clear notifications');
    }
  }
}

export default NotificationService.getInstance();