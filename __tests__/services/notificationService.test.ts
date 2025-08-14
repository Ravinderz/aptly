/**
 * Notification Service Testing
 * Tests notification management, user preferences, and delivery logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Notification Service Types
interface NotificationPreferences {
  userId: string;
  push: boolean;
  email: boolean;
  sms: boolean;
  categories: {
    maintenance: boolean;
    billing: boolean;
    community: boolean;
    emergency: boolean;
    governance: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category:
    | 'maintenance'
    | 'billing'
    | 'community'
    | 'emergency'
    | 'governance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isSent: boolean;
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

interface DeliveryAttempt {
  id: string;
  notificationId: string;
  channel: 'push' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  attemptedAt: string;
  deliveredAt?: string;
  error?: string;
}

// Notification Service Implementation
class NotificationService {
  private static readonly PREFERENCES_KEY = 'aptly_notification_preferences';
  private static readonly NOTIFICATIONS_KEY = 'aptly_notifications';
  private static readonly DELIVERY_ATTEMPTS_KEY = 'aptly_delivery_attempts';

  static async getUserPreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    try {
      const preferencesJson = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      const allPreferences: NotificationPreferences[] = preferencesJson
        ? JSON.parse(preferencesJson)
        : [];

      const userPreferences = allPreferences.find((p) => p.userId === userId);

      if (userPreferences) {
        return userPreferences;
      }

      // Return default preferences
      const defaultPreferences: NotificationPreferences = {
        userId,
        push: true,
        email: false,
        sms: true,
        categories: {
          maintenance: true,
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save default preferences
      await this.updateUserPreferences(userId, defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  static async updateUserPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    try {
      const preferencesJson = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      const allPreferences: NotificationPreferences[] = preferencesJson
        ? JSON.parse(preferencesJson)
        : [];

      const existingIndex = allPreferences.findIndex(
        (p) => p.userId === userId,
      );
      const updatedPreferences: NotificationPreferences = {
        ...updates,
        userId,
        updatedAt: new Date().toISOString(),
      } as NotificationPreferences;

      if (existingIndex >= 0) {
        allPreferences[existingIndex] = {
          ...allPreferences[existingIndex],
          ...updatedPreferences,
        };
      } else {
        allPreferences.push(updatedPreferences);
      }

      await AsyncStorage.setItem(
        this.PREFERENCES_KEY,
        JSON.stringify(allPreferences),
      );
      return allPreferences[
        existingIndex >= 0 ? existingIndex : allPreferences.length - 1
      ];
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  static async createNotification(
    notificationData: Omit<
      Notification,
      'id' | 'isRead' | 'isSent' | 'createdAt'
    >,
  ): Promise<Notification> {
    try {
      const notificationsJson = await AsyncStorage.getItem(
        this.NOTIFICATIONS_KEY,
      );
      const notifications: Notification[] = notificationsJson
        ? JSON.parse(notificationsJson)
        : [];

      const newNotification: Notification = {
        ...notificationData,
        id: Date.now().toString(),
        isRead: false,
        isSent: false,
        createdAt: new Date().toISOString(),
      };

      notifications.unshift(newNotification);
      await AsyncStorage.setItem(
        this.NOTIFICATIONS_KEY,
        JSON.stringify(notifications),
      );

      // Attempt to send the notification
      await this.sendNotification(newNotification);

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(
    userId: string,
    limit?: number,
  ): Promise<Notification[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(
        this.NOTIFICATIONS_KEY,
      );
      const allNotifications: Notification[] = notificationsJson
        ? JSON.parse(notificationsJson)
        : [];

      const userNotifications = allNotifications
        .filter((n) => n.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      return limit ? userNotifications.slice(0, limit) : userNotifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const notificationsJson = await AsyncStorage.getItem(
        this.NOTIFICATIONS_KEY,
      );
      const notifications: Notification[] = notificationsJson
        ? JSON.parse(notificationsJson)
        : [];

      const notificationIndex = notifications.findIndex(
        (n) => n.id === notificationId,
      );

      if (notificationIndex === -1) return false;

      notifications[notificationIndex] = {
        ...notifications[notificationIndex],
        isRead: true,
        readAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        this.NOTIFICATIONS_KEY,
        JSON.stringify(notifications),
      );
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter((n) => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  static async sendNotification(notification: Notification): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(notification.userId);

      // Check if category is enabled
      if (!preferences.categories[notification.category]) {
        console.log(
          `Notification category ${notification.category} is disabled for user ${notification.userId}`,
        );
        return false;
      }

      // Check quiet hours for non-critical notifications
      if (
        notification.priority !== 'critical' &&
        this.isInQuietHours(preferences.quietHours)
      ) {
        console.log('Notification delayed due to quiet hours');
        return await this.scheduleNotification(
          notification,
          preferences.quietHours.end,
        );
      }

      const deliveryChannels: Array<'push' | 'email' | 'sms'> = [];

      if (preferences.push) deliveryChannels.push('push');
      if (preferences.email) deliveryChannels.push('email');
      if (
        preferences.sms &&
        (notification.priority === 'high' ||
          notification.priority === 'critical')
      ) {
        deliveryChannels.push('sms');
      }

      // Attempt delivery on all enabled channels
      const deliveryResults = await Promise.all(
        deliveryChannels.map((channel) =>
          this.attemptDelivery(notification, channel),
        ),
      );

      const successful = deliveryResults.some((result) => result.success);

      if (successful) {
        await this.markAsSent(notification.id);
      }

      return successful;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  static async scheduleNotification(
    notification: Notification,
    deliveryTime: string,
  ): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with a job scheduler
      console.log(
        `Notification ${notification.id} scheduled for ${deliveryTime}`,
      );
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }

  static async getDeliveryStatus(
    notificationId: string,
  ): Promise<DeliveryAttempt[]> {
    try {
      const attemptsJson = await AsyncStorage.getItem(
        this.DELIVERY_ATTEMPTS_KEY,
      );
      const allAttempts: DeliveryAttempt[] = attemptsJson
        ? JSON.parse(attemptsJson)
        : [];

      return allAttempts.filter((a) => a.notificationId === notificationId);
    } catch (error) {
      console.error('Error getting delivery status:', error);
      return [];
    }
  }

  static async clearAllNotifications(userId: string): Promise<boolean> {
    try {
      const notificationsJson = await AsyncStorage.getItem(
        this.NOTIFICATIONS_KEY,
      );
      const notifications: Notification[] = notificationsJson
        ? JSON.parse(notificationsJson)
        : [];

      const filteredNotifications = notifications.filter(
        (n) => n.userId !== userId,
      );

      await AsyncStorage.setItem(
        this.NOTIFICATIONS_KEY,
        JSON.stringify(filteredNotifications),
      );
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  // Private helper methods
  private static isInQuietHours(
    quietHours: NotificationPreferences['quietHours'],
  ): boolean {
    if (!quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const currentMinutes = currentHour * 60 + currentMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  private static async attemptDelivery(
    notification: Notification,
    channel: 'push' | 'email' | 'sms',
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock delivery logic - in real implementation would integrate with push/email/SMS services
      const isSuccessful = Math.random() > 0.1; // 90% success rate

      const attempt: DeliveryAttempt = {
        id: Date.now().toString(),
        notificationId: notification.id,
        channel,
        status: isSuccessful ? 'delivered' : 'failed',
        attemptedAt: new Date().toISOString(),
        deliveredAt: isSuccessful ? new Date().toISOString() : undefined,
        error: isSuccessful ? undefined : 'Mock delivery failure',
      };

      await this.recordDeliveryAttempt(attempt);

      return { success: isSuccessful, error: attempt.error };
    } catch (error) {
      console.error(`Error attempting ${channel} delivery:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private static async recordDeliveryAttempt(
    attempt: DeliveryAttempt,
  ): Promise<void> {
    try {
      const attemptsJson = await AsyncStorage.getItem(
        this.DELIVERY_ATTEMPTS_KEY,
      );
      const attempts: DeliveryAttempt[] = attemptsJson
        ? JSON.parse(attemptsJson)
        : [];

      attempts.push(attempt);
      await AsyncStorage.setItem(
        this.DELIVERY_ATTEMPTS_KEY,
        JSON.stringify(attempts),
      );
    } catch (error) {
      console.error('Error recording delivery attempt:', error);
    }
  }

  private static async markAsSent(notificationId: string): Promise<void> {
    try {
      const notificationsJson = await AsyncStorage.getItem(
        this.NOTIFICATIONS_KEY,
      );
      const notifications: Notification[] = notificationsJson
        ? JSON.parse(notificationsJson)
        : [];

      const notificationIndex = notifications.findIndex(
        (n) => n.id === notificationId,
      );

      if (notificationIndex >= 0) {
        notifications[notificationIndex] = {
          ...notifications[notificationIndex],
          isSent: true,
          sentAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(
          this.NOTIFICATIONS_KEY,
          JSON.stringify(notifications),
        );
      }
    } catch (error) {
      console.error('Error marking as sent:', error);
    }
  }
}

describe('NotificationService', () => {
  const mockConsoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const mockConsoleLog = jest
    .spyOn(console, 'log')
    .mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();

    // Set up default mock behavior
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
    mockAsyncStorage.clear.mockResolvedValue();
  });

  describe('getUserPreferences', () => {
    test('should return existing user preferences', async () => {
      const existingPreferences: NotificationPreferences[] = [
        {
          userId: 'user1',
          push: false,
          email: true,
          sms: true,
          categories: {
            maintenance: true,
            billing: false,
            community: true,
            emergency: true,
            governance: false,
          },
          quietHours: {
            enabled: true,
            start: '23:00',
            end: '07:00',
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T11:00:00Z',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingPreferences),
      );

      const result = await NotificationService.getUserPreferences('user1');

      expect(result).toEqual(existingPreferences[0]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        'aptly_notification_preferences',
      );
    });

    test('should create and return default preferences for new user', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // No existing preferences
        .mockResolvedValueOnce(null); // For updateUserPreferences call

      const result = await NotificationService.getUserPreferences('user2');

      expect(result).toMatchObject({
        userId: 'user2',
        push: true,
        email: false,
        sms: true,
        categories: {
          maintenance: true,
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_notification_preferences',
        expect.stringContaining('"userId":"user2"'),
      );
    });

    test('should handle preferences retrieval errors', async () => {
      const error = new Error('Storage error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      await expect(
        NotificationService.getUserPreferences('user1'),
      ).rejects.toThrow('Storage error');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error getting user preferences:',
        error,
      );
    });
  });

  describe('updateUserPreferences', () => {
    test('should update existing user preferences', async () => {
      const existingPreferences: NotificationPreferences[] = [
        {
          userId: 'user1',
          push: true,
          email: false,
          sms: true,
          categories: {
            maintenance: true,
            billing: true,
            community: true,
            emergency: true,
            governance: true,
          },
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00',
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingPreferences),
      );

      const updates = {
        push: false,
        email: true,
        categories: {
          ...existingPreferences[0].categories,
          billing: false,
        },
      };

      const result = await NotificationService.updateUserPreferences(
        'user1',
        updates,
      );

      expect(result).toMatchObject({
        userId: 'user1',
        push: false,
        email: true,
        categories: expect.objectContaining({
          billing: false,
        }),
        updatedAt: expect.any(String),
      });

      expect(result.updatedAt).not.toBe(existingPreferences[0].updatedAt);
    });

    test('should create new preferences if user does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const newPreferences = {
        push: false,
        email: true,
        sms: false,
      };

      const result = await NotificationService.updateUserPreferences(
        'user2',
        newPreferences,
      );

      expect(result).toMatchObject({
        userId: 'user2',
        ...newPreferences,
        updatedAt: expect.any(String),
      });
    });

    test('should handle update errors', async () => {
      const error = new Error('Update error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      await expect(
        NotificationService.updateUserPreferences('user1', { push: false }),
      ).rejects.toThrow('Update error');
    });
  });

  describe('createNotification', () => {
    test('should create notification and attempt to send it', async () => {
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // For notifications storage
        .mockResolvedValueOnce(null) // For preferences (will create default)
        .mockResolvedValueOnce(null) // For delivery attempts
        .mockResolvedValueOnce(null); // For marking as sent

      const notificationData = {
        userId: 'user1',
        title: 'New Bill Available',
        body: 'Your monthly maintenance bill is ready for payment',
        category: 'billing' as const,
        priority: 'medium' as const,
      };

      const result =
        await NotificationService.createNotification(notificationData);

      expect(result).toMatchObject({
        ...notificationData,
        id: expect.any(String),
        isRead: false,
        isSent: false,
        createdAt: expect.any(String),
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_notifications',
        expect.stringContaining('"title":"New Bill Available"'),
      );
    });

    test('should handle creation errors', async () => {
      const error = new Error('Creation error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const notificationData = {
        userId: 'user1',
        title: 'Test',
        body: 'Test body',
        category: 'maintenance' as const,
        priority: 'low' as const,
      };

      await expect(
        NotificationService.createNotification(notificationData),
      ).rejects.toThrow('Creation error');
    });
  });

  describe('getUserNotifications', () => {
    test('should return user notifications sorted by creation date', async () => {
      const allNotifications: Notification[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Old notification',
          body: 'Body 1',
          category: 'maintenance',
          priority: 'low',
          isRead: false,
          isSent: true,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user2',
          title: 'Other user notification',
          body: 'Body 2',
          category: 'billing',
          priority: 'medium',
          isRead: false,
          isSent: true,
          createdAt: '2024-01-15T11:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          title: 'New notification',
          body: 'Body 3',
          category: 'community',
          priority: 'high',
          isRead: false,
          isSent: true,
          createdAt: '2024-01-15T12:00:00Z',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(allNotifications),
      );

      const result = await NotificationService.getUserNotifications('user1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('3'); // Most recent first
      expect(result[1].id).toBe('1');
      expect(result.every((n) => n.userId === 'user1')).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const userNotifications = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        userId: 'user1',
        title: `Notification ${i + 1}`,
        body: `Body ${i + 1}`,
        category: 'maintenance' as const,
        priority: 'low' as const,
        isRead: false,
        isSent: true,
        createdAt: new Date(2024, 0, 15, 10, i).toISOString(),
      }));

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(userNotifications),
      );

      const result = await NotificationService.getUserNotifications('user1', 5);

      expect(result).toHaveLength(5);
    });

    test('should handle retrieval errors gracefully', async () => {
      const error = new Error('Retrieval error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const result = await NotificationService.getUserNotifications('user1');

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error getting user notifications:',
        error,
      );
    });
  });

  describe('markAsRead', () => {
    test('should mark notification as read and set readAt timestamp', async () => {
      const notifications: Notification[] = [
        {
          id: '1',
          userId: 'user1',
          title: 'Test notification',
          body: 'Test body',
          category: 'maintenance',
          priority: 'low',
          isRead: false,
          isSent: true,
          createdAt: '2024-01-15T10:00:00Z',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(notifications));

      const result = await NotificationService.markAsRead('1');

      expect(result).toBe(true);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].isRead).toBe(true);
      expect(savedData[0].readAt).toBeDefined();
    });

    test('should return false for non-existent notification', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await NotificationService.markAsRead('nonexistent');

      expect(result).toBe(false);
    });

    test('should handle mark as read errors', async () => {
      const error = new Error('Mark read error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      await expect(NotificationService.markAsRead('1')).rejects.toThrow(
        'Mark read error',
      );
    });
  });

  describe('getUnreadCount', () => {
    test('should return count of unread notifications', async () => {
      const userNotifications: Notification[] = [
        { id: '1', userId: 'user1', isRead: false } as any,
        { id: '2', userId: 'user1', isRead: true } as any,
        { id: '3', userId: 'user1', isRead: false } as any,
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(userNotifications),
      );

      const result = await NotificationService.getUnreadCount('user1');

      expect(result).toBe(2);
    });

    test('should handle errors gracefully', async () => {
      const error = new Error('Count error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      const result = await NotificationService.getUnreadCount('user1');

      expect(result).toBe(0);
      // The error is logged in getUserNotifications which is called by getUnreadCount
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error getting user notifications:',
        error,
      );
    });
  });

  describe('sendNotification', () => {
    test('should not send notification if category is disabled', async () => {
      const preferences: NotificationPreferences = {
        userId: 'user1',
        push: true,
        email: false,
        sms: true,
        categories: {
          maintenance: false, // Disabled
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([preferences]));

      const notification: Notification = {
        id: '1',
        userId: 'user1',
        title: 'Maintenance Update',
        body: 'Test',
        category: 'maintenance',
        priority: 'medium',
        isRead: false,
        isSent: false,
        createdAt: '2024-01-15T10:00:00Z',
      };

      const result = await NotificationService.sendNotification(notification);

      expect(result).toBe(false);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Notification category maintenance is disabled for user user1',
      );
    });

    test('should attempt delivery on enabled channels', async () => {
      const preferences: NotificationPreferences = {
        userId: 'user1',
        push: true,
        email: true,
        sms: false,
        categories: {
          maintenance: true,
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify([preferences])) // Get preferences
        .mockResolvedValueOnce(null) // Delivery attempts storage
        .mockResolvedValueOnce(null) // Delivery attempts storage
        .mockResolvedValueOnce(null); // Mark as sent

      const notification: Notification = {
        id: '1',
        userId: 'user1',
        title: 'Test notification',
        body: 'Test body',
        category: 'maintenance',
        priority: 'medium',
        isRead: false,
        isSent: false,
        createdAt: '2024-01-15T10:00:00Z',
      };

      // Mock Math.random to ensure delivery success (> 0.1)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await NotificationService.sendNotification(notification);

      expect(result).toBe(true);

      // Should record delivery attempts for push and email (not SMS for medium priority)
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_delivery_attempts',
        expect.stringContaining('"channel":"push"'),
      );
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_delivery_attempts',
        expect.stringContaining('"channel":"email"'),
      );

      jest.restoreAllMocks();
    });

    test('should send SMS for high priority notifications', async () => {
      const preferences: NotificationPreferences = {
        userId: 'user1',
        push: false,
        email: false,
        sms: true,
        categories: {
          maintenance: true,
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify([preferences]))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const notification: Notification = {
        id: '1',
        userId: 'user1',
        title: 'Urgent notification',
        body: 'Test body',
        category: 'emergency',
        priority: 'high',
        isRead: false,
        isSent: false,
        createdAt: '2024-01-15T10:00:00Z',
      };

      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await NotificationService.sendNotification(notification);

      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'aptly_delivery_attempts',
        expect.stringContaining('"channel":"sms"'),
      );

      jest.restoreAllMocks();
    });
  });

  describe('clearAllNotifications', () => {
    test('should remove all notifications for specified user', async () => {
      const allNotifications: Notification[] = [
        { id: '1', userId: 'user1', title: 'User 1 notification' } as any,
        { id: '2', userId: 'user2', title: 'User 2 notification' } as any,
        {
          id: '3',
          userId: 'user1',
          title: 'Another user 1 notification',
        } as any,
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(allNotifications),
      );

      const result = await NotificationService.clearAllNotifications('user1');

      expect(result).toBe(true);

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].userId).toBe('user2');
    });

    test('should handle clear errors', async () => {
      const error = new Error('Clear error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      await expect(
        NotificationService.clearAllNotifications('user1'),
      ).rejects.toThrow('Clear error');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete notification lifecycle', async () => {
      // Create a comprehensive test scenario
      const preferences = {
        userId: 'user1',
        push: true,
        email: false,
        sms: false,
        categories: {
          maintenance: true,
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      // Mock the complete sequence of calls
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // For notifications storage (createNotification)
        .mockResolvedValueOnce(JSON.stringify([preferences])) // For preferences (sendNotification)
        .mockResolvedValueOnce(null) // For delivery attempts
        .mockResolvedValueOnce(null); // For marking as sent

      jest.spyOn(Math, 'random').mockReturnValue(0.5); // Ensure delivery success

      // Create notification
      const notificationData = {
        userId: 'user1',
        title: 'Integration test notification',
        body: 'Test body',
        category: 'maintenance' as const,
        priority: 'medium' as const,
      };

      const notification =
        await NotificationService.createNotification(notificationData);
      expect(notification.id).toBeDefined();

      // Reset mocks for subsequent operations
      jest.clearAllMocks();

      // Mock for markAsRead operation
      const createdNotification = {
        ...notification,
        isSent: true,
        sentAt: '2024-01-15T10:05:00Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([createdNotification]),
      );

      // Mark as read
      const markResult = await NotificationService.markAsRead(notification.id);
      expect(markResult).toBe(true);

      // Mock for getUnreadCount - notification should now be marked as read
      const readNotification = {
        ...createdNotification,
        isRead: true,
        readAt: '2024-01-15T10:10:00Z',
      };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([readNotification]),
      );

      // Get unread count (should be 0 since we marked it as read)
      const unreadCount = await NotificationService.getUnreadCount('user1');
      expect(unreadCount).toBe(0);

      jest.restoreAllMocks();
    });

    test('should handle user preference updates and notification delivery', async () => {
      // Initial preferences with all categories disabled
      const initialPreferences: NotificationPreferences = {
        userId: 'user1',
        push: true,
        email: false,
        sms: false,
        categories: {
          maintenance: false, // Initially disabled
          billing: true,
          community: true,
          emergency: true,
          governance: true,
        },
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify([initialPreferences])) // For updateUserPreferences
        .mockResolvedValueOnce(null) // For notifications storage
        .mockResolvedValueOnce(
          JSON.stringify([
            {
              ...initialPreferences,
              categories: {
                ...initialPreferences.categories,
                maintenance: true,
              },
            },
          ]),
        ); // For sending notification after update

      // Update preferences to enable maintenance notifications
      const updatedPreferences =
        await NotificationService.updateUserPreferences('user1', {
          categories: { ...initialPreferences.categories, maintenance: true },
        });

      expect(updatedPreferences.categories.maintenance).toBe(true);

      // Now create a maintenance notification (should be delivered)
      const notification = await NotificationService.createNotification({
        userId: 'user1',
        title: 'Maintenance notification',
        body: 'Now enabled',
        category: 'maintenance',
        priority: 'medium',
      });

      expect(notification.id).toBeDefined();
    });
  });
});
