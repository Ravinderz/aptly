// Admin system comprehensive TypeScript definitions

export type AdminRole =
  | 'super_admin'
  | 'community_manager'
  | 'financial_manager'
  | 'security_admin'
  | 'maintenance_admin';

export type AppMode = 'resident' | 'admin';

// Base admin user interface
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: AdminRole;
  societies: AdminSocietyAccess[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  permissions: Permission[];
  emergencyContact?: boolean; // For CM and Super Admin
}

// Society access definition
export interface AdminSocietyAccess {
  societyId: string;
  societyName: string;
  role: AdminRole;
  assignedBy: string; // User ID who assigned this role
  assignedAt: string;
  isActive: boolean;
  permissions: SocietyPermission[];
}

// Granular permission system
export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
}

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'escalate'
  | 'bulk_action'
  | 'bulk_approve'
  | 'export'
  | 'import'
  | 'broadcast'
  | 'declare'
  | 'generate'
  | 'incidents'
  | 'billing_notices'
  | 'security_alerts'
  | 'maintenance_updates'
  | '*'; // wildcard for super admin

export type PermissionScope = 'global' | 'society' | 'own' | 'assigned';

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

// Society-specific permissions
export interface SocietyPermission {
  societyId: string;
  resource: AdminResource;
  actions: PermissionAction[];
  limitations?: PermissionLimitation[];
}

export type AdminResource =
  | 'residents'
  | 'billing'
  | 'maintenance'
  | 'visitors'
  | 'notices'
  | 'analytics'
  | 'settings'
  | 'team_management'
  | 'emergency'
  | 'voting'
  | 'audit_logs'
  | 'reports';

export interface PermissionLimitation {
  type: 'amount_limit' | 'time_limit' | 'approval_required';
  value: number | string;
  approver?: AdminRole;
}

// Admin session management
export interface AdminSession {
  sessionId: string;
  userId: string;
  currentMode: AppMode;
  activeSocietyId?: string;
  adminRole?: AdminRole;
  permissions: Permission[];
  startTime: string;
  lastActivity: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  appVersion: string;
}

// Role-based dashboard configuration
export interface AdminDashboardConfig {
  role: AdminRole;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  theme: 'resident' | 'admin';
  navigation: NavigationItem[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  permissions: Permission[];
  dataSource: string;
  refreshInterval?: number;
}

export type WidgetType =
  | 'pending_approvals'
  | 'financial_summary'
  | 'maintenance_overview'
  | 'visitor_stats'
  | 'resident_activity'
  | 'emergency_alerts'
  | 'society_selector'
  | 'quick_actions'
  | 'audit_activity';

export interface DashboardLayout {
  columns: number;
  spacing: number;
  responsive: boolean;
}

// Multi-society management
export interface SocietyContext {
  currentSociety: Society | null;
  availableSocieties: Society[];
  canSwitch: boolean;
  switchSociety: (societyId: string) => Promise<void>;
}

export interface Society {
  id: string;
  name: string;
  code: string;
  address: string;
  totalFlats: number;
  activeResidents: number;
  adminCount: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  settings: SocietySettings;
}

export interface SocietySettings {
  billingCycle: 'monthly' | 'quarterly';
  gstEnabled: boolean;
  emergencyContacts: EmergencyContact[];
  policies: SocietyPolicy[];
  features: SocietyFeature[];
}

export interface SocietyPolicy {
  id: string;
  title: string;
  description: string;
  category: 'billing' | 'maintenance' | 'visitor' | 'community';
  isActive: boolean;
  approvedBy: string;
  approvedAt: string;
}

export interface SocietyFeature {
  name: string;
  enabled: boolean;
  configuredBy: string;
}

// Audit trail system
export interface AuditLog {
  id: string;
  timestamp: string;
  category: AuditCategory;
  eventType: string;
  actor: AuditActor;
  target: AuditTarget;
  details: AuditDetails;
  severity: 'low' | 'medium' | 'high' | 'critical';
  societyId: string;
  sessionId: string;
  retentionUntil: string; // 1 year retention
}

export type AuditCategory =
  | 'admin_actions'
  | 'billing_finance'
  | 'maintenance_management'
  | 'security_management'
  | 'resident_management'
  | 'communication'
  | 'voting_governance'
  | 'emergency_response';

export interface AuditActor {
  userId: string;
  role: AdminRole;
  name: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
}

export interface AuditTarget {
  resourceType: string;
  resourceId: string;
  affectedUsers?: string[];
  societyId?: string;
}

export interface AuditDetails {
  action: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  approvalRequired?: boolean;
  approvedBy?: string;
  escalatedFrom?: AdminRole;
  metadata?: Record<string, any>;
}

// Emergency management
export interface EmergencyIncident {
  id: string;
  type: EmergencyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  society: Society;
  status: EmergencyStatus;
  assignedTo?: string;
  responseTeam: EmergencyResponder[];
  updates: EmergencyUpdate[];
  resolvedAt?: string;
  escalationChain: EmergencyEscalation[];
}

export type EmergencyType =
  | 'security_breach'
  | 'fire'
  | 'medical'
  | 'maintenance_critical'
  | 'natural_disaster'
  | 'power_outage'
  | 'water_shortage'
  | 'other';

export type EmergencyStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'escalated'
  | 'resolved';

export interface EmergencyResponder {
  userId: string;
  role: AdminRole;
  responseTime?: string;
  status: 'notified' | 'acknowledged' | 'responding' | 'on_site';
}

export interface EmergencyUpdate {
  id: string;
  timestamp: string;
  updateBy: string;
  message: string;
  attachments?: string[];
  broadcastToResidents: boolean;
}

export interface EmergencyEscalation {
  from: AdminRole;
  to: AdminRole;
  reason: string;
  timestamp: string;
  autoEscalation: boolean;
}

// Democratic governance system
export interface VotingCampaign {
  id: string;
  societyId: string;
  type: VotingType;
  title: string;
  description: string;
  initiatedBy: string;
  nominationPeriod: {
    startDate: string;
    endDate: string;
  };
  votingPeriod: {
    startDate: string;
    endDate: string;
  };
  candidates: VotingCandidate[];
  eligibleVoters: string[];
  requiredQuorum: number; // percentage
  winningThreshold: number; // percentage
  status: VotingStatus;
  results?: VotingResults;
  isAnonymous: boolean;
}

export type VotingType =
  | 'admin_promotion'
  | 'policy_change'
  | 'budget_approval'
  | 'cm_succession'
  | 'facility_upgrade'
  | 'vendor_selection';

export type VotingStatus =
  | 'nomination'
  | 'voting'
  | 'counting'
  | 'completed'
  | 'cancelled';

export interface VotingCandidate {
  userId: string;
  name: string;
  nominatedBy: string;
  nominationStatement: string;
  qualifications: string[];
  votes?: number; // Only visible after voting closes
}

export interface VotingResults {
  totalVotes: number;
  quorumAchieved: boolean;
  winner?: string;
  voteCounts: Record<string, number>;
  completedAt: string;
  certifiedBy: string;
}

// Role assignment and management
export interface RoleAssignment {
  id: string;
  societyId: string;
  userId: string;
  role: AdminRole;
  assignedBy: string;
  assignedAt: string;
  validUntil?: string;
  isActive: boolean;
  permissions: SocietyPermission[];
  limitations: RoleLimitation[];
  approvalRequired: boolean;
  approvedBy?: string;
}

export interface RoleLimitation {
  type: 'budget_limit' | 'approval_required' | 'time_restriction';
  value: number | string;
  description: string;
}

// Notification system for admins
export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  recipientRole: AdminRole[];
  societyId?: string;
  createdBy: string;
  createdAt: string;
  scheduledFor?: string;
  readBy: NotificationRead[];
  actionRequired?: NotificationAction;
  expiresAt?: string;
}

export type AdminNotificationType =
  | 'approval_request'
  | 'emergency_alert'
  | 'system_update'
  | 'role_assignment'
  | 'voting_notification'
  | 'audit_alert'
  | 'financial_alert'
  | 'maintenance_escalation';

export interface NotificationRead {
  userId: string;
  readAt: string;
  acknowledged: boolean;
}

export interface NotificationAction {
  type: 'approval' | 'escalation' | 'response_required';
  actionUrl: string;
  deadline?: string;
}

// API request/response types for admin operations
export interface AdminAPIRequest<T = any> {
  action: string;
  payload: T;
  sessionId: string;
  societyId?: string;
  permissions: Permission[];
  auditInfo: {
    reason?: string;
    approvedBy?: string;
  };
}

export interface AdminAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AdminError;
  auditLogId?: string;
  permissions?: Permission[];
  warnings?: string[];
}

export interface AdminError {
  code: string;
  message: string;
  field?: string;
  requiredPermission?: Permission;
  escalationPath?: AdminRole[];
}

// Form validation for admin operations
export interface AdminFormValidation {
  field: string;
  rules: ValidationRule[];
  dependencies?: string[];
  permissions?: Permission[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  validator?: (value: any, context: any) => boolean;
}

// Utility types for type safety
export type RequireAdmin<T> = T & {
  __adminRequired: true;
  permissions: Permission[];
};

export type SocietyScoped<T> = T & {
  societyId: string;
  __societyScoped: true;
};

export type Auditable<T> = T & {
  auditInfo: {
    createdBy: string;
    createdAt: string;
    modifiedBy?: string;
    modifiedAt?: string;
    reason?: string;
  };
};

// Helper types for role-based access
export type SuperAdminOnly<T> = T & { __superAdminOnly: true };
export type CommunityManagerOnly<T> = T & { __communityManagerOnly: true };
export type SubAdminAccessible<T> = T & { __subAdminAccessible: true };

// Multi-society context types
export type MultiSocietyCapable<T> = T & {
  societies: string[];
  currentSociety: string;
  __multiSociety: true;
};
