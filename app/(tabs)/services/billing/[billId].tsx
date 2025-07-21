import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  CreditCard,
  Smartphone,
  QrCode,
  Building,
  Receipt,
  Clock,
  Share,
  FileText,
  DollarSign
} from 'lucide-react-native';

// Mock bill data - in production this would come from Supabase
const mockBillDetails = {
  '1': {
    id: '1',
    title: 'Maintenance Bill - March 2024',
    billNumber: 'MB-2024-03-001',
    amount: 5250,
    gstAmount: 945,
    totalAmount: 6195,
    dueDate: '2024-03-31',
    issueDate: '2024-03-01',
    status: 'overdue',
    flatNumber: 'A-201',
    societyName: 'Green Valley Apartments',
    items: [
      { id: '1', description: 'Security Charges', amount: 2000, category: 'security' },
      { id: '2', description: 'Housekeeping', amount: 1500, category: 'cleaning' },
      { id: '3', description: 'Lift Maintenance', amount: 800, category: 'maintenance' },
      { id: '4', description: 'Common Area Electricity', amount: 950, category: 'utilities' }
    ],
    paymentMethods: ['card', 'upi', 'netbanking', 'wallet'],
    lateFee: 186, // 3% late fee
    gracePeriod: 7,
    remindersSent: 3,
    lastReminderDate: '2024-04-05',
    previousBalance: 0,
    notes: 'This bill includes charges for common area maintenance and utilities for March 2024.'
  },
  '2': {
    id: '2',
    title: 'Water Bill - March 2024',
    billNumber: 'WB-2024-03-001',
    amount: 750,
    gstAmount: 135,
    totalAmount: 885,
    dueDate: '2024-04-05',
    issueDate: '2024-03-20',
    status: 'pending',
    flatNumber: 'A-201',
    societyName: 'Green Valley Apartments',
    items: [
      { id: '1', description: 'Water Consumption (450 units)', amount: 600, category: 'utilities' },
      { id: '2', description: 'Water Tank Cleaning', amount: 150, category: 'maintenance' }
    ],
    paymentMethods: ['card', 'upi', 'netbanking'],
    lateFee: 0,
    gracePeriod: 7,
    remindersSent: 1,
    lastReminderDate: '2024-04-01',
    previousBalance: 0,
    waterUsage: {
      currentReading: 1450,
      previousReading: 1000,
      consumption: 450,
      rate: 1.33
    },
    notes: 'Water bill based on actual meter reading. Next reading due on April 20th.'
  }
};

// Payment gateway configurations
const paymentGateways = {
  razorpay: {
    name: 'Razorpay',
    logo: '💳',
    methods: ['card', 'upi', 'netbanking', 'wallet'],
    charges: 1.95 // 1.95% + GST
  },
  justpay: {
    name: 'JustPay',
    logo: '📱',
    methods: ['upi', 'wallet'],
    charges: 0.5 // 0.5% for UPI
  },
  payu: {
    name: 'PayU',
    logo: '🏦',
    methods: ['card', 'netbanking', 'emi'],
    charges: 2.0 // 2% + GST
  }
};

interface PaymentMethodCardProps {
  method: string;
  gateway: string;
  onSelect: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ method, gateway, onSelect }) => {
  const getMethodIcon = () => {
    switch (method) {
      case 'card': return <CreditCard size={20} color="#6366f1" />;
      case 'upi': return <Smartphone size={20} color="#6366f1" />;
      case 'netbanking': return <Building size={20} color="#6366f1" />;
      case 'wallet': return <DollarSign size={20} color="#6366f1" />;
      case 'qr': return <QrCode size={20} color="#6366f1" />;
      case 'emi': return <Calendar size={20} color="#6366f1" />;
      default: return <CreditCard size={20} color="#6366f1" />;
    }
  };

  const getMethodName = () => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      case 'qr': return 'QR Code';
      case 'emi': return 'EMI';
      default: return method;
    }
  };

  const gatewayInfo = paymentGateways[gateway as keyof typeof paymentGateways];

  return (
    <TouchableOpacity
      onPress={onSelect}
      className="bg-surface rounded-xl p-4 border border-divider mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-primary/10 rounded-full w-10 h-10 items-center justify-center mr-3">
            {getMethodIcon()}
          </View>
          <View className="flex-1">
            <Text className="text-headline-medium font-semibold text-text-primary">
              {getMethodName()}
            </Text>
            <Text className="text-body-medium text-text-secondary">
              via {gatewayInfo.name} {gatewayInfo.logo}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-body-medium text-text-secondary">
            {gatewayInfo.charges}% fee
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BillDetail() {
  const router = useRouter();
  const { billId } = useLocalSearchParams<{ billId: string }>();
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{method: string, gateway: string} | null>(null);

  // Get bill details
  const bill = mockBillDetails[billId as keyof typeof mockBillDetails];

  if (!bill) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-headline-large text-text-secondary">Bill not found</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-success';
      case 'pending': return 'text-warning';
      case 'overdue': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/20';
      case 'pending': return 'bg-warning/20';
      case 'overdue': return 'bg-error/20';
      default: return 'bg-text-secondary/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending': return <Calendar size={16} color="#FF9800" />;
      case 'overdue': return <AlertCircle size={16} color="#D32F2F" />;
      default: return <Calendar size={16} color="#757575" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      security: '🔒',
      cleaning: '🧹',
      maintenance: '🔧',
      utilities: '⚡',
      water: '💧'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateTotalWithLateFee = () => {
    return bill.totalAmount + (bill.status === 'overdue' ? bill.lateFee : 0);
  };

  const handlePaymentMethodSelect = (method: string, gateway: string) => {
    setSelectedPaymentMethod({ method, gateway });
    
    Alert.alert(
      'Payment Method Selected',
      `You selected ${method} via ${paymentGateways[gateway as keyof typeof paymentGateways].name}. This would integrate with the actual payment gateway.`,
      [
        { text: 'Cancel' },
        { 
          text: 'Proceed to Pay', 
          onPress: () => handlePayment(method, gateway)
        }
      ]
    );
  };

  const handlePayment = (method: string, gateway: string) => {
    // In production, this would integrate with actual payment gateways
    Alert.alert(
      'Payment Processing',
      `Processing payment of ${formatCurrency(calculateTotalWithLateFee())} via ${method}...`,
      [
        {
          text: 'OK',
          onPress: () => {
            Alert.alert('Payment Successful!', 'Your payment has been processed successfully.');
            router.back();
          }
        }
      ]
    );
  };

  const handleDownloadBill = () => {
    // In production, this would generate and download PDF
    Alert.alert('Download Started', 'Bill PDF download will start shortly.');
  };

  const handleShareBill = () => {
    // In production, this would use React Native Share
    Alert.alert('Share Bill', 'Bill sharing functionality would be integrated here.');
  };

  const handleSetupAutoPayment = () => {
    Alert.alert(
      'Setup Auto Payment',
      'Configure automatic payment for future bills?',
      [
        { text: 'Cancel' },
        { text: 'Setup', onPress: () => Alert.alert('Auto Payment', 'Auto payment setup functionality would be here.') }
      ]
    );
  };

  const daysOverdue = bill.status === 'overdue' ? 
    Math.floor((new Date().getTime() - new Date(bill.dueDate).getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-headline-large font-semibold text-text-primary">
            Bill Details
          </Text>
          <Text className="text-body-medium text-text-secondary">
            {bill.flatNumber} • {bill.billNumber}
          </Text>
        </View>
        <TouchableOpacity onPress={handleShareBill} className="mr-2">
          <Share size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownloadBill}>
          <Download size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 py-6 space-y-6">
          {/* Bill Header Card */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1">
                <Text className="text-display-small font-bold text-text-primary mb-2">
                  {bill.title}
                </Text>
                <Text className="text-body-large text-text-secondary mb-1">
                  {bill.societyName}
                </Text>
                <Text className="text-body-medium text-text-secondary">
                  Issued on {formatDate(bill.issueDate)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-display-small font-bold text-text-primary">
                  {formatCurrency(bill.totalAmount)}
                </Text>
                {bill.status === 'overdue' && (
                  <Text className="text-body-medium text-error font-medium">
                    + {formatCurrency(bill.lateFee)} late fee
                  </Text>
                )}
              </View>
            </View>

            {/* Status Badge */}
            <View className="flex-row items-center justify-between mb-4">
              <View className={`flex-row items-center px-4 py-2 rounded-full ${getStatusBgColor(bill.status)}`}>
                {getStatusIcon(bill.status)}
                <Text className={`font-semibold text-body-large ml-2 capitalize ${getStatusColor(bill.status)}`}>
                  {bill.status}
                </Text>
              </View>
              {bill.status === 'overdue' && (
                <Text className="text-error text-body-medium font-medium">
                  {daysOverdue} days overdue
                </Text>
              )}
            </View>

            {/* Due Date */}
            <View className="bg-background rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Calendar size={16} color="#757575" />
                  <Text className="text-body-large text-text-secondary ml-2">
                    Due Date
                  </Text>
                </View>
                <Text className={`text-body-large font-semibold ${
                  bill.status === 'overdue' ? 'text-error' : 'text-text-primary'
                }`}>
                  {formatDate(bill.dueDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Bill Breakdown */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Bill Breakdown
            </Text>
            <View className="space-y-3">
              {bill.items.map((item) => (
                <View key={item.id} className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-lg mr-3">{getCategoryIcon(item.category)}</Text>
                    <Text className="text-body-large text-text-primary flex-1">
                      {item.description}
                    </Text>
                  </View>
                  <Text className="text-body-large font-semibold text-text-primary">
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))}
              
              <View className="h-px bg-divider my-3" />
              
              <View className="flex-row justify-between">
                <Text className="text-body-large text-text-secondary">Subtotal</Text>
                <Text className="text-body-large text-text-primary">{formatCurrency(bill.amount)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-body-large text-text-secondary">GST (18%)</Text>
                <Text className="text-body-large text-text-primary">{formatCurrency(bill.gstAmount)}</Text>
              </View>
              {bill.status === 'overdue' && (
                <View className="flex-row justify-between">
                  <Text className="text-body-large text-error">Late Fee (3%)</Text>
                  <Text className="text-body-large text-error">{formatCurrency(bill.lateFee)}</Text>
                </View>
              )}
              
              <View className="h-px bg-divider my-3" />
              
              <View className="flex-row justify-between">
                <Text className="text-headline-medium font-bold text-text-primary">Total Amount</Text>
                <Text className="text-headline-medium font-bold text-text-primary">
                  {formatCurrency(calculateTotalWithLateFee())}
                </Text>
              </View>
            </View>
          </View>

          {/* Water Usage Details (if water bill) */}
          {bill.waterUsage && (
            <View className="bg-surface rounded-xl p-6 border border-divider">
              <Text className="text-headline-medium font-semibold text-text-primary mb-4">
                Water Usage Details
              </Text>
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-body-large text-text-secondary">Previous Reading</Text>
                  <Text className="text-body-large text-text-primary">{bill.waterUsage.previousReading} units</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-body-large text-text-secondary">Current Reading</Text>
                  <Text className="text-body-large text-text-primary">{bill.waterUsage.currentReading} units</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-body-large text-text-secondary">Consumption</Text>
                  <Text className="text-body-large font-semibold text-primary">{bill.waterUsage.consumption} units</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-body-large text-text-secondary">Rate per unit</Text>
                  <Text className="text-body-large text-text-primary">₹{bill.waterUsage.rate}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment History & Reminders */}
          <View className="bg-surface rounded-xl p-6 border border-divider">
            <Text className="text-headline-medium font-semibold text-text-primary mb-4">
              Payment Information
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Clock size={16} color="#757575" />
                <Text className="text-body-large text-text-secondary ml-3">
                  Reminders Sent: {bill.remindersSent}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Calendar size={16} color="#757575" />
                <Text className="text-body-large text-text-secondary ml-3">
                  Last Reminder: {formatDate(bill.lastReminderDate)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <AlertCircle size={16} color="#757575" />
                <Text className="text-body-large text-text-secondary ml-3">
                  Grace Period: {bill.gracePeriod} days
                </Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {bill.notes && (
            <View className="bg-surface rounded-xl p-6 border border-divider">
              <Text className="text-headline-medium font-semibold text-text-primary mb-3">
                Notes
              </Text>
              <Text className="text-body-medium text-text-primary leading-6">
                {bill.notes}
              </Text>
            </View>
          )}

          {/* Payment Methods */}
          {bill.status !== 'paid' && showPaymentMethods && (
            <View className="bg-surface rounded-xl p-6 border border-divider">
              <Text className="text-headline-medium font-semibold text-text-primary mb-4">
                Choose Payment Method
              </Text>
              
              {/* Razorpay Methods */}
              {paymentGateways.razorpay.methods.filter(method => bill.paymentMethods.includes(method)).map(method => (
                <PaymentMethodCard
                  key={`razorpay-${method}`}
                  method={method}
                  gateway="razorpay"
                  onSelect={() => handlePaymentMethodSelect(method, 'razorpay')}
                />
              ))}

              {/* JustPay Methods */}
              {paymentGateways.justpay.methods.filter(method => bill.paymentMethods.includes(method)).map(method => (
                <PaymentMethodCard
                  key={`justpay-${method}`}
                  method={method}
                  gateway="justpay"
                  onSelect={() => handlePaymentMethodSelect(method, 'justpay')}
                />
              ))}

              {/* PayU Methods */}
              {paymentGateways.payu.methods.filter(method => bill.paymentMethods.includes(method)).map(method => (
                <PaymentMethodCard
                  key={`payu-${method}`}
                  method={method}
                  gateway="payu"
                  onSelect={() => handlePaymentMethodSelect(method, 'payu')}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {bill.status !== 'paid' && (
        <View className="bg-surface px-6 py-4 border-t border-divider">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleSetupAutoPayment}
              className="flex-1 bg-surface border border-divider rounded-xl py-3 flex-row items-center justify-center"
            >
              <Calendar size={16} color="#6366f1" />
              <Text className="text-primary font-semibold ml-2">Auto Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPaymentMethods(!showPaymentMethods)}
              className="flex-2 bg-primary rounded-xl py-3 flex-row items-center justify-center"
            >
              <CreditCard size={16} color="white" />
              <Text className="text-white font-semibold ml-2">
                Pay {formatCurrency(calculateTotalWithLateFee())}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}