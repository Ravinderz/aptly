import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  AlertTriangle, 
  Shield, 
  Plus, 
  Bell, 
  Activity,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { cn } from '@/utils/cn';
import type { EmergencyAlert } from '@/types/security';

export interface EmergencyAlertCardProps {
  alert: EmergencyAlert;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onPress?: (alert: EmergencyAlert) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * Emergency Alert Card Component
 * 
 * Features:
 * - Visual alert representation
 * - Severity-based color coding
 * - Quick action buttons
 * - Status indicators
 * - Time tracking
 */
const EmergencyAlertCard = ({
  alert,
  onAcknowledge,
  onResolve,
  onPress,
  showActions = true,
  className
}: EmergencyAlertCardProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#fef2f2';
      case 'high': return '#fff7ed';
      case 'medium': return '#fffbeb';
      case 'low': return '#f0fdf4';
      default: return '#f9fafb';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield size={20} color="#6b7280" />;
      case 'medical': return <Plus size={20} color="#6b7280" />;
      case 'fire': return <AlertTriangle size={20} color="#6b7280" />;
      case 'evacuation': return <Activity size={20} color="#6b7280" />;
      default: return <Bell size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#dc2626';
      case 'acknowledged': return '#f59e0b';
      case 'resolved': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m ago`;
    }
    return `${diffMins}m ago`;
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent onPress={() => onPress?.(alert)} activeOpacity={onPress ? 0.7 : 1}>
      <Card className={cn('p-4 bg-white', className)}>
        <View 
          className="flex-row items-start p-3 rounded-lg mb-3"
          style={{ backgroundColor: getSeverityBgColor(alert.severity) }}
        >
          <View className="mr-3 mt-1">
            {getTypeIcon(alert.type)}
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View 
                className="px-2 py-1 rounded-full mr-2"
                style={{ backgroundColor: getSeverityColor(alert.severity) }}
              >
                <Text className="text-xs font-medium text-white capitalize">
                  {alert.severity}
                </Text>
              </View>
              <View 
                className="px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: alert.status === 'resolved' ? '#f0fdf4' : 
                                   alert.status === 'acknowledged' ? '#fffbeb' : '#fef2f2' 
                }}
              >
                <Text 
                  className="text-xs font-medium capitalize"
                  style={{ color: getStatusColor(alert.status) }}
                >
                  {alert.status}
                </Text>
              </View>
            </View>
            
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {alert.title}
            </Text>
            <Text className="text-gray-700 mb-3">
              {alert.description}
            </Text>
            
            <View className="flex-row items-center text-sm text-gray-500 mb-2">
              {alert.location && (
                <>
                  <MapPin size={14} color="#6b7280" />
                  <Text className="ml-1 mr-4">{alert.location}</Text>
                </>
              )}
              <User size={14} color="#6b7280" />
              <Text className="ml-1 mr-4">{alert.reportedBy}</Text>
              <Clock size={14} color="#6b7280" />
              <Text className="ml-1">{formatTimeAgo(alert.reportedAt)}</Text>
            </View>
            
            {alert.resolutionNotes && (
              <View className="mt-2 p-2 bg-green-50 rounded">
                <Text className="text-sm text-green-800">
                  <Text className="font-medium">Resolution: </Text>
                  {alert.resolutionNotes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {showActions && alert.status !== 'resolved' && (
          <View className="flex-row space-x-2">
            {alert.status === 'active' && onAcknowledge && (
              <Button
                variant="secondary"
                size="sm"
                onPress={() => onAcknowledge(alert.id)}
                className="flex-1"
              >
                <View className="flex-row items-center">
                  <CheckCircle size={14} color="#6366f1" />
                  <Text className="text-indigo-600 font-medium ml-1">Acknowledge</Text>
                </View>
              </Button>
            )}
            
            {onResolve && (
              <Button
                variant="success"
                size="sm"
                onPress={() => onResolve(alert.id)}
                className="flex-1"
              >
                <View className="flex-row items-center">
                  <XCircle size={14} color="#ffffff" />
                  <Text className="text-white font-medium ml-1">Resolve</Text>
                </View>
              </Button>
            )}
          </View>
        )}
      </Card>
    </CardComponent>
  );
};

EmergencyAlertCard.displayName = 'EmergencyAlertCard';

export default EmergencyAlertCard;