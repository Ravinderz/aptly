import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  UserCheck,
  Users,
  Building2,
  Calendar,
  Star,
  MoreVertical,
  X,
  User,
  Mail,
  Phone,
} from 'lucide-react-native';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PillFilter } from '@/components/ui/PillFilter';
import { cn } from '@/utils/cn';

// Mock data for manager assignments
const mockAssignments = [
  {
    id: 'assign-1',
    societyId: 'society-1',
    societyName: 'Green Valley Apartments',
    managerId: 'manager-1',
    managerName: 'Rajesh Kumar',
    managerEmail: 'rajesh@aptly.com',
    managerPhone: '+91-9876543210',
    assignmentType: 'permanent',
    startDate: '2024-01-01',
    isActive: true,
    performanceScore: 4.8,
    totalSocieties: 3,
    assignedBy: 'admin-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'assign-2',
    societyId: 'society-2',
    societyName: 'Blue Ridge Society',
    managerId: 'manager-2',
    managerName: 'Priya Sharma',
    managerEmail: 'priya@aptly.com',
    managerPhone: '+91-9876543211',
    assignmentType: 'temporary',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    isActive: true,
    performanceScore: 4.6,
    totalSocieties: 2,
    assignedBy: 'admin-1',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

const mockAvailableManagers = [
  {
    id: 'manager-3',
    name: 'Amit Patel',
    email: 'amit@aptly.com',
    phone: '+91-9876543212',
    experience: '5 years',
    currentSocieties: 1,
    maxSocieties: 5,
    performanceScore: 4.9,
    specializations: ['Financial Management', 'Maintenance'],
    availability: 'available',
  },
  {
    id: 'manager-4',
    name: 'Sneha Gupta',
    email: 'sneha@aptly.com',
    phone: '+91-9876543213',
    experience: '3 years',
    currentSocieties: 2,
    maxSocieties: 4,
    performanceScore: 4.7,
    specializations: ['Community Relations', 'Event Management'],
    availability: 'available',
  },
];

interface AssignmentCardProps {
  assignment: any;
  onViewDetails: () => void;
  onManage: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onViewDetails,
  onManage,
}) => {
  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'permanent':
        return 'bg-green-100 text-green-800';
      case 'temporary':
        return 'bg-blue-100 text-blue-800';
      case 'interim':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 mb-3">
      <TouchableOpacity onPress={onViewDetails}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {assignment.societyName}
            </Text>
            <Text className="text-sm text-gray-600">
              Manager: {assignment.managerName}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <View className={cn(
              'px-2 py-1 rounded-full',
              getAssignmentTypeColor(assignment.assignmentType)
            )}>
              <Text className="text-xs font-medium capitalize">
                {assignment.assignmentType}
              </Text>
            </View>
            
            <TouchableOpacity onPress={onManage} className="p-1">
              <MoreVertical size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Mail size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {assignment.managerEmail}
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Phone size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">
            {assignment.managerPhone}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Star size={14} color="#f59e0b" />
            <Text className="text-sm text-gray-600 ml-1">
              {assignment.performanceScore}/5.0
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Building2 size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {assignment.totalSocieties} societies
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              Since {new Date(assignment.startDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {assignment.endDate && (
          <View className="mt-2 p-2 bg-blue-50 rounded-lg">
            <Text className="text-xs text-blue-800">
              Temporary assignment ends on {new Date(assignment.endDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

interface AssignManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onAssign: (managerId: string, societyId: string, assignmentType: string) => void;
  availableManagers: any[];
  societies: any[];
}

const AssignManagerModal: React.FC<AssignManagerModalProps> = ({
  visible,
  onClose,
  onAssign,
  availableManagers,
  societies,
}) => {
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedSociety, setSelectedSociety] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<string>('permanent');

  const handleAssign = () => {
    if (selectedManager && selectedSociety) {
      onAssign(selectedManager, selectedSociety, assignmentType);
      setSelectedManager('');
      setSelectedSociety('');
      setAssignmentType('permanent');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold">Assign Manager</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Select Manager */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Select Manager
            </Text>
            {availableManagers.map((manager) => (
              <TouchableOpacity
                key={manager.id}
                onPress={() => setSelectedManager(manager.id)}
                className={cn(
                  'p-3 rounded-lg border mb-2',
                  selectedManager === manager.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                )}
              >
                <Text className="font-medium text-gray-900">
                  {manager.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {manager.email} • {manager.experience}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Star size={12} color="#f59e0b" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {manager.performanceScore}/5.0 • {manager.currentSocieties}/{manager.maxSocieties} societies
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Select Society */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Select Society
            </Text>
            {societies.map((society) => (
              <TouchableOpacity
                key={society.id}
                onPress={() => setSelectedSociety(society.id)}
                className={cn(
                  'p-3 rounded-lg border mb-2',
                  selectedSociety === society.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                )}
              >
                <Text className="font-medium text-gray-900">
                  {society.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {society.code} • {society.totalFlats} units
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Assignment Type */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Assignment Type
            </Text>
            <View className="flex-row space-x-2">
              {['permanent', 'temporary', 'interim'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setAssignmentType(type)}
                  className={cn(
                    'px-4 py-2 rounded-lg border',
                    assignmentType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  )}
                >
                  <Text className={cn(
                    'text-sm font-medium capitalize',
                    assignmentType === type ? 'text-blue-700' : 'text-gray-700'
                  )}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Assign Manager"
            onPress={handleAssign}
            variant="primary"
            disabled={!selectedManager || !selectedSociety}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

/**
 * Manager Assignment Management - Assign and manage community managers
 * 
 * Features:
 * - List all manager assignments
 * - Assign managers to societies
 * - Track performance and workload
 * - Manage assignment types and duration
 */
export default function ManagerAssignment() {
  const router = useRouter();
  const [assignments, setAssignments] = useState(mockAssignments);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Permanent', value: 'permanent' },
    { label: 'Temporary', value: 'temporary' },
    { label: 'Interim', value: 'interim' },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches = 
        assignment.societyName.toLowerCase().includes(query) ||
        assignment.managerName.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      return assignment.assignmentType === statusFilter;
    }

    return true;
  });

  const handleViewAssignment = (assignmentId: string) => {
    // Navigate to assignment details
    console.log('View assignment:', assignmentId);
  };

  const handleManageAssignment = (assignmentId: string) => {
    // Open management options
    console.log('Manage assignment:', assignmentId);
  };

  const handleAssignManager = (managerId: string, societyId: string, assignmentType: string) => {
    const newAssignment = {
      id: `assign-${Date.now()}`,
      societyId,
      societyName: 'Selected Society', // This should come from actual society data
      managerId,
      managerName: 'Selected Manager', // This should come from actual manager data
      managerEmail: 'manager@aptly.com',
      managerPhone: '+91-9876543210',
      assignmentType,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
      performanceScore: 0,
      totalSocieties: 1,
      assignedBy: 'current-admin',
      createdAt: new Date().toISOString(),
    };

    setAssignments(prev => [...prev, newAssignment]);
  };

  const getAssignmentTypeCounts = () => {
    return {
      permanent: assignments.filter(a => a.assignmentType === 'permanent').length,
      temporary: assignments.filter(a => a.assignmentType === 'temporary').length,
      interim: assignments.filter(a => a.assignmentType === 'interim').length,
    };
  };

  const typeCounts = getAssignmentTypeCounts();

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Manager Assignments" 
        subtitle={`${filteredAssignments.length} active assignments`}
        showBack
        showNotifications
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search and Filters */}
        <View className="px-4 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg px-3 py-2 mr-3">
              <Search size={20} color="#6b7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search assignments..."
                className="flex-1 ml-2 text-gray-900"
              />
            </View>
            <TouchableOpacity 
              onPress={() => setShowAssignModal(true)}
              className="bg-blue-600 p-2 rounded-lg"
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {filterOptions.map((option) => (
                <PillFilter
                  key={option.value}
                  label={option.label}
                  selected={statusFilter === option.value}
                  onPress={() => setStatusFilter(option.value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Statistics */}
        <View className="px-4 py-4 bg-white mb-2">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-bold text-green-600">
                {typeCounts.permanent}
              </Text>
              <Text className="text-sm text-gray-600">Permanent</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-blue-600">
                {typeCounts.temporary}
              </Text>
              <Text className="text-sm text-gray-600">Temporary</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-yellow-600">
                {typeCounts.interim}
              </Text>
              <Text className="text-sm text-gray-600">Interim</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">
                {mockAvailableManagers.length}
              </Text>
              <Text className="text-sm text-gray-600">Available</Text>
            </View>
          </View>
        </View>

        {/* Assignment List */}
        <View className="px-4">
          {filteredAssignments.length > 0 ? (
            <View>
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onViewDetails={() => handleViewAssignment(assignment.id)}
                  onManage={() => handleManageAssignment(assignment.id)}
                />
              ))}
            </View>
          ) : (
            <Card className="p-8 items-center">
              <UserCheck size={48} color="#6b7280" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
                {searchQuery ? 'No assignments found' : 'No assignments yet'}
              </Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Start by assigning managers to societies'
                }
              </Text>
              <Button
                title="Assign Manager"
                onPress={() => setShowAssignModal(true)}
                variant="primary"
              />
            </Card>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Assign Manager Modal */}
      <AssignManagerModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignManager}
        availableManagers={mockAvailableManagers}
        societies={[]} // This should come from actual society data
      />
    </View>
  );
}