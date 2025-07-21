import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Smartphone, User, Zap, AlertCircle, CreditCard, Gift } from 'lucide-react-native';
import { router } from 'expo-router';
import Button from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';

interface Plan {
  id: string;
  amount: number;
  validity: string;
  data: string;
  type: 'prepaid' | 'postpaid';
  description: string;
  popular?: boolean;
}

interface Operator {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export default function MobileRecharge() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [rechargeType, setRechargeType] = useState<'prepaid' | 'postpaid'>('prepaid');

  const operators: Operator[] = [
    { id: 'airtel', name: 'Airtel', logo: '📶', color: '#D32F2F' },
    { id: 'jio', name: 'Jio', logo: '📡', color: '#1976D2' },
    { id: 'vi', name: 'Vi', logo: '📞', color: '#D32F2F' },
    { id: 'bsnl', name: 'BSNL', logo: '🏢', color: '#4CAF50' },
  ];

  const prepaidPlans: Plan[] = [
    { id: '1', amount: 199, validity: '28 days', data: '2GB/day', type: 'prepaid', description: 'Unlimited calls', popular: true },
    { id: '2', amount: 399, validity: '56 days', data: '2.5GB/day', type: 'prepaid', description: 'Unlimited calls + 100 SMS/day' },
    { id: '3', amount: 599, validity: '84 days', data: '2GB/day', type: 'prepaid', description: 'Unlimited calls + Disney+ Hotstar' },
    { id: '4', amount: 719, validity: '84 days', data: '1.5GB/day', type: 'prepaid', description: 'Unlimited calls + Netflix' },
  ];

  const postpaidPlans: Plan[] = [
    { id: '5', amount: 399, validity: '30 days', data: '75GB', type: 'postpaid', description: 'Unlimited calls + family sharing' },
    { id: '6', amount: 599, validity: '30 days', data: '125GB', type: 'postpaid', description: 'Unlimited calls + OTT apps', popular: true },
    { id: '7', amount: 999, validity: '30 days', data: '210GB', type: 'postpaid', description: 'Premium plan with international roaming' },
  ];

  const currentPlans = rechargeType === 'prepaid' ? prepaidPlans : postpaidPlans;

  const detectOperator = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsDetecting(true);
    
    // Simulate operator detection
    setTimeout(() => {
      const firstDigit = phoneNumber[0];
      let detectedOperator;
      
      if (['6', '7', '8', '9'].includes(firstDigit)) {
        // Simple logic for demo - in real app would use API
        if (phoneNumber.startsWith('9')) detectedOperator = operators[0]; // Airtel
        else if (phoneNumber.startsWith('8')) detectedOperator = operators[1]; // Jio
        else if (phoneNumber.startsWith('7')) detectedOperator = operators[2]; // Vi
        else detectedOperator = operators[3]; // BSNL
      }
      
      setSelectedOperator(detectedOperator || operators[0]);
      setIsDetecting(false);
    }, 1500);
  };

  const handleRecharge = () => {
    if (!phoneNumber || !selectedOperator) {
      Alert.alert('Missing Information', 'Please enter phone number and select operator');
      return;
    }

    const amount = selectedPlan?.amount || parseInt(customAmount);
    if (!amount || amount < 10) {
      Alert.alert('Invalid Amount', 'Please select a plan or enter a valid amount (minimum ₹10)');
      return;
    }

    // Navigate to payment page with transaction details
    router.push({
      pathname: '/(tabs)/services/billing/payment',
      params: {
        service: 'mobile-recharge',
        phoneNumber,
        operator: selectedOperator.name,
        amount: amount.toString(),
        planDetails: selectedPlan ? JSON.stringify(selectedPlan) : '',
        cashback: Math.round(amount * 0.02).toString() // 2% cashback
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
        <Smartphone size={20} color="#6366f1" />
        <Text className="text-text-primary text-headline-large font-semibold ml-3">
          Mobile Recharge
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Phone Number Input */}
        <Card className="m-6">
          <Text className="text-text-primary text-headline-medium font-semibold mb-4">
            Enter Mobile Number
          </Text>
          
          <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider mb-4">
            <Text className="text-text-primary text-body-large mr-3">+91</Text>
            <TextInput
              className="flex-1 text-text-primary text-body-large"
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#757575"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
              maxLength={10}
            />
            <TouchableOpacity onPress={detectOperator} className="p-1">
              <User size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {phoneNumber.length === 10 && !selectedOperator && (
            <Button 
              onPress={detectOperator} 
              disabled={isDetecting}
              className="mb-4"
            >
              {isDetecting ? 'Detecting Operator...' : 'Detect Operator'}
            </Button>
          )}
        </Card>

        {/* Operator Selection */}
        {selectedOperator && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Selected Operator
            </Text>
            
            <View className="flex-row items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Text className="text-2xl mr-3">{selectedOperator.logo}</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold">{selectedOperator.name}</Text>
                <Text className="text-text-secondary text-sm">Operator detected</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedOperator(null)}>
                <Text className="text-primary text-sm font-medium">Change</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Recharge Type Toggle */}
        {selectedOperator && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Recharge Type
            </Text>
            
            <View className="flex-row bg-background rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setRechargeType('prepaid')}
                className={`flex-1 py-3 rounded-lg ${
                  rechargeType === 'prepaid' ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text className={`text-center font-medium ${
                  rechargeType === 'prepaid' ? 'text-white' : 'text-text-secondary'
                }`}>
                  Prepaid
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setRechargeType('postpaid')}
                className={`flex-1 py-3 rounded-lg ${
                  rechargeType === 'postpaid' ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text className={`text-center font-medium ${
                  rechargeType === 'postpaid' ? 'text-white' : 'text-text-secondary'
                }`}>
                  Postpaid
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Plans Selection */}
        {selectedOperator && (
          <View className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Popular {rechargeType === 'prepaid' ? 'Prepaid' : 'Postpaid'} Plans
            </Text>
            
            <View className="space-y-3">
              {currentPlans.map((plan) => (
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
                        <Text className="text-white text-xs font-bold">POPULAR</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Zap size={16} color="#6366f1" />
                      <Text className="text-text-primary font-bold text-display-small ml-2">
                        {formatCurrency(plan.amount)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-text-secondary text-label-large">Validity</Text>
                      <Text className="text-text-primary font-medium text-body-medium">{plan.validity}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-text-primary font-semibold text-body-large">{plan.data}</Text>
                      <Text className="text-text-secondary text-body-medium">{plan.description}</Text>
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
        {selectedOperator && !selectedPlan && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Or Enter Custom Amount
            </Text>
            
            <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider">
              <Text className="text-text-primary text-body-large mr-2">₹</Text>
              <TextInput
                className="flex-1 text-text-primary text-body-large"
                placeholder="Enter amount (₹10 - ₹5000)"
                placeholderTextColor="#9CA3AF"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
              />
            </View>
          </Card>
        )}

        {/* Cashback Info */}
        {selectedOperator && (
          <HighlightCard
            title="Cashback Offer"
            variant="success"
            size="sm"
            className="mx-6 mb-6"
          >
            <View className="flex-row items-center">
              <Gift size={16} color="#4CAF50" />
              <Text className="text-text-secondary text-sm ml-2">
                Earn 2% cashback (up to ₹50) on this recharge
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
              <Text className="text-text-secondary text-sm flex-1">
                Recharge will be processed instantly upon successful payment
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-sm flex-1">
                Cashback will be credited within 24-48 hours
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-sm flex-1">
                For failed transactions, refund takes 3-5 business days
              </Text>
            </View>
          </View>
        </HighlightCard>
      </ScrollView>

      {/* Pay Button */}
      {selectedOperator && (phoneNumber.length === 10) && (
        <View className="px-6 py-4 bg-surface border-t border-divider">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-body-medium">Amount to Pay</Text>
            <Text className="text-text-primary font-bold text-display-small">
              {formatCurrency(selectedPlan?.amount || parseInt(customAmount) || 0)}
            </Text>
          </View>
          
          <Button onPress={handleRecharge} className="flex-row items-center justify-center">
            <CreditCard size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-body-medium">
              Pay {formatCurrency(selectedPlan?.amount || parseInt(customAmount) || 0)}
            </Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}