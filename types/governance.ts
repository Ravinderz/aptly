// Phase 8: Democratic Governance & Emergency Systems Types
// Comprehensive type definitions for voting, emergency management, and governance features

export interface VotingCampaign {
  id: string;
  title: string;
  description: string;
  type: VotingType;
  status: VotingStatus;
  createdBy: string;
  society_id: string;
  
  // Voting configuration
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  requiresQuorum: boolean;
  minimumParticipation: number; // percentage
  
  // Candidate/option management
  candidates?: VotingCandidate[];
  options?: VotingOption[];
  
  // Eligibility criteria
  eligibleVoters: string[]; // user IDs
  eligibilityRules: EligibilityRules;
  
  // Results and transparency
  totalVotes: number;
  results?: VotingResults;
  isResultsPublished: boolean;
  
  // Audit trail
  auditLog: VotingAuditEntry[];
  
  createdAt: string;
  updatedAt: string;
}

export type VotingType = 
  | 'resident_promotion'
  | 'policy_change'
  | 'budget_approval'
  | 'committee_election'
  | 'emergency_decision'
  | 'general_poll';

export type VotingStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'suspended';

export interface VotingCandidate {
  id: string;
  userId: string;
  name: string;
  profileImage?: string;
  bio?: string;
  manifesto?: string;
  nominatedBy: string;
  endorsements: string[];
  votes: number;
}

export interface VotingOption {
  id: string;
  title: string;
  description: string;
  votes: number;
}

export interface EligibilityRules {
  minimumResidencyMonths: number;
  requiredVerification: boolean;
  excludedRoles: string[];
  includeOwners: boolean;
  includeTenants: boolean;
  includeFamilyMembers: boolean;
}

export interface VotingResults {
  totalValidVotes: number;
  totalInvalidVotes: number;
  participationRate: number;
  quorumMet: boolean;
  winner?: string; // candidate ID or option ID
  breakdown: ResultBreakdown[];
  publishedAt: string;
}

export interface ResultBreakdown {
  candidateId?: string;
  optionId?: string;
  votes: number;
  percentage: number;
}

export interface VotingAuditEntry {
  id: string;
  action: VotingAuditAction;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export type VotingAuditAction = 
  | 'campaign_created'
  | 'campaign_started'
  | 'vote_cast'
  | 'vote_changed'
  | 'campaign_ended'
  | 'results_published'
  | 'campaign_cancelled';

export interface UserVote {
  id: string;
  campaignId: string;
  userId: string;
  candidateId?: string;
  optionId?: string;
  isAnonymous: boolean;
  castedAt: string;
  isValid: boolean;
  invalidReason?: string;
}

// Emergency Management Types

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: EmergencySeverity;
  type: EmergencyType;
  status: EmergencyStatus;
  society_id: string;
  
  // Alert details
  location?: string;
  affectedAreas: string[];
  contactPerson: string;
  contactNumber: string;
  
  // Escalation chain
  declaredBy: string;
  escalationLevel: number;
  escalationChain: EscalationStep[];
  currentResponder?: string;
  
  // Notification tracking
  notifications: EmergencyNotification[];
  acknowledgments: EmergencyAcknowledgment[];
  
  // Resolution
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  postIncidentReport?: string;
  
  // Super Admin overrides
  overriddenBy?: string;
  overrideReason?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type EmergencySeverity = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'disaster';

export type EmergencyType = 
  | 'fire'
  | 'medical'
  | 'security'
  | 'natural_disaster'
  | 'infrastructure'
  | 'power_outage'
  | 'water_shortage'
  | 'gas_leak'
  | 'elevator'
  | 'other';

export type EmergencyStatus = 
  | 'active'
  | 'escalated'
  | 'responding'
  | 'contained'
  | 'resolved'
  | 'cancelled';

export interface EscalationStep {
  level: number;
  role: string;
  userId: string;
  contactMethods: ContactMethod[];
  timeoutMinutes: number;
  isActivated: boolean;
  activatedAt?: string;
  acknowledgedAt?: string;
}

export type ContactMethod = 
  | 'push'
  | 'sms'
  | 'call'
  | 'email'
  | 'whatsapp';

export interface EmergencyNotification {
  id: string;
  alertId: string;
  userId: string;
  method: ContactMethod;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
}

export interface EmergencyAcknowledgment {
  id: string;
  alertId: string;
  userId: string;
  acknowledgedAt: string;
  response: EmergencyResponse;
  location?: string;
  eta?: string;
  notes?: string;
}

export type EmergencyResponse = 
  | 'acknowledged'
  | 'responding'
  | 'on_site'
  | 'cannot_respond'
  | 'false_alarm';

export interface EmergencyContact {
  id: string;
  society_id: string;
  category: EmergencyContactCategory;
  name: string;
  organization?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  isAvailable24x7: boolean;
  responseTime: string;
  specialNotes?: string;
  lastContacted?: string;
  isActive: boolean;
}

export type EmergencyContactCategory = 
  | 'police'
  | 'fire'
  | 'medical'
  | 'gas'
  | 'electricity'
  | 'water'
  | 'elevator'
  | 'security'
  | 'municipal'
  | 'other';

// CM Succession & Governance Types

export interface SuccessionPlan {
  id: string;
  society_id: string;
  currentCM: string;
  status: SuccessionStatus;
  
  // Succession triggers
  triggers: SuccessionTrigger[];
  isAutomatic: boolean;
  manualTriggerBy?: string;
  
  // Deputy and succession order
  deputies: DeputyAssignment[];
  successionOrder: string[]; // user IDs in order
  
  // Activation details
  activatedAt?: string;
  activatedBy?: string;
  activationReason?: string;
  
  // Transition period
  transitionStartDate?: string;
  transitionEndDate?: string;
  handoverTasks: HandoverTask[];
  
  // Voting process
  requiresVoting: boolean;
  votingCampaignId?: string;
  
  // Audit and approval
  approvedBy?: string;
  approvalDate?: string;
  auditLog: SuccessionAuditEntry[];
  
  createdAt: string;
  updatedAt: string;
}

export type SuccessionStatus = 
  | 'active'
  | 'triggered'
  | 'in_transition'
  | 'completed'
  | 'cancelled';

export interface SuccessionTrigger {
  type: TriggerType;
  condition: string;
  isActive: boolean;
  lastChecked?: string;
}

export type TriggerType = 
  | 'resignation'
  | 'inactivity'
  | 'no_confidence_vote'
  | 'term_completion'
  | 'manual'
  | 'emergency';

export interface DeputyAssignment {
  userId: string;
  role: DeputyRole;
  responsibilities: string[];
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  performanceRating?: number;
}

export type DeputyRole = 
  | 'primary_deputy'
  | 'secondary_deputy'
  | 'emergency_deputy'
  | 'specialized_deputy';

export interface HandoverTask {
  id: string;
  title: string;
  description: string;
  category: HandoverCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
  documents: string[];
  notes?: string;
}

export type HandoverCategory = 
  | 'financial'
  | 'legal'
  | 'operational'
  | 'administrative'
  | 'technical'
  | 'relationships';

export type TaskPriority = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'deferred';

export interface SuccessionAuditEntry {
  id: string;
  action: SuccessionAuditAction;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
}

export type SuccessionAuditAction = 
  | 'plan_created'
  | 'plan_updated'
  | 'deputy_assigned'
  | 'trigger_activated'
  | 'transition_started'
  | 'task_completed'
  | 'succession_completed';

// Policy Governance Types

export interface PolicyProposal {
  id: string;
  title: string;
  description: string;
  category: PolicyCategory;
  proposedBy: string;
  society_id: string;
  
  // Policy details
  currentPolicy?: string;
  proposedChanges: PolicyChange[];
  impact: PolicyImpact;
  implementationPlan: string;
  effectiveDate: string;
  
  // Approval workflow
  status: PolicyStatus;
  reviewers: PolicyReviewer[];
  approvals: PolicyApproval[];
  requiredApprovals: number;
  
  // Voting process
  requiresVoting: boolean;
  votingCampaignId?: string;
  votingThreshold: number; // percentage
  
  // Discussion and feedback
  comments: PolicyComment[];
  publicFeedback: boolean;
  feedbackDeadline?: string;
  
  // Implementation tracking
  implementedAt?: string;
  implementedBy?: string;
  rollbackPlan?: string;
  
  // Audit trail
  auditLog: PolicyAuditEntry[];
  
  createdAt: string;
  updatedAt: string;
}

export type PolicyCategory = 
  | 'bylaws'
  | 'financial'
  | 'maintenance'
  | 'security'
  | 'community'
  | 'visitor'
  | 'parking'
  | 'amenity'
  | 'environmental'
  | 'emergency'
  | 'governance';

export interface PolicyChange {
  section: string;
  changeType: 'add' | 'modify' | 'remove';
  currentText?: string;
  proposedText?: string;
  rationale: string;
}

export interface PolicyImpact {
  financialImpact: number;
  affectedResidents: number;
  implementationCost: number;
  timeline: string;
  risks: string[];
  benefits: string[];
}

export type PolicyStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'public_consultation'
  | 'voting'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'rolled_back';

export interface PolicyReviewer {
  userId: string;
  role: string;
  assignedAt: string;
  reviewDeadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  reviewNotes?: string;
  recommendation?: 'approve' | 'reject' | 'modify';
}

export interface PolicyApproval {
  userId: string;
  decision: 'approved' | 'rejected';
  approvedAt: string;
  conditions?: string[];
  notes?: string;
}

export interface PolicyComment {
  id: string;
  userId: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  replies: PolicyComment[];
}

export interface PolicyAuditEntry {
  id: string;
  action: PolicyAuditAction;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
}

export type PolicyAuditAction = 
  | 'proposal_created'
  | 'proposal_submitted'
  | 'review_assigned'
  | 'review_completed'
  | 'voting_started'
  | 'vote_cast'
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'policy_implemented'
  | 'policy_rolled_back';

// Community Engagement Types

export interface CommunityEngagement {
  id: string;
  title: string;
  type: EngagementType;
  description: string;
  society_id: string;
  organizer: string;
  
  // Event details
  startDate: string;
  endDate?: string;
  location?: string;
  maxParticipants?: number;
  registrationRequired: boolean;
  
  // Participation tracking
  participants: EngagementParticipant[];
  feedback: EngagementFeedback[];
  attendance: AttendanceRecord[];
  
  // Outcomes
  outcomes: string[];
  followUpActions: FollowUpAction[];
  successMetrics: SuccessMetric[];
  
  status: EngagementStatus;
  createdAt: string;
  updatedAt: string;
}

export type EngagementType = 
  | 'town_hall'
  | 'feedback_session'
  | 'workshop'
  | 'orientation'
  | 'celebration'
  | 'awareness_campaign'
  | 'volunteer_drive';

export interface EngagementParticipant {
  userId: string;
  registeredAt: string;
  attended: boolean;
  feedbackProvided: boolean;
}

export interface EngagementFeedback {
  userId: string;
  rating: number;
  comments: string;
  suggestions: string[];
  submittedAt: string;
}

export interface AttendanceRecord {
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
}

export interface FollowUpAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
  completedAt?: string;
}

export interface SuccessMetric {
  metric: string;
  target: number;
  actual: number;
  unit: string;
  achieved: boolean;
}

export type EngagementStatus = 
  | 'planned'
  | 'registration_open'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// API Request/Response Types

export interface CreateVotingCampaignRequest {
  title: string;
  description: string;
  type: VotingType;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  candidates?: Omit<VotingCandidate, 'id' | 'votes'>[];
  options?: Omit<VotingOption, 'id' | 'votes'>[];
  eligibilityRules: EligibilityRules;
}

export interface CastVoteRequest {
  campaignId: string;
  candidateId?: string;
  optionId?: string;
}

export interface CreateEmergencyAlertRequest {
  title: string;
  description: string;
  severity: EmergencySeverity;
  type: EmergencyType;
  location?: string;
  affectedAreas: string[];
  contactPerson: string;
  contactNumber: string;
}

export interface UpdateEmergencyStatusRequest {
  alertId: string;
  status: EmergencyStatus;
  notes?: string;
}

export interface AcknowledgeEmergencyRequest {
  alertId: string;
  response: EmergencyResponse;
  location?: string;
  eta?: string;
  notes?: string;
}

export interface CreateSuccessionPlanRequest {
  deputies: Omit<DeputyAssignment, 'assignedAt' | 'assignedBy'>[];
  triggers: SuccessionTrigger[];
  isAutomatic: boolean;
  requiresVoting: boolean;
}

export interface CreatePolicyProposalRequest {
  title: string;
  description: string;
  category: PolicyCategory;
  proposedChanges: PolicyChange[];
  impact: PolicyImpact;
  implementationPlan: string;
  effectiveDate: string;
  publicFeedback: boolean;
  feedbackDeadline?: string;
}

export interface PolicyReviewRequest {
  proposalId: string;
  recommendation: 'approve' | 'reject' | 'modify';
  reviewNotes: string;
  conditions?: string[];
}

// Dashboard and Analytics Types

export interface GovernanceDashboard {
  society_id: string;
  activeVotingCampaigns: number;
  totalVoters: number;
  averageParticipation: number;
  activeEmergencies: number;
  lastEmergencyDate?: string;
  pendingPolicies: number;
  implementedPoliciesThisYear: number;
  communityEngagement: {
    eventsThisMonth: number;
    averageAttendance: number;
    satisfactionScore: number;
  };
  succession: {
    planExists: boolean;
    deputiesAssigned: number;
    lastReviewDate?: string;
  };
}

export interface VotingAnalytics {
  campaignId: string;
  realTimeStats: {
    totalEligibleVoters: number;
    votesCase: number;
    participationRate: number;
    timeRemaining: string;
  };
  demographicBreakdown: {
    byBuilding: Record<string, number>;
    byRole: Record<string, number>;
    byAge: Record<string, number>;
  };
  votingPattern: {
    hourlyVotes: Array<{hour: number; votes: number}>;
    peakVotingTime: string;
    methodology: 'anonymous' | 'recorded';
  };
}

export interface EmergencyAnalytics {
  society_id: string;
  responseMetrics: {
    averageResponseTime: number;
    averageResolutionTime: number;
    escalationRate: number;
    falseAlarmRate: number;
  };
  incidentBreakdown: {
    byType: Record<EmergencyType, number>;
    bySeverity: Record<EmergencySeverity, number>;
    byMonth: Array<{month: string; incidents: number}>;
  };
  preparedness: {
    contactsUpdated: number;
    lastDrillDate?: string;
    drillParticipation: number;
    equipmentStatus: 'good' | 'needs_attention' | 'critical';
  };
}