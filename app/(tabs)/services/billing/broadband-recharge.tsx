import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Wifi, Search, AlertCircle, CreditCard, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import Button from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';

interface Plan {
  id: string;
  speed: string;
  price: number;
  validity: string;
  type: 'fiber' | 'broadband';
  popular?: boolean;
}

interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
  plans: Plan[];
}

export default function BroadbandRecharge() {
  const [customerId, setCustomerId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const providers: Provider[] = [
    {
      id: 'airtel',
      name: 'Airtel Xstream Fiber',
      logo: '🌐',
      color: '#D32F2F',
      plans: [
        { id: '1', speed: '40 Mbps', price: 699, validity: '30 days', type: 'fiber', popular: true },
        { id: '2', speed: '100 Mbps', price: 999, validity: '30 days', type: 'fiber' },
        { id: '3', speed: '200 Mbps', price: 1499, validity: '30 days', type: 'fiber' },
      ]
    },
    {
      id: 'jio',
      name: 'JioFiber',
      logo: '📡',
      color: '#1976D2',
      plans: [
        { id: '4', speed: '30 Mbps', price: 599, validity: '30 days', type: 'fiber' },
        { id: '5', speed: '100 Mbps', price: 849, validity: '30 days', type: 'fiber', popular: true },
        { id: '6', speed: '300 Mbps', price: 1499, validity: '30 days', type: 'fiber' },
      ]
    },
    {
      id: 'bsnl',
      name: 'BSNL Broadband',
      logo: '🏢',
      color: '#4CAF50',
      plans: [
        { id: '7', speed: '10 Mbps', price: 449, validity: '30 days', type: 'broadband' },
        { id: '8', speed: '20 Mbps', price: 649, validity: '30 days', type: 'broadband' },
        { id: '9', speed: '50 Mbps', price: 999, validity: '30 days', type: 'broadband' },
      ]
    },
    {
      id: 'act',
      name: 'ACT Fibernet',
      logo: '⚡',
      color: '#FF9800',
      plans: [
        { id: '10', speed: '75 Mbps', price: 799, validity: '30 days', type: 'fiber' },
        { id: '11', speed: '150 Mbps', price: 1099, validity: '30 days', type: 'fiber', popular: true },
        { id: '12', speed: '300 Mbps', price: 1699, validity: '30 days', type: 'fiber' },
      ]
    }
  ];

  const detectProvider = async () => {
    if (customerId.length < 6) {
      Alert.alert('Invalid ID', 'Please enter a valid customer ID (minimum 6 characters)');
      return;
    }

    setIsDetecting(true);
    
    // Simulate provider detection based on customer ID pattern
    setTimeout(() => {
      const firstChar = customerId.charAt(0).toUpperCase();
      let detectedProvider;
      
      if (firstChar === 'A') detectedProvider = providers[0]; // Airtel
      else if (firstChar === 'J') detectedProvider = providers[1]; // Jio
      else if (firstChar === 'B') detectedProvider = providers[2]; // BSNL
      else if (['C', 'D', 'E'].includes(firstChar)) detectedProvider = providers[3]; // ACT
      else detectedProvider = providers[0]; // Default to Airtel
      
      setSelectedProvider(detectedProvider);
      setIsDetecting(false);
    }, 1500);
  };

  const handleRecharge = () => {
    if (!customerId || !selectedProvider) {
      Alert.alert('Missing Information', 'Please enter customer ID and select provider');
      return;
    }

    const amount = selectedPlan?.price || parseInt(customAmount);
    if (!amount || amount < 100) {
      Alert.alert('Invalid Amount', 'Please select a plan or enter a valid amount (minimum ₹100)');
      return;
    }

    // Navigate to payment page with transaction details
    router.push({
      pathname: '/(tabs)/services/billing/payment',
      params: {
        service: 'broadband-recharge',
        customerId,
        provider: selectedProvider.name,
        amount: amount.toString(),
        planDetails: selectedPlan ? JSON.stringify(selectedPlan) : '',
        cashback: Math.round(amount * 0.03).toString() // 3% cashback
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
          onPress={() => router.back()}
          className="mr-2 p-2"
        >
          <ArrowLeft size={20} color="#6366f1" />
        </Button>
        <Wifi size={20} color="#4CAF50" />
        <Text className="text-text-primary text-headline-large font-semibold ml-3">
          Broadband Recharge
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer ID Input */}
        <Card className="m-6">
          <Text className="text-text-primary text-headline-medium font-semibold mb-4">
            Enter Customer ID
          </Text>
          
          <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider mb-4">
            <Search size={20} color="#757575" />
            <TextInput
              className="flex-1 text-text-primary text-body-large ml-3"
              placeholder="Enter customer ID or registered number"
              placeholderTextColor="#757575"
              value={customerId}
              onChangeText={setCustomerId}
            />
          </View>

          {customerId.length >= 6 && !selectedProvider && (
            <Button 
              onPress={detectProvider} 
              disabled={isDetecting}
              className="mb-4"
            >
              {isDetecting ? 'Detecting Provider...' : 'Detect Provider'}
            </Button>
          )}
        </Card>

        {/* Provider Selection */}
        {selectedProvider && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Selected Provider
            </Text>
            
            <View className="flex-row items-center p-4 bg-secondary/5 rounded-xl border border-secondary/20">
              <Text className="text-2xl mr-3">{selectedProvider.logo}</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-body-large">{selectedProvider.name}</Text>
                <Text className="text-text-secondary text-body-medium">Provider detected</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                <Text className="text-primary text-body-medium font-medium">Change</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Plans Selection */}
        {selectedProvider && (
          <View className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Available Plans
            </Text>
            
            <View className="space-y-3">
              {selectedProvider.plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan)}
                  className={`bg-surface rounded-xl p-4 border ${
                    selectedPlan?.id === plan.id ? 'border-primary bg-primary/5' : 'border-divider'
                  }`}
                >
                  {plan.popular && (
                    <View className="absolute -top-2 left-4">
                      <View className="bg-success rounded-full px-3 py-1">
                        <Text className="text-white text-label-large font-bold">POPULAR</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Wifi size={16} color="#4CAF50" />
                      <Text className="text-text-primary font-bold text-display-small ml-2">
                        {formatCurrency(plan.price)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-text-secondary text-label-large">Speed</Text>
                      <Text className="text-text-primary font-medium text-body-medium">{plan.speed}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-text-primary font-semibold text-body-large">
                        {plan.type === 'fiber' ? 'Fiber Connection' : 'Broadband Connection'}
                      </Text>
                      <Text className="text-text-secondary text-body-medium">
                        Validity: {plan.validity}
                      </Text>
                    </View>
                    {selectedPlan?.id === plan.id && (
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
        {selectedProvider && !selectedPlan && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Or Enter Custom Amount
            </Text>
            
            <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider">
              <Text className="text-text-primary text-body-large mr-3">₹</Text>
              <TextInput
                className="flex-1 text-text-primary text-body-large"
                placeholder="Enter amount (₹100 - ₹5000)"
                placeholderTextColor="#757575"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
              />
            </View>
          </Card>
        )}

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
                Earn 3% cashback (up to ₹75) on broadband recharge
              </Text>
            </View>
          </HighlightCard>
        )}

        {/* Connection Types Info */}
        <HighlightCard
          title="Connection Types"
          variant="info"
          size="sm"
          className="mx-6 mb-6"
        >
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Text className="text-primary mr-2">🚀</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">Fiber Connection</Text>
                <Text className="text-text-secondary text-body-medium">High-speed internet with consistent performance</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary mr-2">📡</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">Broadband Connection</Text>
                <Text className="text-text-secondary text-body-medium">Traditional broadband with reliable connectivity</Text>
              </View>
            </View>
          </View>
        </HighlightCard>

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
                Recharge will be processed instantly upon successful payment
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Cashback will be credited within 24-48 hours
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Customer ID should match your registered connection details
              </Text>
            </View>
          </View>
        </HighlightCard>
      </ScrollView>

      {/* Pay Button */}
      {selectedProvider && customerId.length >= 6 && (
        <View className="px-6 py-4 bg-surface border-t border-divider">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-body-medium">Amount to Pay</Text>
            <Text className="text-text-primary font-bold text-display-small">
              {formatCurrency(selectedPlan?.price || parseInt(customAmount) || 0)}
            </Text>
          </View>
          
          <Button onPress={handleRecharge} className="flex-row items-center justify-center">
            <CreditCard size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-body-medium">
              Pay {formatCurrency(selectedPlan?.price || parseInt(customAmount) || 0)}
            </Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}