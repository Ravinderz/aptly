import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useSecurityPermissions } from '@/hooks/useSecurityPermissions';
import { StandardHeader } from '@/components/design-system';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Shield, 
  Users, 
  Clock, 
  AlertTriangle,
  Car,
  TrendingUp,
  UserCheck,
  UserX,
  Timer,
  Bell,
  ArrowRight,
  RefreshCw,
  MapPin,
  LogOut
} from 'lucide-react-native';
import { router } from 'expo-router';
import { cn } from '@/utils/cn';
import type { SecurityDashboardStats, EmergencyAlert } from '@/types/security';

/**
 * Enhanced Security Guard Dashboard - Phase 2
 * 
 * Features:
 * - Real-time visitor and vehicle metrics
 * - Live status monitoring
 * - Quick action navigation
 * - Emergency alerts display
 * - Overstay visitor tracking
 * - Today's activity summary
 */
function SecurityDashboard() {
  const { user, logout } = useDirectAuth();
  const { 
    permissions, 
    permissionLevel,
    canManageVisitors,
    canHandleEmergencies,
    canManageVehicles,
    getActivePermissions 
  } = useSecurityPermissions();

  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Mock data for Phase 2 - will be replaced with real API calls
  const [stats, setStats] = useState<SecurityDashboardStats>({
    visitorsInside: 12,
    todayCheckIns: 28,
    todayCheckOuts: 16,
    overstayingVisitors: 2,
    pendingApprovals: 5,
    vehiclesParked: 18,
    emergencyAlerts: 0,
    systemStatus: 'operational'
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);

  const activePermissions = getActivePermissions();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#16a34a';
      case 'degraded': return '#f59e0b';
      case 'maintenance': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational': return 'All Systems Operational';
      case 'degraded': return 'Degraded Performance';
      case 'maintenance': return 'Under Maintenance';
      default: return 'Unknown Status';
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

  return (
    <View className="flex-1 bg-gray-50">
      <StandardHeader 
        title="Security Dashboard" 
        subtitle={`Welcome back, ${user?.fullName || 'Security Guard'}`}
        showLogout
        showRoleIndicator
        onLogout={handleLogout}
        rightAction={{
          icon: <RefreshCw size={20} color="#6b7280" />,
          onPress: onRefresh,
          label: "Refresh"
        }}
      />
      
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Last updated info */}
        <View className="mb-4">
          <Text className="text-xs text-gray-500 text-center">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Text>
        </View>

      {/* System Status Banner */}
      <Card className="p-4 mb-6" style={{ backgroundColor: stats.systemStatus === 'operational' ? '#f0fdf4' : '#fef2f2' }}>
        <View className="flex-row items-center">
          <View className="p-2 rounded-full mr-3" style={{ backgroundColor: stats.systemStatus === 'operational' ? '#dcfce7' : '#fee2e2' }}>
            <Shield size={16} color={getStatusColor(stats.systemStatus)} />
          </View>
          <View className="flex-1">
            <Text className="font-medium" style={{ color: getStatusColor(stats.systemStatus) }}>
              {getStatusText(stats.systemStatus)}
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              {stats.systemStatus === 'operational' ? 'All security systems are running normally' : 'Some systems may be affected'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Live Metrics Grid */}
      <Text className="text-lg font-semibold text-gray-900 mb-4">Live Metrics</Text>
      <View className="mb-6">
        <View className="flex-row mb-4">
          <Card className="flex-1 p-4 bg-white mr-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Visitors Inside</Text>
                <Text className="text-2xl font-bold text-blue-600">{stats.visitorsInside}</Text>
              </View>
              <Users size={24} color="#2563eb" />
            </View>
          </Card>
          
          <Card className="flex-1 p-4 bg-white ml-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Vehicles Parked</Text>
                <Text className="text-2xl font-bold text-green-600">{stats.vehiclesParked}</Text>
              </View>
              <Car size={24} color="#16a34a" />
            </View>
          </Card>
        </View>

        <View className="flex-row mb-4">
          <Card className="flex-1 p-4 bg-white mr-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Today Check-ins</Text>
                <Text className="text-2xl font-bold text-gray-900">{stats.todayCheckIns}</Text>
                <View className="flex-row items-center mt-1">
                  <TrendingUp size={12} color="#16a34a" />
                  <Text className="text-xs text-green-600 ml-1">+{stats.todayCheckIns - stats.todayCheckOuts} net</Text>
                </View>
              </View>
              <UserCheck size={24} color="#6b7280" />
            </View>
          </Card>
          
          <Card className="flex-1 p-4 bg-white ml-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Today Check-outs</Text>
                <Text className="text-2xl font-bold text-gray-900">{stats.todayCheckOuts}</Text>
              </View>
              <UserX size={24} color="#6b7280" />
            </View>
          </Card>
        </View>

        {stats.overstayingVisitors > 0 && (
          <Card className="p-4 mb-4 bg-amber-50 border border-amber-200">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-amber-700">Overstaying Visitors</Text>
                <Text className="text-2xl font-bold text-amber-900">{stats.overstayingVisitors}</Text>
                <Text className="text-xs text-amber-600 mt-1">Require immediate attention</Text>
              </View>
              <View className="flex-row items-center">
                <Timer size={20} color="#d97706" />
                <TouchableOpacity 
                  onPress={() => router.push('/security/visitors?filter=overstay')}
                  className="ml-2 p-1"
                >
                  <ArrowRight size={16} color="#d97706" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {stats.pendingApprovals > 0 && (
          <Card className="p-4 mb-4 bg-blue-50 border border-blue-200">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-blue-700">Pending Approvals</Text>
                <Text className="text-2xl font-bold text-blue-900">{stats.pendingApprovals}</Text>
                <Text className="text-xs text-blue-600 mt-1">Awaiting host approval</Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={20} color="#2563eb" />
                <TouchableOpacity 
                  onPress={() => router.push('/security/visitors?filter=pending')}
                  className="ml-2 p-1"
                >
                  <ArrowRight size={16} color="#2563eb" />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      </View>

      {/* Quick Actions */}
      <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
      <View className="mb-6">
        <View className="flex-row mb-3">
          <TouchableOpacity
            disabled={!canManageVisitors}
            onPress={() => router.push('/security/visitors/checkin')}
            className={cn(
              "flex-1 mr-2 p-4 rounded-lg border",
              canManageVisitors 
                ? "bg-indigo-600 border-indigo-600" 
                : "bg-gray-100 border-gray-300"
            )}
          >
            <View className="flex-row items-center justify-center">
              <UserCheck size={16} color={canManageVisitors ? "#ffffff" : "#9ca3af"} />
              <Text className={cn(
                "ml-2 font-medium",
                canManageVisitors ? "text-white" : "text-gray-500"
              )}>
                Check-in Visitor
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canManageVisitors}
            onPress={() => router.push('/security/visitors')}
            className={cn(
              "flex-1 ml-2 p-4 rounded-lg border",
              canManageVisitors 
                ? "bg-white border-indigo-200" 
                : "bg-gray-100 border-gray-300"
            )}
          >
            <View className="flex-row items-center justify-center">
              <Users size={16} color={canManageVisitors ? "#6366f1" : "#9ca3af"} />
              <Text className={cn(
                "ml-2 font-medium",
                canManageVisitors ? "text-indigo-600" : "text-gray-500"
              )}>
                View All
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-3">
          <TouchableOpacity
            disabled={!canManageVehicles}
            onPress={() => router.push('/security/vehicles')}
            className={cn(
              "flex-1 mr-2 p-4 rounded-lg border",
              canManageVehicles 
                ? "bg-white border-indigo-200" 
                : "bg-gray-100 border-gray-300"
            )}
          >
            <View className="flex-row items-center justify-center">
              <Car size={16} color={canManageVehicles ? "#6366f1" : "#9ca3af"} />
              <Text className={cn(
                "ml-2 font-medium",
                canManageVehicles ? "text-indigo-600" : "text-gray-500"
              )}>
                Vehicles
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canHandleEmergencies}
            onPress={() => router.push('/security/emergency')}
            className={cn(
              "flex-1 ml-2 p-4 rounded-lg border",
              canHandleEmergencies 
                ? "bg-red-600 border-red-600" 
                : "bg-gray-100 border-gray-300"
            )}
          >
            <View className="flex-row items-center justify-center">
              <AlertTriangle size={16} color={canHandleEmergencies ? "#ffffff" : "#9ca3af"} />
              <Text className={cn(
                "ml-2 font-medium",
                canHandleEmergencies ? "text-white" : "text-gray-500"
              )}>
                Emergency
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</Text>
      <Card className="p-4 mb-6 bg-white">
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <View>
                <Text className="text-gray-900 font-medium">John Doe checked in</Text>
                <Text className="text-xs text-gray-500">Unit A-204 • 2 minutes ago</Text>
              </View>
            </View>
            <UserCheck size={16} color="#16a34a" />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
              <View>
                <Text className="text-gray-900 font-medium">Vehicle registered</Text>
                <Text className="text-xs text-gray-500">KA-01-AB-1234 • 15 minutes ago</Text>
              </View>
            </View>
            <Car size={16} color="#2563eb" />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-gray-500 rounded-full mr-3" />
              <View>
                <Text className="text-gray-900 font-medium">Sarah Smith checked out</Text>
                <Text className="text-xs text-gray-500">Unit B-105 • 32 minutes ago</Text>
              </View>
            </View>
            <UserX size={16} color="#6b7280" />
          </View>

          <TouchableOpacity 
            onPress={() => router.push('/security/activity')}
            className="pt-2 border-t border-gray-100"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-indigo-600 font-medium mr-1">View All Activity</Text>
              <ArrowRight size={14} color="#6366f1" />
            </View>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Permission Status */}
      <Card className="p-4 mb-6 bg-white">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Permission Status
        </Text>
        <View className="space-y-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Permission Level</Text>
            <Text className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-md capitalize">
              {permissionLevel}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Active Permissions</Text>
            <Text className="text-gray-900 font-medium">
              {activePermissions.length} of {Object.keys(permissions).length}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Visitor Management</Text>
            <Text className={`text-xs px-2 py-1 rounded-md ${canManageVisitors ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {canManageVisitors ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Emergency Response</Text>
            <Text className={`text-xs px-2 py-1 rounded-md ${canHandleEmergencies ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {canHandleEmergencies ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Vehicle Management</Text>
            <Text className={`text-xs px-2 py-1 rounded-md ${canManageVehicles ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {canManageVehicles ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Phase 2 Notice */}
      <Card className="p-4 bg-green-50 border border-green-200">
        <View className="flex-row items-start">
          <View className="bg-green-100 p-2 rounded-full mr-3">
            <Shield size={16} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text className="text-green-900 font-medium mb-1">
              Phase 2 Implementation Active
            </Text>
            <Text className="text-green-700 text-sm">
              Enhanced security dashboard with real-time metrics, visitor management interfaces, 
              and quick action navigation is now available. Additional features coming soon.
            </Text>
          </View>
        </View>
      </Card>

      {/* Debug Information (Development Only) */}
      {__DEV__ && (
        <Card className="p-4 mt-4 bg-gray-100">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Debug Information
          </Text>
          <Text className="text-xs text-gray-600 mb-1">
            User Role: {user?.role}
          </Text>
          <Text className="text-xs text-gray-600 mb-1">
            Society: {user?.societyCode}
          </Text>
          <Text className="text-xs text-gray-600">
            Authenticated: {user ? 'Yes' : 'No'}
          </Text>
        </Card>
      )}
      </ScrollView>
    </View>
  );
};

SecurityDashboard.displayName = 'SecurityDashboard';

export default SecurityDashboard;