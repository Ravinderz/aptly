import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Building2,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  BarChart3,
  LogOut,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { RequireManager } from '@/components/auth/RoleGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { 
  calculateSocietyHealthScore, 
  getSampleHealthMetrics,
  getHealthScoreColor,
  formatHealthScore 
} from '@/utils/societyHealthScoring';

interface ManagerMetrics {
  assignedSocieties: number;
  totalResidents: number;
  activeTickets: number;
  resolvedTickets: number;
  averageResponseTime: number; // hours
  satisfactionScore: number; // percentage
  monthlyTargets: {
    responseTime: number;
    resolutionRate: number;
    satisfactionTarget: number;
  };
}

interface AssignedSociety {
  id: string;
  name: string;
  totalUnits: number;
  occupiedUnits: number;
  activeIssues: number;
  lastActivity: string;
  healthScore: number; // 0-100
  status: 'healthy' | 'attention_needed' | 'critical';
  healthBreakdown?: {
    engagement: number;
    issueManagement: number;
    financial: number;
    communication: number;
    maintenance: number;
    satisfaction: number;
  };
  recommendations?: string[];
  trends?: {
    direction: 'improving' | 'declining' | 'stable';
    changePercentage: number;
    period: string;
  };
}

/**
 * Community Manager Dashboard - Main dashboard for community managers
 * 
 * Features:
 * - Overview of assigned societies
 * - Performance metrics and KPIs
 * - Support ticket queue
 * - Quick actions for society management
 */
function ManagerDashboard() {
  const router = useRouter();
  const { user, logout } = useDirectAuth();
  const { analytics, loading, error, loadDashboard } = useDirectAdmin();
  
  const [refreshing, setRefreshing] = useState(false);
  const [managerMetrics, setManagerMetrics] = useState<ManagerMetrics | null>(null);
  const [assignedSocieties, setAssignedSocieties] = useState<AssignedSociety[]>([]);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      // Load manager-specific data
      await loadDashboard?.();
      
      // Mock manager metrics - replace with actual API call
      setManagerMetrics({
        assignedSocieties: 3,
        totalResidents: 450,
        activeTickets: 12,
        resolvedTickets: 89,
        averageResponseTime: 2.5,
        satisfactionScore: 94,
        monthlyTargets: {
          responseTime: 4,
          resolutionRate: 90,
          satisfactionTarget: 92,
        },
      });

      // Calculate real-time health scores for assigned societies
      const societiesWithHealthScores = [
        {
          id: '1',
          name: 'Green Valley Society',
          totalUnits: 150,
          occupiedUnits: 142,
          activeIssues: 3,
          lastActivity: '2 hours ago',
        },
        {
          id: '2', 
          name: 'Sunrise Apartments',
          totalUnits: 200,
          occupiedUnits: 185,
          activeIssues: 8,
          lastActivity: '1 day ago',
        },
        {
          id: '3',
          name: 'Metro Heights',
          totalUnits: 100,
          occupiedUnits: 95,
          activeIssues: 1,
          lastActivity: '3 hours ago',
        },
      ].map(society => {
        // Generate health metrics based on society data
        const healthMetrics = {
          ...getSampleHealthMetrics(),
          totalResidents: society.totalUnits,
          activeResidents: society.occupiedUnits,
          openIssues: society.activeIssues,
          // Vary metrics based on society characteristics
          paymentComplianceRate: society.id === '2' ? 85 : 92,
          residentSatisfactionScore: society.id === '2' ? 3.5 : 4.2,
          communityParticipation: society.id === '2' ? 45 : 65,
        };
        
        const healthResult = calculateSocietyHealthScore(healthMetrics);
        
        return {
          ...society,
          healthScore: healthResult.overall,
          status: healthResult.status,
          healthBreakdown: healthResult.breakdown,
          recommendations: healthResult.recommendations,
          trends: healthResult.trends,
        };
      });

      setAssignedSocieties(societiesWithHealthScores);
    } catch (error) {
      console.error('Failed to load manager data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadManagerData();
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

  const getStatusColor = (status: AssignedSociety['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'attention_needed': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: AssignedSociety['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} color="#059669" />;
      case 'attention_needed': return <AlertCircle size={16} color="#d97706" />;
      case 'critical': return <AlertCircle size={16} color="#dc2626" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  // Role check - only community managers can access
  if (!user || user.role !== 'community_manager') {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <User size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Community Manager Access Required
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

  return (
    <RequireManager>
      <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Manager Dashboard" 
        subtitle={`Welcome back, ${user?.fullName || user?.name || 'Manager'}`}
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
        {/* Performance Metrics */}
        {managerMetrics && (
          <View className="px-4 py-2">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Performance Overview
            </Text>
            
            <View className="flex-row flex-wrap gap-3 mb-6">
              {/* Assigned Societies */}
              <Card className="flex-1 min-w-[160px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Building2 size={24} color="#0284c7" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {managerMetrics.assignedSocieties}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Assigned Societies</Text>
                <Text className="text-xs text-gray-600">
                  {managerMetrics.totalResidents} total residents
                </Text>
              </Card>

              {/* Active Tickets */}
              <Card className="flex-1 min-w-[160px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <MessageSquare size={24} color="#dc2626" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {managerMetrics.activeTickets}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Active Tickets</Text>
                <Text className="text-xs text-gray-600">
                  {managerMetrics.resolvedTickets} resolved this month
                </Text>
              </Card>

              {/* Response Time */}
              <Card className="flex-1 min-w-[160px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Clock size={24} color="#059669" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {managerMetrics.averageResponseTime}h
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Avg Response</Text>
                <Text className="text-xs text-green-600">
                  Target: {managerMetrics.monthlyTargets.responseTime}h
                </Text>
              </Card>

              {/* Satisfaction Score */}
              <Card className="flex-1 min-w-[160px] p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <TrendingUp size={24} color="#7c3aed" />
                  <Text className="text-2xl font-bold text-gray-900">
                    {managerMetrics.satisfactionScore}%
                  </Text>
                </View>
                <Text className="text-sm font-medium text-gray-900">Satisfaction</Text>
                <Text className="text-xs text-purple-600">
                  Target: {managerMetrics.monthlyTargets.satisfactionTarget}%
                </Text>
              </Card>
            </View>
          </View>
        )}

        {/* Assigned Societies */}
        <View className="px-4 py-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Assigned Societies
            </Text>
            <TouchableOpacity onPress={() => router.push('/manager/societies/')}>
              <Text className="text-blue-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-3">
            {assignedSocieties.map((society) => (
              <TouchableOpacity
                key={society.id}
                onPress={() => router.push(`/manager/societies/${society.id}/`)}
              >
                <Card className="p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {society.name}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {society.occupiedUnits}/{society.totalUnits} units occupied
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center mb-1">
                        {getStatusIcon(society.status)}
                        <Text className={cn("text-sm font-medium ml-1", getStatusColor(society.status))}>
                          {society.status.replace('_', ' ')}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-xs font-medium" style={{ color: getHealthScoreColor(society.healthScore) }}>
                          {formatHealthScore(society.healthScore)}
                        </Text>
                        <Text className="text-xs text-gray-500 ml-1">
                          ({society.healthScore}%)
                        </Text>
                      </View>
                      {society.trends && society.trends.direction !== 'stable' && (
                        <Text className="text-xs" style={{ 
                          color: society.trends.direction === 'improving' ? '#059669' : '#dc2626' 
                        }}>
                          {society.trends.direction === 'improving' ? '↗' : '↘'} {society.trends.changePercentage}%
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-gray-600">
                      {society.activeIssues} active issues
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Last activity: {society.lastActivity}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-2 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </Text>
          
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity
              onPress={() => router.push('/manager/support/')}
              className="flex-1 min-w-[160px] p-4 bg-red-50 rounded-xl border border-red-200"
            >
              <MessageSquare size={24} color="#dc2626" />
              <Text className="text-sm font-semibold text-red-900 mt-2">
                Support Queue
              </Text>
              <Text className="text-xs text-red-700">
                {managerMetrics?.activeTickets || 0} pending
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/manager/reports/')}
              className="flex-1 min-w-[160px] p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <BarChart3 size={24} color="#0284c7" />
              <Text className="text-sm font-semibold text-blue-900 mt-2">
                Performance Reports
              </Text>
              <Text className="text-xs text-blue-700">
                View detailed analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Display */}
        {error && (
          <View className="px-4 py-2 mb-6">
            <Card className="p-4 bg-red-50 border-red-200">
              <View className="flex-row items-center">
                <AlertCircle size={20} color="#dc2626" />
                <Text className="text-red-800 ml-2 flex-1">
                  {error}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
      </View>
    </RequireManager>
  );
}

// Add proper named export with displayName for React DevTools
ManagerDashboard.displayName = 'ManagerDashboard';

export default ManagerDashboard;