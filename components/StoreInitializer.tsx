import React, { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useFeatureFlagStore } from '@/stores/slices/featureFlagStore';
import { useAuthStore } from '@/stores/slices/authStore';
import { useThemeStore } from '@/stores/slices/themeStore';
import { useSocietyStore } from '@/stores/slices/societyStore';
import { useSocietyOnboardingStore } from '@/stores/slices/societyOnboardingStore';
import { initializeStorage, StorageRecovery } from '@/stores/utils/storageManager';
import { storeMonitor, startStoreMonitoring } from '@/stores/utils/storeMonitor';
import { useAggregatedLoading, useAggregatedErrors } from '@/stores/utils/storeHooks';

interface StoreInitializerProps {
  children: React.ReactNode;
  environment?: 'development' | 'staging' | 'production';
}

/**
 * StoreInitializer - Handles initialization of all Zustand stores
 * This replaces the old Context providers and ensures stores are ready before app starts
 */
export const StoreInitializer = ({
  children,
  environment = 'development',
}: StoreInitializerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Get store actions with cached selectors to prevent getSnapshot infinite loops
  const featureFlagActions = useMemo(
    () => ({
      refreshFlags: useFeatureFlagStore.getState().refreshFlags,
      setEnvironment: useFeatureFlagStore.getState().setEnvironment,
      enableMigrationFlags: useFeatureFlagStore.getState().enableMigrationFlags,
    }),
    []
  );

  const authActions = useMemo(
    () => ({
      checkAuthStatus: useAuthStore.getState().checkAuthStatus,
    }),
    []
  );

  // Subscribe to store changes with stable selectors
  const featureFlagLoading = useFeatureFlagStore((state) => state.loading);
  const authLoading = useAuthStore((state) => state.loading);
  const featureFlagError = useFeatureFlagStore((state) => state.error);
  const authError = useAuthStore((state) => state.error);
  
  // Use aggregated state helpers
  const isAnyLoading = useAggregatedLoading(featureFlagLoading, authLoading);
  const allErrors = useAggregatedErrors(featureFlagError, authError);

  useEffect(() => {
    const initializeStores = async () => {
      try {
        console.log('🚀 Starting store initialization...');

        // 0. Register stores for monitoring
        storeMonitor.registerStore('featureFlags', useFeatureFlagStore);
        storeMonitor.registerStore('auth', useAuthStore);
        storeMonitor.registerStore('theme', useThemeStore);
        storeMonitor.registerStore('society', useSocietyStore);
        storeMonitor.registerStore('societyOnboarding', useSocietyOnboardingStore);

        // 1. Initialize storage first  
        console.log('🔄 Initializing AsyncStorage...');
        const storageReady = await initializeStorage();
        if (!storageReady) {
          console.warn('⚠️ AsyncStorage not available, stores will run in memory-only mode');
        }

        // Wait for any ongoing persistence operations to complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Start monitoring if in development
        if (environment === 'development') {
          startStoreMonitoring(60000); // Check every minute in dev
        }

        // 1. Set environment and initialize feature flags first
        console.log('📋 Setting environment:', environment);
        try {
          featureFlagActions.setEnvironment(environment);
        } catch (error) {
          console.warn('⚠️ Failed to set environment, using defaults:', error);
        }
        
        console.log('🔄 Refreshing feature flags...');
        try {
          await featureFlagActions.refreshFlags();
          console.log('✅ Feature flags refreshed successfully');
        } catch (flagError) {
          console.warn('⚠️ Feature flag refresh failed, using defaults:', flagError);
        }

        // 2. Enable all migration flags for development testing
        if (environment === 'development') {
          console.log('🧪 Enabling migration flags for development...');
          try {
            await featureFlagActions.enableMigrationFlags([
              'USE_AUTH_STORE',
              'USE_SOCIETY_STORE',
              'USE_ADMIN_STORE',
              'USE_THEME_STORE',
              'USE_NOTIFICATION_STORE',
              'USE_FEATURE_FLAG_STORE',
            ]);
            console.log('✅ Migration flags enabled');
          } catch (migrationError) {
            console.warn('⚠️ Migration flag enabling failed, continuing:', migrationError);
          }
        }

        // 3. Initialize auth store (with robust error handling)
        console.log('🔐 Initializing auth store...');
        try {
          await authActions.checkAuthStatus();
          console.log('✅ Auth store initialized');
        } catch (authError) {
          console.warn('⚠️ Auth initialization failed, app will work with guest mode:', authError);
        }

        // 4. Pre-initialize society onboarding store to ensure storage is ready
        console.log('🏢 Pre-initializing society onboarding store...');
        try {
          // Access the store to trigger persistence initialization
          const onboardingStore = useSocietyOnboardingStore.getState();
          // Trigger storage initialization by accessing the store
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('✅ Society onboarding store pre-initialized');
        } catch (onboardingError) {
          console.warn('⚠️ Society onboarding store pre-initialization failed:', onboardingError);
        }

        console.log('🎉 Store initialization completed');
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Critical store initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Store initialization failed';
        
        // For critical errors, try emergency fallback
        try {
          console.log('🚨 Attempting emergency fallback...');
          
          // Try storage recovery first
          await StorageRecovery.recoverFromCorruption('feature-flags-storage');
          await StorageRecovery.recoverFromCorruption('auth-storage');
          await StorageRecovery.recoverFromCorruption('society-onboarding-storage');
          
          // Reset stores to initial state
          useFeatureFlagStore.getState().reset();
          useAuthStore.getState().reset();
          useSocietyOnboardingStore.getState().reset();
          console.log('✅ Emergency fallback completed');
        } catch (fallbackError) {
          console.error('❌ Emergency fallback also failed:', fallbackError);
          
          // Last resort - emergency storage reset
          try {
            await StorageRecovery.emergencyReset();
            console.log('✅ Emergency storage reset completed');
          } catch (resetError) {
            console.error('❌ Even emergency reset failed:', resetError);
          }
        }
        
        setInitError(errorMessage);
        setIsInitialized(true); // Allow app to continue with fallback mode
      }
    };

    initializeStores();
  }, [environment]);

  // Show loading screen while stores are initializing
  if (!isInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 16, color: '#6b7280', textAlign: 'center' }}>
          {isAnyLoading ? 'Initializing stores...' : 'Starting up...'}
        </Text>
        {allErrors.length > 0 && (
          <Text style={{ marginTop: 8, color: '#f59e0b', fontSize: 12, textAlign: 'center' }}>
            Some features may be limited ({allErrors.length} issue{allErrors.length > 1 ? 's' : ''})
          </Text>
        )}
      </View>
    );
  }

  // Show error if initialization failed but still render children
  if (initError) {
    console.warn('⚠️ App running in fallback mode due to store initialization issues');
    // Don't block the UI, just log the warning and continue
  }

  return <>{children}</>;
};

// Add proper named export with displayName for React DevTools
StoreInitializer.displayName = 'StoreInitializer';

export default StoreInitializer;