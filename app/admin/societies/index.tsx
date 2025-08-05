import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Search,
  Filter,
  Plus,
  Building2,
  Users,
  MapPin,
  Calendar,
  MoreVertical,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { useDirectSociety } from '@/hooks/useDirectSociety';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PillFilter } from '@/components/ui/PillFilter';
import { cn } from '@/utils/cn';

interface SocietyCardProps {
  society: any;
  onPress: () => void;
  onManage: () => void;
}

const SocietyCard: React.FC<SocietyCardProps> = ({ society, onPress, onManage }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 mb-3">
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {society.name}
            </Text>
            <Text className="text-sm text-gray-600">
              Code: {society.code}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <View className={cn(
              'px-2 py-1 rounded-full',
              getStatusColor(society.status)
            )}>
              <Text className="text-xs font-medium capitalize">
                {society.status}
              </Text>
            </View>
            
            <TouchableOpacity onPress={onManage} className="p-1">
              <MoreVertical size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <MapPin size={14} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2 flex-1">
            {society.address || 'Address not provided'}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Users size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {society.totalFlats || 0} units
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {society.createdAt ? new Date(society.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

/**
 * Society Management - Main page for managing societies
 * 
 * Features:
 * - List all societies with search and filtering
 * - Quick actions for society management
 * - Status updates and approvals
 * - Navigation to detailed society views
 */
function SocietyManagement() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { societies, loading: societyLoading, loadSocieties } = useDirectSociety();
  const { 
    searchQuery, 
    setSearchQuery,
    managementFilter,
    setManagementFilter,
    loading: adminLoading 
  } = useDirectAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  // Apply filter from URL params if provided
  useEffect(() => {
    if (params.filter) {
      setManagementFilter?.(params.filter as any);
    }
  }, [params.filter]);

  useEffect(() => {
    loadSocieties?.();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSocieties?.(true); // Force refresh
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchSubmit = () => {
    setSearchQuery?.(localSearchQuery);
  };

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'High Priority', value: 'high_priority' },
    { label: 'Issues', value: 'issues' },
  ];

  const filteredSocieties = societies?.filter((society) => {
    // Apply search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      const matches = 
        society.name?.toLowerCase().includes(query) ||
        society.code?.toLowerCase().includes(query) ||
        society.address?.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // Apply status filter
    switch (managementFilter) {
      case 'active':
        return society.status === 'active';
      case 'pending':
        return society.status === 'pending';
      case 'high_priority':
        return society.priority === 'high' || society.priority === 'critical';
      case 'issues':
        return society.status === 'suspended' || society.hasIssues;
      default:
        return true;
    }
  }) || [];

  const handleSocietyPress = (societyId: string) => {
    router.push(`/admin/societies/${societyId}`);
  };

  const handleManageSociety = (societyId: string) => {
    // Open management options modal or navigate to management page
    console.log('Manage society:', societyId);
  };

  const handleCreateSociety = () => {
    router.push('/admin/onboarding/');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="Society Management" 
        subtitle={`${filteredSocieties.length} societies`}
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
                value={localSearchQuery}
                onChangeText={setLocalSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                placeholder="Search societies..."
                className="flex-1 ml-2 text-gray-900"
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity 
              onPress={handleCreateSociety}
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
                  selected={managementFilter === option.value}
                  onPress={() => setManagementFilter?.(option.value as any)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Statistics */}
        <View className="px-4 py-4 bg-white mb-2">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">
                {societies?.filter(s => s.status === 'active').length || 0}
              </Text>
              <Text className="text-sm text-gray-600">Active</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-yellow-600">
                {societies?.filter(s => s.status === 'pending').length || 0}
              </Text>
              <Text className="text-sm text-gray-600">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-red-600">
                {societies?.filter(s => s.status === 'suspended').length || 0}
              </Text>
              <Text className="text-sm text-gray-600">Issues</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">
                {societies?.reduce((sum, s) => sum + (s.totalFlats || 0), 0) || 0}
              </Text>
              <Text className="text-sm text-gray-600">Total Units</Text>
            </View>
          </View>
        </View>

        {/* Society List */}
        <View className="px-4">
          {(societyLoading || adminLoading) && !refreshing ? (
            <View className="space-y-3">
              {[1, 2, 3].map((index) => (
                <Card key={index} className="p-4">
                  <View className="animate-pulse">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <View className="w-32 h-5 bg-gray-200 rounded mb-2" />
                        <View className="w-20 h-4 bg-gray-200 rounded" />
                      </View>
                      <View className="w-16 h-6 bg-gray-200 rounded" />
                    </View>
                    <View className="w-full h-4 bg-gray-200 rounded mb-2" />
                    <View className="flex-row justify-between">
                      <View className="w-16 h-4 bg-gray-200 rounded" />
                      <View className="w-20 h-4 bg-gray-200 rounded" />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          ) : filteredSocieties.length > 0 ? (
            <View>
              {filteredSocieties.map((society) => (
                <SocietyCard
                  key={society.id}
                  society={society}
                  onPress={() => handleSocietyPress(society.id)}
                  onManage={() => handleManageSociety(society.id)}
                />
              ))}
            </View>
          ) : (
            <Card className="p-8 items-center">
              <Building2 size={48} color="#6b7280" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
                {localSearchQuery ? 'No societies found' : 'No societies yet'}
              </Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">
                {localSearchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Start by reviewing onboarding applications'
                }
              </Text>
              <Button
                onPress={localSearchQuery ? () => {
                  setLocalSearchQuery('');
                  setSearchQuery?.('');
                } : handleCreateSociety}
                variant="primary"
              >
                {localSearchQuery ? 'Clear Search' : 'Review Applications'}
              </Button>
            </Card>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}

// Fixed: Add proper named export with displayName for React DevTools
SocietyManagement.displayName = 'SocietyManagement';

// Export as default
export default SocietyManagement;