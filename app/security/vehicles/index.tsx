import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Car,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  MapPin,
  Calendar,
  Camera,
  Tag,
  Timer,
  ArrowLeft,
  Users,
  TrendingUp,
  Shield,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useSecurityPermissions } from '@/hooks/useSecurityPermissions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  LoadingWrapper, 
  useAsyncState, 
  LoadingSpinner 
} from '@/components/ui/LoadingStates';
import { cn } from '@/utils/cn';
import { vehiclesService } from '@/services/vehicles.service';
import type {
  SecurityVehicle,
  VehicleSearchFilters,
  VehicleStats,
  VehicleRegistrationRequest,
  VehicleDepartureRequest,
} from '@/services/vehicles.service';

/**
 * Security Vehicle Management - Vehicle registration and tracking system
 * 
 * Features:
 * - Vehicle registration and check-in/check-out
 * - Real-time parking status and space management
 * - Entry/exit logging with time tracking
 * - Owner verification and validation
 * - Overstay monitoring and alerts
 * - Parking violation tracking
 * - Recurring visitor management
 * - Security photo documentation
 */
const SecurityVehicleManagement = () => {
  const router = useRouter();
  const { user } = useDirectAuth();
  const { canManageVehicles, permissionLevel } = useSecurityPermissions();
  
  const [vehiclesState, { setLoading, setData, setError }] = useAsyncState<{
    vehicles: SecurityVehicle[];
    totalCount: number;
    stats: VehicleStats;
  }>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<SecurityVehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState<VehicleSearchFilters>({
    status: 'all',
    type: 'all',
    ownerType: 'all',
    searchTerm: '',
    page: 1,
    limit: 20,
    sortBy: 'checkInTime',
    sortOrder: 'desc',
  });

  const [newVehicle, setNewVehicle] = useState<VehicleRegistrationRequest>({
    vehicleNumber: '',
    type: 'car',
    ownerType: 'visitor',
    ownerName: '',
    ownerPhone: '',
    expectedDepartureTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    parkingZone: 'visitor',
    notes: '',
  });

  // Load vehicles data on mount and when filters change
  useEffect(() => {
    loadVehiclesData();
  }, [filters]);

  const loadVehiclesData = async () => {
    try {
      setLoading();
      
      // Load vehicles and stats in parallel
      const [vehiclesResponse, statsResponse] = await Promise.all([
        vehiclesService.getVehicles(filters),
        vehiclesService.getStats(),
      ]);

      if (vehiclesResponse.success && statsResponse.success) {
        setData({
          vehicles: vehiclesResponse.data!.vehicles,
          totalCount: vehiclesResponse.data!.totalCount,
          stats: statsResponse.data!,
        });
      } else {
        const error = vehiclesResponse.message || statsResponse.message || 'Failed to load vehicles data';
        setError(new Error(error));
      }
    } catch (error) {
      console.error('Failed to load vehicles data:', error);
      setError(error as Error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadVehiclesData();
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  const handleRegisterVehicle = async () => {
    if (!newVehicle.vehicleNumber.trim() || !newVehicle.ownerName.trim()) {
      Alert.alert('Validation Error', 'Vehicle number and owner name are required');
      return;
    }

    if (!canManageVehicles) {
      Alert.alert('Permission Denied', 'You do not have permission to register vehicles');
      return;
    }

    try {
      setSubmitting(true);
      const response = await vehiclesService.registerVehicle(newVehicle);
      
      if (response.success) {
        // Reset form
        setNewVehicle({
          vehicleNumber: '',
          type: 'car',
          ownerType: 'visitor',
          ownerName: '',
          ownerPhone: '',
          expectedDepartureTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          parkingZone: 'visitor',
          notes: '',
        });
        
        setShowRegisterModal(false);
        
        Alert.alert('Vehicle Registered', 'Vehicle has been successfully registered and checked in');
        
        // Reload data to show the new vehicle
        await loadVehiclesData();
      } else {
        throw new Error(response.message || 'Failed to register vehicle');
      }
    } catch (error) {
      console.error('Failed to register vehicle:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to register vehicle. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVehicleDeparture = async (vehicleId: string) => {
    if (!canManageVehicles) {
      Alert.alert('Permission Denied', 'You do not have permission to process vehicle departures');
      return;
    }

    Alert.prompt(
      'Vehicle Departure',
      'Add any departure notes (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          onPress: async (notes) => {
            try {
              const response = await vehiclesService.registerDeparture(vehicleId, {
                notes: notes || '',
                verifiedBy: user?.id || 'security',
              });
              
              if (response.success) {
                Alert.alert('Vehicle Checked Out', 'Vehicle has been successfully checked out');
                await loadVehiclesData();
              } else {
                throw new Error(response.message || 'Failed to check out vehicle');
              }
            } catch (error) {
              console.error('Failed to check out vehicle:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to check out vehicle. Please try again.'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleFlagVehicle = async (vehicleId: string) => {
    Alert.prompt(
      'Flag Vehicle',
      'Please provide a reason for flagging this vehicle:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          onPress: async (reason) => {
            try {
              const response = await vehiclesService.flagVehicle(vehicleId, {
                reason: reason || 'Security concern',
                flaggedBy: user?.id || 'security',
              });
              
              if (response.success) {
                Alert.alert('Vehicle Flagged', 'Vehicle has been flagged for security review');
                await loadVehiclesData();
              } else {
                throw new Error(response.message || 'Failed to flag vehicle');
              }
            } catch (error) {
              console.error('Failed to flag vehicle:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to flag vehicle. Please try again.'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const getVehicleTypeIcon = (type: SecurityVehicle['type']) => {
    return <Car size={16} color="#374151" />;
  };

  const getStatusColor = (status: SecurityVehicle['status']) => {
    switch (status) {
      case 'parked': return '#16a34a';
      case 'overstay': return '#f59e0b';
      case 'flagged': return '#dc2626';
      case 'blacklisted': return '#7f1d1d';
      case 'departed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: SecurityVehicle['status']) => {
    switch (status) {
      case 'parked':
        return <CheckCircle size={16} color="#16a34a" />;
      case 'overstay':
        return <Timer size={16} color="#f59e0b" />;
      case 'flagged':
        return <AlertTriangle size={16} color="#dc2626" />;
      case 'blacklisted':
        return <Shield size={16} color="#7f1d1d" />;
      default:
        return <CheckCircle size={16} color="#6b7280" />;
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  // Permission check - only security guards can access
  if (!user || (user.role !== 'security_guard' && user.role !== 'super_admin')) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Car size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Security Access Required
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          This area is restricted to security personnel only.
        </Text>
        <Button
          onPress={() => router.replace('/(tabs)/')}
          variant="primary"
          className="mt-6"
        >
          Return to Dashboard
        </Button>
      </View>
    );
  }

  const vehicles = vehiclesState.data?.vehicles || [];
  const stats = vehiclesState.data?.stats;
  const parkedVehicles = vehicles.filter(v => v.status === 'parked');
  const overstayVehicles = vehicles.filter(v => v.status === 'overstay');

  // Registration Modal Component
  const RegistrationModal = () => (
    <Modal visible={showRegisterModal} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-gray-900">Register Vehicle</Text>
            <TouchableOpacity onPress={() => setShowRegisterModal(false)}>
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">Register a new vehicle entry</Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <Card className="p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</Text>

            <Input
              label="Vehicle Number *"
              value={newVehicle.vehicleNumber}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, vehicleNumber: value.toUpperCase() }))}
              placeholder="KA01AB1234"
              className="mb-4"
            />

            {/* Vehicle Type */}
            <Text className="text-sm font-medium text-gray-900 mb-2">Vehicle Type</Text>
            <View className="flex-row flex-wrap mb-4 gap-2">
              {[
                { key: 'car', label: 'Car' },
                { key: 'bike', label: 'Bike' },
                { key: 'bicycle', label: 'Bicycle' },
                { key: 'auto', label: 'Auto' },
                { key: 'truck', label: 'Truck' },
                { key: 'other', label: 'Other' }
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={newVehicle.type === type.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewVehicle(prev => ({ ...prev, type: type.key as any }))}
                >
                  {type.label}
                </Button>
              ))}
            </View>

            {/* Owner Type */}
            <Text className="text-sm font-medium text-gray-900 mb-2">Owner Type</Text>
            <View className="flex-row flex-wrap mb-4 gap-2">
              {[
                { key: 'visitor', label: 'Visitor' },
                { key: 'resident', label: 'Resident' },
                { key: 'service', label: 'Service' },
                { key: 'delivery', label: 'Delivery' },
                { key: 'vendor', label: 'Vendor' }
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={newVehicle.ownerType === type.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewVehicle(prev => ({ ...prev, ownerType: type.key as any }))}
                >
                  {type.label}
                </Button>
              ))}
            </View>

            <Input
              label="Owner Name *"
              value={newVehicle.ownerName}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, ownerName: value }))}
              placeholder="Enter owner name"
              className="mb-4"
            />

            <Input
              label="Owner Phone"
              value={newVehicle.ownerPhone}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, ownerPhone: value }))}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              className="mb-4"
            />

            <Input
              label="Parking Zone"
              value={newVehicle.parkingZone}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, parkingZone: value }))}
              placeholder="visitor, resident, service"
              className="mb-4"
            />

            <Input
              label="Notes"
              value={newVehicle.notes}
              onChangeText={(value) => setNewVehicle(prev => ({ ...prev, notes: value }))}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
            />
          </Card>

          <View className="flex-row space-x-3">
            <Button
              variant="outline"
              size="lg"
              onPress={() => setShowRegisterModal(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onPress={handleRegisterVehicle}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <View className="flex-row items-center">
                  <LoadingSpinner size="small" color="#ffffff" className="mr-2" />
                  <Text className="text-white">Registering...</Text>
                </View>
              ) : (
                'Register Vehicle'
              )}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <LoadingWrapper
      isLoading={vehiclesState.isLoading}
      error={vehiclesState.error}
      onRetry={loadVehiclesData}
      skeletonProps={{ type: 'card', count: 3 }}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
                <ArrowLeft size={20} color="#6b7280" />
              </TouchableOpacity>
              <Car size={24} color="#2563eb" />
              <Text className="text-2xl font-bold text-gray-900 ml-2">
                Vehicle Management
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowRegisterModal(true)}
              className="p-2"
              disabled={!canManageVehicles}
            >
              <Plus size={24} color={canManageVehicles ? "#2563eb" : "#9ca3af"} />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600">
            Vehicle registration and parking management
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Statistics */}
          {stats && (
            <View className="px-4 py-4 bg-white border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Parking Overview</Text>
              
              <View className="flex-row flex-wrap gap-3 mb-4">
                <Card className="flex-1 min-w-[120px] p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Car size={20} color="#16a34a" />
                    <Text className="text-xl font-bold text-gray-900">
                      {stats.totalParked}
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-gray-900">Currently Parked</Text>
                </Card>

                <Card className="flex-1 min-w-[120px] p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Timer size={20} color="#f59e0b" />
                    <Text className="text-xl font-bold text-gray-900">
                      {stats.overstayCount}
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-gray-900">Overstaying</Text>
                </Card>

                <Card className="flex-1 min-w-[120px] p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Users size={20} color="#2563eb" />
                    <Text className="text-xl font-bold text-gray-900">
                      {stats.todayEntries}
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-gray-900">Today's Entries</Text>
                </Card>

                <Card className="flex-1 min-w-[120px] p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <TrendingUp size={20} color="#7c3aed" />
                    <Text className="text-xl font-bold text-gray-900">
                      {stats.occupancyRate}%
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-gray-900">Occupancy</Text>
                </Card>
              </View>
            </View>
          )}

          {/* Filter Controls */}
          <View className="px-4 py-3 bg-white border-b border-gray-200">
            <View className="flex-row space-x-2">
              {[
                { key: 'all', label: 'All', count: vehiclesState.data?.totalCount || 0 },
                { key: 'parked', label: 'Parked', count: stats?.totalParked || 0 },
                { key: 'overstay', label: 'Overstay', count: stats?.overstayCount || 0 },
                { key: 'departed', label: 'Departed', count: stats?.todayDepartures || 0 },
              ].map((status) => (
                <Button
                  key={status.key}
                  variant={filters.status === status.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setFilters(prev => ({ ...prev, status: status.key as any }))}
                  className="flex-1"
                >
                  <Text className="text-xs">
                    {status.label} ({status.count})
                  </Text>
                </Button>
              ))}
            </View>
          </View>

          {/* Overstay Alert */}
          {overstayVehicles.length > 0 && (
            <View className="px-4 py-3 bg-amber-50 border-b border-amber-200">
              <View className="flex-row items-center">
                <Timer size={20} color="#f59e0b" />
                <Text className="text-amber-900 font-semibold ml-2">
                  {overstayVehicles.length} Vehicle{overstayVehicles.length > 1 ? 's' : ''} Overstaying
                </Text>
              </View>
              <Text className="text-amber-700 text-sm mt-1">
                Please check with vehicle owners or take appropriate action
              </Text>
            </View>
          )}

          {/* Vehicles List */}
          <View className="px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Vehicles ({vehicles.length})
            </Text>
            
            {vehicles.length === 0 ? (
              <Card className="p-6">
                <View className="items-center">
                  <Car size={48} color="#9ca3af" />
                  <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                    No Vehicles Found
                  </Text>
                  <Text className="text-gray-600 text-center">
                    No vehicles match your current filter criteria.
                  </Text>
                </View>
              </Card>
            ) : (
              <View className="space-y-3">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="p-4">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          {getVehicleTypeIcon(vehicle.type)}
                          <Text className="text-base font-bold text-gray-900 ml-2">
                            {vehicle.vehicleNumber}
                          </Text>
                          <Text className="text-xs text-gray-500 ml-2">
                            {vehicle.type}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-700 mb-1">
                          {vehicle.ownerName} • {vehicle.ownerType}
                        </Text>
                        {vehicle.parkingSpot && (
                          <View className="flex-row items-center mb-2">
                            <MapPin size={12} color="#6b7280" />
                            <Text className="text-xs text-gray-600 ml-1">
                              {vehicle.parkingSpot} - {vehicle.parkingZone}
                            </Text>
                          </View>
                        )}
                        <View className="flex-row items-center">
                          <Clock size={12} color="#6b7280" />
                          <Text className="text-xs text-gray-600 ml-1">
                            Parked: {formatDuration(vehicle.checkInTime)}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="items-end">
                        <View className="flex-row items-center mb-2">
                          {getStatusIcon(vehicle.status)}
                          <Text 
                            className="text-xs font-medium ml-1"
                            style={{ color: getStatusColor(vehicle.status) }}
                          >
                            {vehicle.status.toUpperCase()}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-400">
                          {new Date(vehicle.checkInTime).toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                      <View className="flex-row space-x-2">
                        {vehicle.status === 'parked' && (
                          <TouchableOpacity
                            onPress={() => handleVehicleDeparture(vehicle.id)}
                            className="px-3 py-1 bg-blue-50 rounded"
                          >
                            <Text className="text-xs text-blue-700 font-medium">Check Out</Text>
                          </TouchableOpacity>
                        )}
                        
                        {vehicle.status !== 'flagged' && (
                          <TouchableOpacity
                            onPress={() => handleFlagVehicle(vehicle.id)}
                            className="px-3 py-1 bg-red-50 rounded"
                          >
                            <Text className="text-xs text-red-700 font-medium">Flag</Text>
                          </TouchableOpacity>
                        )}
                        
                        {vehicle.ownerPhone && (
                          <TouchableOpacity className="px-3 py-1 bg-gray-50 rounded">
                            <Text className="text-xs text-gray-700 font-medium">Call Owner</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      {vehicle.expectedDepartureTime && (
                        <Text className="text-xs text-gray-500">
                          Expected: {new Date(vehicle.expectedDepartureTime).toLocaleTimeString()}
                        </Text>
                      )}
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Registration Modal */}
        <RegistrationModal />
      </View>
    </LoadingWrapper>
  );
};

SecurityVehicleManagement.displayName = 'SecurityVehicleManagement';

export default SecurityVehicleManagement;