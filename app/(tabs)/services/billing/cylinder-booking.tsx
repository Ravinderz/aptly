import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ArrowLeft, Zap, MapPin, Calendar, AlertCircle, CreditCard, Gift, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import HighlightCard from '../../../../components/ui/HighlightCard';
import { showErrorAlert } from '@/utils/alert';

interface CylinderOption {
  id: string;
  size: string;
  weight: string;
  price: number;
  popular?: boolean;
}

interface Provider {
  id: string;
  name: string;
  logo: string;
  color: string;
  cylinders: CylinderOption[];
}

interface DeliverySlot {
  id: string;
  date: string;
  timeSlot: string;
  available: boolean;
  premium?: boolean;
}

export default function CylinderBooking() {
  const [customerId, setCustomerId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedCylinder, setSelectedCylinder] = useState<CylinderOption | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const providers: Provider[] = [
    {
      id: 'indane',
      name: 'Indane Gas',
      logo: '🔥',
      color: '#FF6B35',
      cylinders: [
        { id: '1', size: '14.2 kg', weight: 'Commercial', price: 1104, popular: true },
        { id: '2', size: '5 kg', weight: 'Domestic Small', price: 382 },
        { id: '3', size: '19 kg', weight: 'Commercial Large', price: 1524 },
      ]
    },
    {
      id: 'hp',
      name: 'HP Gas',
      logo: '⛽',
      color: '#D32F2F',
      cylinders: [
        { id: '4', size: '14.2 kg', weight: 'Commercial', price: 1098, popular: true },
        { id: '5', size: '5 kg', weight: 'Domestic Small', price: 379 },
        { id: '6', size: '19 kg', weight: 'Commercial Large', price: 1519 },
      ]
    },
    {
      id: 'bharat',
      name: 'Bharat Gas',
      logo: '🌟',
      color: '#1976D2',
      cylinders: [
        { id: '7', size: '14.2 kg', weight: 'Commercial', price: 1102, popular: true },
        { id: '8', size: '5 kg', weight: 'Domestic Small', price: 381 },
        { id: '9', size: '19 kg', weight: 'Commercial Large', price: 1522 },
      ]
    }
  ];

  const deliverySlots: DeliverySlot[] = [
    { id: '1', date: 'Today', timeSlot: '2:00 PM - 6:00 PM', available: true, premium: true },
    { id: '2', date: 'Today', timeSlot: '6:00 PM - 9:00 PM', available: false },
    { id: '3', date: 'Tomorrow', timeSlot: '9:00 AM - 12:00 PM', available: true, popular: true },
    { id: '4', date: 'Tomorrow', timeSlot: '2:00 PM - 6:00 PM', available: true },
    { id: '5', date: 'Day After', timeSlot: '9:00 AM - 12:00 PM', available: true },
    { id: '6', date: 'Day After', timeSlot: '2:00 PM - 6:00 PM', available: true },
  ];

  const detectProvider = async () => {
    if (customerId.length < 8) {
      showErrorAlert('Invalid Customer ID', 'Please enter a valid LPG customer ID (minimum 8 characters)');
      return;
    }

    setIsDetecting(true);
    
    // Simulate provider detection based on customer ID pattern
    setTimeout(() => {
      const prefix = customerId.substring(0, 2).toUpperCase();
      let detectedProvider;
      
      if (prefix.startsWith('IN') || prefix.startsWith('10')) detectedProvider = providers[0]; // Indane
      else if (prefix.startsWith('HP') || prefix.startsWith('20')) detectedProvider = providers[1]; // HP
      else if (prefix.startsWith('BH') || prefix.startsWith('30')) detectedProvider = providers[2]; // Bharat
      else detectedProvider = providers[0]; // Default to Indane
      
      setSelectedProvider(detectedProvider);
      setDeliveryAddress('A-101, Green Valley Apartments, Sector 12, Gurgaon - 122001'); // Mock address
      setIsDetecting(false);
    }, 1500);
  };

  const handleBooking = () => {
    if (!customerId || !selectedProvider || !selectedCylinder) {
      showErrorAlert('Missing Information', 'Please fill all required details');
      return;
    }

    if (!selectedSlot) {
      showErrorAlert('Select Delivery Slot', 'Please choose a preferred delivery slot');
      return;
    }

    const totalAmount = selectedCylinder.price + (selectedSlot.premium ? 50 : 0); // Premium delivery charge
    
    // Navigate to payment page with transaction details
    router.push({
      pathname: '/(tabs)/services/billing/payment',
      params: {
        service: 'cylinder-booking',
        customerId,
        provider: selectedProvider.name,
        amount: totalAmount.toString(),
        cylinderDetails: JSON.stringify({
          ...selectedCylinder,
          deliverySlot: selectedSlot,
          address: deliveryAddress
        }),
        cashback: Math.round(totalAmount * 0.01).toString() // 1% cashback
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
        <Zap size={20} color="#FF9800" />
        <Text className="text-text-primary text-headline-large font-semibold ml-3">
          LPG Cylinder Booking
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer ID Input */}
        <Card className="m-6">
          <Text className="text-text-primary text-headline-medium font-semibold mb-4">
            Enter LPG Customer ID
          </Text>
          
          <View className="flex-row items-center bg-background rounded-xl px-4 py-4 border border-divider mb-4">
            <Text className="text-text-primary text-body-large mr-3">ID</Text>
            <TextInput
              className="flex-1 text-text-primary text-body-large"
              placeholder="Enter LPG customer ID"
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
              {isDetecting ? 'Detecting Provider...' : 'Fetch Connection Details'}
            </Button>
          )}
        </Card>

        {/* Provider & Address */}
        {selectedProvider && (
          <Card className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Connection Details
            </Text>
            
            <View className="flex-row items-center p-4 bg-warning/5 rounded-xl border border-warning/20 mb-4">
              <Text className="text-2xl mr-3">{selectedProvider.logo}</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-body-large">{selectedProvider.name}</Text>
                <Text className="text-text-secondary text-body-medium">Connection verified</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                <Text className="text-primary text-body-medium font-medium">Change</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-start p-4 bg-background rounded-xl border border-divider">
              <MapPin size={16} color="#757575" className="mt-1 mr-3" />
              <View className="flex-1">
                <Text className="text-text-primary font-medium text-body-medium mb-1">Delivery Address</Text>
                <Text className="text-text-secondary text-body-medium leading-5">{deliveryAddress}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Cylinder Selection */}
        {selectedProvider && (
          <View className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Select Cylinder Size
            </Text>
            
            <View className="space-y-3">
              {selectedProvider.cylinders.map((cylinder) => (
                <TouchableOpacity
                  key={cylinder.id}
                  onPress={() => setSelectedCylinder(cylinder)}
                  className={`bg-surface rounded-xl p-4 border ${
                    selectedCylinder?.id === cylinder.id ? 'border-primary bg-primary/5' : 'border-divider'
                  }`}
                >
                  {cylinder.popular && (
                    <View className="absolute -top-2 left-4">
                      <View className="bg-success rounded-full px-3 py-1">
                        <Text className="text-white text-label-large font-bold">POPULAR</Text>
                      </View>
                    </View>
                  )}
                  
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Zap size={16} color="#FF9800" />
                      <Text className="text-text-primary font-bold text-display-small ml-2">
                        {formatCurrency(cylinder.price)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-text-secondary text-label-large">Size</Text>
                      <Text className="text-text-primary font-medium text-body-medium">{cylinder.size}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-text-primary font-semibold text-body-large">
                        {cylinder.weight}
                      </Text>
                      <Text className="text-text-secondary text-body-medium">
                        Standard LPG Cylinder
                      </Text>
                    </View>
                    {selectedCylinder?.id === cylinder.id && (
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

        {/* Delivery Slot Selection */}
        {selectedCylinder && (
          <View className="mx-6 mb-6">
            <Text className="text-text-primary text-headline-medium font-semibold mb-4">
              Choose Delivery Slot
            </Text>
            
            <View className="space-y-3">
              {deliverySlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => slot.available && setSelectedSlot(slot)}
                  disabled={!slot.available}
                  className={`bg-surface rounded-xl p-4 border ${
                    !slot.available 
                      ? 'border-divider opacity-50' 
                      : selectedSlot?.id === slot.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-divider'
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Calendar size={16} color={slot.available ? "#6366f1" : "#757575"} />
                      <Text className={`font-semibold text-body-large ml-2 ${
                        slot.available ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {slot.date}
                      </Text>
                      {slot.premium && (
                        <View className="bg-warning/10 rounded-full px-2 py-1 ml-2">
                          <Text className="text-warning text-label-large font-bold">EXPRESS</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-center">
                      <Clock size={14} color="#757575" />
                      <Text className="text-text-secondary text-body-medium ml-1">
                        {slot.timeSlot}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className={`text-body-medium ${
                        slot.available ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {slot.premium ? 'Express Delivery (+₹50)' : 'Standard Delivery (Free)'}
                      </Text>
                      <Text className="text-text-secondary text-body-medium">
                        {slot.available ? 'Available' : 'Fully Booked'}
                      </Text>
                    </View>
                    {selectedSlot?.id === slot.id && slot.available && (
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
                Earn 1% cashback (up to ₹25) on LPG cylinder booking
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
                Cylinder will be delivered within selected time slot
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Please keep empty cylinder ready for exchange
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Payment will be collected at delivery or can be paid online
              </Text>
            </View>
            <View className="flex-row items-start">
              <AlertCircle size={14} color="#6366f1" className="mt-0.5 mr-2" />
              <Text className="text-text-secondary text-body-medium flex-1">
                Express delivery available for same-day delivery (additional ₹50)
              </Text>
            </View>
          </View>
        </HighlightCard>
      </ScrollView>

      {/* Book Button */}
      {selectedProvider && selectedCylinder && selectedSlot && (
        <View className="px-6 py-4 bg-surface border-t border-divider">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-body-medium">Total Amount</Text>
            <View className="items-end">
              <Text className="text-text-primary font-bold text-display-small">
                {formatCurrency(selectedCylinder.price + (selectedSlot.premium ? 50 : 0))}
              </Text>
              {selectedSlot.premium && (
                <Text className="text-text-secondary text-body-medium">
                  (Incl. ₹50 express delivery)
                </Text>
              )}
            </View>
          </View>
          
          <Button onPress={handleBooking} className="flex-row items-center justify-center">
            <CreditCard size={16} color="white" />
            <Text className="text-white font-semibold ml-2 text-body-medium">
              Book Cylinder - {formatCurrency(selectedCylinder.price + (selectedSlot.premium ? 50 : 0))}
            </Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}