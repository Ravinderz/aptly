/**
 * Feature Flag Utilities
 *
 * Provides utility functions and configurations for feature flag management
 */

import { FeatureFlags, FeatureGroup } from '@/contexts/FeatureFlagContext';

// Feature flag metadata for better management
export interface FeatureFlagMetadata {
  name: string;
  description: string;
  group: FeatureGroup;
  requiredPermissions?: string[];
  dependencies?: (keyof FeatureFlags)[];
  rolloutPercentage?: number;
  environments?: ('development' | 'staging' | 'production')[];
}

// Complete feature flag metadata
export const FEATURE_FLAG_METADATA: Record<
  keyof FeatureFlags,
  FeatureFlagMetadata
> = {
  // Analytics and Reporting
  analytics_dashboard: {
    name: 'Analytics Dashboard',
    description: 'Main analytics dashboard with basic metrics',
    group: 'analytics',
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Advanced analytics with detailed insights and predictions',
    group: 'analytics',
    dependencies: ['analytics_dashboard'],
    environments: ['development', 'staging'],
  },
  usage_metrics: {
    name: 'Usage Metrics',
    description: 'Track user behavior and app usage patterns',
    group: 'analytics',
  },
  performance_monitoring: {
    name: 'Performance Monitoring',
    description: 'Real-time performance monitoring and crash reporting',
    group: 'analytics',
    environments: ['development', 'staging'],
  },

  // Governance and Voting
  governance_center: {
    name: 'Governance Center',
    description: 'Society governance and voting system',
    group: 'governance',
    requiredPermissions: ['governance.view'],
  },
  voting_system: {
    name: 'Voting System',
    description: 'Digital voting for society decisions',
    group: 'governance',
    requiredPermissions: ['voting.participate'],
    dependencies: ['governance_center'],
  },
  emergency_management: {
    name: 'Emergency Management',
    description: 'Emergency protocols and crisis management',
    group: 'governance',
    requiredPermissions: ['emergency.manage'],
    environments: ['staging', 'production'],
  },
  policy_management: {
    name: 'Policy Management',
    description: 'Society policy creation and management',
    group: 'governance',
    requiredPermissions: ['policy.manage'],
  },

  // Community Features
  community_posts: {
    name: 'Community Posts',
    description: 'Community bulletin board and announcements',
    group: 'community',
  },
  community_mentions: {
    name: 'Community Mentions',
    description: 'Mention other residents in posts and comments',
    group: 'community',
    dependencies: ['community_posts'],
  },
  community_reactions: {
    name: 'Community Reactions',
    description: 'Like, react, and interact with community content',
    group: 'community',
    dependencies: ['community_posts'],
    rolloutPercentage: 50,
  },
  community_polls: {
    name: 'Community Polls',
    description: 'Create and participate in community polls',
    group: 'community',
    dependencies: ['community_posts'],
  },

  // Billing and Payments
  online_payments: {
    name: 'Online Payments',
    description: 'Digital payment processing for bills',
    group: 'billing',
  },
  auto_pay: {
    name: 'Auto Pay',
    description: 'Automatic bill payment system',
    group: 'billing',
    dependencies: ['online_payments'],
  },
  payment_analytics: {
    name: 'Payment Analytics',
    description: 'Payment history and spending analytics',
    group: 'billing',
    dependencies: ['online_payments', 'analytics_dashboard'],
  },
  bill_reminders: {
    name: 'Bill Reminders',
    description: 'Automated bill payment reminders',
    group: 'billing',
  },
  multi_payment_gateways: {
    name: 'Multiple Payment Gateways',
    description: 'Support for multiple payment providers',
    group: 'billing',
    dependencies: ['online_payments'],
    environments: ['staging', 'production'],
  },

  // Maintenance and Services
  maintenance_tracking: {
    name: 'Maintenance Tracking',
    description: 'Track maintenance requests and work orders',
    group: 'maintenance',
  },
  vendor_management: {
    name: 'Vendor Management',
    description: 'Manage service providers and vendors',
    group: 'maintenance',
    requiredPermissions: ['vendor.manage'],
  },
  service_requests: {
    name: 'Service Requests',
    description: 'Submit and track service requests',
    group: 'maintenance',
  },
  common_area_booking: {
    name: 'Common Area Booking',
    description: 'Book common areas and amenities',
    group: 'maintenance',
    rolloutPercentage: 30,
  },

  // Visitor Management
  visitor_pre_approval: {
    name: 'Visitor Pre-approval',
    description: 'Pre-approve visitors and generate access codes',
    group: 'visitor',
  },
  visitor_qr_codes: {
    name: 'Visitor QR Codes',
    description: 'QR code generation for visitor access',
    group: 'visitor',
    dependencies: ['visitor_pre_approval'],
  },
  visitor_notifications: {
    name: 'Visitor Notifications',
    description: 'Real-time visitor arrival notifications',
    group: 'visitor',
    dependencies: ['visitor_pre_approval'],
  },
  visitor_analytics: {
    name: 'Visitor Analytics',
    description: 'Visitor patterns and security analytics',
    group: 'visitor',
    dependencies: ['visitor_pre_approval', 'analytics_dashboard'],
  },

  // Admin Features
  admin_dashboard: {
    name: 'Admin Dashboard',
    description: 'Administrative dashboard and controls',
    group: 'admin',
    requiredPermissions: ['admin.access'],
  },
  multi_society_management: {
    name: 'Multi-Society Management',
    description: 'Manage multiple societies from single account',
    group: 'admin',
    requiredPermissions: ['admin.multi_society'],
    dependencies: ['admin_dashboard'],
  },
  role_based_access: {
    name: 'Role-Based Access Control',
    description: 'Granular permission system',
    group: 'admin',
    requiredPermissions: ['admin.access'],
  },
  audit_logging: {
    name: 'Audit Logging',
    description: 'Comprehensive audit trail and logging',
    group: 'admin',
    requiredPermissions: ['admin.audit'],
    dependencies: ['admin_dashboard'],
  },

  // Notifications
  push_notifications: {
    name: 'Push Notifications',
    description: 'Mobile push notifications',
    group: 'notifications',
  },
  email_notifications: {
    name: 'Email Notifications',
    description: 'Email notification system',
    group: 'notifications',
  },
  sms_notifications: {
    name: 'SMS Notifications',
    description: 'SMS notification system',
    group: 'notifications',
    rolloutPercentage: 25,
  },
  in_app_notifications: {
    name: 'In-App Notifications',
    description: 'In-app notification center',
    group: 'notifications',
  },

  // Advanced Features
  biometric_auth: {
    name: 'Biometric Authentication',
    description: 'Fingerprint and face ID authentication',
    group: 'advanced',
  },
  offline_mode: {
    name: 'Offline Mode',
    description: 'Limited functionality when offline',
    group: 'advanced',
    environments: ['development', 'staging'],
  },
  data_sync: {
    name: 'Data Synchronization',
    description: 'Background data sync and conflict resolution',
    group: 'advanced',
  },
  backup_restore: {
    name: 'Backup & Restore',
    description: 'Data backup and restore functionality',
    group: 'advanced',
    requiredPermissions: ['data.backup'],
  },

  // Experimental Features
  ai_suggestions: {
    name: 'AI Suggestions',
    description: 'AI-powered suggestions and recommendations',
    group: 'experimental',
    environments: ['development'],
    rolloutPercentage: 10,
  },
  predictive_analytics: {
    name: 'Predictive Analytics',
    description: 'ML-based predictive insights',
    group: 'experimental',
    dependencies: ['advanced_analytics'],
    environments: ['development'],
  },
  smart_reminders: {
    name: 'Smart Reminders',
    description: 'Intelligent reminder system',
    group: 'experimental',
    rolloutPercentage: 20,
  },
  voice_commands: {
    name: 'Voice Commands',
    description: 'Voice-controlled app interactions',
    group: 'experimental',
    environments: ['development'],
  },

  // Regional Features
  gst_compliance: {
    name: 'GST Compliance',
    description: 'Indian GST tax compliance features',
    group: 'regional',
  },
  indian_payment_methods: {
    name: 'Indian Payment Methods',
    description: 'UPI, NEFT, and other Indian payment options',
    group: 'regional',
    dependencies: ['online_payments'],
  },
  local_language_support: {
    name: 'Local Language Support',
    description: 'Hindi and regional language support',
    group: 'regional',
    rolloutPercentage: 40,
  },
  regional_holidays: {
    name: 'Regional Holidays',
    description: 'Indian festival and holiday calendar',
    group: 'regional',
  },

  // Migration Feature Flags for Zustand Migration
  USE_AUTH_STORE: {
    name: 'Use Auth Store',
    description: 'Enable Zustand AuthStore instead of AuthContext',
    group: 'migration',
    environments: ['development', 'staging'],
    rolloutPercentage: 0,
  },
  USE_SOCIETY_STORE: {
    name: 'Use Society Store',
    description: 'Enable Zustand SocietyStore instead of SocietyContext',
    group: 'migration',
    environments: ['development', 'staging'],
    rolloutPercentage: 0,
  },
  USE_ADMIN_STORE: {
    name: 'Use Admin Store',
    description: 'Enable Zustand AdminStore instead of AdminContext',
    group: 'migration',
    environments: ['development', 'staging'],
    rolloutPercentage: 0,
  },
  USE_THEME_STORE: {
    name: 'Use Theme Store',
    description: 'Enable Zustand ThemeStore instead of ThemeContext',
    group: 'migration',
    environments: ['development', 'staging'],
    rolloutPercentage: 0,
  },
  USE_NOTIFICATION_STORE: {
    name: 'Use Notification Store',
    description: 'Enable Zustand NotificationStore instead of NotificationContext',
    group: 'migration',
    environments: ['development', 'staging'],
    rolloutPercentage: 0,
  },
  USE_FEATURE_FLAG_STORE: {
    name: 'Use Feature Flag Store',
    description: 'Enable Zustand FeatureFlagStore instead of FeatureFlagContext',
    group: 'migration',
    environments: ['development', 'staging'],
    rolloutPercentage: 0,
  },
};

/**
 * Check if a feature flag has all its dependencies enabled
 */
export const areFeatureDependenciesMet = (
  feature: keyof FeatureFlags,
  currentFlags: FeatureFlags,
): boolean => {
  const metadata = FEATURE_FLAG_METADATA[feature];
  if (!metadata.dependencies) return true;

  return metadata.dependencies.every((dep) => currentFlags[dep]);
};

/**
 * Check if user has required permissions for a feature
 */
export const hasRequiredPermissions = (
  feature: keyof FeatureFlags,
  userPermissions: string[] = [],
): boolean => {
  const metadata = FEATURE_FLAG_METADATA[feature];
  if (!metadata.requiredPermissions) return true;

  return metadata.requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

/**
 * Check if feature is enabled for current environment
 */
export const isFeatureEnabledForEnvironment = (
  feature: keyof FeatureFlags,
  environment: 'development' | 'staging' | 'production',
): boolean => {
  const metadata = FEATURE_FLAG_METADATA[feature];
  if (!metadata.environments) return true;

  return metadata.environments.includes(environment);
};

/**
 * Get all features for a specific group
 */
export const getFeaturesByGroup = (
  group: FeatureGroup,
): (keyof FeatureFlags)[] => {
  return Object.keys(FEATURE_FLAG_METADATA).filter(
    (key) => FEATURE_FLAG_METADATA[key as keyof FeatureFlags].group === group,
  ) as (keyof FeatureFlags)[];
};

/**
 * Feature flag presets for different user types
 */
export const FEATURE_FLAG_PRESETS = {
  resident: {
    // Basic resident features
    analytics_dashboard: false,
    governance_center: true,
    voting_system: true,
    community_posts: true,
    community_mentions: true,
    online_payments: true,
    auto_pay: true,
    maintenance_tracking: true,
    service_requests: true,
    visitor_pre_approval: true,
    visitor_qr_codes: true,
    visitor_notifications: true,
    push_notifications: true,
    email_notifications: true,
    in_app_notifications: true,
    biometric_auth: true,
    data_sync: true,
    gst_compliance: true,
    indian_payment_methods: true,
    regional_holidays: true,
  },

  admin: {
    // All admin features enabled
    analytics_dashboard: true,
    advanced_analytics: true,
    governance_center: true,
    voting_system: true,
    emergency_management: true,
    policy_management: true,
    community_posts: true,
    community_mentions: true,
    online_payments: true,
    auto_pay: true,
    payment_analytics: true,
    maintenance_tracking: true,
    vendor_management: true,
    service_requests: true,
    visitor_pre_approval: true,
    visitor_qr_codes: true,
    visitor_notifications: true,
    visitor_analytics: true,
    admin_dashboard: true,
    role_based_access: true,
    audit_logging: true,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: true,
    in_app_notifications: true,
    biometric_auth: true,
    data_sync: true,
    backup_restore: true,
    gst_compliance: true,
    indian_payment_methods: true,
    regional_holidays: true,
  },

  developer: {
    // All features enabled for development
    analytics_dashboard: true,
    advanced_analytics: true,
    usage_metrics: true,
    performance_monitoring: true,
    governance_center: true,
    voting_system: true,
    emergency_management: true,
    policy_management: true,
    community_posts: true,
    community_mentions: true,
    community_reactions: true,
    community_polls: true,
    online_payments: true,
    auto_pay: true,
    payment_analytics: true,
    bill_reminders: true,
    multi_payment_gateways: true,
    maintenance_tracking: true,
    vendor_management: true,
    service_requests: true,
    common_area_booking: true,
    visitor_pre_approval: true,
    visitor_qr_codes: true,
    visitor_notifications: true,
    visitor_analytics: true,
    admin_dashboard: true,
    multi_society_management: true,
    role_based_access: true,
    audit_logging: true,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: true,
    in_app_notifications: true,
    biometric_auth: true,
    offline_mode: true,
    data_sync: true,
    backup_restore: true,
    ai_suggestions: true,
    predictive_analytics: true,
    smart_reminders: true,
    voice_commands: true,
    gst_compliance: true,
    indian_payment_methods: true,
    local_language_support: true,
    regional_holidays: true,
    
    // Migration flags for development (start disabled for safety)
    USE_AUTH_STORE: false,
    USE_SOCIETY_STORE: false,
    USE_ADMIN_STORE: false,
    USE_THEME_STORE: false,
    USE_NOTIFICATION_STORE: false,
    USE_FEATURE_FLAG_STORE: false,
  },
};

/**
 * Apply a feature flag preset
 */
export const applyFeatureFlagPreset = (
  preset: keyof typeof FEATURE_FLAG_PRESETS,
): Partial<FeatureFlags> => {
  return FEATURE_FLAG_PRESETS[preset];
};
