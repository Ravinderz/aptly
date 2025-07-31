/**
 * Feature Flag System
 *
 * Provides a centralized way to control feature visibility and functionality
 * across the app. Supports remote configuration, local overrides, and
 * gradual rollouts.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature flag configuration interface
export interface FeatureFlags {
  // Analytics and Reporting
  analytics_dashboard: boolean;
  advanced_analytics: boolean;
  usage_metrics: boolean;
  performance_monitoring: boolean;

  // Governance and Voting
  governance_center: boolean;
  voting_system: boolean;
  emergency_management: boolean;
  policy_management: boolean;

  // Community Features
  community_posts: boolean;
  community_mentions: boolean;
  community_reactions: boolean;
  community_polls: boolean;

  // Billing and Payments
  online_payments: boolean;
  auto_pay: boolean;
  payment_analytics: boolean;
  bill_reminders: boolean;
  multi_payment_gateways: boolean;

  // Maintenance and Services
  maintenance_tracking: boolean;
  vendor_management: boolean;
  service_requests: boolean;
  common_area_booking: boolean;

  // Visitor Management
  visitor_pre_approval: boolean;
  visitor_qr_codes: boolean;
  visitor_notifications: boolean;
  visitor_analytics: boolean;

  // Admin Features
  admin_dashboard: boolean;
  multi_society_management: boolean;
  role_based_access: boolean;
  audit_logging: boolean;

  // Notifications
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  in_app_notifications: boolean;

  // Advanced Features
  biometric_auth: boolean;
  offline_mode: boolean;
  data_sync: boolean;
  backup_restore: boolean;

  // Experimental Features
  ai_suggestions: boolean;
  predictive_analytics: boolean;
  smart_reminders: boolean;
  voice_commands: boolean;

  // Regional Features
  gst_compliance: boolean;
  indian_payment_methods: boolean;
  local_language_support: boolean;
  regional_holidays: boolean;
}

// Default feature flag configuration
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Analytics and Reporting
  analytics_dashboard: true,
  advanced_analytics: false,
  usage_metrics: true,
  performance_monitoring: false,

  // Governance and Voting
  governance_center: true,
  voting_system: true,
  emergency_management: false,
  policy_management: false,

  // Community Features
  community_posts: true,
  community_mentions: true,
  community_reactions: false,
  community_polls: false,

  // Billing and Payments
  online_payments: true,
  auto_pay: true,
  payment_analytics: true,
  bill_reminders: true,
  multi_payment_gateways: false,

  // Maintenance and Services
  maintenance_tracking: true,
  vendor_management: true,
  service_requests: true,
  common_area_booking: false,

  // Visitor Management
  visitor_pre_approval: true,
  visitor_qr_codes: true,
  visitor_notifications: true,
  visitor_analytics: false,

  // Admin Features
  admin_dashboard: true,
  multi_society_management: false,
  role_based_access: true,
  audit_logging: false,

  // Notifications
  push_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  in_app_notifications: true,

  // Advanced Features
  biometric_auth: true,
  offline_mode: false,
  data_sync: true,
  backup_restore: false,

  // Experimental Features
  ai_suggestions: false,
  predictive_analytics: false,
  smart_reminders: false,
  voice_commands: false,

  // Regional Features
  gst_compliance: true,
  indian_payment_methods: true,
  local_language_support: false,
  regional_holidays: true,
};

// Environment-specific overrides
const ENVIRONMENT_OVERRIDES = {
  development: {
    advanced_analytics: true,
    performance_monitoring: true,
    experimental_features: true,
  },
  staging: {
    emergency_management: true,
    policy_management: true,
    multi_payment_gateways: true,
  },
  production: {
    // Production uses default values
  },
};

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
  enableFeature: (feature: keyof FeatureFlags) => Promise<void>;
  disableFeature: (feature: keyof FeatureFlags) => Promise<void>;
  updateFlags: (newFlags: Partial<FeatureFlags>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  getFeatureGroup: (group: FeatureGroup) => Partial<FeatureFlags>;
  isLoading: boolean;
}

// Feature groups for easier management
export type FeatureGroup =
  | 'analytics'
  | 'governance'
  | 'community'
  | 'billing'
  | 'maintenance'
  | 'visitor'
  | 'admin'
  | 'notifications'
  | 'advanced'
  | 'experimental'
  | 'regional';

const FEATURE_GROUPS: Record<FeatureGroup, (keyof FeatureFlags)[]> = {
  analytics: [
    'analytics_dashboard',
    'advanced_analytics',
    'usage_metrics',
    'performance_monitoring',
  ],
  governance: [
    'governance_center',
    'voting_system',
    'emergency_management',
    'policy_management',
  ],
  community: [
    'community_posts',
    'community_mentions',
    'community_reactions',
    'community_polls',
  ],
  billing: [
    'online_payments',
    'auto_pay',
    'payment_analytics',
    'bill_reminders',
    'multi_payment_gateways',
  ],
  maintenance: [
    'maintenance_tracking',
    'vendor_management',
    'service_requests',
    'common_area_booking',
  ],
  visitor: [
    'visitor_pre_approval',
    'visitor_qr_codes',
    'visitor_notifications',
    'visitor_analytics',
  ],
  admin: [
    'admin_dashboard',
    'multi_society_management',
    'role_based_access',
    'audit_logging',
  ],
  notifications: [
    'push_notifications',
    'email_notifications',
    'sms_notifications',
    'in_app_notifications',
  ],
  advanced: ['biometric_auth', 'offline_mode', 'data_sync', 'backup_restore'],
  experimental: [
    'ai_suggestions',
    'predictive_analytics',
    'smart_reminders',
    'voice_commands',
  ],
  regional: [
    'gst_compliance',
    'indian_payment_methods',
    'local_language_support',
    'regional_holidays',
  ],
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(
  undefined,
);

const STORAGE_KEY = '@aptly_feature_flags';
const REMOTE_CONFIG_URL = 'https://api.aptly.app/v4/feature-flags';

interface FeatureFlagProviderProps {
  children: ReactNode;
  environment?: 'development' | 'staging' | 'production';
  userId?: string;
  societyId?: string;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  children,
  environment = 'production',
  userId,
  societyId,
}) => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load feature flags on initialization
  useEffect(() => {
    loadFeatureFlags();
  }, [environment, userId, societyId]);

  const loadFeatureFlags = async () => {
    try {
      setIsLoading(true);

      // 1. Start with default flags
      let loadedFlags = { ...DEFAULT_FEATURE_FLAGS };

      // 2. Apply environment overrides
      if (ENVIRONMENT_OVERRIDES[environment]) {
        loadedFlags = { ...loadedFlags, ...ENVIRONMENT_OVERRIDES[environment] };
      }

      // 3. Load locally stored flags
      const storedFlags = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFlags) {
        const parsedFlags = JSON.parse(storedFlags);
        loadedFlags = { ...loadedFlags, ...parsedFlags };
      }

      // 4. Fetch remote configuration (if available)
      try {
        const remoteFlags = await fetchRemoteFlags(userId, societyId);
        if (remoteFlags) {
          loadedFlags = { ...loadedFlags, ...remoteFlags };
        }
      } catch (error) {
        console.log('Remote feature flags not available:', error);
      }

      setFlags(loadedFlags);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      setFlags(DEFAULT_FEATURE_FLAGS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRemoteFlags = async (
    userId?: string,
    societyId?: string,
  ): Promise<Partial<FeatureFlags> | null> => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (societyId) params.append('societyId', societyId);
      params.append('environment', environment);

      const response = await fetch(`${REMOTE_CONFIG_URL}?${params.toString()}`);
      if (response.ok) {
        const remoteFlags = await response.json();
        return remoteFlags;
      }
    } catch (error) {
      // Remote config is optional - fail silently
    }
    return null;
  };

  const saveFlags = async (newFlags: FeatureFlags) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
      setFlags(newFlags);
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  };

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    return flags[feature] === true;
  };

  const enableFeature = async (feature: keyof FeatureFlags) => {
    const newFlags = { ...flags, [feature]: true };
    await saveFlags(newFlags);
  };

  const disableFeature = async (feature: keyof FeatureFlags) => {
    const newFlags = { ...flags, [feature]: false };
    await saveFlags(newFlags);
  };

  const updateFlags = async (newFlags: Partial<FeatureFlags>) => {
    const updatedFlags = { ...flags, ...newFlags };
    await saveFlags(updatedFlags);
  };

  const resetToDefaults = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setFlags(DEFAULT_FEATURE_FLAGS);
  };

  const getFeatureGroup = (group: FeatureGroup): Partial<FeatureFlags> => {
    const groupKeys = FEATURE_GROUPS[group];
    const groupFlags: Partial<FeatureFlags> = {};

    groupKeys.forEach((key) => {
      groupFlags[key] = flags[key];
    });

    return groupFlags;
  };

  const value: FeatureFlagContextType = {
    flags,
    isFeatureEnabled,
    enableFeature,
    disableFeature,
    updateFlags,
    resetToDefaults,
    getFeatureGroup,
    isLoading,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Hook to use feature flags
export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error(
      'useFeatureFlags must be used within a FeatureFlagProvider',
    );
  }
  return context;
};

// Convenience hook to check a single feature
export const useFeature = (feature: keyof FeatureFlags): boolean => {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(feature);
};

// HOC to conditionally render components based on feature flags
interface WithFeatureFlagProps {
  feature: keyof FeatureFlags;
  fallback?: ReactNode;
  children: ReactNode;
}

export const WithFeatureFlag: React.FC<WithFeatureFlagProps> = ({
  feature,
  fallback = null,
  children,
}) => {
  const isEnabled = useFeature(feature);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Component to render feature flag status (for debugging)
export const FeatureFlagDebugger: React.FC = () => {
  const { flags, isLoading } = useFeatureFlags();

  if (isLoading) {
    return null;
  }

  if (__DEV__) {
    console.log('Current Feature Flags:', flags);
  }

  return null;
};
