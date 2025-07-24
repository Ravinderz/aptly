import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { showErrorAlert } from '@/utils/alert';
import { ArrowLeft, CreditCard, Smartphone, Building, Shield, CheckCircle, Gift } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  popular?: boolean;
  cashback?: string;
}

export default function PaymentPage() {
  const params = useLocalSearchParams<{
    service: string;
    amount: string;
    provider: string;
    cashback: string;
    [key: string]: string;
  }>();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', icon: Smartphone, type: 'upi', popular: true, cashback: 'Extra 1%' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, type: 'card' },
    { id: 'netbanking', name: 'Net Banking', icon: Building, type: 'netbanking' },
  ];

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

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      showErrorAlert('Select Payment Method', 'Please choose a payment method to continue');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Navigate to success page with transaction details
      router.replace({
        pathname: '/(tabs)/services/billing/payment-success',
        params: {
          service: params.service,
          amount: params.amount,
          provider: params.provider,
          paymentMethod: selectedPaymentMethod.name,
          transactionId: `TXN${Date.now()}`,
          cashback: params.cashback || '0'
        }
      });
    }, 3000);
  };

  const amount = parseInt(params.amount || '0');
  const cashbackAmount = parseInt(params.cashback || '0');
  const totalSavings = cashbackAmount + (selectedPaymentMethod?.cashback ? Math.round(amount * 0.01) : 0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-divider bg-surface">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          className="mr-2 p-2"
          disabled={isProcessing}
        >
          <ArrowLeft size={20} color="#6366f1" />
        </Button>
        <Text className="text-text-primary text-headline-large font-semibold">
          Payment
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Transaction Summary */}
        <Card className="m-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">{getServiceIcon(params.service)}</Text>
            <View className="flex-1">
              <Text className="text-text-primary text-headline-medium font-semibold">
                {getServiceName(params.service)}
              </Text>
              <Text className="text-text-secondary text-body-medium">
                {params.provider}
              </Text>
            </View>
          </View>

          <View className="bg-background rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-secondary text-body-medium">Amount</Text>
              <Text className="text-text-primary text-display-small font-bold">
                {formatCurrency(amount)}
              </Text>
            </View>
            
            {cashbackAmount > 0 && (
              <View className="flex-row justify-between items-center">
                <Text className="text-success text-body-medium">Cashback</Text>
                <Text className="text-success text-body-medium font-semibold">
                  +{formatCurrency(cashbackAmount)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Payment Methods */}
        <View className="mx-6 mb-6">
          <Text className="text-text-primary text-headline-medium font-semibold mb-4">
            Choose Payment Method
          </Text>
          
          <View className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setSelectedPaymentMethod(method)}
                  disabled={isProcessing}
                  className={`bg-surface rounded-xl p-4 border ${
                    selectedPaymentMethod?.id === method.id ? 'border-primary bg-primary/5' : 'border-divider'
                  } ${isProcessing ? 'opacity-50' : ''}`}
                >
                  {method.popular && (
                    <View className="absolute -top-2 left-4">
                      <View className="bg-success rounded-full px-3 py-1">
                        <Text className="text-white text-label-large font-bold">POPULAR</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                        <IconComponent size={20} color="#6366f1" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-text-primary font-semibold text-body-large">
                          {method.name}
                        </Text>
                        {method.cashback && (
                          <Text className="text-success text-body-medium">
                            {method.cashback} cashback
                          </Text>
                        )}
                      </View>
                    </View>
                    {selectedPaymentMethod?.id === method.id && (
                      <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
                        <CheckCircle size={16} color="white" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Total Savings */}
        {totalSavings > 0 && (
          <HighlightCard
            title="Your Savings"
            variant="success"
            size="sm"
            className="mx-6 mb-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Gift size={16} color="#4CAF50" />
                <Text className="text-text-secondary text-body-medium ml-2">
                  Total cashback you&apos;ll earn
                </Text>
              </View>
              <Text className="text-success text-body-large font-bold">
                {formatCurrency(totalSavings)}
              </Text>
            </View>
          </HighlightCard>
        )}

        {/* Security Information */}
        <HighlightCard
          title="Secure Payment"
          variant="info"
          size="sm"
          className="mx-6 mb-8"
        >
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Shield size={16} color="#6366f1" />
              <Text className="text-text-secondary text-body-medium ml-2">
                256-bit SSL encryption for secure transactions
              </Text>
            </View>
            <View className="flex-row items-center">
              <Shield size={16} color="#6366f1" />
              <Text className="text-text-secondary text-body-medium ml-2">
                PCI DSS compliant payment processing
              </Text>
            </View>
            <View className="flex-row items-center">
              <Shield size={16} color="#6366f1" />
              <Text className="text-text-secondary text-body-medium ml-2">
                Your card/bank details are never stored
              </Text>
            </View>
          </View>
        </HighlightCard>
      </ScrollView>

      {/* Pay Button */}
      <View className="px-6 py-4 bg-surface border-t border-divider">
        <Button 
          onPress={handlePayment} 
          disabled={!selectedPaymentMethod || isProcessing}
          className="flex-row items-center justify-center"
        >
          {isProcessing ? (
            <Text className="text-white font-semibold text-body-medium">
              Processing Payment...
            </Text>
          ) : (
            <>
              <CreditCard size={16} color="white" />
              <Text className="text-white font-semibold ml-2 text-body-medium">
                Pay {formatCurrency(amount)}
              </Text>
            </>
          )}
        </Button>
        
        {selectedPaymentMethod && (
          <Text className="text-text-secondary text-body-medium text-center mt-2">
            Paying via {selectedPaymentMethod.name}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}