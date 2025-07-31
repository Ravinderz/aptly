import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
import type {
  VotingCampaign,
  EmergencyAlert,
  SuccessionPlan,
  PolicyProposal,
  VotingAnalytics,
  EmergencyAnalytics,
  GovernanceDashboard as GovernanceDashboardData,
} from '@/types/governance';

// State interface
interface GovernanceState {
  // Data
  votingCampaigns: VotingCampaign[];
  emergencyAlerts: EmergencyAlert[];
  successionPlans: SuccessionPlan[];
  policyProposals: PolicyProposal[];
  dashboardData: GovernanceDashboardData | null;
  votingAnalytics: VotingAnalytics | null;
  emergencyAnalytics: EmergencyAnalytics | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // User context
  userRole: 'resident' | 'committee_member' | 'admin';
  userId: string;

  // Preferences
  preferences: {
    notifications: boolean;
    emailAlerts: boolean;
    emergencyContacts: string[];
  };
}

// Action types
type GovernanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VOTING_CAMPAIGNS'; payload: VotingCampaign[] }
  | { type: 'ADD_VOTING_CAMPAIGN'; payload: VotingCampaign }
  | {
      type: 'UPDATE_VOTING_CAMPAIGN';
      payload: { id: string; updates: Partial<VotingCampaign> };
    }
  | { type: 'SET_EMERGENCY_ALERTS'; payload: EmergencyAlert[] }
  | { type: 'ADD_EMERGENCY_ALERT'; payload: EmergencyAlert }
  | {
      type: 'UPDATE_EMERGENCY_ALERT';
      payload: { id: string; updates: Partial<EmergencyAlert> };
    }
  | { type: 'SET_SUCCESSION_PLANS'; payload: SuccessionPlan[] }
  | { type: 'ADD_SUCCESSION_PLAN'; payload: SuccessionPlan }
  | { type: 'SET_POLICY_PROPOSALS'; payload: PolicyProposal[] }
  | { type: 'ADD_POLICY_PROPOSAL'; payload: PolicyProposal }
  | {
      type: 'UPDATE_POLICY_PROPOSAL';
      payload: { id: string; updates: Partial<PolicyProposal> };
    }
  | { type: 'SET_DASHBOARD_DATA'; payload: GovernanceDashboardData }
  | { type: 'SET_VOTING_ANALYTICS'; payload: VotingAnalytics }
  | { type: 'SET_EMERGENCY_ANALYTICS'; payload: EmergencyAnalytics }
  | {
      type: 'SET_USER_ROLE';
      payload: 'resident' | 'committee_member' | 'admin';
    }
  | { type: 'SET_USER_ID'; payload: string }
  | {
      type: 'UPDATE_PREFERENCES';
      payload: Partial<GovernanceState['preferences']>;
    }
  | { type: 'REFRESH_DATA' };

// Initial state
const initialState: GovernanceState = {
  votingCampaigns: [],
  emergencyAlerts: [],
  successionPlans: [],
  policyProposals: [],
  dashboardData: null,
  votingAnalytics: null,
  emergencyAnalytics: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  userRole: 'resident',
  userId: '',
  preferences: {
    notifications: true,
    emailAlerts: false,
    emergencyContacts: [],
  },
};

// Reducer
function governanceReducer(
  state: GovernanceState,
  action: GovernanceAction,
): GovernanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_VOTING_CAMPAIGNS':
      return {
        ...state,
        votingCampaigns: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_VOTING_CAMPAIGN':
      return {
        ...state,
        votingCampaigns: [...state.votingCampaigns, action.payload],
        lastUpdated: new Date().toISOString(),
      };

    case 'UPDATE_VOTING_CAMPAIGN':
      return {
        ...state,
        votingCampaigns: state.votingCampaigns.map((campaign) =>
          campaign.id === action.payload.id
            ? { ...campaign, ...action.payload.updates }
            : campaign,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_EMERGENCY_ALERTS':
      return {
        ...state,
        emergencyAlerts: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_EMERGENCY_ALERT':
      return {
        ...state,
        emergencyAlerts: [...state.emergencyAlerts, action.payload],
        lastUpdated: new Date().toISOString(),
      };

    case 'UPDATE_EMERGENCY_ALERT':
      return {
        ...state,
        emergencyAlerts: state.emergencyAlerts.map((alert) =>
          alert.id === action.payload.id
            ? { ...alert, ...action.payload.updates }
            : alert,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_SUCCESSION_PLANS':
      return {
        ...state,
        successionPlans: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_SUCCESSION_PLAN':
      return {
        ...state,
        successionPlans: [...state.successionPlans, action.payload],
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_POLICY_PROPOSALS':
      return {
        ...state,
        policyProposals: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'ADD_POLICY_PROPOSAL':
      return {
        ...state,
        policyProposals: [...state.policyProposals, action.payload],
        lastUpdated: new Date().toISOString(),
      };

    case 'UPDATE_POLICY_PROPOSAL':
      return {
        ...state,
        policyProposals: state.policyProposals.map((proposal) =>
          proposal.id === action.payload.id
            ? { ...proposal, ...action.payload.updates }
            : proposal,
        ),
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        dashboardData: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case 'SET_VOTING_ANALYTICS':
      return {
        ...state,
        votingAnalytics: action.payload,
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_EMERGENCY_ANALYTICS':
      return {
        ...state,
        emergencyAnalytics: action.payload,
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };

    case 'SET_USER_ID':
      return { ...state, userId: action.payload };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case 'REFRESH_DATA':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    default:
      return state;
  }
}

// Context interface
interface GovernanceContextType {
  state: GovernanceState;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Voting actions
  loadVotingCampaigns: () => Promise<void>;
  createVotingCampaign: (campaign: Partial<VotingCampaign>) => Promise<void>;
  voteInCampaign: (campaignId: string, candidateId: string) => Promise<void>;

  // Emergency actions
  loadEmergencyAlerts: () => Promise<void>;
  createEmergencyAlert: (alert: Partial<EmergencyAlert>) => Promise<void>;
  resolveEmergencyAlert: (alertId: string) => Promise<void>;

  // Succession actions
  loadSuccessionPlans: () => Promise<void>;
  createSuccessionPlan: (plan: Partial<SuccessionPlan>) => Promise<void>;
  triggerSuccession: (planId: string) => Promise<void>;

  // Policy actions
  loadPolicyProposals: () => Promise<void>;
  createPolicyProposal: (proposal: Partial<PolicyProposal>) => Promise<void>;
  voteOnPolicy: (
    proposalId: string,
    vote: 'approve' | 'reject',
  ) => Promise<void>;

  // General actions
  loadDashboardData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  updateUserPreferences: (
    preferences: Partial<GovernanceState['preferences']>,
  ) => Promise<void>;

  // Utility functions
  canUserPerformAction: (action: string) => boolean;
  getUserPermissions: () => string[];
}

// Create context
const GovernanceContext = createContext<GovernanceContextType | undefined>(
  undefined,
);

// Storage keys
const STORAGE_KEYS = {
  PREFERENCES: '@governance_preferences',
  USER_ROLE: '@governance_user_role',
  USER_ID: '@governance_user_id',
  CACHED_DATA: '@governance_cached_data',
};

// Provider component
interface GovernanceProviderProps {
  children: ReactNode;
}

export const GovernanceProvider: React.FC<GovernanceProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(governanceReducer, initialState);

  // Initialize data on mount
  useEffect(() => {
    initializeGovernanceData();
  }, []);

  // Save preferences to storage when they change
  useEffect(() => {
    if (state.preferences) {
      AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(state.preferences),
      );
    }
  }, [state.preferences]);

  const initializeGovernanceData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load cached preferences
      const cachedPreferences = await AsyncStorage.getItem(
        STORAGE_KEYS.PREFERENCES,
      );
      if (cachedPreferences) {
        dispatch({
          type: 'UPDATE_PREFERENCES',
          payload: JSON.parse(cachedPreferences),
        });
      }

      // Load user role
      const cachedUserRole = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
      if (cachedUserRole) {
        dispatch({
          type: 'SET_USER_ROLE',
          payload: cachedUserRole as 'resident' | 'committee_member' | 'admin',
        });
      }

      // Load user ID
      const cachedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (cachedUserId) {
        dispatch({ type: 'SET_USER_ID', payload: cachedUserId });
      }

      // Load all governance data
      await Promise.all([
        loadVotingCampaigns(),
        loadEmergencyAlerts(),
        loadSuccessionPlans(),
        loadPolicyProposals(),
        loadDashboardData(),
      ]);
    } catch (error) {
      console.error('Failed to initialize governance data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load governance data',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // API functions (mock implementations - replace with real API calls)
  const loadVotingCampaigns = async () => {
    try {
      // Mock API call
      const campaigns: VotingCampaign[] = [
        {
          id: 'campaign-1',
          title: 'Committee Election 2024',
          description: 'Annual committee member election',
          type: 'committee_election',
          status: 'active',
          createdBy: 'admin-1',
          society_id: 'society-1',
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-30T23:59:59Z',
          isAnonymous: true,
          requiresQuorum: false,
          minimumParticipation: 50,
          candidates: [
            {
              id: 'candidate-1',
              userId: 'user-123',
              name: 'Rajesh Kumar',
              designation: 'Treasurer',
              profileImage: undefined,
              bio: 'Experienced in financial management',
              manifesto: 'Transparent financial management',
              nominatedBy: 'user-456',
              endorsements: [],
              votes: 45,
            },
          ],
          options: [],
          eligibleVoters: ['user1', 'user2', 'user3'],
          eligibilityRules: {
            minimumResidencyMonths: 6,
            requiredVerification: true,
            excludedRoles: [],
            includeOwners: true,
            includeTenants: true,
            includeFamilyMembers: false,
          },
          totalVotes: 45,
          results: undefined,
          isResultsPublished: false,
          auditLog: [],
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
      ];

      dispatch({ type: 'SET_VOTING_CAMPAIGNS', payload: campaigns });
    } catch (error) {
      console.error('Failed to load voting campaigns:', error);
      throw error;
    }
  };

  const createVotingCampaign = async (
    campaignData: Partial<VotingCampaign>,
  ) => {
    try {
      // Mock API call
      const newCampaign: VotingCampaign = {
        id: `campaign-${Date.now()}`,
        title: campaignData.title || '',
        description: campaignData.description || '',
        type: campaignData.type || 'emergency_decision',
        status: 'draft',
        startDate: campaignData.startDate || new Date().toISOString(),
        endDate:
          campaignData.endDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isAnonymous: campaignData.isAnonymous || true,
        requiresQuorum: campaignData.requiresQuorum || false,
        minimumParticipation: campaignData.minimumParticipation || 30,
        candidates: campaignData.candidates || [],
        options: campaignData.options || [],
        totalVotes: 0,
        eligibleVoters: [], // Will be populated based on eligibility rules
        createdBy: state.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_VOTING_CAMPAIGN', payload: newCampaign });
    } catch (error) {
      console.error('Failed to create voting campaign:', error);
      throw error;
    }
  };

  const voteInCampaign = async (campaignId: string, candidateId: string) => {
    try {
      // Mock API call
      dispatch({
        type: 'UPDATE_VOTING_CAMPAIGN',
        payload: {
          id: campaignId,
          updates: {
            totalVotes:
              (state.votingCampaigns.find((c) => c.id === campaignId)
                ?.totalVotes || 0) + 1,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to vote in campaign:', error);
      throw error;
    }
  };

  const loadEmergencyAlerts = async () => {
    try {
      // Mock API call
      const alerts: EmergencyAlert[] = [
        {
          id: 'alert-1',
          title: 'Water Supply Disruption',
          description:
            'Water supply will be disrupted from 2 PM to 6 PM for maintenance',
          severity: 'medium',
          type: 'water_shortage',
          status: 'active',
          society_id: 'society-1',
          location: 'Water Tank Area',
          affectedAreas: ['Block A', 'Block B'],
          contactPerson: 'Maintenance Team',
          contactNumber: '+91-9876543210',
          declaredBy: 'admin-1',
          escalationLevel: 1,
          escalationChain: [
            {
              level: 1,
              role: 'maintenance_admin',
              userId: 'user-engineer',
              contactMethods: ['push', 'sms'],
              timeoutMinutes: 30,
              isActivated: true,
              activatedAt: '2024-01-20T08:00:00Z',
              acknowledgedAt: '2024-01-20T08:15:00Z',
            },
          ],
          currentResponder: 'user-engineer',
          notifications: [],
          acknowledgments: [],
          resolvedBy: undefined,
          resolvedAt: undefined,
          resolutionNotes: undefined,
          postIncidentReport: undefined,
          overriddenBy: undefined,
          overrideReason: undefined,
          createdAt: '2024-01-20T08:00:00Z',
          updatedAt: '2024-01-20T08:00:00Z',
        },
      ];

      dispatch({ type: 'SET_EMERGENCY_ALERTS', payload: alerts });
    } catch (error) {
      console.error('Failed to load emergency alerts:', error);
      throw error;
    }
  };

  const createEmergencyAlert = async (alertData: Partial<EmergencyAlert>) => {
    try {
      // Mock API call
      const newAlert: EmergencyAlert = {
        id: `alert-${Date.now()}`,
        title: alertData.title || '',
        description: alertData.description || '',
        severity: alertData.severity || 'medium',
        category: alertData.category || 'general',
        status: 'active',
        affectedAreas: alertData.affectedAreas || [],
        instructions: alertData.instructions || '',
        estimatedDuration: alertData.estimatedDuration || '',
        contactPerson: alertData.contactPerson || '',
        contactNumber: alertData.contactNumber || '',
        escalationChain: alertData.escalationChain || [],
        isResolved: false,
        createdBy: state.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_EMERGENCY_ALERT', payload: newAlert });
    } catch (error) {
      console.error('Failed to create emergency alert:', error);
      throw error;
    }
  };

  const resolveEmergencyAlert = async (alertId: string) => {
    try {
      // Mock API call
      dispatch({
        type: 'UPDATE_EMERGENCY_ALERT',
        payload: {
          id: alertId,
          updates: {
            status: 'resolved',
            isResolved: true,
            updatedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Failed to resolve emergency alert:', error);
      throw error;
    }
  };

  const loadSuccessionPlans = async () => {
    try {
      // Mock API call - would fetch from real API
      dispatch({ type: 'SET_SUCCESSION_PLANS', payload: [] });
    } catch (error) {
      console.error('Failed to load succession plans:', error);
      throw error;
    }
  };

  const createSuccessionPlan = async (planData: Partial<SuccessionPlan>) => {
    try {
      // Mock API call - would create via real API
      console.log('Creating succession plan:', planData);
    } catch (error) {
      console.error('Failed to create succession plan:', error);
      throw error;
    }
  };

  const triggerSuccession = async (planId: string) => {
    try {
      // Mock API call - would trigger via real API
      console.log('Triggering succession for plan:', planId);
    } catch (error) {
      console.error('Failed to trigger succession:', error);
      throw error;
    }
  };

  const loadPolicyProposals = async () => {
    try {
      // Mock API call - would fetch from real API
      dispatch({ type: 'SET_POLICY_PROPOSALS', payload: [] });
    } catch (error) {
      console.error('Failed to load policy proposals:', error);
      throw error;
    }
  };

  const createPolicyProposal = async (
    proposalData: Partial<PolicyProposal>,
  ) => {
    try {
      // Mock API call - would create via real API
      console.log('Creating policy proposal:', proposalData);
    } catch (error) {
      console.error('Failed to create policy proposal:', error);
      throw error;
    }
  };

  const voteOnPolicy = async (
    proposalId: string,
    vote: 'approve' | 'reject',
  ) => {
    try {
      // Mock API call - would submit vote via real API
      console.log('Voting on policy:', { proposalId, vote });
    } catch (error) {
      console.error('Failed to vote on policy:', error);
      throw error;
    }
  };

  const loadDashboardData = async () => {
    try {
      // Mock API call
      const dashboardData: GovernanceDashboardData = {
        society_id: 'society-1',
        activeVotingCampaigns: state.votingCampaigns.filter(
          (c) => c.status === 'active',
        ).length,
        totalVoters: 150,
        averageParticipation: 55.3,
        activeEmergencies: state.emergencyAlerts.filter(
          (a) => a.status === 'active',
        ).length,
        lastEmergencyDate: '2024-01-10T08:00:00Z',
        pendingPolicies: 2,
        implementedPoliciesThisYear: 5,
        communityEngagement: {
          eventsThisMonth: 3,
          averageAttendance: 85,
          satisfactionScore: 4.2,
        },
        succession: {
          planExists: true,
          deputiesAssigned: 2,
          lastReviewDate: '2024-01-01T00:00:00Z',
        },
      };

      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      throw error;
    }
  };

  const refreshAllData = async () => {
    dispatch({ type: 'REFRESH_DATA' });
    await initializeGovernanceData();
  };

  const updateUserPreferences = async (
    preferences: Partial<GovernanceState['preferences']>,
  ) => {
    try {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify({
          ...state.preferences,
          ...preferences,
        }),
      );
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  };

  const canUserPerformAction = (action: string): boolean => {
    const permissions = getUserPermissions();
    return permissions.includes(action);
  };

  const getUserPermissions = (): string[] => {
    switch (state.userRole) {
      case 'admin':
        return [
          'create_campaign',
          'edit_campaign',
          'delete_campaign',
          'create_emergency',
          'resolve_emergency',
          'create_succession_plan',
          'trigger_succession',
          'create_policy',
          'approve_policy',
          'view_analytics',
          'export_data',
        ];
      case 'committee_member':
        return [
          'create_campaign',
          'edit_campaign',
          'create_emergency',
          'resolve_emergency',
          'create_policy',
          'view_analytics',
        ];
      case 'resident':
      default:
        return [
          'vote',
          'view_campaigns',
          'view_emergencies',
          'propose_policy',
          'vote_policy',
        ];
    }
  };

  const contextValue: GovernanceContextType = {
    state,
    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),
    loadVotingCampaigns,
    createVotingCampaign,
    voteInCampaign,
    loadEmergencyAlerts,
    createEmergencyAlert,
    resolveEmergencyAlert,
    loadSuccessionPlans,
    createSuccessionPlan,
    triggerSuccession,
    loadPolicyProposals,
    createPolicyProposal,
    voteOnPolicy,
    loadDashboardData,
    refreshAllData,
    updateUserPreferences,
    canUserPerformAction,
    getUserPermissions,
  };

  return (
    <GovernanceContext.Provider value={contextValue}>
      {children}
    </GovernanceContext.Provider>
  );
};

// Hook to use governance context
export const useGovernance = (): GovernanceContextType => {
  const context = useContext(GovernanceContext);
  if (context === undefined) {
    throw new Error('useGovernance must be used within a GovernanceProvider');
  }
  return context;
};

export default GovernanceContext;
