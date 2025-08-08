/**
 * Support Service - REST API Integration
 * Handles support ticket management, responses, and queue operations
 */

import { apiClient } from './api.client';
import { APIResponse } from '@/types/api';

// Types for support tickets
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  societyName: string;
  societyId: string;
  residentName: string;
  residentPhone: string;
  residentEmail?: string;
  residentFlat?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'pending_response' | 'resolved' | 'closed';
  category: 'maintenance' | 'billing' | 'community' | 'security' | 'amenities' | 'other';
  subcategory?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  responseTime?: number; // hours
  resolutionTime?: number; // hours
  satisfactionRating?: number; // 1-5 stars
  satisfactionFeedback?: string;
  attachments: TicketAttachment[];
  responses: TicketResponse[];
  tags: string[];
  escalated: boolean;
  escalationReason?: string;
  escalatedAt?: string;
  slaStatus: 'on_track' | 'at_risk' | 'breached';
  slaDeadline?: string;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  type: 'response' | 'internal_note' | 'status_change' | 'assignment' | 'escalation';
  isInternal: boolean;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  attachments?: TicketAttachment[];
  statusChange?: {
    from: SupportTicket['status'];
    to: SupportTicket['status'];
  };
  assignmentChange?: {
    from?: string;
    to: string;
    fromName?: string;
    toName: string;
  };
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  societyId: string;
  residentName: string;
  residentPhone: string;
  residentEmail?: string;
  residentFlat?: string;
  priority: SupportTicket['priority'];
  category: SupportTicket['category'];
  subcategory?: string;
  attachments?: File[];
  tags?: string[];
  assignTo?: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  priority?: SupportTicket['priority'];
  category?: SupportTicket['category'];
  subcategory?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface TicketResponseRequest {
  message: string;
  type: TicketResponse['type'];
  isInternal?: boolean;
  attachments?: File[];
  notifyResident?: boolean;
}

export interface StatusChangeRequest {
  status: SupportTicket['status'];
  reason?: string;
  notifyResident?: boolean;
  internalNote?: string;
}

export interface AssignTicketRequest {
  assignedTo: string;
  reason?: string;
  notifyAssignee?: boolean;
  notifyResident?: boolean;
}

export interface EscalateTicketRequest {
  reason: string;
  escalateTo?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes?: string;
}

export interface TicketFilters {
  status?: SupportTicket['status'] | 'all';
  priority?: SupportTicket['priority'] | 'all';
  category?: SupportTicket['category'] | 'all';
  assignedTo?: string | 'unassigned' | 'all';
  societyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tags?: string[];
  escalated?: boolean;
  slaStatus?: SupportTicket['slaStatus'];
  page?: number;
  limit?: number;
  sortBy?: 'created_date' | 'updated_date' | 'priority' | 'response_time' | 'sla_deadline';
  sortOrder?: 'asc' | 'desc';
}

export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  pendingResponse: number;
  resolved: number;
  closed: number;
  escalated: number;
  slaBreached: number;
  averageResponseTime: number; // hours
  averageResolutionTime: number; // hours
  satisfactionAverage: number; // 1-5 stars
  ticketsByPriority: Record<SupportTicket['priority'], number>;
  ticketsByCategory: Record<SupportTicket['category'], number>;
  resolutionRate: number; // percentage
}

export interface QueueStats {
  myTickets: number;
  unassignedTickets: number;
  overdue: number;
  dueSoon: number; // within next 4 hours
  highPriority: number;
  escalated: number;
  awaitingResponse: number;
}

export interface SatisfactionSurvey {
  ticketId: string;
  rating: number; // 1-5 stars
  feedback: string;
  categories: {
    responseTime: number;
    communication: number;
    resolution: number;
    overall: number;
  };
  wouldRecommend: boolean;
  additionalComments?: string;
}

/**
 * Support Service Class
 */
export class SupportService {
  private static instance: SupportService;

  public static getInstance(): SupportService {
    if (!SupportService.instance) {
      SupportService.instance = new SupportService();
    }
    return SupportService.instance;
  }

  /**
   * Get list of support tickets
   */
  async getTickets(filters?: TicketFilters): Promise<APIResponse<{
    tickets: SupportTicket[];
    totalCount: number;
    stats: SupportStats;
  }>> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters?.assignedTo && filters.assignedTo !== 'all') {
      params.append('assignedTo', filters.assignedTo);
    }
    if (filters?.societyId) {
      params.append('societyId', filters.societyId);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.escalated !== undefined) {
      params.append('escalated', filters.escalated.toString());
    }
    if (filters?.slaStatus) {
      params.append('slaStatus', filters.slaStatus);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }

    const queryString = params.toString();
    const url = `/manager/support/tickets${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get detailed support ticket by ID
   */
  async getTicket(ticketId: string): Promise<APIResponse<SupportTicket>> {
    return apiClient.get(`/manager/support/tickets/${ticketId}`);
  }

  /**
   * Create new support ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<APIResponse<SupportTicket>> {
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

    return apiClient.post('/manager/support/tickets', {
      ...data,
      attachments: attachmentUrls,
    });
  }

  /**
   * Update support ticket
   */
  async updateTicket(
    ticketId: string, 
    data: UpdateTicketRequest
  ): Promise<APIResponse<SupportTicket>> {
    return apiClient.patch(`/manager/support/tickets/${ticketId}`, data);
  }

  /**
   * Add response to ticket
   */
  async addResponse(
    ticketId: string, 
    data: TicketResponseRequest
  ): Promise<APIResponse<{ message: string; response: TicketResponse }>> {
    // If attachments are provided, upload them first
    let attachmentUrls: string[] = [];
    
    if (data.attachments && data.attachments.length > 0) {
      try {
        const uploadPromises = data.attachments.map(file => this.uploadAttachment(file));
        attachmentUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Failed to upload response attachments:', error);
        // Continue without attachments
      }
    }

    return apiClient.post(`/manager/support/tickets/${ticketId}/responses`, {
      ...data,
      attachments: attachmentUrls,
    });
  }

  /**
   * Change ticket status
   */
  async changeStatus(
    ticketId: string, 
    data: StatusChangeRequest
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/manager/support/tickets/${ticketId}/status`, data);
  }

  /**
   * Assign ticket to manager
   */
  async assignTicket(
    ticketId: string, 
    data: AssignTicketRequest
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/manager/support/tickets/${ticketId}/assign`, data);
  }

  /**
   * Escalate ticket
   */
  async escalateTicket(
    ticketId: string, 
    data: EscalateTicketRequest
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/manager/support/tickets/${ticketId}/escalate`, data);
  }

  /**
   * Get ticket history/timeline
   */
  async getTicketHistory(
    ticketId: string
  ): Promise<APIResponse<{
    timeline: Array<{
      id: string;
      action: string;
      description: string;
      performedBy: string;
      performedByName: string;
      performedAt: string;
      metadata?: any;
    }>;
  }>> {
    return apiClient.get(`/manager/support/tickets/${ticketId}/history`);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<APIResponse<QueueStats>> {
    return apiClient.get('/manager/support/queue/stats');
  }

  /**
   * Get support statistics
   */
  async getSupportStats(
    period?: '24h' | '7d' | '30d' | '90d'
  ): Promise<APIResponse<SupportStats & {
    trendsData: Array<{
      date: string;
      tickets: number;
      resolved: number;
      responseTime: number;
      satisfaction: number;
    }>;
    topIssues: Array<{
      category: string;
      subcategory?: string;
      count: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    performanceMetrics: {
      firstResponseTime: number;
      resolutionTime: number;
      customerSatisfaction: number;
      slaCompliance: number;
    };
  }>> {
    const params = period ? `?period=${period}` : '';
    return apiClient.get(`/manager/support/stats${params}`);
  }

  /**
   * Bulk operations
   */
  async bulkAssign(
    ticketIds: string[],
    assignedTo: string,
    reason?: string
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/manager/support/tickets/bulk/assign', {
      ticketIds,
      assignedTo,
      reason,
    });
  }

  async bulkStatusChange(
    ticketIds: string[],
    status: SupportTicket['status'],
    reason?: string
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/manager/support/tickets/bulk/status', {
      ticketIds,
      status,
      reason,
    });
  }

  async bulkEscalate(
    ticketIds: string[],
    reason: string,
    escalateTo?: string
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/manager/support/tickets/bulk/escalate', {
      ticketIds,
      reason,
      escalateTo,
    });
  }

  /**
   * Export tickets data
   */
  async exportTickets(
    format: 'csv' | 'xlsx' | 'pdf',
    filters?: TicketFilters
  ): Promise<APIResponse<{ 
    downloadUrl: string; 
    expiresAt: string;
    fileName: string;
  }>> {
    return apiClient.post('/manager/support/tickets/export', {
      format,
      filters,
    });
  }

  /**
   * Get available managers for assignment
   */
  async getAvailableManagers(): Promise<APIResponse<{
    managers: Array<{
      id: string;
      name: string;
      email: string;
      currentLoad: number; // number of active tickets
      maxCapacity: number;
      specializations: string[];
      availability: 'available' | 'busy' | 'away';
      averageResponseTime: number;
      satisfactionRating: number;
    }>;
  }>> {
    return apiClient.get('/manager/support/managers/available');
  }

  /**
   * Get ticket templates
   */
  async getTicketTemplates(): Promise<APIResponse<{
    templates: Array<{
      id: string;
      name: string;
      category: SupportTicket['category'];
      priority: SupportTicket['priority'];
      title: string;
      description: string;
      tags: string[];
      estimatedResolutionTime: number; // hours
    }>;
  }>> {
    return apiClient.get('/manager/support/templates');
  }

  /**
   * Get SLA configuration
   */
  async getSLAConfig(): Promise<APIResponse<{
    responseTime: Record<SupportTicket['priority'], number>; // hours
    resolutionTime: Record<SupportTicket['priority'], number>; // hours
    escalationRules: Array<{
      condition: string;
      action: string;
      timeThreshold: number;
      priority?: SupportTicket['priority'];
      category?: SupportTicket['category'];
    }>;
  }>> {
    return apiClient.get('/manager/support/sla');
  }

  /**
   * Submit satisfaction survey
   */
  async submitSatisfactionSurvey(
    ticketId: string,
    survey: Omit<SatisfactionSurvey, 'ticketId'>
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post(`/manager/support/tickets/${ticketId}/satisfaction`, {
      ...survey,
      ticketId,
    });
  }

  /**
   * Get satisfaction surveys
   */
  async getSatisfactionSurveys(
    filters?: {
      period?: '7d' | '30d' | '90d' | '1y';
      rating?: number;
      ticketId?: string;
      managerId?: string;
    }
  ): Promise<APIResponse<{
    surveys: SatisfactionSurvey[];
    averageRating: number;
    responseRate: number; // percentage
    insights: {
      topComplaints: string[];
      topPraises: string[];
      improvementAreas: string[];
    };
  }>> {
    const params = new URLSearchParams();
    
    if (filters?.period) params.append('period', filters.period);
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.ticketId) params.append('ticketId', filters.ticketId);
    if (filters?.managerId) params.append('managerId', filters.managerId);

    const queryString = params.toString();
    const url = `/manager/support/satisfaction${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Upload attachment for support ticket
   */
  private async uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'support');

    const response = await apiClient.upload('/uploads/support', formData);
    return response.data.url;
  }

  /**
   * Get real-time ticket updates via WebSocket (placeholder)
   */
  subscribeToTicketUpdates(callback: (update: {
    type: 'new_ticket' | 'status_change' | 'new_response' | 'assignment';
    ticket: SupportTicket;
    details?: any;
  }) => void): () => void {
    // In a real implementation, this would establish a WebSocket connection
    console.log('WebSocket subscription for ticket updates established');
    
    // Return cleanup function
    return () => {
      console.log('WebSocket subscription for tickets cleaned up');
    };
  }

  /**
   * Auto-assign tickets based on load balancing
   */
  async autoAssignTickets(
    ticketIds: string[],
    criteria: {
      balanceLoad?: boolean;
      matchSpecialization?: boolean;
      considerAvailability?: boolean;
    } = {}
  ): Promise<APIResponse<{
    assignments: Array<{
      ticketId: string;
      assignedTo: string;
      assignedToName: string;
      reason: string;
    }>;
    failed: Array<{ ticketId: string; error: string }>;
  }>> {
    return apiClient.post('/manager/support/tickets/auto-assign', {
      ticketIds,
      criteria,
    });
  }
}

// Export singleton instance
export const supportService = SupportService.getInstance();

// Export types for use in components
export type {
  SupportTicket,
  TicketAttachment,
  TicketResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketResponseRequest,
  StatusChangeRequest,
  AssignTicketRequest,
  EscalateTicketRequest,
  TicketFilters,
  SupportStats,
  QueueStats,
  SatisfactionSurvey,
};