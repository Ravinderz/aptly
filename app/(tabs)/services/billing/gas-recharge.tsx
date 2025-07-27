import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ArrowLeft, Car, AlertCircle, CreditCard, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';
import { showErrorAlert } from '@/utils/alert';

interface RechargeAmount {
  id: string;
  amount: number;
  bonus: string;
  popular?: boolean;
}

interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
  amounts: RechargeAmount[];
}

export default function GasRecharge() {
  const [customerId, setCustomerId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<RechargeAmount | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const providers: Provider[] = [
    {
      id: 'igl',
      name: 'Indraprastha Gas Limited (IGL)',
      logo: '🚗',
      color: '#1976D2',
      amounts: [
        { id: '1', amount: 500, bonus: '5% extra credit', popular: true },
        { id: '2', amount: 1000, bonus: '8% extra credit' },
        { id: '3', amount: 2000, bonus: '10% extra credit' },
        { id: '4', amount: 5000, bonus: '12% extra credit' },
      ]
    },
    {
      id: 'mgl',
      name: 'Mahanagar Gas Limited (MGL)',
      logo: '⛽',
      color: '#4CAF50',
      amounts: [
        { id: '5', amount: 500, bonus: '5% extra credit' },
        { id: '6', amount: 1000, bonus: '8% extra credit', popular: true },
        { id: '7', amount: 2000, bonus: '10% extra credit' },
        { id: '8', amount: 5000, bonus: '12% extra credit' },
      ]
    },
    {
      id: 'ggl',
      name: 'Gujarat Gas Limited (GGL)',
      logo: '🌟',
      color: '#FF9800',
      amounts: [
        { id: '9', amount: 500, bonus: '4% extra credit' },
        { id: '10', amount: 1000, bonus: '7% extra credit' },
        { id: '11', amount: 2000, bonus: '9% extra credit', popular: true },
        { id: '12', amount: 5000, bonus: '11% extra credit' },
      ]
    }
  ];

  const detectProvider = async () => {
    if (customerId.length < 8) {
      showErrorAlert('Invalid Customer ID', 'Please enter a valid PNG customer ID (minimum 8 characters)');
      return;
    }

    setIsDetecting(true);
    
    // Simulate provider detection based on customer ID pattern
    setTimeout(() => {
      const prefix = customerId.substring(0, 2).toUpperCase();
      let detectedProvider;
      
      if (prefix.startsWith('IG') || customerId.startsWith('11')) detectedProvider = providers[0]; // IGL
      else if (prefix.startsWith('MG') || customerId.startsWith('22')) detectedProvider = providers[1]; // MGL
      else if (prefix.startsWith('GG') || customerId.startsWith('33')) detectedProvider = providers[2]; // GGL
      else detectedProvider = providers[0]; // Default to IGL
      
      setSelectedProvider(detectedProvider);
      setIsDetecting(false);
    }, 1500);
  };

  const handleRecharge = () => {
    if (!customerId || !selectedProvider) {
      showErrorAlert('Missing Information', 'Please enter customer ID and select provider');
      return;
    }

    const amount = selectedAmount?.amount || parseInt(customAmount);
    if (!amount || amount < 100) {
      showErrorAlert('Invalid Amount', 'Please select an amount or enter minimum ₹100');
      return;
    }

    // Navigate to payment page with transaction details
    router.push({
      pathname: '/(tabs)/services/billing/payment',
      params: {
        service: 'gas-recharge',
        customerId,
        provider: selectedProvider.name,
        amount: amount.toString(),
        rechargeDetails: selectedAmount ? JSON.stringify(selectedAmount) : '',
        cashback: Math.round(amount * 0.025).toString() // 2.5% cashback
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-divider bg-surface">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          className="mr-2 p-2"
        >
          <ArrowLeft size={20} color="#6366f1" />
        </Button>
        <Car size={20} color="#D32F2F" />
        <Text className="text-text-primary text-headline-large font-semibold ml-3">
          PNG Recharge
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer ID Input */}
        <Card className="m-6">
          <Text className="text-text-primary text-headline-medium font-semibold mb-4">
            Enter PNG Customer ID
          </Text>
          
          <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider mb-4">
            <Text className="text-text-primary text-body-large mr-3">ID</Text>
            <TextInput
              className="flex-1 text-text-primary text-body-large"
              placeholder="Enter PNG customer ID or CNG"
              placeholderTextColor="#757575"
              value={customerId}
              onChangeText={setCustomerId}
            />
          </View>

          {customerId.length >= 8 && !selectedProvider && (
            <Button 
              onPress={detectProvider} 
              disabled={isDetecting}
              className="mb-4"
            >
              {isDetecting ? 'Detecting Provider...' : 'Detect Gas Provider'}
            </Button>
          )}
        </Card>

        {/* Provider Selection */}
        {selectedProvider && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Selected Gas Provider
            </Text>
            
            <View className="flex-row items-center p-4 bg-error/5 rounded-xl border border-error/20">
              <Text className="text-2xl mr-3">{selectedProvider.logo}</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-body-medium">{selectedProvider.name}</Text>
                <Text className="text-text-secondary text-body-medium">PNG Connection verified</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                <Text className="text-primary text-body-medium font-medium">Change</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Amount Selection */}
        {selectedProvider && (
          <View className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Select Recharge Amount
            </Text>
            
            <View className="space-y-3">
              {selectedProvider.amounts.map((rechargeAmount) => (
                <TouchableOpacity
                  key={rechargeAmount.id}
                  onPress={() => setSelectedAmount(rechargeAmount)}
                  className={`bg-surface rounded-xl p-4 border ${
                    selectedAmount?.id === rechargeAmount.id ? 'border-primary bg-primary/5' : 'border-divider'
                  }`}
                >
                  {rechargeAmount.popular && (
                    <View className="absolute -top-2 left-4">
                      <View className="bg-success rounded-full px-3 py-1">
                        <Text className="text-white text-label-large font-bold">POPULAR</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Car size={16} color="#D32F2F" />
                      <Text className="text-text-primary font-bold text-display-small ml-2">
                        {formatCurrency(rechargeAmount.amount)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-success font-medium text-body-medium">
                        {rechargeAmount.bonus}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-text-primary font-semibold text-body-large">
                        PNG Balance Recharge
                      </Text>
                      <Text className="text-text-secondary text-body-medium">
                        Instant credit + bonus amount
                      </Text>
                    </View>
                    {selectedAmount?.id === rechargeAmount.id && (
                      <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-white text-label-large">✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Custom Amount */}
        {selectedProvider && !selectedAmount && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Or Enter Custom Amount
            </Text>
            
            <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider">
              <Text className="text-text-primary text-body-large mr-3">₹</Text>
              <TextInput
                className="flex-1 text-text-primary text-body-large"
                placeholder="Enter amount (₹100 - ₹10000)"
                placeholderTextColor="#757575"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
              />
            </View>
            
            {customAmount && parseInt(customAmount) >= 100 && (
              <View className="mt-3 p-3 bg-success/10 rounded-xl">
                <Text className="text-success text-body-medium">
                  Custom amount: No bonus credit applicable
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* PNG Information */}
        <HighlightCard
          title="About PNG Recharge"
          variant="info"
          size="sm"
          className="mx-6 mb-6"
        >
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Text className="text-primary mr-2">🚗</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">Piped Natural Gas (PNG)</Text>
                <Text className="text-text-secondary text-body-medium">For home cooking and water heating</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary mr-2">⛽</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">CNG Vehicle</Text>
                <Text className="text-text-secondary text-body-medium">For compressed natural gas vehicles</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary mr-2">💳</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">Prepaid System</Text>
                <Text className="text-text-secondary text-body-medium">Recharge balance and use as needed</Text>
              </View>
            </View>
          </View>
        </HighlightCard>

        {/* Cashback Info */}
        {selectedProvider && (
          <HighlightCard
            title="Cashback Offer"
            variant="success"
            size="sm"
            className="mx-6 mb-6"
          >
            <View className="flex-row items-center">
              <Gift size={16} color="#4CAF50" />
              <Text className="text-text-secondary text-body-medium ml-2">
                Earn 2.5% cashback (up to ₹100) on PNG recharge
              </Text>
            </View>
          </HighlightCard>
        )}

        {/* Important Info */}
        <HighlightCard
          title="Important Information"
          variant="info"
          size="sm"
          className="mx-6 mb-8"
        >
          <View className="space-y-2">
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Recharge will be processed instantly upon payment
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Bonus credit will be added automatically with selected amounts
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Valid for PNG domestic and CNG vehicle connections
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Balance never expires and can be used anytime
              </Text>
            </View>
          </View>
        </HighlightCard>
      </ScrollView>

      {/* Pay Button */}
      {selectedProvider && customerId.length >= 8 && (
        <View className="px-6 py-4 bg-surface border-t border-divider">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-body-medium">Recharge Amount</Text>
            <Text className="text-text-primary font-bold text-display-small">
              {formatCurrency(selectedAmount?.amount || parseInt(customAmount) || 0)}
            </Text>
          </View>
          
          <Button onPress={handleRecharge} className="flex-row items-center justify-center">
            <CreditCard size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-body-medium">
              Recharge {formatCurrency(selectedAmount?.amount || parseInt(customAmount) || 0)}
            </Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}