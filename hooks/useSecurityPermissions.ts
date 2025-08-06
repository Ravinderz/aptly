import { useMemo } from 'react';
import { 
  useAuthStore,
  useSecurityPermissions as useSecurityPerms,
  useIsSecurityGuard 
} from '@/stores/slices/authStore';
import { SecurityPermissions } from '@/types/security';

/**
 * Hook for managing security guard permissions
 * 
 * Features:
 * - Permission checking for security guard operations
 * - Route-based access control
 * - Permission validation
 * - Integration with auth store
 */
export const useSecurityPermissions = () => {
  const isSecurityGuard = useIsSecurityGuard();
  const securityPermissions = useSecurityPerms();
  const { updateSecurityPermissions } = useAuthStore();

  // Default permissions for security guards
  const defaultPermissions: SecurityPermissions = useMemo(() => ({
    canCreateVisitor: true,
    canCheckInOut: true,
    canViewHistory: true,
    canHandleEmergency: true,
    canManageVehicles: true,
    canAccessReports: false, // Limited initially
    canModifyVisitorData: true,
    canOverrideApprovals: false, // Limited initially
  }), []);

  // Current permissions with fallback to defaults
  const currentPermissions: SecurityPermissions = useMemo(() => {
    return securityPermissions || defaultPermissions;
  }, [securityPermissions, defaultPermissions]);

  /**
   * Check if the current user has a specific permission
   */
  const hasPermission = (permission: keyof SecurityPermissions): boolean => {
    if (!isSecurityGuard) return false;
    return currentPermissions[permission] || false;
  };

  /**
   * Check if the current user can access a specific route
   */
  const canAccessRoute = (route: string): boolean => {
    if (!isSecurityGuard) return false;

    // Define route-to-permission mapping
    const routePermissions: Record<string, keyof SecurityPermissions> = {
      '/security/visitors/create': 'canCreateVisitor',
      '/security/visitors/checkin': 'canCheckInOut',
      '/security/visitors/checkout': 'canCheckInOut',
      '/security/history': 'canViewHistory',
      '/security/emergency': 'canHandleEmergency',
      '/security/vehicles': 'canManageVehicles',
      '/security/reports': 'canAccessReports',
      '/security/visitors/edit': 'canModifyVisitorData',
      '/security/approvals': 'canOverrideApprovals',
    };

    // Check if route has specific permission requirement
    const requiredPermission = routePermissions[route];
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }

    // Allow access to dashboard and other general routes
    const generalRoutes = [
      '/security',
      '/security/dashboard',
      '/security/profile',
      '/security/settings',
    ];

    return generalRoutes.some(generalRoute => route.startsWith(generalRoute));
  };

  /**
   * Get all permissions that the user has
   */
  const getActivePermissions = (): (keyof SecurityPermissions)[] => {
    if (!isSecurityGuard) return [];
    
    return Object.entries(currentPermissions)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permission]) => permission as keyof SecurityPermissions);
  };

  /**
   * Get all permissions that the user does NOT have
   */
  const getMissingPermissions = (): (keyof SecurityPermissions)[] => {
    if (!isSecurityGuard) return [];
    
    return Object.entries(currentPermissions)
      .filter(([_, hasPermission]) => !hasPermission)
      .map(([permission]) => permission as keyof SecurityPermissions);
  };

  /**
   * Update specific permissions
   */
  const updatePermissions = (newPermissions: Partial<SecurityPermissions>) => {
    if (!isSecurityGuard) return;
    
    updateSecurityPermissions({
      ...currentPermissions,
      ...newPermissions,
    });
  };

  /**
   * Check if user can perform visitor operations
   */
  const canManageVisitors = (): boolean => {
    return hasPermission('canCreateVisitor') && hasPermission('canCheckInOut');
  };

  /**
   * Check if user can perform emergency operations
   */
  const canHandleEmergencies = (): boolean => {
    return hasPermission('canHandleEmergency');
  };

  /**
   * Check if user can view historical data
   */
  const canViewHistoricalData = (): boolean => {
    return hasPermission('canViewHistory');
  };

  /**
   * Check if user can manage vehicle data
   */
  const canManageVehicleData = (): boolean => {
    return hasPermission('canManageVehicles');
  };

  /**
   * Check if user has admin-level permissions
   */
  const hasAdminPermissions = (): boolean => {
    return hasPermission('canAccessReports') && hasPermission('canOverrideApprovals');
  };

  /**
   * Get permission level as a string
   */
  const getPermissionLevel = (): 'none' | 'basic' | 'standard' | 'advanced' | 'admin' => {
    if (!isSecurityGuard) return 'none';

    const activePermissions = getActivePermissions();
    const permissionCount = activePermissions.length;

    if (permissionCount >= 8) return 'admin';
    if (permissionCount >= 6) return 'advanced';
    if (permissionCount >= 4) return 'standard';
    if (permissionCount >= 2) return 'basic';
    
    return 'none';
  };

  return {
    // Permission state
    isSecurityGuard,
    permissions: currentPermissions,
    permissionLevel: getPermissionLevel(),
    
    // Permission checking
    hasPermission,
    canAccessRoute,
    canManageVisitors,
    canHandleEmergencies,
    canViewHistoricalData,
    canManageVehicles: canManageVehicleData,
    hasAdminPermissions,
    
    // Permission management
    updatePermissions,
    getActivePermissions,
    getMissingPermissions,
    
    // Utility
    defaultPermissions,
  };
};

/**
 * Hook for checking specific security permissions
 * @param permission - The permission to check
 */
export const useHasSecurityPermission = (permission: keyof SecurityPermissions) => {
  const { hasPermission } = useSecurityPermissions();
  return hasPermission(permission);
};

/**
 * Hook for checking route access
 * @param route - The route to check access for
 */
export const useCanAccessSecurityRoute = (route: string) => {
  const { canAccessRoute } = useSecurityPermissions();
  return canAccessRoute(route);
};

/**
 * Hook for security guard status and basic permissions
 */
export const useSecurityGuardStatus = () => {
  const { 
    isSecurityGuard, 
    permissionLevel,
    canManageVisitors,
    canHandleEmergencies,
    hasAdminPermissions 
  } = useSecurityPermissions();

  return {
    isSecurityGuard,
    permissionLevel,
    canManageVisitors,
    canHandleEmergencies,
    hasAdminPermissions,
    hasBasicAccess: isSecurityGuard,
  };
};

export default useSecurityPermissions;