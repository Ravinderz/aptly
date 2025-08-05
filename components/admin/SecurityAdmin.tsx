import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Settings,
  Camera,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  Activity,
  Bell,
} from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { useDirectSociety } from '@/hooks/useDirectSociety';
import { StatWidget, QuickActionWidget, AlertWidget } from './DashboardWidgets';
import { useAlert } from '@/components/ui/AlertCard';

interface VisitorSecurityStats {
  totalVisitors: number;
  pendingApprovals: number;
  approvedToday: number;
  rejectedToday: number;
  activeVisitors: number;
  overdueVisitors: number;
  securityIncidents: number;
  averageApprovalTime: number;
}

interface SecurityIncident {
  id: string;
  type:
    | 'unauthorized_entry'
    | 'visitor_overstay'
    | 'suspicious_activity'
    | 'document_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  visitorId?: string;
  visitorName?: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
  location?: string;
  attachments?: string[];
}

interface BulkVisitorAction {
  id: string;
  type: 'bulk_approve' | 'bulk_reject' | 'bulk_notify' | 'security_check';
  title: string;
  description: string;
  targetSocieties: string[];
  visitorCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  results?: {
    successful: number;
    failed: number;
    details: string[];
  };
}

interface VisitorFilter {
  status: 'all' | 'pending' | 'approved' | 'rejected' | 'overdue';
  timeframe: 'today' | 'week' | 'month';
  societies: string[];
  riskLevel: 'all' | 'low' | 'medium' | 'high';
}

const SecurityAdmin: React.FC = () => {
  const { checkPermission, activeSociety, availableSocieties } = useDirectAdmin();
  const { bulkOperation, filterNotificationsForSociety } = useDirectSociety();
  const { showAlert, AlertComponent } = useAlert();

  const [securityStats, setSecurityStats] =
    useState<VisitorSecurityStats | null>(null);
  const [securityIncidents, setSecurityIncidents] = useState<
    SecurityIncident[]
  >([]);
  const [bulkActions, setBulkActions] = useState<BulkVisitorAction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<VisitorFilter>({
    status: 'all',
    timeframe: 'today',
    societies: [],
    riskLevel: 'all',
  });

  useEffect(() => {
    loadSecurityData();
  }, [activeSociety, activeFilter]);

  const loadSecurityData = async () => {
    try {
      // Load security stats for current society
      if (activeSociety) {
        const stats = await loadSecurityStats(activeSociety.id);
        setSecurityStats(stats);
      }

      // Load security incidents
      const incidents = await loadSecurityIncidents();
      setSecurityIncidents(incidents);

      // Load recent bulk actions
      const actions = await loadBulkVisitorActions();
      setBulkActions(actions);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const loadSecurityStats = async (
    societyId: string,
  ): Promise<VisitorSecurityStats> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalVisitors: Math.floor(Math.random() * 200) + 100,
          pendingApprovals: Math.floor(Math.random() * 25) + 5,
          approvedToday: Math.floor(Math.random() * 30) + 10,
          rejectedToday: Math.floor(Math.random() * 5),
          activeVisitors: Math.floor(Math.random() * 15) + 5,
          overdueVisitors: Math.floor(Math.random() * 8),
          securityIncidents: Math.floor(Math.random() * 3),
          averageApprovalTime: Math.floor(Math.random() * 30) + 15,
        });
      }, 300);
    });
  };

  const loadSecurityIncidents = async (): Promise<SecurityIncident[]> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'visitor_overstay',
            severity: 'medium',
            title: 'Visitor Overstay Alert',
            description: 'Visitor exceeded approved duration by 2 hours',
            visitorId: 'v_001',
            visitorName: 'John Doe',
            reportedBy: 'Security Guard',
            reportedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'open',
            location: 'Building A, Floor 3',
          },
          {
            id: '2',
            type: 'suspicious_activity',
            severity: 'high',
            title: 'Suspicious Activity Reported',
            description: 'Visitor attempting to access restricted areas',
            visitorId: 'v_002',
            visitorName: 'Jane Smith',
            reportedBy: 'Resident',
            reportedAt: new Date(Date.now() - 7200000).toISOString(),
            status: 'investigating',
            location: 'Parking Area',
          },
        ]);
      }, 200);
    });
  };

  const loadBulkVisitorActions = async (): Promise<BulkVisitorAction[]> => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'bulk_approve',
            title: 'Bulk Visitor Approval',
            description: 'Approved delivery visitors for multiple societies',
            targetSocieties: availableSocieties.slice(0, 2).map((s) => s.id),
            visitorCount: 45,
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            completedAt: new Date(Date.now() - 86000000).toISOString(),
            results: {
              successful: 42,
              failed: 3,
              details: ['3 visitors failed verification checks'],
            },
          },
          {
            id: '2',
            type: 'security_check',
            title: 'Security Verification',
            description: 'Running background checks on pending visitors',
            targetSocieties: [activeSociety?.id].filter(Boolean),
            visitorCount: 12,
            status: 'processing',
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 300);
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSecurityData();
    setIsRefreshing(false);
  };

  const handleBulkApproval = async () => {
    if (!checkPermission('visitors', 'bulk_actions')) {
      showAlert({
        type: 'error',
        title: 'Permission Denied',
        message:
          'You do not have permission to perform bulk visitor operations',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
      return;
    }

    try {
      const result = await bulkOperation('bulk_approve_visitors', {
        filter: activeFilter,
        societies:
          activeFilter.societies.length > 0
            ? activeFilter.societies
            : [activeSociety?.id],
        criteria: {
          minRating: 4,
          maxWaitTime: 30,
          verificationType: 'standard',
        },
      });

      showAlert({
        type: 'success',
        title: 'Bulk Approval Complete',
        message: `Successfully processed ${result.results.length} visitor approvals`,
        primaryAction: { label: 'OK', onPress: () => {} },
      });

      await loadSecurityData();
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Bulk Approval Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to process bulk approvals',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    }
  };

  const handleSecurityCheck = async () => {
    if (!checkPermission('visitors', 'approve')) {
      showAlert({
        type: 'error',
        title: 'Permission Denied',
        message: 'You do not have permission to run security checks',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
      return;
    }

    try {
      const result = await bulkOperation('security_verification', {
        societyId: activeSociety?.id,
        level: 'enhanced',
        includeBackgroundCheck: true,
      });

      showAlert({
        type: 'success',
        title: 'Security Check Initiated',
        message: `Security verification started for ${result.results.length} pending visitors`,
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Security Check Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to initiate security checks',
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    }
  };

  const handleIncidentAction = async (
    incidentId: string,
    action: 'resolve' | 'escalate',
  ) => {
    try {
      // Mock incident action - replace with actual API call
      const updatedIncidents = securityIncidents.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              status:
                action === 'resolve' ? 'resolved' : ('escalated' as const),
            }
          : incident,
      );
      setSecurityIncidents(updatedIncidents);

      showAlert({
        type: 'success',
        title: `Incident ${action === 'resolve' ? 'Resolved' : 'Escalated'}`,
        message: `Security incident has been ${action === 'resolve' ? 'marked as resolved' : 'escalated to higher authority'}`,
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Action Failed',
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${action} incident`,
        primaryAction: { label: 'OK', onPress: () => {} },
      });
    }
  };

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-text-secondary';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'unauthorized_entry':
        return Shield;
      case 'visitor_overstay':
        return Clock;
      case 'suspicious_activity':
        return AlertTriangle;
      case 'document_mismatch':
        return Eye;
      default:
        return AlertTriangle;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    return `${(minutes / 60).toFixed(1)}h`;
  };

  if (!checkPermission('visitors', 'read')) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Shield size={48} className="text-text-secondary mb-4" />
        <Text className="text-headline-medium font-semibold text-text-primary text-center mb-2">
          Access Restricted
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          You do not have permission to view security management features.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }>
      {/* Header */}
      <View className="p-6 bg-surface border-b border-divider">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-display-small font-bold text-text-primary">
              Security Management
            </Text>
            <Text className="text-body-medium text-text-secondary">
              Visitor Security & Access Control
            </Text>
          </View>
          <Shield size={24} className="text-primary" />
        </View>

        {/* Filter Controls */}
        <View className="flex-row flex-wrap gap-2">
          {(['pending', 'approved', 'overdue'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setActiveFilter((prev) => ({ ...prev, status }))}
              className={`px-3 py-1.5 rounded-full border ${
                activeFilter.status === status
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-divider'
              }`}>
              <Text
                className={`text-label-medium font-medium ${
                  activeFilter.status === status
                    ? 'text-white'
                    : 'text-text-secondary'
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Security Stats */}
      {securityStats && (
        <View className="p-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Security Overview - {activeSociety?.name}
          </Text>

          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Pending Approvals"
                value={securityStats.pendingApprovals.toString()}
                icon={Clock}
                color="#FF9800"
                urgent={securityStats.pendingApprovals > 20}
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Active Visitors"
                value={securityStats.activeVisitors.toString()}
                icon={Users}
                color="#4CAF50"
                subtitle="Currently on premises"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Security Incidents"
                value={securityStats.securityIncidents.toString()}
                icon={AlertTriangle}
                color="#F44336"
                urgent={securityStats.securityIncidents > 0}
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <StatWidget
                title="Avg. Approval Time"
                value={formatTime(securityStats.averageApprovalTime)}
                icon={Activity}
                color="#2196F3"
                subtitle="Response time"
              />
            </View>
          </View>
        </View>
      )}

      {/* Security Actions */}
      <View className="px-6 pb-6">
        <Text className="text-headline-medium font-semibold text-text-primary mb-4">
          Security Actions
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {checkPermission('visitors', 'bulk_actions') && (
            <View className="w-1/2 px-2 mb-4">
              <QuickActionWidget
                title="Bulk Approval"
                icon={UserCheck}
                color="#4CAF50"
                onPress={handleBulkApproval}
              />
            </View>
          )}

          {checkPermission('visitors', 'approve') && (
            <View className="w-1/2 px-2 mb-4">
              <QuickActionWidget
                title="Security Check"
                icon={Shield}
                color="#2196F3"
                onPress={handleSecurityCheck}
              />
            </View>
          )}

          <View className="w-1/2 px-2 mb-4">
            <QuickActionWidget
              title="Visitor Analytics"
              icon={Search}
              color="#9C27B0"
              onPress={() => console.log('Visitor analytics')}
            />
          </View>

          <View className="w-1/2 px-2 mb-4">
            <QuickActionWidget
              title="Access Logs"
              icon={Activity}
              color="#FF9800"
              onPress={() => console.log('Access logs')}
            />
          </View>
        </View>
      </View>

      {/* Security Incidents */}
      {securityIncidents.length > 0 && (
        <View className="px-6 pb-6">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Active Security Incidents
          </Text>

          <View className="space-y-3">
            {securityIncidents.map((incident) => {
              const IncidentIcon = getIncidentIcon(incident.type);

              return (
                <View
                  key={incident.id}
                  className="bg-surface rounded-xl p-4 border border-divider">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center mb-2">
                        <IncidentIcon
                          size={16}
                          className={getIncidentSeverityColor(
                            incident.severity,
                          )}
                        />
                        <Text className="text-body-large font-semibold text-text-primary ml-2">
                          {incident.title}
                        </Text>
                      </View>

                      <Text className="text-body-medium text-text-secondary mb-2">
                        {incident.description}
                      </Text>

                      {incident.visitorName && (
                        <View className="flex-row items-center mb-2">
                          <Users
                            size={14}
                            className="text-text-secondary mr-2"
                          />
                          <Text className="text-label-medium text-text-secondary">
                            Visitor: {incident.visitorName}
                          </Text>
                        </View>
                      )}

                      {incident.location && (
                        <View className="flex-row items-center mb-2">
                          <MapPin
                            size={14}
                            className="text-text-secondary mr-2"
                          />
                          <Text className="text-label-medium text-text-secondary">
                            Location: {incident.location}
                          </Text>
                        </View>
                      )}

                      <Text className="text-label-small text-text-secondary">
                        Reported by {incident.reportedBy} •{' '}
                        {new Date(incident.reportedAt).toLocaleTimeString()}
                      </Text>
                    </View>

                    <View
                      className={`px-2 py-1 rounded-full ${
                        incident.severity === 'critical'
                          ? 'bg-red-100'
                          : incident.severity === 'high'
                            ? 'bg-orange-100'
                            : incident.severity === 'medium'
                              ? 'bg-yellow-100'
                              : 'bg-blue-100'
                      }`}>
                      <Text
                        className={`text-label-small font-medium ${getIncidentSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {incident.status === 'open' && (
                    <View className="flex-row gap-2 pt-3 border-t border-divider/50">
                      <TouchableOpacity
                        onPress={() =>
                          handleIncidentAction(incident.id, 'resolve')
                        }
                        className="flex-1 py-2 bg-green-600 rounded-lg flex-row items-center justify-center">
                        <CheckCircle size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Resolve
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          handleIncidentAction(incident.id, 'escalate')
                        }
                        className="flex-1 py-2 bg-orange-600 rounded-lg flex-row items-center justify-center">
                        <Bell size={16} color="white" />
                        <Text className="text-white font-medium ml-2">
                          Escalate
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Recent Bulk Actions */}
      {bulkActions.length > 0 && (
        <View className="px-6 pb-8">
          <Text className="text-headline-medium font-semibold text-text-primary mb-4">
            Recent Security Operations
          </Text>

          <View className="space-y-3">
            {bulkActions.map((action) => (
              <View
                key={action.id}
                className="bg-surface rounded-xl p-4 border border-divider">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-body-large font-semibold text-text-primary mb-1">
                      {action.title}
                    </Text>
                    <Text className="text-body-medium text-text-secondary mb-2">
                      {action.description}
                    </Text>

                    <View
                      className={`inline-flex px-2 py-1 rounded-full ${
                        action.status === 'completed'
                          ? 'bg-green-100'
                          : action.status === 'processing'
                            ? 'bg-blue-100'
                            : action.status === 'failed'
                              ? 'bg-red-100'
                              : 'bg-orange-100'
                      }`}>
                      <Text
                        className={`text-label-small font-medium ${
                          action.status === 'completed'
                            ? 'text-green-600'
                            : action.status === 'processing'
                              ? 'text-blue-600'
                              : action.status === 'failed'
                                ? 'text-red-600'
                                : 'text-orange-600'
                        }`}>
                        {action.status.charAt(0).toUpperCase() +
                          action.status.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-body-medium font-semibold text-text-primary">
                      {action.visitorCount} visitors
                    </Text>
                    <Text className="text-label-medium text-text-secondary">
                      {action.targetSocieties.length} societies
                    </Text>
                  </View>
                </View>

                {action.results && (
                  <View className="pt-2 border-t border-divider/50">
                    <Text className="text-label-medium text-text-secondary">
                      Results: {action.results.successful} successful,{' '}
                      {action.results.failed} failed
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Custom Alert Component */}
      {AlertComponent}
    </ScrollView>
  );
};

export default SecurityAdmin;
