import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import VehicleForm from '@/components/ui/VehicleForm';
import { VehicleStorage, Vehicle } from '@/utils/storage';
import { showErrorAlert } from '@/utils/alert';

export default function EditVehicle() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      const vehicles = await VehicleStorage.getVehicles();
      const foundVehicle = vehicles.find((v) => v.id === id);

      if (foundVehicle) {
        setVehicle(foundVehicle);
      } else {
        showErrorAlert('Error', 'Vehicle not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      showErrorAlert('Error', 'Failed to load vehicle details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">
            Loading vehicle details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-error">Vehicle not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">
            Edit Vehicle
          </Text>
          <Text className="text-text-secondary text-sm">
            Update vehicle details
          </Text>
        </View>
      </View>

      <VehicleForm
        initialData={{
          type: vehicle.type,
          make: vehicle.make,
          model: vehicle.model,
          registrationNumber: vehicle.registrationNumber,
          color: vehicle.color,
          parkingSlot: vehicle.parkingSlot,
          isPrimary: vehicle.isPrimary,
        }}
        isEditing={true}
        editingId={id}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </SafeAreaView>
  );
}
