import { useMemo } from 'react';
import { useDirectAuth } from './useDirectAuth';

export type UserRole = 'super_admin' | 'community_manager' | 'society_admin' | 'resident' | 'guest';

export type Resource = 
  | 'societies' 
  | 'users' 
  | 'analytics' 
  | 'billing' 
  | 'support' 
  | 'system_settings'
  | 'society_settings'
  | 'residents'
  | 'maintenance'
  | 'governance'
  | 'communications';

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'assign' | 'manage';

interface Permission {
  resource: Resource;
  actions: Action[];
  conditions?: {
    ownSocietyOnly?: boolean;
    assignedSocietiesOnly?: boolean;
    ownDataOnly?: boolean;
  };
}

/**
 * Role-based permission matrix
 * Defines what each role can do with each resource
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    {
      resource: 'societies',
      actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'],
    },
    {
      resource: 'users',
      actions: ['view', 'create', 'edit', 'delete', 'assign', 'manage'],
    },
    {
      resource: 'analytics',
      actions: ['view', 'manage'],
    },
    {
      resource: 'billing',
      actions: ['view', 'create', 'edit', 'manage'],
    },
    {
      resource: 'support',
      actions: ['view', 'create', 'edit', 'assign', 'manage'],
    },
    {
      resource: 'system_settings',
      actions: ['view', 'edit', 'manage'],
    },
  ],
  
  community_manager: [
    {
      resource: 'societies',
      actions: ['view', 'edit'],
      conditions: { assignedSocietiesOnly: true },
    },
    {
      resource: 'users',
      actions: ['view', 'edit'],
      conditions: { assignedSocietiesOnly: true },
    },
    {
      resource: 'residents',
      actions: ['view', 'create', 'edit'],
      conditions: { assignedSocietiesOnly: true },
    },
    {
      resource: 'analytics',
      actions: ['view'],
      conditions: { assignedSocietiesOnly: true },
    },
    {
      resource: 'support',
      actions: ['view', 'create', 'edit', 'manage'],
      conditions: { assignedSocietiesOnly: true },
    },
    {
      resource: 'maintenance',
      actions: ['view', 'create', 'edit'],
      conditions: { assignedSocietiesOnly: true },
    },
    {
      resource: 'communications',
      actions: ['view', 'create', 'edit'],
      conditions: { assignedSocietiesOnly: true },
    },
  ],
  
  society_admin: [
    {
      resource: 'residents',
      actions: ['view', 'create', 'edit', 'approve'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'society_settings',
      actions: ['view', 'edit', 'manage'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'maintenance',
      actions: ['view', 'create', 'edit', 'approve', 'manage'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'governance',
      actions: ['view', 'create', 'edit', 'manage'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'analytics',
      actions: ['view'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'communications',
      actions: ['view', 'create', 'edit', 'manage'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'billing',
      actions: ['view', 'manage'],
      conditions: { ownSocietyOnly: true },
    },
  ],
  
  resident: [
    {
      resource: 'maintenance',
      actions: ['view', 'create'],
      conditions: { ownSocietyOnly: true, ownDataOnly: true },
    },
    {
      resource: 'governance',
      actions: ['view'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'communications',
      actions: ['view'],
      conditions: { ownSocietyOnly: true },
    },
    {
      resource: 'residents',
      actions: ['view'],
      conditions: { ownSocietyOnly: true, ownDataOnly: true },
    },
    {
      resource: 'billing',
      actions: ['view'],
      conditions: { ownDataOnly: true },
    },
  ],
  
  guest: [
    // Guests have no permissions - they can only register
  ],
};

/**
 * Hook for role-based permissions
 */
export const usePermissions = () => {
  const { user } = useDirectAuth();

  const permissions = useMemo(() => {
    if (!user || !user.role) return [];
    return ROLE_PERMISSIONS[user.role as UserRole] || [];
  }, [user?.role]);

  /**
   * Check if user has permission for a specific action on a resource
   */
  const hasPermission = (resource: Resource, action: Action, context?: {
    societyId?: string;
    userId?: string;
    isAssignedSociety?: boolean;
    isOwnData?: boolean;
  }): boolean => {
    if (!user) return false;

    const permission = permissions.find(p => p.resource === resource);
    if (!permission) return false;

    // Check if action is allowed
    if (!permission.actions.includes(action)) return false;

    // Check conditions if they exist
    if (permission.conditions && context) {
      const { conditions } = permission;
      
      // Own society only check
      if (conditions.ownSocietyOnly && context.societyId && user.societyId) {
        if (context.societyId !== user.societyId) return false;
      }
      
      // Assigned societies only check (for community managers)
      if (conditions.assignedSocietiesOnly && context.societyId) {
        if (!context.isAssignedSociety) return false;
      }
      
      // Own data only check
      if (conditions.ownDataOnly && context.userId) {
        if (context.userId !== user.id) return false;
      }
    }

    return true;
  };

  /**
   * Check multiple permissions at once
   */
  const hasAnyPermission = (checks: Array<{
    resource: Resource;
    action: Action;
    context?: Parameters<typeof hasPermission>[2];
  }>): boolean => {
    return checks.some(check => hasPermission(check.resource, check.action, check.context));
  };

  const hasAllPermissions = (checks: Array<{
    resource: Resource;
    action: Action;
    context?: Parameters<typeof hasPermission>[2];
  }>): boolean => {
    return checks.every(check => hasPermission(check.resource, check.action, check.context));
  };

  /**
   * Get all allowed actions for a resource
   */
  const getAllowedActions = (resource: Resource): Action[] => {
    const permission = permissions.find(p => p.resource === resource);
    return permission?.actions || [];
  };

  /**
   * Check if user can access a specific route
   */
  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    // Public routes
    if (route.startsWith('/register') || route === '/welcome') {
      return true;
    }

    // Admin routes
    if (route.startsWith('/admin')) {
      return user.role === 'super_admin';
    }

    // Manager routes
    if (route.startsWith('/manager')) {
      return user.role === 'community_manager';
    }

    // Default resident routes
    if (route.startsWith('/(tabs)')) {
      return ['super_admin', 'community_manager', 'society_admin', 'resident'].includes(user.role as UserRole);
    }

    return true; // Allow access to unspecified routes
  };

  /**
   * Role-specific utility functions
   */
  const isSuperAdmin = user?.role === 'super_admin';
  const isCommunityManager = user?.role === 'community_manager';
  const isSocietyAdmin = user?.role === 'society_admin';
  const isResident = user?.role === 'resident';
  const isGuest = !user || user.role === 'guest';

  const isStaff = isSuperAdmin || isCommunityManager || isSocietyAdmin;
  const isAdmin = isSuperAdmin || isSocietyAdmin;

  /**
   * Get permission summary for debugging
   */
  const getPermissionSummary = () => {
    if (!user) return { role: 'guest', permissions: [] };
    
    return {
      role: user.role,
      permissions: permissions.map(p => ({
        resource: p.resource,
        actions: p.actions,
        conditions: p.conditions,
      })),
    };
  };

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllowedActions,
    canAccessRoute,
    
    // Role checks
    isSuperAdmin,
    isCommunityManager,
    isSocietyAdmin,
    isResident,
    isGuest,
    isStaff,
    isAdmin,
    
    // User info
    currentRole: user?.role as UserRole,
    userId: user?.id,
    societyId: user?.societyId,
    
    // Debug
    getPermissionSummary,
    permissions,
  };
};

/**
 * Hook for society-specific permissions
 */
export const useSocietyPermissions = (societyId?: string) => {
  const permissions = usePermissions();
  const { user } = useDirectAuth();

  const context = useMemo(() => ({
    societyId,
    userId: user?.id,
    isAssignedSociety: user?.assignedSocieties?.includes(societyId || '') || false,
    isOwnData: false, // Will be set per use case
  }), [societyId, user?.id, user?.assignedSocieties]);

  return {
    ...permissions,
    
    // Society-specific checks
    canViewSociety: permissions.hasPermission('societies', 'view', context),
    canEditSociety: permissions.hasPermission('societies', 'edit', context),
    canManageResidents: permissions.hasPermission('residents', 'manage', context),
    canViewAnalytics: permissions.hasPermission('analytics', 'view', context),
    canManageMaintenance: permissions.hasPermission('maintenance', 'manage', context),
    canManageGovernance: permissions.hasPermission('governance', 'manage', context),
    
    // Utility
    societyContext: context,
  };
};

/**
 * Permission-based feature flags
 */
export const useFeaturePermissions = () => {
  const permissions = usePermissions();

  return {
    // Admin features
    showAdminPanel: permissions.isSuperAdmin,
    showManagerPanel: permissions.isCommunityManager,
    showSystemSettings: permissions.hasPermission('system_settings', 'view'),
    
    // Society features
    showSocietyManagement: permissions.hasPermission('societies', 'manage'),
    showUserManagement: permissions.hasPermission('users', 'manage'),
    showBillingManagement: permissions.hasPermission('billing', 'manage'),
    
    // Analytics features
    showSystemAnalytics: permissions.hasPermission('analytics', 'view') && permissions.isSuperAdmin,
    showSocietyAnalytics: permissions.hasPermission('analytics', 'view'),
    
    // Support features
    showSupportPanel: permissions.hasPermission('support', 'manage'),
    canCreateTickets: permissions.hasPermission('support', 'create'),
    
    // Content management
    canCreateAnnouncements: permissions.hasPermission('communications', 'create'),
    canManageEvents: permissions.hasPermission('communications', 'manage'),
  };
};