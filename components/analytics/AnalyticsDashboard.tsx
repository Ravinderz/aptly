import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Types
import type { 
  SocietyAnalytics,
  PerformanceInsight,
  AnalyticsRecommendation,
  TrendAnalysis,
  DataPoint,
  ReportPeriod
} from '../../types/analytics';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCard } from '../ui/AlertCard';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsDashboardProps {
  societyAnalytics: SocietyAnalytics;
  onGenerateReport: (period: ReportPeriod, categories: string[]) => Promise<void>;
  onImplementRecommendation: (recommendationId: string) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  societyAnalytics,
  onGenerateReport,
  onImplementRecommendation,
  currentUserId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'operational' | 'financial' | 'community' | 'insights'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const canViewDetailedAnalytics = userRole === 'admin' || userRole === 'committee_member';
  const canImplementRecommendations = userRole === 'admin';

  const { kpis, operationalMetrics, financialAnalytics, communityMetrics, performanceInsights, recommendations } = societyAnalytics;

  // Calculate health score
  const overallHealthScore = useMemo(() => {
    const scores = [
      kpis.residentSatisfactionScore / 5 * 100,
      kpis.billCollectionRate,
      kpis.complaintResolutionRate,
      kpis.activeResidentPercentage,
      (5 - kpis.emergencyResponseTime / 10) * 20 // Convert to 0-100 scale
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [kpis]);

  const renderKPICard = (title: string, value: number, unit: string, trend: 'up' | 'down' | 'stable', target?: number) => {
    const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-secondary';
    const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
    const isOnTarget = target ? value >= target : true;

    return (
      <Card className="flex-1 mx-1">
        <View className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-display-medium font-bold text-text-primary">
                {typeof value === 'number' ? value.toFixed(1) : value}{unit}
              </Text>
              <Text className="text-body-small text-text-secondary">
                {title}
              </Text>
            </View>
            <Ionicons name={trendIcon} size={20} color={trendColor === 'text-success' ? '#10B981' : trendColor === 'text-error' ? '#EF4444' : '#6B7280'} />
          </View>
          
          {target && (
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${isOnTarget ? 'bg-success' : 'bg-warning'}`} />
              <Text className={`text-label-small ${isOnTarget ? 'text-success' : 'text-warning'}`}>
                Target: {target}{unit} {isOnTarget ? '✓' : ''}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderOverview = () => (
    <ScrollView className="flex-1">
      {/* Overall Health Score */}
      <View className="p-4">
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-3">
              Society Health Score
            </Text>
            
            <View className="items-center mb-4">
              <View className={`w-24 h-24 rounded-full items-center justify-center ${
                overallHealthScore >= 80 ? 'bg-success/10' : 
                overallHealthScore >= 60 ? 'bg-warning/10' : 'bg-error/10'
              }`}>
                <Text className={`text-display-large font-bold ${
                  overallHealthScore >= 80 ? 'text-success' : 
                  overallHealthScore >= 60 ? 'text-warning' : 'text-error'
                }`}>
                  {overallHealthScore.toFixed(0)}
                </Text>
              </View>
              <Text className="text-body-medium text-text-secondary mt-2">
                {overallHealthScore >= 80 ? 'Excellent' : 
                 overallHealthScore >= 60 ? 'Good' : 'Needs Attention'}
              </Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-small text-text-secondary">Resident Satisfaction</Text>
                <Text className="text-body-small font-medium text-text-primary">
                  {kpis.residentSatisfactionScore.toFixed(1)}/5
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-body-small text-text-secondary">Collection Efficiency</Text>
                <Text className="text-body-small font-medium text-text-primary">
                  {kpis.billCollectionRate.toFixed(1)}%
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-body-small text-text-secondary">Active Participation</Text>
                <Text className="text-body-small font-medium text-text-primary">
                  {kpis.activeResidentPercentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Key Performance Indicators */}
      <View className="px-4 mb-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-3">
          Key Performance Indicators
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {renderKPICard(
              'Resident Satisfaction', 
              kpis.residentSatisfactionScore, 
              '/5', 
              'up',
              4.0
            )}
            {renderKPICard(
              'Collection Rate', 
              kpis.billCollectionRate, 
              '%', 
              kpis.billCollectionRate >= 85 ? 'up' : 'down',
              85
            )}
            {renderKPICard(
              'Response Time', 
              kpis.maintenanceResponseTime, 
              'h', 
              'down',
              24
            )}
            {renderKPICard(
              'Occupancy Rate', 
              kpis.occupancyRate, 
              '%', 
              'stable',
              90
            )}
          </View>
        </ScrollView>
      </View>

      {/* Quick Insights */}
      <View className="px-4 mb-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-3">
          Quick Insights
        </Text>
        
        {performanceInsights.slice(0, 3).map((insight) => (
          <Card key={insight.id} className="mb-3">
            <View className="p-4">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                  <Text className="text-body-large font-semibold text-text-primary mb-1">
                    {insight.title}
                  </Text>
                  <Text className="text-body-medium text-text-secondary">
                    {insight.description}
                  </Text>
                </View>
                
                <View className={`px-2 py-1 rounded-full ${getImpactStyle(insight.impact).bg}`}>
                  <Text className={`text-label-small font-medium ${getImpactStyle(insight.impact).text}`}>
                    {insight.impact.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons 
                    name={getTrendIcon(insight.trend)} 
                    size={16} 
                    color={getTrendColor(insight.trend)} 
                  />
                  <Text className="text-body-small text-text-secondary ml-2">
                    Confidence: {(insight.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
                
                <TouchableOpacity onPress={() => router.push(`/analytics/insights/${insight.id}`)}>
                  <Text className="text-body-small text-primary">View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Top Recommendations */}
      <View className="px-4 mb-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-3">
          Priority Recommendations
        </Text>
        
        {recommendations
          .filter(rec => rec.priority === 'critical' || rec.priority === 'high')
          .slice(0, 2)
          .map((recommendation) => (
            <Card key={recommendation.id} className="mb-3">
              <View className="p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                      <View className={`px-2 py-1 rounded-full mr-2 ${getPriorityStyle(recommendation.priority).bg}`}>
                        <Text className={`text-label-small font-medium ${getPriorityStyle(recommendation.priority).text}`}>
                          {recommendation.priority.toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-body-large font-semibold text-text-primary">
                        {recommendation.title}
                      </Text>
                    </View>
                    <Text className="text-body-medium text-text-secondary mb-2">
                      {recommendation.description}
                    </Text>
                    <Text className="text-body-small text-success">
                      Expected: {recommendation.expectedBenefit}
                    </Text>
                  </View>
                </View>
                
                {canImplementRecommendations && (
                  <Button
                    title="Implement"
                    variant="primary"
                    size="small"
                    onPress={() => onImplementRecommendation(recommendation.id)}
                    className="self-start"
                  />
                )}
              </View>
            </Card>
          ))}
      </View>

      {/* Recent Trends */}
      <View className="px-4 pb-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-3">
          Recent Trends
        </Text>
        
        <Card>
          <View className="p-4">
            <View className="space-y-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-success rounded-full mr-3" />
                  <Text className="text-body-medium text-text-primary">Community Engagement</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="trending-up" size={16} color="#10B981" />
                  <Text className="text-body-small text-success ml-1">+12%</Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-primary rounded-full mr-3" />
                  <Text className="text-body-medium text-text-primary">Digital Adoption</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="trending-up" size={16} color="#10B981" />
                  <Text className="text-body-small text-success ml-1">+8%</Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-warning rounded-full mr-3" />
                  <Text className="text-body-medium text-text-primary">Maintenance Costs</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="trending-down" size={16} color="#EF4444" />
                  <Text className="text-body-small text-error ml-1">+5%</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );

  const renderOperational = () => (
    <ScrollView className="p-4">
      {/* Maintenance Metrics */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Maintenance Performance
          </Text>
          
          <View className="grid grid-cols-2 gap-3 mb-4">
            <View className="bg-surface-secondary p-3 rounded-lg">
              <Text className="text-display-small font-bold text-primary">
                {operationalMetrics.maintenance.totalRequests}
              </Text>
              <Text className="text-body-small text-text-secondary">Total Requests</Text>
            </View>
            
            <View className="bg-surface-secondary p-3 rounded-lg">
              <Text className="text-display-small font-bold text-success">
                {((operationalMetrics.maintenance.completedRequests / operationalMetrics.maintenance.totalRequests) * 100).toFixed(1)}%
              </Text>
              <Text className="text-body-small text-text-secondary">Completion Rate</Text>
            </View>
            
            <View className="bg-surface-secondary p-3 rounded-lg">
              <Text className="text-display-small font-bold text-warning">
                {operationalMetrics.maintenance.averageResolutionTime}h
              </Text>
              <Text className="text-body-small text-text-secondary">Avg Resolution</Text>
            </View>
            
            <View className="bg-surface-secondary p-3 rounded-lg">
              <Text className="text-display-small font-bold text-text-primary">
                {operationalMetrics.maintenance.residentSatisfactionRating.toFixed(1)}
              </Text>
              <Text className="text-body-small text-text-secondary">Satisfaction</Text>
            </View>
          </View>
          
          {/* Request Categories */}
          <View>
            <Text className="text-body-medium font-semibold text-text-primary mb-2">
              Requests by Category
            </Text>
            {Object.entries(operationalMetrics.maintenance.requestsByCategory).map(([category, count]) => {
              const percentage = (count / operationalMetrics.maintenance.totalRequests) * 100;
              return (
                <View key={category} className="flex-row items-center justify-between py-1">
                  <Text className="text-body-small text-text-secondary">{formatCategory(category)}</Text>
                  <View className="flex-row items-center">
                    <View className="w-16 h-1 bg-surface-secondary rounded-full mr-2">
                      <View 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                    <Text className="text-body-small font-medium text-text-primary w-8">
                      {count}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Card>

      {/* Visitor Management */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Visitor Management
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Total Visitors</Text>
              <Text className="text-body-large font-semibold text-text-primary">
                {operationalMetrics.visitorManagement.totalVisitors}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Approval Rate</Text>
              <Text className="text-body-large font-semibold text-success">
                {operationalMetrics.visitorManagement.approvalRate.toFixed(1)}%
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Avg Approval Time</Text>
              <Text className="text-body-large font-semibold text-text-primary">
                {operationalMetrics.visitorManagement.averageApprovalTime.toFixed(1)}m
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">QR Usage Rate</Text>
              <Text className="text-body-large font-semibold text-primary">
                {operationalMetrics.visitorManagement.qrCodeUsageRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Amenity Utilization */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Amenity Utilization
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Booking Rate</Text>
              <Text className="text-body-large font-semibold text-text-primary">
                {operationalMetrics.amenityUtilization.bookingRate.toFixed(1)}%
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">No-Show Rate</Text>
              <Text className={`text-body-large font-semibold ${
                operationalMetrics.amenityUtilization.noShowRate > 10 ? 'text-error' : 'text-warning'
              }`}>
                {operationalMetrics.amenityUtilization.noShowRate.toFixed(1)}%
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Revenue Generated</Text>
              <Text className="text-body-large font-semibold text-success">
                ₹{operationalMetrics.amenityUtilization.revenueGenerated.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderFinancial = () => (
    <ScrollView className="p-4">
      {/* Collection Overview */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Collection Performance
          </Text>
          
          <View className="grid grid-cols-2 gap-3">
            <View className="bg-success/10 p-3 rounded-lg">
              <Text className="text-display-small font-bold text-success">
                ₹{(financialAnalytics.collections.totalCollected / 100000).toFixed(1)}L
              </Text>
              <Text className="text-body-small text-text-secondary">Total Collected</Text>
            </View>
            
            <View className="bg-warning/10 p-3 rounded-lg">
              <Text className="text-display-small font-bold text-warning">
                ₹{(financialAnalytics.collections.outstandingAmount / 100000).toFixed(1)}L
              </Text>
              <Text className="text-body-small text-text-secondary">Outstanding</Text>
            </View>
            
            <View className="bg-primary/10 p-3 rounded-lg">
              <Text className="text-display-small font-bold text-primary">
                {financialAnalytics.collections.collectionEfficiency.toFixed(1)}%
              </Text>
              <Text className="text-body-small text-text-secondary">Efficiency</Text>
            </View>
            
            <View className="bg-surface-secondary p-3 rounded-lg">
              <Text className="text-display-small font-bold text-text-primary">
                {financialAnalytics.collections.paymentMethodBreakdown.length}
              </Text>
              <Text className="text-body-small text-text-secondary">Payment Methods</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Expense Breakdown */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Expense Analysis
          </Text>
          
          {financialAnalytics.expenses.expenseByCategory.slice(0, 5).map((expense) => (
            <View key={expense.category} className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-body-medium text-text-primary">{expense.category}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-20 h-1 bg-surface-secondary rounded-full mr-2">
                    <View 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${expense.percentage}%` }}
                    />
                  </View>
                  <Text className="text-body-small text-text-secondary">
                    {expense.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View className="items-end ml-3">
                <Text className="text-body-medium font-semibold text-text-primary">
                  ₹{(expense.amount / 1000).toFixed(0)}K
                </Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={getTrendIcon(expense.trend)} 
                    size={12} 
                    color={getTrendColor(expense.trend)} 
                  />
                  <Text className={`text-label-small ml-1 ${
                    expense.trend === 'up' ? 'text-error' : 'text-success'
                  }`}>
                    {expense.trend === 'up' ? '+' : expense.trend === 'down' ? '-' : ''}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Financial Health */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Financial Health Indicators
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Cash Flow Ratio</Text>
              <Text className={`text-body-large font-semibold ${
                financialAnalytics.healthIndicators.cashFlowRatio > 1 ? 'text-success' : 'text-warning'
              }`}>
                {financialAnalytics.healthIndicators.cashFlowRatio.toFixed(2)}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Emergency Fund Ratio</Text>
              <Text className={`text-body-large font-semibold ${
                financialAnalytics.healthIndicators.emergencyFundRatio > 0.2 ? 'text-success' : 'text-warning'
              }`}>
                {(financialAnalytics.healthIndicators.emergencyFundRatio * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Collection Consistency</Text>
              <Text className={`text-body-large font-semibold ${
                financialAnalytics.healthIndicators.collectionConsistency > 0.8 ? 'text-success' : 'text-warning'
              }`}>
                {(financialAnalytics.healthIndicators.collectionConsistency * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderCommunity = () => (
    <ScrollView className="p-4">
      {/* Engagement Overview */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Community Engagement
          </Text>
          
          <View className="grid grid-cols-2 gap-3 mb-4">
            <View className="bg-primary/10 p-3 rounded-lg">
              <Text className="text-display-small font-bold text-primary">
                {communityMetrics.engagement.dailyActiveUsers}
              </Text>
              <Text className="text-body-small text-text-secondary">Daily Active</Text>
            </View>
            
            <View className="bg-success/10 p-3 rounded-lg">
              <Text className="text-display-small font-bold text-success">
                {communityMetrics.engagement.engagementRate.toFixed(1)}%
              </Text>
              <Text className="text-body-small text-text-secondary">Engagement Rate</Text>
            </View>
            
            <View className="bg-warning/10 p-3 rounded-lg">
              <Text className="text-display-small font-bold text-warning">
                {communityMetrics.communication.postsPerUser.toFixed(1)}
              </Text>
              <Text className="text-body-small text-text-secondary">Posts per User</Text>
            </View>
            
            <View className="bg-surface-secondary p-3 rounded-lg">
              <Text className="text-display-small font-bold text-text-primary">
                {(communityMetrics.engagement.sessionDuration / 60).toFixed(0)}m
              </Text>
              <Text className="text-body-small text-text-secondary">Avg Session</Text>
            </View>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-small text-text-secondary">Weekly Active Users</Text>
              <Text className="text-body-small font-medium text-text-primary">
                {communityMetrics.engagement.weeklyActiveUsers}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-body-small text-text-secondary">Monthly Active Users</Text>
              <Text className="text-body-small font-medium text-text-primary">
                {communityMetrics.engagement.monthlyActiveUsers}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Communication Patterns */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Communication Patterns
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Comments per Post</Text>
              <Text className="text-body-large font-semibold text-text-primary">
                {communityMetrics.communication.commentsPerPost.toFixed(1)}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Likes per Post</Text>
              <Text className="text-body-large font-semibold text-text-primary">
                {communityMetrics.communication.likesPerPost.toFixed(1)}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Mentions per User</Text>
              <Text className="text-body-large font-semibold text-text-primary">
                {communityMetrics.communication.mentionsPerUser.toFixed(1)}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Response Rate</Text>
              <Text className="text-body-large font-semibold text-success">
                {(communityMetrics.communication.responsiveness * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Community Health */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Community Health Indicators
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Cooperation Index</Text>
              <View className="flex-row items-center">
                <View className="w-16 h-2 bg-surface-secondary rounded-full mr-2">
                  <View 
                    className="h-full bg-success rounded-full" 
                    style={{ width: `${communityMetrics.communityHealth.cooperationIndex * 100}%` }}
                  />
                </View>
                <Text className="text-body-small font-medium text-text-primary">
                  {(communityMetrics.communityHealth.cooperationIndex * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Wellbeing Index</Text>
              <View className="flex-row items-center">
                <View className="w-16 h-2 bg-surface-secondary rounded-full mr-2">
                  <View 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${communityMetrics.communityHealth.wellbeingIndex * 100}%` }}
                  />
                </View>
                <Text className="text-body-small font-medium text-text-primary">
                  {(communityMetrics.communityHealth.wellbeingIndex * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium text-text-secondary">Inclusion Score</Text>
              <View className="flex-row items-center">
                <View className="w-16 h-2 bg-surface-secondary rounded-full mr-2">
                  <View 
                    className="h-full bg-warning rounded-full" 
                    style={{ width: `${communityMetrics.communityHealth.inclusionScore * 100}%` }}
                  />
                </View>
                <Text className="text-body-small font-medium text-text-primary">
                  {(communityMetrics.communityHealth.inclusionScore * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderInsights = () => (
    <ScrollView className="p-4">
      {/* Performance Insights */}
      <View className="mb-4">
        <Text className="text-headline-small font-semibold text-text-primary mb-3">
          Performance Insights
        </Text>
        
        {performanceInsights.map((insight) => (
          <Card key={insight.id} className="mb-3">
            <View className="p-4">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-1">
                    <View className={`px-2 py-1 rounded-full mr-2 ${getCategoryStyle(insight.category).bg}`}>
                      <Text className={`text-label-small font-medium ${getCategoryStyle(insight.category).text}`}>
                        {insight.category.toUpperCase()}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${getImpactStyle(insight.impact).bg}`}>
                      <Text className={`text-label-small font-medium ${getImpactStyle(insight.impact).text}`}>
                        {insight.impact.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-body-large font-semibold text-text-primary mb-1">
                    {insight.title}
                  </Text>
                  <Text className="text-body-medium text-text-secondary mb-2">
                    {insight.description}
                  </Text>
                  
                  {insight.recommendations.length > 0 && (
                    <View>
                      <Text className="text-body-small font-medium text-text-primary mb-1">
                        Recommendations:
                      </Text>
                      {insight.recommendations.slice(0, 2).map((rec, index) => (
                        <Text key={index} className="text-body-small text-text-secondary">
                          • {rec}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
                
                <View className="items-end">
                  <View className="flex-row items-center mb-1">
                    <Ionicons 
                      name={getTrendIcon(insight.trend)} 
                      size={16} 
                      color={getTrendColor(insight.trend)} 
                    />
                    <Text className="text-body-small text-text-secondary ml-1">
                      {(insight.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                  
                  {insight.estimatedImprovement > 0 && (
                    <Text className="text-body-small text-success">
                      +{insight.estimatedImprovement.toFixed(1)}%
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Recommendations */}
      <View>
        <Text className="text-headline-small font-semibold text-text-primary mb-3">
          Action Recommendations
        </Text>
        
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="mb-3">
            <View className="p-4">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-2">
                    <View className={`px-2 py-1 rounded-full mr-2 ${getPriorityStyle(recommendation.priority).bg}`}>
                      <Text className={`text-label-small font-medium ${getPriorityStyle(recommendation.priority).text}`}>
                        {recommendation.priority.toUpperCase()}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${getTypeStyle(recommendation.type).bg}`}>
                      <Text className={`text-label-small font-medium ${getTypeStyle(recommendation.type).text}`}>
                        {recommendation.type.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-body-large font-semibold text-text-primary mb-1">
                    {recommendation.title}
                  </Text>
                  <Text className="text-body-medium text-text-secondary mb-2">
                    {recommendation.description}
                  </Text>
                  <Text className="text-body-small text-success mb-2">
                    Expected: {recommendation.expectedBenefit}
                  </Text>
                  
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-body-small text-text-secondary ml-1">
                      {recommendation.timeframe}
                    </Text>
                  </View>
                </View>
              </View>
              
              {canImplementRecommendations && (
                <View className="flex-row gap-2">
                  <Button
                    title="View Details"
                    variant="secondary"
                    size="small"
                    onPress={() => router.push(`/analytics/recommendations/${recommendation.id}`)}
                    className="flex-1"
                  />
                  <Button
                    title="Implement"
                    variant="primary"
                    size="small"
                    onPress={() => onImplementRecommendation(recommendation.id)}
                    className="flex-1"
                  />
                </View>
              )}
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );

  if (!canViewDetailedAnalytics && activeTab !== 'overview') {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
        <Text className="text-headline-small text-text-secondary mt-4 mb-2">
          Limited Access
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          You can only view overview analytics.
          Contact your administrator for detailed access.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Analytics Dashboard
        </Text>
        <Text className="text-body-large text-text-secondary">
          Society performance insights and operational metrics
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'overview', label: 'Overview', icon: 'home-outline' },
          { key: 'operational', label: 'Operations', icon: 'settings-outline' },
          { key: 'financial', label: 'Financial', icon: 'card-outline' },
          { key: 'community', label: 'Community', icon: 'people-outline' },
          { key: 'insights', label: 'Insights', icon: 'bulb-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-3 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center">
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.key ? '#6366f1' : '#6B7280'} 
              />
              <Text className={`text-label-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'operational' && renderOperational()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'insights' && renderInsights()}
      </View>
    </View>
  );
};

// Helper functions
const getImpactStyle = (impact: string) => {
  const styles = {
    critical: { bg: 'bg-red-50', text: 'text-red-700' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    low: { bg: 'bg-green-50', text: 'text-green-700' }
  };
  return styles[impact as keyof typeof styles] || styles.medium;
};

const getPriorityStyle = (priority: string) => {
  const styles = {
    critical: { bg: 'bg-red-50', text: 'text-red-700' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    low: { bg: 'bg-green-50', text: 'text-green-700' },
    optional: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[priority as keyof typeof styles] || styles.medium;
};

const getCategoryStyle = (category: string) => {
  const styles = {
    performance: { bg: 'bg-blue-50', text: 'text-blue-700' },
    financial: { bg: 'bg-green-50', text: 'text-green-700' },
    operational: { bg: 'bg-orange-50', text: 'text-orange-700' },
    community: { bg: 'bg-purple-50', text: 'text-purple-700' },
    governance: { bg: 'bg-indigo-50', text: 'text-indigo-700' }
  };
  return styles[category as keyof typeof styles] || styles.performance;
};

const getTypeStyle = (type: string) => {
  const styles = {
    optimization: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
    cost_saving: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    engagement: { bg: 'bg-pink-50', text: 'text-pink-700' },
    efficiency: { bg: 'bg-violet-50', text: 'text-violet-700' },
    compliance: { bg: 'bg-slate-50', text: 'text-slate-700' }
  };
  return styles[type as keyof typeof styles] || styles.optimization;
};

const getTrendIcon = (trend: string) => {
  const icons = {
    up: 'trending-up',
    down: 'trending-down',
    stable: 'remove',
    volatile: 'pulse-outline'
  };
  return icons[trend as keyof typeof icons] || 'remove';
};

const getTrendColor = (trend: string) => {
  const colors = {
    up: '#10B981',
    down: '#EF4444',
    stable: '#6B7280',
    volatile: '#F59E0B'
  };
  return colors[trend as keyof typeof colors] || '#6B7280';
};

const formatCategory = (category: string): string => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default AnalyticsDashboard;