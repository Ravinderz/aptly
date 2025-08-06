import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  Building2,
  Award,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { RequireManager } from '@/components/auth/RoleGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface PerformanceMetrics {
  period: string;
  totalTickets: number;
  resolvedTickets: number;
  averageResponseTime: number; // hours
  satisfactionScore: number; // percentage
  societiesManaged: number;
  resolutionRate: number; // percentage
}

interface SocietyPerformance {
  societyId: string;
  societyName: string;
  ticketsHandled: number;
  averageResponseTime: number;
  satisfactionScore: number;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

function ManagerReports() {
  const router = useRouter();
  const { user, logout } = useDirectAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [societyPerformance, setSocietyPerformance] = useState<SocietyPerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockMetrics: PerformanceMetrics = {
        period: selectedPeriod,
        totalTickets: 45,
        resolvedTickets: 38,
        averageResponseTime: 2.5,
        satisfactionScore: 94,
        societiesManaged: 4,
        resolutionRate: 84,
      };

      const mockSocietyPerformance: SocietyPerformance[] = [
        {
          societyId: '1',
          societyName: 'Green Valley Society',
          ticketsHandled: 15,
          averageResponseTime: 2.1,
          satisfactionScore: 96,
          healthScore: 85,
          trend: 'improving',
        },
        {
          societyId: '2',
          societyName: 'Sunrise Apartments',
          ticketsHandled: 18,
          averageResponseTime: 3.2,
          satisfactionScore: 88,
          healthScore: 65,
          trend: 'stable',
        },
        {
          societyId: '3',
          societyName: 'Metro Heights',
          ticketsHandled: 8,
          averageResponseTime: 1.8,
          satisfactionScore: 98,
          healthScore: 92,
          trend: 'improving',
        },
        {
          societyId: '4',
          societyName: 'Royal Gardens',
          ticketsHandled: 4,
          averageResponseTime: 4.5,
          satisfactionScore: 75,
          healthScore: 35,
          trend: 'declining',
        },
      ];
      
      setPerformanceMetrics(mockMetrics);
      setSocietyPerformance(mockSocietyPerformance);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPerformanceData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getTrendIcon = (trend: SocietyPerformance['trend']) => {
    switch (trend) {
      case 'improving': return <TrendingUp size={16} color="#059669" />;
      case 'declining': return <TrendingDown size={16} color="#dc2626" />;
      default: return <View className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: SocietyPerformance['trend']) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600' };
    if (score >= 70) return { grade: 'B', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-600' };
    return { grade: 'D', color: 'text-red-600' };
  };

  if (!performanceMetrics) {
    return (
      <RequireManager>
        <View className="flex-1 justify-center items-center bg-gray-50">
          <BarChart3 size={48} color="#6b7280" />
          <Text className="text-gray-600 mt-4">Loading performance data...</Text>
        </View>
      </RequireManager>
    );
  }

  return (
    <RequireManager>
      <View className="flex-1 bg-gray-50">
        <AdminHeader 
          title="Performance Reports" 
          subtitle={`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}ly performance overview`}
          showBack
          showNotifications
          showLogout
          onLogout={handleLogout}
        />
        
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Period Selection */}
          <View className="px-4 py-2">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Time Period
            </Text>
            
            <View className="flex-row gap-2 mb-6">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-4 py-2 rounded-lg border flex-1 items-center",
                    selectedPeriod === period 
                      ? "bg-blue-100 border-blue-300" 
                      : "bg-white border-gray-300"
                  )}
                >
                  <Text className={cn(
                    "text-sm font-medium capitalize",
                    selectedPeriod === period ? "text-blue-800" : "text-gray-700"
                  )}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Overall Performance Metrics */}
          <View className="px-4 py-2">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Overall Performance
            </Text>
            
            <View className="flex-row flex-wrap gap-3 mb-6">
              <Card className="flex-1 min-w-[140px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <MessageSquare size={24} color="#0284c7" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {performanceMetrics.totalTickets}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Total Tickets</Text>
                <Text className="text-xs text-gray-600">
                  {performanceMetrics.resolvedTickets} resolved
                </Text>
              </Card>

              <Card className="flex-1 min-w-[140px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Clock size={24} color="#059669" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {performanceMetrics.averageResponseTime}h
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Avg Response</Text>
                <Text className="text-xs text-green-600">Target: 4h</Text>
              </Card>

              <Card className="flex-1 min-w-[140px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Award size={24} color="#7c3aed" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {performanceMetrics.satisfactionScore}%
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Satisfaction</Text>
                <Text className="text-xs text-purple-600">Target: 90%</Text>
              </Card>

              <Card className="flex-1 min-w-[140px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <CheckCircle size={24} color="#ea580c" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {performanceMetrics.resolutionRate}%
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Resolution Rate</Text>
                <Text className="text-xs text-orange-600">Target: 85%</Text>
              </Card>
            </View>
          </View>

          {/* Performance Grade */}
          <View className="px-4 py-2">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    Overall Performance Grade
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Based on response time, satisfaction, and resolution rate
                  </Text>
                </View>
                <View className="items-center">
                  <Text className={cn("text-4xl font-bold", getPerformanceGrade(performanceMetrics.satisfactionScore).color)}>
                    {getPerformanceGrade(performanceMetrics.satisfactionScore).grade}
                  </Text>
                  <Text className="text-sm text-gray-600">Grade</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Society-wise Performance */}
          <View className="px-4 py-2 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Society-wise Performance
            </Text>
            
            <View className="space-y-3">
              {societyPerformance.map((society) => (
                <Card key={society.societyId} className="p-4">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {society.societyName}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {society.ticketsHandled} tickets handled
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <View className="flex-row items-center mb-1">
                        {getTrendIcon(society.trend)}
                        <Text className={cn("text-sm font-medium ml-1", getTrendColor(society.trend))}>
                          {society.trend}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        Health: {society.healthScore}%
                      </Text>
                    </View>
                  </View>

                  {/* Metrics */}
                  <View className="flex-row justify-between items-center">
                    <View className="items-center">
                      <Text className="text-lg font-bold text-gray-900">
                        {society.averageResponseTime}h
                      </Text>
                      <Text className="text-xs text-gray-600">Response Time</Text>
                    </View>
                    
                    <View className="items-center">
                      <Text className="text-lg font-bold text-gray-900">
                        {society.satisfactionScore}%
                      </Text>
                      <Text className="text-xs text-gray-600">Satisfaction</Text>
                    </View>
                    
                    <View className="items-center">
                      <Text className={cn("text-lg font-bold", getPerformanceGrade(society.satisfactionScore).color)}>
                        {getPerformanceGrade(society.satisfactionScore).grade}
                      </Text>
                      <Text className="text-xs text-gray-600">Grade</Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  <View className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => router.push(`/manager/societies/${society.societyId}/`)}
                    >
                      View Society Details
                    </Button>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* Export Options */}
          <View className="px-4 py-2 mb-6">
            <Card className="p-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Export Report
              </Text>
              <Text className="text-sm text-gray-600 mb-4">
                Download detailed performance report for the selected period
              </Text>
              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => {/* Handle PDF export */}}
                >
                  Export PDF
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onPress={() => {/* Handle CSV export */}}
                >
                  Export CSV
                </Button>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </RequireManager>
  );
}

// Add proper named export with displayName for React DevTools
ManagerReports.displayName = 'ManagerReports';

export default ManagerReports;