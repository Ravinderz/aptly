# Role Management & Onboarding Workflow Design

## Current Problem Analysis

### 1. Society Onboarding Request Submission Gap
- **Issue**: Super admins can view onboarding requests, but no clear workflow for who submits them
- **Impact**: Incomplete user journey, unclear entry point into the system

### 2. Community Manager Role Definition Gap  
- **Issue**: Community managers currently see resident views instead of management tools
- **Impact**: Role confusion, inefficient workflows, lack of proper permissions

## Proposed Solution Architecture

## Part 1: Society Onboarding Request Workflow

### Option A: Society Admin Self-Registration (Recommended)
```yaml
Flow:
  1. Society Admin/Secretary visits public registration page
  2. Fills society onboarding form with:
     - Society details (name, address, units, amenities)
     - Admin contact information
     - Supporting documents (registration certificate, etc.)
     - Subscription plan selection
  3. System creates "pending" society request
  4. Super admin receives notification and reviews request
  5. Super admin approves/rejects with feedback
  6. Upon approval:
     - Society is activated
     - Society admin receives login credentials
     - Community manager can be assigned

Entry Points:
  - Public website landing page
  - Marketing campaigns
  - Referral links from existing societies
```

### Option B: Super Admin Creates on Behalf (Current + Enhancement)
```yaml
Flow:
  1. Super admin receives society inquiry (phone/email/meeting)
  2. Super admin creates society request in admin portal
  3. System generates onboarding form link
  4. Society admin completes onboarding via link
  5. Auto-approval or manual review process
```

### Option C: Community Manager as Sales Agent
```yaml
Flow:
  1. Community managers can create society prospects
  2. Prospect management with follow-up tracking
  3. Conversion to full onboarding requests
  4. Commission/incentive tracking for managers
```

## Part 2: Role-Based Dashboard Architecture

### Role Hierarchy & Permissions
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMMUNITY_MANAGER = 'community_manager', 
  SOCIETY_ADMIN = 'society_admin',
  RESIDENT = 'resident',
  GUEST = 'guest'
}

interface RolePermissions {
  // Society Management
  societies: {
    view: UserRole[];
    create: UserRole[];
    edit: UserRole[];
    delete: UserRole[];
    approve: UserRole[];
  };
  
  // User Management
  users: {
    view: UserRole[];
    create: UserRole[];
    edit: UserRole[];
    assign_roles: UserRole[];
  };
  
  // Analytics & Reports
  analytics: {
    system_wide: UserRole[];
    society_specific: UserRole[];
    personal: UserRole[];
  };
}
```

### Dashboard Views by Role

#### Super Admin Dashboard
```yaml
Sections:
  - System Overview (all societies, users, revenue)
  - Society Onboarding Requests (pending approvals)
  - Community Manager Performance
  - System Analytics & Health
  - Financial Dashboard (subscriptions, revenue)
  - User Management (all users across platform)
  
Navigation:
  - /admin/dashboard (main)
  - /admin/societies (all societies)
  - /admin/onboarding (approval queue)
  - /admin/managers (CM management)
  - /admin/analytics (system-wide)
  - /admin/users (platform users)
  - /admin/billing (financial overview)
```

#### Community Manager Dashboard
```yaml
Sections:
  - Assigned Societies Overview
  - Society Health Metrics (engagement, issues)
  - Resident Support Queue (tickets, complaints)
  - Performance Metrics (KPIs, targets)
  - Society Onboarding Pipeline (if authorized)
  
Navigation:
  - /manager/dashboard (main)
  - /manager/societies (assigned societies only)
  - /manager/residents (society residents)
  - /manager/support (help desk)
  - /manager/reports (society-specific)
  - /manager/tasks (assigned tasks)
```

#### Society Admin Dashboard  
```yaml
Sections:
  - Society Management (their society only)
  - Resident Management (approvals, roles)
  - Maintenance & Services
  - Governance & Voting
  - Financial Management (maintenance, billing)
  - Community Features
  
Navigation:
  - /(tabs)/ (current resident app with admin features)
  - Enhanced permissions for society management
```

#### Resident Dashboard
```yaml
Sections:
  - Personal Dashboard (current implementation)
  - Society Services & Features
  - Community Engagement
  - Personal Profile & Preferences
  
Navigation:
  - /(tabs)/ (current implementation)
```

## Part 3: Implementation Strategy

### Phase 1: Role-Based Routing & Permissions
1. **Create role-based route guards**
   ```typescript
   // Route protection based on user role
   const RequireRole = ({ roles, children }) => {
     const { user } = useDirectAuth();
     return roles.includes(user?.role) ? children : <AccessDenied />;
   };
   ```

2. **Implement permission checking system**
   ```typescript
   const usePermissions = () => {
     const { user } = useDirectAuth();
     return {
       canViewSocieties: checkPermission(user.role, 'societies', 'view'),
       canCreateSociety: checkPermission(user.role, 'societies', 'create'),
       // ... more permissions
     };
   };
   ```

### Phase 2: Community Manager Interface
1. **Create manager-specific layouts**
   ```
   /app/manager/
   ├── dashboard.tsx (manager overview)
   ├── societies/
   │   ├── index.tsx (assigned societies)
   │   └── [id]/
   │       ├── overview.tsx
   │       ├── residents.tsx
   │       └── reports.tsx
   ├── support/
   │   ├── tickets.tsx
   │   └── queue.tsx
   └── reports/
       └── performance.tsx
   ```

2. **Implement society assignment system**
   - Managers can only see assigned societies
   - Assignment tracking and history
   - Performance metrics per assignment

### Phase 3: Society Onboarding Portal
1. **Create public registration portal**
   ```
   /app/register/
   ├── index.tsx (landing page)
   ├── society/
   │   ├── basic-info.tsx
   │   ├── contact-details.tsx
   │   ├── subscription.tsx
   │   └── confirmation.tsx
   └── status/
       └── [requestId].tsx (status tracking)
   ```

2. **Implement request workflow**
   - Multi-step form with validation
   - Document upload capabilities
   - Email notifications and status updates
   - Admin approval interface

### Phase 4: Enhanced Permissions & Security
1. **Fine-grained permissions**
   - Resource-level access control
   - Context-aware permissions (own society vs others)
   - Action-level restrictions

2. **Audit logging**
   - Track all role-based actions
   - Permission changes and access attempts
   - Security monitoring

## Data Model Updates Required

### User Role Enhancement
```typescript
interface User {
  // ... existing fields
  role: UserRole;
  permissions: Permission[];
  assignedSocieties?: string[]; // for community managers
  managerMetrics?: ManagerMetrics; // for community managers
}

interface ManagerMetrics {
  assignedSocietiesCount: number;
  activeTickets: number;
  resolutionRate: number;
  satisfactionScore: number;
  targetMetrics: {
    societies: number;
    responseTime: number; // hours
    resolutionRate: number; // percentage
  };
}
```

### Society Request Model
```typescript
interface SocietyOnboardingRequest {
  id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  
  // Society Information
  societyDetails: {
    name: string;
    address: string;
    totalUnits: number;
    amenities: string[];
    // ... other society fields
  };
  
  // Contact Information
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  
  // Business Information
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  documents: {
    registrationCertificate?: string;
    utilityBill?: string;
    societyByLaws?: string;
  };
  
  // Process Tracking
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // super admin id
  rejectionReason?: string;
  
  // Assignment
  assignedManager?: string; // community manager id
}
```

## Next Steps Priority

1. **Immediate**: Create community manager dashboard routes and basic permissions
2. **High Priority**: Implement society onboarding request submission form
3. **Medium Priority**: Enhanced role-based permissions system  
4. **Future**: Advanced manager assignment and performance tracking

## Questions for Stakeholder Review

1. **Onboarding Flow**: Should society registration be completely self-service or require initial contact?
2. **Manager Assignment**: Should managers be assigned automatically or manually by super admin?
3. **Permissions Granularity**: How detailed should permission controls be?
4. **Revenue Model**: Should community managers earn commissions on society onboarding?
5. **Geographic Assignment**: Should managers be assigned based on location/regions?