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
  Users,
  Building2,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Settings,
  Bell,
  Shield,
  BarChart3,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardMetrics } from '@/components/admin/DashboardMetrics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
  textColor: string;
  badge?: number;
}

/**
 * Enhanced Admin Dashboard - Main dashboard for super admins
 * 
 * Features:
 * - Real-time metrics and analytics
 * - Society onboarding management
 * - Manager assignment overview
 * - Quick actions based on permissions
 * - Live notifications and alerts
 */
export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useDirectAuth();
  const { 
    analytics, 
    loading, 
    error, 
    loadDashboard,
    checkPermission,
    getPendingApprovalsCount,
    getHighPriorityItemsCount,
  } = useDirectAdmin();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard?.();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboard?.();
    } finally {
      setRefreshing(false);
    }
  };

  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    // Society Onboarding
    actions.push({
      id: 'onboarding',
      title: 'Society Onboarding',
      subtitle: 'Review new applications',
      icon: <Building2 size={24} color="#059669" />,
      onPress: () => router.push('/admin/onboarding/'),
      color: 'bg-green-50',
      textColor: 'text-green-900',
      badge: getPendingApprovalsCount?.() || 0,
    });

    // Society Management
    if (checkPermission?.('societies', 'manage')) {
      actions.push({
        id: 'societies',
        title: 'Society Management',
        subtitle: 'Manage all societies',
        icon: <Users size={24} color="#0284c7" />,
        onPress: () => router.push('/admin/societies/'),
        color: 'bg-blue-50',
        textColor: 'text-blue-900',
      });
    }

    // Manager Assignments
    if (checkPermission?.('managers', 'assign')) {
      actions.push({
        id: 'managers',
        title: 'Manager Assignments',
        subtitle: 'Assign community managers',
        icon: <UserCheck size={24} color="#7c3aed" />,
        onPress: () => router.push('/admin/managers/'),
        color: 'bg-purple-50',
        textColor: 'text-purple-900',
      });
    }

    // Analytics & Reports
    if (checkPermission?.('analytics', 'view')) {
      actions.push({
        id: 'analytics',
        title: 'Analytics & Reports',
        subtitle: 'View detailed insights',
        icon: <BarChart3 size={24} color="#ea580c" />,
        onPress: () => router.push('/admin/analytics/'),
        color: 'bg-orange-50',
        textColor: 'text-orange-900',
      });
    }

    // High Priority Items
    const highPriorityCount = getHighPriorityItemsCount?.() || 0;
    if (highPriorityCount > 0) {
      actions.push({
        id: 'priority',
        title: 'Priority Items',
        subtitle: 'Urgent tasks requiring attention',
        icon: <AlertTriangle size={24} color="#dc2626" />,
        onPress: () => router.push('/admin/societies/?filter=high_priority'),
        color: 'bg-red-50',
        textColor: 'text-red-900',
        badge: highPriorityCount,
      });
    }

    // System Settings
    if (checkPermission?.('system', 'admin')) {
      actions.push({
        id: 'settings',
        title: 'System Settings',
        subtitle: 'Configure system options',
        icon: <Settings size={24} color="#6b7280" />,
        onPress: () => router.push('/admin/settings/'),
        color: 'bg-gray-50',
        textColor: 'text-gray-900',
      });
    }

    return actions;
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Shield size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Access Denied
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Super admin privileges required to access this area.
        </Text>
        <Button
          title="Return to Dashboard"
          onPress={() => router.replace('/(tabs)/')}
          variant="primary"
          className="mt-6"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Admin Dashboard" 
        subtitle={`Welcome back, ${user?.fullName || user?.name || 'Admin'}`}
        showNotifications
      />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Metrics */}
        <View className="px-4 py-2">
          <DashboardMetrics 
            analytics={analytics}
            loading={loading}
          />
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Quick Actions
            </Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text className="text-blue-600 font-medium">Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap gap-3">
            {getQuickActions().map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={action.onPress}
                className={cn(
                  'flex-1 min-w-[160px] p-4 rounded-xl border border-gray-200',
                  action.color
                )}
                style={{ minWidth: '47%' }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  {action.icon}
                  {action.badge && action.badge > 0 && (
                    <View className="bg-red-500 rounded-full min-w-[20px] h-5 px-1 items-center justify-center">
                      <Text className="text-white text-xs font-semibold">
                        {action.badge > 99 ? '99+' : action.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className={cn(
                  'font-semibold text-sm mb-1',
                  action.textColor
                )}>
                  {action.title}
                </Text>
                <Text className="text-gray-600 text-xs">
                  {action.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-4 py-2 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </Text>
          <Card className="p-4">
            <View className="items-center py-8">
              <Clock size={32} color="#6b7280" />
              <Text className="text-gray-600 mt-2 text-center">
                Activity feed will be available soon
              </Text>
              <Text className="text-gray-500 text-sm text-center mt-1">
                Track all admin actions and system events
              </Text>
            </View>
          </Card>
        </View>

        {/* Error Display */}
        {error && (
          <View className="px-4 py-2 mb-6">
            <Card className="p-4 bg-red-50 border-red-200">
              <View className="flex-row items-center">
                <AlertTriangle size={20} color="#dc2626" />
                <Text className="text-red-800 ml-2 flex-1">
                  {error}
                </Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}