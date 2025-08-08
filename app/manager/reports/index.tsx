import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Building2,
  Users,
  Clock,
  Star,
  ArrowLeft,
  FileText,
  Target,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { RequireManager } from '@/components/auth/RoleGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  LoadingWrapper, 
  useAsyncState, 
  LoadingSpinner 
} from '@/components/ui/LoadingStates';
import { cn } from '@/utils/cn';
import { reportsService } from '@/services/reports.service';
import type {
  PerformanceMetrics,
  SocietyPerformance,
  ManagerStats,
  ReportFilters,
  ExportOptions,
  TeamComparison,
  ReportRecommendation,
} from '@/services/reports.service';

/**
 * Manager Reports - Society performance reports with filtering and export functionality
 * 
 * Features:
 * - Performance metrics dashboard with interactive charts
 * - Society-wise performance breakdown
 * - Filtering by date range, performance thresholds
 * - Export functionality (PDF, CSV, Excel)
 * - Team comparison and benchmarking
 * - Custom date range selection
 * - Real-time data updates
 */
const ManagerReports = () => {
  const router = useRouter();
  const { user, logout } = useDirectAuth();
  
  const [reportsState, { setLoading, setData, setError }] = useAsyncState<{
    metrics: PerformanceMetrics;
    managerStats: ManagerStats;
    societies: SocietyPerformance[];
    teamComparison: TeamComparison[];
    recommendations: ReportRecommendation[];
  }>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'month',
    includeResolved: true,
    includePending: true,
    performanceThreshold: 75,
  });

  // Load reports data on mount and when filters change
  useEffect(() => {
    loadReportsData();
  }, [filters]);

  const loadReportsData = async () => {
    try {
      setLoading();
      
      // Load all data in parallel
      const [
        metricsResponse,
        societyResponse,
        teamResponse,
        insightsResponse,
      ] = await Promise.all([
        reportsService.getPerformanceMetrics(filters),
        reportsService.getSocietyPerformance(filters),
        reportsService.getTeamComparison(filters.period),
        reportsService.getPerformanceInsights(filters.period),
      ]);

      if (
        metricsResponse.success && 
        societyResponse.success && 
        teamResponse.success && 
        insightsResponse.success
      ) {
        setData({
          metrics: metricsResponse.data!.metrics,
          managerStats: metricsResponse.data!.managerStats,
          societies: societyResponse.data!.societies,
          teamComparison: teamResponse.data!.teamComparison,
          recommendations: insightsResponse.data!.recommendations,
        });
      } else {
        const error = metricsResponse.message || societyResponse.message || 
                     teamResponse.message || insightsResponse.message || 
                     'Failed to load reports data';
        setError(new Error(error));
      }
    } catch (error) {
      console.error('Failed to load reports data:', error);
      setError(error as Error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReportsData();
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  const handleExportReport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    try {
      setExportingFormat(format);
      
      const exportOptions: ExportOptions = {
        format,
        includeCharts: true,
        includeDetails: true,
        societyBreakdown: true,
        timeSeriesData: true,
      };

      const response = await reportsService.exportReport(filters, exportOptions);
      
      if (response.success && response.data?.downloadUrl) {
        Alert.alert(
          'Report Generated',
          `Your ${format.toUpperCase()} report has been generated successfully.`,
          [
            { text: 'OK' }
          ]
        );
        console.log('Download URL:', response.data.downloadUrl);
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to export report:', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Failed to export report. Please try again.'
      );
    } finally {
      setExportingFormat(null);
    }
  };

  const handlePeriodChange = (newPeriod: ReportFilters['period']) => {
    setFilters(prev => ({ ...prev, period: newPeriod }));
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return '#16a34a'; // green-600
    if (score >= 75) return '#f59e0b'; // amber-500
    if (score >= 60) return '#ea580c'; // orange-600
    return '#dc2626'; // red-600
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={16} color="#16a34a" />;
      case 'declining':
        return <TrendingDown size={16} color="#dc2626" />;
      default:
        return <Target size={16} color="#6b7280" />;
    }
  };

  const getRecommendationIcon = (type: ReportRecommendation['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle size={16} color="#dc2626" />;
      case 'warning':
        return <AlertCircle size={16} color="#f59e0b" />;
      case 'improvement':
        return <TrendingUp size={16} color="#2563eb" />;
      default:
        return <CheckCircle size={16} color="#16a34a" />;
    }
  };

  // Role check - only community managers can access
  if (!user || user.role !== 'community_manager') {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <BarChart3 size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Manager Access Required
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          This area is restricted to community managers only.
        </Text>
        <Button
          onPress={() => router.replace('/(tabs)/')}
          variant="primary"
          className="mt-6"
        >
          Return to Dashboard
        </Button>
      </View>
    );
  }

  const metrics = reportsState.data?.metrics;
  const managerStats = reportsState.data?.managerStats;
  const societies = reportsState.data?.societies || [];
  const teamComparison = reportsState.data?.teamComparison || [];
  const recommendations = reportsState.data?.recommendations || [];

  return (
    <RequireManager>
      <LoadingWrapper
        isLoading={reportsState.isLoading}
        error={reportsState.error}
        onRetry={loadReportsData}
        skeletonProps={{ type: 'card', count: 4 }}
      >
        <View className="flex-1 bg-gray-50">
          <AdminHeader 
            title="Performance Reports" 
            subtitle="Detailed analytics and performance insights"
            showBack
          />
          
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Period Selector */}
            <View className="px-4 py-4 bg-white border-b border-gray-200">
              <Text className="text-sm font-medium text-gray-900 mb-3">Report Period</Text>
              <View className="flex-row space-x-2">
                {[
                  { key: 'week', label: 'Week' },
                  { key: 'month', label: 'Month' },
                  { key: 'quarter', label: 'Quarter' },
                  { key: 'year', label: 'Year' }
                ].map((period) => (
                  <Button
                    key={period.key}
                    variant={filters.period === period.key ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => handlePeriodChange(period.key as any)}
                    className="flex-1"
                  >
                    {period.label}
                  </Button>
                ))}
              </View>
              
              {/* Export Actions */}
              <View className="flex-row space-x-2 mt-4">
                {['pdf', 'csv', 'xlsx'].map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    onPress={() => handleExportReport(format as any)}
                    className="flex-1"
                    disabled={exportingFormat === format}
                  >
                    {exportingFormat === format ? (
                      <View className="flex-row items-center">
                        <LoadingSpinner size="small" color="#6b7280" className="mr-1" />
                        <Text className="text-xs text-gray-600">{format.toUpperCase()}</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <Download size={12} color="#6b7280" />
                        <Text className="text-xs text-gray-600 ml-1">{format.toUpperCase()}</Text>
                      </View>
                    )}
                  </Button>
                ))}
              </View>
            </View>

            {/* Performance Overview */}
            {metrics && managerStats && (
              <View className="px-4 py-4">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Overview
                </Text>
                
                <View className="flex-row flex-wrap gap-3 mb-6">
                  {/* Total Tickets */}
                  <Card className="flex-1 min-w-[160px] p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <FileText size={24} color="#0284c7" />
                      <Text className="text-2xl font-bold text-gray-900">
                        {metrics.totalTickets}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">Total Tickets</Text>
                    <Text className="text-xs text-gray-600">
                      {metrics.resolvedTickets} resolved ({Math.round((metrics.resolvedTickets / metrics.totalTickets) * 100)}%)
                    </Text>
                  </Card>

                  {/* Average Response Time */}
                  <Card className="flex-1 min-w-[160px] p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Clock size={24} color="#059669" />
                      <Text className="text-2xl font-bold text-gray-900">
                        {metrics.averageResponseTime}h
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">Avg Response</Text>
                    <Text className="text-xs text-green-600">
                      Target: 4h
                    </Text>
                  </Card>

                  {/* Satisfaction Score */}
                  <Card className="flex-1 min-w-[160px] p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Star size={24} color="#7c3aed" />
                      <Text className="text-2xl font-bold text-gray-900">
                        {metrics.satisfactionScore}%
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">Satisfaction</Text>
                    <Text className="text-xs text-purple-600">
                      Grade: {getPerformanceGrade(metrics.satisfactionScore)}
                    </Text>
                  </Card>

                  {/* Societies Managed */}
                  <Card className="flex-1 min-w-[160px] p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Building2 size={24} color="#dc2626" />
                      <Text className="text-2xl font-bold text-gray-900">
                        {managerStats.totalSocieties}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-900">Societies</Text>
                    <Text className="text-xs text-red-600">
                      Rank: #{managerStats.rankingPosition} of {managerStats.totalManagers}
                    </Text>
                  </Card>
                </View>
              </View>
            )}

            {/* Society Performance */}
            <View className="px-4 py-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Society Performance
                </Text>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-medium">View All</Text>
                </TouchableOpacity>
              </View>
              
              <View className="space-y-3">
                {societies.slice(0, 5).map((society) => (
                  <Card key={society.societyId} className="p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {society.societyName}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {society.ticketsHandled} tickets • {society.averageResponseTime}h avg response
                        </Text>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center mb-1">
                          <Text 
                            className="text-sm font-bold mr-1"
                            style={{ color: getPerformanceColor(society.satisfactionScore) }}
                          >
                            {society.performanceGrade}
                          </Text>
                          {getTrendIcon(society.trend)}
                        </View>
                        <Text className="text-xs text-gray-500">
                          {society.satisfactionScore}% satisfaction
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">
                        Resolution Rate: {society.resolutionRate}%
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Health Score: {society.healthScore}%
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <View className="px-4 py-4">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Recommendations
                </Text>
                
                <View className="space-y-3">
                  {recommendations.slice(0, 3).map((rec) => (
                    <Card key={rec.id} className={cn(
                      "p-4",
                      rec.type === 'critical' ? 'bg-red-50 border-red-200' :
                      rec.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    )}>
                      <View className="flex-row items-start">
                        <View className="mr-3 mt-1">
                          {getRecommendationIcon(rec.type)}
                        </View>
                        <View className="flex-1">
                          <Text className={cn(
                            "text-sm font-semibold mb-1",
                            rec.type === 'critical' ? 'text-red-900' :
                            rec.type === 'warning' ? 'text-amber-900' :
                            'text-blue-900'
                          )}>
                            {rec.title}
                          </Text>
                          <Text className={cn(
                            "text-xs mb-2",
                            rec.type === 'critical' ? 'text-red-700' :
                            rec.type === 'warning' ? 'text-amber-700' :
                            'text-blue-700'
                          )}>
                            {rec.description}
                          </Text>
                          
                          {rec.actionRequired && (
                            <View className="flex-row items-center">
                              <Text className={cn(
                                "text-xs font-medium px-2 py-1 rounded",
                                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800'
                              )}>
                                {rec.priority.toUpperCase()} PRIORITY
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              </View>
            )}

            {/* Team Comparison */}
            {teamComparison.length > 0 && (
              <View className="px-4 py-4 mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Team Performance Comparison
                </Text>
                
                <Card className="p-4">
                  <View className="space-y-4">
                    {teamComparison.slice(0, 5).map((member, index) => (
                      <View key={member.managerId} className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <View className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                            index === 0 ? 'bg-yellow-100' :
                            index === 1 ? 'bg-gray-100' :
                            index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                          )}>
                            <Text className={cn(
                              "text-sm font-bold",
                              index === 0 ? 'text-yellow-800' :
                              index === 1 ? 'text-gray-800' :
                              index === 2 ? 'text-orange-800' : 'text-blue-800'
                            )}>
                              #{index + 1}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-900">
                              {member.managerName}
                              {member.managerId === user?.id && ' (You)'}
                            </Text>
                            <Text className="text-xs text-gray-600">
                              {member.societiesManaged} societies • {member.ticketsHandled} tickets
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text 
                            className="text-sm font-bold"
                            style={{ color: getPerformanceColor(member.satisfactionScore) }}
                          >
                            {member.performanceGrade}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {member.satisfactionScore}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            )}
          </ScrollView>
        </View>
      </LoadingWrapper>
    </RequireManager>
  );
};

ManagerReports.displayName = 'ManagerReports';

export default ManagerReports;