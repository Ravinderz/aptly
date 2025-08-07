import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import EmergencyAlertCard from '@/components/security/EmergencyAlertCard';
import { 
  AlertTriangle, 
  Shield, 
  Plus,
  ArrowLeft
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import type { EmergencyAlert } from '@/types/security';

type AlertType = 'security' | 'medical' | 'fire' | 'evacuation' | 'other';
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Emergency Response Interface - Phase 2
 * 
 * Features:
 * - Emergency alert creation and management
 * - Real-time alert monitoring
 * - Priority-based alert system
 * - Quick response actions
 * - Emergency contact integration
 * - Alert resolution tracking
 */
const EmergencyResponse = () => {
  const { user } = useDirectAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  
  const [newAlert, setNewAlert] = useState({
    type: 'security' as AlertType,
    severity: 'medium' as AlertSeverity,
    title: '',
    description: '',
    location: ''
  });

  // Mock data - will be replaced with real API calls
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([
    {
      id: '1',
      type: 'security',
      severity: 'high',
      title: 'Suspicious Activity Reported',
      description: 'Resident reported suspicious person near parking area',
      location: 'Block A Parking',
      reportedBy: 'Security Guard',
      reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      status: 'active',
      assignedTo: ['guard1']
    },
    {
      id: '2',
      type: 'medical',
      severity: 'critical',
      title: 'Medical Emergency',
      description: 'Elderly resident collapsed in lobby',
      location: 'Main Lobby - Block B',
      reportedBy: 'Resident',
      reportedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      status: 'acknowledged',
      assignedTo: ['guard1', 'guard2']
    },
    {
      id: '3',
      type: 'fire',
      severity: 'medium',
      title: 'Smoke Detector Alert',
      description: 'Smoke detector activated in basement parking',
      location: 'B1 Parking Level',
      reportedBy: 'Fire Safety System',
      reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'resolved',
      assignedTo: ['guard1'],
      resolvedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      resolutionNotes: 'False alarm - dust from construction work'
    }
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);


  const handleCreateAlert = async () => {
    if (!newAlert.title.trim() || !newAlert.description.trim()) {
      Alert.alert('Validation Error', 'Title and description are required');
      return;
    }

    try {
      const alert: EmergencyAlert = {
        id: Date.now().toString(),
        type: newAlert.type,
        severity: newAlert.severity,
        title: newAlert.title,
        description: newAlert.description,
        location: newAlert.location,
        reportedBy: user?.fullName || 'Security Guard',
        reportedAt: new Date(),
        status: 'active',
        assignedTo: [user?.id || 'current-guard']
      };

      setAlerts(prev => [alert, ...prev]);
      
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
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create alert. Please try again.');
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ));
  };

  const handleResolveAlert = (alertId: string) => {
    Alert.prompt(
      'Resolve Alert',
      'Please enter resolution notes:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: (notes) => {
            setAlerts(prev => prev.map(alert => 
              alert.id === alertId 
                ? { 
                    ...alert, 
                    status: 'resolved' as const,
                    resolvedAt: new Date(),
                    resolutionNotes: notes || 'Resolved by security guard'
                  }
                : alert
            ));
          }
        }
      ],
      'plain-text'
    );
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active' || alert.status === 'acknowledged');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  if (showCreateAlert) {
    return (
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
                  onPress={() => setNewAlert(prev => ({ ...prev, type: type.key as AlertType }))}
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
                  onPress={() => setNewAlert(prev => ({ ...prev, severity: severity.key as AlertSeverity }))}
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onPress={handleCreateAlert}
              className="flex-1"
            >
              Create Alert
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
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
              Emergency Response
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowCreateAlert(true)}
            className="p-2"
          >
            <Plus size={24} color="#dc2626" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600">
          Monitor and respond to emergency situations
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
                <Text className="text-2xl font-bold text-red-600">{activeAlerts.length}</Text>
              </View>
              <AlertTriangle size={24} color="#dc2626" />
            </View>
          </Card>
          
          <Card className="flex-1 p-4 bg-white ml-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600">Critical</Text>
                <Text className="text-2xl font-bold text-red-800">{criticalAlerts.length}</Text>
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
          >
            Create Alert
          </Button>
          
          <Button
            variant="outline"
            size="md"
            onPress={() => {
              // Call emergency services
              Alert.alert(
                'Emergency Contacts',
                'Police: 100\nFire: 101\nAmbulance: 108\nGeneral Emergency: 112',
                [
                  { text: 'Cancel' },
                  { 
                    text: 'Call 112', 
                    onPress: () => {
                      // In a real app, this would initiate a phone call
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
                showActions={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

EmergencyResponse.displayName = 'EmergencyResponse';

export default EmergencyResponse;