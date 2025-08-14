# Feature Flags System Documentation

## Overview

The Aptly app uses a comprehensive feature flag system to control the visibility and functionality of features across the application. This system supports remote configuration, gradual rollouts, local overrides, and A/B testing capabilities.

## 🚩 **Feature Flag Categories**

### **Migration Feature Flags** (Critical for Zustand Migration)

These flags control the transition from React Context API to Zustand stores:

| Flag | Purpose | Current Status | Impact |
|------|---------|---------------|---------|
| `USE_AUTH_STORE` | Enable AuthStore instead of AuthContext | ✅ **ENABLED** | Authentication, biometrics, session management |
| `USE_SOCIETY_STORE` | Enable SocietyStore instead of SocietyContext | ✅ **ENABLED** | Society data, multi-society management |
| `USE_ADMIN_STORE` | Enable AdminStore instead of AdminContext | ✅ **ENABLED** | Admin panel, role management, permissions |
| `USE_THEME_STORE` | Enable ThemeStore instead of ThemeContext | ✅ **ENABLED** | Theme switching, admin themes, dark mode |
| `USE_NOTIFICATION_STORE` | Enable NotificationStore instead of NotificationContext | ✅ **ENABLED** | Push notifications, notification settings |
| `USE_FEATURE_FLAG_STORE` | Enable FeatureFlagStore instead of FeatureFlagContext | ✅ **ENABLED** | Feature flag management itself |

### **Analytics and Reporting**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `analytics_dashboard` | Advanced analytics dashboard | ✅ **ON** | Society analytics, usage metrics, performance data |
| `advanced_analytics` | Advanced analytics features | ❌ **OFF** | Predictive analytics, trend analysis, custom reports |
| `usage_metrics` | Track user behavior metrics | ❌ **OFF** | User interaction tracking, feature usage statistics |
| `performance_monitoring` | App performance monitoring | ❌ **OFF** | Performance metrics, crash reporting, optimization data |

### **Governance and Voting**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `governance_center` | Governance management hub | ❌ **OFF** | Centralized governance dashboard, policy management |
| `voting_system` | Digital voting capabilities | ❌ **OFF** | Online voting, election management, ballot creation |
| `emergency_management` | Emergency response system | ❌ **OFF** | Emergency alerts, evacuation procedures, crisis management |
| `policy_management` | Society policy management | ❌ **OFF** | Policy creation, approval workflows, compliance tracking |

### **Community Features**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `community_posts` | Community bulletin board | ✅ **ON** | Resident posts, announcements, community discussions |
| `community_mentions` | @mention functionality | ❌ **OFF** | Tag residents in posts, notification mentions |
| `community_reactions` | Like/react to posts | ❌ **OFF** | Emoji reactions, like counts, engagement metrics |
| `community_polls` | Community polling | ❌ **OFF** | Create polls, vote on community matters, poll results |

### **Billing and Payments**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `online_payments` | Online payment gateway | ✅ **ON** | UPI, cards, net banking, digital payments |
| `auto_pay` | Automatic payment setup | ❌ **OFF** | Auto-debit, recurring payments, payment scheduling |
| `payment_analytics` | Payment tracking & analytics | ❌ **OFF** | Payment history, trends, defaulter tracking |
| `bill_reminders` | Automated bill reminders | ✅ **ON** | SMS, email, push notification reminders |
| `multi_payment_gateways` | Multiple payment options | ❌ **OFF** | Multiple gateway support, payment method choice |

### **Maintenance and Services**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `maintenance_tracking` | Maintenance request system | ✅ **ON** | Service requests, tracking, vendor management |
| `vendor_management` | Vendor/contractor management | ❌ **OFF** | Vendor database, ratings, contract management |
| `service_requests` | Service booking system | ✅ **ON** | Housekeeping, repairs, service scheduling |
| `common_area_booking` | Common area reservations | ✅ **ON** | Club house, gym, hall bookings |

### **Visitor Management**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `visitor_pre_approval` | Pre-approve visitors | ✅ **ON** | Visitor pre-registration, approval workflow |
| `visitor_qr_codes` | QR code for visitor entry | ✅ **ON** | QR code generation, scanning, digital passes |
| `visitor_notifications` | Visitor arrival notifications | ✅ **ON** | Push notifications for visitor arrivals |
| `visitor_analytics` | Visitor tracking analytics | ❌ **OFF** | Visitor patterns, frequency analysis, security reports |

### **Admin Features**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `admin_dashboard` | Admin management dashboard | ✅ **ON** | Society management, resident data, admin tools |
| `multi_society_management` | Manage multiple societies | ❌ **OFF** | Multi-society admin, cross-society features |
| `role_based_access` | Granular permission system | ✅ **ON** | Role-based permissions, access control |
| `audit_logging` | System audit trails | ❌ **OFF** | Activity logging, change tracking, audit reports |

### **Notifications**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `push_notifications` | Push notification system | ✅ **ON** | App push notifications, real-time alerts |
| `email_notifications` | Email notification system | ✅ **ON** | Email alerts, newsletters, formal communications |
| `sms_notifications` | SMS notification system | ❌ **OFF** | SMS alerts, OTP, emergency messages |
| `in_app_notifications` | In-app notification center | ✅ **ON** | Notification history, read/unread status |

### **Advanced Features**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `biometric_auth` | Biometric authentication | ✅ **ON** | Fingerprint, Face ID, biometric login |
| `offline_mode` | Offline functionality | ❌ **OFF** | Offline data access, sync when online |
| `data_sync` | Background data synchronization | ✅ **ON** | Auto-sync, data consistency, conflict resolution |
| `backup_restore` | Data backup & restore | ❌ **OFF** | Cloud backup, data export, restore functionality |

### **Experimental Features**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `ai_suggestions` | AI-powered suggestions | ❌ **OFF** | Smart recommendations, predictive features |
| `predictive_analytics` | Predictive data analysis | ❌ **OFF** | Future trend predictions, behavior analysis |
| `smart_reminders` | Intelligent reminder system | ❌ **OFF** | Context-aware reminders, smart notifications |
| `voice_commands` | Voice control features | ❌ **OFF** | Voice navigation, voice-to-text, commands |

### **Regional Features**

| Flag | Purpose | Default | Description |
|------|---------|---------|-------------|
| `gst_compliance` | GST tax compliance | ✅ **ON** | GST calculations, tax reporting, compliance |
| `indian_payment_methods` | India-specific payments | ✅ **ON** | UPI, IMPS, NEFT, Indian banking |
| `local_language_support` | Multi-language support | ❌ **OFF** | Hindi, regional languages, localization |
| `regional_holidays` | Regional holiday calendar | ✅ **ON** | Indian holidays, regional festivals, calendar |

## 🛠 **How to Use Feature Flags**

### **1. Basic Usage in Components**

```typescript
import { WithFeatureFlag } from '@/contexts/FeatureFlagContext';

// Show component only if feature is enabled
<WithFeatureFlag feature="community_posts">
  <CommunityPostComponent />
</WithFeatureFlag>

// Show fallback if feature is disabled
<WithFeatureFlag 
  feature="advanced_analytics" 
  fallback={<BasicAnalytics />}
>
  <AdvancedAnalytics />
</WithFeatureFlag>
```

### **2. Conditional Logic with Hooks**

```typescript
import { useFeatureFlagMigration } from '@/hooks/useFeatureFlagMigration';

const MyComponent = () => {
  const { isFeatureEnabled } = useFeatureFlagMigration();
  
  const handlePayment = () => {
    if (isFeatureEnabled('online_payments')) {
      // Show online payment options
      navigateToPaymentGateway();
    } else {
      // Show offline payment instructions
      showOfflinePaymentInfo();
    }
  };
  
  return (
    <View>
      {isFeatureEnabled('bill_reminders') && (
        <ReminderSettings />
      )}
    </View>
  );
};
```

### **3. Migration Hook Usage (Critical)**

```typescript
import { useAuthMigration } from '@/hooks/useAuthMigration';

const LoginComponent = () => {
  // This hook automatically uses AuthStore if USE_AUTH_STORE is enabled,
  // otherwise falls back to AuthContext
  const { user, login, logout, isAuthenticated } = useAuthMigration();
  
  // Your component code remains exactly the same!
  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome {user?.name}</Text>
      ) : (
        <LoginForm onLogin={login} />
      )}
    </View>
  );
};
```

### **4. Feature Flag Groups**

```typescript
const { 
  enableFeatureGroup, 
  disableFeatureGroup, 
  isGroupEnabled 
} = useFeatureFlagMigration();

// Enable all community features at once
enableFeatureGroup('community', [
  'community_posts',
  'community_mentions', 
  'community_reactions',
  'community_polls'
]);

// Check if entire group is enabled
const communityEnabled = isGroupEnabled('community');
```

### **5. Dynamic Feature Flag Updates**

```typescript
const { 
  toggleFlag, 
  refreshFlags, 
  getRemoteFlags 
} = useFeatureFlagMigration();

// Toggle a specific feature
const handleToggle = async () => {
  await toggleFlag('advanced_analytics', true);
  // Feature is now enabled for this user
};

// Refresh from remote config
const handleRefresh = async () => {
  await refreshFlags();
  // Latest flags fetched from server
};
```

## 🎚️ **Feature Flag Management**

### **Environment-Based Configuration**

```typescript
// Development - all experimental features enabled
const DEVELOPMENT_OVERRIDES = {
  ai_suggestions: true,
  predictive_analytics: true,
  voice_commands: true,
  advanced_analytics: true,
};

// Production - stable features only
const PRODUCTION_OVERRIDES = {
  ai_suggestions: false,
  predictive_analytics: false,
  voice_commands: false,
  experimental_features: false,
};
```

### **Gradual Rollout Configuration**

```typescript
// Rollout percentages for new features
const ROLLOUT_CONFIG = {
  auto_pay: { percentage: 25, userBucket: 'premium' },
  ai_suggestions: { percentage: 5, userBucket: 'beta_testers' },
  multi_society_management: { percentage: 50, userBucket: 'admins' },
};
```

### **A/B Testing Setup**

```typescript
// A/B test configurations
const AB_TESTS = {
  payment_flow_v2: {
    control: 'online_payments',
    variant: 'multi_payment_gateways',
    percentage: 50,
  },
  dashboard_layout: {
    control: 'admin_dashboard',
    variant: 'advanced_analytics',
    percentage: 30,
  },
};
```

## 🔧 **Admin Interface**

### **Feature Flag Dashboard**

```typescript
// Admin can control flags remotely
const AdminFeatureFlagsPanel = () => {
  const { 
    getAllFlags, 
    updateFlag, 
    bulkUpdateFlags,
    getFlagAnalytics 
  } = useAdminMigration();
  
  return (
    <AdminPanel>
      <FeatureFlagsList 
        flags={getAllFlags()}
        onToggle={updateFlag}
        analytics={getFlagAnalytics()}
      />
    </AdminPanel>
  );
};
```

### **Emergency Flag Controls**

```typescript
// Emergency disable all experimental features
const emergencyDisable = async () => {
  const experimentalFlags = [
    'ai_suggestions',
    'predictive_analytics', 
    'voice_commands',
    'advanced_analytics'
  ];
  
  await bulkUpdateFlags(
    experimentalFlags.map(flag => ({ flag, enabled: false }))
  );
};
```

## 📊 **Analytics and Monitoring**

### **Feature Usage Tracking**

```typescript
// Track feature usage
const trackFeatureUsage = (featureName: string) => {
  if (isFeatureEnabled('usage_metrics')) {
    analytics.track('feature_used', {
      feature: featureName,
      userId: user.id,
      societyId: society.id,
      timestamp: new Date().toISOString(),
    });
  }
};
```

### **Performance Impact Monitoring**

```typescript
// Monitor performance impact of features
const PerformanceMonitor = () => {
  const { isFeatureEnabled } = useFeatureFlagMigration();
  
  useEffect(() => {
    if (isFeatureEnabled('performance_monitoring')) {
      // Track app performance metrics
      measurePerformance('app_startup');
      measureMemoryUsage();
      trackRenderTimes();
    }
  }, []);
};
```

## 🚨 **Migration-Specific Flags (CRITICAL)**

### **Current Migration Status**

**⚠️ IMPORTANT**: These flags control the Zustand migration and are currently **ENABLED** for development:

```typescript
// Current flag status (enabled for development testing)
const MIGRATION_FLAGS = {
  USE_AUTH_STORE: true,        // ✅ AuthStore active
  USE_SOCIETY_STORE: true,     // ✅ SocietyStore active  
  USE_ADMIN_STORE: true,       // ✅ AdminStore active
  USE_THEME_STORE: true,       // ✅ ThemeStore active
  USE_NOTIFICATION_STORE: true, // ✅ NotificationStore active
  USE_FEATURE_FLAG_STORE: true, // ✅ FeatureFlagStore active
};
```

### **Migration Rollback Procedure**

```typescript
// Emergency rollback - disable all stores
const emergencyRollback = async () => {
  const migrationFlags = [
    'USE_AUTH_STORE',
    'USE_SOCIETY_STORE', 
    'USE_ADMIN_STORE',
    'USE_THEME_STORE',
    'USE_NOTIFICATION_STORE',
    'USE_FEATURE_FLAG_STORE'
  ];
  
  // Disable all migration flags
  for (const flag of migrationFlags) {
    await toggleFlag(flag, false);
  }
  
  // Clear store data
  await resetAllStores();
  
  console.warn('🚨 Emergency rollback completed - using Context API');
};
```

### **Gradual Production Rollout Plan**

```typescript
// Recommended production rollout strategy
const PRODUCTION_ROLLOUT_PLAN = {
  week1: { USE_THEME_STORE: 10 },        // Start with theme (low risk)
  week2: { USE_FEATURE_FLAG_STORE: 20 }, // Feature flags next
  week3: { USE_AUTH_STORE: 30 },         // Auth store (monitor closely)
  week4: { USE_NOTIFICATION_STORE: 50 }, // Notifications
  week5: { USE_SOCIETY_STORE: 70 },      // Society data
  week6: { USE_ADMIN_STORE: 100 },       // Admin last (highest complexity)
};
```

## 🔒 **Security Considerations**

### **Sensitive Feature Protection**

```typescript
// Some features require additional security checks
const SecureFeatureGuard = ({ feature, children }) => {
  const { checkPermission } = useAdminMigration();
  const { isFeatureEnabled } = useFeatureFlagMigration();
  
  if (!isFeatureEnabled(feature)) return null;
  
  // Additional security for sensitive features
  if (SENSITIVE_FEATURES.includes(feature)) {
    if (!checkPermission(feature, 'access')) {
      return <UnauthorizedAccess />;
    }
  }
  
  return children;
};

const SENSITIVE_FEATURES = [
  'audit_logging',
  'multi_society_management', 
  'admin_dashboard',
  'payment_analytics',
  'emergency_management'
];
```

## 📱 **Best Practices**

### **1. Feature Flag Naming**
- Use descriptive, hierarchical names: `billing_auto_pay`, `community_reactions`
- Include scope: `admin_audit_logging`, `resident_notifications`  
- Use snake_case consistently

### **2. Default Values**
- New features should default to `false` (opt-in)
- Stable features can default to `true`
- Migration flags start `false`, enable gradually

### **3. Performance**
- Minimize feature flag checks in render loops
- Cache flag values when possible
- Use feature flag components for expensive features

### **4. Testing**
- Test both enabled and disabled states
- Include feature flag states in test scenarios
- Mock feature flags in unit tests

### **5. Documentation**
- Document the purpose of each flag
- Include rollback procedures
- Update team when flags change

## 🎯 **Current Priorities**

### **Immediate Focus** (Next 2 weeks)
1. **Migration Flags**: Monitor `USE_*_STORE` flags in development
2. **Core Features**: Ensure `online_payments`, `push_notifications` work
3. **Admin Features**: Validate `admin_dashboard`, `role_based_access`

### **Medium Term** (Next month)
1. **Community Features**: Enable `community_posts`, `community_polls`
2. **Advanced Features**: Test `biometric_auth`, `data_sync`
3. **Analytics**: Enable `usage_metrics`, `performance_monitoring`

### **Long Term** (Next quarter)
1. **Experimental**: Gradually enable AI features
2. **Regional**: Add language support, local features
3. **Enterprise**: Multi-society, advanced analytics

---

**The feature flag system is the backbone of safe feature deployment and the Zustand migration. Use it wisely to ensure a smooth user experience and reliable system operation.** 🚀