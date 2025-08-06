import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {
  ArrowLeft,
  Tv,
  Calendar,
  AlertCircle,
  Gift,
  Play,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';
import { showErrorAlert } from '@/utils/alert';

interface RechargePlan {
  id: string;
  amount: number;
  validity: string;
  channels: string;
  type: 'base' | 'sports' | 'premium' | 'regional';
  popular?: boolean;
}

interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
  plans: RechargePlan[];
}

export default function DishTVRecharge() {
  const [customerId, setCustomerId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const providers: Provider[] = [
    {
      id: 'dishtv',
      name: 'DishTV',
      logo: '📺',
      color: '#D32F2F',
      plans: [
        {
          id: '1',
          amount: 299,
          validity: '30 days',
          channels: '200+ channels',
          type: 'base',
          popular: true,
        },
        {
          id: '2',
          amount: 459,
          validity: '30 days',
          channels: '280+ channels + Sports',
          type: 'sports',
        },
        {
          id: '3',
          amount: 649,
          validity: '30 days',
          channels: '350+ channels + Premium',
          type: 'premium',
        },
        {
          id: '4',
          amount: 399,
          validity: '30 days',
          channels: '250+ regional channels',
          type: 'regional',
        },
      ],
    },
    {
      id: 'tatasky',
      name: 'Tata Play',
      logo: '🎬',
      color: '#1976D2',
      plans: [
        {
          id: '5',
          amount: 269,
          validity: '30 days',
          channels: '180+ channels',
          type: 'base',
        },
        {
          id: '6',
          amount: 429,
          validity: '30 days',
          channels: '250+ channels + Sports',
          type: 'sports',
          popular: true,
        },
        {
          id: '7',
          amount: 599,
          validity: '30 days',
          channels: '320+ channels + Premium',
          type: 'premium',
        },
        {
          id: '8',
          amount: 369,
          validity: '30 days',
          channels: '220+ regional channels',
          type: 'regional',
        },
      ],
    },
    {
      id: 'airtel',
      name: 'Airtel Digital TV',
      logo: '📡',
      color: '#D32F2F',
      plans: [
        {
          id: '9',
          amount: 289,
          validity: '30 days',
          channels: '190+ channels',
          type: 'base',
        },
        {
          id: '10',
          amount: 449,
          validity: '30 days',
          channels: '270+ channels + Sports',
          type: 'sports',
        },
        {
          id: '11',
          amount: 629,
          validity: '30 days',
          channels: '340+ channels + Premium',
          type: 'premium',
          popular: true,
        },
        {
          id: '12',
          amount: 379,
          validity: '30 days',
          channels: '240+ regional channels',
          type: 'regional',
        },
      ],
    },
    {
      id: 'sundirect',
      name: 'Sun Direct',
      logo: '☀️',
      color: '#FF9800',
      plans: [
        {
          id: '13',
          amount: 259,
          validity: '30 days',
          channels: '170+ channels',
          type: 'base',
        },
        {
          id: '14',
          amount: 399,
          validity: '30 days',
          channels: '230+ channels + Sports',
          type: 'sports',
        },
        {
          id: '15',
          amount: 559,
          validity: '30 days',
          channels: '300+ channels + Premium',
          type: 'premium',
        },
        {
          id: '16',
          amount: 349,
          validity: '30 days',
          channels: '200+ regional channels',
          type: 'regional',
          popular: true,
        },
      ],
    },
  ];

  const detectProvider = async () => {
    if (customerId.length < 8) {
      showErrorAlert(
        'Invalid Customer ID',
        'Please enter a valid DTH customer ID (minimum 8 characters)',
      );
      return;
    }

    setIsDetecting(true);

    // Simulate provider detection based on customer ID pattern
    setTimeout(() => {
      const prefix = customerId.substring(0, 2);
      let detectedProvider: Provider | null = null;

      if ((prefix.startsWith('10') || prefix.startsWith('11')) && providers[0])
        detectedProvider = providers[0]; // DishTV
      else if ((prefix.startsWith('20') || prefix.startsWith('21')) && providers[1])
        detectedProvider = providers[1]; // Tata Play
      else if ((prefix.startsWith('30') || prefix.startsWith('31')) && providers[2])
        detectedProvider = providers[2]; // Airtel
      else if ((prefix.startsWith('40') || prefix.startsWith('41')) && providers[3])
        detectedProvider = providers[3]; // Sun Direct
      else if (providers[0])
        detectedProvider = providers[0]; // Default to DishTV

      if (detectedProvider) {
        setSelectedProvider(detectedProvider);
      }
      setIsDetecting(false);
    }, 1500);
  };

  const handleRecharge = () => {
    if (!customerId || !selectedProvider) {
      showErrorAlert(
        'Missing Information',
        'Please enter customer ID and select provider',
      );
      return;
    }

    const amount = selectedPlan?.amount || parseInt(customAmount);
    if (!amount || amount < 50) {
      showErrorAlert(
        'Invalid Amount',
        'Please select a plan or enter minimum ₹50',
      );
      return;
    }

    // Navigate to payment page with transaction details
    router.push({
      pathname: '/(tabs)/services/billing/payment',
      params: {
        service: 'dishtv-recharge',
        customerId,
        provider: selectedProvider.name,
        amount: amount.toString(),
        planDetails: selectedPlan ? JSON.stringify(selectedPlan) : '',
        cashback: Math.round(amount * 0.04).toString(), // 4% cashback
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'base':
        return '📺';
      case 'sports':
        return '⚽';
      case 'premium':
        return '🎬';
      case 'regional':
        return '🌍';
      default:
        return '📺';
    }
  };

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'base':
        return '#6366f1';
      case 'sports':
        return '#4CAF50';
      case 'premium':
        return '#FF9800';
      case 'regional':
        return '#D32F2F';
      default:
        return '#757575';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-divider bg-surface">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          className="mr-2 p-2">
          <ArrowLeft size={20} color="#6366f1" />
        </Button>
        <Tv size={20} color="#6366f1" />
        <Text className="text-text-primary text-headline-large font-semibold ml-3">
          DTH Recharge
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer ID Input */}
        <Card className="m-6">
          <Text className="text-text-primary text-headline-medium font-semibold mb-4">
            Enter DTH Customer ID
          </Text>

          <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider mb-4">
            <Text className="text-text-primary text-body-large mr-3">ID</Text>
            <TextInput
              className="flex-1 text-text-primary text-body-large"
              placeholder="Enter DTH subscriber ID or VC number"
              placeholderTextColor="#757575"
              value={customerId}
              onChangeText={setCustomerId}
            />
          </View>

          {customerId.length >= 8 && !selectedProvider && (
            <Button
              onPress={detectProvider}
              disabled={isDetecting}
              className="mb-4">
              {isDetecting ? 'Detecting Provider...' : 'Detect DTH Provider'}
            </Button>
          )}
        </Card>

        {/* Provider Selection */}
        {selectedProvider && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Selected DTH Provider
            </Text>

            <View className="flex-row items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Text className="text-2xl mr-3">{selectedProvider.logo}</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-body-large">
                  {selectedProvider.name}
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  DTH Connection verified
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                <Text className="text-primary text-body-medium font-medium">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Plans Selection */}
        {selectedProvider && (
          <View className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Select Recharge Plan
            </Text>

            <View className="space-y-3">
              {selectedProvider.plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan)}
                  className={`bg-surface rounded-xl p-4 border ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-divider'
                  }`}>
                  {plan.popular && (
                    <View className="absolute -top-2 left-4">
                      <View className="bg-success rounded-full px-3 py-1">
                        <Text className="text-white text-label-large font-bold">
                          POPULAR
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{
                          backgroundColor: `${getPlanTypeColor(plan.type)}15`,
                        }}>
                        <Text className="text-sm">
                          {getPlanIcon(plan.type)}
                        </Text>
                      </View>
                      <Text className="text-text-primary font-bold text-display-small">
                        {formatCurrency(plan.amount)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center">
                        <Calendar size={14} color="#757575" />
                        <Text className="text-text-secondary text-label-large ml-1">
                          {plan.validity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-text-primary font-semibold text-body-large mb-1">
                        {plan.channels}
                      </Text>
                      <View
                        className="self-start px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${getPlanTypeColor(plan.type)}15`,
                        }}>
                        <Text
                          className="text-xs font-medium capitalize"
                          style={{ color: getPlanTypeColor(plan.type) }}>
                          {plan.type === 'base' ? 'Essential' : plan.type} Pack
                        </Text>
                      </View>
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
                placeholder="Enter amount (₹50 - ₹2000)"
                placeholderTextColor="#757575"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
              />
            </View>
          </Card>
        )}

        {/* DTH Features Info */}
        <HighlightCard
          title="DTH Plan Features"
          variant="info"
          size="sm"
          className="mx-6 mb-6">
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Text className="mr-2">📺</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">
                  Essential Pack
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Basic entertainment channels
                </Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <Text className="mr-2">⚽</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">
                  Sports Pack
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Live sports and entertainment
                </Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <Text className="mr-2">🎬</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">
                  Premium Pack
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Movies, series and exclusive content
                </Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <Text className="mr-2">🌍</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium">
                  Regional Pack
                </Text>
                <Text className="text-text-secondary text-body-medium">
                  Local language channels
                </Text>
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
            className="mx-6 mb-6">
            <View className="flex-row items-center">
              <Gift size={16} color="#4CAF50" />
              <Text className="text-text-secondary text-body-medium ml-2">
                Earn 4% cashback (up to ₹80) on DTH recharge
              </Text>
            </View>
          </HighlightCard>
        )}

        {/* Important Info */}
        <HighlightCard
          title="Important Information"
          variant="info"
          size="sm"
          className="mx-6 mb-8">
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
                Service will be activated immediately after successful recharge
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Plan validity starts from the date of activation
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Free-to-air channels included with all packs
              </Text>
            </View>
          </View>
        </HighlightCard>
      </ScrollView>

      {/* Pay Button */}
      {selectedProvider && customerId.length >= 8 && (
        <View className="px-6 py-4 bg-surface border-t border-divider">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-body-medium">
              Recharge Amount
            </Text>
            <Text className="text-text-primary font-bold text-display-small">
              {formatCurrency(
                selectedPlan?.amount || parseInt(customAmount) || 0,
              )}
            </Text>
          </View>

          <Button
            onPress={handleRecharge}
            className="flex-row items-center justify-center">
            <Play size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-body-medium">
              Recharge{' '}
              {formatCurrency(
                selectedPlan?.amount || parseInt(customAmount) || 0,
              )}
            </Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
