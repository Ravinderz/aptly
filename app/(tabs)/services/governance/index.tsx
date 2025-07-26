import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import LucideIcons from '@/components/ui/LucideIcons';
import { showSuccessAlert, showErrorAlert } from '@/utils/alert';
import { safeGoBack } from '@/utils/navigation';

// Import our governance components
import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard';
import { VotingSystem } from '@/components/governance/VotingSystem';
import { EmergencyManagement } from '@/components/governance/EmergencyManagement';
import { SuccessionManagement } from '@/components/governance/SuccessionManagement';
import { PolicyGovernance } from '@/components/governance/PolicyGovernance';

// Import types
import type {
  VotingCampaign,
  EmergencyAlert,
  SuccessionPlan,
  PolicyProposal,
  VotingAnalytics,
  EmergencyAnalytics,
  GovernanceDashboard as GovernanceDashboardData
} from '@/types/governance';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/ui/headers';

interface GovernancePageProps {}

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'voting' | 'emergency' | 'succession' | 'policies'>('dashboard');
  const [userRole, setUserRole] = useState<'resident' | 'committee_member' | 'admin'>('resident');
  const [currentUserId, setCurrentUserId] = useState('user-123');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API/context
  const [mockData, setMockData] = useState({
    votingCampaigns: [] as VotingCampaign[],
    emergencyAlerts: [] as EmergencyAlert[],
    successionPlans: [] as SuccessionPlan[],
    policyProposals: [] as PolicyProposal[],
    dashboardData: null as GovernanceDashboardData | null,
    votingAnalytics: null as VotingAnalytics | null,
    emergencyAnalytics: null as EmergencyAnalytics | null
  });

  useEffect(() => {
    // Simulate loading user role and data
    loadGovernanceData();
  }, []);

  const loadGovernanceData = async () => {
    try {
      setIsLoading(true);
      
      // Mock API calls - replace with real API calls
      const mockVotingCampaigns: VotingCampaign[] = [
        {
          id: 'campaign-1',
          title: 'Committee Election 2024',
          description: 'Annual committee member election',
          type: 'election',
          status: 'active',
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-30T23:59:59Z',
          isAnonymous: true,
          allowMultipleChoices: false,
          candidates: [
            {
              id: 'candidate-1',
              name: 'Rajesh Kumar',
              designation: 'Treasurer',
              bio: 'Experienced in financial management',
              imageUrl: null,
              voteCount: 45,
              manifesto: 'Transparent financial management'
            },
            {
              id: 'candidate-2', 
              name: 'Priya Sharma',
              designation: 'Secretary',
              bio: 'Community organizer',
              imageUrl: null,
              voteCount: 38,
              manifesto: 'Better community engagement'
            }
          ],
          options: [],
          totalVotes: 83,
          eligibleVoters: 150,
          createdBy: 'admin-1',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];

      const mockEmergencyAlerts: EmergencyAlert[] = [
        {
          id: 'alert-1',
          title: 'Water Supply Disruption',
          description: 'Water supply will be disrupted from 2 PM to 6 PM for maintenance',
          severity: 'medium',
          category: 'utilities',
          status: 'active',
          affectedAreas: ['Block A', 'Block B'],
          instructions: 'Please store water in advance',
          estimatedDuration: '4 hours',
          contactPerson: 'Maintenance Team',
          contactNumber: '+91-9876543210',
          escalationChain: [
            {
              level: 1,
              contactId: 'contact-1',
              name: 'Site Engineer',
              phone: '+91-9876543210',
              role: 'primary'
            }
          ],
          isResolved: false,
          createdBy: 'admin-1',
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z'
        }
      ];

      const mockDashboardData: GovernanceDashboardData = {
        societyId: 'society-1',
        activeCampaigns: mockVotingCampaigns.length,
        totalResidents: 150,
        activeEmergencies: mockEmergencyAlerts.filter(a => a.status === 'active').length,
        pendingPolicies: 2,
        participationRate: 55.3,
        lastElectionDate: '2023-01-15T00:00:00Z',
        nextElectionDate: '2024-01-15T00:00:00Z',
        committeeMembersCount: 7,
        emergencyContactsCount: 12,
        activeVotingCampaigns: mockVotingCampaigns.filter(c => c.status === 'active').length,
        averageParticipation: 55.3,
        lastEmergencyDate: '2024-01-15T00:00:00Z',
        succession: {
          planExists: false,
          deputiesAssigned: 0
        },
        implementedPoliciesThisYear: 5,
        communityEngagement: {
          eventsThisMonth: 3,
          averageAttendance: 65,
          satisfactionScore: 4.2
        },
        recentActivities: [
          {
            id: 'activity-1',
            type: 'vote_cast',
            description: 'New vote cast in Committee Election 2024',
            timestamp: '2024-01-20T10:30:00Z',
            userId: 'user-456',
            metadata: { campaignId: 'campaign-1' }
          }
        ],
        upcomingEvents: [
          {
            id: 'event-1',
            title: 'Committee Meeting',
            date: '2024-01-25T18:00:00Z',
            type: 'meeting',
            location: 'Community Hall'
          }
        ]
      };

      setMockData({
        votingCampaigns: mockVotingCampaigns,
        emergencyAlerts: mockEmergencyAlerts,
        successionPlans: [],
        policyProposals: [],
        dashboardData: mockDashboardData,
        votingAnalytics: null,
        emergencyAnalytics: null
      });

      // Simulate checking user role (in real app, get from auth context)
      setUserRole('committee_member'); // or get from auth
      
    } catch (error) {
      console.error('Failed to load governance data:', error);
      showErrorAlert('Error', 'Failed to load governance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleCreateCampaign = async (campaign: Partial<VotingCampaign>) => {
    try {
      // API call to create campaign
      console.log('Creating campaign:', campaign);
      showSuccessAlert('Success', 'Campaign created successfully');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to create campaign');
    }
  };

  const handleVote = async (campaignId: string, candidateId: string) => {
    try {
      // API call to submit vote
      console.log('Submitting vote:', { campaignId, candidateId });
      showSuccessAlert('Success', 'Vote submitted successfully');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to submit vote');
    }
  };

  const handleCreateEmergencyAlert = async (alert: Partial<EmergencyAlert>) => {
    try {
      // API call to create emergency alert
      console.log('Creating emergency alert:', alert);
      showSuccessAlert('Success', 'Emergency alert created');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to create emergency alert');
    }
  };

  const handleResolveEmergency = async (alertId: string) => {
    try {
      // API call to resolve emergency
      console.log('Resolving emergency:', alertId);
      showSuccessAlert('Success', 'Emergency resolved');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to resolve emergency');
    }
  };

  const handleCreateSuccessionPlan = async (plan: Partial<SuccessionPlan>) => {
    try {
      // API call to create succession plan
      console.log('Creating succession plan:', plan);
      showSuccessAlert('Success', 'Succession plan created');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to create succession plan');
    }
  };

  const handleTriggerSuccession = async (planId: string) => {
    try {
      // API call to trigger succession
      console.log('Triggering succession:', planId);
      showSuccessAlert('Success', 'Succession triggered');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to trigger succession');
    }
  };

  const handleCreatePolicyProposal = async (proposal: Partial<PolicyProposal>) => {
    try {
      // API call to create policy proposal
      console.log('Creating policy proposal:', proposal);
      showSuccessAlert('Success', 'Policy proposal created');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to create policy proposal');
    }
  };

  const handleVoteOnPolicy = async (proposalId: string, vote: 'approve' | 'reject') => {
    try {
      // API call to vote on policy
      console.log('Voting on policy:', { proposalId, vote });
      showSuccessAlert('Success', 'Vote on policy submitted');
      await loadGovernanceData(); // Refresh data
    } catch (error) {
      showErrorAlert('Error', 'Failed to vote on policy');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-body-large text-text-secondary">Loading governance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return mockData.dashboardData ? (
          <GovernanceDashboard
            dashboardData={mockData.dashboardData}
            votingCampaigns={mockData.votingCampaigns}
            emergencyAlerts={mockData.emergencyAlerts}
            successionPlan={mockData.successionPlans[0]}
            policyProposals={mockData.policyProposals}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        ) : null;

      case 'voting':
        return (
          <VotingSystem
            campaigns={mockData.votingCampaigns}
            userVotes={[]} // Would come from API
            analytics={mockData.votingAnalytics}
            onCreateCampaign={handleCreateCampaign}
            onVote={handleVote}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        );

      case 'emergency':
        return (
          <EmergencyManagement
            alerts={mockData.emergencyAlerts}
            emergencyContacts={[]} // Would come from API
            analytics={mockData.emergencyAnalytics}
            onCreateAlert={handleCreateEmergencyAlert}
            onResolveEmergency={handleResolveEmergency}
            onEmergencyCall={async (contact) => {
              // Handle emergency call
              console.log('Emergency call to:', contact);
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        );

      case 'succession':
        return (
          <SuccessionManagement
            plans={mockData.successionPlans}
            deputies={[]} // Would come from API
            handoverTasks={[]} // Would come from API
            onCreatePlan={handleCreateSuccessionPlan}
            onTriggerSuccession={handleTriggerSuccession}
            onAssignDeputy={async (assignment) => {
              console.log('Assigning deputy:', assignment);
            }}
            onCompleteHandover={async (taskId) => {
              console.log('Completing handover task:', taskId);
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        );

      case 'policies':
        return (
          <PolicyGovernance
            proposals={mockData.policyProposals}
            activePolicies={[]} // Would come from API
            consultations={[]} // Would come from API
            onCreateProposal={handleCreatePolicyProposal}
            onVoteOnPolicy={handleVoteOnPolicy}
            onSubmitFeedback={async (proposalId, feedback) => {
              console.log('Submitting feedback:', { proposalId, feedback });
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TabHeader
        title="Governance Center"
        subtitle="Democratic participation and emergency management"
        notificationCount={2}
        showBackButton
        onBackPress={() => safeGoBack()}
      />

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'dashboard', label: 'Overview', icon: 'home-outline' },
          { key: 'voting', label: 'Voting', icon: 'ballot-outline', count: mockData.votingCampaigns.filter(c => c.status === 'active').length },
          { key: 'emergency', label: 'Emergency', icon: 'warning-outline', count: mockData.emergencyAlerts.filter(a => a.status === 'active').length },
          { key: 'succession', label: 'Leadership', icon: 'people-outline' },
          { key: 'policies', label: 'Policies', icon: 'document-text-outline' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-3 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center relative">
              <LucideIcons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.key ? '#6366f1' : '#757575'} 
              />
              <Text className={`text-label-small font-medium mt-1 ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
              {tab.count && tab.count > 0 && (
                <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                  <Text className="text-white text-label-large font-medium">
                    {tab.count > 99 ? '99+' : tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}