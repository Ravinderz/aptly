import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import LucideIcons from '../ui/LucideIcons';
import { router } from 'expo-router';

// Components
import { VotingSystem } from './VotingSystem';
import { EmergencyManagement } from './EmergencyManagement';
import { SuccessionManagement } from './SuccessionManagement';
import { PolicyGovernance } from './PolicyGovernance';

// Types
import type {
  GovernanceDashboard as DashboardData,
  VotingCampaign,
  EmergencyAlert,
  SuccessionPlan,
  PolicyProposal,
} from '../../types/governance';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCard } from '../ui/AlertCard';

interface GovernanceDashboardProps {
  dashboardData: DashboardData;
  votingCampaigns: VotingCampaign[];
  emergencyAlerts: EmergencyAlert[];
  successionPlan?: SuccessionPlan;
  policyProposals: PolicyProposal[];
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const GovernanceDashboard: React.FC<GovernanceDashboardProps> = ({
  dashboardData,
  votingCampaigns,
  emergencyAlerts,
  successionPlan,
  policyProposals,
  currentUserId,
  userRole,
}) => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'voting' | 'emergency' | 'succession' | 'policies'
  >('overview');

  const activeEmergencies = (emergencyAlerts || []).filter(
    (alert) => alert.status === 'active' || alert.status === 'escalated',
  );

  const activeVoting = (votingCampaigns || []).filter(
    (campaign) => campaign.status === 'active',
  );

  const pendingPolicies = (policyProposals || []).filter(
    (policy) =>
      policy.status === 'voting' || policy.status === 'public_consultation',
  );

  const renderOverview = () => (
    <ScrollView className="p-4">
      {/* Emergency Alerts Banner */}
      {activeEmergencies.length > 0 && (
        <AlertCard
          type="error"
          title={`${activeEmergencies.length} Active Emergency Alert${activeEmergencies.length > 1 ? 's' : ''}`}
          message="Immediate attention required"
          className="mb-4"
          onPress={() => setActiveSection('emergency')}
        />
      )}

      {/* Quick Stats */}
      <View className="grid grid-cols-2 gap-3 mb-6">
        {/* Voting Stats */}
        <TouchableOpacity
          onPress={() => setActiveSection('voting')}
          className="col-span-1">
          <Card className="h-24">
            <View className="p-4 items-center justify-center h-full">
              <View className="flex-row items-center mb-1">
                <LucideIcons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#6366f1"
                />
                <Text className="text-display-small font-bold text-primary ml-2">
                  {dashboardData.activeVotingCampaigns}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Active Voting
              </Text>
              {dashboardData.averageParticipation > 0 && (
                <Text className="text-label-small text-success mt-1">
                  {dashboardData.averageParticipation.toFixed(0)}% participation
                </Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Emergency Stats */}
        <TouchableOpacity
          onPress={() => setActiveSection('emergency')}
          className="col-span-1">
          <Card className="h-24">
            <View className="p-4 items-center justify-center h-full">
              <View className="flex-row items-center mb-1">
                <LucideIcons
                  name="alert-circle"
                  size={20}
                  color={activeEmergencies.length > 0 ? '#D32F2F' : '#4CAF50'}
                />
                <Text
                  className={`text-display-small font-bold ml-2 ${
                    activeEmergencies.length > 0 ? 'text-error' : 'text-success'
                  }`}>
                  {dashboardData.activeEmergencies}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Active Emergencies
              </Text>
              {dashboardData.lastEmergencyDate && (
                <Text className="text-label-small text-text-secondary mt-1">
                  Last:{' '}
                  {new Date(
                    dashboardData.lastEmergencyDate,
                  ).toLocaleDateString()}
                </Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Policy Stats */}
        <TouchableOpacity
          onPress={() => setActiveSection('policies')}
          className="col-span-1">
          <Card className="h-24">
            <View className="p-4 items-center justify-center h-full">
              <View className="flex-row items-center mb-1">
                <LucideIcons
                  name="document-text-outline"
                  size={20}
                  color="#FF9800"
                />
                <Text className="text-display-small font-bold text-warning ml-2">
                  {dashboardData.pendingPolicies}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Pending Policies
              </Text>
              <Text className="text-label-small text-success mt-1">
                {dashboardData.implementedPoliciesThisYear} implemented
              </Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Succession Stats */}
        <TouchableOpacity
          onPress={() => setActiveSection('succession')}
          className="col-span-1">
          <Card className="h-24">
            <View className="p-4 items-center justify-center h-full">
              <View className="flex-row items-center mb-1">
                <LucideIcons
                  name="people-outline"
                  size={20}
                  color={
                    dashboardData.succession.planExists ? '#4CAF50' : '#D32F2F'
                  }
                />
                <Text
                  className={`text-display-small font-bold ml-2 ${
                    dashboardData.succession.planExists
                      ? 'text-success'
                      : 'text-error'
                  }`}>
                  {dashboardData.succession.deputiesAssigned}
                </Text>
              </View>
              <Text className="text-body-small text-text-secondary text-center">
                Deputies Assigned
              </Text>
              <Text
                className={`text-label-small mt-1 ${
                  dashboardData.succession.planExists
                    ? 'text-success'
                    : 'text-error'
                }`}>
                {dashboardData.succession.planExists
                  ? 'Plan Active'
                  : 'No Plan'}
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Community Engagement */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Community Engagement
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <LucideIcons
                  name="calendar-outline"
                  size={16}
                  color="#757575"
                />
                <Text className="text-body-medium text-text-secondary ml-2">
                  Events This Month
                </Text>
              </View>
              <Text className="text-body-medium font-medium text-text-primary">
                {dashboardData.communityEngagement.eventsThisMonth}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <LucideIcons name="people-outline" size={16} color="#757575" />
                <Text className="text-body-medium text-text-secondary ml-2">
                  Average Attendance
                </Text>
              </View>
              <Text className="text-body-medium font-medium text-text-primary">
                {dashboardData.communityEngagement.averageAttendance}%
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <LucideIcons name="star-outline" size={16} color="#757575" />
                <Text className="text-body-medium text-text-secondary ml-2">
                  Satisfaction Score
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-body-medium font-medium text-text-primary mr-1">
                  {dashboardData.communityEngagement.satisfactionScore}/5
                </Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <LucideIcons
                      key={i}
                      name={
                        i <= dashboardData.communityEngagement.satisfactionScore
                          ? 'star'
                          : 'star-outline'
                      }
                      size={12}
                      color="#FF9800"
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-4">
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Quick Actions
          </Text>

          <View className="space-y-2">
            {activeVoting.length > 0 && (
              <Button
                variant="primary"
                size="md"
                onPress={() => setActiveSection('voting')}
                className="w-full">
                {`Vote in ${activeVoting.length} Campaign${activeVoting.length > 1 ? 's' : ''}`}
              </Button>
            )}

            {pendingPolicies.length > 0 && (
              <Button
                variant="secondary"
                size="md"
                onPress={() => setActiveSection('policies')}
                className="w-full">
                {`Review ${pendingPolicies.length} Policy Proposal${pendingPolicies.length > 1 ? 's' : ''}`}
              </Button>
            )}

            {(userRole === 'committee_member' || userRole === 'admin') && (
              <Button
                variant="secondary"
                size="md"
                onPress={() => router.push('/governance/emergency/create')}
                className="w-full">
                Report Emergency
              </Button>
            )}
          </View>
        </View>
      </Card>

      {/* Recent Activity */}
      <Card>
        <View className="p-4">
          <Text className="text-headline-small font-semibold text-text-primary mb-3">
            Recent Activity
          </Text>

          <View className="space-y-3">
            {/* Sample recent activities - would be populated from API */}
            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-body-medium text-text-primary">
                  New policy proposal: &quot;Updated Parking Rules&quot;
                </Text>
                <Text className="text-body-small text-text-secondary">
                  2 hours ago • Public consultation phase
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-success rounded-full mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-body-medium text-text-primary">
                  Voting completed: &quot;Committee Member Election&quot;
                </Text>
                <Text className="text-body-small text-text-secondary">
                  1 day ago • 87% participation rate
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-2 h-2 bg-warning rounded-full mt-2 mr-3" />
              <View className="flex-1">
                <Text className="text-body-medium text-text-primary">
                  Emergency resolved: &quot;Elevator maintenance&quot;
                </Text>
                <Text className="text-body-small text-text-secondary">
                  3 days ago • Response time: 15 minutes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderSectionNavigation = () => (
    <View className="flex-row bg-surface-primary border-b border-border-primary">
      {[
        { key: 'overview', label: 'Overview', icon: 'home' },
        {
          key: 'voting',
          label: 'Voting',
          icon: 'vote',
          badge: activeVoting.length,
        },
        {
          key: 'emergency',
          label: 'Emergency',
          icon: 'alert-circle',
          badge: activeEmergencies.length,
        },
        { key: 'succession', label: 'Succession', icon: 'users' },
        {
          key: 'policies',
          label: 'Policies',
          icon: 'file-text',
          badge: pendingPolicies.length,
        },
      ].map((section) => (
        <TouchableOpacity
          key={section.key}
          onPress={() => setActiveSection(section.key as any)}
          className={`flex-1 p-3 border-b-2 ${
            activeSection === section.key
              ? 'border-primary'
              : 'border-transparent'
          }`}>
          <View className="items-center relative">
            <LucideIcons
              name={section.icon as any}
              size={18}
              color={activeSection === section.key ? '#6366f1' : '#757575'}
            />
            <Text
              className={`text-label-small font-medium mt-1 ${
                activeSection === section.key
                  ? 'text-primary'
                  : 'text-text-secondary'
              }`}>
              {section.label}
            </Text>
            {section.badge && section.badge > 0 && (
              <View className="absolute -top-1 -right-1 bg-error rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                <Text className="text-white text-label-large font-medium">
                  {section.badge > 99 ? '99+' : section.badge}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="flex-1">
      {/* Main Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Governance Center
        </Text>
        <Text className="text-body-large text-text-secondary">
          Democratic participation and community management
        </Text>
      </View>

      {/* Section Navigation */}
      {renderSectionNavigation()}

      {/* Content */}
      <View className="flex-1 bg-surface-secondary">
        {activeSection === 'overview' && renderOverview()}

        {activeSection === 'voting' && (
          <VotingSystem
            campaigns={votingCampaigns}
            onCastVote={async (campaignId, candidateId, optionId) => {
              // Implementation would go here
              console.log('Cast vote:', { campaignId, candidateId, optionId });
            }}
            onCreateCampaign={async (campaignData) => {
              // Implementation would go here
              console.log('Create campaign:', campaignData);
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        )}

        {activeSection === 'emergency' && (
          <EmergencyManagement
            alerts={emergencyAlerts}
            contacts={[]} // Would be passed from props
            onCreateAlert={async (alertData) => {
              // Implementation would go here
              console.log('Create alert:', alertData);
            }}
            onUpdateAlert={async (alertId, data) => {
              // Implementation would go here
              console.log('Update alert:', { alertId, data });
            }}
            onAcknowledgeAlert={async (alertId, response, notes) => {
              // Implementation would go here
              console.log('Acknowledge alert:', { alertId, response, notes });
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        )}

        {activeSection === 'succession' && (
          <SuccessionManagement
            successionPlan={successionPlan}
            currentCM={{
              id: 'cm-1',
              name: 'Current CM Name',
              role: 'Community Manager',
              termStart: '2024-01-01',
            }}
            onCreatePlan={async (planData) => {
              // Implementation would go here
              console.log('Create succession plan:', planData);
            }}
            onUpdatePlan={async (planId, data) => {
              // Implementation would go here
              console.log('Update succession plan:', { planId, data });
            }}
            onTriggerSuccession={async (planId, reason) => {
              // Implementation would go here
              console.log('Trigger succession:', { planId, reason });
            }}
            onCompleteTask={async (taskId) => {
              // Implementation would go here
              console.log('Complete task:', taskId);
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        )}

        {activeSection === 'policies' && (
          <PolicyGovernance
            proposals={policyProposals}
            onCreateProposal={async (proposalData) => {
              // Implementation would go here
              console.log('Create proposal:', proposalData);
            }}
            onReviewProposal={async (proposalId, decision, notes) => {
              // Implementation would go here
              console.log('Review proposal:', { proposalId, decision, notes });
            }}
            onVoteOnProposal={async (proposalId, vote) => {
              // Implementation would go here
              console.log('Vote on proposal:', { proposalId, vote });
            }}
            onCommentOnProposal={async (proposalId, comment) => {
              // Implementation would go here
              console.log('Comment on proposal:', { proposalId, comment });
            }}
            currentUserId={currentUserId}
            userRole={userRole}
          />
        )}
      </View>
    </View>
  );
};
