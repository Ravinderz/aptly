// Phase 8: Democratic Governance & Emergency Systems - Component Exports
// Comprehensive governance system with voting, emergency management, succession planning, and policy governance

export { VotingSystem } from './VotingSystem';
export { EmergencyManagement } from './EmergencyManagement';
export { SuccessionManagement } from './SuccessionManagement';
export { PolicyGovernance } from './PolicyGovernance';
export { GovernanceDashboard } from './GovernanceDashboard';

// Re-export types for convenience
export type {
  VotingCampaign,
  VotingCandidate,
  VotingOption,
  EmergencyAlert,
  EmergencyContact,
  SuccessionPlan,
  DeputyAssignment,
  HandoverTask,
  PolicyProposal,
  PolicyChange,
  GovernanceDashboard as GovernanceDashboardData,
  VotingAnalytics,
  EmergencyAnalytics,
} from '../../types/governance';
