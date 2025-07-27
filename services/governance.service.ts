import { APIService } from './api.service';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'policy' | 'budget' | 'event' | 'maintenance' | 'emergency';
  status: 'draft' | 'voting' | 'approved' | 'rejected' | 'implemented';
  proposedBy: {
    id: string;
    name: string;
    flatNumber: string;
    role: string;
  };
  votingDeadline: Date;
  votingResults?: VotingResults;
  requiredMajority: number; // percentage
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VotingResults {
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  participationRate: number;
  hasUserVoted: boolean;
  userVote?: 'for' | 'against' | 'abstain';
}

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  vote: 'for' | 'against' | 'abstain';
  timestamp: Date;
  reason?: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: 'agm' | 'egm' | 'committee' | 'emergency';
  scheduledAt: Date;
  duration: number; // minutes
  venue: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  agenda: AgendaItem[];
  attendees: Attendee[];
  minutes?: string;
  recordingUrl?: string;
  createdBy: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  presenter: string;
  estimatedDuration: number; // minutes
  status: 'pending' | 'discussed' | 'deferred';
  attachments?: string[];
}

export interface Attendee {
  userId: string;
  name: string;
  flatNumber: string;
  role: string;
  status: 'invited' | 'confirmed' | 'attended' | 'absent';
  joinedAt?: Date;
  leftAt?: Date;
}

export interface Committee {
  id: string;
  name: string;
  type: 'managing' | 'maintenance' | 'security' | 'finance' | 'event' | 'grievance';
  description: string;
  members: CommitteeMember[];
  chairperson: string;
  isActive: boolean;
  establishedDate: Date;
  responsibilities: string[];
}

export interface CommitteeMember {
  userId: string;
  name: string;
  flatNumber: string;
  position: 'chairperson' | 'secretary' | 'treasurer' | 'member';
  joinedDate: Date;
  email: string;
  phone: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'urgent' | 'maintenance' | 'event' | 'policy';
  priority: 'low' | 'medium' | 'high' | 'critical';
  issuedBy: {
    id: string;
    name: string;
    role: string;
  };
  validUntil?: Date;
  attachments?: string[];
  readBy: string[]; // user IDs who have read
  createdAt: Date;
  isActive: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'noise' | 'parking' | 'security' | 'hygiene' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  submittedBy: {
    id: string;
    name: string;
    flatNumber: string;
  };
  assignedTo?: string;
  location?: string;
  attachments?: string[];
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Mock data
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'proposal1',
    title: 'Installation of Solar Panels on Rooftop',
    description: 'Proposal to install solar panels on the society rooftop to reduce electricity costs and promote renewable energy. Estimated cost: ₹15,00,000 with potential savings of ₹50,000/month.',
    category: 'infrastructure',
    status: 'voting',
    proposedBy: {
      id: 'user2',
      name: 'Priya Sharma',
      flatNumber: 'B-305',
      role: 'committee_member'
    },
    votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    votingResults: {
      totalVotes: 45,
      votesFor: 32,
      votesAgainst: 8,
      abstentions: 5,
      participationRate: 65.2,
      hasUserVoted: false
    },
    requiredMajority: 60,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    id: 'proposal2',
    title: 'Pet Policy Amendment',
    description: 'Proposal to allow small pets (cats and dogs under 25kg) in the society with mandatory registration and vaccination requirements.',
    category: 'policy',
    status: 'approved',
    proposedBy: {
      id: 'user4',
      name: 'Neha Gupta',
      flatNumber: 'A-401',
      role: 'resident'
    },
    votingDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    votingResults: {
      totalVotes: 52,
      votesFor: 35,
      votesAgainst: 12,
      abstentions: 5,
      participationRate: 75.4,
      hasUserVoted: true,
      userVote: 'for'
    },
    requiredMajority: 60,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meeting1',
    title: 'Monthly Committee Meeting - April 2024',
    type: 'committee',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 120,
    venue: 'Community Hall',
    status: 'scheduled',
    agenda: [
      {
        id: 'agenda1',
        title: 'Review of Solar Panel Proposal',
        description: 'Discussion on the feasibility and implementation timeline',
        presenter: 'Priya Sharma',
        estimatedDuration: 30,
        status: 'pending'
      },
      {
        id: 'agenda2',
        title: 'Maintenance Budget for Q2',
        description: 'Approval of maintenance budget for the second quarter',
        presenter: 'Finance Committee',
        estimatedDuration: 20,
        status: 'pending'
      }
    ],
    attendees: [
      {
        userId: 'user1',
        name: 'Ravinder Singh',
        flatNumber: 'A-201',
        role: 'resident',
        status: 'invited'
      },
      {
        userId: 'user2',
        name: 'Priya Sharma',
        flatNumber: 'B-305',
        role: 'committee_member',
        status: 'confirmed'
      }
    ],
    createdBy: 'user5'
  }
];

const MOCK_COMMITTEES: Committee[] = [
  {
    id: 'committee1',
    name: 'Managing Committee',
    type: 'managing',
    description: 'Overall management and decision-making body of the society',
    members: [
      {
        userId: 'user2',
        name: 'Priya Sharma',
        flatNumber: 'B-305',
        position: 'chairperson',
        joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        email: 'priya.sharma@example.com',
        phone: '+91-9876543211'
      },
      {
        userId: 'user3',
        name: 'Amit Kumar',
        flatNumber: 'C-102',
        position: 'secretary',
        joinedDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
        email: 'amit.kumar@example.com',
        phone: '+91-9876543212'
      }
    ],
    chairperson: 'user2',
    isActive: true,
    establishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    responsibilities: [
      'Policy formulation and implementation',
      'Budget approval and financial oversight',
      'Maintenance planning and execution',
      'Resident grievance resolution'
    ]
  }
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'announcement1',
    title: 'Water Supply Interruption - Weekend Maintenance',
    content: 'Water supply will be interrupted on Saturday, April 27th from 10 AM to 4 PM due to tank cleaning and pump maintenance. Please store water in advance.',
    category: 'maintenance',
    priority: 'high',
    issuedBy: {
      id: 'user5',
      name: 'Society Admin',
      role: 'admin'
    },
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    readBy: ['user1', 'user3'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isActive: true
  },
  {
    id: 'announcement2',
    title: 'Holi Celebration - Community Event',
    content: 'Join us for Holi celebration in the society courtyard on March 25th from 4 PM onwards. Organized by the Events Committee. Please bring colors and snacks to share!',
    category: 'event',
    priority: 'medium',
    issuedBy: {
      id: 'user4',
      name: 'Neha Gupta',
      role: 'committee_member'
    },
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    readBy: ['user1', 'user2', 'user3'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isActive: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GovernanceService {
  private static instance: GovernanceService;
  private apiService: APIService;

  private constructor() {
    this.apiService = APIService.getInstance();
  }

  static getInstance(): GovernanceService {
    if (!GovernanceService.instance) {
      GovernanceService.instance = new GovernanceService();
    }
    return GovernanceService.instance;
  }

  // Proposals
  async getProposals(status?: string): Promise<Proposal[]> {
    await delay(600);
    
    try {
      let proposals = [...MOCK_PROPOSALS];
      
      if (status) {
        proposals = proposals.filter(proposal => proposal.status === status);
      }
      
      return proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      throw new Error('Failed to fetch proposals');
    }
  }

  async createProposal(proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'votingResults'>): Promise<Proposal> {
    await delay(800);
    
    try {
      const newProposal: Proposal = {
        ...proposalData,
        id: `proposal_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      MOCK_PROPOSALS.unshift(newProposal);
      return newProposal;
    } catch (error) {
      throw new Error('Failed to create proposal');
    }
  }

  async vote(proposalId: string, vote: 'for' | 'against' | 'abstain', reason?: string): Promise<VotingResults> {
    await delay(500);
    
    try {
      const proposal = MOCK_PROPOSALS.find(p => p.id === proposalId);
      if (!proposal || !proposal.votingResults) {
        throw new Error('Proposal not found or voting not active');
      }
      
      // Update voting results
      proposal.votingResults.hasUserVoted = true;
      proposal.votingResults.userVote = vote;
      proposal.votingResults.totalVotes += 1;
      
      if (vote === 'for') {
        proposal.votingResults.votesFor += 1;
      } else if (vote === 'against') {
        proposal.votingResults.votesAgainst += 1;
      } else {
        proposal.votingResults.abstentions += 1;
      }
      
      proposal.votingResults.participationRate = 
        (proposal.votingResults.totalVotes / 69) * 100; // Assuming 69 total residents
      
      return proposal.votingResults;
    } catch (error) {
      throw new Error('Failed to record vote');
    }
  }

  // Meetings
  async getMeetings(upcoming: boolean = true): Promise<Meeting[]> {
    await delay(400);
    
    try {
      let meetings = [...MOCK_MEETINGS];
      
      if (upcoming) {
        meetings = meetings.filter(meeting => 
          meeting.scheduledAt > new Date() && meeting.status !== 'cancelled'
        );
      }
      
      return meetings.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    } catch (error) {
      throw new Error('Failed to fetch meetings');
    }
  }

  async createMeeting(meetingData: Omit<Meeting, 'id' | 'attendees'>): Promise<Meeting> {
    await delay(700);
    
    try {
      const newMeeting: Meeting = {
        ...meetingData,
        id: `meeting_${Date.now()}`,
        attendees: [] // Will be populated separately
      };
      
      MOCK_MEETINGS.push(newMeeting);
      return newMeeting;
    } catch (error) {
      throw new Error('Failed to create meeting');
    }
  }

  async respondToMeeting(meetingId: string, response: 'confirmed' | 'declined'): Promise<boolean> {
    await delay(300);
    
    try {
      const meeting = MOCK_MEETINGS.find(m => m.id === meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }
      
      const attendee = meeting.attendees.find(a => a.userId === 'user1'); // Current user
      if (attendee) {
        attendee.status = response === 'confirmed' ? 'confirmed' : 'absent';
      }
      
      return true;
    } catch (error) {
      throw new Error('Failed to respond to meeting');
    }
  }

  // Committees
  async getCommittees(): Promise<Committee[]> {
    await delay(300);
    
    try {
      return MOCK_COMMITTEES.filter(committee => committee.isActive);
    } catch (error) {
      throw new Error('Failed to fetch committees');
    }
  }

  async getCommitteeMembers(committeeId: string): Promise<CommitteeMember[]> {
    await delay(250);
    
    try {
      const committee = MOCK_COMMITTEES.find(c => c.id === committeeId);
      return committee?.members || [];
    } catch (error) {
      throw new Error('Failed to fetch committee members');
    }
  }

  // Announcements
  async getAnnouncements(active: boolean = true): Promise<Announcement[]> {
    await delay(400);
    
    try {
      let announcements = [...MOCK_ANNOUNCEMENTS];
      
      if (active) {
        const now = new Date();
        announcements = announcements.filter(announcement => 
          announcement.isActive && 
          (!announcement.validUntil || announcement.validUntil > now)
        );
      }
      
      return announcements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      throw new Error('Failed to fetch announcements');
    }
  }

  async markAnnouncementRead(announcementId: string, userId: string): Promise<boolean> {
    await delay(200);
    
    try {
      const announcement = MOCK_ANNOUNCEMENTS.find(a => a.id === announcementId);
      if (announcement && !announcement.readBy.includes(userId)) {
        announcement.readBy.push(userId);
      }
      return true;
    } catch (error) {
      throw new Error('Failed to mark announcement as read');
    }
  }

  async createAnnouncement(announcementData: Omit<Announcement, 'id' | 'createdAt' | 'readBy'>): Promise<Announcement> {
    await delay(500);
    
    try {
      const newAnnouncement: Announcement = {
        ...announcementData,
        id: `announcement_${Date.now()}`,
        createdAt: new Date(),
        readBy: []
      };
      
      MOCK_ANNOUNCEMENTS.unshift(newAnnouncement);
      return newAnnouncement;
    } catch (error) {
      throw new Error('Failed to create announcement');
    }
  }

  // Complaints/Grievances
  async submitComplaint(complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): Promise<Complaint> {
    await delay(600);
    
    try {
      const newComplaint: Complaint = {
        ...complaintData,
        id: `complaint_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return newComplaint;
    } catch (error) {
      throw new Error('Failed to submit complaint');
    }
  }

  // Analytics
  async getGovernanceAnalytics(): Promise<{
    activeProposals: number;
    upcomingMeetings: number;
    participationRate: number;
    activeComplaints: number;
    committeesCount: number;
    recentActivity: Array<{
      type: 'proposal' | 'meeting' | 'announcement' | 'complaint';
      title: string;
      date: Date;
    }>;
  }> {
    await delay(500);
    
    try {
      const activeProposals = MOCK_PROPOSALS.filter(p => p.status === 'voting').length;
      const upcomingMeetings = MOCK_MEETINGS.filter(m => 
        m.scheduledAt > new Date() && m.status !== 'cancelled'
      ).length;
      
      const avgParticipation = MOCK_PROPOSALS
        .filter(p => p.votingResults)
        .reduce((sum, p) => sum + p.votingResults!.participationRate, 0) / 
        MOCK_PROPOSALS.filter(p => p.votingResults).length || 0;
      
      const recentActivity = [
        {
          type: 'proposal' as const,
          title: 'Solar Panel Installation',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'announcement' as const,
          title: 'Water Supply Interruption',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'meeting' as const,
          title: 'Monthly Committee Meeting',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      ];
      
      return {
        activeProposals,
        upcomingMeetings,
        participationRate: Math.round(avgParticipation),
        activeComplaints: 5, // Mock
        committeesCount: MOCK_COMMITTEES.filter(c => c.isActive).length,
        recentActivity
      };
    } catch (error) {
      throw new Error('Failed to fetch governance analytics');
    }
  }
}

export default GovernanceService.getInstance();