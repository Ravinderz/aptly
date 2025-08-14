// Phase 9: Advanced Analytics & Optimization - Component Exports
// Comprehensive analytics system with audit logging, performance metrics, and notification management

export { AuditSystem } from './AuditSystem';
export { AdvancedAnalyticsDashboard } from './AnalyticsDashboard';
export { NotificationManager } from './NotificationManager';
export { PerformanceOptimizer } from './PerformanceOptimizer';

// Re-export types for convenience
export type {
  AuditEntry,
  AuditAction,
  AuditResource,
  SocietyAnalytics,
  SocietyKPIs,
  PerformanceMetrics,
  SystemHealth,
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  IntelligentDelivery,
  OptimizationRecommendation,
} from '../../types/analytics';
