import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Send,
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  CreditCard,
  Calendar,
} from 'lucide-react-native';
import { useAdminMigration } from '@/hooks/useAdminMigration';
import { useSocietyMigration } from '@/hooks/useSocietyMigration';
import {
  StatWidget,
  QuickActionWidget,
  ProgressWidget,
} from './DashboardWidgets';
import { useAlert } from '@/components/ui/AlertCard';

interface BillingStats {
  totalGenerated: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  overdueAmount: number;
  thisMonthGenerated: number;
  lastMonthCollection: number;
  averagePaymentTime: number;
}

interface BillingSummary {
  societyId: string;
  societyName: string;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  overdueCount: number;
  totalAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  collectionRate: number;
  lastUpdated: string;
}

interface BulkBillingAction {
  id: string;
  type: 'maintenance' | 'utility' | 'special';
  title: string;
  description: string;
  societies: string[];
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';
  scheduledDate?: string;
  completedDate?: string;
  totalAmount: number;
  billCount: number;
}

const FinancialManager: React.FC = () => {
  const { checkPermission, activeSociety, availableSocieties } = useAdminMigration();
  const { getSocietyStats, bulkOperation } = useSocietyMigration();
  const { showAlert, AlertComponent } = useAlert();

  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [societySummaries, setSocietySummaries] = useState<BillingSummary[]>(
    [],
  );
  const [bulkActions, setBulkActions] = useState<BulkBillingAction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'quarter'
  >('month');

  useEffect(() => {
    loadFinancialData();
  }, [activeSociety]);

  const loadFinancialData = async () => {
    try {
      // Load billing stats for current society
      if (activeSociety) {
        const stats = await loadBillingStats(activeSociety.id);
        setBillingStats(stats);
      }

      // Load summaries for all accessible societies
      const summaries = await loadSocietySummaries();
      setSocietySummaries(summaries);

      // Load recent bulk actions
      const actions = await loadBulkActions();
      setBulkActions(actions);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  };

  const loadBillingStats = async (societyId: string): Promise<BillingStats> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalGenerated: 2500000,
          totalCollected: 2100000,
          totalPending: 400000,
          collectionRate: 84,
          overdueAmount: 150000,
          thisMonthGenerated: 450000,
          lastMonthCollection: 380000,
          averagePaymentTime: 12,
        });
      }, 300);
    });
  };

  const loadSocietySummaries = async (): Promise<BillingSummary[]> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const summaries = availableSocieties.map((society) => ({
          societyId: society.id,
          societyName: society.name,
          totalBills: Math.floor(Math.random() * 200) + 50,
          paidBills: Math.floor(Math.random() * 150) + 30,
          pendingBills: Math.floor(Math.random() * 50) + 10,
          overdueCount: Math.floor(Math.random() * 20),
          totalAmount: Math.floor(Math.random() * 1000000) + 500000,
          collectedAmount: Math.floor(Math.random() * 800000) + 400000,
          pendingAmount: Math.floor(Math.random() * 200000) + 100000,
          collectionRate: Math.floor(Math.random() * 30) + 70,
          lastUpdated: new Date().toISOString(),
        }));
        resolve(summaries);
      }, 400);
    });
  };

  const loadBulkActions = async (): Promise<BulkBillingAction[]> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'maintenance',
            title: 'Monthly Maintenance Bills',
            description: 'Generate maintenance bills for all societies',
            societies: availableSocieties.map((s) => s.id),
            status: 'completed',
            completedDate: new Date(Date.now() - 86400000).toISOString(),
            totalAmount: 1200000,
            billCount: 450,
          },
          {
            id: '2',
            type: 'utility',
            title: 'Utility Bill Processing',
            description: 'Process electricity and water bills',
            societies: [availableSocieties[0]?.id].filter(Boolean),
            status: 'processing',
            scheduledDate: new Date().toISOString(),
            totalAmount: 350000,
            billCount: 120,
          },
        ]);
      }, 200);
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFinancialData();
    setIsRefreshing(false);
  };

  const handleBulkBillGeneration = async () => {
    if (!checkPermission('billing', 'bulk_action')) {
      showAlert({
        type: 'error',
        title: 'Permission Denied',
        message:
          'You do not have permission to perform bulk billing operations',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
      return;
    }

    try {
      const result = await bulkOperation('generate_bills', {
        type: 'maintenance',
        amount: 2500,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      showAlert({
        type: 'success',
        title: 'Bulk Bills Generated',
        message: `Successfully generated bills for ${result.societies.length} societies`,
        primaryAction: { label: 'OK', onPress: () => {} },
      });

      await loadFinancialData();
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Generation Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate bulk bills',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    }
  };

  const handlePaymentReconciliation = async () => {
    if (!checkPermission('billing', 'update')) {
      showAlert({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to reconcile payments',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
      return;
    }

    try {
      const result = await bulkOperation('reconcile_payments', {
        societyId: activeSociety?.id,
        timeframe: selectedTimeframe,
      });

      showAlert({
        type: 'success',
        title: 'Reconciliation Complete',
        message: `Reconciled payments for ${result.results.length} transactions`,
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Reconciliation Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to reconcile payments',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'scheduled':
        return 'text-orange-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'processing':
        return Clock;
      case 'scheduled':
        return Calendar;
      case 'failed':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  if (!checkPermission('billing', 'read')) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <AlertCircle size={48} className="text-text-secondary mb-4" />
        <Text className="text-headline-medium font-semibold text-text-primary text-center mb-2">
          Access Restricted
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          You do not have permission to view financial management features.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }>
      {/* Header */}
      <View className="p-6 bg-surface border-b border-divider">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-display-small font-bold text-text-primary">
              Financial Management
            </Text>
            <Text className="text-body-medium text-text-secondary">
              Billing & Payment Control Center
            </Text>
          </View>
          <DollarSign size={24} className="text-primary" />
        </View>

        {/* Timeframe Selector */}
        <View className="flex-row bg-background rounded-xl p-1 border border-divider">
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedTimeframe(period)}
              className={`flex-1 py-2 rounded-lg ${
                selectedTimeframe === period ? 'bg-primary' : 'bg-transparent'
              }`}>
              <Text
                className={`text-center font-medium capitalize ${
                  selectedTimeframe === period
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Current Society Stats */}
      {billingStats && (
        <View className="p-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            {activeSociety?.name} - Financial Overview
          </Text>

          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Collection Rate"
                value={formatPercentage(billingStats.collectionRate)}
                icon={TrendingUp}
                trend={{ value: 5, direction: 'up' }}
                color="#4CAF50"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Pending Amount"
                value={formatCurrency(billingStats.totalPending)}
                icon={Clock}
                color="#FF9800"
                urgent={billingStats.totalPending > 300000}
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="This Month"
                value={formatCurrency(billingStats.thisMonthGenerated)}
                icon={BarChart3}
                trend={{ value: 8, direction: 'up' }}
                color="#2196F3"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Overdue Amount"
                value={formatCurrency(billingStats.overdueAmount)}
                icon={AlertCircle}
                color="#F44336"
                urgent={billingStats.overdueAmount > 100000}
              />
            </View>
          </View>

          {/* Collection Progress */}
          <View className="mt-4">
            <ProgressWidget
              title="Monthly Collection Progress"
              current={billingStats.totalCollected}
              target={billingStats.totalGenerated}
              subtitle={`₹${(billingStats.totalCollected / 100000).toFixed(1)}L collected of ₹${(billingStats.totalGenerated / 100000).toFixed(1)}L target`}
              color="#4CAF50"
            />
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View className="px-6 pb-6">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Financial Actions
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {checkPermission('billing', 'bulk_action') && (
            <View className="w-1/2 px-2 mb-4">
              <QuickActionWidget
                title="Bulk Bill Generation"
                icon={Send}
                color="#4CAF50"
                onPress={handleBulkBillGeneration}
              />
            </View>
          )}

          {checkPermission('billing', 'update') && (
            <View className="w-1/2 px-2 mb-4">
              <QuickActionWidget
                title="Payment Reconciliation"
                icon={CreditCard}
                color="#2196F3"
                onPress={handlePaymentReconciliation}
              />
            </View>
          )}

          {checkPermission('billing', 'export') && (
            <View className="w-1/2 px-2 mb-4">
              <QuickActionWidget
                title="Generate Reports"
                icon={FileText}
                color="#FF9800"
                onPress={() => console.log('Generate reports')}
              />
            </View>
          )}

          <View className="w-1/2 px-2 mb-4">
            <QuickActionWidget
              title="GST Compliance"
              icon={Calculator}
              color="#9C27B0"
              onPress={() => console.log('GST compliance')}
            />
          </View>
        </View>
      </View>

      {/* Multi-Society Summary */}
      {availableSocieties.length > 1 && (
        <View className="px-6 pb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            All Societies Summary
          </Text>

          <View className="space-y-3">
            {societySummaries.map((summary) => (
              <View
                key={summary.societyId}
                className="bg-surface rounded-xl p-4 border border-divider">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-body-large font-semibold text-text-primary">
                    {summary.societyName}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      summary.collectionRate >= 80
                        ? 'bg-green-100'
                        : summary.collectionRate >= 60
                          ? 'bg-orange-100'
                          : 'bg-red-100'
                    }`}>
                    <Text
                      className={`text-label-small font-medium ${
                        summary.collectionRate >= 80
                          ? 'text-green-600'
                          : summary.collectionRate >= 60
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}>
                      {formatPercentage(summary.collectionRate)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-label-medium text-text-secondary">
                      Total Bills
                    </Text>
                    <Text className="text-body-medium font-semibold text-text-primary">
                      {summary.totalBills}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-medium text-text-secondary">
                      Pending
                    </Text>
                    <Text className="text-body-medium font-semibold text-orange-600">
                      {summary.pendingBills}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-medium text-text-secondary">
                      Amount
                    </Text>
                    <Text className="text-body-medium font-semibold text-green-600">
                      {formatCurrency(summary.collectedAmount)}
                    </Text>
                  </View>
                </View>

                {summary.overdueCount > 0 && (
                  <View className="mt-2 pt-2 border-t border-divider/50">
                    <Text className="text-label-medium text-red-600">
                      {summary.overdueCount} overdue bills requiring attention
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Bulk Actions */}
      {bulkActions.length > 0 && (
        <View className="px-6 pb-8">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Recent Bulk Operations
          </Text>

          <View className="space-y-3">
            {bulkActions.map((action) => {
              const StatusIcon = getStatusIcon(action.status);

              return (
                <View
                  key={action.id}
                  className="bg-surface rounded-xl p-4 border border-divider">
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-3">
                      <Text className="text-body-large font-semibold text-text-primary mb-1">
                        {action.title}
                      </Text>
                      <Text className="text-body-medium text-text-secondary mb-2">
                        {action.description}
                      </Text>

                      <View className="flex-row items-center">
                        <StatusIcon
                          size={16}
                          className={getStatusColor(action.status)}
                        />
                        <Text
                          className={`text-label-medium font-medium ml-2 ${getStatusColor(action.status)}`}>
                          {action.status.charAt(0).toUpperCase() +
                            action.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-body-medium font-semibold text-text-primary">
                        {formatCurrency(action.totalAmount)}
                      </Text>
                      <Text className="text-label-medium text-text-secondary">
                        {action.billCount} bills
                      </Text>
                    </View>
                  </View>

                  <Text className="text-label-medium text-text-secondary">
                    Societies: {action.societies.length} •
                    {action.completedDate
                      ? ` Completed ${new Date(action.completedDate).toLocaleDateString()}`
                      : action.scheduledDate
                        ? ` Scheduled for ${new Date(action.scheduledDate).toLocaleDateString()}`
                        : ' In Progress'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Custom Alert Component */}
      {AlertComponent}
    </ScrollView>
  );
};

export default FinancialManager;
