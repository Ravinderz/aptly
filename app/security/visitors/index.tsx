import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  RefreshControl 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { 
  Search, 
  UserPlus, 
  Filter,
  Users,
  Clock,
  MapPin,
  Phone,
  Car,
  AlertTriangle,
  Timer,
  ArrowRight
} from 'lucide-react-native';
import type { SecurityVisitor } from '@/types/security';

type FilterType = 'all' | 'inside' | 'pending' | 'overstay' | 'scheduled' | 'checked_out';

/**
 * Visitor Management Interface - Phase 2
 * 
 * Features:
 * - Real-time visitor list with search
 * - Status-based filtering 
 * - Quick action buttons
 * - Overstay alerts
 * - Pending approval management
 */
const VisitorManagement = () => {
  const params = useLocalSearchParams();
  const initialFilter = (params.filter as FilterType) || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - will be replaced with real API calls
  const [visitors] = useState<SecurityVisitor[]>([
    {
      id: '1',
      name: 'John Doe',
      phoneNumber: '+91-9876543210',
      purpose: 'Meeting with resident',
      hostFlatNumber: 'A-204',
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      expectedCheckOutTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      status: 'inside',
      gateNumber: '1',
      createdBy: 'guard1',
      societyCode: 'APT001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      securityInfo: {
        idVerified: true,
        idType: 'license',
        idNumber: 'DL123456789',
        checkInBy: 'guard1',
        vehicleInfo: {
          type: 'car',
          number: 'KA-01-AB-1234',
          make: 'Honda',
          model: 'City',
          color: 'White'
        }
      },
      timing: {
        scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        actualCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expectedDuration: 3,
        expectedCheckOut: new Date(Date.now() + 1 * 60 * 60 * 1000),
        overstayThreshold: new Date(Date.now() + 2 * 60 * 60 * 1000),
        overstayNotified: false
      },
      auditLog: [],
      visitInfo: {
        purpose: 'meeting',
        description: 'Business meeting',
        hostResident: {
          id: 'resident1',
          name: 'Resident Name',
          unit: 'A-204',
          phone: '+91-9876543210'
        },
        approvalRequired: false
      }
    },
    {
      id: '2',
      name: 'Sarah Smith',
      phoneNumber: '+91-9876543211',
      purpose: 'Delivery',
      hostFlatNumber: 'B-105',
      checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      expectedCheckOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (overstay)
      status: 'overstay',
      gateNumber: '2',
      createdBy: 'guard1',
      societyCode: 'APT001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      securityInfo: {
        idVerified: true,
        idType: 'national_id',
        checkInBy: 'guard1',
        securityNotes: 'Package delivery - overstaying'
      },
      timing: {
        scheduledTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actualCheckIn: new Date(Date.now() - 4 * 60 * 60 * 1000),
        expectedDuration: 2,
        expectedCheckOut: new Date(Date.now() - 1 * 60 * 60 * 1000),
        overstayThreshold: new Date(Date.now() - 30 * 60 * 1000),
        overstayNotified: true
      },
      auditLog: [],
      visitInfo: {
        purpose: 'delivery',
        description: 'Package delivery',
        hostResident: {
          id: 'resident2',
          name: 'Another Resident',
          unit: 'B-105',
          phone: '+91-9876543211'
        },
        approvalRequired: false
      }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      phoneNumber: '+91-9876543212',
      purpose: 'Scheduled visit',
      hostFlatNumber: 'C-301',
      expectedCheckOutTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'pending',
      gateNumber: '1',
      createdBy: 'guard1',
      societyCode: 'APT001',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      securityInfo: {
        idVerified: true,
        idType: 'passport',
        checkInBy: 'guard1'
      },
      timing: {
        scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
        expectedDuration: 2,
        expectedCheckOut: new Date(Date.now() + 3 * 60 * 60 * 1000),
        overstayThreshold: new Date(Date.now() + 4 * 60 * 60 * 1000),
        overstayNotified: false
      },
      auditLog: [],
      visitInfo: {
        purpose: 'meeting',
        description: 'Scheduled meeting',
        hostResident: {
          id: 'resident3',
          name: 'Host Resident',
          unit: 'C-301',
          phone: '+91-9876543212'
        },
        approvalRequired: true,
        approvalStatus: 'pending'
      }
    }
  ]);

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: visitors.length },
    { key: 'inside', label: 'Inside', count: visitors.filter(v => v.status === 'inside').length },
    { key: 'pending', label: 'Pending', count: visitors.filter(v => v.status === 'pending').length },
    { key: 'overstay', label: 'Overstaying', count: visitors.filter(v => v.status === 'overstay').length },
    { key: 'scheduled', label: 'Scheduled', count: visitors.filter(v => v.status === 'scheduled').length },
    { key: 'checked_out', label: 'Checked Out', count: visitors.filter(v => v.status === 'checked_out').length },
  ];

  const filteredVisitors = useMemo(() => {
    let filtered = visitors;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(visitor =>
        visitor.name.toLowerCase().includes(query) ||
        visitor.phoneNumber.includes(query) ||
        visitor.hostFlatNumber.toLowerCase().includes(query) ||
        visitor.purpose.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [visitors, activeFilter, searchQuery]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inside': return '#16a34a';
      case 'pending': return '#2563eb';
      case 'overstay': return '#dc2626';
      case 'scheduled': return '#f59e0b';
      case 'checked_out': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'inside': return '#f0fdf4';
      case 'pending': return '#eff6ff';
      case 'overstay': return '#fef2f2';
      case 'scheduled': return '#fffbeb';
      case 'checked_out': return '#f9fafb';
      default: return '#f9fafb';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Users size={24} color="#6366f1" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              Visitor Management
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/security/visitors/checkin')}
            className="p-2"
          >
            <UserPlus size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search visitors..."
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

      {/* Visitor List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredVisitors.length === 0 ? (
          <Card className="p-6 bg-white">
            <View className="items-center">
              <Users size={48} color="#9ca3af" />
              <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                No visitors found
              </Text>
              <Text className="text-gray-600 text-center">
                {searchQuery.trim() 
                  ? `No visitors match "${searchQuery}"` 
                  : activeFilter === 'all' 
                    ? 'No visitors registered today'
                    : `No visitors with status "${activeFilter}"`
                }
              </Text>
            </View>
          </Card>
        ) : (
          <View className="space-y-3">
            {filteredVisitors.map((visitor) => (
              <Card key={visitor.id} className="p-4 bg-white">
                <TouchableOpacity 
                  onPress={() => router.push(`/security/visitors/${visitor.id}`)}
                  className="flex-1"
                >
                  {/* Status Badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: getStatusBgColor(visitor.status) }}
                    >
                      <Text 
                        className="text-xs font-medium capitalize"
                        style={{ color: getStatusColor(visitor.status) }}
                      >
                        {visitor.status.replace('_', ' ')}
                      </Text>
                    </View>
                    
                    {visitor.status === 'overstay' && (
                      <View className="flex-row items-center">
                        <Timer size={16} color="#dc2626" />
                        <Text className="text-xs text-red-600 ml-1">Overstaying</Text>
                      </View>
                    )}
                  </View>

                  {/* Visitor Info */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900">
                        {visitor.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Phone size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                          {visitor.phoneNumber}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <MapPin size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                          Unit {visitor.hostFlatNumber} • {visitor.purpose}
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={20} color="#9ca3af" />
                  </View>

                  {/* Timing Info */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Clock size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-500 ml-1">
                        {visitor.checkInTime 
                          ? `In: ${formatTimeAgo(visitor.checkInTime)}`
                          : `Scheduled: ${formatTime(visitor.timing.scheduledTime)}`
                        }
                      </Text>
                    </View>

                    {visitor.securityInfo.vehicleInfo && (
                      <View className="flex-row items-center">
                        <Car size={14} color="#6b7280" />
                        <Text className="text-xs text-gray-500 ml-1">
                          {visitor.securityInfo.vehicleInfo.number}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Overstay Warning */}
                  {visitor.status === 'overstay' && (
                    <View className="flex-row items-center mt-2 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle size={16} color="#dc2626" />
                      <Text className="text-sm text-red-700 ml-2 flex-1">
                        Expected checkout: {formatTime(visitor.expectedCheckOutTime!)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions Footer */}
        <View className="mt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/security/visitors/checkin')}
          >
            <View className="flex-row items-center">
              <UserPlus size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">Check-in New Visitor</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

VisitorManagement.displayName = 'VisitorManagement';

export default VisitorManagement;