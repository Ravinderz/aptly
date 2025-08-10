import { TabHeader } from '@/components/ui/headers';
import {
  ResponsiveContainer,
  ResponsiveText,
} from '@/components/ui/ResponsiveContainer';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Clock,
  Plus,
  Receipt,
  TrendingUp,
  Users,
  Vote,
  Wrench,
} from 'lucide-react-native';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function Services() {
  const router = useRouter();
  const maintenanceTrackingEnabled = useFeatureFlagStore((state) => state.flags.maintenance_tracking);

  // Mock data for recent activities
  const recentRequests = [
    {
      id: '1',
      title: 'Plumbing Issue - Kitchen Sink',
      status: 'in_progress',
      priority: 'high',
      date: '2 hours ago',
      category: 'Plumbing',
    },
    {
      id: '2',
      title: 'Electrical Work - Hall Fan',
      status: 'completed',
      priority: 'medium',
      date: '1 day ago',
      category: 'Electrical',
    },
  ];

  const unpaidBills = [
    {
      id: '1',
      title: 'Maintenance Bill - March 2024',
      amount: '₹5,250',
      dueDate: 'Mar 31, 2024',
      status: 'overdue',
    },
    {
      id: '2',
      title: 'Water Bill - March 2024',
      amount: '₹850',
      dueDate: 'Apr 5, 2024',
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in_progress':
        return 'text-warning';
      case 'pending':
        return 'text-primary';
      case 'overdue':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/20 text-error';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" testID="services.screen">
      <TabHeader notificationCount={2} testID="services.header" />
      <ResponsiveContainer type="scroll" padding="lg" gap="lg" testID="services.content">
        {/* Header was moved to TabHeader */}

        {/* Quick Actions */}
        {maintenanceTrackingEnabled && (
          <View className="mb-8" testID="services.quick-actions">
            <ResponsiveText
              variant="headline"
              size="medium"
              className="font-semibold mb-4"
              testID="services.quick-actions.title">
              Quick Actions
            </ResponsiveText>
            <TouchableOpacity
              className="bg-primary rounded-2xl p-5 flex-row items-center justify-center"
              onPress={() =>
                router.push('/(tabs)/services/maintenance/common-area/create')
              }
              testID="services.quick-actions.new-maintenance-button">
              <Plus size={24} color="white" />
              <ResponsiveText className="text-white font-semibold ml-3">
                New Maintenance Request
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Services Grid */}
        <View className="mb-8" testID="services.main-grid">
          <Text className="text-lg font-semibold text-text-primary mb-4" testID="services.main-grid.title">
            Services
          </Text>

          {/* Vendor Directory Card - Full Width */}
          <TouchableOpacity
            className="bg-surface rounded-2xl p-6 border border-divider mb-5"
            onPress={() => router.push('/(tabs)/services/vendors')}
            testID="services.vendor-directory-card">
            <View className="flex-row items-center">
              <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mr-4">
                <Users size={24} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-text-primary mb-1">
                  Vendor Directory
                </Text>
                <Text className="text-text-secondary text-sm mb-3">
                  Find trusted service providers for your home
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="bg-secondary/20 rounded-full px-3 py-1">
                    <Text className="text-secondary text-xs font-medium">
                      72 Vendors
                    </Text>
                  </View>
                  <View className="bg-warning/20 rounded-full px-3 py-1">
                    <Text className="text-warning text-xs font-medium">
                      ★ 4.3 Avg Rating
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View className="flex-row gap-4 mb-4" testID="services.main-grid.row1">
            {/* Maintenance Requests Card */}
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push('/(tabs)/services/maintenance')}
              testID="services.maintenance-card">
              <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mb-5">
                <Wrench size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-semibold text-text-primary mb-2">
                Maintenance
              </Text>
              <Text className="text-text-secondary text-sm mb-4">
                Submit and track repair requests
              </Text>
              <View className="flex-row items-center">
                <View className="bg-warning/20 rounded-full px-3 py-1">
                  <Text className="text-warning text-xs font-medium">
                    2 Active
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Billing Card */}
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push('/(tabs)/services/billing')}
              testID="services.billing-card">
              <View className="bg-success/10 rounded-full w-12 h-12 items-center justify-center mb-5">
                <Receipt size={24} color="#4CAF50" />
              </View>
              <Text className="text-lg font-semibold text-text-primary mb-2">
                Billing
              </Text>
              <Text className="text-text-secondary text-sm mb-4">
                View bills and payment history
              </Text>
              <View className="flex-row items-center">
                <View className="bg-error/20 rounded-full px-3 py-1">
                  <Text className="text-error text-xs font-medium">
                    ₹6,100 Due
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4" testID="services.main-grid.row2">
            {/* Governance Card */}
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push('/(tabs)/services/governance')}
              testID="services.governance-card">
              <View className="bg-indigo-500/10 rounded-full w-12 h-12 items-center justify-center mb-5">
                <Vote size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-semibold text-text-primary mb-2">
                Governance
              </Text>
              <Text className="text-text-secondary text-sm mb-4">
                Vote, policies, and emergency alerts
              </Text>
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full px-3 py-1">
                  <Text className="text-primary text-xs font-medium">
                    1 Active Vote
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Analytics Card */}
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push('/(tabs)/services/analytics')}
              testID="services.analytics-card">
              <View className="bg-purple-500/10 rounded-full w-12 h-12 items-center justify-center mb-5">
                <BarChart3 size={24} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-text-primary mb-2">
                Analytics
              </Text>
              <Text className="text-text-secondary text-sm mb-4">
                Insights, reports, and performance
              </Text>
              <View className="flex-row items-center">
                <View className="bg-purple-500/20 rounded-full px-3 py-1">
                  <Text className="text-purple-700 text-xs font-medium">
                    92% Health
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Maintenance Requests */}
        {recentRequests.length > 0 && (
          <View className="mb-8" testID="services.recent-requests">
            <View className="flex-row items-center justify-between mb-4" testID="services.recent-requests.header">
              <Text className="text-lg font-semibold text-text-primary" testID="services.recent-requests.title">
                Recent Requests
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/services/maintenance')}
                testID="services.recent-requests.view-all-button">
                <Text className="text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-3" testID="services.recent-requests.list">
              {recentRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  className="bg-surface rounded-xl p-5 border border-divider mb-3"
                  onPress={() =>
                    router.push(
                      `/(tabs)/services/maintenance/common-area/${request.id}`,
                    )
                  }
                  testID={`services.recent-requests.item.${request.id}`}>
                  <View className="flex-row items-start justify-between mb-3">
                    <Text className="text-text-primary font-medium flex-1 mr-3">
                      {request.title}
                    </Text>
                    <View
                      className={`rounded-full px-3 py-1 ${getPriorityColor(
                        request.priority,
                      )}`}>
                      <Text className="text-xs font-medium uppercase">
                        {request.priority}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Clock size={14} color="#757575" />
                      <Text className="text-text-secondary text-sm ml-2">
                        {request.date}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-medium capitalize ${getStatusColor(
                        request.status,
                      )}`}>
                      {request.status.replace('_', ' ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Unpaid Bills */}
        {unpaidBills.length > 0 && (
          <View className="mb-8" testID="services.pending-bills">
            <View className="flex-row items-center justify-between mb-4" testID="services.pending-bills.header">
              <Text className="text-lg font-semibold text-text-primary" testID="services.pending-bills.title">
                Pending Bills
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/services/billing')}
                testID="services.pending-bills.view-all-button">
                <Text className="text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-3" testID="services.pending-bills.list">
              {unpaidBills.map((bill) => (
                <TouchableOpacity
                  key={bill.id}
                  className="bg-surface rounded-xl p-5 border border-divider mb-3"
                  onPress={() =>
                    router.push(`/(tabs)/services/billing/${bill.id}`)
                  }
                  testID={`services.pending-bills.item.${bill.id}`}>
                  <View className="flex-row items-start justify-between mb-3">
                    <Text className="text-text-primary font-medium flex-1 mr-3">
                      {bill.title}
                    </Text>
                    <Text className="text-text-primary font-bold">
                      {bill.amount}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text-secondary text-sm">
                      Due: {bill.dueDate}
                    </Text>
                    <View
                      className={`rounded-full px-3 py-1 ${
                        bill.status === 'overdue'
                          ? 'bg-error/20'
                          : 'bg-warning/20'
                      }`}>
                      <Text
                        className={`text-xs font-medium ${getStatusColor(
                          bill.status,
                        )}`}>
                        {bill.status === 'overdue' ? 'Overdue' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Analytics Overview */}
        <View className="mb-8" testID="services.analytics-overview">
          <Text className="text-lg font-semibold text-text-primary mb-4" testID="services.analytics-overview.title">
            This Month
          </Text>
          <View className="bg-surface rounded-2xl p-6 border border-divider" testID="services.analytics-overview.card">
            <View className="flex-row items-center mb-5" testID="services.analytics-overview.header">
              <TrendingUp size={20} color="#4CAF50" />
              <Text className="text-text-primary font-medium ml-3">
                Activity Summary
              </Text>
            </View>
            <View className="flex-row justify-between" testID="services.analytics-overview.stats">
              <View className="items-center" testID="services.analytics-overview.requests-stat">
                <Text className="text-2xl font-bold text-text-primary mb-1">
                  3
                </Text>
                <Text className="text-text-secondary text-sm">Requests</Text>
              </View>
              <View className="items-center" testID="services.analytics-overview.completed-stat">
                <Text className="text-2xl font-bold text-success mb-1">2</Text>
                <Text className="text-text-secondary text-sm">Completed</Text>
              </View>
              <View className="items-center" testID="services.analytics-overview.bills-paid-stat">
                <Text className="text-2xl font-bold text-text-primary mb-1">
                  ₹12,450
                </Text>
                <Text className="text-text-secondary text-sm">Bills Paid</Text>
              </View>
            </View>
          </View>
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}
