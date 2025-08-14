import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
import type {
  SocietyAnalytics,
  AuditEntry,
  PerformanceMetrics,
  SystemHealth,
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  IntelligentDelivery,
  OptimizationRecommendation,
  GenerateReportRequest,
  AuditLogQuery,
  NotificationCampaignRequest,
  OptimizationAnalysisRequest,
} from '@/types/analytics';

// State interface
interface AnalyticsState {
  // Core analytics data
  societyAnalytics: SocietyAnalytics | null;
  auditEntries: AuditEntry[];
  performanceMetrics: PerformanceMetrics[];
  systemHealth: SystemHealth | null;

  // Notification system
  notificationTemplates: NotificationTemplate[];
  notificationCampaigns: NotificationCampaign[];
  userPreferences: NotificationPreference[];
  intelligentDelivery: IntelligentDelivery[];

  // Optimization
  optimizationRecommendations: OptimizationRecommendation[];

  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // User context
  userRole: 'resident' | 'committee_member' | 'admin';
  userId: string;

  // Preferences
  preferences: {
    dataRetention: number; // days
    autoRefresh: boolean;
    reportFormat: 'json' | 'csv' | 'pdf';
    alertThresholds: {
      performance: number;
      errors: number;
      usage: number;
    };
  };
}

// Action types
type AnalyticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SOCIETY_ANALYTICS'; payload: SocietyAnalytics }
  | { type: 'SET_AUDIT_ENTRIES'; payload: AuditEntry[] }
  | { type: 'ADD_AUDIT_ENTRY'; payload: AuditEntry }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics[] }
  | { type: 'ADD_PERFORMANCE_METRIC'; payload: PerformanceMetrics }
  | { type: 'SET_SYSTEM_HEALTH'; payload: SystemHealth }
  | { type: 'SET_NOTIFICATION_TEMPLATES'; payload: NotificationTemplate[] }
  | { type: 'ADD_NOTIFICATION_TEMPLATE'; payload: NotificationTemplate }
  | {
      type: 'UPDATE_NOTIFICATION_TEMPLATE';
      payload: { id: string; updates: Partial<NotificationTemplate> };
    }
  | { type: 'SET_NOTIFICATION_CAMPAIGNS'; payload: NotificationCampaign[] }
  | { type: 'ADD_NOTIFICATION_CAMPAIGN'; payload: NotificationCampaign }
  | {
      type: 'UPDATE_NOTIFICATION_CAMPAIGN';
      payload: { id: string; updates: Partial<NotificationCampaign> };
    }
  | { type: 'SET_USER_PREFERENCES'; payload: NotificationPreference[] }
  | {
      type: 'UPDATE_USER_PREFERENCE';
      payload: { userId: string; updates: Partial<NotificationPreference> };
    }
  | { type: 'SET_INTELLIGENT_DELIVERY'; payload: IntelligentDelivery[] }
  | {
      type: 'SET_OPTIMIZATION_RECOMMENDATIONS';
      payload: OptimizationRecommendation[];
    }
  | {
      type: 'UPDATE_OPTIMIZATION_RECOMMENDATION';
      payload: { id: string; updates: Partial<OptimizationRecommendation> };
    }
  | {
      type: 'SET_USER_ROLE';
      payload: 'resident' | 'committee_member' | 'admin';
    }
  | { type: 'SET_USER_ID'; payload: string }
  | {
      type: 'UPDATE_PREFERENCES';
      payload: Partial<AnalyticsState['preferences']>;
    }
  | { type: 'REFRESH_DATA' };

// Initial state
const initialState: AnalyticsState = {
  societyAnalytics: null,
  auditEntries: [],
  performanceMetrics: [],
  systemHealth: null,
  notificationTemplates: [],
  notificationCampaigns: [],
  userPreferences: [],
  intelligentDelivery: [],
  optimizationRecommendations: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  userRole: 'resident',
  userId: '',
  preferences: {
    dataRetention: 365,
    autoRefresh: true,
    reportFormat: 'json',
    alertThresholds: {
      performance: 500, // ms
      errors: 5, // percentage
      usage: 80, // percentage
    },
  },
};

// Reducer
function analyticsReducer(
  state: AnalyticsState,
  action: AnalyticsAction,
): AnalyticsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_SOCIETY_ANALYTICS':
      return {
        ...state,
        societyAnalytics: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'SET_AUDIT_ENTRIES':
      return {
        ...state,
        auditEntries: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_AUDIT_ENTRY':
      return {
        ...state,
        auditEntries: [action.payload, ...state.auditEntries].slice(0, 1000), // Keep last 1000 entries
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_PERFORMANCE_METRICS':
      return {
        ...state,
        performanceMetrics: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_PERFORMANCE_METRIC':
      return {
        ...state,
        performanceMetrics: [...state.performanceMetrics, action.payload].slice(
          -100,
        ), // Keep last 100 metrics
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_SYSTEM_HEALTH':
      return {
        ...state,
        systemHealth: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'SET_NOTIFICATION_TEMPLATES':
      return {
        ...state,
        notificationTemplates: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_NOTIFICATION_TEMPLATE':
      return {
        ...state,
        notificationTemplates: [...state.notificationTemplates, action.payload],
        lastUpdated: new Date().toISOString(),
      };

    case 'UPDATE_NOTIFICATION_TEMPLATE':
      return {
        ...state,
        notificationTemplates: state.notificationTemplates.map((template) =>
          template.id === action.payload.id
            ? { ...template, ...action.payload.updates }
            : template,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_NOTIFICATION_CAMPAIGNS':
      return {
        ...state,
        notificationCampaigns: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_NOTIFICATION_CAMPAIGN':
      return {
        ...state,
        notificationCampaigns: [...state.notificationCampaigns, action.payload],
        lastUpdated: new Date().toISOString(),
      };

    case 'UPDATE_NOTIFICATION_CAMPAIGN':
      return {
        ...state,
        notificationCampaigns: state.notificationCampaigns.map((campaign) =>
          campaign.id === action.payload.id
            ? { ...campaign, ...action.payload.updates }
            : campaign,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_USER_PREFERENCES':
      return {
        ...state,
        userPreferences: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'UPDATE_USER_PREFERENCE':
      return {
        ...state,
        userPreferences: state.userPreferences.map((pref) =>
          pref.userId === action.payload.userId
            ? { ...pref, ...action.payload.updates }
            : pref,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_INTELLIGENT_DELIVERY':
      return {
        ...state,
        intelligentDelivery: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'SET_OPTIMIZATION_RECOMMENDATIONS':
      return {
        ...state,
        optimizationRecommendations: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'UPDATE_OPTIMIZATION_RECOMMENDATION':
      return {
        ...state,
        optimizationRecommendations: state.optimizationRecommendations.map(
          (rec) =>
            rec.id === action.payload.id
              ? { ...rec, ...action.payload.updates }
              : rec,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };

    case 'SET_USER_ID':
      return { ...state, userId: action.payload };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case 'REFRESH_DATA':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    default:
      return state;
  }
}

// Context interface
interface AnalyticsContextType {
  state: AnalyticsState;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Analytics actions
  loadSocietyAnalytics: () => Promise<void>;
  generateReport: (request: GenerateReportRequest) => Promise<void>;
  exportReport: (format: 'json' | 'csv' | 'pdf') => Promise<void>;

  // Audit actions
  loadAuditEntries: (query?: Partial<AuditLogQuery>) => Promise<void>;
  logAuditEntry: (entry: Partial<AuditEntry>) => Promise<void>;
  exportAuditLog: (format: 'json' | 'csv' | 'pdf') => Promise<void>;

  // Performance actions
  loadPerformanceMetrics: () => Promise<void>;
  recordPerformanceMetric: (metric: PerformanceMetrics) => Promise<void>;
  loadSystemHealth: () => Promise<void>;

  // Notification actions
  loadNotificationTemplates: () => Promise<void>;
  createNotificationTemplate: (
    template: Partial<NotificationTemplate>,
  ) => Promise<void>;
  updateNotificationTemplate: (
    id: string,
    updates: Partial<NotificationTemplate>,
  ) => Promise<void>;
  loadNotificationCampaigns: () => Promise<void>;
  createNotificationCampaign: (
    campaign: NotificationCampaignRequest,
  ) => Promise<void>;
  sendNotificationCampaign: (campaignId: string) => Promise<void>;
  loadUserPreferences: () => Promise<void>;
  updateUserPreferences: (
    userId: string,
    preferences: Partial<NotificationPreference>,
  ) => Promise<void>;

  // Optimization actions
  loadOptimizationRecommendations: () => Promise<void>;
  analyzeOptimizations: (
    request: OptimizationAnalysisRequest,
  ) => Promise<OptimizationRecommendation[]>;
  applyOptimization: (recommendationId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;

  // General actions
  refreshAllData: () => Promise<void>;
  updateAnalyticsPreferences: (
    preferences: Partial<AnalyticsState['preferences']>,
  ) => Promise<void>;

  // Utility functions
  canUserAccessAnalytics: () => boolean;
  canUserExportData: () => boolean;
  canUserManageNotifications: () => boolean;
  getAnalyticsPermissions: () => string[];
}

// Create context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: '@analytics_preferences',
  USER_ROLE: '@analytics_user_role',
  USER_ID: '@analytics_user_id',
  CACHED_DATA: '@analytics_cached_data',
};

// Provider component
interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  // Initialize data on mount
  useEffect(() => {
    initializeAnalyticsData();
  }, []);

  // Save preferences to storage when they change
  useEffect(() => {
    if (state.preferences) {
      AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(state.preferences),
      );
    }
  }, [state.preferences]);

  // Auto-refresh data based on preferences
  useEffect(() => {
    if (state.preferences.autoRefresh) {
      const interval = setInterval(() => {
        refreshCriticalData();
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [state.preferences.autoRefresh]);

  const initializeAnalyticsData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load cached preferences
      const cachedPreferences = await AsyncStorage.getItem(
        STORAGE_KEYS.PREFERENCES,
      );
      if (cachedPreferences) {
        dispatch({
          type: 'UPDATE_PREFERENCES',
          payload: JSON.parse(cachedPreferences),
        });
      }

      // Load user role
      const cachedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      if (cachedUserRole) {
        dispatch({
          type: 'SET_USER_ROLE',
          payload: cachedUserRole as 'resident' | 'committee_member' | 'admin',
        });
      }

      // Load user ID
      const cachedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (cachedUserId) {
        dispatch({ type: 'SET_USER_ID', payload: cachedUserId });
      }

      // Load all analytics data
      await Promise.all([
        loadSocietyAnalytics(),
        loadSystemHealth(),
        loadNotificationTemplates(),
        loadNotificationCampaigns(),
        loadOptimizationRecommendations(),
      ]);
    } catch (error) {
      console.error('Failed to initialize analytics data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load analytics data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshCriticalData = async () => {
    try {
      // Refresh only critical data that changes frequently
      await Promise.all([loadSystemHealth(), loadPerformanceMetrics()]);
    } catch (error) {
      console.error('Failed to refresh critical data:', error);
    }
  };

  // API functions (mock implementations - replace with real API calls)
  const loadSocietyAnalytics = async () => {
    try {
      // Mock API call - would fetch from real analytics API
      const mockAnalytics: SocietyAnalytics = {
        societyId: 'society-1',
        societyName: 'Green Valley Apartments',
        reportPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          type: 'monthly',
        },
        generatedAt: new Date().toISOString(),
        kpis: {
          residentSatisfactionScore: 4.2,
          npsScore: 65,
          complaintResolutionRate: 87.5,
          maintenanceResponseTime: 4.2,
          billCollectionRate: 92.3,
          occupancyRate: 96.8,
          monthlyCollectionEfficiency: 89.5,
          outstandingDuesPercentage: 7.7,
          operationalCostPerUnit: 2850,
          activeResidentPercentage: 68.4,
          eventParticipationRate: 42.1,
          digitalAdoptionRate: 73.6,
          emergencyResponseTime: 8.5,
          securityIncidentRate: 0.8,
          visitorComplianceRate: 94.2,
        },
        // ... rest of the mock data would be included here
        operationalMetrics: {
          maintenance: {
            totalRequests: 45,
            completedRequests: 42,
            averageResolutionTime: 4.2,
            requestsByCategory: {
              Plumbing: 18,
              Electrical: 12,
              Painting: 8,
              Other: 7,
            },
            residentSatisfactionRating: 4.1,
            costPerRequest: 1850,
          },
          visitorManagement: {
            totalVisitors: 287,
            approvalRate: 94.2,
            averageApprovalTime: 12.5,
            qrCodeUsageRate: 78.4,
            securityIncidents: 2,
            peakVisitorHours: [],
          },
          amenityUtilization: {
            bookingRate: 68.5,
            noShowRate: 8.2,
            averageBookingDuration: 2.5,
            mostPopularAmenities: [],
            revenueGenerated: 15200,
          },
          communication: {
            noticeReadRate: 76.8,
            notificationDeliveryRate: 98.2,
            communityPostEngagement: 34.5,
            averageResponseTime: 3.2,
          },
        },
        financialAnalytics: {
          collections: {
            totalCollected: 4675000,
            collectionEfficiency: 92.3,
            outstandingAmount: 390000,
            collectionTrend: [],
            paymentMethodBreakdown: [],
          },
          expenses: {
            totalExpenses: 3890000,
            expenseByCategory: [],
            budgetVariance: -5.2,
            costPerSqFt: 42.5,
            expenseTrend: [],
          },
          revenue: {
            utilityBillCommissions: 45000,
            amenityBookingRevenue: 15200,
            parkingFees: 28000,
            otherRevenues: 12000,
            revenueGrowthRate: 8.3,
          },
          healthIndicators: {
            cashFlowRatio: 1.24,
            debtToAssetRatio: 0.15,
            emergencyFundRatio: 0.18,
            collectionConsistency: 0.92,
          },
        },
        governanceMetrics: {
          democraticParticipation: {
            votingParticipationRate: 72.4,
            policyProposalEngagement: 45.8,
            meetingAttendance: 38.2,
            feedbackResponseRate: 56.7,
          },
          leadership: {
            decisionMakingSpeed: 5.2,
            implementationSuccess: 84.6,
            residentApprovalRating: 4.1,
            transparencyScore: 7.8,
          },
          compliance: {
            policyComplianceRate: 91.5,
            regulatoryAdherence: 96.8,
            auditFindings: [],
            correctionTime: 3.5,
          },
          emergencyPreparedness: {
            responseReadiness: 87.2,
            drillParticipation: 68.4,
            equipmentStatus: {
              total: 25,
              operational: 23,
              needsMaintenance: 2,
              outOfService: 0,
              lastInspection: '2024-01-15T10:00:00Z',
            },
            contactUpdatedRate: 89.3,
          },
        },
        communityMetrics: {
          engagement: {
            activeUsers: 104,
            dailyActiveUsers: 45,
            weeklyActiveUsers: 78,
            monthlyActiveUsers: 104,
            engagementRate: 34.7,
            sessionDuration: 12.5,
          },
          communication: {
            postsPerUser: 2.8,
            commentsPerPost: 4.3,
            likesPerPost: 12.7,
            mentionsPerUser: 1.6,
            responsiveness: 76.4,
          },
          communityHealth: {
            conflictResolutionRate: 94.2,
            cooperationIndex: 0.82,
            diversityIndex: 0.67,
            inclusionScore: 7.4,
            wellbeingIndex: 7.8,
          },
          events: {
            eventAttendance: 42.1,
            volunteerParticipation: 18.3,
            feedbackSentiment: {
              positive: 68.4,
              negative: 12.7,
              neutral: 18.9,
              overallScore: 0.74,
            },
            recurringParticipants: 28,
          },
        },
        performanceInsights: [],
        recommendations: [],
        trends: [],
        predictions: [],
      };

      dispatch({ type: 'SET_SOCIETY_ANALYTICS', payload: mockAnalytics });
    } catch (error) {
      console.error('Failed to load society analytics:', error);
      throw error;
    }
  };

  const generateReport = async (request: GenerateReportRequest) => {
    try {
      // Mock API call - would generate report via real API
      console.log('Generating report:', request);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  };

  const exportReport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      // Mock API call - would export report via real API
      console.log('Exporting report in format:', format);
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  };

  const loadAuditEntries = async (query?: Partial<AuditLogQuery>) => {
    try {
      // Mock API call - would fetch audit entries from real API
      const mockAuditEntries: AuditEntry[] = [];
      dispatch({ type: 'SET_AUDIT_ENTRIES', payload: mockAuditEntries });
    } catch (error) {
      console.error('Failed to load audit entries:', error);
      throw error;
    }
  };

  const logAuditEntry = async (entryData: Partial<AuditEntry>) => {
    try {
      // Mock API call - would log audit entry via real API
      console.log('Logging audit entry:', entryData);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      throw error;
    }
  };

  const exportAuditLog = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      // Mock API call - would export audit log via real API
      console.log('Exporting audit log in format:', format);
    } catch (error) {
      console.error('Failed to export audit log:', error);
      throw error;
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      // Mock API call - would fetch performance metrics from real API
      const mockMetrics: PerformanceMetrics[] = [];
      dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: mockMetrics });
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      throw error;
    }
  };

  const recordPerformanceMetric = async (metric: PerformanceMetrics) => {
    try {
      // Mock API call - would record performance metric via real API
      dispatch({ type: 'ADD_PERFORMANCE_METRIC', payload: metric });
    } catch (error) {
      console.error('Failed to record performance metric:', error);
      throw error;
    }
  };

  const loadSystemHealth = async () => {
    try {
      // Mock API call - would fetch system health from real API
      const mockSystemHealth: SystemHealth = {
        overall: 'healthy',
        components: [],
        dependencies: [],
        resources: {
          cpu: {
            current: 45,
            average: 42,
            peak: 78,
            threshold: 80,
            unit: '%',
            trend: 'stable',
          },
          memory: {
            current: 68,
            average: 65,
            peak: 85,
            threshold: 90,
            unit: '%',
            trend: 'up',
          },
          storage: {
            current: 234,
            average: 220,
            peak: 280,
            threshold: 500,
            unit: 'GB',
            trend: 'up',
          },
          network: {
            current: 125,
            average: 110,
            peak: 280,
            threshold: 1000,
            unit: 'Mbps',
            trend: 'stable',
          },
        },
        activeAlerts: [],
        recentIncidents: [],
        uptime: 99.2,
        lastDowntime: '2024-01-30T14:00:00Z',
        mtbf: 720,
        mttr: 45,
        lastUpdated: new Date().toISOString(),
      };

      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: mockSystemHealth });
    } catch (error) {
      console.error('Failed to load system health:', error);
      throw error;
    }
  };

  const loadNotificationTemplates = async () => {
    try {
      // Mock API call - would fetch notification templates from real API
      const mockTemplates: NotificationTemplate[] = [];
      dispatch({ type: 'SET_NOTIFICATION_TEMPLATES', payload: mockTemplates });
    } catch (error) {
      console.error('Failed to load notification templates:', error);
      throw error;
    }
  };

  const createNotificationTemplate = async (
    templateData: Partial<NotificationTemplate>,
  ) => {
    try {
      // Mock API call - would create notification template via real API
      console.log('Creating notification template:', templateData);
    } catch (error) {
      console.error('Failed to create notification template:', error);
      throw error;
    }
  };

  const updateNotificationTemplate = async (
    id: string,
    updates: Partial<NotificationTemplate>,
  ) => {
    try {
      // Mock API call - would update notification template via real API
      dispatch({
        type: 'UPDATE_NOTIFICATION_TEMPLATE',
        payload: { id, updates },
      });
    } catch (error) {
      console.error('Failed to update notification template:', error);
      throw error;
    }
  };

  const loadNotificationCampaigns = async () => {
    try {
      // Mock API call - would fetch notification campaigns from real API
      const mockCampaigns: NotificationCampaign[] = [];
      dispatch({ type: 'SET_NOTIFICATION_CAMPAIGNS', payload: mockCampaigns });
    } catch (error) {
      console.error('Failed to load notification campaigns:', error);
      throw error;
    }
  };

  const createNotificationCampaign = async (
    campaignData: NotificationCampaignRequest,
  ) => {
    try {
      // Mock API call - would create notification campaign via real API
      console.log('Creating notification campaign:', campaignData);
    } catch (error) {
      console.error('Failed to create notification campaign:', error);
      throw error;
    }
  };

  const sendNotificationCampaign = async (campaignId: string) => {
    try {
      // Mock API call - would send notification campaign via real API
      console.log('Sending notification campaign:', campaignId);
    } catch (error) {
      console.error('Failed to send notification campaign:', error);
      throw error;
    }
  };

  const loadUserPreferences = async () => {
    try {
      // Mock API call - would fetch user preferences from real API
      const mockPreferences: NotificationPreference[] = [];
      dispatch({ type: 'SET_USER_PREFERENCES', payload: mockPreferences });
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      throw error;
    }
  };

  const updateUserPreferences = async (
    userId: string,
    preferences: Partial<NotificationPreference>,
  ) => {
    try {
      // Mock API call - would update user preferences via real API
      dispatch({
        type: 'UPDATE_USER_PREFERENCE',
        payload: { userId, updates: preferences },
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  };

  const loadOptimizationRecommendations = async () => {
    try {
      // Mock API call - would fetch optimization recommendations from real API
      const mockRecommendations: OptimizationRecommendation[] = [];
      dispatch({
        type: 'SET_OPTIMIZATION_RECOMMENDATIONS',
        payload: mockRecommendations,
      });
    } catch (error) {
      console.error('Failed to load optimization recommendations:', error);
      throw error;
    }
  };

  const analyzeOptimizations = async (
    request: OptimizationAnalysisRequest,
  ): Promise<OptimizationRecommendation[]> => {
    try {
      // Mock API call - would analyze optimizations via real API
      console.log('Analyzing optimizations:', request);
      return [];
    } catch (error) {
      console.error('Failed to analyze optimizations:', error);
      throw error;
    }
  };

  const applyOptimization = async (recommendationId: string) => {
    try {
      // Mock API call - would apply optimization via real API
      dispatch({
        type: 'UPDATE_OPTIMIZATION_RECOMMENDATION',
        payload: {
          id: recommendationId,
          updates: { status: 'in_progress' },
        },
      });
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      throw error;
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      // Mock API call - would dismiss alert via real API
      console.log('Dismissing alert:', alertId);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      throw error;
    }
  };

  const refreshAllData = async () => {
    dispatch({ type: 'REFRESH_DATA' });
    await initializeAnalyticsData();
  };

  const updateAnalyticsPreferences = async (
    preferences: Partial<AnalyticsState['preferences']>,
  ) => {
    try {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          ...state.preferences,
          ...preferences,
        }),
      );
    } catch (error) {
      console.error('Failed to update analytics preferences:', error);
      throw error;
    }
  };

  const canUserAccessAnalytics = (): boolean => {
    return state.userRole !== 'resident';
  };

  const canUserExportData = (): boolean => {
    return state.userRole === 'admin';
  };

  const canUserManageNotifications = (): boolean => {
    return state.userRole === 'admin' || state.userRole === 'committee_member';
  };

  const getAnalyticsPermissions = (): string[] => {
    switch (state.userRole) {
      case 'admin':
        return [
          'view_analytics',
          'export_data',
          'manage_notifications',
          'view_audit_logs',
          'manage_performance',
          'apply_optimizations',
        ];
      case 'committee_member':
        return ['view_analytics', 'manage_notifications', 'view_audit_logs'];
      case 'resident':
      default:
        return ['view_basic_metrics'];
    }
  };

  const contextValue: AnalyticsContextType = {
    state,
    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),
    loadSocietyAnalytics,
    generateReport,
    exportReport,
    loadAuditEntries,
    logAuditEntry,
    exportAuditLog,
    loadPerformanceMetrics,
    recordPerformanceMetric,
    loadSystemHealth,
    loadNotificationTemplates,
    createNotificationTemplate,
    updateNotificationTemplate,
    loadNotificationCampaigns,
    createNotificationCampaign,
    sendNotificationCampaign,
    loadUserPreferences,
    updateUserPreferences,
    loadOptimizationRecommendations,
    analyzeOptimizations,
    applyOptimization,
    dismissAlert,
    refreshAllData,
    updateAnalyticsPreferences,
    canUserAccessAnalytics,
    canUserExportData,
    canUserManageNotifications,
    getAnalyticsPermissions,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics context
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;
