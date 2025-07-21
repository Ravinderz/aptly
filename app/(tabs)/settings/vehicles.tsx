import React, { useState, useEffect } from 'react';
import { ScrollView, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Plus, Edit3, Trash2, Car, Bike, Star } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';
import { showDeleteConfirmAlert } from '../../../utils/alert';
import { VehicleStorage, Vehicle, initializeMockData } from '../../../utils/storage';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadVehicles();
    }, [])
  );

  const initializeData = async () => {
    try {
      await initializeMockData();
      await loadVehicles();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const vehicleData = await VehicleStorage.getVehicles();
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    router.push('/(tabs)/settings/vehicles/add');
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    router.push(`/(tabs)/settings/vehicles/edit/${vehicle.id}`);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    showDeleteConfirmAlert(
      'Remove Vehicle',
      `Are you sure you want to remove ${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})?`,
      async () => {
        try {
          await VehicleStorage.deleteVehicle(vehicle.id);
          await loadVehicles();
        } catch (error) {
          console.error('Error deleting vehicle:', error);
        }
      }
    );
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return Car;
      case 'bike': return Bike;
      case 'bicycle': return Bike;
      default: return Car;
    }
  };

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case 'car': return '#2196F3';
      case 'bike': return '#FF9800';
      case 'bicycle': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'car': return 'Car';
      case 'bike': return 'Bike/Scooter';
      case 'bicycle': return 'Bicycle';
      default: return 'Other';
    }
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
        {/* Loading State */}
        {loading && (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-text-secondary">Loading vehicles...</Text>
          </View>
        )}

        {/* Vehicles List */}
        {!loading && vehicles.map((vehicle, index) => {
          const VehicleIcon = getVehicleIcon(vehicle.type);
          
          return (
            <Card key={vehicle.id} className="mb-4">
              {/* Primary Vehicle Badge */}
              {vehicle.isPrimary && (
                <View className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                  <View className="flex-row items-center">
                    <Star size={16} color="#FF9800" />
                    <Text className="text-warning text-sm font-medium ml-2">
                      Primary Vehicle
                    </Text>
                  </View>
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
                    <View className="flex-row items-center">
                      <Text className="text-text-primary text-lg font-semibold">
                        {vehicle.make} {vehicle.model}
                      </Text>
                      {vehicle.isPrimary && (
                        <Star size={16} color="#FF9800" className="ml-2" />
                      )}
                    </View>
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
                      Color: {vehicle.color}
                    </Text>
                    
                    {vehicle.parkingSlot && (
                      <Text className="text-text-secondary text-sm">
                        Parking: Slot {vehicle.parkingSlot}
                      </Text>
                    )}
                    
                    <Text className="text-text-secondary text-xs">
                      Added: {new Date(vehicle.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>

                  {/* Vehicle Type Badge */}
                  <View 
                    className="self-start px-3 py-1 rounded-full mt-2"
                    style={{ backgroundColor: `${getVehicleTypeColor(vehicle.type)}15` }}
                  >
                    <Text 
                      className="text-xs font-medium"
                      style={{ color: getVehicleTypeColor(vehicle.type) }}
                    >
                      {getVehicleTypeLabel(vehicle.type)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Empty State */}
        {!loading && vehicles.length === 0 && (
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
        {!loading && vehicles.length > 0 && (
          <View className="flex-row gap-4 mt-6">
            <Card className="flex-1 items-center p-4">
              <Car size={20} color="#2196F3" />
              <Text className="text-display-small font-bold text-text-primary mt-2">
                {vehicles.filter(v => v.type === 'car').length}
              </Text>
              <Text className="text-text-secondary text-sm">Cars</Text>
            </Card>
            
            <Card className="flex-1 items-center p-4">
              <Bike size={20} color="#FF9800" />
              <Text className="text-display-small font-bold text-text-primary mt-2">
                {vehicles.filter(v => v.type === 'bike').length}
              </Text>
              <Text className="text-text-secondary text-sm">Bikes</Text>
            </Card>

            <Card className="flex-1 items-center p-4">
              <Bike size={20} color="#4CAF50" />
              <Text className="text-display-small font-bold text-text-primary mt-2">
                {vehicles.filter(v => v.type === 'bicycle').length}
              </Text>
              <Text className="text-text-secondary text-sm">Bicycles</Text>
            </Card>
          </View>
        )}

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