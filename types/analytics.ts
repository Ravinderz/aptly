// Phase 9: Advanced Analytics & Optimization Types
// Comprehensive type definitions for audit systems, analytics, notifications, and performance monitoring

// ===============================
// AUDIT SYSTEM TYPES
// ===============================

export interface AuditEntry {
  id: string;
  sessionId: string;
  userId: string;
  userRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  
  // Event details
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: DeviceInfo;
  location?: GeolocationInfo;
  
  // Action context
  context: AuditContext;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  changes?: ChangeLog[];
  
  // Classification
  severity: AuditSeverity;
  category: AuditCategory;
  tags: string[];
  
  // Compliance and retention
  retentionPolicy: RetentionPolicy;
  complianceLevel: ComplianceLevel;
  isPersonalData: boolean;
  
  // Additional metadata
  metadata: Record<string, any>;
  correlationId?: string;
  parentAuditId?: string;
  childAuditIds: string[];
}

export type AuditAction = 
  // Authentication actions
  | 'login' | 'logout' | 'failed_login' | 'password_change' | 'account_locked'
  // Data actions
  | 'create' | 'read' | 'update' | 'delete' | 'bulk_update' | 'bulk_delete'
  // Administrative actions
  | 'role_change' | 'permission_grant' | 'permission_revoke' | 'user_activation' | 'user_deactivation'
  // Governance actions
  | 'vote_cast' | 'campaign_create' | 'emergency_declare' | 'policy_propose' | 'succession_trigger'
  // System actions
  | 'export_data' | 'import_data' | 'backup_create' | 'system_config' | 'maintenance_mode'
  // Financial actions
  | 'payment_process' | 'bill_generate' | 'expense_approve' | 'budget_allocate'
  // Security actions
  | 'access_denied' | 'suspicious_activity' | 'data_breach_detected' | 'security_policy_change';

export type AuditResource = 
  | 'user' | 'society' | 'resident' | 'visitor' | 'maintenance_request' | 'bill' | 'payment'
  | 'notice' | 'community_post' | 'voting_campaign' | 'emergency_alert' | 'policy_proposal'
  | 'vendor' | 'amenity' | 'vehicle' | 'document' | 'notification' | 'system_config'
  | 'audit_log' | 'report' | 'backup' | 'session' | 'api_key';

export type AuditSeverity = 
  | 'critical'    // Security incidents, data breaches, system failures
  | 'high'        // Administrative actions, financial operations, governance actions
  | 'medium'      // Data modifications, user management, configuration changes
  | 'low'         // Read operations, routine activities, informational events
  | 'info';       // System events, performance metrics, debug information

export type AuditCategory = 
  | 'security' | 'authentication' | 'authorization' | 'data_privacy' | 'financial'
  | 'governance' | 'administrative' | 'operational' | 'performance' | 'compliance'
  | 'user_activity' | 'system_event' | 'integration' | 'maintenance';

export interface AuditContext {
  feature: string;
  module: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  errorMessage?: string;
  stackTrace?: string;
  requestSize?: number;
  responseSize?: number;
  cacheHit?: boolean;
  rateLimited?: boolean;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  osVersion: string;
  appVersion: string;
  deviceModel?: string;
  deviceId: string;
  screenResolution?: string;
  timezone: string;
  language: string;
  connectivity: 'wifi' | 'cellular' | 'offline';
}

export interface GeolocationInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  country?: string;
  timestamp: string;
}

export interface ChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
  dataType: string;
  changeReason?: string;
}

export type RetentionPolicy = '7_days' | '30_days' | '90_days' | '1_year' | '3_years' | '7_years' | 'permanent';
export type ComplianceLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';

// ===============================
// ANALYTICS TYPES
// ===============================

export interface SocietyAnalytics {
  societyId: string;
  societyName: string;
  reportPeriod: ReportPeriod;
  generatedAt: string;
  
  // Key Performance Indicators
  kpis: SocietyKPIs;
  
  // Operational metrics
  operationalMetrics: OperationalMetrics;
  
  // Financial analytics
  financialAnalytics: FinancialAnalytics;
  
  // Governance metrics
  governanceMetrics: GovernanceMetrics;
  
  // Community engagement
  communityMetrics: CommunityMetrics;
  
  // Performance insights
  performanceInsights: PerformanceInsight[];
  
  // Recommendations
  recommendations: AnalyticsRecommendation[];
  
  // Trends and predictions
  trends: TrendAnalysis[];
  predictions: PredictiveAnalysis[];
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  comparisonPeriod?: ReportPeriod;
}

export interface SocietyKPIs {
  // Satisfaction metrics
  residentSatisfactionScore: number;
  npsScore: number; // Net Promoter Score
  complaintResolutionRate: number;
  
  // Operational efficiency
  maintenanceResponseTime: number; // hours
  billCollectionRate: number; // percentage
  occupancyRate: number; // percentage
  
  // Financial health
  monthlyCollectionEfficiency: number;
  outstandingDuesPercentage: number;
  operationalCostPerUnit: number;
  
  // Community engagement
  activeResidentPercentage: number;
  eventParticipationRate: number;
  digitalAdoptionRate: number;
  
  // Safety and security
  emergencyResponseTime: number; // minutes
  securityIncidentRate: number; // per month
  visitorComplianceRate: number;
}

export interface OperationalMetrics {
  // Maintenance metrics
  maintenance: {
    totalRequests: number;
    completedRequests: number;
    averageResolutionTime: number;
    requestsByCategory: Record<string, number>;
    residentSatisfactionRating: number;
    costPerRequest: number;
  };
  
  // Visitor management
  visitorManagement: {
    totalVisitors: number;
    approvalRate: number;
    averageApprovalTime: number;
    qrCodeUsageRate: number;
    securityIncidents: number;
    peakVisitorHours: TimeSlot[];
  };
  
  // Amenity utilization
  amenityUtilization: {
    bookingRate: number; // percentage of capacity used
    noShowRate: number;
    averageBookingDuration: number;
    mostPopularAmenities: AmenityUsage[];
    revenueGenerated: number;
  };
  
  // Communication effectiveness
  communication: {
    noticeReadRate: number;
    notificationDeliveryRate: number;
    communityPostEngagement: number;
    averageResponseTime: number;
  };
}

export interface FinancialAnalytics {
  // Collection metrics
  collections: {
    totalCollected: number;
    collectionEfficiency: number;
    outstandingAmount: number;
    collectionTrend: DataPoint[];
    paymentMethodBreakdown: PaymentMethodStats[];
  };
  
  // Expense tracking
  expenses: {
    totalExpenses: number;
    expenseByCategory: CategoryExpense[];
    budgetVariance: number;
    costPerSqFt: number;
    expenseTrend: DataPoint[];
  };
  
  // Revenue optimization
  revenue: {
    utilityBillCommissions: number;
    amenityBookingRevenue: number;
    parkingFees: number;
    otherRevenues: number;
    revenueGrowthRate: number;
  };
  
  // Financial health indicators
  healthIndicators: {
    cashFlowRatio: number;
    debtToAssetRatio: number;
    emergencyFundRatio: number;
    collectionConsistency: number;
  };
}

export interface GovernanceMetrics {
  // Democratic participation
  democraticParticipation: {
    votingParticipationRate: number;
    policyProposalEngagement: number;
    meetingAttendance: number;
    feedbackResponseRate: number;
  };
  
  // Leadership effectiveness
  leadership: {
    decisionMakingSpeed: number; // days
    implementationSuccess: number; // percentage
    residentApprovalRating: number;
    transparencyScore: number;
  };
  
  // Compliance tracking
  compliance: {
    policyComplianceRate: number;
    regulatoryAdherence: number;
    auditFindings: AuditFinding[];
    correctionTime: number; // days
  };
  
  // Emergency preparedness
  emergencyPreparedness: {
    responseReadiness: number;
    drillParticipation: number;
    equipmentStatus: EquipmentStatus;
    contactUpdatedRate: number;
  };
}

export interface CommunityMetrics {
  // Engagement levels
  engagement: {
    activeUsers: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    engagementRate: number;
    sessionDuration: number;
  };
  
  // Communication patterns
  communication: {
    postsPerUser: number;
    commentsPerPost: number;
    likesPerPost: number;
    mentionsPerUser: number;
    responsiveness: number;
  };
  
  // Community health
  communityHealth: {
    conflictResolutionRate: number;
    cooperationIndex: number;
    diversityIndex: number;
    inclusionScore: number;
    wellbeingIndex: number;
  };
  
  // Event participation
  events: {
    eventAttendance: number;
    volunteerParticipation: number;
    feedbackSentiment: SentimentAnalysis;
    recurringParticipants: number;
  };
}

export interface PerformanceInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  impact: ImpactLevel;
  confidence: number; // 0-1
  trend: TrendDirection;
  dataPoints: DataPoint[];
  recommendations: string[];
  estimatedImprovement: number;
  implementationEffort: EffortLevel;
  tags: string[];
}

export interface AnalyticsRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  expectedBenefit: string;
  estimatedImpact: ImpactMetric;
  implementationSteps: ImplementationStep[];
  requiredResources: Resource[];
  timeframe: string;
  successMetrics: SuccessMetric[];
  riskFactors: RiskFactor[];
}

export interface TrendAnalysis {
  metric: string;
  period: string;
  direction: TrendDirection;
  magnitude: number;
  significance: number; // statistical significance
  seasonality?: SeasonalPattern;
  anomalies: Anomaly[];
  forecast: ForecastPoint[];
}

export interface PredictiveAnalysis {
  model: string;
  target: string;
  prediction: number;
  confidence: number;
  timeHorizon: string;
  influencingFactors: Factor[];
  scenarios: Scenario[];
  lastUpdated: string;
}

// ===============================
// NOTIFICATION SYSTEM TYPES
// ===============================

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  type: NotificationType;
  
  // Template content
  subject: string;
  content: string;
  htmlContent?: string;
  
  // Localization
  translations: Record<string, NotificationTranslation>;
  
  // Personalization
  variables: TemplateVariable[];
  conditionalContent: ConditionalContent[];
  
  // Delivery settings
  channels: NotificationChannel[];
  priority: NotificationPriority;
  deliveryStrategy: DeliveryStrategy;
  
  // Scheduling and timing
  schedulingRules: SchedulingRule[];
  respectDND: boolean;
  timeZoneAware: boolean;
  
  // Compliance and retention
  retentionPolicy: RetentionPolicy;
  requiresConsent: boolean;
  gdprCompliant: boolean;
  
  // Analytics tracking
  trackingEnabled: boolean;
  customEvents: string[];
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  templateId: string;
  
  // Audience targeting
  audience: AudienceSegment;
  recipientCount: number;
  
  // Scheduling
  scheduledAt?: string;
  timeZone: string;
  deliveryWindow: DeliveryWindow;
  
  // A/B testing
  isABTest: boolean;
  testVariants?: TestVariant[];
  winnerCriteria?: WinnerCriteria;
  
  // Status and tracking
  status: CampaignStatus;
  deliveryStats: DeliveryStats;
  engagementMetrics: EngagementMetrics;
  
  // Budget and limits
  budget?: CampaignBudget;
  rateLimits: RateLimit[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  userId: string;
  
  // Channel preferences
  channels: {
    push: ChannelPreference;
    email: ChannelPreference;
    sms: ChannelPreference;
    inApp: ChannelPreference;
    whatsapp: ChannelPreference;
  };
  
  // Category preferences
  categories: Record<NotificationCategory, CategoryPreference>;
  
  // Timing preferences
  quietHours: QuietHours;
  timeZone: string;
  preferredLanguage: string;
  
  // Frequency controls
  frequencyLimits: FrequencyLimit[];
  digestSettings: DigestSettings;
  
  // Privacy settings
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  
  lastUpdated: string;
}

export interface IntelligentDelivery {
  userId: string;
  
  // User behavior patterns
  activityPattern: ActivityPattern;
  engagementHistory: EngagementHistory;
  deviceUsagePattern: DeviceUsagePattern;
  
  // Optimal delivery timing
  optimalDeliveryTimes: OptimalTime[];
  timeZonePreference: string;
  
  // Channel effectiveness
  channelPreference: ChannelEffectiveness[];
  contentPreference: ContentPreference;
  
  // Predictive insights
  churnRisk: number; // 0-1
  engagementScore: number; // 0-1
  lifetimeValue: number;
  
  // Personalization data
  interests: string[];
  topics: TopicRelevance[];
  demographicData: DemographicData;
  
  lastAnalyzed: string;
}

// ===============================
// PERFORMANCE & MONITORING TYPES
// ===============================

export interface PerformanceMetrics {
  timestamp: string;
  
  // Application performance
  application: {
    responseTime: number; // ms
    throughput: number; // requests per second
    errorRate: number; // percentage
    crashRate: number; // percentage
    
    // Mobile specific
    appLaunchTime: number; // ms
    batteryUsage: number; // mAh per session
    memoryUsage: number; // MB
    cpuUsage: number; // percentage
    
    // Network performance
    networkLatency: number; // ms
    dataUsage: number; // KB per session
    offlineCapability: number; // percentage
  };
  
  // Database performance
  database: {
    queryTime: number; // average ms
    connectionPool: number; // active connections
    slowQueries: number; // count
    cacheHitRatio: number; // percentage
    indexEfficiency: number; // percentage
  };
  
  // API performance
  api: {
    averageResponseTime: number; // ms
    p95ResponseTime: number; // ms
    errorRate: number; // percentage
    rateLimitHits: number; // count
    concurrentUsers: number;
  };
  
  // User experience metrics
  userExperience: {
    satisfactionScore: number; // 1-5
    taskCompletionRate: number; // percentage
    abandonmentRate: number; // percentage
    featureAdoptionRate: number; // percentage
    supportTickets: number; // count
  };
}

export interface SystemHealth {
  overall: HealthStatus;
  components: ComponentHealth[];
  dependencies: DependencyHealth[];
  
  // Resource utilization
  resources: {
    cpu: ResourceMetric;
    memory: ResourceMetric;
    storage: ResourceMetric;
    network: ResourceMetric;
  };
  
  // Alerts and incidents
  activeAlerts: Alert[];
  recentIncidents: Incident[];
  
  // Availability metrics
  uptime: number; // percentage
  lastDowntime: string;
  mtbf: number; // mean time between failures (hours)
  mttr: number; // mean time to recovery (minutes)
  
  lastUpdated: string;
}

export interface OptimizationRecommendation {
  id: string;
  category: OptimizationCategory;
  priority: OptimizationPriority;
  
  title: string;
  description: string;
  currentState: string;
  proposedSolution: string;
  
  impact: {
    performanceImprovement: number; // percentage
    costSavings: number; // amount
    userExperienceScore: number; // 1-10
    implementationComplexity: number; // 1-10
  };
  
  implementationPlan: ImplementationStep[];
  estimatedTimeline: string;
  requiredResources: string[];
  
  measurableOutcomes: OutcomeMetric[];
  rollbackPlan: string;
  
  createdAt: string;
  status: RecommendationStatus;
}

// ===============================
// SUPPORTING TYPES
// ===============================

export type InsightCategory = 'performance' | 'financial' | 'operational' | 'community' | 'governance';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable' | 'volatile';
export type EffortLevel = 'low' | 'medium' | 'high';

export type RecommendationType = 'optimization' | 'cost_saving' | 'engagement' | 'efficiency' | 'compliance';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low' | 'optional';

export type NotificationCategory = 'maintenance' | 'billing' | 'visitor' | 'emergency' | 'community' | 'governance' | 'system';
export type NotificationType = 'transactional' | 'promotional' | 'informational' | 'reminder' | 'alert';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app' | 'whatsapp';
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';
export type OptimizationCategory = 'performance' | 'cost' | 'security' | 'user_experience' | 'scalability';
export type OptimizationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';

// ===============================
// INTERFACE DEFINITIONS
// ===============================

export interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TimeSlot {
  startHour: number;
  endHour: number;
  value: number;
  day?: string;
}

export interface AmenityUsage {
  amenityId: string;
  amenityName: string;
  bookingCount: number;
  revenue: number;
  rating: number;
}

export interface PaymentMethodStats {
  method: string;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  trend: TrendDirection;
}

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  category: string;
  description: string;
  recommendedAction: string;
  status: 'open' | 'in_progress' | 'resolved';
  dueDate: string;
}

export interface EquipmentStatus {
  total: number;
  operational: number;
  needsMaintenance: number;
  outOfService: number;
  lastInspection: string;
}

export interface SentimentAnalysis {
  positive: number; // percentage
  negative: number; // percentage
  neutral: number; // percentage
  overallScore: number; // -1 to 1
}

export interface ImpactMetric {
  metric: string;
  currentValue: number;
  projectedValue: number;
  improvement: number;
  unit: string;
}

export interface ImplementationStep {
  step: number;
  title: string;
  description: string;
  estimatedDuration: string;
  dependencies: string[];
  resources: string[];
}

export interface Resource {
  type: 'human' | 'financial' | 'technical' | 'time';
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface SuccessMetric {
  metric: string;
  target: number;
  measurementMethod: string;
  frequency: string;
}

export interface RiskFactor {
  risk: string;
  probability: number; // 0-1
  impact: ImpactLevel;
  mitigation: string;
}

export interface SeasonalPattern {
  pattern: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  peaks: string[];
  troughs: string[];
  cyclicalityStrength: number; // 0-1
}

export interface Anomaly {
  timestamp: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AnomalySeverity;
  possibleCauses: string[];
}

export interface ForecastPoint {
  timestamp: string;
  value: number;
  confidence: number; // 0-1
  upperBound: number;
  lowerBound: number;
}

export interface Factor {
  name: string;
  importance: number; // 0-1
  correlation: number; // -1 to 1
  trend: TrendDirection;
}

export interface Scenario {
  name: string;
  description: string;
  probability: number; // 0-1
  predictedOutcome: number;
  keyAssumptions: string[];
}

export interface ComponentHealth {
  component: string;
  status: HealthStatus;
  responseTime?: number;
  lastCheck: string;
  errorRate?: number;
  dependencies: string[];
}

export interface DependencyHealth {
  service: string;
  status: HealthStatus;
  latency: number;
  availability: number; // percentage
  lastCheck: string;
}

export interface ResourceMetric {
  current: number;
  average: number;
  peak: number;
  threshold: number;
  unit: string;
  trend: TrendDirection;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  component: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigating' | 'resolved';
  affectedServices: string[];
  startTime: string;
  resolvedTime?: string;
  rootCause?: string;
}

export interface OutcomeMetric {
  name: string;
  baseline: number;
  target: number;
  unit: string;
  measurementPeriod: string;
}

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

// ===============================
// API REQUEST/RESPONSE TYPES
// ===============================

export interface GenerateReportRequest {
  societyId: string;
  reportType: 'society_analytics' | 'financial' | 'operational' | 'governance' | 'community';
  period: ReportPeriod;
  includeRecommendations: boolean;
  includePredictions: boolean;
  format: 'json' | 'pdf' | 'csv' | 'excel';
}

export interface AuditLogQuery {
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  severity?: AuditSeverity;
  category?: AuditCategory;
  startDate: string;
  endDate: string;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

export interface NotificationCampaignRequest {
  templateId: string;
  audience: AudienceSegment;
  scheduledAt?: string;
  isABTest?: boolean;
  testVariants?: TestVariant[];
  metadata?: Record<string, any>;
}

export interface OptimizationAnalysisRequest {
  societyId: string;
  categories: OptimizationCategory[];
  timeframe: string;
  includeResourceEstimates: boolean;
  priorityThreshold: OptimizationPriority;
}

// Additional interfaces that would be referenced above but need definition
export interface NotificationTranslation {
  language: string;
  subject: string;
  content: string;
  htmlContent?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface ConditionalContent {
  condition: string;
  content: string;
  elseContent?: string;
}

export interface DeliveryStrategy {
  type: 'immediate' | 'scheduled' | 'optimal_time' | 'batch';
  batchSize?: number;
  retryAttempts: number;
  retryDelay: number; // minutes
  fallbackChannels: NotificationChannel[];
}

export interface SchedulingRule {
  type: 'time_based' | 'event_based' | 'user_activity_based';
  condition: string;
  action: string;
}

export interface AudienceSegment {
  name: string;
  criteria: SegmentCriteria[];
  estimatedSize: number;
  isStatic: boolean;
}

export interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface DeliveryWindow {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
  daysOfWeek: string[];
}

export interface TestVariant {
  id: string;
  name: string;
  percentage: number;
  templateOverrides: Partial<NotificationTemplate>;
}

export interface WinnerCriteria {
  metric: 'open_rate' | 'click_rate' | 'conversion_rate';
  minimumSampleSize: number;
  confidenceLevel: number; // 0-1
  testDuration: number; // hours
}

export interface DeliveryStats {
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  deliveryRate: number; // percentage
}

export interface EngagementMetrics {
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  conversionRate: number; // percentage
}

export interface CampaignBudget {
  total: number;
  perRecipient: number;
  currency: string;
  spent: number;
}

export interface RateLimit {
  channel: NotificationChannel;
  maxPerHour: number;
  maxPerDay: number;
  maxPerWeek: number;
}

export interface ChannelPreference {
  enabled: boolean;
  priority: number; // 1-5
  fallbackEnabled: boolean;
}

export interface CategoryPreference {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  channels: NotificationChannel[];
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string;
  weekdaysOnly: boolean;
}

export interface FrequencyLimit {
  category: NotificationCategory;
  maxPerHour: number;
  maxPerDay: number;
  maxPerWeek: number;
}

export interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string; // HH:MM
  categories: NotificationCategory[];
}

export interface ActivityPattern {
  mostActiveHours: number[];
  mostActiveDays: string[];
  sessionDuration: number; // average minutes
  screenTimePattern: TimeSlot[];
}

export interface EngagementHistory {
  totalNotifications: number;
  openRate: number;
  clickRate: number;
  preferredChannels: NotificationChannel[];
  engagementTrend: TrendDirection;
  lastEngagement: string;
}

export interface DeviceUsagePattern {
  primaryDevice: 'mobile' | 'tablet' | 'desktop';
  onlineHours: TimeSlot[];
  pushNotificationEnabled: boolean;
  averageResponseTime: number; // minutes
}

export interface OptimalTime {
  hour: number;
  day: string;
  score: number; // 0-1
  timezone: string;
}

export interface ChannelEffectiveness {
  channel: NotificationChannel;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  optimalTimes: OptimalTime[];
}

export interface ContentPreference {
  preferredLength: 'short' | 'medium' | 'long';
  preferredTone: 'formal' | 'casual' | 'friendly';
  preferredFormat: 'text' | 'html' | 'rich_media';
  topics: string[];
}

export interface TopicRelevance {
  topic: string;
  relevanceScore: number; // 0-1
  lastEngagement: string;
  engagementHistory: number[];
}

export interface DemographicData {
  ageGroup?: string;
  location?: string;
  interests?: string[];
  profession?: string;
  familySize?: number;
  incomeLevel?: string;
}