import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Building2,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MessageSquare,
} from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { RequireManager } from '@/components/auth/RoleGuard';
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

interface SocietyDetail {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  activeIssues: number;
  resolvedIssues: number;
  lastActivity: string;
  healthScore: number;
  status: 'healthy' | 'attention_needed' | 'critical';
  assignedDate: string;
  managerNotes?: string;
  primaryContact: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
  healthBreakdown?: {
    engagement: number;
    issueManagement: number;
    financial: number;
    communication: number;
    maintenance: number;
    satisfaction: number;
  };
  recommendations?: string[];
  trends?: {
    direction: 'improving' | 'declining' | 'stable';
    changePercentage: number;
    period: string;
  };
  recentActivity: {
    id: string;
    type: 'ticket' | 'resolution' | 'communication' | 'maintenance';
    title: string;
    description: string;
    timestamp: string;
  }[];
}

function SocietyDetail() {
  const router = useRouter();
  const { societyId } = useLocalSearchParams<{ societyId: string }>();
  const { user, logout } = useDirectAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [society, setSociety] = useState<SocietyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (societyId) {
      loadSocietyDetail();
    }
  }, [societyId]);

  const loadSocietyDetail = async () => {
    try {
      setLoading(true);
      
      // Generate health metrics and scores
      const healthMetrics = {
        ...getSampleHealthMetrics(),
        totalResidents: societyId === '2' ? 200 : 150,
        activeResidents: societyId === '2' ? 185 : 142,
        openIssues: societyId === '2' ? 8 : societyId === '4' ? 15 : 3,
        paymentComplianceRate: societyId === '2' ? 85 : societyId === '4' ? 70 : 92,
        residentSatisfactionScore: societyId === '2' ? 3.5 : societyId === '4' ? 2.8 : 4.2,
        communityParticipation: societyId === '2' ? 45 : societyId === '4' ? 25 : 65,
      };
      
      const healthResult = calculateSocietyHealthScore(healthMetrics, undefined, societyId === '2' ? 70 : 80);
      
      // Mock data based on societyId - replace with actual API call
      const mockSociety: SocietyDetail = {
        id: societyId || '1',
        name: societyId === '2' ? 'Sunrise Apartments' : 
              societyId === '3' ? 'Metro Heights' :
              societyId === '4' ? 'Royal Gardens' : 'Green Valley Society',
        address: societyId === '2' ? '456 East Wing, Pune' :
                 societyId === '3' ? '789 Central Avenue, Delhi' :
                 societyId === '4' ? '321 Park Lane, Bangalore' : '123 Garden Street, Mumbai',
        totalUnits: societyId === '2' ? 200 : societyId === '3' ? 100 : societyId === '4' ? 75 : 150,
        occupiedUnits: societyId === '2' ? 185 : societyId === '3' ? 95 : societyId === '4' ? 68 : 142,
        activeIssues: societyId === '2' ? 8 : societyId === '4' ? 15 : societyId === '3' ? 1 : 3,
        resolvedIssues: societyId === '2' ? 32 : societyId === '4' ? 8 : societyId === '3' ? 23 : 47,
        lastActivity: societyId === '2' ? '1 day ago' : societyId === '4' ? '5 days ago' : '2 hours ago',
        healthScore: healthResult.overall,
        status: healthResult.status,
        assignedDate: '2024-01-15',
        managerNotes: societyId === '2' ? 'Multiple maintenance issues, needs attention' :
                      societyId === '4' ? 'Critical issues with water supply and security' :
                      'Good engagement, proactive residents',
        primaryContact: {
          name: societyId === '2' ? 'Sarah Smith' :
                societyId === '3' ? 'Mike Johnson' :
                societyId === '4' ? 'Lisa Brown' : 'John Doe',
          phone: `+91-987654321${societyId || '0'}`,
          email: `contact@${(societyId === '2' ? 'sunrise' :
                            societyId === '3' ? 'metroheights' :
                            societyId === '4' ? 'royalgardens' : 'greenvalley')}.com`,
          role: 'Society Secretary',
        },
        healthBreakdown: healthResult.breakdown,
        recommendations: healthResult.recommendations,
        trends: healthResult.trends,
        recentActivity: [
          {
            id: '1',
            type: 'ticket',
            title: 'Water Supply Issue Reported',
            description: 'Resident reported low water pressure in Block A',
            timestamp: '2 hours ago',
          },
          {
            id: '2',
            type: 'resolution',
            title: 'Elevator Maintenance Completed',
            description: 'Monthly maintenance completed for all elevators',
            timestamp: '1 day ago',
          },
          {
            id: '3',
            type: 'communication',
            title: 'Monthly Notice Sent',
            description: 'Sent maintenance charges notice to all residents',
            timestamp: '3 days ago',
          },
        ],
      };
      
      setSociety(mockSociety);
    } catch (error) {
      console.error('Failed to load society detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSocietyDetail();
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

  const getActivityIcon = (type: SocietyDetail['recentActivity'][0]['type']) => {
    switch (type) {
      case 'ticket': return <AlertCircle size={16} color="#dc2626" />;
      case 'resolution': return <CheckCircle size={16} color="#059669" />;
      case 'communication': return <MessageSquare size={16} color="#0284c7" />;
      case 'maintenance': return <Building2 size={16} color="#7c3aed" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  if (loading || !society) {
    return (
      <RequireManager>
        <View className="flex-1 justify-center items-center bg-gray-50">
          <Building2 size={48} color="#6b7280" />
          <Text className="text-gray-600 mt-4">Loading society details...</Text>
        </View>
      </RequireManager>
    );
  }

  return (
    <RequireManager>
      <View className="flex-1 bg-gray-50">
        <AdminHeader 
          title={society.name}
          subtitle={`${society.occupiedUnits}/${society.totalUnits} units occupied`}
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
          showsVerticalScrollIndicator={false}
        >
          {/* Health Score Overview */}
          <View className="px-4 py-2">
            <Card className="p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  Health Score
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold" style={{ color: getHealthScoreColor(society.healthScore) }}>
                    {society.healthScore}%
                  </Text>
                  <Text className="text-sm text-gray-600 ml-2">
                    {formatHealthScore(society.healthScore)}
                  </Text>
                </View>
              </View>
              
              {society.trends && society.trends.direction !== 'stable' && (
                <View className="flex-row items-center mb-3">
                  {society.trends.direction === 'improving' ? 
                    <TrendingUp size={16} color="#059669" /> : 
                    <TrendingDown size={16} color="#dc2626" />
                  }
                  <Text className={cn("text-sm ml-1", 
                    society.trends.direction === 'improving' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {society.trends.direction === 'improving' ? 'Improving' : 'Declining'} by {society.trends.changePercentage}%
                  </Text>
                </View>
              )}

              {/* Health Breakdown */}
              {society.healthBreakdown && (
                <View className="mt-3">
                  <Text className="text-sm font-medium text-gray-900 mb-2">Health Breakdown</Text>
                  <View className="space-y-2">
                    {Object.entries(society.healthBreakdown).map(([category, score]) => (
                      <View key={category} className="flex-row items-center justify-between">
                        <Text className="text-sm text-gray-600 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: getHealthScoreColor(score) }}>
                          {score}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          </View>

          {/* Quick Stats */}
          <View className="px-4 py-2">
            <View className="flex-row flex-wrap gap-3 mb-4">
              <Card className="flex-1 min-w-[140px] p-3">
                <View className="flex-row items-center justify-between mb-1">
                  <User size={20} color="#0284c7" />
                  <Text className="text-lg font-bold text-gray-900">
                    {society.occupiedUnits}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600">Occupied Units</Text>
                <Text className="text-xs text-gray-500">
                  of {society.totalUnits} total
                </Text>
              </Card>

              <Card className="flex-1 min-w-[140px] p-3">
                <View className="flex-row items-center justify-between mb-1">
                  <AlertCircle size={20} color="#dc2626" />
                  <Text className="text-lg font-bold text-gray-900">
                    {society.activeIssues}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600">Active Issues</Text>
                <Text className="text-xs text-gray-500">
                  {society.resolvedIssues} resolved
                </Text>
              </Card>

              <Card className="flex-1 min-w-[140px] p-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Clock size={20} color="#7c3aed" />
                  <Text className="text-sm font-bold text-gray-900">
                    {society.lastActivity}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600">Last Activity</Text>
              </Card>
            </View>
          </View>

          {/* Contact Information */}
          <View className="px-4 py-2">
            <Card className="p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Primary Contact
              </Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <User size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-900 ml-2 font-medium">
                    {society.primaryContact.name}
                  </Text>
                  <Text className="text-sm text-gray-600 ml-2">
                    ({society.primaryContact.role})
                  </Text>
                </View>
                
                <TouchableOpacity className="flex-row items-center">
                  <Phone size={16} color="#6b7280" />
                  <Text className="text-sm text-blue-600 ml-2">
                    {society.primaryContact.phone}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center">
                  <Mail size={16} color="#6b7280" />
                  <Text className="text-sm text-blue-600 ml-2">
                    {society.primaryContact.email}
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row items-start">
                  <MapPin size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600 ml-2 flex-1">
                    {society.address}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Recommendations */}
          {society.recommendations && society.recommendations.length > 0 && (
            <View className="px-4 py-2">
              <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
                <Text className="text-lg font-semibold text-blue-900 mb-3">
                  Recommendations
                </Text>
                <View className="space-y-2">
                  {society.recommendations.map((recommendation, index) => (
                    <Text key={index} className="text-sm text-blue-800">
                      • {recommendation}
                    </Text>
                  ))}
                </View>
              </Card>
            </View>
          )}

          {/* Manager Notes */}
          {society.managerNotes && (
            <View className="px-4 py-2">
              <Card className="p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Manager Notes
                </Text>
                <Text className="text-sm text-gray-700">
                  {society.managerNotes}
                </Text>
              </Card>
            </View>
          )}

          {/* Recent Activity */}
          <View className="px-4 py-2 mb-6">
            <Card className="p-4">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </Text>
              
              <View className="space-y-3">
                {society.recentActivity.map((activity) => (
                  <View key={activity.id} className="flex-row items-start">
                    <View className="mr-3 mt-1">
                      {getActivityIcon(activity.type)}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900 mb-1">
                        {activity.title}
                      </Text>
                      <Text className="text-sm text-gray-600 mb-1">
                        {activity.description}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {activity.timestamp}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* Quick Actions */}
          <View className="px-4 py-2 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </Text>
            
            <View className="flex-row flex-wrap gap-3">
              <Button
                variant="primary"
                className="flex-1 min-w-[140px]"
                onPress={() => {/* Handle create ticket */}}
              >
                Create Ticket
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 min-w-[140px]"
                onPress={() => {/* Handle send notice */}}
              >
                Send Notice
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 min-w-[140px]"
                onPress={() => {/* Handle view reports */}}
              >
                View Reports
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </RequireManager>
  );
}

// Add proper named export with displayName for React DevTools
SocietyDetail.displayName = 'SocietyDetail';

export default SocietyDetail;