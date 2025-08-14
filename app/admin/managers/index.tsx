import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Building2, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { RequireSuperAdmin } from '@/components/auth/RoleGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { 
  calculateSocietyHealthScore, 
  getSampleHealthMetrics,
  getHealthScoreColor,
  formatHealthScore 
} from '@/utils/societyHealthScoring';

interface AssignedSocietyDetail {
  id: string;
  name: string;
  totalUnits: number;
  assignedAt: string;
  healthScore: number;
  status: 'healthy' | 'attention_needed' | 'critical';
  lastActivity?: string;
  activeIssues?: number;
}

interface CommunityManager {
  id: string;
  name: string;
  email: string;
  workload: { current: number; capacity: number; utilizationRate: number };
  assignedSocieties: AssignedSocietyDetail[];
  performance: {
    averageResponseTime: number;
    satisfactionScore: number;
    ticketsResolved: number;
  };
}

interface UnassignedSociety {
  id: string;
  name: string;
  city: string;
  state: string;
  totalUnits: number;
  priority: 'high' | 'medium' | 'low';
}

function AdminManagers() {
  const [managers, setManagers] = useState<CommunityManager[]>([
    {
      id: 'mgr_001',
      name: 'Sarah Johnson',
      email: 'sarah@aptly.com',
      workload: { current: 150, capacity: 500, utilizationRate: 30 },
      assignedSocieties: [
        {
          id: 'soc_001', 
          name: 'Green Valley', 
          totalUnits: 150,
          assignedAt: '2024-01-15',
          healthScore: 85,
          status: 'healthy',
          lastActivity: '2 hours ago',
          activeIssues: 2,
        }
      ],
      performance: {
        averageResponseTime: 2.5,
        satisfactionScore: 94,
        ticketsResolved: 47,
      },
    },
    {
      id: 'mgr_002',
      name: 'Michael Chen',
      email: 'michael@aptly.com',
      workload: { current: 280, capacity: 600, utilizationRate: 47 },
      assignedSocieties: [
        {
          id: 'soc_003', 
          name: 'Sunset Plaza', 
          totalUnits: 180,
          assignedAt: '2024-01-10',
          healthScore: 72,
          status: 'attention_needed',
          lastActivity: '5 hours ago',
          activeIssues: 6,
        },
        {
          id: 'soc_004', 
          name: 'Royal Gardens', 
          totalUnits: 100,
          assignedAt: '2024-02-01',
          healthScore: 91,
          status: 'healthy',
          lastActivity: '1 hour ago',
          activeIssues: 1,
        }
      ],
      performance: {
        averageResponseTime: 3.2,
        satisfactionScore: 88,
        ticketsResolved: 63,
      },
    },
  ]);

  const [unassignedSocieties, setUnassignedSocieties] = useState<UnassignedSociety[]>([
    {
      id: 'soc_002',
      name: 'Emerald Heights',
      city: 'Mumbai',
      state: 'Maharashtra',
      totalUnits: 180,
      priority: 'high',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<CommunityManager | null>(null);

  const handleAssign = (manager: CommunityManager) => {
    setSelectedManager(manager);
    setShowModal(true);
  };

  const handleAssignSocietyToManager = async (societyId: string) => {
    if (!selectedManager) return;
    
    const society = unassignedSocieties.find(s => s.id === societyId);
    if (!society) return;

    // Calculate health score for new society
    const healthMetrics = {
      ...getSampleHealthMetrics(),
      totalResidents: society.totalUnits,
      activeResidents: Math.floor(society.totalUnits * 0.9),
      openIssues: society.priority === 'high' ? 8 : society.priority === 'medium' ? 4 : 2,
      paymentComplianceRate: society.priority === 'high' ? 80 : 90,
    };
    
    const healthResult = calculateSocietyHealthScore(healthMetrics);
    
    // Update managers state
    setManagers(prev => prev.map(mgr => 
      mgr.id === selectedManager.id 
        ? {
            ...mgr,
            assignedSocieties: [...mgr.assignedSocieties, {
              id: society.id,
              name: society.name,
              totalUnits: society.totalUnits,
              assignedAt: new Date().toISOString(),
              healthScore: healthResult.overall,
              status: healthResult.status,
              lastActivity: 'Just assigned',
              activeIssues: healthMetrics.openIssues,
            }],
            workload: {
              ...mgr.workload,
              current: mgr.workload.current + society.totalUnits,
              utilizationRate: Math.round(((mgr.workload.current + society.totalUnits) / mgr.workload.capacity) * 100),
            }
          }
        : mgr
    ));

    // Remove from unassigned
    setUnassignedSocieties(prev => prev.filter(s => s.id !== societyId));
    setShowModal(false);
    Alert.alert('Success', `${society.name} assigned to ${selectedManager.name}!`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <RequireSuperAdmin>
      <View className="flex-1 bg-gray-50">
        <AdminHeader title="Manager Assignment" showBack />
        
        <ScrollView className="flex-1 px-4 py-2">
          {unassignedSocieties.length > 0 && (
            <Card className="p-4 bg-orange-50 border-orange-200 mb-4">
              <View className="flex-row items-center">
                <AlertTriangle size={20} color="#d97706" />
                <Text className="text-orange-800 font-semibold ml-2">
                  {unassignedSocieties.length} Unassigned Societies
                </Text>
              </View>
            </Card>
          )}

          <View className="space-y-3">
            {managers.map((manager) => (
              <Card key={manager.id} className="p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {manager.name}
                    </Text>
                    <Text className="text-sm text-gray-600">{manager.email}</Text>
                  </View>
                  <Text className="text-lg font-bold text-green-600">
                    {manager.workload.utilizationRate}%
                  </Text>
                </View>

                <View className="border-t border-gray-200 pt-3 mb-3">
                  <Text className="text-xs text-gray-500 mb-2">
                    Assigned Societies ({manager.assignedSocieties.length})
                  </Text>
                  <View className="space-y-2">
                    {manager.assignedSocieties.map((society) => (
                      <View key={society.id} className="flex-row items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-900">{society.name}</Text>
                          <Text className="text-xs text-gray-600">{society.totalUnits} units</Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-xs font-medium" style={{ color: getHealthScoreColor(society.healthScore) }}>
                            {formatHealthScore(society.healthScore)}
                          </Text>
                          {society.activeIssues !== undefined && society.activeIssues > 0 && (
                            <Text className="text-xs text-orange-600">
                              {society.activeIssues} issues
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <Text className="text-xs text-blue-900 font-medium mb-1">Performance</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-blue-800">Response: {manager.performance.averageResponseTime}h</Text>
                      <Text className="text-xs text-blue-800">Satisfaction: {manager.performance.satisfactionScore}%</Text>
                    </View>
                  </View>
                </View>

                <Button
                  onPress={() => handleAssign(manager)}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={14} color="#374151" />
                  <Text className="text-sm text-gray-700 ml-1">Assign Society</Text>
                </Button>
              </Card>
            ))}
          </View>
        </ScrollView>

        <Modal visible={showModal} transparent animationType="slide">
          <View className="flex-1 bg-black bg-opacity-50 justify-end">
            <View className="bg-white rounded-t-xl max-h-96">
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold">
                  Assign to {selectedManager?.name}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="p-4">
                <View className="space-y-3">
                  {unassignedSocieties.map((society) => (
                    <TouchableOpacity
                      key={society.id}
                      onPress={() => handleAssignSocietyToManager(society.id)}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text className="font-medium">{society.name}</Text>
                          <Text className="text-sm text-gray-600">
                            {society.city}, {society.state}
                          </Text>
                          <Text className={cn("text-sm font-medium", getPriorityColor(society.priority))}>
                            {society.priority.toUpperCase()} PRIORITY
                          </Text>
                        </View>
                        <CheckCircle size={20} color="#059669" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </RequireSuperAdmin>
  );
}

export default AdminManagers;