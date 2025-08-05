import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Clock,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { Society, AdminRole } from '@/types/admin';
import SocietySelector from './SocietySelector';
import { StatWidget, QuickActionWidget, AlertWidget } from './DashboardWidgets';

interface MultiSocietyStats {
  societyId: string;
  societyName: string;
  totalResidents: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  activeMaintenance: number;
  pendingVisitors: number;
  lastActivity: string;
}

interface CrossSocietyAlert {
  id: string;
  type: 'billing' | 'maintenance' | 'security' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedSocieties: string[];
  createdAt: string;
  actionRequired: boolean;
}

const MultiSocietyDashboard: React.FC = () => {
  const {
    adminUser,
    activeSociety,
    availableSocieties,
    currentMode,
    checkPermission,
  } = useDirectAdmin();

  const [societyStats, setSocietyStats] = useState<MultiSocietyStats[]>([]);
  const [crossSocietyAlerts, setCrossSocietyAlerts] = useState<
    CrossSocietyAlert[]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'all'>('current');

  useEffect(() => {
    loadDashboardData();
  }, [activeSociety, availableSocieties]);

  const loadDashboardData = async () => {
    try {
      // Load stats for all accessible societies
      const stats = await Promise.all(
        availableSocieties.map((society) => loadSocietyStats(society.id)),
      );
      setSocietyStats(stats);

      // Load cross-society alerts if user has access to multiple societies
      if (availableSocieties.length > 1) {
        const alerts = await loadCrossSocietyAlerts();
        setCrossSocietyAlerts(alerts);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadSocietyStats = async (
    societyId: string,
  ): Promise<MultiSocietyStats> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const society = availableSocieties.find((s) => s.id === societyId);
        resolve({
          societyId,
          societyName: society?.name || 'Unknown Society',
          totalResidents: Math.floor(Math.random() * 200) + 50,
          pendingApprovals: Math.floor(Math.random() * 10),
          monthlyRevenue: Math.floor(Math.random() * 500000) + 100000,
          activeMaintenance: Math.floor(Math.random() * 5),
          pendingVisitors: Math.floor(Math.random() * 15),
          lastActivity: new Date(
            Date.now() - Math.random() * 86400000,
          ).toISOString(),
        });
      }, 200);
    });
  };

  const loadCrossSocietyAlerts = async (): Promise<CrossSocietyAlert[]> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'billing',
            severity: 'high',
            title: 'Payment Gateway Issue',
            message:
              'Multiple societies experiencing payment processing delays',
            affectedSocieties: ['society_1', 'society_2'],
            createdAt: new Date().toISOString(),
            actionRequired: true,
          },
          {
            id: '2',
            type: 'system',
            severity: 'medium',
            title: 'System Maintenance Scheduled',
            message:
              'Scheduled maintenance will affect all societies on weekend',
            affectedSocieties: availableSocieties.map((s) => s.id),
            createdAt: new Date().toISOString(),
            actionRequired: false,
          },
        ]);
      }, 300);
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const getQuickActions = () => {
    const actions = [];

    if (checkPermission('billing', 'create')) {
      actions.push({
        id: 'bulk_billing',
        title: 'Bulk Billing',
        icon: DollarSign,
        color: '#4CAF50',
        onPress: () => console.log('Navigate to bulk billing'),
      });
    }

    if (checkPermission('visitors', 'bulk_actions')) {
      actions.push({
        id: 'visitor_management',
        title: 'Visitor Oversight',
        icon: Shield,
        color: '#FF9800',
        onPress: () => console.log('Navigate to visitor oversight'),
      });
    }

    if (checkPermission('analytics', 'read')) {
      actions.push({
        id: 'cross_society_analytics',
        title: 'Analytics',
        icon: BarChart3,
        color: '#2196F3',
        onPress: () => console.log('Navigate to analytics'),
      });
    }

    if (adminUser?.role === 'super_admin') {
      actions.push({
        id: 'platform_settings',
        title: 'Platform Settings',
        icon: Settings,
        color: '#9C27B0',
        onPress: () => console.log('Navigate to platform settings'),
      });
    }

    return actions;
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (currentMode !== 'admin') {
    return null;
  }

  const currentSocietyStats = societyStats.find(
    (s) => s.societyId === activeSociety?.id,
  );
  const totalStats = societyStats.reduce(
    (acc, curr) => ({
      totalResidents: acc.totalResidents + curr.totalResidents,
      pendingApprovals: acc.pendingApprovals + curr.pendingApprovals,
      monthlyRevenue: acc.monthlyRevenue + curr.monthlyRevenue,
      activeMaintenance: acc.activeMaintenance + curr.activeMaintenance,
      pendingVisitors: acc.pendingVisitors + curr.pendingVisitors,
    }),
    {
      totalResidents: 0,
      pendingApprovals: 0,
      monthlyRevenue: 0,
      activeMaintenance: 0,
      pendingVisitors: 0,
    },
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }>
      {/* Header with Society Selector */}
      <View className="p-6 bg-surface border-b border-divider">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-display-small font-bold text-text-primary">
              Multi-Society Dashboard
            </Text>
            <Text className="text-body-medium text-text-secondary">
              Managing {availableSocieties.length}{' '}
              {availableSocieties.length === 1 ? 'society' : 'societies'}
            </Text>
          </View>
          <Building2 size={24} className="text-primary" />
        </View>

        <SocietySelector compact={false} showStats={true} />
      </View>

      {/* View Mode Toggle */}
      {availableSocieties.length > 1 && (
        <View className="flex-row mx-6 mt-6 bg-background rounded-xl p-1 border border-divider">
          <TouchableOpacity
            onPress={() => setViewMode('current')}
            className={`flex-1 py-3 rounded-lg ${
              viewMode === 'current' ? 'bg-primary' : 'bg-transparent'
            }`}>
            <Text
              className={`text-center font-medium ${
                viewMode === 'current' ? 'text-white' : 'text-text-secondary'
              }`}>
              Current Society
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('all')}
            className={`flex-1 py-3 rounded-lg ${
              viewMode === 'all' ? 'bg-primary' : 'bg-transparent'
            }`}>
            <Text
              className={`text-center font-medium ${
                viewMode === 'all' ? 'text-white' : 'text-text-secondary'
              }`}>
              All Societies
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Overview */}
      <View className="p-6">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          {viewMode === 'current'
            ? 'Current Society Stats'
            : 'Aggregated Stats'}
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {viewMode === 'current' && currentSocietyStats ? (
            <>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Total Residents"
                  value={currentSocietyStats.totalResidents.toString()}
                  icon={Users}
                  trend={{ value: 5, direction: 'up' }}
                  color="#4CAF50"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Pending Approvals"
                  value={currentSocietyStats.pendingApprovals.toString()}
                  icon={Clock}
                  color="#FF9800"
                  urgent={currentSocietyStats.pendingApprovals > 5}
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Monthly Revenue"
                  value={formatCurrency(currentSocietyStats.monthlyRevenue)}
                  icon={DollarSign}
                  trend={{ value: 12, direction: 'up' }}
                  color="#2196F3"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Active Maintenance"
                  value={currentSocietyStats.activeMaintenance.toString()}
                  icon={Settings}
                  color="#9C27B0"
                />
              </View>
            </>
          ) : (
            <>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Total Residents"
                  value={totalStats.totalResidents.toString()}
                  icon={Users}
                  subtitle={`Across ${availableSocieties.length} societies`}
                  color="#4CAF50"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Pending Approvals"
                  value={totalStats.pendingApprovals.toString()}
                  icon={Clock}
                  subtitle="Requires attention"
                  color="#FF9800"
                  urgent={totalStats.pendingApprovals > 10}
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Total Revenue"
                  value={formatCurrency(totalStats.monthlyRevenue)}
                  icon={DollarSign}
                  subtitle="This month"
                  color="#2196F3"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <StatWidget
                  title="Maintenance Tasks"
                  value={totalStats.activeMaintenance.toString()}
                  icon={Settings}
                  subtitle="All societies"
                  color="#9C27B0"
                />
              </View>
            </>
          )}
        </View>
      </View>

      {/* Cross-Society Alerts */}
      {crossSocietyAlerts.length > 0 && (
        <View className="px-6 pb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Platform Alerts
          </Text>

          <View className="space-y-3">
            {crossSocietyAlerts.map((alert) => (
              <AlertWidget
                key={alert.id}
                title={alert.title}
                message={alert.message}
                severity={alert.severity}
                actionRequired={alert.actionRequired}
                timestamp={alert.createdAt}
                onAction={() => console.log('Handle alert:', alert.id)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Society-Specific Overview */}
      {viewMode === 'all' && societyStats.length > 1 && (
        <View className="px-6 pb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Society Overview
          </Text>

          <View className="space-y-3">
            {societyStats.map((stats) => (
              <View
                key={stats.societyId}
                className="bg-surface rounded-xl p-4 border border-divider">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-body-large font-semibold text-text-primary">
                    {stats.societyName}
                  </Text>
                  <Text className="text-label-medium text-text-secondary">
                    {formatTimeAgo(stats.lastActivity)}
                  </Text>
                </View>

                <View className="flex-row flex-wrap">
                  <View className="w-1/3 pr-2">
                    <Text className="text-label-large text-text-secondary">
                      Residents
                    </Text>
                    <Text className="text-body-large font-semibold text-text-primary">
                      {stats.totalResidents}
                    </Text>
                  </View>
                  <View className="w-1/3 px-1">
                    <Text className="text-label-large text-text-secondary">
                      Pending
                    </Text>
                    <Text className="text-body-large font-semibold text-orange-600">
                      {stats.pendingApprovals}
                    </Text>
                  </View>
                  <View className="w-1/3 pl-2">
                    <Text className="text-label-large text-text-secondary">
                      Revenue
                    </Text>
                    <Text className="text-body-large font-semibold text-green-600">
                      {formatCurrency(stats.monthlyRevenue)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View className="px-6 pb-8">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Quick Actions
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {getQuickActions().map((action) => (
            <View key={action.id} className="w-1/2 px-2 mb-4">
              <QuickActionWidget
                title={action.title}
                icon={action.icon}
                color={action.color}
                onPress={action.onPress}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default MultiSocietyDashboard;
