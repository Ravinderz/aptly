import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  BarChart3,
  PieChart,
  Download,
  Share
} from 'lucide-react-native';

// Mock analytics data
const analyticsData = {
  currentMonth: {
    totalPaid: 7997,
    totalDue: 9499,
    onTimePayments: 2,
    latePayments: 0,
    averageAmount: 3998,
    paymentMethods: {
      upi: 45,
      card: 30,
      netbanking: 20,
      cash: 5
    }
  },
  yearlyTrend: [
    { month: 'Jan', paid: 6195, pending: 0 },
    { month: 'Feb', paid: 6997, pending: 0 },
    { month: 'Mar', paid: 0, pending: 7080 },
    { month: 'Apr', paid: 0, pending: 9499 },
  ],
  categoryBreakdown: [
    { category: 'Maintenance', amount: 21000, percentage: 55, color: '#6366f1' },
    { category: 'Water', amount: 3400, percentage: 18, color: '#3B82F6' },
    { category: 'Security', amount: 8000, percentage: 21, color: '#10B981' },
    { category: 'Common Area', amount: 3304, percentage: 6, color: '#F59E0B' },
  ],
  paymentHistory: [
    {
      id: '1',
      date: '2024-03-02',
      description: 'Water Bill - February 2024',
      amount: 802,
      method: 'UPI',
      status: 'success',
      transactionId: 'TXN123456789'
    },
    {
      id: '2',
      date: '2024-02-25',
      description: 'Maintenance Bill - February 2024',
      amount: 6195,
      method: 'Net Banking',
      status: 'success',
      transactionId: 'TXN123456788'
    },
    {
      id: '3',
      date: '2024-01-28',
      description: 'Water Bill - January 2024',
      amount: 755,
      method: 'UPI',
      status: 'success',
      transactionId: 'TXN123456787'
    },
    {
      id: '4',
      date: '2024-01-25',
      description: 'Maintenance Bill - January 2024',
      amount: 6195,
      method: 'Credit Card',
      status: 'success',
      transactionId: 'TXN123456786'
    }
  ]
};

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, color = 'bg-primary/10' }) => (
  <View className={`${color} rounded-xl p-4 border border-divider`}>
    <View className="flex-row items-center justify-between mb-2">
      <View className="bg-white/20 rounded-full w-10 h-10 items-center justify-center">
        {icon}
      </View>
      {change && (
        <View className={`flex-row items-center ${changeType === 'increase' ? 'text-secondary' : 'text-error'}`}>
          {changeType === 'increase' ? (
            <TrendingUp size={14} color="#4CAF50" />
          ) : (
            <TrendingDown size={14} color="#D32F2F" />
          )}
          <Text className={`text-xs ml-1 ${changeType === 'increase' ? 'text-secondary' : 'text-error'}`}>
            {change}
          </Text>
        </View>
      )}
    </View>
    <Text className="text-2xl font-bold text-text-primary mb-1">{value}</Text>
    <Text className="text-text-secondary text-sm">{title}</Text>
  </View>
);

interface CategoryBarProps {
  category: any;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ category }) => (
  <View className="mb-4">
    <View className="flex-row items-center justify-between mb-2">
      <Text className="text-body-large font-medium text-text-primary">{category.category}</Text>
      <Text className="text-body-large font-semibold text-text-primary">
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(category.amount)}
      </Text>
    </View>
    <View className="h-2 bg-divider rounded-full overflow-hidden">
      <View 
        className="h-full rounded-full"
        style={{ 
          width: `${category.percentage}%`,
          backgroundColor: category.color
        }}
      />
    </View>
    <Text className="text-text-secondary text-sm mt-1">{category.percentage}% of total spending</Text>
  </View>
);

export default function BillingAnalytics() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi': return '📱';
      case 'credit card': return '💳';
      case 'net banking': return '🏦';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-headline-large font-semibold text-text-primary">
            Payment Analytics
          </Text>
          <Text className="text-body-medium text-text-secondary">
            Financial insights & history
          </Text>
        </View>
        <TouchableOpacity className="mr-2">
          <Share size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Download size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-6 py-6 space-y-6">
          {/* Period Selector */}
          <View className="flex-row bg-surface rounded-xl p-1 border border-divider">
            {['monthly', 'quarterly', 'yearly'].map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className={`flex-1 py-3 rounded-lg ${
                  selectedPeriod === period ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text className={`text-center font-medium capitalize ${
                  selectedPeriod === period ? 'text-white' : 'text-text-secondary'
                }`}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Key Metrics */}
          <View>
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Key Metrics
            </Text>
            <View className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Paid This Month"
                value={formatCurrency(analyticsData.currentMonth.totalPaid)}
                change="+5.2%"
                changeType="increase"
                icon={<DollarSign size={20} color="#6366f1" />}
                color="bg-secondary/10"
              />
              <StatCard
                title="Amount Due"
                value={formatCurrency(analyticsData.currentMonth.totalDue)}
                change="+12%"
                changeType="decrease"
                icon={<AlertCircle size={20} color="#D32F2F" />}
                color="bg-error/10"
              />
            </View>
          </View>

          <View className="grid grid-cols-2 gap-4">
            <StatCard
              title="On-time Payments"
              value={`${analyticsData.currentMonth.onTimePayments}/3`}
              change="100%"
              changeType="increase"
              icon={<Calendar size={20} color="#4CAF50" />}
              color="bg-success/10"
            />
            <StatCard
              title="Average Bill Amount"
              value={formatCurrency(analyticsData.currentMonth.averageAmount)}
              change="-2.1%"
              changeType="increase"
              icon={<BarChart3 size={20} color="#FF9800" />}
              color="bg-warning/10"
            />
          </View>

          {/* Spending by Category */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-headline-medium font-semibold text-text-primary">
                Spending by Category
              </Text>
              <PieChart size={20} color="#6366f1" />
            </View>
            
            {analyticsData.categoryBreakdown.map((category, index) => (
              <CategoryBar key={index} category={category} />
            ))}
          </View>

          {/* Payment Methods Usage */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Payment Methods Usage
            </Text>
            <View className="space-y-3">
              {Object.entries(analyticsData.currentMonth.paymentMethods).map(([method, percentage]) => (
                <View key={method} className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-lg mr-3">{getPaymentMethodIcon(method)}</Text>
                    <Text className="text-body-large text-text-primary capitalize">{method}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-body-large font-semibold text-text-primary">{percentage}%</Text>
                    <View className="w-16 h-1 bg-divider rounded-full mt-1">
                      <View 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Monthly Trend */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Monthly Payment Trend
            </Text>
            <View className="space-y-4">
              {analyticsData.yearlyTrend.map((month, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <Text className="text-body-large font-medium text-text-primary w-12">
                    {month.month}
                  </Text>
                  <View className="flex-1 mx-4">
                    <View className="flex-row items-center h-8">
                      {month.paid > 0 && (
                        <View 
                          className="h-full bg-secondary rounded-l"
                          style={{ width: `${(month.paid / 10000) * 100}%` }}
                        />
                      )}
                      {month.pending > 0 && (
                        <View 
                          className="h-full bg-error rounded-r"
                          style={{ width: `${(month.pending / 10000) * 100}%` }}
                        />
                      )}
                    </View>
                  </View>
                  <Text className="text-body-medium text-text-secondary w-16 text-right">
                    {formatCurrency(month.paid + month.pending)}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Legend */}
            <View className="flex-row items-center justify-center mt-4 pt-4 border-t border-divider">
              <View className="flex-row items-center mr-6">
                <View className="w-3 h-3 bg-secondary rounded mr-2" />
                <Text className="text-text-secondary text-sm">Paid</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-error rounded mr-2" />
                <Text className="text-text-secondary text-sm">Pending</Text>
              </View>
            </View>
          </View>

          {/* Recent Payment History */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Recent Payment History
            </Text>
            <View className="space-y-4">
              {analyticsData.paymentHistory.map((payment) => (
                <View key={payment.id} className="flex-row items-center justify-between py-3 border-b border-divider last:border-b-0">
                  <View className="flex-1">
                    <Text className="text-body-large font-medium text-text-primary mb-1">
                      {payment.description}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-text-secondary text-sm mr-3">
                        {formatDate(payment.date)}
                      </Text>
                      <View className="flex-row items-center bg-secondary/10 rounded-full px-2 py-1">
                        <Text className="text-lg mr-1">{getPaymentMethodIcon(payment.method)}</Text>
                        <Text className="text-secondary text-xs font-medium">{payment.method}</Text>
                      </View>
                    </View>
                    <Text className="text-text-secondary text-xs mt-1">
                      ID: {payment.transactionId}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-body-large font-bold text-text-primary">
                      {formatCurrency(payment.amount)}
                    </Text>
                    <View className="bg-success/10 rounded-full px-2 py-1 mt-1">
                      <Text className="text-success text-xs font-medium">Success</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Quick Actions
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 bg-primary rounded-xl py-3 flex-row items-center justify-center">
                <CreditCard size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Setup Auto Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-surface border border-divider rounded-xl py-3 flex-row items-center justify-center">
                <Download size={16} color="#6366f1" />
                <Text className="text-primary font-semibold ml-2">Export Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}