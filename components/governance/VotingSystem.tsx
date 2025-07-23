import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Types
import type { 
  VotingCampaign, 
  VotingCandidate, 
  VotingOption,
  VotingAnalytics,
  UserVote 
} from '../../types/governance';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserAvatar } from '../ui/UserAvatar';
import { AlertCard } from '../ui/AlertCard';

interface VotingSystemProps {
  campaigns: VotingCampaign[];
  analytics?: VotingAnalytics[];
  onCastVote: (campaignId: string, candidateId?: string, optionId?: string) => Promise<void>;
  onCreateCampaign: (campaignData: any) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const VotingSystem: React.FC<VotingSystemProps> = ({
  campaigns,
  analytics,
  onCastVote,
  onCreateCampaign,
  currentUserId,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'create'>('active');
  const [selectedCampaign, setSelectedCampaign] = useState<VotingCampaign | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');
  
  const handleVote = async (campaignId: string) => {
    if (!selectedCandidate && !selectedOption) {
      Alert.alert('Selection Required', 'Please select a candidate or option before voting.');
      return;
    }

    try {
      setIsVoting(true);
      await onCastVote(campaignId, selectedCandidate || undefined, selectedOption || undefined);
      
      // Record user vote locally
      setUserVotes(prev => ({
        ...prev,
        [campaignId]: {
          id: Date.now().toString(),
          campaignId,
          userId: currentUserId,
          candidateId: selectedCandidate || undefined,
          optionId: selectedOption || undefined,
          isAnonymous: selectedCampaign?.isAnonymous || false,
          castedAt: new Date().toISOString(),
          isValid: true
        }
      }));

      Alert.alert('Vote Cast', 'Your vote has been recorded successfully!');
      setSelectedCampaign(null);
      setSelectedCandidate(null);
      setSelectedOption(null);
    } catch (error) {
      Alert.alert('Voting Error', 'Failed to cast your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const renderCampaignCard = (campaign: VotingCampaign) => {
    const userHasVoted = userVotes[campaign.id];
    const isEligible = campaign.eligibleVoters.includes(currentUserId);
    const timeRemaining = getTimeRemaining(campaign.endDate);
    const participationRate = (campaign.totalVotes / campaign.eligibleVoters.length) * 100;

    return (
      <Card key={campaign.id} className="mb-4">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-headline-small text-text-primary font-medium mb-1">
                {campaign.title}
              </Text>
              <Text className="text-body-medium text-text-secondary mb-2">
                {campaign.description}
              </Text>
              
              {/* Campaign Type Badge */}
              <View className="self-start">
                <View className={`px-2 py-1 rounded-full ${getCampaignTypeStyle(campaign.type).bg}`}>
                  <Text className={`text-label-small font-medium ${getCampaignTypeStyle(campaign.type).text}`}>
                    {formatCampaignType(campaign.type)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Status Indicator */}
            <View className="items-end">
              <View className={`px-2 py-1 rounded-full mb-1 ${getStatusStyle(campaign.status).bg}`}>
                <Text className={`text-label-small font-medium ${getStatusStyle(campaign.status).text}`}>
                  {campaign.status.toUpperCase()}
                </Text>
              </View>
              {campaign.isAnonymous && (
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                  <Text className="text-label-small text-success ml-1">Anonymous</Text>
                </View>
              )}
            </View>
          </View>

          {/* Voting Progress */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-body-medium text-text-secondary">
                Participation: {campaign.totalVotes}/{campaign.eligibleVoters.length} voters
              </Text>
              <Text className="text-body-medium font-medium text-text-primary">
                {participationRate.toFixed(1)}%
              </Text>
            </View>
            <View className="h-2 bg-surface-secondary rounded-full">
              <View 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${Math.min(participationRate, 100)}%` }}
              />
            </View>
          </View>

          {/* Time Remaining */}
          {campaign.status === 'active' && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-body-small text-text-secondary ml-2">
                {timeRemaining}
              </Text>
            </View>
          )}

          {/* Quick Preview */}
          {campaign.candidates && campaign.candidates.length > 0 && (
            <View className="mb-3">
              <Text className="text-body-medium font-medium text-text-primary mb-2">
                Candidates ({campaign.candidates.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {campaign.candidates.slice(0, 3).map((candidate) => (
                    <View key={candidate.id} className="items-center">
                      <UserAvatar 
                        name={candidate.name}
                        imageUrl={candidate.profileImage}
                        size={32}
                      />
                      <Text className="text-label-small text-text-secondary mt-1 max-w-[60px] text-center" numberOfLines={1}>
                        {candidate.name}
                      </Text>
                    </View>
                  ))}
                  {campaign.candidates.length > 3 && (
                    <View className="items-center justify-center">
                      <View className="w-8 h-8 bg-surface-secondary rounded-full items-center justify-center">
                        <Text className="text-label-small text-text-secondary">+{campaign.candidates.length - 3}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            {userHasVoted ? (
              <View className="flex-1 bg-success/10 border border-success/20 rounded-lg p-3">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-body-medium font-medium text-success ml-2">
                    Vote Submitted
                  </Text>
                </View>
              </View>
            ) : isEligible && campaign.status === 'active' ? (
              <Button
                title="Vote Now"
                variant="primary"
                size="medium"
                onPress={() => setSelectedCampaign(campaign)}
                icon="ballot-outline"
                className="flex-1"
              />
            ) : !isEligible ? (
              <View className="flex-1 bg-surface-secondary border border-border-primary rounded-lg p-3">
                <Text className="text-body-medium text-text-secondary text-center">
                  Not Eligible
                </Text>
              </View>
            ) : (
              <Button
                title="View Results"
                variant="secondary"
                size="medium"
                onPress={() => router.push(`/governance/voting/${campaign.id}`)}
                className="flex-1"
              />
            )}
            
            <Button
              title="Details"
              variant="ghost"
              size="medium"
              onPress={() => router.push(`/governance/voting/${campaign.id}`)}
              icon="information-circle-outline"
            />
          </View>
        </View>
      </Card>
    );
  };

  const renderVotingModal = () => {
    if (!selectedCampaign) return null;

    return (
      <View className="absolute inset-0 bg-black/50 items-center justify-center p-4" style={{ zIndex: 1000 }}>
        <View className="bg-surface-primary rounded-2xl max-h-[80%] w-full max-w-md">
          {/* Header */}
          <View className="p-4 border-b border-border-primary">
            <View className="flex-row items-center justify-between">
              <Text className="text-headline-small font-semibold text-text-primary">
                Cast Your Vote
              </Text>
              <TouchableOpacity onPress={() => setSelectedCampaign(null)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-body-medium text-text-secondary mt-1">
              {selectedCampaign.title}
            </Text>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Anonymous Voting Notice */}
            {selectedCampaign.isAnonymous && (
              <AlertCard
                type="info"
                title="Anonymous Voting"
                message="Your vote will be recorded anonymously. No one will know how you voted."
                className="mb-4"
              />
            )}

            {/* Candidates */}
            {selectedCampaign.candidates && selectedCampaign.candidates.length > 0 && (
              <View className="mb-4">
                <Text className="text-body-large font-medium text-text-primary mb-3">
                  Select a Candidate
                </Text>
                {selectedCampaign.candidates.map((candidate) => (
                  <TouchableOpacity
                    key={candidate.id}
                    onPress={() => {
                      setSelectedCandidate(candidate.id);
                      setSelectedOption(null);
                    }}
                    className={`flex-row items-center p-3 mb-2 border rounded-lg ${
                      selectedCandidate === candidate.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border-primary bg-surface-secondary'
                    }`}
                  >
                    <UserAvatar
                      name={candidate.name}
                      imageUrl={candidate.profileImage}
                      size={40}
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-body-medium font-medium text-text-primary">
                        {candidate.name}
                      </Text>
                      {candidate.bio && (
                        <Text className="text-body-small text-text-secondary mt-1" numberOfLines={2}>
                          {candidate.bio}
                        </Text>
                      )}
                    </View>
                    {selectedCandidate === candidate.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Options */}
            {selectedCampaign.options && selectedCampaign.options.length > 0 && (
              <View className="mb-4">
                <Text className="text-body-large font-medium text-text-primary mb-3">
                  Select an Option
                </Text>
                {selectedCampaign.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => {
                      setSelectedOption(option.id);
                      setSelectedCandidate(null);
                    }}
                    className={`p-3 mb-2 border rounded-lg ${
                      selectedOption === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border-primary bg-surface-secondary'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-body-medium font-medium text-text-primary mb-1">
                          {option.title}
                        </Text>
                        <Text className="text-body-small text-text-secondary">
                          {option.description}
                        </Text>
                      </View>
                      {selectedOption === option.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-4 border-t border-border-primary">
            <View className="flex-row gap-3">
              <Button
                title="Cancel"
                variant="secondary"
                size="medium"
                onPress={() => setSelectedCampaign(null)}
                className="flex-1"
              />
              <Button
                title={isVoting ? "Submitting..." : "Submit Vote"}
                variant="primary"
                size="medium"
                onPress={() => handleVote(selectedCampaign.id)}
                disabled={(!selectedCandidate && !selectedOption) || isVoting}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCreateCampaignCard = () => {
    if (userRole === 'resident') return null;

    return (
      <Card className="mb-4">
        <TouchableOpacity 
          onPress={() => router.push('/governance/voting/create')}
          className="p-4 items-center"
        >
          <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
            <Ionicons name="add-circle" size={32} color="#6366f1" />
          </View>
          <Text className="text-headline-small font-medium text-text-primary mb-1">
            Create Voting Campaign
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Start a new voting process for the community
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Democratic Voting
        </Text>
        <Text className="text-body-large text-text-secondary">
          Participate in society governance through transparent voting
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'active', label: 'Active Campaigns', count: activeCampaigns.length },
          { key: 'completed', label: 'Completed', count: completedCampaigns.length },
          ...(userRole !== 'resident' ? [{ key: 'create', label: 'Create', count: 0 }] : [])
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}
          >
            <View className="items-center">
              <Text className={`text-body-medium font-medium ${
                activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
              }`}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View className="bg-primary rounded-full px-2 py-1 mt-1">
                  <Text className="text-label-small text-white">{tab.count}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 bg-surface-secondary">
        <View className="p-4">
          {activeTab === 'active' && (
            <View>
              {activeCampaigns.length > 0 ? (
                activeCampaigns.map(renderCampaignCard)
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="ballot-outline" size={48} color="#9CA3AF" />
                  <Text className="text-headline-small text-text-secondary mt-4 mb-2">
                    No Active Campaigns
                  </Text>
                  <Text className="text-body-medium text-text-secondary text-center">
                    There are currently no voting campaigns running.
                    {userRole !== 'resident' && '\nCreate a new campaign to engage the community.'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'completed' && (
            <View>
              {completedCampaigns.length > 0 ? (
                completedCampaigns.map(renderCampaignCard)
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="archive-outline" size={48} color="#9CA3AF" />
                  <Text className="text-headline-small text-text-secondary mt-4 mb-2">
                    No Completed Campaigns
                  </Text>
                  <Text className="text-body-medium text-text-secondary text-center">
                    Completed voting campaigns will appear here.
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'create' && (
            <View>
              {renderCreateCampaignCard()}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Voting Modal */}
      {renderVotingModal()}
    </View>
  );
};

// Helper functions
const getCampaignTypeStyle = (type: string) => {
  const styles = {
    resident_promotion: { bg: 'bg-blue-50', text: 'text-blue-700' },
    policy_change: { bg: 'bg-purple-50', text: 'text-purple-700' },
    budget_approval: { bg: 'bg-green-50', text: 'text-green-700' },
    committee_election: { bg: 'bg-orange-50', text: 'text-orange-700' },
    emergency_decision: { bg: 'bg-red-50', text: 'text-red-700' },
    general_poll: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[type as keyof typeof styles] || styles.general_poll;
};

const getStatusStyle = (status: string) => {
  const styles = {
    active: { bg: 'bg-green-50', text: 'text-green-700' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-700' },
    scheduled: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
    suspended: { bg: 'bg-gray-50', text: 'text-gray-700' }
  };
  return styles[status as keyof typeof styles] || styles.scheduled;
};

const formatCampaignType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getTimeRemaining = (endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Voting ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m remaining`;
};