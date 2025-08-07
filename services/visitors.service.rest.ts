/**
 * REST Visitors Service
 * Complete visitor management service with REST API integration
 */

import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { apiClient, APIClientError } from '@/services/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import { 
  APIResponse,
  PaginatedAPIResponse,
  Visitor,
  VisitorCreateRequest,
  VisitorListQuery,
  VisitorCheckInRequest,
  VisitorCheckOutRequest,
  VisitorApprovalRequest,
  VisitorRejectionRequest,
  VisitorStats,
} from '@/types/api';

// Validation schemas
const visitorCreateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  phoneNumber: z.string()
    .refine((phone) => isValidPhoneNumber(phone, 'IN'), {
      message: 'Please enter a valid Indian mobile number'
    }),
  purpose: z.string()
    .min(3, 'Purpose must be at least 3 characters')
    .max(100, 'Purpose cannot exceed 100 characters'),
  expectedDuration: z.number()
    .min(15, 'Minimum duration is 15 minutes')
    .max(1440, 'Maximum duration is 24 hours'),
  hostFlatNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  photo: z.string().optional(),
  identityDocument: z.object({
    type: z.enum(['aadhar', 'pan', 'driving_license', 'passport']),
    number: z.string().min(6, 'Document number is required'),
    photo: z.string(),
  }).optional(),
});

const visitorUpdateSchema = visitorCreateSchema.partial();

/**
 * Visitor Service Result Interface
 */
export interface VisitorResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: string;
}

/**
 * REST Visitors Service Class
 */
export class RestVisitorsService {
  private static instance: RestVisitorsService;

  private constructor() {}

  static getInstance(): RestVisitorsService {
    if (!RestVisitorsService.instance) {
      RestVisitorsService.instance = new RestVisitorsService();
    }
    return RestVisitorsService.instance;
  }

  /**
   * Get paginated list of visitors
   */
  async getVisitors(query: VisitorListQuery = {}): Promise<VisitorResult> {
    try {
      const params = this.buildQueryParams(query);
      
      const response = await apiClient.get<Visitor[]>(
        API_ENDPOINTS.VISITORS.LIST,
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
          error: response.error?.message || 'Failed to fetch visitors',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get visitors:', error);
      return this.handleError(error, 'Failed to fetch visitors');
    }
  }

  /**
   * Get visitor by ID
   */
  async getVisitor(id: string): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.get<Visitor>(API_ENDPOINTS.VISITORS.GET(id));

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Visitor not found',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get visitor:', error);
      return this.handleError(error, 'Failed to fetch visitor details');
    }
  }

  /**
   * Create new visitor
   */
  async createVisitor(visitorData: VisitorCreateRequest): Promise<VisitorResult> {
    try {
      // Validate input data
      const validation = visitorCreateSchema.safeParse(visitorData);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
          code: 'VALIDATION_ERROR',
        };
      }

      // Format phone number
      const formattedData = {
        ...validation.data,
        phoneNumber: this.formatPhoneNumber(validation.data.phoneNumber),
      };

      const response = await apiClient.post<Visitor>(
        API_ENDPOINTS.VISITORS.CREATE,
        formattedData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to create visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to create visitor:', error);
      return this.handleError(error, 'Failed to create visitor');
    }
  }

  /**
   * Update visitor
   */
  async updateVisitor(id: string, visitorData: Partial<VisitorCreateRequest>): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      // Validate input data
      const validation = visitorUpdateSchema.safeParse(visitorData);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.issues[0].message,
          code: 'VALIDATION_ERROR',
        };
      }

      // Format phone number if provided
      const formattedData = {
        ...validation.data,
        ...(validation.data.phoneNumber && {
          phoneNumber: this.formatPhoneNumber(validation.data.phoneNumber),
        }),
      };

      const response = await apiClient.put<Visitor>(
        API_ENDPOINTS.VISITORS.UPDATE(id),
        formattedData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to update visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to update visitor:', error);
      return this.handleError(error, 'Failed to update visitor');
    }
  }

  /**
   * Delete visitor
   */
  async deleteVisitor(id: string): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.delete(API_ENDPOINTS.VISITORS.DELETE(id));

      if (response.success) {
        return {
          success: true,
          data: { message: 'Visitor deleted successfully' },
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to delete visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to delete visitor:', error);
      return this.handleError(error, 'Failed to delete visitor');
    }
  }

  /**
   * Check in visitor
   */
  async checkInVisitor(id: string, checkInData?: VisitorCheckInRequest): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const requestData = {
        actualArrivalTime: new Date().toISOString(),
        ...checkInData,
      };

      const response = await apiClient.post<Visitor>(
        API_ENDPOINTS.VISITORS.CHECK_IN(id),
        requestData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to check in visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to check in visitor:', error);
      return this.handleError(error, 'Failed to check in visitor');
    }
  }

  /**
   * Check out visitor
   */
  async checkOutVisitor(id: string, checkOutData?: VisitorCheckOutRequest): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const requestData = {
        actualDepartureTime: new Date().toISOString(),
        ...checkOutData,
      };

      const response = await apiClient.post<Visitor>(
        API_ENDPOINTS.VISITORS.CHECK_OUT(id),
        requestData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to check out visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to check out visitor:', error);
      return this.handleError(error, 'Failed to check out visitor');
    }
  }

  /**
   * Approve visitor
   */
  async approveVisitor(id: string, approvalData: VisitorApprovalRequest): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      if (!approvalData.approvedBy) {
        return {
          success: false,
          error: 'Approver information is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.post<Visitor>(
        API_ENDPOINTS.VISITORS.APPROVE(id),
        approvalData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to approve visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to approve visitor:', error);
      return this.handleError(error, 'Failed to approve visitor');
    }
  }

  /**
   * Reject visitor
   */
  async rejectVisitor(id: string, rejectionData: VisitorRejectionRequest): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      if (!rejectionData.rejectedBy || !rejectionData.rejectionReason) {
        return {
          success: false,
          error: 'Rejection reason and rejected by information are required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.post<Visitor>(
        API_ENDPOINTS.VISITORS.REJECT(id),
        rejectionData
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to reject visitor',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to reject visitor:', error);
      return this.handleError(error, 'Failed to reject visitor');
    }
  }

  /**
   * Get visitor QR code
   */
  async getVisitorQRCode(id: string): Promise<VisitorResult> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Visitor ID is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const response = await apiClient.get<{ qrCode: string; qrCodeUrl: string }>(
        API_ENDPOINTS.VISITORS.QR_CODE(id)
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to generate QR code',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get QR code:', error);
      return this.handleError(error, 'Failed to generate QR code');
    }
  }

  /**
   * Get visitor statistics
   */
  async getVisitorStats(dateRange?: { startDate: string; endDate: string }): Promise<VisitorResult> {
    try {
      const params = dateRange ? {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      } : {};

      const response = await apiClient.get<VisitorStats>(
        `${API_ENDPOINTS.VISITORS.LIST}/stats`,
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
          error: response.error?.message || 'Failed to fetch visitor statistics',
          code: response.error?.code,
        };
      }
    } catch (error) {
      console.error('❌ Failed to get visitor stats:', error);
      return this.handleError(error, 'Failed to fetch visitor statistics');
    }
  }

  /**
   * Search visitors
   */
  async searchVisitors(searchQuery: string, filters?: Partial<VisitorListQuery>): Promise<VisitorResult> {
    try {
      if (!searchQuery.trim()) {
        return {
          success: false,
          error: 'Search query is required',
          code: 'VALIDATION_ERROR',
        };
      }

      const params = {
        search: searchQuery.trim(),
        ...filters,
      };

      return this.getVisitors(params);
    } catch (error) {
      console.error('❌ Failed to search visitors:', error);
      return this.handleError(error, 'Failed to search visitors');
    }
  }

  /**
   * Get today's visitors
   */
  async getTodayVisitors(): Promise<VisitorResult> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return this.getVisitors({
        date: today,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    } catch (error) {
      console.error('❌ Failed to get today\'s visitors:', error);
      return this.handleError(error, 'Failed to fetch today\'s visitors');
    }
  }

  /**
   * Get pending visitors (awaiting approval)
   */
  async getPendingVisitors(): Promise<VisitorResult> {
    try {
      return this.getVisitors({
        status: 'pending',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });
    } catch (error) {
      console.error('❌ Failed to get pending visitors:', error);
      return this.handleError(error, 'Failed to fetch pending visitors');
    }
  }

  /**
   * Get active visitors (checked in)
   */
  async getActiveVisitors(): Promise<VisitorResult> {
    try {
      return this.getVisitors({
        status: 'checked_in',
        sortBy: 'checkInTime',
        sortOrder: 'desc',
      });
    } catch (error) {
      console.error('❌ Failed to get active visitors:', error);
      return this.handleError(error, 'Failed to fetch active visitors');
    }
  }

  // Private utility methods

  /**
   * Build query parameters for API calls
   */
  private buildQueryParams(query: VisitorListQuery): Record<string, any> {
    const params: Record<string, any> = {};

    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit;
    if (query.status) params.status = query.status;
    if (query.date) params.date = query.date;
    if (query.hostFlatNumber) params.hostFlatNumber = query.hostFlatNumber;
    if (query.search) params.search = query.search;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortOrder) params.sortOrder = query.sortOrder;

    return params;
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    try {
      const parsed = parsePhoneNumber(phoneNumber, 'IN');
      return parsed.format('E.164');
    } catch (error) {
      console.warn('⚠️ Failed to format phone number:', error);
      return phoneNumber;
    }
  }

  /**
   * Handle and format errors consistently
   */
  private handleError(error: any, defaultMessage: string): VisitorResult {
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
const restVisitorsService = RestVisitorsService.getInstance();
export default restVisitorsService;

// Export compatible interface with existing visitor service
export {
  restVisitorsService as VisitorsService,
  type VisitorResult,
};