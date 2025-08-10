# TypeScript Error Resolution Plan

## Overview
This document outlines a systematic approach to resolve all TypeScript compilation errors in the Aptly codebase. Total errors: ~395

## Error Categories and Fixes

### **Phase 1: Critical Type Definition Fixes**

#### 1.1 User & Community Type Issues ✅ IN PROGRESS
**Status:** PARTIALLY COMPLETED
**Files:** `types/community.ts`, `services/communityApi.ts`, community components

**Completed:**
- ✅ Added missing properties to User interface: `email`, `phone`, `bio`, `joinedDate`, `connectionsCount`
- ✅ Updated mock user data with complete property sets
- ✅ Added `getUserPosts` method to communityApi service
- ✅ Fixed state type declarations in community index: `User | null`, `User[]`
- ✅ Added `onMentionPress` prop to PostCard interface

**Remaining:**
- Fix `loadPost` function declaration order in edit post component
- Fix component prop passing issues

#### 1.2 Analytics Component Props
**Status:** PENDING
**Files:** `components/analytics/*.tsx`, `types/analytics.ts`

**Issues to Fix:**
- AnalyticsDashboard props interface missing `data` property
- AuditSystem props interface missing `auditEntries` property
- Component prop passing mismatches in main analytics page

**Fix Plan:**
```typescript
// Update AnalyticsDashboardProps
interface AnalyticsDashboardProps {
  data: SocietyAnalytics;
  onExportReport: (format: 'json' | 'pdf' | 'csv') => Promise<void>;
  onRefresh: () => Promise<void>;
  userRole: 'resident' | 'admin' | 'committee_member';
}

// Update AuditSystemProps
interface AuditSystemProps {
  auditEntries: AuditEntry[];
  onExportAuditLog: (format: 'json' | 'pdf' | 'csv') => Promise<void>;
  onRefresh: () => Promise<void>;
  userRole: 'resident' | 'admin' | 'committee_member';
}
```

#### 1.3 Billing System Type Issues
**Status:** PENDING
**Files:** `types/billing.ts`, billing components

**Issues to Fix:**
- Missing `waterUsage` property in bill types
- Missing `popular` property in DeliverySlot interface
- Function parameter mismatches in electricity recharge

**Fix Plan:**
```typescript
// Add to bill type
interface Bill {
  // existing properties...
  waterUsage?: {
    current: number;
    previous: number;
    consumption: number;
    rate: number;
  };
}

// Update DeliverySlot
interface DeliverySlot {
  // existing properties...
  popular?: boolean;
}
```

### **Phase 2: Component Interface Fixes**

#### 2.1 Community Components
**Status:** IN PROGRESS
**Files:** `app/(tabs)/community/*.tsx`

**Issues to Fix:**
- ✅ Fixed state type declarations from `never[]` to proper types
- ✅ Added missing service methods in CommunityService
- ❌ Fix `loadPost` variable declaration order in edit component
- ❌ Update PostCard usage to include all required props

**Fix Plan:**
```typescript
// Fix useEffect dependency order
const loadPost = useCallback(async () => {
  // function implementation
}, [postId]);

useEffect(() => {
  if (postId) {
    loadPost();
  }
}, [postId, loadPost]);
```

#### 2.2 Analytics Components
**Status:** PENDING
**Files:** `app/(tabs)/services/analytics/index.tsx`

**Issues to Fix:**
- Undefined variable `error` on line 455
- Component prop passing mismatches
- Missing error handling

#### 2.3 Billing Components
**Status:** PENDING
**Files:** `app/(tabs)/services/billing/*.tsx`

**Issues to Fix:**
- Function parameter mismatches in electricity-recharge
- Missing `showDeleteConfirmAlert` function in settings
- IconName type issues

### **Phase 3: Service Layer Fixes**

#### 3.1 Admin Auth Service
**Status:** PENDING
**Files:** `services/admin/adminAuthService.ts`

**Issues to Fix:**
- Permission action type mismatches
- DeviceInfo type handling
- UserProfile interface issues

**Fix Plan:**
```typescript
// Update PermissionAction type
type PermissionAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'generate' | 'broadcast' | 'declare'
  | 'bulk_action' | 'incidents'
  | // other valid actions...

// Fix DeviceInfo handling
const getDeviceInfo = (): DeviceInfo => {
  return {
    platform: Platform.OS as 'ios' | 'android' | 'web',
    version: Device.osVersion || 'unknown',
    appVersion: Constants.expoConfig?.version || '1.0.0',
  };
};
```

#### 3.2 API Service Integration
**Status:** PENDING
**Files:** `services/api.service.ts`

**Issues to Fix:**
- Private method access issues
- Authentication token handling

#### 3.3 Governance Context
**Status:** PENDING
**Files:** `contexts/GovernanceContext.tsx`

**Issues to Fix:**
- VotingType enum mismatches
- Interface property name inconsistencies
- Object literal type issues

### **Phase 4: Utility & Helper Fixes**

#### 4.1 Biometric Service
**Status:** PENDING
**Files:** `services/biometric.service.ts`

**Issues to Fix:**
- LocalAuthenticationOptions interface
- Remove unsupported properties

#### 4.2 Role Manager
**Status:** PENDING
**Files:** `services/admin/roleManager.ts`

**Issues to Fix:**
- AdminRole type instantiation
- Property access patterns

### **Phase 5: Navigation & Icon Fixes**

#### 5.1 Icon Type Issues
**Status:** PENDING
**Files:** Components using LucideIcons

**Issues to Fix:**
- IconName type mismatches
- Update icon name references

#### 5.2 Navigation Type Issues
**Status:** PENDING
**Files:** `types/admin.ts`, navigation components

**Issues to Fix:**
- NavigationItem type definition
- Missing type imports

### **Phase 6: Final Cleanup & Validation**

#### 6.1 Unused Imports & Variables
**Status:** PENDING

**Tasks:**
- Remove unused imports across all files
- Clean up commented code
- Fix variable naming consistency

#### 6.2 Strict Type Checking
**Status:** PENDING

**Tasks:**
- Enable stricter TypeScript rules gradually
- Fix remaining `any` types
- Add comprehensive JSDoc comments

## Implementation Strategy

### Week 1: Critical Fixes (Phases 1-2)
- **Day 1-2:** Complete Phase 1 type definition updates
- **Day 3-4:** Fix component interface issues  
- **Day 5:** Testing and validation

### Week 2: Service & Context Fixes (Phases 3-4)
- **Day 1-2:** Service layer fixes
- **Day 3-4:** Context and utility fixes
- **Day 5:** Integration testing

### Week 3: Final Polish (Phases 5-6)
- **Day 1-2:** Navigation and icon fixes
- **Day 3-4:** Final cleanup and optimization
- **Day 5:** Comprehensive testing and documentation

## Progress Tracking

### Completed ✅
- [x] **Phase 1.1:** User interface property additions
- [x] **Phase 1.1:** Mock data updates with complete property sets  
- [x] **Phase 1.1:** CommunityApi service method additions
- [x] **Phase 1.1:** Community component state type fixes
- [x] **Phase 1.1:** PostCard onMentionPress prop addition
- [x] **Phase 1.2:** Analytics component props fixes (data → societyAnalytics, auditEntries → auditLogs)
- [x] **Phase 1.3:** Billing system type fixes (waterUsage, popular properties)
- [x] **Phase 1.3:** Electricity recharge showAlert parameter fixes
- [x] **Phase 2.1:** Community PostCard prop interface updates
- [x] **Phase 2.1:** Community edit component loadPost useEffect order fixes
- [x] **Phase 3.1:** GovernanceContext VotingType and interface fixes
- [x] **Phase 3.1:** Admin auth service categorizeEvent return type fixes
- [x] **Phase 4.1:** Biometric service subtitle property removal
- [x] **Phase 4.1:** Admin PermissionAction type updates
- [x] **Phase 4.2:** GovernanceContext VotingCandidate interface alignment
- [x] **Phase 4.2:** EmergencyAlert interface property corrections

### In Progress 🔄 - PHASE 5
- [x] **Phase 5.1:** Icon name fixes (filter → Funnel in billing)
- [x] **Phase 5.1:** Governance VotingType fixes (election → committee_election)
- [x] **Phase 5.1:** VotingCandidate interface fixes (imageUrl → profileImage, voteCount → votes)
- [x] **Phase 5.1:** EmergencyAlert escalation chain interface fixes
- [x] **Phase 5.1:** GovernanceDashboard property name fixes (societyId → society_id)
- [ ] **Phase 5.2:** PolicyGovernance component prop fixes
- [ ] **Phase 5.2:** SuccessionManagement component prop fixes
- [ ] **Phase 5.2:** Remaining navigation type issues

### Pending ❌
- [ ] **Phase 6.1:** Remove unused imports across all files
- [ ] **Phase 6.1:** Clean up remaining any types
- [ ] **Phase 6.2:** Final validation and testing

## Current Status: **324 TypeScript errors remaining** (down from ~395)
**Errors Fixed:** 71+ errors resolved across phases 1-5
**Current Priority:** Complete Phase 5 navigation and component interface fixes

## Success Metrics
- ✅ Zero TypeScript compilation errors
- ✅ All components properly typed
- ✅ Service methods correctly interfaced
- ✅ Comprehensive type safety
- ✅ Maintainable code structure

## Next Steps
1. Complete Phase 1.1 community component fixes
2. Begin Phase 1.2 analytics component interface updates
3. Proceed systematically through each phase
4. Test after each major fix group
5. Document any breaking changes

## Notes
- Incremental fixes with testing after each phase
- Backup of working state before major changes
- Regression testing of existing functionality
- Comprehensive documentation of changes made