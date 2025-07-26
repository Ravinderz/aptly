import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import LucideIcons from '@/components/ui/LucideIcons';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';
import { safeGoBack } from '@/utils/navigation';

// Import our analytics components
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { AuditSystem } from '@/components/analytics/AuditSystem';
import { NotificationManager } from '@/components/analytics/NotificationManager';
import { PerformanceOptimizer } from '@/components/analytics/PerformanceOptimizer';

// Import types
import type {
  SocietyAnalytics,
  AuditEntry,
  PerformanceMetrics,
  SystemHealth,
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  IntelligentDelivery,
  OptimizationRecommendation
} from '@/types/analytics';

// UI Components
import { TabHeader } from '@/components/ui/headers';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audit' | 'notifications' | 'performance'>('dashboard');
  const [userRole, setUserRole] = useState<'resident' | 'committee_member' | 'admin'>('resident');
  const [currentUserId] = useState('user-123');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API/context
  const [mockData, setMockData] = useState({
    societyAnalytics: null as SocietyAnalytics | null,
    auditEntries: [] as AuditEntry[],
    performanceMetrics: [] as PerformanceMetrics[],
    systemHealth: null as SystemHealth | null,
    notificationTemplates: [] as NotificationTemplate[],
    notificationCampaigns: [] as NotificationCampaign[],
    userPreferences: [] as NotificationPreference[],
    intelligentDelivery: [] as IntelligentDelivery[],
    optimizationRecommendations: [] as OptimizationRecommendation[]
  });

  useEffect(() => {
    // Simulate loading user role and data
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Mock API calls - replace with real API calls
      const mockSocietyAnalytics: SocietyAnalytics = {
        societyId: 'society-1',
        societyName: 'Green Valley Apartments',
        reportPeriod: {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          type: 'monthly'
        },
        generatedAt: '2024-01-31T23:59:59Z',
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
          visitorComplianceRate: 94.2
        },
        operationalMetrics: {
          maintenance: {
            totalRequests: 45,
            completedRequests: 42,
            averageResolutionTime: 4.2,
            requestsByCategory: {
              'Plumbing': 18,
              'Electrical': 12,
              'Painting': 8,
              'Other': 7
            },
            residentSatisfactionRating: 4.1,
            costPerRequest: 1850
          },
          visitorManagement: {
            totalVisitors: 287,
            approvalRate: 94.2,
            averageApprovalTime: 12.5,
            qrCodeUsageRate: 78.4,
            securityIncidents: 2,
            peakVisitorHours: [
              { startHour: 18, endHour: 20, value: 45 },
              { startHour: 10, endHour: 12, value: 32 }
            ]
          },
          amenityUtilization: {
            bookingRate: 68.5,
            noShowRate: 8.2,
            averageBookingDuration: 2.5,
            mostPopularAmenities: [
              { amenityId: 'gym', amenityName: 'Gymnasium', bookingCount: 124, revenue: 6200, rating: 4.3 },
              { amenityId: 'hall', amenityName: 'Community Hall', bookingCount: 18, revenue: 9000, rating: 4.7 }
            ],
            revenueGenerated: 15200
          },
          communication: {
            noticeReadRate: 76.8,
            notificationDeliveryRate: 98.2,
            communityPostEngagement: 34.5,
            averageResponseTime: 3.2
          }
        },
        financialAnalytics: {
          collections: {
            totalCollected: 4675000,
            collectionEfficiency: 92.3,
            outstandingAmount: 390000,
            collectionTrend: [
              { timestamp: '2024-01-01', value: 4675000 },
              { timestamp: '2024-01-15', value: 4750000 }
            ],
            paymentMethodBreakdown: [
              { method: 'Online', count: 89, percentage: 62.7, averageAmount: 4200 },
              { method: 'Cash', count: 35, percentage: 24.6, averageAmount: 3800 },
              { method: 'Cheque', count: 18, percentage: 12.7, averageAmount: 5500 }
            ]
          },
          expenses: {
            totalExpenses: 3890000,
            expenseByCategory: [
              { category: 'Maintenance', amount: 1560000, percentage: 40.1, trend: 'up' },
              { category: 'Security', amount: 980000, percentage: 25.2, trend: 'stable' },
              { category: 'Utilities', amount: 750000, percentage: 19.3, trend: 'down' },
              { category: 'Administration', amount: 600000, percentage: 15.4, trend: 'stable' }
            ],
            budgetVariance: -5.2,
            costPerSqFt: 42.5,
            expenseTrend: [
              { timestamp: '2024-01-01', value: 3890000 },
              { timestamp: '2024-01-15', value: 3920000 }
            ]
          },
          revenue: {
            utilityBillCommissions: 45000,
            amenityBookingRevenue: 15200,
            parkingFees: 28000,
            otherRevenues: 12000,
            revenueGrowthRate: 8.3
          },
          healthIndicators: {
            cashFlowRatio: 1.24,
            debtToAssetRatio: 0.15,
            emergencyFundRatio: 0.18,
            collectionConsistency: 0.92
          }
        },
        governanceMetrics: {
          democraticParticipation: {
            votingParticipationRate: 72.4,
            policyProposalEngagement: 45.8,
            meetingAttendance: 38.2,
            feedbackResponseRate: 56.7
          },
          leadership: {
            decisionMakingSpeed: 5.2,
            implementationSuccess: 84.6,
            residentApprovalRating: 4.1,
            transparencyScore: 7.8
          },
          compliance: {
            policyComplianceRate: 91.5,
            regulatoryAdherence: 96.8,
            auditFindings: [],
            correctionTime: 3.5
          },
          emergencyPreparedness: {
            responseReadiness: 87.2,
            drillParticipation: 68.4,
            equipmentStatus: {
              total: 25,
              operational: 23,
              needsMaintenance: 2,
              outOfService: 0,
              lastInspection: '2024-01-15T10:00:00Z'
            },
            contactUpdatedRate: 89.3
          }
        },
        communityMetrics: {
          engagement: {
            activeUsers: 104,
            dailyActiveUsers: 45,
            weeklyActiveUsers: 78,
            monthlyActiveUsers: 104,
            engagementRate: 34.7,
            sessionDuration: 12.5
          },
          communication: {
            postsPerUser: 2.8,
            commentsPerPost: 4.3,
            likesPerPost: 12.7,
            mentionsPerUser: 1.6,
            responsiveness: 76.4
          },
          communityHealth: {
            conflictResolutionRate: 94.2,
            cooperationIndex: 0.82,
            diversityIndex: 0.67,
            inclusionScore: 7.4,
            wellbeingIndex: 7.8
          },
          events: {
            eventAttendance: 42.1,
            volunteerParticipation: 18.3,
            feedbackSentiment: {
              positive: 68.4,
              negative: 12.7,
              neutral: 18.9,
              overallScore: 0.74
            },
            recurringParticipants: 28
          }
        },
        performanceInsights: [
          {
            id: 'insight-1',
            category: 'operational',
            title: 'Maintenance Response Time Improving',
            description: 'Average response time decreased by 15% this month',
            impact: 'medium',
            confidence: 0.87,
            trend: 'up',
            dataPoints: [
              { timestamp: '2024-01-01', value: 4.8 },
              { timestamp: '2024-01-31', value: 4.2 }
            ],
            recommendations: ['Continue current practices', 'Consider hiring additional staff'],
            estimatedImprovement: 15,
            implementationEffort: 'low',
            tags: ['maintenance', 'efficiency']
          }
        ],
        recommendations: [
          {
            id: 'rec-1',
            type: 'efficiency',
            priority: 'high',
            title: 'Improve Digital Adoption',
            description: 'Increase app usage through training sessions',
            expectedBenefit: 'Higher engagement and efficiency',
            estimatedImpact: {
              metric: 'Digital Adoption Rate',
              currentValue: 73.6,
              projectedValue: 85.0,
              improvement: 11.4,
              unit: 'percentage'
            },
            implementationSteps: [
              {
                step: 1,
                title: 'Organize training sessions',
                description: 'Conduct weekly app training for residents',
                estimatedDuration: '2 weeks',
                dependencies: [],
                resources: ['Training materials', 'Volunteer trainers']
              }
            ],
            requiredResources: [
              { type: 'human', name: 'Trainer', quantity: 2, unit: 'people', cost: 5000 }
            ],
            timeframe: '4-6 weeks',
            successMetrics: [
              {
                metric: 'App Downloads',
                target: 140,
                measurementMethod: 'App store analytics',
                frequency: 'weekly'
              }
            ],
            riskFactors: [
              {
                risk: 'Low participation',
                probability: 0.3,
                impact: 'medium',
                mitigation: 'Provide incentives for participation'
              }
            ]
          }
        ],
        trends: [
          {
            metric: 'Resident Satisfaction',
            period: 'monthly',
            direction: 'up',
            magnitude: 0.15,
            significance: 0.92,
            anomalies: [],
            forecast: [
              { timestamp: '2024-02-28', value: 4.35, confidence: 0.85, upperBound: 4.5, lowerBound: 4.2 }
            ]
          }
        ],
        predictions: [
          {
            model: 'linear_regression',
            target: 'Collection Rate',
            prediction: 94.2,
            confidence: 0.88,
            timeHorizon: '3 months',
            influencingFactors: [
              { name: 'Economic conditions', importance: 0.7, correlation: 0.65, trend: 'stable' },
              { name: 'Digital payment adoption', importance: 0.8, correlation: 0.72, trend: 'up' }
            ],
            scenarios: [
              {
                name: 'Optimistic',
                description: 'High digital adoption',
                probability: 0.3,
                predictedOutcome: 96.5,
                keyAssumptions: ['Successful training program', 'No economic downturn']
              }
            ],
            lastUpdated: '2024-01-31T23:59:59Z'
          }
        ]
      };

      const mockSystemHealth: SystemHealth = {
        overall: 'healthy',
        components: [
          {
            component: 'Mobile App',
            status: 'healthy',
            responseTime: 450,
            lastCheck: '2024-01-31T23:45:00Z',
            errorRate: 0.8,
            dependencies: ['API Server', 'Database']
          },
          {
            component: 'API Server',
            status: 'warning',
            responseTime: 850,
            lastCheck: '2024-01-31T23:45:00Z',
            errorRate: 2.1,
            dependencies: ['Database', 'Payment Gateway']
          }
        ],
        dependencies: [
          {
            service: 'Payment Gateway',
            status: 'healthy',
            latency: 680,
            availability: 99.8,
            lastCheck: '2024-01-31T23:45:00Z'
          }
        ],
        resources: {
          cpu: {
            current: 45,
            average: 42,
            peak: 78,
            threshold: 80,
            unit: '%',
            trend: 'stable'
          },
          memory: {
            current: 68,
            average: 65,
            peak: 85,
            threshold: 90,
            unit: '%',
            trend: 'up'
          },
          storage: {
            current: 234,
            average: 220,
            peak: 280,
            threshold: 500,
            unit: 'GB',
            trend: 'up'
          },
          network: {
            current: 125,
            average: 110,
            peak: 280,
            threshold: 1000,
            unit: 'Mbps',
            trend: 'stable'
          }
        },
        activeAlerts: [
          {
            id: 'alert-1',
            severity: 'warning',
            title: 'High API Response Time',
            description: 'API response time above normal threshold',
            component: 'API Server',
            triggeredAt: '2024-01-31T22:30:00Z'
          }
        ],
        recentIncidents: [
          {
            id: 'incident-1',
            title: 'Payment Gateway Timeout',
            severity: 'minor',
            status: 'resolved',
            affectedServices: ['Billing System'],
            startTime: '2024-01-30T14:00:00Z',
            resolvedTime: '2024-01-30T14:45:00Z',
            rootCause: 'Network congestion'
          }
        ],
        uptime: 99.2,
        lastDowntime: '2024-01-30T14:00:00Z',
        mtbf: 720,
        mttr: 45,
        lastUpdated: '2024-01-31T23:45:00Z'
      };

      setMockData({
        societyAnalytics: mockSocietyAnalytics,
        auditEntries: [],
        performanceMetrics: [],
        systemHealth: mockSystemHealth,
        notificationTemplates: [],
        notificationCampaigns: [],
        userPreferences: [],
        intelligentDelivery: [],
        optimizationRecommendations: []
      });

      // Simulate checking user role (in real app, get from auth context)
      setUserRole('admin'); // or get from auth
      
    } catch {
      console.error('Failed to load analytics data:', error);
      showErrorAlert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleExportReport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      console.log('Exporting report in format:', format);
      showSuccessAlert('Success', `Report exported in ${format.toUpperCase()} format`);
    } catch {
      showErrorAlert('Error', 'Failed to export report');
    }
  };

  const handleCreateNotificationTemplate = async (template: Partial<NotificationTemplate>) => {
    try {
      console.log('Creating notification template:', template);
      showSuccessAlert('Success', 'Notification template created');
    } catch {
      showErrorAlert('Error', 'Failed to create template');
    }
  };

  const handleCreateNotificationCampaign = async (campaign: Partial<NotificationCampaign>) => {
    try {
      console.log('Creating notification campaign:', campaign);
      showSuccessAlert('Success', 'Notification campaign created');
    } catch {
      showErrorAlert('Error', 'Failed to create campaign');
    }
  };

  const handleUpdateNotificationPreferences = async (userId: string, preferences: Partial<NotificationPreference>) => {
    try {
      console.log('Updating notification preferences:', { userId, preferences });
      showSuccessAlert('Success', 'Preferences updated successfully');
    } catch {
      showErrorAlert('Error', 'Failed to update preferences');
    }
  };

  const handleSendNotification = async (campaignId: string) => {
    try {
      console.log('Sending notification campaign:', campaignId);
      showSuccessAlert('Success', 'Notification sent successfully');
    } catch {
      showErrorAlert('Error', 'Failed to send notification');
    }
  };

  const handleApplyOptimization = async (recommendationId: string) => {
    try {
      console.log('Applying optimization:', recommendationId);
      showSuccessAlert('Success', 'Optimization applied successfully');
    } catch {
      showErrorAlert('Error', 'Failed to apply optimization');
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      console.log('Dismissing alert:', alertId);
      showSuccessAlert('Success', 'Alert dismissed');
    } catch {
      showErrorAlert('Error', 'Failed to dismiss alert');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-body-large text-text-secondary">Loading analytics data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return mockData.societyAnalytics ? (
          <AnalyticsDashboard
            data={mockData.societyAnalytics}
            onExportReport={handleExportReport}
            onRefresh={loadAnalyticsData}
            userRole={userRole}
          />
        ) : null;

      case 'audit':
        return (
          <AuditSystem
            auditEntries={mockData.auditEntries}
            onExportAuditLog={handleExportReport}
            onRefresh={loadAnalyticsData}
            userRole={userRole}
          />
        );

      case 'notifications':
        return (
          <NotificationManager
            templates={mockData.notificationTemplates}
            campaigns={mockData.notificationCampaigns}
            userPreferences={mockData.userPreferences}
            intelligentDelivery={mockData.intelligentDelivery}
            onCreateTemplate={handleCreateNotificationTemplate}
            onCreateCampaign={handleCreateNotificationCampaign}
            onUpdatePreferences={handleUpdateNotificationPreferences}
            onSendNotification={handleSendNotification}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        );

      case 'performance':
        return mockData.systemHealth ? (
          <PerformanceOptimizer
            performanceMetrics={mockData.performanceMetrics}
            systemHealth={mockData.systemHealth}
            optimizationRecommendations={mockData.optimizationRecommendations}
            onApplyOptimization={handleApplyOptimization}
            onDismissAlert={handleDismissAlert}
            onRefreshMetrics={loadAnalyticsData}
            userRole={userRole}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TabHeader
        title="Analytics Center"
        subtitle="Performance insights and intelligent optimization"
        notificationCount={2}
        showBackButton
        onBackPress={() => safeGoBack()}
      />

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'dashboard', label: 'Overview', icon: 'analytics-outline' },
          { key: 'audit', label: 'Audit', icon: 'shield-checkmark-outline' },
          { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', count: mockData.notificationCampaigns.filter(c => c.status === 'running').length },
          { key: 'performance', label: 'Performance', icon: 'speedometer-outline', count: mockData.systemHealth?.activeAlerts.length || 0 }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-3 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center relative">
              <LucideIcons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.key ? '#6366f1' : '#757575'} 
              />
              <Text className={`text-label-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
              {tab.count && tab.count > 0 && (
                <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                  <Text className="text-white text-label-large font-medium">
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}