import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { showErrorAlert, showSuccessAlert } from '@/utils/alert';
import LucideIcons from '../ui/LucideIcons';
import { router } from 'expo-router';

// Types
import type {
  EmergencyAlert,
  EmergencyContact,
  EmergencyAnalytics,
  EmergencySeverity,
  EmergencyType,
  EmergencyResponse,
} from '../../types/governance';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { AlertCard } from '../ui/AlertCard';

interface EmergencyManagementProps {
  alerts: EmergencyAlert[];
  contacts: EmergencyContact[];
  analytics?: EmergencyAnalytics;
  onCreateAlert: (alertData: any) => Promise<void>;
  onUpdateAlert: (alertId: string, data: any) => Promise<void>;
  onAcknowledgeAlert: (
    alertId: string,
    response: EmergencyResponse,
    notes?: string,
  ) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin' | 'security_guard';
}

export const EmergencyManagement: React.FC<EmergencyManagementProps> = ({
  alerts,
  contacts,
  analytics,
  onCreateAlert,
  onUpdateAlert,
  onAcknowledgeAlert,
  currentUserId,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<
    'alerts' | 'contacts' | 'analytics'
  >('alerts');
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(
    null,
  );
  const [isResponding, setIsResponding] = useState(false);

  const activeAlerts = alerts.filter(
    (alert) => alert.status === 'active' || alert.status === 'escalated',
  );
  const recentAlerts = alerts.filter((alert) => {
    const alertDate = new Date(alert.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return alertDate >= weekAgo;
  });

  const handleEmergencyCall = async (contact: EmergencyContact) => {
    try {
      const phoneNumber = `tel:${contact.primaryPhone}`;
      const canCall = await Linking.canOpenURL(phoneNumber);

      if (canCall) {
        await Linking.openURL(phoneNumber);
      } else {
        showErrorAlert(
          'Call Failed',
          'Unable to make phone calls from this device.',
        );
      }
    } catch (error) {
      showErrorAlert('Call Error', 'Failed to initiate call.');
    }
  };

  const handleAcknowledgeAlert = async (
    alert: EmergencyAlert,
    response: EmergencyResponse,
  ) => {
    try {
      setIsResponding(true);
      await onAcknowledgeAlert(alert.id, response);
      showSuccessAlert(
        'Response Recorded',
        'Your emergency response has been logged.',
      );
    } catch (error) {
      showErrorAlert('Response Error', 'Failed to record your response.');
    } finally {
      setIsResponding(false);
    }
  };

  const renderEmergencyAlert = (alert: EmergencyAlert) => {
    const severityStyle = getSeverityStyle(alert.severity);
    const typeIcon = getEmergencyTypeIcon(alert.type);
    const userAcknowledged = alert.acknowledgments.some(
      (ack) => ack.userId === currentUserId,
    );
    const timeAgo = getTimeAgo(alert.createdAt);

    return (
      <Card
        key={alert.id}
        className={`mb-4 border-l-4 ${severityStyle.border}`}>
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-2">
                <View
                  className={`p-2 rounded-full mr-3 ${severityStyle.iconBg}`}>
                  <LucideIcons
                    name={typeIcon}
                    size={20}
                    color={severityStyle.iconColor}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-headline-small font-semibold text-text-primary">
                    {alert.title}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className={`px-2 py-1 rounded-full mr-2 ${severityStyle.bg}`}>
                      <Text
                        className={`text-label-small font-medium ${severityStyle.text}`}>
                        {alert.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-body-small text-text-secondary">
                      {timeAgo}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Status Badge */}
            <View
              className={`px-2 py-1 rounded-full ${getStatusStyle(alert.status).bg}`}>
              <Text
                className={`text-label-small font-medium ${getStatusStyle(alert.status).text}`}>
                {alert.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-body-medium text-text-secondary mb-3">
            {alert.description}
          </Text>

          {/* Location and Contact */}
          {alert.location && (
            <View className="flex-row items-center mb-2">
              <LucideIcons name="map-pin" size={16} color="#757575" />
              <Text className="text-body-small text-text-secondary ml-2">
                Location: {alert.location}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-3">
            <LucideIcons name="user" size={16} color="#757575" />
            <Text className="text-body-small text-text-secondary ml-2">
              Contact: {alert.contactPerson} ({alert.contactNumber})
            </Text>
          </View>

          {/* Affected Areas */}
          {alert.affectedAreas.length > 0 && (
            <View className="mb-3">
              <Text className="text-body-small font-medium text-text-primary mb-1">
                Affected Areas:
              </Text>
              <View className="flex-row flex-wrap gap-1">
                {alert.affectedAreas.map((area, index) => (
                  <View
                    key={index}
                    className="bg-warning/10 px-2 py-1 rounded-full">
                    <Text className="text-label-small text-warning">
                      {area}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Escalation Level */}
          {alert.escalationLevel > 0 && (
            <View className="mb-3">
              <View className="flex-row items-center">
                <LucideIcons name="arrow-up-circle" size={16} color="#D32F2F" />
                <Text className="text-body-small text-error ml-2">
                  Escalation Level {alert.escalationLevel}
                </Text>
              </View>
            </View>
          )}

          {/* Acknowledgment Status */}
          <View className="mb-3">
            <Text className="text-body-small font-medium text-text-primary mb-2">
              Response Status ({alert.acknowledgments.length} responses)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {alert.acknowledgments.slice(0, 5).map((ack) => (
                  <View key={ack.id} className="items-center">
                    <UserAvatar name={ack.userId} size={24} />
                    <View
                      className={`mt-1 px-1 rounded ${getResponseStyle(ack.response).bg}`}>
                      <Text
                        className={`text-label-small ${getResponseStyle(ack.response).text}`}>
                        {formatResponse(ack.response)}
                      </Text>
                    </View>
                  </View>
                ))}
                {alert.acknowledgments.length > 5 && (
                  <View className="items-center justify-center">
                    <View className="w-6 h-6 bg-surface-secondary rounded-full items-center justify-center">
                      <Text className="text-label-small text-text-secondary">
                        +{alert.acknowledgments.length - 5}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            {alert.status === 'active' || alert.status === 'escalated' ? (
              <>
                {!userAcknowledged ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() =>
                        handleAcknowledgeAlert(alert, 'responding')
                      }
                      disabled={isResponding}
                      className="flex-1">
                      I&apos;m Responding
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() =>
                        handleAcknowledgeAlert(alert, 'acknowledged')
                      }
                      disabled={isResponding}
                      className="flex-1">
                      Acknowledged
                    </Button>
                  </>
                ) : (
                  <View className="flex-1 bg-success/10 border border-success/20 rounded-lg p-2">
                    <Text className="text-body-small font-medium text-success text-center">
                      Response Recorded
                    </Text>
                  </View>
                )}

                {/* Emergency Call Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() =>
                    handleEmergencyCall({
                      id: 'emergency',
                      society_id: '',
                      category: 'police',
                      name: alert.contactPerson,
                      primaryPhone: alert.contactNumber,
                      isAvailable24x7: true,
                      responseTime: 'immediate',
                      isActive: true,
                    } as EmergencyContact)
                  }>
                  Call
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.push(`/governance/emergency/${alert.id}`)}
                className="flex-1">
                View Details
              </Button>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderEmergencyContact = (contact: EmergencyContact) => {
    const categoryIcon = getContactCategoryIcon(contact.category);

    return (
      <Card key={contact.id} className="mb-3">
        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <View className="p-2 bg-primary/10 rounded-full mr-3">
                  <LucideIcons name={categoryIcon} size={20} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-body-large font-medium text-text-primary">
                    {contact.name}
                  </Text>
                  {contact.organization && (
                    <Text className="text-body-small text-text-secondary">
                      {contact.organization}
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row items-center mb-1">
                <LucideIcons name="phone" size={14} color="#757575" />
                <Text className="text-body-small text-text-secondary ml-2">
                  {contact.primaryPhone}
                </Text>
                {contact.isAvailable24x7 && (
                  <View className="bg-success/10 px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-label-small text-success">24/7</Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center">
                <LucideIcons name="clock" size={14} color="#757575" />
                <Text className="text-body-small text-text-secondary ml-2">
                  Response: {contact.responseTime}
                </Text>
              </View>
            </View>

            {/* Call Button */}
            <Button
              variant="primary"
              size="sm"
              onPress={() => handleEmergencyCall(contact)}>
              Call
            </Button>
          </View>
        </View>
      </Card>
    );
  };

  const renderCreateAlertButton = () => {
    return (
      <Card className="mb-4">
        <TouchableOpacity
          onPress={() => router.push('/governance/emergency/create')}
          className="p-4 items-center">
          <View className="w-16 h-16 bg-error/10 rounded-full items-center justify-center mb-3">
            <LucideIcons name="alert-circle" size={32} color="#D32F2F" />
          </View>
          <Text className="text-headline-small font-medium text-text-primary mb-1">
            Report Emergency
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Declare an emergency situation that requires immediate attention
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <ScrollView className="p-4">
        {/* Response Metrics */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Response Metrics
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-body-medium text-text-secondary">
                  Average Response Time
                </Text>
                <Text className="text-body-large font-medium text-text-primary">
                  {analytics.responseMetrics.averageResponseTime}m
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-body-medium text-text-secondary">
                  Resolution Time
                </Text>
                <Text className="text-body-large font-medium text-text-primary">
                  {analytics.responseMetrics.averageResolutionTime}m
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-body-medium text-text-secondary">
                  Escalation Rate
                </Text>
                <Text className="text-body-large font-medium text-warning">
                  {(analytics.responseMetrics.escalationRate * 100).toFixed(1)}%
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-body-medium text-text-secondary">
                  False Alarms
                </Text>
                <Text className="text-body-large font-medium text-text-primary">
                  {(analytics.responseMetrics.falseAlarmRate * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Incident Breakdown */}
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Incident Types
            </Text>

            <View className="space-y-2">
              {Object.entries(analytics.incidentBreakdown.byType).map(
                ([type, count]) => (
                  <View
                    key={type}
                    className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <LucideIcons
                        name={getEmergencyTypeIcon(type as EmergencyType)}
                        size={16}
                        color="#757575"
                      />
                      <Text className="text-body-medium text-text-secondary ml-2 flex-1">
                        {formatEmergencyType(type)}
                      </Text>
                    </View>
                    <Text className="text-body-medium font-medium text-text-primary">
                      {count}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        </Card>

        {/* Preparedness Status */}
        <Card>
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-4">
              Preparedness Status
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-body-medium text-text-secondary">
                  Emergency Contacts
                </Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-success rounded-full mr-2" />
                  <Text className="text-body-medium font-medium text-success">
                    {analytics.preparedness.contactsUpdated} Updated
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-body-medium text-text-secondary">
                  Equipment Status
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2 h-2 rounded-full mr-2 ${
                      analytics.preparedness.equipmentStatus === 'good'
                        ? 'bg-success'
                        : analytics.preparedness.equipmentStatus ===
                            'needs_attention'
                          ? 'bg-warning'
                          : 'bg-error'
                    }`}
                  />
                  <Text
                    className={`text-body-medium font-medium ${
                      analytics.preparedness.equipmentStatus === 'good'
                        ? 'text-success'
                        : analytics.preparedness.equipmentStatus ===
                            'needs_attention'
                          ? 'text-warning'
                          : 'text-error'
                    }`}>
                    {formatEquipmentStatus(
                      analytics.preparedness.equipmentStatus,
                    )}
                  </Text>
                </View>
              </View>

              {analytics.preparedness.lastDrillDate && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-body-medium text-text-secondary">
                    Last Emergency Drill
                  </Text>
                  <Text className="text-body-medium font-medium text-text-primary">
                    {new Date(
                      analytics.preparedness.lastDrillDate,
                    ).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-error/5">
        <Text className="text-display-small font-bold text-error mb-2">
          Emergency Management
        </Text>
        <Text className="text-body-large text-text-secondary">
          Real-time emergency response and coordination system
        </Text>
      </View>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <AlertCard
          type="error"
          title={`${activeAlerts.length} Active Emergency${activeAlerts.length > 1 ? ' Alerts' : ' Alert'}`}
          message="Immediate attention required"
          className="mx-4 mt-4"
        />
      )}

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'alerts', label: 'Alerts', count: activeAlerts.length },
          {
            key: 'contacts',
            label: 'Emergency Contacts',
            count: contacts.filter((c) => c.isActive).length,
          },
          { key: 'analytics', label: 'Analytics', count: 0 },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}>
            <View className="items-center">
              <Text
                className={`text-body-medium font-medium ${
                  activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
                }`}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View className="bg-error rounded-full px-2 py-1 mt-1">
                  <Text className="text-label-small text-white">
                    {tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-surface-secondary">
        {activeTab === 'alerts' && (
          <View className="p-4">
            {(userRole === 'committee_member' ||
              userRole === 'admin' ||
              userRole === 'security_guard') &&
              renderCreateAlertButton()}

            {alerts.length > 0 ? (
              alerts.map(renderEmergencyAlert)
            ) : (
              <View className="items-center py-8">
                <LucideIcons name="shield-check" size={48} color="#4CAF50" />
                <Text className="text-headline-small text-success mt-4 mb-2">
                  All Clear
                </Text>
                <Text className="text-body-medium text-text-secondary text-center">
                  No emergency alerts at this time. Your community is safe and
                  secure.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'contacts' && (
          <View className="p-4">
            {contacts.filter((c) => c.isActive).map(renderEmergencyContact)}
          </View>
        )}

        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>
    </View>
  );
};

// Helper functions
const getSeverityStyle = (severity: EmergencySeverity) => {
  const styles = {
    low: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-l-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: '#2563EB',
    },
    medium: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-l-yellow-500',
      iconBg: 'bg-yellow-100',
      iconColor: '#D97706',
    },
    high: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-l-orange-500',
      iconBg: 'bg-orange-100',
      iconColor: '#EA580C',
    },
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-l-red-500',
      iconBg: 'bg-red-100',
      iconColor: '#DC2626',
    },
    disaster: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-l-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: '#7C3AED',
    },
  };
  return styles[severity] || styles.medium;
};

const getStatusStyle = (status: string) => {
  const styles = {
    active: { bg: 'bg-red-50', text: 'text-red-700' },
    escalated: { bg: 'bg-purple-50', text: 'text-purple-700' },
    responding: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    contained: { bg: 'bg-blue-50', text: 'text-blue-700' },
    resolved: { bg: 'bg-green-50', text: 'text-green-700' },
  };
  return styles[status as keyof typeof styles] || styles.active;
};

const getEmergencyTypeIcon = (type: EmergencyType | string) => {
  const icons = {
    fire: 'flame',
    medical: 'heart-pulse',
    security: 'shield',
    natural_disaster: 'cloud-lightning',
    infrastructure: 'hammer',
    power_outage: 'zap-off',
    water_shortage: 'droplets',
    gas_leak: 'triangle-alert',
    elevator: 'arrow-up-circle',
    other: 'alert-circle',
  };
  return icons[type as keyof typeof icons] || 'alert-circle';
};

const getContactCategoryIcon = (category: string) => {
  const icons = {
    police: 'shield',
    fire: 'flame',
    medical: 'heart-pulse',
    gas: 'triangle-alert',
    electricity: 'zap',
    water: 'droplets',
    elevator: 'arrow-up-circle',
    security: 'lock',
    municipal: 'building',
    other: 'phone',
  };
  return icons[category as keyof typeof icons] || 'phone';
};

const getResponseStyle = (response: EmergencyResponse) => {
  const styles = {
    acknowledged: { bg: 'bg-blue-100', text: 'text-blue-700' },
    responding: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    on_site: { bg: 'bg-green-100', text: 'text-green-700' },
    cannot_respond: { bg: 'bg-gray-100', text: 'text-gray-700' },
    false_alarm: { bg: 'bg-red-100', text: 'text-red-700' },
  };
  return styles[response] || styles.acknowledged;
};

const formatResponse = (response: EmergencyResponse): string => {
  return response.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatEmergencyType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatEquipmentStatus = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};
