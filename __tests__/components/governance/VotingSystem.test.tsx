import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { VotingSystem } from '../../../components/governance/VotingSystem';
import type { VotingCampaign, VotingAnalytics } from '../../../types/governance';

// Mock data
const mockCampaigns: VotingCampaign[] = [
  {
    id: 'test-campaign-1',
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
        name: 'John Doe',
        designation: 'Treasurer',
        bio: 'Experienced in financial management',
        imageUrl: null,
        voteCount: 25,
        manifesto: 'Transparent financial management'
      },
      {
        id: 'candidate-2',
        name: 'Jane Smith',
        designation: 'Secretary',
        bio: 'Community organizer',
        imageUrl: null,
        voteCount: 30,
        manifesto: 'Better community engagement'
      }
    ],
    options: [],
    totalVotes: 55,
    eligibleVoters: 100,
    createdBy: 'admin-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockAnalytics: VotingAnalytics = {
  societyId: 'test-society',
  totalCampaigns: 5,
  activeCampaigns: 1,
  completedCampaigns: 4,
  totalVotesCast: 250,
  averageParticipationRate: 72.5,
  campaignsByType: {
    election: 3,
    poll: 2,
    referendum: 0
  },
  participationTrends: [
    { month: 'Jan', rate: 70 },
    { month: 'Feb', rate: 75 }
  ],
  topCandidates: [],
  recentActivity: []
};

const defaultProps = {
  campaigns: mockCampaigns,
  userVotes: [],
  analytics: mockAnalytics,
  onCreateCampaign: jest.fn(),
  onVote: jest.fn(),
  currentUserId: 'test-user',
  userRole: 'resident' as const
};

describe('VotingSystem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render voting campaigns correctly', () => {
      render(<VotingSystem {...defaultProps} />);
      
      expect(screen.getByText('Committee Election 2024')).toBeTruthy();
      expect(screen.getByText('Annual committee member election')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
    });

    it('should display campaign status correctly', () => {
      render(<VotingSystem {...defaultProps} />);
      
      expect(screen.getByText('ACTIVE')).toBeTruthy();
    });

    it('should show voting progress', () => {
      render(<VotingSystem {...defaultProps} />);
      
      // Check that vote counts are displayed
      expect(screen.getByText('25')).toBeTruthy(); // John's vote count
      expect(screen.getByText('30')).toBeTruthy(); // Jane's vote count
    });

    it('should display participation rate', () => {
      render(<VotingSystem {...defaultProps} />);
      
      expect(screen.getByText('55% participation')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should allow voting when user has not voted', async () => {
      const onVote = jest.fn().mockResolvedValue(undefined);
      render(<VotingSystem {...defaultProps} onVote={onVote} />);
      
      const voteButton = screen.getByText('Vote for John Doe');
      fireEvent.press(voteButton);
      
      await waitFor(() => {
        expect(onVote).toHaveBeenCalledWith('test-campaign-1', 'candidate-1');
      });
    });

    it('should show voted state when user has already voted', () => {
      const userVotes = [{
        id: 'vote-1',
        campaignId: 'test-campaign-1',
        candidateId: 'candidate-1',
        optionId: null,
        userId: 'test-user',
        timestamp: '2024-01-20T10:00:00Z',
        isAnonymous: true
      }];

      render(<VotingSystem {...defaultProps} userVotes={userVotes} />);
      
      expect(screen.getByText('You voted')).toBeTruthy();
    });

    it('should prevent voting on inactive campaigns', () => {
      const inactiveCampaigns = [{
        ...mockCampaigns[0],
        status: 'completed' as const
      }];

      render(<VotingSystem {...defaultProps} campaigns={inactiveCampaigns} />);
      
      expect(screen.getByText('COMPLETED')).toBeTruthy();
      expect(screen.queryByText('Vote for John Doe')).toBeNull();
    });
  });

  describe('Admin Features', () => {
    const adminProps = {
      ...defaultProps,
      userRole: 'admin' as const
    };

    it('should show create campaign button for admins', () => {
      render(<VotingSystem {...adminProps} />);
      
      expect(screen.getByText('Create Campaign')).toBeTruthy();
    });

    it('should allow admins to create new campaigns', async () => {
      const onCreateCampaign = jest.fn().mockResolvedValue(undefined);
      render(<VotingSystem {...adminProps} onCreateCampaign={onCreateCampaign} />);
      
      const createButton = screen.getByText('Create Campaign');
      fireEvent.press(createButton);
      
      // This would open a modal or navigate to create page
      // Test based on actual implementation
    });

    it('should show campaign management options for admins', () => {
      render(<VotingSystem {...adminProps} />);
      
      // Look for edit/delete buttons or options menu
      expect(screen.getByTestId('campaign-options')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle voting errors gracefully', async () => {
      const onVote = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<VotingSystem {...defaultProps} onVote={onVote} />);
      
      const voteButton = screen.getByText('Vote for John Doe');
      fireEvent.press(voteButton);
      
      await waitFor(() => {
        expect(onVote).toHaveBeenCalled();
        // Check that error message is displayed
        expect(screen.getByText('Failed to submit vote')).toBeTruthy();
      });
    });

    it('should show empty state when no campaigns exist', () => {
      render(<VotingSystem {...defaultProps} campaigns={[]} />);
      
      expect(screen.getByText('No active campaigns')).toBeTruthy();
    });
  });

  describe('Analytics Display', () => {
    it('should display voting analytics', () => {
      render(<VotingSystem {...defaultProps} />);
      
      expect(screen.getByText('Total Campaigns: 5')).toBeTruthy();
      expect(screen.getByText('Average Participation: 72.5%')).toBeTruthy();
    });

    it('should show participation trends', () => {
      render(<VotingSystem {...defaultProps} />);
      
      // Check if chart or trend data is displayed
      expect(screen.getByText('Participation Trends')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<VotingSystem {...defaultProps} />);
      
      const voteButtons = screen.getAllByLabelText(/Vote for/);
      expect(voteButtons.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      render(<VotingSystem {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.props.accessible).toBe(true);
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update vote counts when campaigns change', () => {
      const { rerender } = render(<VotingSystem {...defaultProps} />);
      
      expect(screen.getByText('25')).toBeTruthy();
      
      const updatedCampaigns = [{
        ...mockCampaigns[0],
        candidates: [{
          ...mockCampaigns[0].candidates[0],
          voteCount: 26
        }, mockCampaigns[0].candidates[1]]
      }];
      
      rerender(<VotingSystem {...defaultProps} campaigns={updatedCampaigns} />);
      
      expect(screen.getByText('26')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = (props: any) => {
        renderSpy();
        return <VotingSystem {...props} />;
      };
      
      const { rerender } = render(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props should not cause re-render
      rerender(<TestComponent {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});