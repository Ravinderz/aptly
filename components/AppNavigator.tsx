import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

const AppNavigator: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  // Stable navigation handler to prevent infinite loops
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
      const onWelcomePage = segments[0] === 'welcome';
      const onIndexPage = segments.length === 0 || segments[0] === 'index';

      let shouldNavigate = false;
      let targetRoute = '';

      // Determine navigation target
      if (isFirstLaunch && !onIndexPage) {
        shouldNavigate = true;
        targetRoute = '/';
      } else if (!isFirstLaunch && !isAuthenticated && !inAuthGroup && !onWelcomePage) {
        shouldNavigate = true;
        targetRoute = '/welcome';
      } else if (isAuthenticated && (inAuthGroup || onWelcomePage || onIndexPage)) {
        shouldNavigate = true;
        targetRoute = '/(tabs)';
      } else if (!isFirstLaunch && !isAuthenticated && onIndexPage) {
        shouldNavigate = true;
        targetRoute = '/welcome';
      }

      // Perform navigation if needed
      if (shouldNavigate && targetRoute) {
        setHasNavigated(true);
        router.replace(targetRoute);
        
        // Reset navigation flag after a delay to allow for future navigation if needed
        setTimeout(() => setHasNavigated(false), 2000);
      }
    }, 100);
  }, [
    hasNavigated,
    isCheckingFirstLaunch,
    isLoading,
    isFirstLaunch,
    isAuthenticated,
    segments,
    router,
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <>{children}</>;
};

// Add proper named export with displayName for React DevTools
AppNavigator.displayName = 'AppNavigator';

export default AppNavigator;
