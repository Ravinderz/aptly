import { DashboardMetrics } from '@/components/admin/DashboardMetrics';
import { RequireSuperAdmin } from '@/components/auth/RoleGuard';
import { StandardHeader } from '@/components/design-system';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { cn } from '@/utils/cn';
import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    BarChart3,
    Building2,
    Clock,
    Settings,
    Shield,
    UserCheck,
    Users
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useDirectAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const quickActions = useMemo((): QuickAction[] => {
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

    // High Priority Items - use the correct function
    try {
      const highPriorityCount = getHighPriorityItemsCount?.() || 0;
      if (highPriorityCount > 0) {
        actions.push({
          id: 'priority',
          title: 'Priority Items',
          subtitle: 'Urgent tasks requiring attention',
          icon: <AlertTriangle size={24} color="#dc2626" />,
          onPress: () => router.push('/admin/onboarding/?filter=high_priority'),
          color: 'bg-red-50',
          textColor: 'text-red-900',
          badge: highPriorityCount,
        });
      }
    } catch (error) {
      console.error('Error getting high priority count:', error);
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
  }, [
    router,
    getPendingApprovalsCount,
    getHighPriorityItemsCount,
    checkPermission,
  ]);

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
    <RequireSuperAdmin>
      <View className="flex-1 bg-gray-50" testID="admin.dashboard.screen">
      <StandardHeader 
        title="Admin Dashboard" 
        subtitle={`Welcome back, ${user?.fullName || user?.name || 'Admin'}`}
        showNotifications
        showLogout
        showRoleIndicator
        onLogout={handleLogout}
        testID="admin.dashboard.header"
      />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        testID="admin.dashboard.scroll"
      >
        {/* Dashboard Metrics */}
        <View className="px-4 py-2" testID="admin.dashboard.metrics">
          <DashboardMetrics 
            analytics={analytics}
            loading={loading}
            testID="admin.dashboard.metrics.component"
          />
        </View>

        {/* Quick Actions */}
        <View className="px-4 py-2" testID="admin.dashboard.quick-actions">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900" testID="admin.dashboard.quick-actions.title">
              Quick Actions
            </Text>
            <TouchableOpacity onPress={handleRefresh} testID="admin.dashboard.refresh-button">
              <Text className="text-blue-600 font-medium">Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap gap-3" testID="admin.dashboard.actions-grid">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={action.onPress}
                className={cn(
                  'flex-1 min-w-[160px] p-4 rounded-xl border border-gray-200',
                  action.color
                )}
                style={{ minWidth: '47%' }}
                testID={`admin.dashboard.action.${action.id}`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  {action.icon}
                  {action.badge && action.badge > 0 && (
                    <View className="bg-red-500 rounded-full min-w-[20px] h-5 px-1 items-center justify-center">
                      <Text className="text-white text-xs font-semibold">
                        {action.badge > 99 ? '99+' : String(action.badge)}
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
    </RequireSuperAdmin>
  );
}

// Fixed: Add proper named export with displayName for React DevTools
AdminDashboard.displayName = 'AdminDashboard';

// Export as default
export default AdminDashboard;