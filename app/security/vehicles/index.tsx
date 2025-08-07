import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FilterPill } from '@/components/ui/FilterPill';
import { 
  Car, 
  Search, 
  Plus,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Timer,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import type { SecurityVehicle } from '@/types/security';

type VehicleStatus = 'parked' | 'departed' | 'overstay';
type FilterType = 'all' | 'parked' | 'overstay' | 'departed';
type VehicleType = 'car' | 'bike' | 'bicycle' | 'truck' | 'other';

/**
 * Vehicle Management Interface - Phase 2
 * 
 * Features:
 * - Real-time vehicle tracking
 * - Parking space management
 * - Overstay monitoring
 * - Vehicle registration and departure
 * - Search and filtering
 * - Visitor vehicle integration
 */
const VehicleManagement = () => {
  const { user } = useDirectAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  const [newVehicle, setNewVehicle] = useState({
    type: 'car' as VehicleType,
    registrationNumber: '',
    make: '',
    model: '',
    color: '',
    ownerType: 'visitor' as 'visitor' | 'resident' | 'service',
    ownerId: '',
    ownerName: '',
    parkingSpot: '',
    expectedDepartureTime: '',
    notes: ''
  });

  // Mock data - will be replaced with real API calls
  const [vehicles, setVehicles] = useState<SecurityVehicle[]>([
    {
      id: '1',
      type: 'car',
      registrationNumber: 'KA-01-AB-1234',
      make: 'Honda',
      model: 'City',
      color: 'White',
      ownerType: 'visitor',
      ownerId: 'visitor1',
      ownerName: 'John Doe',
      parkingSpot: 'P-12',
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expectedDepartureTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      status: 'parked',
      notes: 'Visiting A-204',
      registeredBy: 'guard1'
    },
    {
      id: '2',
      type: 'bike',
      registrationNumber: 'KA-02-CD-5678',
      make: 'Honda',
      model: 'Activa',
      color: 'Red',
      ownerType: 'service',
      ownerId: 'service1',
      ownerName: 'Delivery Person',
      parkingSpot: 'B-05',
      checkInTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      expectedDepartureTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overstay)
      status: 'overstay',
      notes: 'Food delivery',
      registeredBy: 'guard1'
    },
    {
      id: '3',
      type: 'car',
      registrationNumber: 'KA-03-EF-9012',
      make: 'Toyota',
      model: 'Innova',
      color: 'Silver',
      ownerType: 'resident',
      ownerId: 'resident1',
      ownerName: 'Resident Name',
      parkingSpot: 'R-15',
      checkInTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'departed',
      registeredBy: 'guard2'
    }
  ]);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: vehicles.length },
    { key: 'parked', label: 'Parked', count: vehicles.filter(v => v.status === 'parked').length },
    { key: 'overstay', label: 'Overstaying', count: vehicles.filter(v => v.status === 'overstay').length },
    { key: 'departed', label: 'Departed', count: vehicles.filter(v => v.status === 'departed').length },
  ];

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.registrationNumber.toLowerCase().includes(query) ||
        vehicle.ownerName.toLowerCase().includes(query) ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.parkingSpot?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [vehicles, activeFilter, searchQuery]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'parked': return '#16a34a';
      case 'overstay': return '#dc2626';
      case 'departed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: VehicleStatus) => {
    switch (status) {
      case 'parked': return '#f0fdf4';
      case 'overstay': return '#fef2f2';
      case 'departed': return '#f9fafb';
      default: return '#f9fafb';
    }
  };

  const getOwnerTypeColor = (type: string) => {
    switch (type) {
      case 'visitor': return '#2563eb';
      case 'resident': return '#16a34a';
      case 'service': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getVehicleIcon = (type: VehicleType) => {
    // For now, using Car icon for all types. In a real app, you'd have specific icons
    return <Car size={20} color="#6b7280" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m ago`;
    }
    return `${diffMins}m ago`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRegisterVehicle = async () => {
    if (!newVehicle.registrationNumber.trim() || !newVehicle.ownerName.trim()) {
      Alert.alert('Validation Error', 'Registration number and owner name are required');
      return;
    }

    try {
      const vehicle: SecurityVehicle = {
        id: Date.now().toString(),
        type: newVehicle.type,
        registrationNumber: newVehicle.registrationNumber.toUpperCase(),
        make: newVehicle.make,
        model: newVehicle.model,
        color: newVehicle.color,
        ownerType: newVehicle.ownerType,
        ownerId: newVehicle.ownerId || Date.now().toString(),
        ownerName: newVehicle.ownerName,
        parkingSpot: newVehicle.parkingSpot,
        checkInTime: new Date(),
        expectedDepartureTime: newVehicle.expectedDepartureTime 
          ? new Date(newVehicle.expectedDepartureTime) 
          : undefined,
        status: 'parked',
        notes: newVehicle.notes,
        registeredBy: user?.id || 'current-guard'
      };

      setVehicles(prev => [vehicle, ...prev]);
      
      // Reset form
      setNewVehicle({
        type: 'car',
        registrationNumber: '',
        make: '',
        model: '',
        color: '',
        ownerType: 'visitor',
        ownerId: '',
        ownerName: '',
        parkingSpot: '',
        expectedDepartureTime: '',
        notes: ''
      });
      
      setShowRegisterForm(false);
      
      Alert.alert('Vehicle Registered', 'Vehicle has been registered successfully');
      
    } catch (error) {
      Alert.alert('Error', 'Failed to register vehicle. Please try again.');
    }
  };

  const handleMarkDeparted = (vehicleId: string) => {
    Alert.alert(
      'Confirm Departure',
      'Mark this vehicle as departed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setVehicles(prev => prev.map(vehicle => 
              vehicle.id === vehicleId 
                ? { ...vehicle, status: 'departed' as const, checkOutTime: new Date() }
                : vehicle
            ));
          }
        }
      ]
    );
  };

  const parkedCount = vehicles.filter(v => v.status === 'parked').length;
  const overstayCount = vehicles.filter(v => v.status === 'overstay').length;

  if (showRegisterForm) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowRegisterForm(false)}
              className="mr-2 p-2"
            >
              <XCircle size={20} color="#6b7280" />
            </Button>
            <Car size={24} color="#6366f1" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              Register Vehicle
            </Text>
          </View>
          <Text className="text-gray-600">
            Register a new vehicle in the parking system
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Card className="p-4 mb-4 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Vehicle Information
            </Text>

            {/* Vehicle Type */}
            <Text className="text-sm text-gray-600 mb-2">Vehicle Type</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                { key: 'car', label: 'Car' },
                { key: 'bike', label: 'Motorcycle' },
                { key: 'bicycle', label: 'Bicycle' },
                { key: 'truck', label: 'Truck' },
                { key: 'other', label: 'Other' }
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={newVehicle.type === type.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewVehicle(prev => ({ ...prev, type: type.key as VehicleType }))}
                  className="mr-2 mb-2"
                >
                  {type.label}
                </Button>
              ))}
            </View>

            <Input
              label="Registration Number *"
              value={newVehicle.registrationNumber}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, registrationNumber: value }))}
              placeholder="KA-01-AB-1234"
              className="mb-4"
            />

            <View className="flex-row mb-4">
              <Input
                label="Make"
                value={newVehicle.make}
                onChangeText={(value) => setNewVehicle(prev => ({ ...prev, make: value }))}
                placeholder="Honda"
                className="flex-1 mr-2"
              />
              <Input
                label="Model"
                value={newVehicle.model}
                onChangeText={(value) => setNewVehicle(prev => ({ ...prev, model: value }))}
                placeholder="City"
                className="flex-1 ml-2"
              />
            </View>

            <Input
              label="Color"
              value={newVehicle.color}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, color: value }))}
              placeholder="White"
              className="mb-4"
            />
          </Card>

          <Card className="p-4 mb-4 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Owner Information
            </Text>

            {/* Owner Type */}
            <Text className="text-sm text-gray-600 mb-2">Owner Type</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                { key: 'visitor', label: 'Visitor' },
                { key: 'resident', label: 'Resident' },
                { key: 'service', label: 'Service' }
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={newVehicle.ownerType === type.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewVehicle(prev => ({ ...prev, ownerType: type.key as any }))}
                  className="mr-2 mb-2"
                >
                  {type.label}
                </Button>
              ))}
            </View>

            <Input
              label="Owner Name *"
              value={newVehicle.ownerName}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, ownerName: value }))}
              placeholder="Vehicle owner name"
              className="mb-4"
            />

            <Input
              label="Parking Spot"
              value={newVehicle.parkingSpot}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, parkingSpot: value }))}
              placeholder="P-12, B-05, R-15"
              className="mb-4"
            />

            <Input
              label="Notes"
              value={newVehicle.notes}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, notes: value }))}
              placeholder="Additional notes"
              multiline
              numberOfLines={2}
            />
          </Card>

          <View className="flex-row space-x-3">
            <Button
              variant="outline"
              size="lg"
              onPress={() => setShowRegisterForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onPress={handleRegisterVehicle}
              className="flex-1"
            >
              Register Vehicle
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Car size={24} color="#6366f1" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              Vehicle Management
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowRegisterForm(true)}
            className="p-2"
          >
            <Plus size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-900"
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-2">
            {filters.map((filter) => (
              <FilterPill
                key={filter.key}
                label={`${filter.label} (${filter.count})`}
                isActive={activeFilter === filter.key}
                onPress={() => setActiveFilter(filter.key)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics */}
        <View className="flex-row mb-6">
          <Card className="flex-1 p-4 bg-white mr-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Currently Parked</Text>
                <Text className="text-2xl font-bold text-green-600">{parkedCount}</Text>
              </View>
              <Car size={24} color="#16a34a" />
            </View>
          </Card>
          
          {overstayCount > 0 && (
            <Card className="flex-1 p-4 bg-white ml-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-600">Overstaying</Text>
                  <Text className="text-2xl font-bold text-red-600">{overstayCount}</Text>
                </View>
                <Timer size={24} color="#dc2626" />
              </View>
            </Card>
          )}
        </View>

        {/* Overstay Alert */}
        {overstayCount > 0 && (
          <Card className="p-4 mb-4 bg-amber-50 border border-amber-200">
            <View className="flex-row items-center">
              <AlertTriangle size={20} color="#f59e0b" />
              <Text className="text-amber-900 font-semibold ml-2">
                {overstayCount} Vehicle{overstayCount > 1 ? 's' : ''} Overstaying Parking Duration
              </Text>
            </View>
          </Card>
        )}

        {/* Vehicle List */}
        {filteredVehicles.length === 0 ? (
          <Card className="p-6 bg-white">
            <View className="items-center">
              <Car size={48} color="#9ca3af" />
              <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                No vehicles found
              </Text>
              <Text className="text-gray-600 text-center">
                {searchQuery.trim() 
                  ? `No vehicles match "${searchQuery}"` 
                  : activeFilter === 'all' 
                    ? 'No vehicles registered today'
                    : `No vehicles with status "${activeFilter}"`
                }
              </Text>
            </View>
          </Card>
        ) : (
          <View className="space-y-3">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="p-4 bg-white">
                {/* Status and Actions Row */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View 
                      className="px-3 py-1 rounded-full mr-2"
                      style={{ backgroundColor: getStatusBgColor(vehicle.status) }}
                    >
                      <Text 
                        className="text-xs font-medium capitalize"
                        style={{ color: getStatusColor(vehicle.status) }}
                      >
                        {vehicle.status}
                      </Text>
                    </View>
                    
                    <View 
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: vehicle.ownerType === 'visitor' ? '#eff6ff' : vehicle.ownerType === 'resident' ? '#f0fdf4' : '#fffbeb' }}
                    >
                      <Text 
                        className="text-xs font-medium capitalize"
                        style={{ color: getOwnerTypeColor(vehicle.ownerType) }}
                      >
                        {vehicle.ownerType}
                      </Text>
                    </View>
                  </View>

                  {vehicle.status === 'parked' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleMarkDeparted(vehicle.id)}
                    >
                      <CheckCircle size={14} color="#16a34a" />
                      <Text className="text-green-600 ml-1">Departed</Text>
                    </Button>
                  )}
                </View>

                {/* Vehicle Info */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      {getVehicleIcon(vehicle.type)}
                      <Text className="text-lg font-bold text-gray-900 ml-2">
                        {vehicle.registrationNumber}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mb-2">
                      <User size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-1 mr-4">
                        {vehicle.ownerName}
                      </Text>
                      {vehicle.parkingSpot && (
                        <>
                          <MapPin size={14} color="#6b7280" />
                          <Text className="text-sm text-gray-600 ml-1">
                            {vehicle.parkingSpot}
                          </Text>
                        </>
                      )}
                    </View>

                    {vehicle.make && vehicle.model && (
                      <Text className="text-sm text-gray-600 mb-2">
                        {vehicle.make} {vehicle.model} • {vehicle.color}
                      </Text>
                    )}

                    <View className="flex-row items-center">
                      <Clock size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-500 ml-1">
                        {vehicle.status === 'departed' 
                          ? `Departed: ${formatTimeAgo(vehicle.checkOutTime!)}`
                          : `Parked: ${formatTimeAgo(vehicle.checkInTime)}`
                        }
                      </Text>
                    </View>

                    {vehicle.notes && (
                      <Text className="text-xs text-gray-500 mt-1">
                        Note: {vehicle.notes}
                      </Text>
                    )}

                    {/* Overstay Warning */}
                    {vehicle.status === 'overstay' && vehicle.expectedDepartureTime && (
                      <View className="flex-row items-center mt-2 p-2 bg-red-50 rounded-lg">
                        <Timer size={16} color="#dc2626" />
                        <Text className="text-sm text-red-700 ml-2">
                          Expected departure: {formatTime(vehicle.expectedDepartureTime)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <ArrowRight size={20} color="#9ca3af" />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Register Vehicle Button */}
        <View className="mt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => setShowRegisterForm(true)}
          >
            <View className="flex-row items-center">
              <Plus size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">Register New Vehicle</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

VehicleManagement.displayName = 'VehicleManagement';

export default VehicleManagement;