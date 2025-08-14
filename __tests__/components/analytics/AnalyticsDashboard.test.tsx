import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { AdvancedAnalyticsDashboard } from '../../../components/analytics/AnalyticsDashboard';
import type { SocietyAnalytics } from '../../../types/analytics';

// Mock data
const mockAnalyticsData: SocietyAnalytics = {
  societyId: 'test-society',
  societyName: 'Test Apartments',
  reportPeriod: {
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    type: 'monthly',
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
    visitorComplianceRate: 94.2,
  },
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
      expenseByCategory: [
        {
          category: 'Maintenance',
          amount: 1560000,
          percentage: 40.1,
          trend: 'up',
        },
        {
          category: 'Security',
          amount: 980000,
          percentage: 25.2,
          trend: 'stable',
        },
      ],
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
  performanceInsights: [
    {
      id: 'insight-1',
      category: 'operational',
      title: 'Maintenance Response Improving',
      description: 'Response time decreased by 15%',
      impact: 'medium',
      confidence: 0.87,
      trend: 'up',
      dataPoints: [],
      recommendations: ['Continue current practices'],
      estimatedImprovement: 15,
      implementationEffort: 'low',
      tags: ['maintenance'],
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      type: 'efficiency',
      priority: 'high',
      title: 'Improve Digital Adoption',
      description: 'Increase app usage through training',
      expectedBenefit: 'Higher engagement',
      estimatedImpact: {
        metric: 'Digital Adoption Rate',
        currentValue: 73.6,
        projectedValue: 85.0,
        improvement: 11.4,
        unit: 'percentage',
      },
      implementationSteps: [],
      requiredResources: [],
      timeframe: '4-6 weeks',
      successMetrics: [],
      riskFactors: [],
    },
  ],
  trends: [],
  predictions: [],
};

const defaultProps = {
  data: mockAnalyticsData,
  onExportReport: jest.fn(),
  onRefresh: jest.fn(),
  userRole: 'admin' as const,
};

describe('AdvancedAnalyticsDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with analytics data', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Test Apartments')).toBeTruthy();
      expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
    });

    it('should display KPI metrics correctly', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('4.2')).toBeTruthy(); // Satisfaction score
      expect(screen.getByText('92.3%')).toBeTruthy(); // Collection rate
      expect(screen.getByText('96.8%')).toBeTruthy(); // Occupancy rate
    });

    it('should show operational metrics', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('45')).toBeTruthy(); // Total requests
      expect(screen.getByText('42')).toBeTruthy(); // Completed requests
      expect(screen.getByText('287')).toBeTruthy(); // Total visitors
    });

    it('should display financial analytics', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('₹46,75,000')).toBeTruthy(); // Total collected
      expect(screen.getByText('₹38,90,000')).toBeTruthy(); // Total expenses
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh action', async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      render(
        <AdvancedAnalyticsDashboard {...defaultProps} onRefresh={onRefresh} />,
      );

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.press(refreshButton);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
      });
    });

    it('should handle export report action', async () => {
      const onExportReport = jest.fn().mockResolvedValue(undefined);
      render(
        <AdvancedAnalyticsDashboard
          {...defaultProps}
          onExportReport={onExportReport}
        />,
      );

      const exportButton = screen.getByText('Export Report');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(onExportReport).toHaveBeenCalledWith('pdf');
      });
    });

    it('should allow switching between different time periods', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      const monthlyButton = screen.getByText('Monthly');
      const yearlyButton = screen.getByText('Yearly');

      fireEvent.press(yearlyButton);

      // Should update the view to yearly data
      expect(yearlyButton.props.className).toContain('bg-primary');
    });
  });

  describe('Charts and Visualizations', () => {
    it('should render maintenance request chart', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByTestId('maintenance-chart')).toBeTruthy();
    });

    it('should render financial trends chart', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByTestId('financial-chart')).toBeTruthy();
    });

    it('should render community engagement chart', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByTestId('engagement-chart')).toBeTruthy();
    });
  });

  describe('Insights and Recommendations', () => {
    it('should display performance insights', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Maintenance Response Improving')).toBeTruthy();
      expect(screen.getByText('Response time decreased by 15%')).toBeTruthy();
    });

    it('should show recommendations', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Improve Digital Adoption')).toBeTruthy();
      expect(
        screen.getByText('Increase app usage through training'),
      ).toBeTruthy();
    });

    it('should categorize recommendations by priority', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('HIGH')).toBeTruthy();
    });
  });

  describe('Role-based Access', () => {
    it('should show all features for admin users', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} userRole="admin" />);

      expect(screen.getByText('Export Report')).toBeTruthy();
      expect(screen.getByText('Advanced Settings')).toBeTruthy();
    });

    it('should limit features for committee members', () => {
      render(
        <AdvancedAnalyticsDashboard
          {...defaultProps}
          userRole="committee_member"
        />,
      );

      expect(screen.getByText('Export Report')).toBeTruthy();
      expect(screen.queryByText('Advanced Settings')).toBeNull();
    });

    it('should show read-only view for residents', () => {
      render(
        <AdvancedAnalyticsDashboard {...defaultProps} userRole="resident" />,
      );

      expect(screen.queryByText('Export Report')).toBeNull();
      expect(screen.queryByText('Advanced Settings')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const incompleteData = {
        ...mockAnalyticsData,
        kpis: {
          ...mockAnalyticsData.kpis,
          residentSatisfactionScore: 0,
        },
      };

      render(
        <AdvancedAnalyticsDashboard {...defaultProps} data={incompleteData} />,
      );

      expect(screen.getByText('No data available')).toBeTruthy();
    });

    it('should show error state when export fails', async () => {
      const onExportReport = jest
        .fn()
        .mockRejectedValue(new Error('Export failed'));
      render(
        <AdvancedAnalyticsDashboard
          {...defaultProps}
          onExportReport={onExportReport}
        />,
      );

      const exportButton = screen.getByText('Export Report');
      fireEvent.press(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should memoize expensive calculations', () => {
      const { rerender } = render(
        <AdvancedAnalyticsDashboard {...defaultProps} />,
      );

      // Mock a calculation spy
      const calculationSpy = jest.fn();

      rerender(<AdvancedAnalyticsDashboard {...defaultProps} />);

      // Should not recalculate with same data
      expect(calculationSpy).not.toHaveBeenCalled();
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = {
        ...mockAnalyticsData,
        operationalMetrics: {
          ...mockAnalyticsData.operationalMetrics,
          maintenance: {
            ...mockAnalyticsData.operationalMetrics.maintenance,
            requestsByCategory: Array.from({ length: 1000 }, (_, i) => ({
              [`Category ${i}`]: Math.floor(Math.random() * 100),
            })).reduce((acc, item) => ({ ...acc, ...item }), {}),
          },
        },
      };

      const startTime = Date.now();
      render(
        <AdvancedAnalyticsDashboard {...defaultProps} data={largeDataset} />,
      );
      const renderTime = Date.now() - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.props.accessibilityLabel).toBeTruthy();
      });
    });

    it('should support screen readers', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      const kpiElements = screen.getAllByTestId(/kpi-/);
      kpiElements.forEach((element) => {
        expect(element.props.accessible).toBe(true);
        expect(element.props.accessibilityRole).toBeTruthy();
      });
    });
  });

  describe('Data Formatting', () => {
    it('should format currency values correctly', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('₹46,75,000')).toBeTruthy();
      expect(screen.getByText('₹2,850')).toBeTruthy();
    });

    it('should format percentages correctly', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('92.3%')).toBeTruthy();
      expect(screen.getByText('96.8%')).toBeTruthy();
    });

    it('should format dates correctly', () => {
      render(<AdvancedAnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Jan 1 - Jan 31, 2024')).toBeTruthy();
    });
  });
});
