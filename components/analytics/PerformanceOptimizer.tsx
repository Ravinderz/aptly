import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Types
import type { 
  PerformanceMetrics,
  SystemHealth,
  OptimizationRecommendation,
  OptimizationCategory,
  OptimizationPriority,
  HealthStatus,
  ResourceMetric,
  Alert as SystemAlert,
  Incident
} from '../../types/analytics';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCard } from '../ui/AlertCard';

interface PerformanceOptimizerProps {
  performanceMetrics: PerformanceMetrics[];
  systemHealth: SystemHealth;
  optimizationRecommendations: OptimizationRecommendation[];
  onApplyOptimization: (recommendationId: string) => Promise<void>;
  onDismissAlert: (alertId: string) => Promise<void>;
  onRefreshMetrics: () => Promise<void>;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  performanceMetrics,
  systemHealth,
  optimizationRecommendations,
  onApplyOptimization,
  onDismissAlert,
  onRefreshMetrics,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'health' | 'recommendations'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processingOptimizations, setProcessingOptimizations] = useState<Set<string>>(new Set());

  const canManageSystem = userRole === 'admin';
  const canViewReports = userRole !== 'resident';

  // Calculate performance trends
  const performanceTrends = useMemo(() => {
    if (performanceMetrics.length === 0) return null;
    
    const latest = performanceMetrics[performanceMetrics.length - 1];
    const previous = performanceMetrics[performanceMetrics.length - 2];
    
    if (!previous) return null;

    return {
      responseTime: calculateTrend(previous.application.responseTime, latest.application.responseTime),
      errorRate: calculateTrend(previous.application.errorRate, latest.application.errorRate, true),
      memoryUsage: calculateTrend(previous.application.memoryUsage, latest.application.memoryUsage, true),
      throughput: calculateTrend(previous.application.throughput, latest.application.throughput)
    };
  }, [performanceMetrics]);

  // System health score
  const healthScore = useMemo(() => {
    const weights = {
      healthy: 100,
      warning: 70,
      critical: 30,
      unknown: 50
    };

    const componentScores = systemHealth.components.map(c => weights[c.status] || 50);
    const dependencyScores = systemHealth.dependencies.map(d => weights[d.status] || 50);
    
    const avgComponentScore = componentScores.reduce((a, b) => a + b, 0) / componentScores.length;
    const avgDependencyScore = dependencyScores.reduce((a, b) => a + b, 0) / dependencyScores.length;
    
    return Math.round((avgComponentScore * 0.7) + (avgDependencyScore * 0.3));
  }, [systemHealth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshMetrics();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh metrics');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplyOptimization = async (recommendation: OptimizationRecommendation) => {
    Alert.alert(
      'Apply Optimization',
      `Apply "${recommendation.title}"?\n\nThis will ${recommendation.proposedSolution}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            setProcessingOptimizations(prev => new Set([...prev, recommendation.id]));
            try {
              await onApplyOptimization(recommendation.id);
              Alert.alert('Success', 'Optimization applied successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to apply optimization');
            } finally {
              setProcessingOptimizations(prev => {
                const newSet = new Set(prev);
                newSet.delete(recommendation.id);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const renderOverview = () => {
    const criticalAlerts = systemHealth.activeAlerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = systemHealth.activeAlerts.filter(a => a.severity === 'warning').length;
    const highPriorityRecommendations = optimizationRecommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length;

    return (
      <ScrollView className="p-4">
        {/* Health Score */}
        <Card className="mb-4">
          <View className="p-4 items-center">
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${getHealthScoreStyle(healthScore).bg}`}>
              <Text className={`text-display-small font-bold ${getHealthScoreStyle(healthScore).text}`}>
                {healthScore}
              </Text>
            </View>
            <Text className="text-headline-medium font-semibold text-text-primary mb-1">
              System Health Score
            </Text>
            <Text className="text-body-medium text-text-secondary text-center">
              Overall system performance and reliability
            </Text>
          </View>
        </Card>

        {/* Quick Stats */}
        <View className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <View className="p-4 items-center">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning" size={20} color="#EF4444" />
                <Text className="text-display-medium font-bold text-error ml-2">
                  {criticalAlerts}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Critical Alerts
              </Text>
            </View>
          </Card>

          <Card>
            <View className="p-4 items-center">
              <View className="flex-row items-center mb-2">
                <Ionicons name="alert" size={20} color="#F59E0B" />
                <Text className="text-display-medium font-bold text-warning ml-2">
                  {warningAlerts}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Warning Alerts
              </Text>
            </View>
          </Card>

          <Card>
            <View className="p-4 items-center">
              <View className="flex-row items-center mb-2">
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text className="text-display-medium font-bold text-success ml-2">
                  {systemHealth.uptime.toFixed(1)}%
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                System Uptime
              </Text>
            </View>
          </Card>

          <Card>
            <View className="p-4 items-center">
              <View className="flex-row items-center mb-2">
                <Ionicons name="build" size={20} color="#6366F1" />
                <Text className="text-display-medium font-bold text-primary ml-2">
                  {highPriorityRecommendations}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Priority Optimizations
              </Text>
            </View>
          </Card>
        </View>

        {/* Recent Incidents */}
        {systemHealth.recentIncidents.length > 0 && (
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Recent Incidents
              </Text>
              
              {systemHealth.recentIncidents.slice(0, 3).map((incident) => (
                <View key={incident.id} className="flex-row items-start mb-3 last:mb-0">
                  <View className={`w-3 h-3 rounded-full mt-2 mr-3 ${getIncidentSeverityColor(incident.severity)}`} />
                  <View className="flex-1">
                    <Text className="text-body-medium font-medium text-text-primary">
                      {incident.title}
                    </Text>
                    <Text className="text-body-small text-text-secondary">
                      {new Date(incident.startTime).toLocaleString()} • {incident.status}
                    </Text>
                    {incident.rootCause && (
                      <Text className="text-body-small text-text-secondary mt-1">
                        Cause: {incident.rootCause}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Performance Trends */}
        {performanceTrends && (
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Performance Trends
              </Text>
              
              <View className="grid grid-cols-2 gap-4">
                <View>
                  <Text className="text-body-small text-text-secondary">Response Time</Text>
                  <View className="flex-row items-center">
                    <Text className="text-body-large font-semibold text-text-primary">
                      {performanceMetrics[performanceMetrics.length - 1]?.application.responseTime}ms
                    </Text>
                    <Ionicons 
                      name={performanceTrends.responseTime.direction === 'up' ? 'trending-up' : 'trending-down'} 
                      size={16} 
                      color={performanceTrends.responseTime.isImprovement ? '#10B981' : '#EF4444'} 
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </View>
                
                <View>
                  <Text className="text-body-small text-text-secondary">Error Rate</Text>
                  <View className="flex-row items-center">
                    <Text className="text-body-large font-semibold text-text-primary">
                      {performanceMetrics[performanceMetrics.length - 1]?.application.errorRate.toFixed(2)}%
                    </Text>
                    <Ionicons 
                      name={performanceTrends.errorRate.direction === 'up' ? 'trending-up' : 'trending-down'} 
                      size={16} 
                      color={performanceTrends.errorRate.isImprovement ? '#10B981' : '#EF4444'} 
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Actions */}
        {canManageSystem && (
          <View className="flex-row gap-3">
            <Button
              title="Refresh Metrics"
              variant="secondary"
              onPress={handleRefresh}
              disabled={refreshing}
              className="flex-1"
              icon="refresh"
            />
            <Button
              title="View Reports"
              variant="primary"
              onPress={() => setActiveTab('performance')}
              className="flex-1"
              icon="analytics"
            />
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPerformanceCharts = () => {
    if (performanceMetrics.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            No Performance Data
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Performance metrics will appear here once data is collected.
          </Text>
        </View>
      );
    }

    const chartData = prepareChartData(performanceMetrics);
    const screenWidth = Dimensions.get('window').width;

    return (
      <ScrollView className="p-4">
        {/* Response Time Chart */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Response Time Trend
            </Text>
            <LineChart
              data={chartData.responseTime}
              width={screenWidth - 56}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#6366f1'
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </Card>

        {/* Resource Usage Chart */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Resource Usage
            </Text>
            <BarChart
              data={chartData.resourceUsage}
              width={screenWidth - 56}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </Card>

        {/* Error Distribution */}
        {chartData.errorDistribution && (
          <Card className="mb-4">
            <View className="p-4">
              <Text className="text-headline-small font-semibold text-text-primary mb-4">
                Error Distribution
              </Text>
              <PieChart
                data={chartData.errorDistribution}
                width={screenWidth - 56}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </View>
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderSystemHealth = () => (
    <ScrollView className="p-4">
      {/* Active Alerts */}
      {systemHealth.activeAlerts.length > 0 && (
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Active Alerts
            </Text>
            
            {systemHealth.activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                type={alert.severity}
                title={alert.title}
                message={alert.description}
                onDismiss={canManageSystem ? () => onDismissAlert(alert.id) : undefined}
                className="mb-3 last:mb-0"
              />
            ))}
          </View>
        </Card>
      )}

      {/* Component Health */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Component Health
          </Text>
          
          {systemHealth.components.map((component) => (
            <View key={component.component} className="flex-row items-center justify-between py-3 border-b border-border-primary last:border-b-0">
              <View className="flex-1">
                <Text className="text-body-medium font-medium text-text-primary">
                  {component.component}
                </Text>
                <Text className="text-body-small text-text-secondary">
                  Last checked: {new Date(component.lastCheck).toLocaleString()}
                </Text>
                {component.responseTime && (
                  <Text className="text-body-small text-text-secondary">
                    Response time: {component.responseTime}ms
                  </Text>
                )}
              </View>
              <View className="items-end">
                <View className={`px-3 py-1 rounded-full ${getHealthStatusStyle(component.status).bg}`}>
                  <Text className={`text-label-small font-medium ${getHealthStatusStyle(component.status).text}`}>
                    {component.status.toUpperCase()}
                  </Text>
                </View>
                {component.errorRate && (
                  <Text className="text-body-small text-text-secondary mt-1">
                    {component.errorRate.toFixed(2)}% errors
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Resource Usage */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Resource Usage
          </Text>
          
          {Object.entries(systemHealth.resources).map(([resource, metric]) => (
            <View key={resource} className="mb-4 last:mb-0">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-body-medium font-medium text-text-primary capitalize">
                  {resource}
                </Text>
                <Text className="text-body-small text-text-secondary">
                  {metric.current} / {metric.threshold} {metric.unit}
                </Text>
              </View>
              
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className={`h-full rounded-full ${getResourceUsageColor(metric)}`}
                  style={{ width: `${Math.min((metric.current / metric.threshold) * 100, 100)}%` }}
                />
              </View>
              
              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-body-small text-text-secondary">
                  Avg: {metric.average} {metric.unit}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={getTrendIcon(metric.trend)} 
                    size={12} 
                    color={getTrendColor(metric.trend)} 
                  />
                  <Text className="text-body-small text-text-secondary ml-1">
                    Peak: {metric.peak} {metric.unit}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );

  const renderRecommendations = () => (
    <ScrollView className="p-4">
      {optimizationRecommendations.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            All Optimized
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            No optimization recommendations at this time.
          </Text>
        </View>
      ) : (
        optimizationRecommendations
          .sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .map((recommendation) => (
            <Card key={recommendation.id} className="mb-4">
              <View className="p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-body-large font-semibold text-text-primary mb-1">
                      {recommendation.title}
                    </Text>
                    <Text className="text-body-medium text-text-secondary mb-2">
                      {recommendation.description}
                    </Text>
                    
                    <View className="flex-row items-center gap-2">
                      <View className={`px-2 py-1 rounded-full ${getPriorityStyle(recommendation.priority).bg}`}>
                        <Text className={`text-label-small font-medium ${getPriorityStyle(recommendation.priority).text}`}>
                          {recommendation.priority.toUpperCase()}
                        </Text>
                      </View>
                      
                      <View className={`px-2 py-1 rounded-full ${getCategoryStyle(recommendation.category).bg}`}>
                        <Text className={`text-label-small font-medium ${getCategoryStyle(recommendation.category).text}`}>
                          {recommendation.category.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-body-small text-text-secondary">
                      Est. timeline
                    </Text>
                    <Text className="text-body-medium font-medium text-text-primary">
                      {recommendation.estimatedTimeline}
                    </Text>
                  </View>
                </View>

                {/* Impact Metrics */}
                <View className="mb-4">
                  <Text className="text-body-small font-medium text-text-primary mb-2">
                    Expected Impact:
                  </Text>
                  
                  <View className="grid grid-cols-2 gap-3">
                    <View className="bg-surface-secondary p-3 rounded-lg">
                      <Text className="text-body-small text-text-secondary">Performance</Text>
                      <Text className="text-body-large font-semibold text-success">
                        +{recommendation.impact.performanceImprovement}%
                      </Text>
                    </View>
                    
                    <View className="bg-surface-secondary p-3 rounded-lg">
                      <Text className="text-body-small text-text-secondary">UX Score</Text>
                      <Text className="text-body-large font-semibold text-primary">
                        {recommendation.impact.userExperienceScore}/10
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Implementation Steps Preview */}
                {recommendation.implementationPlan.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-body-small font-medium text-text-primary mb-2">
                      Implementation Steps:
                    </Text>
                    
                    {recommendation.implementationPlan.slice(0, 3).map((step) => (
                      <View key={step.step} className="flex-row items-start mb-2">
                        <View className="w-5 h-5 bg-primary/20 rounded-full items-center justify-center mr-3 mt-1">
                          <Text className="text-label-small font-medium text-primary">
                            {step.step}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-body-small text-text-primary">
                            {step.title}
                          </Text>
                          <Text className="text-body-small text-text-secondary">
                            {step.estimatedDuration}
                          </Text>
                        </View>
                      </View>
                    ))}
                    
                    {recommendation.implementationPlan.length > 3 && (
                      <Text className="text-body-small text-text-secondary ml-8">
                        +{recommendation.implementationPlan.length - 3} more steps
                      </Text>
                    )}
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-2">
                  {canManageSystem && recommendation.status === 'pending' ? (
                    <Button
                      title={processingOptimizations.has(recommendation.id) ? "Applying..." : "Apply Optimization"}
                      variant="primary"
                      size="small"
                      onPress={() => handleApplyOptimization(recommendation)}
                      disabled={processingOptimizations.has(recommendation.id)}
                      className="flex-1"
                      icon="build"
                    />
                  ) : (
                    <View className={`flex-1 px-3 py-2 rounded-lg ${getStatusStyle(recommendation.status).bg} border ${getStatusStyle(recommendation.status).border}`}>
                      <Text className={`text-body-small text-center ${getStatusStyle(recommendation.status).text}`}>
                        {recommendation.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  )}
                  
                  <Button
                    title="Details"
                    variant="ghost"
                    size="small"
                    onPress={() => {/* Navigate to details */}}
                    icon="information-circle-outline"
                  />
                </View>
              </View>
            </Card>
          ))
      )}
    </ScrollView>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Performance Center
        </Text>
        <Text className="text-body-large text-text-secondary">
          System optimization and performance monitoring
        </Text>
      </View>

      {/* Health Status Banner */}
      <View className={`p-4 border-b border-border-primary ${getHealthScoreStyle(healthScore).banner}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons 
              name={getHealthScoreIcon(healthScore)} 
              size={24} 
              color={getHealthScoreStyle(healthScore).iconColor} 
            />
            <View className="ml-3">
              <Text className="text-body-large font-semibold text-text-primary">
                System Health: {healthScore}/100
              </Text>
              <Text className="text-body-small text-text-secondary">
                {systemHealth.activeAlerts.length} alerts • {systemHealth.uptime.toFixed(1)}% uptime
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Ionicons name="refresh" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'overview', label: 'Overview', icon: 'speedometer-outline' },
          { key: 'performance', label: 'Performance', icon: 'analytics-outline' },
          { key: 'health', label: 'Health', icon: 'heart-outline', count: systemHealth.activeAlerts.length },
          { key: 'recommendations', label: 'Optimize', icon: 'build-outline', count: optimizationRecommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center relative">
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#6366f1' : '#6B7280'} 
              />
              <Text className={`text-body-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
              {tab.count && tab.count > 0 && (
                <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                  <Text className="text-white text-xs font-medium">
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'performance' && (canViewReports ? renderPerformanceCharts() : <View className="flex-1 items-center justify-center p-4"><Text className="text-text-secondary">Access Restricted</Text></View>)}
        {activeTab === 'health' && (canViewReports ? renderSystemHealth() : <View className="flex-1 items-center justify-center p-4"><Text className="text-text-secondary">Access Restricted</Text></View>)}
        {activeTab === 'recommendations' && (canViewReports ? renderRecommendations() : <View className="flex-1 items-center justify-center p-4"><Text className="text-text-secondary">Access Restricted</Text></View>)}
      </View>
    </View>
  );
};

// Helper functions
const calculateTrend = (previous: number, current: number, lowerIsBetter: boolean = false): { direction: 'up' | 'down', change: number, isImprovement: boolean } => {
  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? 'up' : 'down';
  const isImprovement = lowerIsBetter ? change < 0 : change > 0;
  
  return { direction, change: Math.abs(change), isImprovement };
};

const getHealthScoreStyle = (score: number) => {
  if (score >= 90) {
    return {
      bg: 'bg-success/10',
      text: 'text-success',
      banner: 'bg-success/5',
      iconColor: '#10B981'
    };
  } else if (score >= 70) {
    return {
      bg: 'bg-warning/10',
      text: 'text-warning',
      banner: 'bg-warning/5',
      iconColor: '#F59E0B'
    };
  } else {
    return {
      bg: 'bg-error/10',
      text: 'text-error',
      banner: 'bg-error/5',
      iconColor: '#EF4444'
    };
  }
};

const getHealthScoreIcon = (score: number): any => {
  if (score >= 90) return 'checkmark-circle';
  if (score >= 70) return 'warning';
  return 'alert-circle';
};

const getHealthStatusStyle = (status: HealthStatus) => {
  const styles = {
    healthy: { bg: 'bg-success/10', text: 'text-success' },
    warning: { bg: 'bg-warning/10', text: 'text-warning' },
    critical: { bg: 'bg-error/10', text: 'text-error' },
    unknown: { bg: 'bg-gray-100', text: 'text-gray-700' }
  };
  return styles[status] || styles.unknown;
};

const getIncidentSeverityColor = (severity: string): string => {
  const colors = {
    critical: 'bg-error',
    major: 'bg-warning',
    minor: 'bg-blue-500'
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-400';
};

const getPriorityStyle = (priority: OptimizationPriority) => {
  const styles = {
    critical: { bg: 'bg-error/10', text: 'text-error' },
    high: { bg: 'bg-warning/10', text: 'text-warning' },
    medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
    low: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[priority] || styles.medium;
};

const getCategoryStyle = (category: OptimizationCategory) => {
  const styles = {
    performance: { bg: 'bg-purple-50', text: 'text-purple-700' },
    cost: { bg: 'bg-green-50', text: 'text-green-700' },
    security: { bg: 'bg-red-50', text: 'text-red-700' },
    user_experience: { bg: 'bg-blue-50', text: 'text-blue-700' },
    scalability: { bg: 'bg-indigo-50', text: 'text-indigo-700' }
  };
  return styles[category] || styles.performance;
};

const getStatusStyle = (status: string) => {
  const styles = {
    pending: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    approved: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    in_progress: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    completed: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    rejected: { bg: 'bg-error/10', text: 'text-error', border: 'border-error/20' }
  };
  return styles[status as keyof typeof styles] || styles.pending;
};

const getResourceUsageColor = (metric: ResourceMetric): string => {
  const usage = (metric.current / metric.threshold) * 100;
  if (usage >= 90) return 'bg-error';
  if (usage >= 70) return 'bg-warning';
  return 'bg-success';
};

const getTrendIcon = (trend: string): any => {
  return trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
};

const getTrendColor = (trend: string): string => {
  return trend === 'up' ? '#EF4444' : trend === 'down' ? '#10B981' : '#6B7280';
};

const prepareChartData = (metrics: PerformanceMetrics[]) => {
  const last7 = metrics.slice(-7);
  
  return {
    responseTime: {
      labels: last7.map(m => new Date(m.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: last7.map(m => m.application.responseTime)
      }]
    },
    resourceUsage: {
      labels: ['CPU', 'Memory', 'Storage'],
      datasets: [{
        data: [
          metrics[metrics.length - 1]?.application.cpuUsage || 0,
          metrics[metrics.length - 1]?.application.memoryUsage || 0,
          50 // Mock storage usage
        ]
      }]
    },
    errorDistribution: [
      { name: 'Application', count: 15, color: '#EF4444', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Network', count: 8, color: '#F59E0B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'Database', count: 3, color: '#6366F1', legendFontColor: '#7F7F7F', legendFontSize: 12 },
      { name: 'System', count: 2, color: '#10B981', legendFontColor: '#7F7F7F', legendFontSize: 12 }
    ]
  };
};

export default PerformanceOptimizer;