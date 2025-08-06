import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Plus,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { cn } from '@/utils/cn';

interface AssignedSociety {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  activeIssues: number;
  resolvedIssues: number;
  lastActivity: string;
  healthScore: number; // 0-100
  status: 'healthy' | 'attention_needed' | 'critical';
  assignedDate: string;
  managerNotes?: string;
  primaryContact: {
    name: string;
    phone: string;
    email: string;
  };
}

type FilterStatus = 'all' | 'healthy' | 'attention_needed' | 'critical';

/**
 * Manager Societies - Overview of all assigned societies for community manager
 * 
 * Features:
 * - List of assigned societies with health status
 * - Performance metrics per society
 * - Quick actions for society management
 * - Filtering and search capabilities
 */
function ManagerSocieties() {
  const router = useRouter();
  const { user } = useDirectAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [societies, setSocieties] = useState<AssignedSociety[]>([]);
  const [filteredSocieties, setFilteredSocieties] = useState<AssignedSociety[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAssignedSocieties();
  }, []);

  useEffect(() => {
    filterSocieties();
  }, [societies, filterStatus, searchQuery]);

  const loadAssignedSocieties = async () => {
    try {
      // Mock data - replace with actual API call to get manager's assigned societies
      const mockSocieties: AssignedSociety[] = [
        {
          id: '1',
          name: 'Green Valley Society',
          address: '123 Garden Street, Mumbai',
          totalUnits: 150,
          occupiedUnits: 142,
          activeIssues: 3,
          resolvedIssues: 47,
          lastActivity: '2 hours ago',
          healthScore: 85,
          status: 'healthy',
          assignedDate: '2024-01-15',
          managerNotes: 'Good engagement, proactive residents',
          primaryContact: {
            name: 'John Doe',
            phone: '+91-9876543210',
            email: 'john@greenvalley.com',
          },
        },
        {
          id: '2',
          name: 'Sunrise Apartments',
          address: '456 East Wing, Pune',
          totalUnits: 200,
          occupiedUnits: 185,
          activeIssues: 8,
          resolvedIssues: 32,
          lastActivity: '1 day ago',
          healthScore: 65,
          status: 'attention_needed',
          assignedDate: '2024-02-01',
          managerNotes: 'Multiple maintenance issues, needs attention',
          primaryContact: {
            name: 'Sarah Smith',
            phone: '+91-9876543211',
            email: 'sarah@sunrise.com',
          },
        },
        {
          id: '3',
          name: 'Metro Heights',
          address: '789 Central Avenue, Delhi',
          totalUnits: 100,
          occupiedUnits: 95,
          activeIssues: 1,
          resolvedIssues: 23,
          lastActivity: '3 hours ago',
          healthScore: 92,
          status: 'healthy',
          assignedDate: '2024-01-20',
          primaryContact: {
            name: 'Mike Johnson',
            phone: '+91-9876543212',
            email: 'mike@metroheights.com',
          },
        },
        {
          id: '4',
          name: 'Royal Gardens',
          address: '321 Park Lane, Bangalore',
          totalUnits: 75,
          occupiedUnits: 68,
          activeIssues: 15,
          resolvedIssues: 8,
          lastActivity: '5 days ago',
          healthScore: 35,
          status: 'critical',
          assignedDate: '2024-02-10',
          managerNotes: 'Critical issues with water supply and security',
          primaryContact: {
            name: 'Lisa Brown',
            phone: '+91-9876543213',
            email: 'lisa@royalgardens.com',
          },
        },
      ];
      
      setSocieties(mockSocieties);
    } catch (error) {
      console.error('Failed to load assigned societies:', error);
    }
  };

  const filterSocieties = () => {
    let filtered = [...societies];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(society => society.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(society =>
        society.name.toLowerCase().includes(query) ||
        society.address.toLowerCase().includes(query)
      );
    }

    setFilteredSocieties(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAssignedSocieties();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: AssignedSociety['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'attention_needed': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: AssignedSociety['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 border-green-200';
      case 'attention_needed': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: AssignedSociety['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} color="#059669" />;
      case 'attention_needed': return <AlertCircle size={16} color="#d97706" />;
      case 'critical': return <AlertCircle size={16} color="#dc2626" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const getFilterCount = (status: FilterStatus) => {
    if (status === 'all') return societies.length;
    return societies.filter(s => s.status === status).length;
  };

  // Role check - only community managers can access
  if (!user || user.role !== 'community_manager') {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Building2 size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Community Manager Access Required
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          This area is restricted to community managers only.
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

  return (
    <View className="flex-1 bg-gray-50">
      <AdminHeader 
        title="My Societies" 
        subtitle={`Managing ${societies.length} assigned societies`}
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
        {/* Summary Stats */}
        <View className="px-4 py-2">
          <View className="flex-row flex-wrap gap-3 mb-4">
            <Card className="flex-1 min-w-[120px] p-3">
              <Text className="text-lg font-bold text-gray-900">
                {societies.length}
              </Text>
              <Text className="text-sm text-gray-600">Total Societies</Text>
            </Card>
            
            <Card className="flex-1 min-w-[120px] p-3">
              <Text className="text-lg font-bold text-gray-900">
                {societies.reduce((sum, s) => sum + s.totalUnits, 0)}
              </Text>
              <Text className="text-sm text-gray-600">Total Units</Text>
            </Card>
            
            <Card className="flex-1 min-w-[120px] p-3">
              <Text className="text-lg font-bold text-gray-900">
                {societies.reduce((sum, s) => sum + s.activeIssues, 0)}
              </Text>
              <Text className="text-sm text-gray-600">Active Issues</Text>
            </Card>
          </View>
        </View>

        {/* Filters */}
        <View className="px-4 py-2">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Filter by Status
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2 pb-2">
              <FilterPill
                label="All"
                selected={filterStatus === 'all'}
                count={getFilterCount('all')}
                onPress={() => setFilterStatus('all')}
              />
              <FilterPill
                label="Healthy"
                selected={filterStatus === 'healthy'}
                count={getFilterCount('healthy')}
                onPress={() => setFilterStatus('healthy')}
              />
              <FilterPill
                label="Needs Attention"
                selected={filterStatus === 'attention_needed'}
                count={getFilterCount('attention_needed')}
                onPress={() => setFilterStatus('attention_needed')}
              />
              <FilterPill
                label="Critical"
                selected={filterStatus === 'critical'}
                count={getFilterCount('critical')}
                onPress={() => setFilterStatus('critical')}
              />
            </View>
          </ScrollView>
        </View>

        {/* Societies List */}
        <View className="px-4 py-2">
          <View className="space-y-3">
            {filteredSocieties.map((society) => (
              <TouchableOpacity
                key={society.id}
                onPress={() => router.push(`/manager/societies/${society.id}/`)}
              >
                <Card className={cn("p-4", getStatusBgColor(society.status))}>
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {society.name}
                      </Text>
                      <Text className="text-sm text-gray-600 mb-2">
                        {society.address}
                      </Text>
                      <View className="flex-row items-center">
                        {getStatusIcon(society.status)}
                        <Text className={cn("text-sm font-medium ml-1", getStatusColor(society.status))}>
                          {society.status.replace('_', ' ').toUpperCase()}
                        </Text>
                        <Text className="text-sm text-gray-500 ml-2">
                          Health: {society.healthScore}%
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-xs text-gray-500 mb-1">
                        Assigned: {new Date(society.assignedDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Metrics */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <User size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {society.occupiedUnits}/{society.totalUnits} units
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <AlertCircle size={16} color="#dc2626" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {society.activeIssues} active issues
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                      <CheckCircle size={16} color="#059669" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {society.resolvedIssues} resolved
                      </Text>
                    </View>
                  </View>

                  {/* Primary Contact */}
                  <View className="border-t border-gray-200 pt-3 mt-3">
                    <Text className="text-xs text-gray-500 mb-1">Primary Contact</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {society.primaryContact.name}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {society.primaryContact.phone} • {society.primaryContact.email}
                    </Text>
                  </View>

                  {/* Manager Notes */}
                  {society.managerNotes && (
                    <View className="mt-3 bg-white bg-opacity-50 p-2 rounded">
                      <Text className="text-xs text-gray-500 mb-1">Notes</Text>
                      <Text className="text-sm text-gray-700">
                        {society.managerNotes}
                      </Text>
                    </View>
                  )}

                  {/* Last Activity */}
                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-xs text-gray-500">
                      Last activity: {society.lastActivity}
                    </Text>
                    <View className="flex-row items-center">
                      <Clock size={12} color="#6b7280" />
                      <Text className="text-xs text-gray-500 ml-1">
                        View Details →
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {filteredSocieties.length === 0 && (
            <Card className="p-8 items-center">
              <Building2 size={48} color="#6b7280" />
              <Text className="text-gray-600 mt-4 text-center">
                No societies found matching your criteria
              </Text>
              {filterStatus !== 'all' && (
                <Button
                  onPress={() => setFilterStatus('all')}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Add proper named export with displayName for React DevTools
ManagerSocieties.displayName = 'ManagerSocieties';

export default ManagerSocieties;