/**
 * REST Notices Service
 * Complete notices service with real API integration
 */

import { z } from 'zod';
import { apiClient, APIClientError } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import { Notice } from '@/types/notifications';
import { APIResponse, PaginatedAPIResponse } from '@/types/api';

// Validation schemas
const noticeCreateSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content cannot exceed 2000 characters'),
  category: z.enum(['announcement', 'maintenance', 'event', 'emergency', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  isUrgent: z.boolean().default(false),
  expiresAt: z.date().optional(),
  targetAudience: z.enum(['all', 'residents', 'admins']).default('all'),
  attachments: z.array(z.string()).optional(),
});

const noticeUpdateSchema = noticeCreateSchema.partial();

export interface NoticeResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}

export interface NoticeListQuery {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  isUrgent?: boolean;
  targetAudience?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * REST Notices Service Class
 */
export class RestNoticesService {
  private static instance: RestNoticesService;

  private constructor() {}

  static getInstance(): RestNoticesService {
    if (!RestNoticesService.instance) {
      RestNoticesService.instance = new RestNoticesService();
    }
    return RestNoticesService.instance;
  }

  /**
   * Get paginated list of notices
   */
  async getNotices(query: NoticeListQuery = {}): Promise<NoticeResult> {
    try {
      const params = this.buildQueryParams(query);
      
      const response = await apiClient.get<Notice[]>(
        API_ENDPOINTS.NOTICES.LIST,
        { params }
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch notices',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get notices:', error);
      return this.handleError(error, 'Failed to fetch notices');
    }
  }

  /**
   * Get notice by ID
   */
  async getNotice(id: string): Promise<NoticeResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Notice ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.get<Notice>(API_ENDPOINTS.NOTICES.GET(id));

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Notice not found',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get notice:', error);
      return this.handleError(error, 'Failed to fetch notice');
    }
  }

  /**
   * Create new notice (admin only)
   */
  async createNotice(noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'readBy'>): Promise<NoticeResult> {
    try {
      // Validate input data
      const validation = noticeCreateSchema.safeParse({
        ...noticeData,
        expiresAt: noticeData.expiresAt ? new Date(noticeData.expiresAt) : undefined,
      });
      
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.post<Notice>(
        API_ENDPOINTS.NOTICES.CREATE,
        validation.data
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to create notice',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to create notice:', error);
      return this.handleError(error, 'Failed to create notice');
    }
  }

  /**
   * Update notice (admin only)
   */
  async updateNotice(id: string, noticeData: Partial<Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'readBy'>>): Promise<NoticeResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Notice ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      // Validate input data
      const validation = noticeUpdateSchema.safeParse({
        ...noticeData,
        expiresAt: noticeData.expiresAt ? new Date(noticeData.expiresAt) : undefined,
      });
      
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.put<Notice>(
        API_ENDPOINTS.NOTICES.UPDATE(id),
        validation.data
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to update notice',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to update notice:', error);
      return this.handleError(error, 'Failed to update notice');
    }
  }

  /**
   * Delete notice (admin only)
   */
  async deleteNotice(id: string): Promise<NoticeResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Notice ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.NOTICES.DELETE(id));

      if (response.success) {
        return {
          success: true,
          data: { message: 'Notice deleted successfully' },
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to delete notice',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to delete notice:', error);
      return this.handleError(error, 'Failed to delete notice');
    }
  }

  /**
   * Mark notice as read
   */
  async markAsRead(noticeId: string): Promise<NoticeResult> {
    try {
      if (!noticeId) {
        return {
          success: false,
          error: 'Notice ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.post(
        `/notices/${noticeId}/read`,
        { readAt: new Date().toISOString() }
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to mark notice as read',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to mark notice as read:', error);
      return this.handleError(error, 'Failed to mark notice as read');
    }
  }

  /**
   * Get unread notices count
   */
  async getUnreadCount(): Promise<NoticeResult> {
    try {
      const response = await apiClient.get<{ count: number }>('/notices/unread/count');

      if (response.success) {
        return {
          success: true,
          data: response.data.count,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to get unread count',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return this.handleError(error, 'Failed to get unread count');
    }
  }

  /**
   * Get urgent notices
   */
  async getUrgentNotices(): Promise<NoticeResult> {
    try {
      return this.getNotices({
        isUrgent: true,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    } catch (error) {
      console.error('❌ Failed to get urgent notices:', error);
      return this.handleError(error, 'Failed to fetch urgent notices');
    }
  }

  /**
   * Get notices by category
   */
  async getNoticesByCategory(category: string): Promise<NoticeResult> {
    try {
      if (!category) {
        return {
          success: false,
          error: 'Category is required',
          code: 'VALIDATION_ERROR',
        };
      }

      return this.getNotices({
        category,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    } catch (error) {
      console.error('❌ Failed to get notices by category:', error);
      return this.handleError(error, 'Failed to fetch notices by category');
    }
  }

  /**
   * Search notices
   */
  async searchNotices(query: string, filters?: Partial<NoticeListQuery>): Promise<NoticeResult> {
    try {
      if (!query.trim()) {
        return {
          success: false,
          error: 'Search query is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const params = {
        search: query.trim(),
        ...filters,
      };

      return this.getNotices(params);
    } catch (error) {
      console.error('❌ Failed to search notices:', error);
      return this.handleError(error, 'Failed to search notices');
    }
  }

  // Private utility methods

  /**
   * Build query parameters for API calls
   */
  private buildQueryParams(query: NoticeListQuery): Record<string, any> {
    const params: Record<string, any> = {};

    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.category) params.category = query.category;
    if (query.priority) params.priority = query.priority;
    if (query.isUrgent !== undefined) params.isUrgent = query.isUrgent;
    if (query.targetAudience) params.targetAudience = query.targetAudience;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortOrder) params.sortOrder = query.sortOrder;

    return params;
  }

  /**
   * Handle and format errors consistently
   */
  private handleError(error: any, defaultMessage: string): NoticeResult {
    if (error instanceof APIClientError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error: error?.message || defaultMessage,
      code: 'UNKNOWN_ERROR',
    };
  }
}

// Create singleton instance
const restNoticesService = RestNoticesService.getInstance();
export default restNoticesService;

// Export compatible interface
export {
  restNoticesService as NoticesService,
  type NoticeResult,
  type NoticeListQuery,
};