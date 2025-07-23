import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Types
import type { 
  SuccessionPlan, 
  DeputyAssignment, 
  HandoverTask,
  SuccessionStatus,
  TriggerType 
} from '../../types/governance';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserAvatar } from '../ui/UserAvatar';
import { AlertCard } from '../ui/AlertCard';

interface SuccessionManagementProps {
  successionPlan?: SuccessionPlan;
  currentCM: {
    id: string;
    name: string;
    profileImage?: string;
    role: string;
    termStart: string;
    termEnd?: string;
  };
  onCreatePlan: (planData: any) => Promise<void>;
  onUpdatePlan: (planId: string, data: any) => Promise<void>;
  onTriggerSuccession: (planId: string, reason: string) => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const SuccessionManagement: React.FC<SuccessionManagementProps> = ({
  successionPlan,
  currentCM,
  onCreatePlan,
  onUpdatePlan,
  onTriggerSuccession,
  onCompleteTask,
  currentUserId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deputies' | 'tasks' | 'history'>('overview');
  const [selectedDeputy, setSelectedDeputy] = useState<DeputyAssignment | null>(null);
  const [isProcessingTask, setIsProcessingTask] = useState<string | null>(null);

  const isCurrentCM = currentUserId === currentCM.id;
  const isCommitteeOrAdmin = userRole === 'committee_member' || userRole === 'admin';
  const canManageSuccession = isCurrentCM || isCommitteeOrAdmin;

  const activeTriggers = successionPlan?.triggers.filter(t => t.isActive) || [];
  const pendingTasks = successionPlan?.handoverTasks.filter(t => t.status === 'pending' || t.status === 'in_progress') || [];
  const completedTasks = successionPlan?.handoverTasks.filter(t => t.status === 'completed') || [];

  const handleTriggerSuccession = async (reason: string) => {
    if (!successionPlan) return;

    Alert.alert(
      'Trigger Succession',
      'This will initiate the succession process. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            try {
              await onTriggerSuccession(successionPlan.id, reason);
              Alert.alert('Success', 'Succession process has been initiated.');
            } catch (error) {
              Alert.alert('Error', 'Failed to trigger succession process.');
            }
          }
        }
      ]
    );
  };

  const handleCompleteTask = async (task: HandoverTask) => {
    try {
      setIsProcessingTask(task.id);
      await onCompleteTask(task.id);
      Alert.alert('Success', 'Task marked as completed.');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task.');
    } finally {
      setIsProcessingTask(null);
    }
  };

  const renderOverview = () => (
    <ScrollView className="p-4">
      {/* Current CM Info */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-4">
            Current Community Manager
          </Text>
          
          <View className="flex-row items-center mb-4">
            <UserAvatar 
              name={currentCM.name}
              imageUrl={currentCM.profileImage}
              size={56}
            />
            <View className="ml-4 flex-1">
              <Text className="text-body-large font-semibold text-text-primary">
                {currentCM.name}
              </Text>
              <Text className="text-body-medium text-text-secondary">
                {currentCM.role}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="text-body-small text-text-secondary ml-1">
                  Term: {new Date(currentCM.termStart).toLocaleDateString()}
                  {currentCM.termEnd && ` - ${new Date(currentCM.termEnd).toLocaleDateString()}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Succession Plan Status */}
          <View className="border-t border-border-primary pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-medium font-medium text-text-primary">
                Succession Plan Status
              </Text>
              <View className={`px-2 py-1 rounded-full ${getSuccessionStatusStyle(successionPlan?.status || 'active').bg}`}>
                <Text className={`text-label-small font-medium ${getSuccessionStatusStyle(successionPlan?.status || 'active').text}`}>
                  {successionPlan ? successionPlan.status.toUpperCase() : 'NOT SET'}
                </Text>
              </View>
            </View>
            
            {!successionPlan && canManageSuccession && (
              <View className="mt-3">
                <AlertCard
                  type="warning"
                  title="No Succession Plan"
                  message="Create a succession plan to ensure smooth leadership transitions."
                />
                <Button
                  title="Create Succession Plan"
                  variant="primary"
                  size="medium"
                  onPress={() => router.push('/governance/succession/create')}
                  className="mt-3"
                />
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* Active Triggers */}
      {activeTriggers.length > 0 && (
        <Card className="mb-4">
          <View className="p-4">
            <Text className="text-headline-small font-semibold text-text-primary mb-3">
              Active Succession Triggers
            </Text>
            
            {activeTriggers.map((trigger, index) => (
              <View key={index} className="flex-row items-center justify-between py-2">
                <View className="flex-1">
                  <Text className="text-body-medium font-medium text-text-primary">
                    {formatTriggerType(trigger.type)}
                  </Text>
                  <Text className="text-body-small text-text-secondary">
                    {trigger.condition}
                  </Text>
                </View>
                <View className="bg-warning/10 px-2 py-1 rounded-full">
                  <Text className="text-label-small text-warning">ACTIVE</Text>
                </View>
              </View>
            ))}
            
            {canManageSuccession && (
              <Button
                title="Trigger Manual Succession"
                variant="warning"
                size="medium"
                onPress={() => handleTriggerSuccession('Manual succession initiated')}
                className="mt-3"
              />
            )}
          </View>
        </Card>
      )}

      {/* Quick Stats */}
      {successionPlan && (
        <View className="flex-row gap-2 mb-4">
          <Card className="flex-1">
            <View className="p-3 items-center">
              <Text className="text-display-small font-bold text-primary">
                {successionPlan.deputies.filter(d => d.isActive).length}
              </Text>
              <Text className="text-body-small text-text-secondary text-center">
                Active Deputies
              </Text>
            </View>
          </Card>
          
          <Card className="flex-1">
            <View className="p-3 items-center">
              <Text className="text-display-small font-bold text-warning">
                {pendingTasks.length}
              </Text>
              <Text className="text-body-small text-text-secondary text-center">
                Pending Tasks
              </Text>
            </View>
          </Card>
          
          <Card className="flex-1">
            <View className="p-3 items-center">
              <Text className="text-display-small font-bold text-success">
                {completedTasks.length}
              </Text>
              <Text className="text-body-small text-text-secondary text-center">
                Completed
              </Text>
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );

  const renderDeputies = () => (
    <ScrollView className="p-4">
      {successionPlan?.deputies.map((deputy) => (
        <Card key={deputy.userId} className="mb-3">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <UserAvatar name={deputy.userId} size={40} />
                <View className="ml-3 flex-1">
                  <Text className="text-body-large font-semibold text-text-primary">
                    {deputy.userId}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className={`px-2 py-1 rounded-full ${getDeputyRoleStyle(deputy.role).bg}`}>
                      <Text className={`text-label-small font-medium ${getDeputyRoleStyle(deputy.role).text}`}>
                        {formatDeputyRole(deputy.role)}
                      </Text>
                    </View>
                    {deputy.performanceRating && (
                      <View className="flex-row items-center ml-2">
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text className="text-body-small text-text-secondary ml-1">
                          {deputy.performanceRating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              
              <View className={`w-3 h-3 rounded-full ${deputy.isActive ? 'bg-success' : 'bg-gray-400'}`} />
            </View>

            {/* Responsibilities */}
            <View className="mb-3">
              <Text className="text-body-medium font-medium text-text-primary mb-2">
                Responsibilities
              </Text>
              <View className="flex-row flex-wrap gap-1">
                {deputy.responsibilities.map((resp, index) => (
                  <View key={index} className="bg-surface-secondary px-2 py-1 rounded-full">
                    <Text className="text-label-small text-text-secondary">{resp}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Assignment Details */}
            <View className="flex-row items-center justify-between text-sm">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text className="text-body-small text-text-secondary ml-1">
                  Assigned: {new Date(deputy.assignedAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedDeputy(deputy)}
                className="flex-row items-center"
              >
                <Text className="text-body-small text-primary mr-1">Details</Text>
                <Ionicons name="chevron-forward" size={14} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      )) || (
        <View className="items-center py-8">
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            No Deputies Assigned
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Assign deputy members to ensure leadership continuity.
          </Text>
          {canManageSuccession && (
            <Button
              title="Assign Deputy"
              variant="primary"
              size="medium"
              onPress={() => router.push('/governance/succession/deputies')}
              className="mt-4"
            />
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderTasks = () => (
    <ScrollView className="p-4">
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <View className="mb-6">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Pending Tasks ({pendingTasks.length})
          </Text>
          
          {pendingTasks.map((task) => (
            <Card key={task.id} className="mb-3">
              <View className="p-4">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-body-large font-semibold text-text-primary mb-1">
                      {task.title}
                    </Text>
                    <Text className="text-body-medium text-text-secondary mb-2">
                      {task.description}
                    </Text>
                    
                    <View className="flex-row items-center gap-3">
                      <View className={`px-2 py-1 rounded-full ${getCategoryStyle(task.category).bg}`}>
                        <Text className={`text-label-small font-medium ${getCategoryStyle(task.category).text}`}>
                          {formatCategory(task.category)}
                        </Text>
                      </View>
                      
                      <View className={`px-2 py-1 rounded-full ${getPriorityStyle(task.priority).bg}`}>
                        <Text className={`text-label-small font-medium ${getPriorityStyle(task.priority).text}`}>
                          {task.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View className={`px-2 py-1 rounded-full ${getTaskStatusStyle(task.status).bg}`}>
                    <Text className={`text-label-small font-medium ${getTaskStatusStyle(task.status).text}`}>
                      {task.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border-primary">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text className="text-body-small text-text-secondary ml-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {task.assignedTo === currentUserId && (
                    <Button
                      title={isProcessingTask === task.id ? "Completing..." : "Mark Complete"}
                      variant="success"
                      size="small"
                      onPress={() => handleCompleteTask(task)}
                      disabled={isProcessingTask === task.id}
                    />
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <View>
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Completed Tasks ({completedTasks.length})
          </Text>
          
          {completedTasks.map((task) => (
            <Card key={task.id} className="mb-3 opacity-75">
              <View className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-body-large font-medium text-text-primary flex-1">
                    {task.title}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-body-small text-success ml-1">
                      {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Completed'}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-body-small text-text-secondary">
                  Completed by: {task.completedBy || 'Unknown'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {pendingTasks.length === 0 && completedTasks.length === 0 && (
        <View className="items-center py-8">
          <Ionicons name="checkmark-done-outline" size={48} color="#9CA3AF" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            No Handover Tasks
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Handover tasks will appear here during succession transitions.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderHistory = () => (
    <ScrollView className="p-4">
      {successionPlan?.auditLog.map((entry) => (
        <Card key={entry.id} className="mb-3">
          <View className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-body-medium font-medium text-text-primary">
                {formatAuditAction(entry.action)}
              </Text>
              <Text className="text-body-small text-text-secondary">
                {new Date(entry.timestamp).toLocaleDateString()}
              </Text>
            </View>
            
            <Text className="text-body-small text-text-secondary">
              By: {entry.userId}
            </Text>
            
            {entry.details && Object.keys(entry.details).length > 0 && (
              <View className="mt-2 p-2 bg-surface-secondary rounded">
                <Text className="text-body-small text-text-secondary">
                  {JSON.stringify(entry.details, null, 2)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      )) || (
        <View className="items-center py-8">
          <Ionicons name="time-outline" size={48} color="#9CA3AF" />
          <Text className="text-headline-small text-text-secondary mt-4 mb-2">
            No History Available
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Succession history and audit trail will appear here.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Succession Management
        </Text>
        <Text className="text-body-large text-text-secondary">
          Leadership transition planning and continuity management
        </Text>
      </View>

      {/* Status Banner */}
      {successionPlan?.status === 'triggered' && (
        <AlertCard
          type="warning"
          title="Succession Process Active"
          message="Leadership transition is currently in progress"
          className="mx-4 mt-4"
        />
      )}

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'overview', label: 'Overview', icon: 'home-outline' },
          { key: 'deputies', label: 'Deputies', icon: 'people-outline' },
          { key: 'tasks', label: 'Tasks', icon: 'list-outline' },
          { key: 'history', label: 'History', icon: 'time-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center">
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.key ? '#6366f1' : '#6B7280'} 
              />
              <Text className={`text-body-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'deputies' && renderDeputies()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'history' && renderHistory()}
      </View>
    </View>
  );
};

// Helper functions
const getSuccessionStatusStyle = (status: SuccessionStatus) => {
  const styles = {
    active: { bg: 'bg-green-50', text: 'text-green-700' },
    triggered: { bg: 'bg-orange-50', text: 'text-orange-700' },
    in_transition: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-700' },
    cancelled: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700' };
};

const getDeputyRoleStyle = (role: string) => {
  const styles = {
    primary_deputy: { bg: 'bg-blue-50', text: 'text-blue-700' },
    secondary_deputy: { bg: 'bg-green-50', text: 'text-green-700' },
    emergency_deputy: { bg: 'bg-red-50', text: 'text-red-700' },
    specialized_deputy: { bg: 'bg-purple-50', text: 'text-purple-700' }
  };
  return styles[role as keyof typeof styles] || styles.specialized_deputy;
};

const getCategoryStyle = (category: string) => {
  const styles = {
    financial: { bg: 'bg-green-50', text: 'text-green-700' },
    legal: { bg: 'bg-blue-50', text: 'text-blue-700' },
    operational: { bg: 'bg-orange-50', text: 'text-orange-700' },
    administrative: { bg: 'bg-purple-50', text: 'text-purple-700' },
    technical: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
    relationships: { bg: 'bg-pink-50', text: 'text-pink-700' }
  };
  return styles[category as keyof typeof styles] || styles.operational;
};

const getPriorityStyle = (priority: string) => {
  const styles = {
    critical: { bg: 'bg-red-50', text: 'text-red-700' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    low: { bg: 'bg-green-50', text: 'text-green-700' }
  };
  return styles[priority as keyof typeof styles] || styles.medium;
};

const getTaskStatusStyle = (status: string) => {
  const styles = {
    pending: { bg: 'bg-gray-50', text: 'text-gray-700' },
    in_progress: { bg: 'bg-blue-50', text: 'text-blue-700' },
    completed: { bg: 'bg-green-50', text: 'text-green-700' },
    blocked: { bg: 'bg-red-50', text: 'text-red-700' },
    deferred: { bg: 'bg-yellow-50', text: 'text-yellow-700' }
  };
  return styles[status as keyof typeof styles] || styles.pending;
};

const formatTriggerType = (type: TriggerType): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDeputyRole = (role: string): string => {
  return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatCategory = (category: string): string => {
  return category.replace(/\b\w/g, l => l.toUpperCase());
};

const formatAuditAction = (action: string): string => {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};