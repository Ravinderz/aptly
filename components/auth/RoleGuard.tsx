import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, AlertTriangle } from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export type UserRole = 'super_admin' | 'community_manager' | 'society_admin' | 'resident' | 'security_guard' | 'guest';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackRoute?: string;
  showFallback?: boolean;
  customFallback?: React.ReactNode;
}

/**
 * RoleGuard - Protects routes based on user roles
 * 
 * Features:
 * - Role-based access control
 * - Custom fallback UI
 * - Automatic redirects
 * - Loading states
 */
export const RoleGuard = ({
  children,
  allowedRoles,
  fallbackRoute = '/(tabs)/',
  showFallback = true,
  customFallback,
}: RoleGuardProps) => {
  const router = useRouter();
  const { user, isLoading } = useDirectAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="animate-spin">
          <Shield size={32} color="#6b7280" />
        </View>
        <Text className="text-gray-600 mt-4">Checking permissions...</Text>
      </View>
    );
  }

  // User not authenticated
  if (!user) {
    if (customFallback) {
      return (
        <View style={{ flex: 1 }}>
          {customFallback}
        </View>
      );
    }
    
    if (showFallback) {
      return (
        <View className="flex-1 justify-center items-center p-4 bg-gray-50">
          <Shield size={48} color="#6b7280" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
            Authentication Required
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Please log in to access this area.
          </Text>
          <Button
            onPress={() => router.replace('/welcome')}
            variant="primary"
            className="mt-6"
          >
            Go to Login
          </Button>
        </View>
      );
    }

    // Redirect to fallback route
    router.replace(fallbackRoute);
    return null;
  }

  // Check if user has required role
  const hasPermission = allowedRoles.includes(user.role as UserRole);

  if (!hasPermission) {
    if (customFallback) {
      return (
        <View style={{ flex: 1 }}>
          {customFallback}
        </View>
      );
    }
    
    if (showFallback) {
      return (
        <View className="flex-1 justify-center items-center p-4 bg-gray-50">
          <AlertTriangle size={48} color="#dc2626" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
            Access Denied
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            You don't have permission to access this area.
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-1">
            <Text>Required role: </Text>
            <Text>{allowedRoles.join(' or ')}</Text>
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            <Text>Your role: </Text>
            <Text>{user.role}</Text>
          </Text>
          <Button
            onPress={() => router.replace(fallbackRoute)}
            variant="primary"
            className="mt-6"
          >
            Return to Dashboard
          </Button>
        </View>
      );
    }

    // Redirect to fallback route
    router.replace(fallbackRoute);
    return null;
  }

  // User has permission, render children
  // Use View wrapper instead of Fragment to maintain stable component references
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

/**
 * RequireRole - Higher-order component for role protection
 */
export const RequireRole = (allowedRoles: UserRole[], fallbackRoute?: string) => {
  return <T extends object>(Component: React.ComponentType<T>) => {
    // Enhanced safety check for component
    if (!Component || typeof Component !== 'function') {
      console.warn('RequireRole: Component is undefined or not a valid component');
      const EmptyComponent = () => null;
      EmptyComponent.displayName = 'RequireRole(EmptyComponent)';
      return EmptyComponent as any;
    }

    const WrappedComponent = (props: T) => {
      // Additional safety check during render
      if (!Component) {
        console.warn('RequireRole: Component became undefined during render');
        return null;
      }
      
      return (
        <RoleGuard allowedRoles={allowedRoles} fallbackRoute={fallbackRoute}>
          <Component {...props} />
        </RoleGuard>
      );
    };
    
    // Enhanced safe displayName assignment with multiple fallbacks
    const getComponentName = () => {
      try {
        if (!Component || typeof Component !== 'function') return 'Unknown';
        // Safe access with explicit checks
        const displayName = Component && typeof Component.displayName === 'string' ? Component.displayName : null;
        const componentName = Component && typeof Component.name === 'string' ? Component.name : null;
        return displayName || componentName || 'Anonymous';
      } catch (error) {
        console.warn('getComponentName error:', error);
        return 'SafeFallback';
      }
    };
    
    const componentName = getComponentName();
    try {
      WrappedComponent.displayName = `RequireRole(${componentName})`;
    } catch (error) {
      console.warn('DisplayName assignment error:', error);
      // Continue without displayName if assignment fails
    }
    return WrappedComponent;
  };
};

/**
 * Role-specific guards for common use cases
 */
export const RequireSuperAdmin = React.forwardRef<View, { children: React.ReactNode }>(({ children }, ref) => {
  // Safety check for children
  if (!children) {
    console.warn('RequireSuperAdmin: children is undefined');
    return null;
  }
  
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      {children}
    </RoleGuard>
  );
});

export const RequireManager = React.forwardRef<View, { children: React.ReactNode }>(({ children }, ref) => {
  // Safety check for children
  if (!children) {
    console.warn('RequireManager: children is undefined');
    return null;
  }
  
  return (
    <RoleGuard allowedRoles={['community_manager']}>
      {children}
    </RoleGuard>
  );
});

export const RequireAdmin = React.forwardRef<View, { children: React.ReactNode }>(({ children }, ref) => {
  // Safety check for children
  if (!children) {
    console.warn('RequireAdmin: children is undefined');
    return null;
  }
  
  return (
    <RoleGuard allowedRoles={['super_admin', 'society_admin']}>
      {children}
    </RoleGuard>
  );
});

export const RequireStaff = React.forwardRef<View, { children: React.ReactNode }>(({ children }, ref) => {
  // Safety check for children
  if (!children) {
    console.warn('RequireStaff: children is undefined');
    return null;
  }
  
  return (
    <RoleGuard allowedRoles={['super_admin', 'community_manager', 'society_admin']}>
      {children}
    </RoleGuard>
  );
});

export const RequireSecurityGuard = React.forwardRef<View, { 
  children: React.ReactNode;
  requireVerification?: boolean;
  customFallback?: React.ReactNode;
}>(({ 
  children, 
  requireVerification = true, 
  customFallback 
}, ref) => {
  const { user } = useDirectAuth();
  const router = useRouter();

  // Safety check for children
  if (!children) {
    console.warn('RequireSecurityGuard: children is undefined');
    return null;
  }

  // Additional verification check for security guards
  if (requireVerification && user?.role === 'security_guard' && !user?.isVerified) {
    const fallbackContent = customFallback || (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <AlertTriangle size={48} color="#f59e0b" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Account Verification Required
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Your security guard account needs verification to access this area.
        </Text>
        <Button
          onPress={() => router.replace('/welcome')}
          variant="primary"
          className="mt-6"
        >
          Contact Administrator
        </Button>
      </View>
    );
    
    return (
      <View ref={ref} style={{ flex: 1 }}>
        {fallbackContent}
      </View>
    );
  }

  return (
    <RoleGuard allowedRoles={['security_guard']} fallbackRoute="/welcome" customFallback={customFallback}>
      {children}
    </RoleGuard>
  );
});

// Assign displayName to forwardRef components for React DevTools
try {
  RequireSecurityGuard.displayName = 'RequireSecurityGuard';
  RoleGuard.displayName = 'RoleGuard';
  RequireSuperAdmin.displayName = 'RequireSuperAdmin';
  RequireManager.displayName = 'RequireManager';  
  RequireAdmin.displayName = 'RequireAdmin';
  RequireStaff.displayName = 'RequireStaff';
} catch (error) {
  console.warn('Component displayName assignment error:', error);
}

/**
 * Permission-based visibility component
 */
interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const PermissionGate = React.forwardRef<View, PermissionGateProps>(({
  children,
  allowedRoles,
  fallback = null,
}, ref) => {
  const { user } = useDirectAuth();

  // Safety check for children
  if (!children && !fallback) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return fallback ? (
      <View ref={ref} style={{ flex: 1 }}>
        {fallback}
      </View>
    ) : null;
  }

  return (
    <View ref={ref} style={{ flex: 1 }}>
      {children}
    </View>
  );
});

/**
 * Security-specific permission gate
 */
interface SecurityPermissionGateProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const SecurityPermissionGate = React.forwardRef<View, SecurityPermissionGateProps>(({
  children,
  requiredPermissions = [],
  fallback = null,
}, ref) => {
  const { user } = useDirectAuth();

  // Safety check for children
  if (!children && !fallback) {
    return null;
  }

  // Only allow security guards
  if (!user || user.role !== 'security_guard') {
    return fallback ? (
      <View ref={ref} style={{ flex: 1 }}>
        {fallback}
      </View>
    ) : null;
  }

  // For now, security guards have all permissions
  // In future, implement actual permission checking
  return (
    <View ref={ref} style={{ flex: 1 }}>
      {children}
    </View>
  );
});

try {
  PermissionGate.displayName = 'PermissionGate';
  SecurityPermissionGate.displayName = 'SecurityPermissionGate';
} catch (error) {
  console.warn('Permission component displayName assignment error:', error);
}

/**
 * Role-based navigation helper
 */
export const useRoleNavigation = () => {
  const { user } = useDirectAuth();
  const router = useRouter();

  // Memoize the default route calculation to prevent excessive recalculation
  const getDefaultRoute = React.useCallback((): string => {
    if (!user || !user.role) return '/welcome';
    
    switch (user.role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'community_manager':
        return '/manager/dashboard';
      case 'security_guard':
        return '/security/dashboard';
      case 'society_admin':
      case 'resident':
        return '/(tabs)/';
      default:
        return '/welcome';
    }
  }, [user]);

  // Memoize navigation function to prevent unnecessary recreations
  const navigateToRole = React.useCallback((role?: UserRole) => {
    const targetRole = role || (user?.role as UserRole);
    
    if (!targetRole) {
      router.replace('/welcome');
      return;
    }
    
    switch (targetRole) {
      case 'super_admin':
        router.replace('/admin/dashboard');
        break;
      case 'community_manager':
        router.replace('/manager/dashboard');
        break;
      case 'security_guard':
        router.replace('/security/dashboard');
        break;
      case 'society_admin':
      case 'resident':
        router.replace('/(tabs)/');
        break;
      default:
        router.replace('/welcome');
    }
  }, [router, user?.role]);

  // Memoize canAccess function with proper dependencies
  const canAccess = React.useCallback((route: string): boolean => {
    if (!user || !user.role) return false;

    // Define route permissions
    const routePermissions: Record<string, UserRole[]> = {
      '/admin': ['super_admin'],
      '/manager': ['community_manager'],
      '/security': ['security_guard'],
      '/register': ['guest'], // Public registration
      '/(tabs)': ['super_admin', 'community_manager', 'society_admin', 'resident'],
    };

    // Check if user has permission for route
    for (const [routePrefix, roles] of Object.entries(routePermissions)) {
      if (route.startsWith(routePrefix)) {
        return roles.includes(user.role as UserRole);
      }
    }

    // Default to allowing access if route not explicitly restricted
    return true;
  }, [user]);

  // Memoize the return object to prevent unnecessary re-renders
  return React.useMemo(() => ({
    getDefaultRoute,
    navigateToRole,
    canAccess,
    currentRole: user?.role as UserRole,
  }), [getDefaultRoute, navigateToRole, canAccess, user?.role]);
};