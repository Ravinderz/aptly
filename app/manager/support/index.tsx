import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  Plus,
  User,
  Building2,
  Tag,
  Calendar,
  Star,
  TrendingUp,
  Timer,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { RequireManager } from '@/components/auth/RoleGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  LoadingWrapper, 
  useAsyncState, 
  LoadingSpinner 
} from '@/components/ui/LoadingStates';
import { cn } from '@/utils/cn';
import { supportService } from '@/services/support.service';
import type {
  SupportTicket,
  TicketFilters,
  SupportStats,
  QueueStats,
  TicketResponseRequest,
  StatusChangeRequest,
  AssignTicketRequest,
} from '@/services/support.service';

/**
 * Manager Support System - Support ticket queue management
 * 
 * Features:
 * - Support ticket queue with priority and status management
 * - Response time tracking and SLA monitoring
 * - Priority and status management workflows
 * - Quick response templates and bulk actions
 * - Team performance metrics and insights
 * - Advanced filtering and search capabilities
 */
const ManagerSupportSystem = () => {
  const router = useRouter();
  const { user } = useDirectAuth();
  
  const [supportState, { setLoading, setData, setError }] = useAsyncState<{
    tickets: SupportTicket[];
    totalCount: number;
    stats: SupportStats;
    queueStats: QueueStats;
  }>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'me',
    page: 1,
    limit: 20,
    sortBy: 'priority',
    sortOrder: 'desc',
  });

  // Load support data on mount and when filters change
  useEffect(() => {
    loadSupportData();
  }, [filters]);

  const loadSupportData = async () => {
    try {
      setLoading();
      
      // Load tickets and stats in parallel
      const [ticketsResponse, statsResponse] = await Promise.all([
        supportService.getTickets(filters),
        supportService.getQueueStats(),
      ]);

      if (ticketsResponse.success && statsResponse.success) {
        setData({
          tickets: ticketsResponse.data!.tickets,
          totalCount: ticketsResponse.data!.totalCount,
          stats: ticketsResponse.data!.stats,
          queueStats: statsResponse.data!,
        });
      } else {
        const error = ticketsResponse.message || statsResponse.message || 'Failed to load support data';
        setError(new Error(error));
      }
    } catch (error) {
      console.error('Failed to load support data:', error);
      setError(error as Error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadSupportData();
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  const handleTicketPress = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowResponseModal(true);
  };

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      const response = await supportService.changeStatus(ticketId, { status: newStatus });
      
      if (response.success) {
        Alert.alert('Status Updated', `Ticket status changed to ${newStatus.replace('_', ' ')}`);
        await loadSupportData();
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update status. Please try again.'
      );
    }
  };

  const handlePriorityChange = async (ticketId: string, newPriority: SupportTicket['priority']) => {
    try {
      const response = await supportService.updateTicket(ticketId, { priority: newPriority });
      
      if (response.success) {
        Alert.alert('Priority Updated', `Ticket priority changed to ${newPriority}`);
        await loadSupportData();
      } else {
        throw new Error(response.message || 'Failed to update priority');
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update priority. Please try again.'
      );
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !responseText.trim()) {
      Alert.alert('Validation Error', 'Response message is required');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await supportService.addResponse(selectedTicket.id, {
        message: responseText,
        isInternal: false,
      });
      
      if (response.success) {
        setResponseText('');
        setShowResponseModal(false);
        setSelectedTicket(null);
        
        Alert.alert('Response Sent', 'Your response has been sent to the resident');
        await loadSupportData();
      } else {
        throw new Error(response.message || 'Failed to send response');
      }
    } catch (error) {
      console.error('Failed to send response:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send response. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalateTicket = async (ticketId: string) => {
    Alert.prompt(
      'Escalate Ticket',
      'Please provide a reason for escalation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          onPress: async (reason) => {
            try {
              const response = await supportService.escalateTicket(ticketId, {
                reason: reason || 'Manager escalation',
                escalateTo: 'supervisor',
              });
              
              if (response.success) {
                Alert.alert('Ticket Escalated', 'Ticket has been escalated to supervisor');
                await loadSupportData();
              } else {
                throw new Error(response.message || 'Failed to escalate ticket');
              }
            } catch (error) {
              console.error('Failed to escalate ticket:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to escalate ticket. Please try again.'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return '#dc2626';
      case 'in_progress': return '#2563eb';
      case 'pending_response': return '#f59e0b';
      case 'resolved': return '#16a34a';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} color="#dc2626" />;
      case 'in_progress':
        return <Clock size={16} color="#2563eb" />;
      case 'pending_response':
        return <Timer size={16} color="#f59e0b" />;
      case 'resolved':
        return <CheckCircle size={16} color="#16a34a" />;
      default:
        return <CheckCircle size={16} color="#6b7280" />;
    }
  };

  const getSLAStatusColor = (slaStatus: SupportTicket['slaStatus']) => {
    switch (slaStatus) {
      case 'on_track': return '#16a34a';
      case 'at_risk': return '#f59e0b';
      case 'breached': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Role check - only community managers can access
  if (!user || user.role !== 'community_manager') {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <MessageSquare size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Manager Access Required
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

  const tickets = supportState.data?.tickets || [];
  const stats = supportState.data?.stats;
  const queueStats = supportState.data?.queueStats;

  // Response Modal Component
  const ResponseModal = () => (
    <Modal visible={showResponseModal} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-gray-900">
              Respond to Ticket
            </Text>
            <TouchableOpacity onPress={() => setShowResponseModal(false)}>
              <Text className="text-blue-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
          {selectedTicket && (
            <Text className="text-gray-600">
              #{selectedTicket.ticketNumber} • {selectedTicket.title}
            </Text>
          )}
        </View>

        <ScrollView className="flex-1 p-4">
          <Card className="p-4 mb-4">
            <Text className="text-sm font-medium text-gray-900 mb-2">Response Message</Text>
            <TextInput
              value={responseText}
              onChangeText={setResponseText}
              placeholder="Type your response here..."
              multiline
              numberOfLines={6}
              className="border border-gray-300 rounded-lg p-3 text-gray-900"
              style={{ textAlignVertical: 'top' }}
            />
          </Card>

          <View className="flex-row space-x-3">
            <Button
              variant="outline"
              size="lg"
              onPress={() => setShowResponseModal(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onPress={handleSendResponse}
              className="flex-1"
              disabled={submitting || !responseText.trim()}
            >
              {submitting ? (
                <View className="flex-row items-center">
                  <LoadingSpinner size="small" color="#ffffff" className="mr-2" />
                  <Text className="text-white">Sending...</Text>
                </View>
              ) : (
                'Send Response'
              )}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <RequireManager>
      <LoadingWrapper
        isLoading={supportState.isLoading}
        error={supportState.error}
        onRetry={loadSupportData}
        skeletonProps={{ type: 'card', count: 3 }}
      >
        <View className="flex-1 bg-gray-50">
          <AdminHeader 
            title="Support Queue" 
            subtitle="Manage resident support tickets"
            showBack
          />
          
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Queue Statistics */}
            {queueStats && (
              <View className="px-4 py-4 bg-white border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Queue Overview</Text>
                
                <View className="flex-row flex-wrap gap-3 mb-4">
                  <Card className="flex-1 min-w-[120px] p-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <MessageSquare size={20} color="#dc2626" />
                      <Text className="text-xl font-bold text-gray-900">
                        {queueStats.openTickets}
                      </Text>
                    </View>
                    <Text className="text-xs font-medium text-gray-900">Open</Text>
                  </Card>

                  <Card className="flex-1 min-w-[120px] p-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Clock size={20} color="#2563eb" />
                      <Text className="text-xl font-bold text-gray-900">
                        {queueStats.inProgressTickets}
                      </Text>
                    </View>
                    <Text className="text-xs font-medium text-gray-900">In Progress</Text>
                  </Card>

                  <Card className="flex-1 min-w-[120px] p-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Timer size={20} color="#f59e0b" />
                      <Text className="text-xl font-bold text-gray-900">
                        {queueStats.avgResponseTime}h
                      </Text>
                    </View>
                    <Text className="text-xs font-medium text-gray-900">Avg Response</Text>
                  </Card>

                  <Card className="flex-1 min-w-[120px] p-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <TrendingUp size={20} color="#16a34a" />
                      <Text className="text-xl font-bold text-gray-900">
                        {queueStats.resolutionRate}%
                      </Text>
                    </View>
                    <Text className="text-xs font-medium text-gray-900">Resolution</Text>
                  </Card>
                </View>
              </View>
            )}

            {/* Filter Controls */}
            <View className="px-4 py-3 bg-white border-b border-gray-200">
              <View className="flex-row space-x-2">
                {[
                  { key: 'all', label: 'All', count: supportState.data?.totalCount || 0 },
                  { key: 'open', label: 'Open', count: queueStats?.openTickets || 0 },
                  { key: 'in_progress', label: 'In Progress', count: queueStats?.inProgressTickets || 0 },
                  { key: 'pending_response', label: 'Pending', count: queueStats?.pendingTickets || 0 },
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

            {/* Support Tickets List */}
            <View className="px-4 py-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Support Tickets ({tickets.length})
              </Text>
              
              {tickets.length === 0 ? (
                <Card className="p-6">
                  <View className="items-center">
                    <MessageSquare size={48} color="#9ca3af" />
                    <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                      No Tickets Found
                    </Text>
                    <Text className="text-gray-600 text-center">
                      No support tickets match your current filter criteria.
                    </Text>
                  </View>
                </Card>
              ) : (
                <View className="space-y-3">
                  {tickets.map((ticket) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => handleTicketPress(ticket)}
                    >
                      <Card className="p-4">
                        <View className="flex-row items-start justify-between mb-3">
                          <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                              <Text className="text-sm font-bold text-gray-900 mr-2">
                                #{ticket.ticketNumber}
                              </Text>
                              <View 
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                              />
                              <Text 
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{ 
                                  backgroundColor: `${getPriorityColor(ticket.priority)}20`,
                                  color: getPriorityColor(ticket.priority)
                                }}
                              >
                                {ticket.priority.toUpperCase()}
                              </Text>
                            </View>
                            <Text className="text-base font-semibold text-gray-900 mb-1">
                              {ticket.title}
                            </Text>
                            <Text className="text-sm text-gray-600 mb-2">
                              {ticket.societyName} • {ticket.residentName}
                            </Text>
                            <View className="flex-row items-center">
                              <Tag size={12} color="#6b7280" />
                              <Text className="text-xs text-gray-500 ml-1">
                                {ticket.category}
                              </Text>
                            </View>
                          </View>
                          
                          <View className="items-end">
                            <View className="flex-row items-center mb-2">
                              {getStatusIcon(ticket.status)}
                              <Text 
                                className="text-xs font-medium ml-1"
                                style={{ color: getStatusColor(ticket.status) }}
                              >
                                {ticket.status.replace('_', ' ').toUpperCase()}
                              </Text>
                            </View>
                            
                            <View className="flex-row items-center">
                              <View 
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: getSLAStatusColor(ticket.slaStatus) }}
                              />
                              <Text className="text-xs text-gray-500">
                                SLA: {ticket.slaStatus.replace('_', ' ')}
                              </Text>
                            </View>
                            
                            <Text className="text-xs text-gray-400 mt-1">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                          <View className="flex-row space-x-2">
                            <TouchableOpacity
                              onPress={() => handleStatusChange(ticket.id, 
                                ticket.status === 'open' ? 'in_progress' : 'resolved'
                              )}
                              className="px-3 py-1 bg-blue-50 rounded"
                            >
                              <Text className="text-xs text-blue-700 font-medium">
                                {ticket.status === 'open' ? 'Start Work' : 
                                 ticket.status === 'in_progress' ? 'Resolve' : 'Update'}
                              </Text>
                            </TouchableOpacity>
                            
                            {ticket.priority !== 'high' && (
                              <TouchableOpacity
                                onPress={() => handlePriorityChange(ticket.id, 'high')}
                                className="px-3 py-1 bg-red-50 rounded"
                              >
                                <Text className="text-xs text-red-700 font-medium">High Priority</Text>
                              </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                              onPress={() => handleEscalateTicket(ticket.id)}
                              className="px-3 py-1 bg-gray-50 rounded"
                            >
                              <Text className="text-xs text-gray-700 font-medium">Escalate</Text>
                            </TouchableOpacity>
                          </View>
                          
                          {ticket.responseTime && (
                            <Text className="text-xs text-gray-500">
                              Response: {ticket.responseTime}h
                            </Text>
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Response Modal */}
          <ResponseModal />
        </View>
      </LoadingWrapper>
    </RequireManager>
  );
};

ManagerSupportSystem.displayName = 'ManagerSupportSystem';

export default ManagerSupportSystem;