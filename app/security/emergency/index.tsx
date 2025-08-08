import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal
} from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  LoadingWrapper, 
  useAsyncState, 
  ErrorMessage,
  LoadingSpinner 
} from '@/components/ui/LoadingStates';
import EmergencyAlertCard from '@/components/security/EmergencyAlertCard';
import { 
  AlertTriangle, 
  Shield, 
  Plus,
  ArrowLeft,
  Filter,
  Download,
  Phone
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useSecurityPermissions } from '@/hooks/useSecurityPermissions';
import { cn } from '@/utils/cn';
import { emergencyService } from '@/services/emergency.service';
import type { 
  EmergencyAlert, 
  EmergencyStats,
  EmergencyFilters,
  CreateAlertRequest
} from '@/services/emergency.service';

/**
 * Security Emergency Management - Real-time emergency alert dashboard
 * 
 * Features:
 * - Emergency alert creation and management
 * - Real-time alert monitoring with service integration
 * - Priority-based alert system with severity categorization
 * - Quick response actions and status workflow
 * - Emergency contact integration
 * - Alert resolution tracking with audit trail
 * - Export functionality for reporting
 * - Filtering and search capabilities
 */
const SecurityEmergencyManagement = () => {
  const { user } = useDirectAuth();
  const { canHandleEmergencies, permissionLevel } = useSecurityPermissions();
  
  const [alertsState, { setLoading, setData, setError }] = useAsyncState<{
    alerts: EmergencyAlert[];
    totalCount: number;
    stats: EmergencyStats;
  }>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState<EmergencyFilters>({
    status: 'all',
    type: 'all',
    severity: 'all',
    page: 1,
    limit: 20
  });
  
  const [newAlert, setNewAlert] = useState<CreateAlertRequest>({
    type: 'security',
    severity: 'medium',
    title: '',
    description: '',
    location: ''
  });

  // Load alerts data on mount and when filters change
  useEffect(() => {
    loadAlertsData();
  }, [filters]);

  const loadAlertsData = async () => {
    try {
      setLoading();
      const response = await emergencyService.getAlerts(filters);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(new Error(response.message || 'Failed to load alerts'));
      }
    } catch (error) {
      console.error('Failed to load emergency alerts:', error);
      setError(error as Error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAlertsData();
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  const handleCreateAlert = async () => {
    if (!newAlert.title.trim() || !newAlert.description.trim()) {
      Alert.alert('Validation Error', 'Title and description are required');
      return;
    }

    if (!canHandleEmergencies) {
      Alert.alert('Permission Denied', 'You do not have permission to create emergency alerts');
      return;
    }

    try {
      setSubmitting(true);
      const response = await emergencyService.createAlert(newAlert);
      
      if (response.success) {
        // Reset form
        setNewAlert({
          type: 'security',
          severity: 'medium',
          title: '',
          description: '',
          location: ''
        });
        
        setShowCreateAlert(false);
        
        Alert.alert('Alert Created', 'Emergency alert has been created successfully');
        
        // Reload data to show the new alert
        await loadAlertsData();
      } else {
        throw new Error(response.message || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to create alert. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!canHandleEmergencies) {
      Alert.alert('Permission Denied', 'You do not have permission to acknowledge alerts');
      return;
    }

    try {
      const response = await emergencyService.acknowledgeAlert(alertId, {
        notes: `Acknowledged by ${user?.fullName || 'Security Guard'}`
      });
      
      if (response.success) {
        Alert.alert('Alert Acknowledged', 'Alert has been acknowledged successfully');
        await loadAlertsData(); // Reload to show updated status
      } else {
        throw new Error(response.message || 'Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to acknowledge alert. Please try again.'
      );
    }
  };

  const handleResolveAlert = (alertId: string) => {
    if (!canHandleEmergencies) {
      Alert.alert('Permission Denied', 'You do not have permission to resolve alerts');
      return;
    }

    Alert.prompt(
      'Resolve Alert',
      'Please enter resolution notes:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async (notes) => {
            try {
              const response = await emergencyService.resolveAlert(alertId, {
                resolutionNotes: notes || 'Resolved by security guard'
              });
              
              if (response.success) {
                Alert.alert('Alert Resolved', 'Alert has been resolved successfully');
                await loadAlertsData(); // Reload to show updated status
              } else {
                throw new Error(response.message || 'Failed to resolve alert');
              }
            } catch (error) {
              console.error('Failed to resolve alert:', error);
              Alert.alert(
                'Error', 
                error instanceof Error ? error.message : 'Failed to resolve alert. Please try again.'
              );
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleExportReport = async () => {
    try {
      const response = await emergencyService.exportReport('xlsx', filters);
      
      if (response.success && response.data?.downloadUrl) {
        Alert.alert(
          'Report Generated',
          'Emergency alerts report has been generated successfully.',
          [
            { text: 'OK' }
          ]
        );
        console.log('Download URL:', response.data.downloadUrl);
      } else {
        throw new Error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to export report:', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Failed to export report. Please try again.'
      );
    }
  };

  // Permission check - only security guards can access
  if (!user || (user.role !== 'security_guard' && user.role !== 'super_admin')) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Shield size={48} color="#6b7280" />
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

  const alerts = alertsState.data?.alerts || [];
  const stats = alertsState.data?.stats;
  const activeAlerts = alerts.filter(alert => alert.status === 'active' || alert.status === 'acknowledged');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  // Create Alert Modal Component
  const CreateAlertModal = () => (
    <Modal visible={showCreateAlert} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => setShowCreateAlert(false)} className="mr-2 p-2">
              <ArrowLeft size={20} color="#6b7280" />
            </TouchableOpacity>
            <AlertTriangle size={24} color="#dc2626" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              Create Emergency Alert
            </Text>
          </View>
          <Text className="text-gray-600">
            Report an emergency situation or security incident
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <Card className="p-4 mb-4 bg-white">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Alert Details
            </Text>

            {/* Alert Type */}
            <Text className="text-sm text-gray-600 mb-2">Alert Type</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                { key: 'security', label: 'Security' },
                { key: 'medical', label: 'Medical' },
                { key: 'fire', label: 'Fire' },
                { key: 'evacuation', label: 'Evacuation' },
                { key: 'other', label: 'Other' }
              ].map((type) => (
                <Button
                  key={type.key}
                  variant={newAlert.type === type.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewAlert(prev => ({ ...prev, type: type.key as any }))}
                  className="mr-2 mb-2"
                >
                  {type.label}
                </Button>
              ))}
            </View>

            {/* Severity */}
            <Text className="text-sm text-gray-600 mb-2">Severity Level</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                { key: 'critical', label: 'Critical', color: '#dc2626' },
                { key: 'high', label: 'High', color: '#ea580c' },
                { key: 'medium', label: 'Medium', color: '#f59e0b' },
                { key: 'low', label: 'Low', color: '#16a34a' }
              ].map((severity) => (
                <Button
                  key={severity.key}
                  variant={newAlert.severity === severity.key ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setNewAlert(prev => ({ ...prev, severity: severity.key as any }))}
                  className="mr-2 mb-2"
                >
                  {severity.label}
                </Button>
              ))}
            </View>

            <Input
              label="Alert Title *"
              value={newAlert.title}
              onChangeText={(value) => setNewAlert(prev => ({ ...prev, title: value }))}
              placeholder="Brief description of the emergency"
              className="mb-4"
            />

            <Input
              label="Location"
              value={newAlert.location}
              onChangeText={(value) => setNewAlert(prev => ({ ...prev, location: value }))}
              placeholder="Where is this happening?"
              className="mb-4"
            />

            <Input
              label="Description *"
              value={newAlert.description}
              onChangeText={(value) => setNewAlert(prev => ({ ...prev, description: value }))}
              placeholder="Detailed description of the situation"
              multiline
              numberOfLines={4}
            />
          </Card>

          <View className="flex-row space-x-3">
            <Button
              variant="outline"
              size="lg"
              onPress={() => setShowCreateAlert(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onPress={handleCreateAlert}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <View className="flex-row items-center">
                  <LoadingSpinner size="small" color="#ffffff" className="mr-2" />
                  <Text className="text-white">Creating...</Text>
                </View>
              ) : (
                'Create Alert'
              )}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <LoadingWrapper
      isLoading={alertsState.isLoading}
      error={alertsState.error}
      onRetry={loadAlertsData}
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
              <AlertTriangle size={24} color="#dc2626" />
              <Text className="text-2xl font-bold text-gray-900 ml-2">
                Emergency Management
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={handleExportReport}
                className="p-2 mr-2"
              >
                <Download size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowCreateAlert(true)}
                className="p-2"
                disabled={!canHandleEmergencies}
              >
                <Plus size={24} color={canHandleEmergencies ? "#dc2626" : "#9ca3af"} />
              </TouchableOpacity>
            </View>
          </View>
          <Text className="text-gray-600">
            Real-time emergency alert dashboard and management
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Alert Statistics */}
          <View className="flex-row mb-6">
            <Card className="flex-1 p-4 bg-white mr-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-600">Active Alerts</Text>
                  <Text className="text-2xl font-bold text-red-600">{stats?.active || 0}</Text>
                </View>
                <AlertTriangle size={24} color="#dc2626" />
              </View>
            </Card>
            
            <Card className="flex-1 p-4 bg-white ml-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-600">Critical</Text>
                  <Text className="text-2xl font-bold text-red-800">{stats?.critical || 0}</Text>
                </View>
                <Shield size={24} color="#7f1d1d" />
              </View>
            </Card>
          </View>

          {/* Critical Alerts Banner */}
          {criticalAlerts.length > 0 && (
            <Card className="p-4 mb-6 bg-red-50 border border-red-200">
              <View className="flex-row items-center">
                <AlertTriangle size={20} color="#dc2626" />
                <Text className="text-red-900 font-semibold ml-2">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention
                </Text>
              </View>
            </Card>
          )}

          {/* Quick Actions */}
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row mb-6">
            <Button
              variant="destructive"
              size="md"
              onPress={() => setShowCreateAlert(true)}
              className="flex-1 mr-2"
              disabled={!canHandleEmergencies}
            >
              Create Alert
            </Button>
            
            <Button
              variant="outline"
              size="md"
              onPress={() => {
                Alert.alert(
                  'Emergency Contacts',
                  'Police: 100\nFire: 101\nAmbulance: 108\nGeneral Emergency: 112',
                  [
                    { text: 'Cancel' },
                    { 
                      text: 'Call 112', 
                      onPress: () => {
                        Alert.alert('Calling Emergency Services', 'This would dial 112 in a real app');
                      }
                    }
                  ]
                );
              }}
              className="flex-1 ml-2"
            >
              Emergency Call
            </Button>
          </View>

          {/* Alert List */}
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Recent Alerts ({alerts.length})
          </Text>
          
          {alerts.length === 0 ? (
            <Card className="p-6 bg-white">
              <View className="items-center">
                <Shield size={48} color="#9ca3af" />
                <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                  No Alerts
                </Text>
                <Text className="text-gray-600 text-center">
                  All systems are operating normally. Create an alert if you encounter an emergency situation.
                </Text>
              </View>
            </Card>
          ) : (
            <View className="space-y-3">
              {alerts.map((alert) => (
                <EmergencyAlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledgeAlert}
                  onResolve={handleResolveAlert}
                  showActions={canHandleEmergencies}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Create Alert Modal */}
        <CreateAlertModal />
      </View>
    </LoadingWrapper>
  );
};

SecurityEmergencyManagement.displayName = 'SecurityEmergencyManagement';

export default SecurityEmergencyManagement;