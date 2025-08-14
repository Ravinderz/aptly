/**
 * Emergency Service - REST API Integration
 * Handles emergency alerts, responses, and real-time monitoring
 */

import { apiClient } from './api.client';
import { APIResponse } from '@/types/api';

// Types for emergency alerts
export interface EmergencyAlert {
  id: string;
  type: 'security' | 'medical' | 'fire' | 'evacuation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo: string[];
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  attachments?: EmergencyAttachment[];
  updates?: EmergencyUpdate[];
}

export interface EmergencyAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface EmergencyUpdate {
  id: string;
  message: string;
  updatedBy: string;
  updatedAt: Date;
  type: 'info' | 'warning' | 'critical';
}

export interface CreateAlertRequest {
  type: EmergencyAlert['type'];
  severity: EmergencyAlert['severity'];
  title: string;
  description: string;
  location?: string;
  attachments?: File[];
}

export interface UpdateAlertRequest {
  title?: string;
  description?: string;
  location?: string;
  severity?: EmergencyAlert['severity'];
  assignedTo?: string[];
}

export interface AcknowledgeAlertRequest {
  notes?: string;
}

export interface ResolveAlertRequest {
  resolutionNotes: string;
  attachments?: File[];
}

export interface EmergencyStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  averageResponseTime: number; // in minutes
  responseTimeByType: Record<EmergencyAlert['type'], number>;
}

export interface EmergencyFilters {
  status?: EmergencyAlert['status'] | 'all';
  type?: EmergencyAlert['type'] | 'all';
  severity?: EmergencyAlert['severity'] | 'all';
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Emergency Service Class
 */
export class EmergencyService {
  private static instance: EmergencyService;

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  /**
   * Get list of emergency alerts
   */
  async getAlerts(filters?: EmergencyFilters): Promise<APIResponse<{
    alerts: EmergencyAlert[];
    totalCount: number;
    stats: EmergencyStats;
  }>> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.severity && filters.severity !== 'all') {
      params.append('severity', filters.severity);
    }
    if (filters?.assignedTo) {
      params.append('assignedTo', filters.assignedTo);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/security/alerts${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get detailed emergency alert by ID
   */
  async getAlert(alertId: string): Promise<APIResponse<EmergencyAlert>> {
    return apiClient.get(`/security/alerts/${alertId}`);
  }

  /**
   * Create new emergency alert
   */
  async createAlert(data: CreateAlertRequest): Promise<APIResponse<EmergencyAlert>> {
    // If attachments are provided, upload them first
    let attachmentUrls: string[] = [];
    
    if (data.attachments && data.attachments.length > 0) {
      try {
        const uploadPromises = data.attachments.map(file => this.uploadAttachment(file));
        attachmentUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Failed to upload attachments:', error);
        // Continue without attachments
      }
    }

    return apiClient.post('/security/alerts', {
      ...data,
      attachments: attachmentUrls,
    });
  }

  /**
   * Update emergency alert
   */
  async updateAlert(
    alertId: string, 
    data: UpdateAlertRequest
  ): Promise<APIResponse<EmergencyAlert>> {
    return apiClient.patch(`/security/alerts/${alertId}`, data);
  }

  /**
   * Acknowledge emergency alert
   */
  async acknowledgeAlert(
    alertId: string, 
    data: AcknowledgeAlertRequest = {}
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/security/alerts/${alertId}/acknowledge`, data);
  }

  /**
   * Resolve emergency alert
   */
  async resolveAlert(
    alertId: string, 
    data: ResolveAlertRequest
  ): Promise<APIResponse<{ message: string }>> {
    // If attachments are provided, upload them first
    let attachmentUrls: string[] = [];
    
    if (data.attachments && data.attachments.length > 0) {
      try {
        const uploadPromises = data.attachments.map(file => this.uploadAttachment(file));
        attachmentUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Failed to upload resolution attachments:', error);
        // Continue without attachments
      }
    }

    return apiClient.post(`/security/alerts/${alertId}/resolve`, {
      resolutionNotes: data.resolutionNotes,
      attachments: attachmentUrls,
    });
  }

  /**
   * Add update to emergency alert
   */
  async addUpdate(
    alertId: string,
    message: string,
    type: EmergencyUpdate['type'] = 'info'
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/security/alerts/${alertId}/updates`, {
      message,
      type,
    });
  }

  /**
   * Assign alert to security personnel
   */
  async assignAlert(
    alertId: string,
    assignedTo: string[]
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/security/alerts/${alertId}/assign`, {
      assignedTo,
    });
  }

  /**
   * Get emergency statistics
   */
  async getStats(
    period?: '1h' | '24h' | '7d' | '30d'
  ): Promise<APIResponse<EmergencyStats & {
    trendData: Array<{
      timestamp: string;
      active: number;
      resolved: number;
      critical: number;
    }>;
    hotspots: Array<{
      location: string;
      count: number;
      severity: 'high' | 'critical';
    }>;
  }>> {
    const params = period ? `?period=${period}` : '';
    return apiClient.get(`/security/alerts/stats${params}`);
  }

  /**
   * Get alert history/timeline
   */
  async getAlertHistory(
    alertId: string
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
    return apiClient.get(`/security/alerts/${alertId}/history`);
  }

  /**
   * Upload attachment for emergency alert
   */
  private async uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'emergency');

    const response = await apiClient.upload('/uploads/emergency', formData);
    return response.data.url;
  }

  /**
   * Send emergency notification
   */
  async sendNotification(
    alertId: string,
    message: string,
    recipients: string[] = ['all']
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/security/alerts/${alertId}/notify`, {
      message,
      recipients,
    });
  }

  /**
   * Get real-time updates via WebSocket (placeholder)
   */
  subscribeToAlerts(callback: (alert: EmergencyAlert) => void): () => void {
    // In a real implementation, this would establish a WebSocket connection
    console.log('WebSocket subscription for real-time alerts established');
    
    // Return cleanup function
    return () => {
      console.log('WebSocket subscription cleaned up');
    };
  }

  /**
   * Export emergency reports
   */
  async exportReport(
    format: 'csv' | 'xlsx' | 'pdf',
    filters?: EmergencyFilters
  ): Promise<APIResponse<{ 
    downloadUrl: string; 
    expiresAt: string;
    fileName: string;
  }>> {
    return apiClient.post('/security/alerts/export', {
      format,
      filters,
    });
  }

  /**
   * Bulk operations
   */
  async bulkAcknowledge(
    alertIds: string[],
    notes?: string
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/security/alerts/bulk/acknowledge', {
      alertIds,
      notes,
    });
  }

  async bulkResolve(
    alertIds: string[],
    resolutionNotes: string
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/security/alerts/bulk/resolve', {
      alertIds,
      resolutionNotes,
    });
  }
}

// Export singleton instance
export const emergencyService = EmergencyService.getInstance();

// Export types for use in components
export type {
  EmergencyAlert,
  EmergencyAttachment,
  EmergencyUpdate,
  CreateAlertRequest,
  UpdateAlertRequest,
  AcknowledgeAlertRequest,
  ResolveAlertRequest,
  EmergencyStats,
  EmergencyFilters,
};