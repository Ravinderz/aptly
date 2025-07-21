import React, { useState } from 'react';
import { ScrollView, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Plus, Edit3, Trash2, Car, Bike } from 'lucide-react-native';
import { router } from 'expo-router';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';
import { showDeleteConfirmAlert } from '../../../utils/alert';

interface Vehicle {
  id: string;
  type: 'two-wheeler' | 'four-wheeler';
  brand: string;
  model: string;
  registrationNumber: string;
  color: string;
  ownerName: string;
  parkingSlot?: string;
  rcNumber?: string;
  insuranceExpiry?: string;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      type: 'four-wheeler',
      brand: 'Maruti Suzuki',
      model: 'Swift',
      registrationNumber: 'DL 01 AB 1234',
      color: 'White',
      ownerName: 'Rajesh Kumar',
      parkingSlot: 'A-301',
      rcNumber: 'DL01AB1234567890',
      insuranceExpiry: '2025-03-15',
    },
    {
      id: '2',
      type: 'two-wheeler',
      brand: 'Honda',
      model: 'Activa 6G',
      registrationNumber: 'DL 02 XY 5678',
      color: 'Black',
      ownerName: 'Priya Kumar',
      parkingSlot: 'B-12',
      insuranceExpiry: '2024-12-20',
    },
  ]);

  const handleAddVehicle = () => {
    console.log('Add vehicle pressed');
    // router.push('/settings/add-vehicle');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    console.log('Edit vehicle:', vehicle.registrationNumber);
    // router.push(`/settings/edit-vehicle/${vehicle.id}`);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    showDeleteConfirmAlert(
      'Remove Vehicle',
      `Are you sure you want to remove ${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})?`,
      () => {
        setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
      }
    );
  };

  const getVehicleIcon = (type: string) => {
    return type === 'four-wheeler' ? Car : Bike;
  };

  const getVehicleTypeColor = (type: string) => {
    return type === 'four-wheeler' ? '#2196F3' : '#FF9800';
  };

  const isInsuranceExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // Expiring within 30 days
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-divider bg-surface">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-2 p-2"
          >
            <ArrowLeft size={20} color="#6366f1" />
          </Button>
          <Text className="text-text-primary text-headline-large font-semibold">
            Vehicles
          </Text>
        </View>
        
        <Button size="sm" onPress={handleAddVehicle}>
          <Plus size={16} color="white" />
        </Button>
      </View>

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Vehicles List */}
        {vehicles.map((vehicle, index) => {
          const VehicleIcon = getVehicleIcon(vehicle.type);
          const isExpiring = isInsuranceExpiring(vehicle.insuranceExpiry);
          
          return (
            <Card key={vehicle.id} className={cn("mb-4", isExpiring && "border-warning/50")}>
              {/* Insurance Warning */}
              {isExpiring && (
                <View className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                  <Text className="text-warning text-sm font-medium">
                    ⚠️ Insurance expires on {vehicle.insuranceExpiry}
                  </Text>
                </View>
              )}

              <View className="flex-row items-start">
                {/* Vehicle Icon */}
                <View 
                  className="w-16 h-16 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${getVehicleTypeColor(vehicle.type)}15` }}
                >
                  <VehicleIcon size={28} color={getVehicleTypeColor(vehicle.type)} />
                </View>

                {/* Vehicle Info */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-text-primary text-lg font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleEditVehicle(vehicle)}
                        className="p-2 rounded-full bg-primary/10"
                        activeOpacity={0.7}
                      >
                        <Edit3 size={14} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteVehicle(vehicle)}
                        className="p-2 rounded-full bg-error/10"
                        activeOpacity={0.7}
                      >
                        <Trash2 size={14} color="#D32F2F" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Registration Number */}
                  <View className="bg-text-primary/5 rounded-lg px-3 py-2 mb-3 self-start">
                    <Text className="text-text-primary font-mono text-sm font-bold">
                      {vehicle.registrationNumber}
                    </Text>
                  </View>

                  {/* Vehicle Details */}
                  <View className="space-y-1">
                    <Text className="text-text-secondary text-sm">
                      Color: {vehicle.color} • Owner: {vehicle.ownerName}
                    </Text>
                    
                    {vehicle.parkingSlot && (
                      <Text className="text-text-secondary text-sm">
                        Parking: Slot {vehicle.parkingSlot}
                      </Text>
                    )}
                    
                    {vehicle.rcNumber && (
                      <Text className="text-text-secondary text-sm">
                        RC: {vehicle.rcNumber}
                      </Text>
                    )}
                    
                    {vehicle.insuranceExpiry && (
                      <Text className={cn(
                        "text-sm",
                        isExpiring ? "text-warning font-medium" : "text-text-secondary"
                      )}>
                        Insurance: Valid till {vehicle.insuranceExpiry}
                      </Text>
                    )}
                  </View>

                  {/* Vehicle Type Badge */}
                  <View 
                    className="self-start px-3 py-1 rounded-full mt-2"
                    style={{ backgroundColor: `${getVehicleTypeColor(vehicle.type)}15` }}
                  >
                    <Text 
                      className="text-xs font-medium capitalize"
                      style={{ color: getVehicleTypeColor(vehicle.type) }}
                    >
                      {vehicle.type.replace('-', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Empty State */}
        {vehicles.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Car size={32} color="#6366f1" />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              No Vehicles Registered
            </Text>
            <Text className="text-text-secondary text-center mb-6 px-4">
              Register your vehicles for parking allocation and society records.
            </Text>
            <Button onPress={handleAddVehicle}>
              Add Vehicle
            </Button>
          </View>
        )}

        {/* Add Vehicle Card */}
        {vehicles.length > 0 && (
          <TouchableOpacity
            onPress={handleAddVehicle}
            className={cn(
              "border-2 border-dashed border-primary/30 rounded-xl p-6",
              "items-center justify-center bg-primary/5",
              "active:bg-primary/10"
            )}
            activeOpacity={0.8}
          >
            <Plus size={24} color="#6366f1" />
            <Text className="text-primary text-body-large font-medium mt-2">
              Add Vehicle
            </Text>
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View className="flex-row gap-4 mt-6">
          <Card className="flex-1 items-center p-4">
            <Car size={20} color="#2196F3" />
            <Text className="text-display-small font-bold text-text-primary mt-2">
              {vehicles.filter(v => v.type === 'four-wheeler').length}
            </Text>
            <Text className="text-text-secondary text-sm">Four Wheeler</Text>
          </Card>
          
          <Card className="flex-1 items-center p-4">
            <Bike size={20} color="#FF9800" />
            <Text className="text-display-small font-bold text-text-primary mt-2">
              {vehicles.filter(v => v.type === 'two-wheeler').length}
            </Text>
            <Text className="text-text-secondary text-sm">Two Wheeler</Text>
          </Card>
        </View>

        {/* Info Card */}
        <Card className="mt-6 bg-secondary/10 border-secondary/20">
          <Text className="text-secondary text-sm font-medium mb-2">
            🚗 Vehicle Registration Benefits
          </Text>
          <Text className="text-text-secondary text-sm leading-5">
            • Reserved parking slot allocation{'\n'}
            • Easy visitor vehicle entry{'\n'}
            • Insurance renewal reminders{'\n'}
            • Society security records
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}