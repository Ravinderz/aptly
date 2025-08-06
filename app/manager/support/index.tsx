import { AdminHeader } from '@/components/admin/AdminHeader';
import { RequireManager } from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import FilterPill from '@/components/ui/FilterPill';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { cn } from '@/utils/cn';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  societyName: string;
  societyId: string;
  residentName: string;
  residentPhone: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'pending_response' | 'resolved';
  category: 'maintenance' | 'billing' | 'community' | 'security' | 'other';
  createdAt: string;
  updatedAt: string;
  responseTime?: number; // hours
}

type FilterStatus =
  | 'all'
  | 'open'
  | 'in_progress'
  | 'pending_response'
  | 'resolved';

const ManagerSupport = () => {
  const router = useRouter();
  const { user, logout } = useDirectAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    loadSupportTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, filterStatus]);

  const loadSupportTickets = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTickets: SupportTicket[] = [
        {
          id: 'ticket_001',
          title: 'Water Supply Issue',
          description: 'No water supply since morning in Block A',
          societyName: 'Green Valley Society',
          societyId: '1',
          residentName: 'John Doe',
          residentPhone: '+91-9876543210',
          priority: 'high',
          status: 'open',
          category: 'maintenance',
          createdAt: '2024-03-01T08:30:00Z',
          updatedAt: '2024-03-01T08:30:00Z',
        },
        {
          id: 'ticket_002',
          title: 'Security Gate Not Working',
          description: 'Main gate automatic system is not functioning',
          societyName: 'Sunrise Apartments',
          societyId: '2',
          residentName: 'Sarah Smith',
          residentPhone: '+91-9876543211',
          priority: 'medium',
          status: 'in_progress',
          category: 'security',
          createdAt: '2024-02-29T14:15:00Z',
          updatedAt: '2024-03-01T10:00:00Z',
          responseTime: 18,
        },
        {
          id: 'ticket_003',
          title: 'Billing Query',
          description: 'Question about maintenance charges calculation',
          societyName: 'Metro Heights',
          societyId: '3',
          residentName: 'Mike Johnson',
          residentPhone: '+91-9876543212',
          priority: 'low',
          status: 'pending_response',
          category: 'billing',
          createdAt: '2024-02-28T16:45:00Z',
          updatedAt: '2024-03-01T09:30:00Z',
          responseTime: 12,
        },
      ];

      setTickets(mockTickets);
    } catch (error) {
      console.error('Failed to load support tickets:', error);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }

    setFilteredTickets(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSupportTickets();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'text-red-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending_response':
        return 'text-yellow-600';
      case 'resolved':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <AlertTriangle size={16} color="#dc2626" />;
      case 'in_progress':
        return <Clock size={16} color="#0284c7" />;
      case 'pending_response':
        return <MessageSquare size={16} color="#d97706" />;
      case 'resolved':
        return <CheckCircle size={16} color="#059669" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const getFilterCount = (status: FilterStatus) => {
    if (status === 'all') return tickets.length;
    return tickets.filter((t) => t.status === status).length;
  };

  return (
    <RequireManager>
      <View className="flex-1 bg-gray-50">
        <AdminHeader
          title="Support Queue"
          subtitle={`${tickets.filter((t) => t.status !== 'resolved').length} active tickets`}
          showBack
          showNotifications
          showLogout
          onLogout={handleLogout}
        />

        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}>
          {/* Summary Stats */}
          <View className="px-4 py-2">
            <View className="flex-row flex-wrap gap-3 mb-4">
              <Card className="flex-1 min-w-[120px] p-3">
                <Text className="text-lg font-bold text-red-600">
                  {getFilterCount('open')}
                </Text>
                <Text className="text-sm text-gray-600">Open</Text>
              </Card>

              <Card className="flex-1 min-w-[120px] p-3">
                <Text className="text-lg font-bold text-blue-600">
                  {getFilterCount('in_progress')}
                </Text>
                <Text className="text-sm text-gray-600">In Progress</Text>
              </Card>

              <Card className="flex-1 min-w-[120px] p-3">
                <Text className="text-lg font-bold text-yellow-600">
                  {getFilterCount('pending_response')}
                </Text>
                <Text className="text-sm text-gray-600">Pending</Text>
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
                  label="Open"
                  selected={filterStatus === 'open'}
                  count={getFilterCount('open')}
                  onPress={() => setFilterStatus('open')}
                />
                <FilterPill
                  label="In Progress"
                  selected={filterStatus === 'in_progress'}
                  count={getFilterCount('in_progress')}
                  onPress={() => setFilterStatus('in_progress')}
                />
                <FilterPill
                  label="Pending Response"
                  selected={filterStatus === 'pending_response'}
                  count={getFilterCount('pending_response')}
                  onPress={() => setFilterStatus('pending_response')}
                />
                <FilterPill
                  label="Resolved"
                  selected={filterStatus === 'resolved'}
                  count={getFilterCount('resolved')}
                  onPress={() => setFilterStatus('resolved')}
                />
              </View>
            </ScrollView>
          </View>

          {/* Tickets List */}
          <View className="px-4 py-2 mb-6">
            <View className="space-y-3">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="p-4">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {ticket.title}
                      </Text>
                      <Text className="text-sm text-gray-600 mb-2">
                        {ticket.description}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className={cn(
                          'text-xs font-medium mb-1',
                          getPriorityColor(ticket.priority),
                        )}>
                        {ticket.priority.toUpperCase()}
                      </Text>
                      <View className="flex-row items-center">
                        {getStatusIcon(ticket.status)}
                        <Text
                          className={cn(
                            'text-xs ml-1',
                            getStatusColor(ticket.status),
                          )}>
                          {ticket.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Society and Resident Info */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Building2 size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {ticket.societyName}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <User size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {ticket.residentName}
                      </Text>
                    </View>
                  </View>

                  {/* Response Time */}
                  {ticket.responseTime && (
                    <View className="mb-3">
                      <Text className="text-xs text-gray-500">
                        Response time: {ticket.responseTime}h
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View className="flex-row gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onPress={() => {
                        /* Handle view details */
                      }}>
                      View Details
                    </Button>
                    {ticket.status !== 'resolved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onPress={() => {
                          /* Handle respond */
                        }}>
                        Respond
                      </Button>
                    )}
                  </View>

                  {/* Timestamp */}
                  <Text className="text-xs text-gray-400 mt-2">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                  </Text>
                </Card>
              ))}
            </View>

            {filteredTickets.length === 0 && (
              <Card className="p-8 items-center">
                <MessageSquare size={48} color="#6b7280" />
                <Text className="text-gray-600 mt-4 text-center">
                  No support tickets found
                </Text>
                {filterStatus !== 'all' && (
                  <Button
                    onPress={() => setFilterStatus('all')}
                    variant="outline"
                    className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </Card>
            )}
          </View>
        </ScrollView>
      </View>
    </RequireManager>
  );
};

// Add proper named export with displayName for React DevTools
ManagerSupport.displayName = 'ManagerSupport';

export default ManagerSupport;
