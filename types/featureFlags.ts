// Feature flag types - extracted to avoid circular dependencies

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

  // Migration Feature Flags for Zustand Migration
  USE_AUTH_STORE: boolean;
  USE_SOCIETY_STORE: boolean;
  USE_ADMIN_STORE: boolean;
  USE_THEME_STORE: boolean;
  USE_NOTIFICATION_STORE: boolean;
  USE_FEATURE_FLAG_STORE: boolean;
}

// Feature groups for bulk operations
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
  | 'regional'
  | 'migration';

// Default feature flag configuration
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Analytics and Reporting
  analytics_dashboard: true,
  advanced_analytics: false,
  usage_metrics: true,
  performance_monitoring: false,

  // Governance and Voting
  governance_center: false,
  voting_system: false,
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

  // Migration Feature Flags for Zustand Migration (start disabled)
  USE_AUTH_STORE: false,
  USE_SOCIETY_STORE: false,
  USE_ADMIN_STORE: false,
  USE_THEME_STORE: false,
  USE_NOTIFICATION_STORE: false,
  USE_FEATURE_FLAG_STORE: false,
};