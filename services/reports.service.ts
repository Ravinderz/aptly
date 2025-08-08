/**
 * Reports Service - REST API Integration
 * Handles manager performance reports, analytics, and export functionality
 */

import { apiClient } from './api.client';
import { APIResponse } from '@/types/api';

// Types for performance reports
export interface PerformanceMetrics {
  period: 'week' | 'month' | 'quarter' | 'year';
  totalTickets: number;
  resolvedTickets: number;
  averageResponseTime: number; // hours
  satisfactionScore: number; // percentage
  societiesManaged: number;
  resolutionRate: number; // percentage
  trendsData: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  totalTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  satisfactionScore: number;
}

export interface SocietyPerformance {
  societyId: string;
  societyName: string;
  societyCode: string;
  ticketsHandled: number;
  averageResponseTime: number;
  satisfactionScore: number;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
  resolutionRate: number;
  lastUpdated: string;
  managedBy: string;
  performanceGrade: string;
}

export interface ReportFilters {
  period: 'week' | 'month' | 'quarter' | 'year';
  managerId?: string;
  societyIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  includeResolved?: boolean;
  includePending?: boolean;
  performanceThreshold?: number; // 0-100
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'xlsx';
  includeCharts?: boolean;
  includeDetails?: boolean;
  societyBreakdown?: boolean;
  timeSeriesData?: boolean;
}

export interface ManagerStats {
  totalSocieties: number;
  activeSocieties: number;
  totalTicketsHandled: number;
  avgResponseTime: number;
  satisfactionRating: number;
  performanceGrade: string;
  rankingPosition: number;
  totalManagers: number;
}

export interface TeamComparison {
  managerId: string;
  managerName: string;
  societiesManaged: number;
  ticketsHandled: number;
  avgResponseTime: number;
  satisfactionScore: number;
  resolutionRate: number;
  performanceGrade: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DetailedReport {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  generatedBy: string;
  period: ReportFilters['period'];
  metrics: PerformanceMetrics;
  societyPerformance: SocietyPerformance[];
  teamComparison: TeamComparison[];
  recommendations: ReportRecommendation[];
  exportUrls: {
    pdf?: string;
    csv?: string;
    xlsx?: string;
  };
}

export interface ReportRecommendation {
  id: string;
  type: 'warning' | 'suggestion' | 'critical' | 'improvement';
  title: string;
  description: string;
  actionRequired: boolean;
  priority: 'high' | 'medium' | 'low';
  affectedSocieties: string[];
  suggestedActions: string[];
}

/**
 * Reports Service Class
 */
export class ReportsService {
  private static instance: ReportsService;

  public static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  /**
   * Get performance metrics for manager
   */
  async getPerformanceMetrics(
    filters: ReportFilters
  ): Promise<APIResponse<{
    metrics: PerformanceMetrics;
    managerStats: ManagerStats;
  }>> {
    const params = new URLSearchParams();
    
    params.append('period', filters.period);
    
    if (filters.managerId) {
      params.append('managerId', filters.managerId);
    }
    if (filters.societyIds && filters.societyIds.length > 0) {
      params.append('societyIds', filters.societyIds.join(','));
    }
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters.includeResolved !== undefined) {
      params.append('includeResolved', filters.includeResolved.toString());
    }
    if (filters.includePending !== undefined) {
      params.append('includePending', filters.includePending.toString());
    }
    if (filters.performanceThreshold) {
      params.append('performanceThreshold', filters.performanceThreshold.toString());
    }

    const queryString = params.toString();
    const url = `/manager/reports/performance${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get society-wise performance data
   */
  async getSocietyPerformance(
    filters: ReportFilters
  ): Promise<APIResponse<{
    societies: SocietyPerformance[];
    totalCount: number;
  }>> {
    const params = new URLSearchParams();
    
    params.append('period', filters.period);
    
    if (filters.managerId) {
      params.append('managerId', filters.managerId);
    }
    if (filters.societyIds && filters.societyIds.length > 0) {
      params.append('societyIds', filters.societyIds.join(','));
    }
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    const queryString = params.toString();
    const url = `/manager/reports/society-performance${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get team comparison data
   */
  async getTeamComparison(
    period: ReportFilters['period'] = 'month'
  ): Promise<APIResponse<{
    teamComparison: TeamComparison[];
    currentManager: TeamComparison;
  }>> {
    const params = new URLSearchParams();
    params.append('period', period);

    const queryString = params.toString();
    const url = `/manager/reports/team-comparison${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Generate detailed report
   */
  async generateDetailedReport(
    filters: ReportFilters,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<APIResponse<{
    reportId: string;
    status: 'generating' | 'completed' | 'failed';
    downloadUrl?: string;
    expiresAt?: string;
  }>> {
    return apiClient.post('/manager/reports/generate', {
      filters,
      options,
    });
  }

  /**
   * Get report status and download URL
   */
  async getReportStatus(
    reportId: string
  ): Promise<APIResponse<{
    reportId: string;
    status: 'generating' | 'completed' | 'failed';
    downloadUrl?: string;
    expiresAt?: string;
    error?: string;
  }>> {
    return apiClient.get(`/manager/reports/status/${reportId}`);
  }

  /**
   * Export performance data
   */
  async exportReport(
    filters: ReportFilters,
    options: ExportOptions
  ): Promise<APIResponse<{
    downloadUrl: string;
    expiresAt: string;
    fileName: string;
    fileSize: number;
  }>> {
    return apiClient.post('/manager/reports/export', {
      filters,
      options,
    });
  }

  /**
   * Get historical performance trends
   */
  async getPerformanceTrends(
    period: ReportFilters['period'] = 'month',
    dataPoints: number = 12
  ): Promise<APIResponse<{
    trends: TrendDataPoint[];
    insights: {
      bestPeriod: TrendDataPoint;
      worstPeriod: TrendDataPoint;
      averageImprovement: number;
      trendDirection: 'improving' | 'declining' | 'stable';
    };
  }>> {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('dataPoints', dataPoints.toString());

    const queryString = params.toString();
    const url = `/manager/reports/trends${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get performance insights and recommendations
   */
  async getPerformanceInsights(
    period: ReportFilters['period'] = 'month'
  ): Promise<APIResponse<{
    recommendations: ReportRecommendation[];
    insights: {
      keyStrengths: string[];
      improvementAreas: string[];
      urgentActions: ReportRecommendation[];
      performanceSummary: string;
    };
  }>> {
    const params = new URLSearchParams();
    params.append('period', period);

    const queryString = params.toString();
    const url = `/manager/reports/insights${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get society details for performance report
   */
  async getSocietyDetails(
    societyId: string,
    period: ReportFilters['period'] = 'month'
  ): Promise<APIResponse<{
    society: SocietyPerformance;
    detailedMetrics: {
      ticketsByCategory: Record<string, number>;
      resolutionTimeByPriority: Record<string, number>;
      satisfactionTrend: TrendDataPoint[];
      recentActivity: Array<{
        date: string;
        type: 'ticket_created' | 'ticket_resolved' | 'satisfaction_survey';
        description: string;
        impact: 'positive' | 'negative' | 'neutral';
      }>;
    };
    recommendations: ReportRecommendation[];
  }>> {
    const params = new URLSearchParams();
    params.append('period', period);

    const queryString = params.toString();
    const url = `/manager/reports/society/${societyId}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Get manager dashboard summary
   */
  async getDashboardSummary(): Promise<APIResponse<{
    currentWeek: PerformanceMetrics;
    currentMonth: PerformanceMetrics;
    alerts: Array<{
      id: string;
      type: 'performance' | 'satisfaction' | 'response_time' | 'resolution_rate';
      severity: 'high' | 'medium' | 'low';
      message: string;
      societyId?: string;
      societyName?: string;
      actionRequired: boolean;
      createdAt: string;
    }>;
    upcomingDeadlines: Array<{
      id: string;
      title: string;
      dueDate: string;
      priority: 'high' | 'medium' | 'low';
      type: 'report' | 'review' | 'survey' | 'audit';
    }>;
  }>> {
    return apiClient.get('/manager/reports/dashboard');
  }

  /**
   * Archive old reports
   */
  async archiveReports(
    reportIds: string[]
  ): Promise<APIResponse<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return apiClient.post('/manager/reports/archive', {
      reportIds,
    });
  }

  /**
   * Get report history
   */
  async getReportHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<APIResponse<{
    reports: Array<{
      id: string;
      title: string;
      type: 'performance' | 'society' | 'comparison' | 'detailed';
      generatedAt: string;
      period: ReportFilters['period'];
      status: 'completed' | 'archived' | 'expired';
      downloadUrl?: string;
      expiresAt?: string;
    }>;
    totalCount: number;
  }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const queryString = params.toString();
    const url = `/manager/reports/history${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  }

  /**
   * Subscribe to report notifications
   */
  async subscribeToNotifications(
    settings: {
      weeklyReport: boolean;
      monthlyReport: boolean;
      performanceAlerts: boolean;
      satisfactionAlerts: boolean;
      customThresholds: {
        responseTime: number; // hours
        satisfactionScore: number; // percentage
        resolutionRate: number; // percentage
      };
    }
  ): Promise<APIResponse<{ message: string }>> {
    return apiClient.post('/manager/reports/notifications/subscribe', settings);
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<APIResponse<{
    weeklyReport: boolean;
    monthlyReport: boolean;
    performanceAlerts: boolean;
    satisfactionAlerts: boolean;
    customThresholds: {
      responseTime: number;
      satisfactionScore: number;
      resolutionRate: number;
    };
  }>> {
    return apiClient.get('/manager/reports/notifications/settings');
  }
}

// Export singleton instance
export const reportsService = ReportsService.getInstance();

// Export types for use in components
export type {
  PerformanceMetrics,
  TrendDataPoint,
  SocietyPerformance,
  ReportFilters,
  ExportOptions,
  ManagerStats,
  TeamComparison,
  DetailedReport,
  ReportRecommendation,
};