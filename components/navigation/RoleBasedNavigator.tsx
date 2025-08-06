import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useRoleNavigation } from '@/components/auth/RoleGuard';

/**
 * RoleBasedNavigator - Automatically routes users to appropriate dashboards based on their role
 * 
 * Features:
 * - Automatic role-based routing on authentication
 * - Prevents access to unauthorized routes
 * - Smooth transitions between role contexts
 * - Handles authentication state changes
 */
export const RoleBasedNavigator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useDirectAuth();
  const router = useRouter();
  const segments = useSegments();
  const { getDefaultRoute, canAccess } = useRoleNavigation();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    const currentPath = `/${segments.join('/')}`;
    
    // If user is not authenticated, redirect to welcome/login
    if (!user) {
      if (currentPath !== '/welcome' && !currentPath.startsWith('/register')) {
        router.replace('/welcome');
      }
      return;
    }

    // User is authenticated - check if they can access current route
    if (!canAccess(currentPath)) {
      // Redirect to appropriate dashboard for their role
      const defaultRoute = getDefaultRoute();
      router.replace(defaultRoute);
      return;
    }

    // Handle initial login redirect - if user is on welcome/login, redirect to their dashboard
    if (currentPath === '/welcome' || currentPath === '/' || currentPath === '') {
      const defaultRoute = getDefaultRoute();
      router.replace(defaultRoute);
    }
  }, [user, isLoading, segments]);

  // Show loading while determining navigation
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="animate-spin">
          <Shield size={32} color="#6b7280" />
        </View>
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

/**
 * Hook for programmatic role-based navigation
 */
export const useRoleBasedNavigation = () => {
  const { user } = useDirectAuth();
  const router = useRouter();
  const { getDefaultRoute, canAccess } = useRoleNavigation();

  /**
   * Navigate to user's default dashboard
   */
  const navigateToHome = () => {
    const defaultRoute = getDefaultRoute();
    router.push(defaultRoute);
  };

  /**
   * Navigate to a specific route if user has access
   */
  const navigateWithPermissionCheck = (route: string) => {
    if (canAccess(route)) {
      router.push(route);
    } else {
      // Redirect to home if no access
      navigateToHome();
    }
  };

  /**
   * Get navigation options based on user role
   */
  const getNavigationOptions = () => {
    if (!user) return [];

    const baseOptions = [
      { label: 'Home', route: getDefaultRoute() },
    ];

    switch (user.role) {
      case 'super_admin':
        return [
          ...baseOptions,
          { label: 'Admin Dashboard', route: '/admin/dashboard' },
          { label: 'Society Onboarding', route: '/admin/onboarding' },
          { label: 'Manager Assignment', route: '/admin/managers' },
          { label: 'System Analytics', route: '/admin/analytics' },
          { label: 'All Societies', route: '/admin/societies' },
        ];

      case 'community_manager':
        return [
          ...baseOptions,
          { label: 'Manager Dashboard', route: '/manager/dashboard' },
          { label: 'My Societies', route: '/manager/societies' },
          { label: 'Support Queue', route: '/manager/support' },
          { label: 'Performance Reports', route: '/manager/reports' },
        ];

      case 'society_admin':
        return [
          ...baseOptions,
          { label: 'Society Dashboard', route: '/(tabs)/' },
          { label: 'Residents', route: '/(tabs)/community' },
          { label: 'Governance', route: '/(tabs)/services/governance' },
          { label: 'Maintenance', route: '/(tabs)/services/maintenance' },
          { label: 'Settings', route: '/(tabs)/settings' },
        ];

      case 'resident':
        return [
          ...baseOptions,
          { label: 'Dashboard', route: '/(tabs)/' },
          { label: 'Community', route: '/(tabs)/community' },
          { label: 'Services', route: '/(tabs)/services' },
          { label: 'Settings', route: '/(tabs)/settings' },
        ];

      default:
        return baseOptions;
    }
  };

  /**
   * Check if user should be redirected based on current context
   */
  const shouldRedirect = (currentRoute: string): string | null => {
    if (!user) return '/welcome';
    
    // If user is in wrong role context, redirect to their dashboard
    if (!canAccess(currentRoute)) {
      return getDefaultRoute();
    }

    return null;
  };

  return {
    navigateToHome,
    navigateWithPermissionCheck,
    getNavigationOptions,
    shouldRedirect,
    currentRole: user?.role,
    defaultRoute: getDefaultRoute(),
  };
};

/**
 * Route breadcrumb component that shows role-appropriate navigation context
 */
export const RoleBreadcrumb: React.FC = () => {
  const { user } = useDirectAuth();
  const segments = useSegments();

  if (!user) return null;

  const getBreadcrumbPath = () => {
    const path = segments.join(' > ');
    const rolePrefix = user.role === 'super_admin' ? 'Admin' : 
                      user.role === 'community_manager' ? 'Manager' : 
                      'User';
    
    return `${rolePrefix} > ${path || 'Dashboard'}`;
  };

  return (
    <View className="px-4 py-2 bg-gray-100">
      <Text className="text-xs text-gray-600 uppercase tracking-wide">
        {getBreadcrumbPath()}
      </Text>
    </View>
  );
};

/**
 * Role-based quick actions component
 */
export const RoleQuickActions: React.FC = () => {
  const { getNavigationOptions, navigateWithPermissionCheck } = useRoleBasedNavigation();
  const options = getNavigationOptions();

  if (options.length <= 1) return null;

  return (
    <View className="px-4 py-2">
      <Text className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.slice(1).map((option) => (
          <TouchableOpacity
            key={option.route}
            onPress={() => navigateWithPermissionCheck(option.route)}
            className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"
          >
            <Text className="text-sm text-blue-800 font-medium">
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};