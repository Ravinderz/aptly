/**
 * Notices Service
 * Handles notice and announcement related API operations
 */

import { apiService } from './api.service';
import { Notice } from '@/types/notifications';

/**
 * Notices API Service with real API integration and mock fallback
 */
export const noticesService = {
  // Get all notices
  getNotices: async (): Promise<Notice[]> => {
    try {
      return await apiService.getNotices();
    } catch (error) {
      console.warn('Failed to fetch notices from API, using fallback:', error);
      // Mock fallback data
      return [
        {
          id: 'notice1',
          title: 'Society Maintenance Meeting',
          content: 'Monthly maintenance meeting scheduled for this Saturday at 5 PM in the community hall.',
          category: 'announcement',
          priority: 'high',
          isUrgent: false,
          createdBy: 'Society Admin',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          attachments: [],
          readBy: [],
          targetAudience: 'all',
        },
        {
          id: 'notice2',
          title: 'Water Supply Interruption',
          content: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance work.',
          category: 'maintenance',
          priority: 'high',
          isUrgent: true,
          createdBy: 'Maintenance Team',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          attachments: [],
          readBy: [],
          targetAudience: 'all',
        }
      ];
    }
  },

  // Create a new notice (admin only)
  createNotice: async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notice> => {
    try {
      return await apiService.createNotice(noticeData);
    } catch (error) {
      console.warn('Failed to create notice via API, using fallback:', error);
      // Mock fallback - simulate successful creation
      const mockNotice: Notice = {
        id: `mock-notice-${Date.now()}`,
        ...noticeData,
        createdAt: new Date(),
        updatedAt: new Date(),
        readBy: [],
      };
      return mockNotice;
    }
  },

  // Mark notice as read
  markAsRead: async (noticeId: string, userId: string): Promise<void> => {
    try {
      // Note: This would be a separate API endpoint
      console.warn('Mark notice as read API not yet implemented');
    } catch (error) {
      console.warn('Failed to mark notice as read via API:', error);
    }
  },

  // Get unread notices count
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const notices = await this.getNotices();
      return notices.filter(notice => !notice.readBy.includes(userId)).length;
    } catch (error) {
      console.warn('Failed to get unread count:', error);
      return 0;
    }
  },

  // Get notices by category
  getNoticesByCategory: async (category: string): Promise<Notice[]> => {
    try {
      const allNotices = await this.getNotices();
      return allNotices.filter(notice => notice.category === category);
    } catch (error) {
      console.warn('Failed to get notices by category:', error);
      return [];
    }
  },

  // Get urgent notices
  getUrgentNotices: async (): Promise<Notice[]> => {
    try {
      const allNotices = await this.getNotices();
      return allNotices.filter(notice => notice.isUrgent);
    } catch (error) {
      console.warn('Failed to get urgent notices:', error);
      return [];
    }
  },

  // Delete notice (admin only)
  deleteNotice: async (noticeId: string): Promise<void> => {
    try {
      // Note: This would call apiService.deleteNotice when implemented
      console.warn('Delete notice API not yet implemented');
    } catch (error) {
      console.warn('Failed to delete notice via API:', error);
    }
  },

  // Get loading manager
  getLoadingManager: () => {
    return apiService.getLoadingManager();
  },

  // Refresh cache
  refreshCache: () => {
    apiService.invalidateCache('notices');
  },
};