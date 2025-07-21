import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';

const AppNavigator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isCheckingFirstLaunch, setIsCheckingFirstLaunch] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Check if this is the first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
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
    };

    checkFirstLaunch();
  }, []);

  // Handle navigation based on auth status and first launch
  useEffect(() => {
    if (isCheckingFirstLaunch || isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const onWelcomePage = segments[0] === 'welcome';
    const onIndexPage = segments.length === 0 || segments[0] === 'index';

    // If first launch and not on index (onboarding), navigate to onboarding
    if (isFirstLaunch && !onIndexPage) {
      router.replace('/');
      return;
    }

    // If not first launch and not authenticated
    if (!isFirstLaunch && !isAuthenticated) {
      if (!inAuthGroup && !onWelcomePage) {
        router.replace('/welcome');
      }
      return;
    }

    // If authenticated and in auth group or welcome, navigate to tabs
    if (isAuthenticated && (inAuthGroup || onWelcomePage || onIndexPage)) {
      router.replace('/(tabs)');
      return;
    }

    // If not first launch, not authenticated, and on index page, go to welcome
    if (!isFirstLaunch && !isAuthenticated && onIndexPage) {
      router.replace('/welcome');
      return;
    }
  }, [isAuthenticated, isLoading, isFirstLaunch, isCheckingFirstLaunch, segments]);

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

export default AppNavigator;