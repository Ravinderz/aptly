/**
 * Onboarding Service - REST API Integration
 * Handles society onboarding requests and document management
 */

import { apiClient } from './api.client';
import { APIResponse } from '@/types/api';

// Types for onboarding requests
export interface OnboardingRequest {
  id: string;
  societyName: string;
  societyCode: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  societyAddress: string;
  totalFlats: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDocuments: OnboardingDocument[];
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
  additionalInfo: {
    societyType: string;
    constructionYear: string;
    amenities: string[];
    parkingSpaces: number;
    securityDeposit: number;
    monthlyMaintenance: number;
  };
}

export interface OnboardingDocument {
  name: string;
  size: string;
  uploadedAt: string;
  verified: boolean;
  url?: string;
}

export interface OnboardingListItem {
  id: string;
  societyName: string;
  societyCode: string;
  adminName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ApprovalRequest {
  notes?: string;
}

export interface RejectionRequest {
  reason: string;
  notes?: string;
}

export interface OnboardingStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageProcessingTime: number; // in hours
}

/**
 * Onboarding Service Class
 */
export class OnboardingService {
  private static instance: OnboardingService;

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Get list of onboarding requests
   */
  async getRequests(filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<APIResponse<{
    requests: OnboardingListItem[];
    totalCount: number;
    stats: OnboardingStats;
  }>> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = `/admin/onboarding${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get detailed onboarding request by ID
   */
  async getRequest(requestId: string): Promise<APIResponse<OnboardingRequest>> {
    return apiClient.get(`/admin/onboarding/${requestId}`);
  }

  /**
   * Approve onboarding request
   */
  async approveRequest(
    requestId: string, 
    data: ApprovalRequest
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/admin/onboarding/${requestId}/approve`, data);
  }

  /**
   * Reject onboarding request
   */
  async rejectRequest(
    requestId: string, 
    data: RejectionRequest
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/admin/onboarding/${requestId}/reject`, data);
  }

  /**
   * Download document
   */
  async downloadDocument(
    requestId: string, 
    documentName: string
  ): Promise<APIResponse<{ downloadUrl: string; expiresAt: string }>> {
    return apiClient.get(`/admin/onboarding/${requestId}/documents/${documentName}/download`);
  }

  /**
   * Update verification status of a document
   */
  async updateDocumentVerification(
    requestId: string,
    documentName: string,
    verified: boolean,
    notes?: string
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.patch(`/admin/onboarding/${requestId}/documents/${documentName}`, {
      verified,
      notes,
    });
  }

  /**
   * Add notes to onboarding request
   */
  async addNotes(
    requestId: string,
    notes: string
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/admin/onboarding/${requestId}/notes`, { notes });
  }

  /**
   * Get onboarding request history/timeline
   */
  async getRequestHistory(
    requestId: string
  ): Promise<APIResponse<{
    timeline: Array<{
      id: string;
      action: string;
      description: string;
      performedBy: string;
      performedAt: string;
      metadata?: any;
    }>;
  }>> {
    return apiClient.get(`/admin/onboarding/${requestId}/history`);
  }

  /**
   * Bulk operations on onboarding requests
   */
  async bulkApprove(
    requestIds: string[],
    notes?: string
  ): Promise<APIResponse<{ 
    successful: string[]; 
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/admin/onboarding/bulk/approve', {
      requestIds,
      notes,
    });
  }

  async bulkReject(
    requestIds: string[],
    reason: string,
    notes?: string
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/admin/onboarding/bulk/reject', {
      requestIds,
      reason,
      notes,
    });
  }

  /**
   * Export onboarding requests data
   */
  async exportRequests(
    format: 'csv' | 'xlsx' | 'pdf',
    filters?: {
      status?: 'pending' | 'approved' | 'rejected' | 'all';
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<APIResponse<{ 
    downloadUrl: string; 
    expiresAt: string;
    fileName: string;
  }>> {
    return apiClient.post('/admin/onboarding/export', {
      format,
      filters,
    });
  }

  /**
   * Get statistics for dashboard
   */
  async getStats(
    period?: '7d' | '30d' | '90d' | '1y'
  ): Promise<APIResponse<OnboardingStats & {
    trendData: Array<{
      date: string;
      pending: number;
      approved: number;
      rejected: number;
    }>;
    topReasons: Array<{
      reason: string;
      count: number;
    }>;
  }>> {
    const params = period ? `?period=${period}` : '';
    return apiClient.get(`/admin/onboarding/stats${params}`);
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();

// Export types for use in components
export type {
  OnboardingRequest,
  OnboardingDocument,
  OnboardingListItem,
  ApprovalRequest,
  RejectionRequest,
  OnboardingStats,
};