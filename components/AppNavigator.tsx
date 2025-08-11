import { useDirectAuth } from '@/hooks/useDirectAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const AppNavigator = ({ children }: { children: React.ReactNode }) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isCheckingFirstLaunch, setIsCheckingFirstLaunch] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Use the hook only once to prevent multiple subscriptions
  const auth = useDirectAuth();
  const { isAuthenticated, isLoading } = auth;

  const router = useRouter();
  const segments = useSegments();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize first launch check to prevent re-runs
  const checkFirstLaunch = useCallback(async () => {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');

      if (hasLaunchedBefore === null) {
        // First launch
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      } else {
        // Not first launch
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    } finally {
      setIsCheckingFirstLaunch(false);
    }
  }, []);

  // Check if this is the first launch (only run once)
  useEffect(() => {
    let isMounted = true;

    const runCheck = async () => {
      if (isMounted) {
        await checkFirstLaunch();
      }
    };

    runCheck();

    return () => {
      isMounted = false;
    };
  }, [checkFirstLaunch]);

  // Helper function to check if user is in correct section
  const isUserInCorrectSection = useCallback(() => {
    const user = auth.user;
    if (!user) return false;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const inSecurityGroup = segments[0] === 'security';
    const inAdminGroup = segments[0] === 'admin';
    const inManagerGroup = segments[0] === 'manager';

    switch (user.role) {
      case 'security_guard':
        return inSecurityGroup;
      case 'super_admin':
        return inAdminGroup || inTabsGroup;
      case 'community_manager':
        return inManagerGroup || inTabsGroup;
      case 'society_admin':
      case 'resident':
        return inTabsGroup;
      default:
        return false;
    }
  }, [auth.user, segments]);

  // Simplified navigation handler to prevent conflicts
  const handleNavigation = useCallback(() => {
    // Prevent multiple navigation attempts
    if (hasNavigated || isCheckingFirstLaunch || isLoading) return;

    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Use timeout to prevent rapid navigation calls
    navigationTimeoutRef.current = setTimeout(() => {
      // Hide splash screen when we're done loading
      SplashScreen.hideAsync().catch(console.error);

      const inAuthGroup = segments[0] === 'auth';
      const inTabsGroup = segments[0] === '(tabs)';
      const inSecurityGroup = segments[0] === 'security';
      const inAdminGroup = segments[0] === 'admin';
      const inManagerGroup = segments[0] === 'manager';
      const onWelcomePage = segments[0] === 'welcome';
      const onIndexPage = segments.length === 0 || segments[0] === 'index';

      let shouldNavigate = false;
      let targetRoute = '';

      // Simplified navigation logic to reduce conflicts
      if (isFirstLaunch && !onWelcomePage) {
        // First launch should go to welcome
        shouldNavigate = true;
        targetRoute = '/welcome';
      } else if (!isAuthenticated && !onWelcomePage && !inAuthGroup) {
        // Unauthenticated users go to welcome
        shouldNavigate = true;
        targetRoute = '/welcome';
      } else if (
        isAuthenticated &&
        (onWelcomePage || inAuthGroup || onIndexPage)
      ) {
        // Authenticated users get routed to their role-specific dashboard
        const user = auth.user;
        if (user?.role) {
          shouldNavigate = true;

          switch (user.role) {
            case 'security_guard':
              targetRoute = '/security/dashboard';
              break;
            case 'super_admin':
              targetRoute = '/admin/dashboard';
              break;
            case 'community_manager':
              targetRoute = '/manager/dashboard';
              break;
            case 'society_admin':
            case 'resident':
            default:
              targetRoute = '/(tabs)';
              break;
          }
        }
      }

      // Perform navigation if needed
      if (shouldNavigate && targetRoute) {
        console.log(
          `🧭 Navigating from [${segments.join('/')}] to [${targetRoute}]`,
        );
        setHasNavigated(true);
        router.replace(targetRoute);

        // Reset navigation flag after a delay
        setTimeout(() => setHasNavigated(false), 1000);
      }
    }, 150);
  }, [
    hasNavigated,
    isCheckingFirstLaunch,
    isLoading,
    isFirstLaunch,
    isAuthenticated,
    segments,
    router,
    auth.user,
  ]);

  // Handle navigation with debouncing
  useEffect(() => {
    handleNavigation();

    // Cleanup timeout on unmount
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [handleNavigation]);

  // Show loading spinner while checking auth or first launch
  if (isCheckingFirstLaunch || isLoading) {
    return (
      <>
        <Slot />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </>
    );
  }

  return <>{children}</>;
};

// Add proper named export with displayName for React DevTools
AppNavigator.displayName = 'AppNavigator';

export default AppNavigator;
