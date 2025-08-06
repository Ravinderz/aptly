import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Building2,
  Users,
  Settings,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useDirectSociety } from '@/hooks/useDirectSociety';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SuperAdminGate } from '@/components/admin/SuperAdminGate';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { cn } from '@/utils/cn';

interface SocietyDetails {
  id: string;
  name: string;
  code: string;
  address: string;
  totalFlats: number;
  occupiedFlats: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  adminContact: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  lastActivity: string;
  managerAssignments: {
    id: string;
    managerName: string;
    assignmentType: 'permanent' | 'temporary' | 'interim';
    startDate: string;
    endDate?: string;
    isActive: boolean;
  }[];
  metrics: {
    totalResidents: number;
    activeTickets: number;
    monthlyRevenue: number;
    satisfactionScore: number;
  };
}

/**
 * Individual Society Details Page
 * 
 * Features:
 * - Complete society information display
 * - Manager assignment management
 * - Society metrics and analytics
 * - Status management
 * - Activity history
 */
export default function SocietyDetails() {
  const router = useRouter();
  const { societyId } = useLocalSearchParams<{ societyId: string }>();
  const { user } = useDirectAuth();
  const { checkPermission } = useDirectAdmin();
  const { societies, loading } = useDirectSociety();
  
  const [refreshing, setRefreshing] = useState(false);
  const [society, setSociety] = useState<SocietyDetails | null>(null);

  // Mock data for development - replace with actual API call
  const mockSociety: SocietyDetails = {
    id: societyId || 'society-123',
    name: 'Green Valley Apartments',
    code: 'GVA001',
    address: '123 Green Valley Road, Sector 15, Gurugram, Haryana 122001',
    totalFlats: 150,
    occupiedFlats: 142,
    status: 'active',
    adminContact: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@greenvalley.com',
    },
    createdAt: '2023-01-15T10:30:00Z',
    lastActivity: '2024-01-15T14:22:00Z',
    managerAssignments: [
      {
        id: 'assignment-1',
        managerName: 'Manager Johnson',
        assignmentType: 'permanent',
        startDate: '2023-06-01',
        isActive: true,
      },
    ],
    metrics: {
      totalResidents: 425,
      activeTickets: 12,
      monthlyRevenue: 850000,
      satisfactionScore: 4.2,
    },
  };

  useEffect(() => {
    loadSocietyDetails();
  }, [societyId]);

  const loadSocietyDetails = async () => {
    try {
      // In production, this would be an API call
      // const response = await adminService.getSocietyDetails(societyId);
      setSociety(mockSociety);
    } catch (error) {
      console.error('Error loading society details:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSocietyDetails();
    setRefreshing(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Update society status
      console.log('Updating society status to:', newStatus);
      // await adminService.updateSocietyStatus(societyId, newStatus);
      await loadSocietyDetails();
    } catch (error) {
      console.error('Error updating society status:', error);
    }
  };

  const handleAssignManager = () => {
    router.push({
      pathname: '/admin/managers',
      params: { societyId, action: 'assign' }
    });
  };

  if (!society) {
    return (
      <SuperAdminGate>
        <View className="flex-1 justify-center items-center bg-gray-50">
          <Text className="text-gray-600">Loading society details...</Text>
        </View>
      </SuperAdminGate>
    );
  }

  const occupancyRate = Math.round((society.occupiedFlats / society.totalFlats) * 100);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'suspended': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <SuperAdminGate>
      <View className="flex-1 bg-gray-50">
        <AdminHeader 
          title={society.name}
          showBack
          onBack={() => router.back()}
        />
        
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Society Header Card */}
          <Card className="m-4 mb-2">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                  {society.name}
                </Text>
                <Text className="text-gray-600 mb-2">Code: {society.code}</Text>
                <StatusBadge status={society.status} />
              </View>
              
              {checkPermission('societies', 'update') && (
                <TouchableOpacity className="p-2">
                  <Edit size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#6b7280" />
              <Text className="text-gray-700 ml-2 flex-1">{society.address}</Text>
            </View>

            <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-200">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">{society.totalFlats}</Text>
                <Text className="text-gray-600 text-sm">Total Flats</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">{society.occupiedFlats}</Text>
                <Text className="text-gray-600 text-sm">Occupied</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">{occupancyRate}%</Text>
                <Text className="text-gray-600 text-sm">Occupancy</Text>
              </View>
            </View>
          </Card>

          {/* Metrics Cards */}
          <View className="flex-row mx-4 mb-4">
            <Card className="flex-1 mr-2">
              <View className="items-center">
                <Users size={24} color="#3b82f6" />
                <Text className="text-xl font-bold text-gray-900 mt-2">
                  {society.metrics.totalResidents}
                </Text>
                <Text className="text-gray-600 text-sm">Residents</Text>
              </View>
            </Card>
            
            <Card className="flex-1 ml-2">
              <View className="items-center">
                <AlertTriangle size={24} color="#f59e0b" />
                <Text className="text-xl font-bold text-gray-900 mt-2">
                  {society.metrics.activeTickets}
                </Text>
                <Text className="text-gray-600 text-sm">Open Tickets</Text>
              </View>
            </Card>
          </View>

          {/* Admin Contact */}
          <Card className="mx-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Society Admin Contact
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Users size={16} color="#6b7280" />
                <Text className="text-gray-700 ml-3">{society.adminContact.name}</Text>
              </View>
              
              <View className="flex-row items-center">
                <Phone size={16} color="#6b7280" />
                <Text className="text-gray-700 ml-3">{society.adminContact.phone}</Text>
              </View>
              
              <View className="flex-row items-center">
                <Mail size={16} color="#6b7280" />
                <Text className="text-gray-700 ml-3">{society.adminContact.email}</Text>
              </View>
            </View>
          </Card>

          {/* Manager Assignments */}
          <Card className="mx-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Manager Assignments
              </Text>
              
              {checkPermission('managers', 'assign') && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleAssignManager}
                >
                  Assign Manager
                </Button>
              )}
            </View>

            {society.managerAssignments.length > 0 ? (
              <View className="space-y-3">
                {society.managerAssignments.map((assignment) => (
                  <View
                    key={assignment.id}
                    className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {assignment.managerName}
                      </Text>
                      <Text className="text-sm text-gray-600 capitalize">
                        {assignment.assignmentType} • Since {assignment.startDate}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      {assignment.isActive ? (
                        <CheckCircle size={16} color="#22c55e" />
                      ) : (
                        <AlertTriangle size={16} color="#f59e0b" />
                      )}
                      <Text className={cn(
                        "text-sm ml-1",
                        assignment.isActive ? "text-green-600" : "text-yellow-600"
                      )}>
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Shield size={32} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No managers assigned</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Assign a community manager to help manage this society
                </Text>
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          {checkPermission('societies', 'update') && (
            <Card className="mx-4 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Society Management
              </Text>
              
              <View className="space-y-3">
                <Button
                  variant="outline"
                  onPress={() => handleStatusChange('suspended')}
                  className="w-full"
                >
                  <AlertTriangle size={16} color="#f59e0b" />
                  <Text className="ml-2">Suspend Society</Text>
                </Button>
                
                <Button
                  variant="outline"
                  onPress={() => handleStatusChange('active')}
                  className="w-full"
                >
                  <CheckCircle size={16} color="#22c55e" />
                  <Text className="ml-2">Activate Society</Text>
                </Button>
              </View>
            </Card>
          )}
        </ScrollView>
      </View>
    </SuperAdminGate>
  );
}