import React from 'react';
import { View, Text } from 'react-native';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { AdminAnalytics } from '@/stores/slices/adminStore';
import { Card } from '@/components/ui/Card';

interface DashboardMetricsProps {
  analytics: AdminAnalytics | null;
  loading?: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: string;
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
  bgColor,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} color="#059669" />;
      case 'down':
        return <TrendingDown size={12} color="#dc2626" />;
      default:
        return <Minus size={12} color="#6b7280" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-4 flex-1 min-w-[160px]">
      <View className="flex-row items-center justify-between mb-3">
        <View className={`p-2 rounded-lg ${bgColor}`}>
          {icon}
        </View>
        {trend && trendValue && (
          <View className="flex-row items-center">
            {getTrendIcon()}
            <Text className={`text-xs font-medium ml-1 ${getTrendColor()}`}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      
      <Text className="text-sm font-medium text-gray-900 mb-1">
        {title}
      </Text>
      
      {subtitle && (
        <Text className="text-xs text-gray-600">
          {subtitle}
        </Text>
      )}
    </Card>
  );
};

/**
 * DashboardMetrics - Displays key admin metrics and analytics
 * 
 * Features:
 * - Real-time data from AdminStore
 * - Trend indicators
 * - Responsive grid layout
 * - Loading states
 */
export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  analytics,
  loading = false,
}) => {
  if (loading) {
    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Dashboard Overview
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="p-4 flex-1 min-w-[160px]">
              <View className="animate-pulse">
                <View className="w-8 h-8 bg-gray-200 rounded-lg mb-3" />
                <View className="w-16 h-6 bg-gray-200 rounded mb-2" />
                <View className="w-20 h-4 bg-gray-200 rounded mb-1" />
                <View className="w-24 h-3 bg-gray-200 rounded" />
              </View>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Dashboard Overview
        </Text>
        <Card className="p-6 items-center">
          <AlertTriangle size={32} color="#6b7280" />
          <Text className="text-gray-600 mt-2 text-center">
            Analytics data unavailable
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            Please check your connection and try again
          </Text>
        </Card>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const metrics = [
    {
      title: 'Total Societies',
      value: analytics.overview.totalSocieties,
      subtitle: `${analytics.societies.activeSocieties} active`,
      icon: <Building2 size={20} color="#059669" />,
      trend: analytics.overview.growthRate > 0 ? 'up' : 'neutral' as const,
      trendValue: formatPercentage(analytics.overview.growthRate),
      color: '#059669',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Users',
      value: analytics.overview.totalUsers,
      subtitle: `${analytics.users.newUsersThisMonth} new this month`,
      icon: <Users size={20} color="#0284c7" />,
      trend: analytics.users.userRetentionRate > 0.8 ? 'up' : 'neutral' as const,
      trendValue: formatPercentage(analytics.users.userRetentionRate),
      color: '#0284c7',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(analytics.revenue.monthlyRevenue),
      subtitle: `${formatPercentage(analytics.revenue.revenueGrowth)} growth`,
      icon: <DollarSign size={20} color="#7c3aed" />,
      trend: analytics.revenue.revenueGrowth > 0 ? 'up' : analytics.revenue.revenueGrowth < 0 ? 'down' : 'neutral' as const,
      trendValue: formatPercentage(Math.abs(analytics.revenue.revenueGrowth)),
      color: '#7c3aed',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Approvals',
      value: analytics.societies.pendingApprovals,
      subtitle: 'Societies awaiting review',
      icon: <Clock size={20} color="#ea580c" />,
      color: '#ea580c',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Dashboard Overview
      </Text>
      
      {/* Main Metrics */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            trend={metric.trend}
            trendValue={metric.trendValue}
            color={metric.color}
            bgColor={metric.bgColor}
          />
        ))}
      </View>

      {/* Support Overview */}
      <Card className="p-4">
        <Text className="text-base font-semibold text-gray-900 mb-3">
          Support & Operations
        </Text>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <Clock size={16} color="#ea580c" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                {analytics.support.openTickets}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 text-center">
              Open Tickets
            </Text>
          </View>

          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <CheckCircle size={16} color="#059669" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                {analytics.support.resolvedTicketsThisMonth}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 text-center">
              Resolved This Month
            </Text>
          </View>

          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <TrendingUp size={16} color="#7c3aed" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                {analytics.support.customerSatisfactionScore.toFixed(1)}
              </Text>
            </View>
            <Text className="text-xs text-gray-600 text-center">
              Satisfaction Score
            </Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-gray-200">
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-600">
              Avg. Resolution Time
            </Text>
            <Text className="text-xs font-medium text-gray-900">
              {analytics.support.averageResolutionTime.toFixed(1)} hours
            </Text>
          </View>
          
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-gray-600">
              Churn Rate
            </Text>
            <Text className="text-xs font-medium text-gray-900">
              {formatPercentage(analytics.overview.churnRate)}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
};