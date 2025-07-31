import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from '@/utils/alert';
import LucideIcons from '../ui/LucideIcons';
import { router } from 'expo-router';

// Types
import type {
  PolicyProposal,
  PolicyCategory,
  PolicyStatus,
} from '../../types/governance';

// UI Components
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCard } from '../ui/AlertCard';

interface PolicyGovernanceProps {
  proposals: PolicyProposal[];
  onCreateProposal: (proposalData: any) => Promise<void>;
  onReviewProposal: (
    proposalId: string,
    decision: string,
    notes: string,
  ) => Promise<void>;
  onVoteOnProposal: (
    proposalId: string,
    vote: 'approve' | 'reject',
  ) => Promise<void>;
  onCommentOnProposal: (proposalId: string, comment: string) => Promise<void>;
  currentUserId: string;
  userRole: 'resident' | 'committee_member' | 'admin';
}

export const PolicyGovernance: React.FC<PolicyGovernanceProps> = ({
  proposals,
  onCreateProposal,
  onReviewProposal,
  onVoteOnProposal,
  onCommentOnProposal,
  currentUserId,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<
    'active' | 'review' | 'voting' | 'implemented'
  >('active');
  const [selectedProposal, setSelectedProposal] =
    useState<PolicyProposal | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProposals = proposals.filter(
    (p) => p.status === 'submitted' || p.status === 'public_consultation',
  );
  const reviewProposals = proposals.filter((p) => p.status === 'under_review');
  const votingProposals = proposals.filter((p) => p.status === 'voting');
  const implementedProposals = proposals.filter(
    (p) => p.status === 'implemented',
  );

  const canCreateProposal =
    userRole === 'committee_member' || userRole === 'admin';

  const handleVote = async (
    proposal: PolicyProposal,
    vote: 'approve' | 'reject',
  ) => {
    showConfirmAlert(
      'Confirm Vote',
      `Are you sure you want to ${vote} this policy proposal?`,
      async () => {
        try {
          await onVoteOnProposal(proposal.id, vote);
          showSuccessAlert('Success', `Your ${vote} vote has been recorded.`);
        } catch {
          showErrorAlert('Error', 'Failed to record your vote.');
        }
      },
    );
  };

  const handleComment = async (proposalId: string) => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await onCommentOnProposal(proposalId, commentText);
      setCommentText('');
      showSuccessAlert('Success', 'Your comment has been added.');
    } catch {
      showErrorAlert('Error', 'Failed to add comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProposalCard = (proposal: PolicyProposal) => {
    const statusStyle = getStatusStyle(proposal.status);
    const categoryStyle = getCategoryStyle(proposal.category);
    const timeAgo = getTimeAgo(proposal.createdAt);
    const userHasVoted = proposal.approvals.some(
      (a) => a.userId === currentUserId,
    );

    return (
      <Card key={proposal.id} className="mb-4">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-headline-small font-semibold text-text-primary mb-1">
                {proposal.title}
              </Text>
              <Text
                className="text-body-medium text-text-secondary mb-2"
                numberOfLines={2}>
                {proposal.description}
              </Text>

              <View className="flex-row items-center gap-2">
                <View className={`px-2 py-1 rounded-full ${categoryStyle.bg}`}>
                  <Text
                    className={`text-label-small font-medium ${categoryStyle.text}`}>
                    {formatCategory(proposal.category)}
                  </Text>
                </View>
                <Text className="text-body-small text-text-secondary">
                  {timeAgo}
                </Text>
              </View>
            </View>

            <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
              <Text
                className={`text-label-small font-medium ${statusStyle.text}`}>
                {proposal.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Impact Summary */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <LucideIcons name="users" size={16} color="#757575" />
                <Text className="text-body-small text-text-secondary ml-1">
                  Affects: {proposal.impact.affectedResidents} residents
                </Text>
              </View>

              {proposal.impact.financialImpact > 0 && (
                <View className="flex-row items-center">
                  <LucideIcons name="dollar-sign" size={16} color="#757575" />
                  <Text className="text-body-small text-text-secondary ml-1">
                    ₹{proposal.impact.financialImpact.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Changes Preview */}
          <View className="mb-3">
            <Text className="text-body-medium font-medium text-text-primary mb-2">
              Proposed Changes ({proposal.proposedChanges.length})
            </Text>
            <View className="bg-surface-secondary p-3 rounded-lg">
              {proposal.proposedChanges.slice(0, 2).map((change, index) => (
                <View key={index} className="mb-2 last:mb-0">
                  <View className="flex-row items-center mb-1">
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${getChangeTypeStyle(change.changeType).bg}`}
                    />
                    <Text className="text-body-small font-medium text-text-primary">
                      {change.section}
                    </Text>
                  </View>
                  <Text
                    className="text-body-small text-text-secondary ml-4"
                    numberOfLines={2}>
                    {change.rationale}
                  </Text>
                </View>
              ))}
              {proposal.proposedChanges.length > 2 && (
                <Text className="text-body-small text-primary ml-4">
                  +{proposal.proposedChanges.length - 2} more changes
                </Text>
              )}
            </View>
          </View>

          {/* Approval Progress */}
          {proposal.approvals.length > 0 && (
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-body-small font-medium text-text-primary">
                  Approvals ({proposal.approvals.length}/
                  {proposal.requiredApprovals})
                </Text>
                <Text className="text-body-small text-text-secondary">
                  {(
                    (proposal.approvals.length / proposal.requiredApprovals) *
                    100
                  ).toFixed(0)}
                  %
                </Text>
              </View>
              <View className="h-2 bg-surface-secondary rounded-full">
                <View
                  className="h-full bg-success rounded-full"
                  style={{
                    width: `${Math.min((proposal.approvals.length / proposal.requiredApprovals) * 100, 100)}%`,
                  }}
                />
              </View>
            </View>
          )}

          {/* Comments Preview */}
          {proposal.comments.length > 0 && (
            <View className="mb-3">
              <Text className="text-body-small font-medium text-text-primary mb-2">
                Comments ({proposal.comments.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {proposal.comments.slice(0, 3).map((comment) => (
                    <View
                      key={comment.id}
                      className="w-48 bg-surface-secondary p-2 rounded">
                      <Text
                        className="text-body-small text-text-primary"
                        numberOfLines={2}>
                        {comment.content}
                      </Text>
                      <Text className="text-label-small text-text-secondary mt-1">
                        {comment.userId}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            {proposal.status === 'voting' && !userHasVoted ? (
              <>
                <Button
                  title="Support"
                  variant="success"
                  size="sm"
                  onPress={() => handleVote(proposal, 'approve')}
                  className="flex-1"
                />
                <Button
                  title="Oppose"
                  variant="danger"
                  size="sm"
                  onPress={() => handleVote(proposal, 'reject')}
                  className="flex-1"
                />
              </>
            ) : userHasVoted ? (
              <View className="flex-1 bg-success/10 border border-success/20 rounded-lg p-2">
                <Text className="text-body-small font-medium text-success text-center">
                  Vote Recorded
                </Text>
              </View>
            ) : proposal.status === 'public_consultation' ? (
              <Button
                title="Add Comment"
                variant="secondary"
                size="sm"
                onPress={() => setSelectedProposal(proposal)}
                className="flex-1"
              />
            ) : null}

            <Button
              title="Details"
              variant="ghost"
              size="sm"
              onPress={() => router.push(`/governance/policies/${proposal.id}`)}
              icon="information-circle-outline"
            />
          </View>
        </View>
      </Card>
    );
  };

  const renderCommentModal = () => {
    if (!selectedProposal) return null;

    return (
      <View
        className="absolute inset-0 bg-black/50 items-center justify-center p-4"
        style={{ zIndex: 1000 }}>
        <View className="bg-surface-primary rounded-2xl max-h-[70%] w-full max-w-md">
          {/* Header */}
          <View className="p-4 border-b border-border-primary">
            <View className="flex-row items-center justify-between">
              <Text className="text-headline-small font-semibold text-text-primary">
                Add Comment
              </Text>
              <TouchableOpacity onPress={() => setSelectedProposal(null)}>
                <LucideIcons name="x" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            <Text
              className="text-body-medium text-text-secondary mt-1"
              numberOfLines={1}>
              {selectedProposal.title}
            </Text>
          </View>

          <View className="p-4">
            {/* Comment Input */}
            <View className="mb-4">
              <Text className="text-body-medium font-medium text-text-primary mb-2">
                Your Comment
              </Text>
              <TextInput
                className="border border-border-primary rounded-lg p-3 text-body-medium text-text-primary bg-surface-secondary"
                multiline
                numberOfLines={4}
                placeholder="Share your thoughts on this policy proposal..."
                placeholderTextColor="#757575"
                value={commentText}
                onChangeText={setCommentText}
                style={{ textAlignVertical: 'top' }}
              />
              <Text className="text-body-small text-text-secondary mt-1">
                {commentText.length}/500 characters
              </Text>
            </View>

            {/* Privacy Notice */}
            <AlertCard
              type="info"
              title="Public Comment"
              message="Your comment will be visible to all community members and will be part of the public record."
              className="mb-4"
            />

            {/* Actions */}
            <View className="flex-row gap-3">
              <Button
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={() => {
                  setSelectedProposal(null);
                  setCommentText('');
                }}
                className="flex-1"
              />
              <Button
                title={isSubmitting ? 'Submitting...' : 'Submit Comment'}
                variant="primary"
                size="md"
                onPress={() => handleComment(selectedProposal.id)}
                disabled={!commentText.trim() || isSubmitting}
                className="flex-1"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCreateProposalCard = () => {
    if (!canCreateProposal) return null;

    return (
      <Card className="mb-4">
        <TouchableOpacity
          onPress={() => router.push('/governance/policies/create')}
          className="p-4 items-center">
          <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
            <LucideIcons name="file-text" size={32} color="#6366f1" />
          </View>
          <Text className="text-headline-small font-medium text-text-primary mb-1">
            Create Policy Proposal
          </Text>
          <Text className="text-body-medium text-text-secondary text-center">
            Propose changes to society policies and bylaws
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderEmptyState = (type: string) => {
    const emptyStates = {
      active: {
        icon: 'file',
        title: 'No Active Proposals',
        message: 'No policy proposals are currently open for discussion.',
      },
      review: {
        icon: 'eye',
        title: 'No Proposals Under Review',
        message: 'No proposals are currently being reviewed by the committee.',
      },
      voting: {
        icon: 'vote',
        title: 'No Voting in Progress',
        message: 'No policy proposals are currently open for voting.',
      },
      implemented: {
        icon: 'check-check',
        title: 'No Implemented Policies',
        message: 'No policies have been implemented yet.',
      },
    };

    const state =
      emptyStates[type as keyof typeof emptyStates] || emptyStates.active;

    return (
      <View className="items-center py-8">
        <LucideIcons name={state.icon as any} size={48} color="#757575" />
        <Text className="text-headline-small text-text-secondary mt-4 mb-2">
          {state.title}
        </Text>
        <Text className="text-body-medium text-text-secondary text-center">
          {state.message}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 border-b border-border-primary bg-surface-primary">
        <Text className="text-display-small font-bold text-text-primary mb-2">
          Policy Governance
        </Text>
        <Text className="text-body-large text-text-secondary">
          Democratic policy making and community decision processes
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-surface-primary border-b border-border-primary">
        {[
          { key: 'active', label: 'Active', count: activeProposals.length },
          { key: 'review', label: 'Review', count: reviewProposals.length },
          { key: 'voting', label: 'Voting', count: votingProposals.length },
          {
            key: 'implemented',
            label: 'Implemented',
            count: implementedProposals.length,
          },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            className={`flex-1 p-4 border-b-2 ${
              activeTab === tab.key ? 'border-primary' : 'border-transparent'
            }`}>
            <View className="items-center">
              <Text
                className={`text-body-small font-medium ${
                  activeTab === tab.key ? 'text-primary' : 'text-text-secondary'
                }`}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View
                  className={`rounded-full px-2 py-1 mt-1 ${
                    activeTab === tab.key
                      ? 'bg-primary'
                      : 'bg-surface-secondary'
                  }`}>
                  <Text
                    className={`text-label-small ${
                      activeTab === tab.key
                        ? 'text-white'
                        : 'text-text-secondary'
                    }`}>
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
        <View className="p-4">
          {activeTab === 'active' && (
            <View>
              {canCreateProposal && renderCreateProposalCard()}
              {activeProposals.length > 0
                ? activeProposals.map(renderProposalCard)
                : renderEmptyState('active')}
            </View>
          )}

          {activeTab === 'review' && (
            <View>
              {reviewProposals.length > 0
                ? reviewProposals.map(renderProposalCard)
                : renderEmptyState('review')}
            </View>
          )}

          {activeTab === 'voting' && (
            <View>
              {votingProposals.length > 0
                ? votingProposals.map(renderProposalCard)
                : renderEmptyState('voting')}
            </View>
          )}

          {activeTab === 'implemented' && (
            <View>
              {implementedProposals.length > 0
                ? implementedProposals.map(renderProposalCard)
                : renderEmptyState('implemented')}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comment Modal */}
      {renderCommentModal()}
    </View>
  );
};

// Helper functions
const getStatusStyle = (status: PolicyStatus) => {
  const styles = {
    draft: { bg: 'bg-gray-50', text: 'text-gray-700' },
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700' },
    under_review: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    public_consultation: { bg: 'bg-purple-50', text: 'text-purple-700' },
    voting: { bg: 'bg-orange-50', text: 'text-orange-700' },
    approved: { bg: 'bg-green-50', text: 'text-green-700' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700' },
    implemented: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    rolled_back: { bg: 'bg-red-50', text: 'text-red-700' },
  };
  return styles[status] || styles.draft;
};

const getCategoryStyle = (category: PolicyCategory) => {
  const styles = {
    bylaws: { bg: 'bg-blue-50', text: 'text-blue-700' },
    financial: { bg: 'bg-green-50', text: 'text-green-700' },
    maintenance: { bg: 'bg-orange-50', text: 'text-orange-700' },
    security: { bg: 'bg-red-50', text: 'text-red-700' },
    community: { bg: 'bg-purple-50', text: 'text-purple-700' },
    visitor: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
    parking: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
    amenity: { bg: 'bg-pink-50', text: 'text-pink-700' },
    environmental: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    emergency: { bg: 'bg-red-50', text: 'text-red-700' },
    governance: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  };
  return styles[category] || styles.governance;
};

const getChangeTypeStyle = (type: string) => {
  const styles = {
    add: { bg: 'bg-green-500' },
    modify: { bg: 'bg-yellow-500' },
    remove: { bg: 'bg-red-500' },
  };
  return styles[type as keyof typeof styles] || styles.modify;
};

const formatCategory = (category: PolicyCategory): string => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};
