import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, Download, Share, Home, Gift, Calendar } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';

export default function PaymentSuccess() {
  const params = useLocalSearchParams<{
    service: string;
    amount: string;
    provider: string;
    paymentMethod: string;
    transactionId: string;
    cashback: string;
  }>();

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getServiceName = (service: string) => {
    switch (service) {
      case 'mobile-recharge': return 'Mobile Recharge';
      case 'broadband-recharge': return 'Broadband Recharge';
      case 'cylinder-booking': return 'Gas Cylinder Booking';
      case 'gas-recharge': return 'PNG Recharge';
      case 'dishtv-recharge': return 'DTH Recharge';
      default: return 'Service Payment';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'mobile-recharge': return '📱';
      case 'broadband-recharge': return '🌐';
      case 'cylinder-booking': return '🔥';
      case 'gas-recharge': return '⛽';
      case 'dishtv-recharge': return '📺';
      default: return '💳';
    }
  };

  const getSuccessMessage = (service: string) => {
    switch (service) {
      case 'mobile-recharge': return 'Your mobile has been recharged successfully!';
      case 'broadband-recharge': return 'Your broadband has been recharged successfully!';
      case 'cylinder-booking': return 'Your gas cylinder has been booked successfully!';
      case 'gas-recharge': return 'Your PNG account has been recharged successfully!';
      case 'dishtv-recharge': return 'Your DTH has been recharged successfully!';
      default: return 'Your payment was successful!';
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const amount = parseInt(params.amount || '0');
  const cashback = parseInt(params.cashback || '0');

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Receipt download functionality would be implemented here');
  };

  const handleShareReceipt = () => {
    // In a real app, this would use native sharing
    alert('Share receipt functionality would be implemented here');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View className="items-center py-8 px-6">
          <View className="w-20 h-20 rounded-full bg-success/10 items-center justify-center mb-4">
            <CheckCircle size={40} color="#4CAF50" />
          </View>
          <Text className="text-success text-display-medium font-bold mb-2 text-center">
            Payment Successful!
          </Text>
          <Text className="text-text-secondary text-body-large text-center leading-6">
            {getSuccessMessage(params.service)}
          </Text>
        </View>

        {/* Transaction Details */}
        <Card className="mx-6 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold">
              Transaction Details
            </Text>
            <Text className="text-3xl">{getServiceIcon(params.service)}</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-body-medium">Service</Text>
              <Text className="text-text-primary text-body-medium font-medium">
                {getServiceName(params.service)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-body-medium">Provider</Text>
              <Text className="text-text-primary text-body-medium font-medium">
                {params.provider}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-body-medium">Amount Paid</Text>
              <Text className="text-text-primary text-body-large font-bold">
                {formatCurrency(amount)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-body-medium">Payment Method</Text>
              <Text className="text-text-primary text-body-medium font-medium">
                {params.paymentMethod}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-body-medium">Transaction ID</Text>
              <Text className="text-text-primary text-body-medium font-mono">
                {params.transactionId}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-body-medium">Date & Time</Text>
              <Text className="text-text-primary text-body-medium">
                {getCurrentDateTime()}
              </Text>
            </View>

            {cashback > 0 && (
              <View className="flex-row justify-between pt-2 border-t border-divider">
                <Text className="text-success text-body-medium font-medium">Cashback Earned</Text>
                <Text className="text-success text-body-large font-bold">
                  +{formatCurrency(cashback)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Cashback Info */}
        {cashback > 0 && (
          <HighlightCard
            title="Cashback Earned!"
            variant="success"
            size="sm"
            className="mx-6 mb-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Gift size={16} color="#4CAF50" />
                <Text className="text-text-secondary text-body-medium ml-2">
                  Cashback will be credited within 24-48 hours
                </Text>
              </View>
            </View>
          </HighlightCard>
        )}

        {/* Service Status */}
        <HighlightCard
          title="Service Status"
          variant="info"
          size="sm"
          className="mx-6 mb-6"
        >
          <View className="space-y-2">
            <View className="flex-row items-center">
              <CheckCircle size={16} color="#4CAF50" />
              <Text className="text-text-secondary text-body-medium ml-2">
                Payment confirmed and processed
              </Text>
            </View>
            <View className="flex-row items-center">
              <Calendar size={16} color="#6366f1" />
              <Text className="text-text-secondary text-body-medium ml-2">
                {params.service === 'cylinder-booking' 
                  ? 'Your cylinder will be delivered as scheduled'
                  : 'Service activated immediately'}
              </Text>
            </View>
          </View>
        </HighlightCard>

        {/* Action Buttons */}
        <View className="mx-6 mb-8 space-y-3">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleDownloadReceipt}
              className="flex-1 bg-surface border border-divider rounded-xl p-4 flex-row items-center justify-center"
            >
              <Download size={16} color="#6366f1" />
              <Text className="text-primary font-medium ml-2 text-body-medium">
                Download
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleShareReceipt}
              className="flex-1 bg-surface border border-divider rounded-xl p-4 flex-row items-center justify-center"
            >
              <Share size={16} color="#6366f1" />
              <Text className="text-primary font-medium ml-2 text-body-medium">
                Share
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            onPress={() => router.push('/(tabs)/services/billing')}
            variant="outline"
            className="flex-row items-center justify-center"
          >
            <Text className="text-primary font-semibold text-body-medium">
              More Recharges
            </Text>
          </Button>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-6 py-4 bg-surface border-t border-divider">
        <Button 
          onPress={() => router.push('/(tabs)')}
          className="flex-row items-center justify-center"
        >
          <Home size={16} color="white" />
          <Text className="text-white font-semibold ml-2 text-body-medium">
            Go to Home
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}