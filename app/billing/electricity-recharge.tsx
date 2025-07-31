import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useAlert } from '@/components/ui/AlertCard';
import {
  ArrowLeft,
  Zap,
  User,
  AlertCircle,
  CreditCard,
  MapPin,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import HighlightCard from '@/components/ui/HighlightCard';

interface ElectricityProvider {
  id: string;
  name: string;
  state: string;
  logo: string;
  color: string;
}

export default function ElectricityRecharge() {
  const [consumerNumber, setConsumerNumber] = useState('');
  const [selectedProvider, setSelectedProvider] =
    useState<ElectricityProvider | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const { showAlert, AlertComponent } = useAlert();

  const providers: ElectricityProvider[] = [
    {
      id: 'bescom',
      name: 'BESCOM',
      state: 'Karnataka',
      logo: '⚡',
      color: '#1976D2',
    },
    {
      id: 'msedcl',
      name: 'MSEDCL',
      state: 'Maharashtra',
      logo: '🏢',
      color: '#4CAF50',
    },
    {
      id: 'tsspdcl',
      name: 'TSSPDCL',
      state: 'Telangana',
      logo: '⚡',
      color: '#FF9800',
    },
    { id: 'kseb', name: 'KSEB', state: 'Kerala', logo: '🌴', color: '#2E7D32' },
    {
      id: 'tneb',
      name: 'TNEB',
      state: 'Tamil Nadu',
      logo: '🏦',
      color: '#D32F2F',
    },
    { id: 'bypl', name: 'BYPL', state: 'Delhi', logo: '🏙️', color: '#9C27B0' },
  ];

  const validateConsumerNumber = (number: string): boolean => {
    return number.length >= 8 && number.length <= 20 && /^[0-9]+$/.test(number);
  };

  const detectProvider = async () => {
    if (!validateConsumerNumber(consumerNumber)) {
      showAlert(
        'Invalid Consumer Number',
        'Please enter a valid consumer number (8-20 digits)',
        'error',
      );
      return;
    }

    setIsDetecting(true);

    // Simulate provider detection
    setTimeout(() => {
      const randomProvider =
        providers[Math.floor(Math.random() * providers.length)];
      setSelectedProvider(randomProvider);
      setIsDetecting(false);
      showAlert(
        'Provider Detected',
        `Found: ${randomProvider.name} (${randomProvider.state})`,
        'success',
      );
    }, 2000);
  };

  const handlePayment = () => {
    if (!selectedProvider) {
      showAlert(
        'Select Provider',
        'Please select an electricity provider first',
        'warning',
      );
      return;
    }

    if (!customAmount || parseFloat(customAmount) < 1) {
      showAlert(
        'Invalid Amount',
        'Please enter a valid amount (minimum ₹1)',
        'error',
      );
      return;
    }

    // Navigate to payment screen
    router.push({
      pathname: '/billing/payment',
      params: {
        type: 'electricity',
        provider: selectedProvider.name,
        consumerNumber,
        amount: customAmount,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-surface border-b border-divider">
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)')
          }
          className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-50 rounded-full w-10 h-10 items-center justify-center mr-3">
            <Zap size={20} color="#2196F3" />
          </View>
          <View>
            <Text className="text-headline-medium text-text-primary">
              Electricity Bill
            </Text>
            <Text className="text-text-secondary text-body-medium">
              Pay your electricity bill
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}>
        {/* Consumer Number Input */}
        <Card className="mb-6">
          <View className="p-4">
            <Text className="text-headline-medium text-text-primary mb-4">
              Consumer Details
            </Text>

            <View className="mb-4">
              <Text className="text-text-primary font-medium mb-2">
                Consumer Number
              </Text>
              <View className="flex-row items-center bg-surface border border-divider rounded-xl px-4 py-3">
                <User size={20} color="#757575" />
                <TextInput
                  className="flex-1 ml-3 text-text-primary text-body-large"
                  placeholder="Enter consumer number"
                  placeholderTextColor="#757575"
                  value={consumerNumber}
                  onChangeText={setConsumerNumber}
                  keyboardType="numeric"
                  maxLength={20}
                />
              </View>
              <Text className="text-text-secondary text-label-large mt-1">
                Find this on your electricity bill
              </Text>
            </View>

            <Button
              onPress={detectProvider}
              loading={isDetecting}
              disabled={!validateConsumerNumber(consumerNumber) || isDetecting}
              variant={selectedProvider ? 'secondary' : 'primary'}
              className="w-full">
              {isDetecting
                ? 'Detecting Provider...'
                : selectedProvider
                  ? 'Provider Detected'
                  : 'Detect Provider'}
            </Button>
          </View>
        </Card>

        {/* Selected Provider */}
        {selectedProvider && (
          <Card className="mb-6">
            <View className="p-4">
              <Text className="text-headline-medium text-text-primary mb-4">
                Electricity Provider
              </Text>
              <View className="flex-row items-center p-4 bg-primary/5 rounded-xl">
                <View className="bg-surface rounded-full w-12 h-12 items-center justify-center mr-4">
                  <Text className="text-2xl">{selectedProvider.logo}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-headline-medium text-text-primary">
                    {selectedProvider.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <MapPin size={16} color="#757575" />
                    <Text className="text-text-secondary text-body-medium ml-1">
                      {selectedProvider.state}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Amount Input */}
        {selectedProvider && (
          <Card className="mb-6">
            <View className="p-4">
              <Text className="text-headline-medium text-text-primary mb-4">
                Bill Amount
              </Text>

              <View className="mb-4">
                <View className="flex-row items-center bg-surface border border-divider rounded-xl px-4 py-3">
                  <Text className="text-text-primary text-body-large font-medium mr-2">
                    ₹
                  </Text>
                  <TextInput
                    className="flex-1 text-text-primary text-body-large"
                    placeholder="Enter amount"
                    placeholderTextColor="#757575"
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    keyboardType="numeric"
                  />
                </View>
                <Text className="text-text-secondary text-label-large mt-1">
                  Minimum amount: ₹1
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Quick Amount Buttons */}
        {selectedProvider && (
          <Card className="mb-6">
            <View className="p-4">
              <Text className="text-headline-medium text-text-primary mb-4">
                Quick Amounts
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {[500, 1000, 1500, 2000, 2500, 3000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    onPress={() => setCustomAmount(amount.toString())}
                    className="bg-primary/10 rounded-full px-4 py-2"
                    activeOpacity={0.7}>
                    <Text className="text-primary font-medium">₹{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        )}

        {/* Security Notice */}
        <HighlightCard
          title="Secure Payment"
          variant="info"
          size="sm"
          className="mb-6">
          <View className="flex-row items-center">
            <AlertCircle size={16} className="text-primary mr-2" />
            <Text className="text-text-secondary flex-1">
              Your payment is secured with bank-level encryption
            </Text>
          </View>
        </HighlightCard>

        {/* Payment Button */}
        {selectedProvider && (
          <Button
            onPress={handlePayment}
            disabled={!customAmount || parseFloat(customAmount) < 1}
            className="mb-6">
            <View className="flex-row items-center">
              <CreditCard size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Pay ₹{customAmount || '0'}
              </Text>
            </View>
          </Button>
        )}
      </ScrollView>

      {AlertComponent}
    </SafeAreaView>
  );
}
