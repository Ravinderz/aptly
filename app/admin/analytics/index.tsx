import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardMetrics } from '@/components/admin/DashboardMetrics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FilterPill from '@/components/ui/FilterPill';

/**
 * Admin Analytics - Detailed analytics and reporting
 * 
 * Features:
 * - Comprehensive metrics and KPIs
 * - Time range filtering
 * - Export capabilities
 * - Trend analysis
 */
export default function AdminAnalytics() {
  const { 
    analytics, 
    loading, 
    error, 
    loadAnalytics,
    analyticsTimeRange,
    setAnalyticsTimeRange,
  } = useDirectAdmin();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics?.();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAnalytics?.();
    } finally {
      setRefreshing(false);
    }
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setAnalyticsTimeRange?.(range);
    loadAnalytics?.(range);
  };

  const timeRangeOptions = [
    { label: '7 Days', value: '7d' as const },
    { label: '30 Days', value: '30d' as const },
    { label: '90 Days', value: '90d' as const },
    { label: '1 Year', value: '1y' as const },
  ];

  const handleExportData = () => {
    // Implement export functionality
    console.log('Export analytics data');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Analytics & Reports" 
        subtitle="Comprehensive insights and metrics"
        showBack
        showNotifications
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Selector */}
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-900">
              Time Period
            </Text>
            <Button
              onPress={handleExportData}
              variant="outline"
              size="sm"
            >
              Export
            </Button>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {timeRangeOptions.map((option) => (
                <FilterPill
                  key={option.value}
                  label={option.label}
                  selected={analyticsTimeRange === option.value}
                  onPress={() => handleTimeRangeChange(option.value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Main Metrics */}
        <View className="px-4 py-2">
          <DashboardMetrics 
            analytics={analytics}
            loading={loading}
          />
        </View>

        {/* Detailed Analytics Sections */}
        {analytics && (
          <>
            {/* Revenue Analytics */}
            <View className="px-4 mb-6">
              <Card className="p-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    Revenue Analytics
                  </Text>
                  <TrendingUp size={20} color="#059669" />
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Monthly Revenue</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      ₹{(analytics.revenue.monthlyRevenue / 100000).toFixed(1)}L
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Yearly Revenue</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      ₹{(analytics.revenue.yearlyRevenue / 10000000).toFixed(1)}Cr
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Revenue Growth</Text>
                    <Text className={`text-base font-semibold ${
                      analytics.revenue.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analytics.revenue.revenueGrowth > 0 ? '+' : ''}
                      {(analytics.revenue.revenueGrowth * 100).toFixed(1)}%
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Avg. Revenue Per Society</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      ₹{(analytics.revenue.averageRevenuePerSociety / 1000).toFixed(0)}K
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Society Analytics */}
            <View className="px-4 mb-6">
              <Card className="p-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    Society Analytics
                  </Text>
                  <BarChart3 size={20} color="#0284c7" />
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Active Societies</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {analytics.societies.activeSocieties}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">New This Month</Text>
                    <Text className="text-base font-semibold text-green-600">
                      +{analytics.societies.newSocietiesThisMonth}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Pending Approvals</Text>
                    <Text className="text-base font-semibold text-yellow-600">
                      {analytics.societies.pendingApprovals}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Suspended</Text>
                    <Text className="text-base font-semibold text-red-600">
                      {analytics.societies.suspendedSocieties}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Avg. Occupancy Rate</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {(analytics.societies.averageOccupancyRate * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* User Analytics */}
            <View className="px-4 mb-6">
              <Card className="p-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    User Analytics
                  </Text>
                  <TrendingUp size={20} color="#7c3aed" />
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Total Active Users</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {analytics.users.totalActiveUsers.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">New This Month</Text>
                    <Text className="text-base font-semibold text-green-600">
                      +{analytics.users.newUsersThisMonth}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Retention Rate</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {(analytics.users.userRetentionRate * 100).toFixed(1)}%
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Avg. Session Duration</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {Math.round(analytics.users.averageSessionDuration / 60)} min
                    </Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Support Analytics */}
            <View className="px-4 mb-6">
              <Card className="p-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    Support & Service
                  </Text>
                  <Calendar size={20} color="#ea580c" />
                </View>
                
                <View className="space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Open Tickets</Text>
                    <Text className="text-base font-semibold text-orange-600">
                      {analytics.support.openTickets}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Resolved This Month</Text>
                    <Text className="text-base font-semibold text-green-600">
                      {analytics.support.resolvedTicketsThisMonth}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Avg. Resolution Time</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {analytics.support.averageResolutionTime.toFixed(1)}h
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Customer Satisfaction</Text>
                    <Text className="text-base font-semibold text-purple-600">
                      {analytics.support.customerSatisfactionScore.toFixed(1)}/5.0
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          </>
        )}

        {/* Error Display */}
        {error && (
          <View className="px-4 mb-6">
            <Card className="p-4 bg-red-50 border-red-200">
              <Text className="text-red-800 text-center">
                {error}
              </Text>
              <Button
                onPress={() => loadAnalytics?.()}
                variant="outline"
                className="mt-3"
              >
                Retry
              </Button>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}