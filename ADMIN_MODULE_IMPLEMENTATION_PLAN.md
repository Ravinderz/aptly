# Admin Module Implementation Plan for Aptly

## Executive Summary

The admin module will extend the existing admin system to handle society onboarding, community manager assignment, and comprehensive admin dashboard functionality. The implementation leverages the existing architecture patterns, authentication system, and UI components while adding new features for admin user management.

## Current Architecture Analysis

### Existing Patterns Identified
- **Navigation**: Expo Router with file-based routing in `/app` directory
- **State Management**: Context API with multiple contexts (AdminContext, AuthContext, SocietyContext)
- **Authentication**: JWT-based with Supabase integration, secure storage with AsyncStorage/SecureStore
- **UI Components**: Custom component library in `/components/ui` with Tailwind CSS styling
- **Admin System**: Partial implementation with role-based access control (RBAC)
- **Database**: PostgreSQL with comprehensive schema already defined
- **API Layer**: Service pattern with centralized API endpoints

## 1. Database Schema Design

### 1.1 Admin Tables (Extensions to Existing Schema)

```sql
-- Admin onboarding requests
CREATE TABLE public.society_onboarding_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_name varchar(255) NOT NULL,
  society_code varchar(20) NOT NULL UNIQUE,
  admin_name varchar(255) NOT NULL,
  admin_email varchar(255) NOT NULL,
  admin_phone varchar(15) NOT NULL,
  society_address text NOT NULL,
  total_flats integer NOT NULL,
  request_status varchar(20) DEFAULT 'pending' CHECK (request_status IN ('pending', 'under_review', 'approved', 'rejected')),
  submitted_documents text[] DEFAULT '{}',
  verification_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Super admin users
CREATE TABLE public.super_admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  phone varchar(15) NOT NULL,
  role varchar(50) DEFAULT 'super_admin',
  permissions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community manager assignments
CREATE TABLE public.community_manager_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id uuid NOT NULL REFERENCES public.societies(id),
  manager_id uuid NOT NULL REFERENCES public.user_profiles(id),
  assigned_by uuid NOT NULL REFERENCES public.super_admins(id),
  assignment_type varchar(20) DEFAULT 'permanent' CHECK (assignment_type IN ('permanent', 'temporary', 'interim')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  assignment_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin activity logs
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  society_id uuid REFERENCES public.societies(id),
  action_type varchar(50) NOT NULL,
  entity_type varchar(50),
  entity_id uuid,
  action_details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
```

### 1.2 Indexes for Performance

```sql
CREATE INDEX idx_onboarding_requests_status ON public.society_onboarding_requests(request_status);
CREATE INDEX idx_onboarding_requests_created ON public.society_onboarding_requests(created_at DESC);
CREATE INDEX idx_manager_assignments_society ON public.community_manager_assignments(society_id);
CREATE INDEX idx_manager_assignments_manager ON public.community_manager_assignments(manager_id);
CREATE INDEX idx_admin_activity_logs_admin ON public.admin_activity_logs(admin_id, created_at DESC);
```

## 2. API Endpoints Specification

### 2.1 Society Onboarding Endpoints

```typescript
// Society onboarding request
POST /api/admin/societies/onboarding
{
  societyName: string;
  societyCode: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  societyAddress: string;
  totalFlats: number;
  documents: string[];
}

// Get onboarding requests (super admin only)
GET /api/admin/societies/onboarding?status=pending&page=1&limit=20

// Review onboarding request
PATCH /api/admin/societies/onboarding/:id
{
  status: 'approved' | 'rejected';
  notes?: string;
}

// Approve society creation
POST /api/admin/societies/:id/approve
{
  settings: SocietySettings;
  initialManagerId?: string;
}
```

### 2.2 Community Manager Assignment Endpoints

```typescript
// Get available managers
GET /api/admin/managers/available

// Assign community manager
POST /api/admin/societies/:societyId/assign-manager
{
  managerId: string;
  assignmentType: 'permanent' | 'temporary' | 'interim';
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Get manager assignments
GET /api/admin/societies/:societyId/managers

// Update manager assignment
PATCH /api/admin/assignments/:assignmentId
{
  endDate?: string;
  isActive: boolean;
  notes?: string;
}
```

### 2.3 Admin Dashboard Endpoints

```typescript
// Admin dashboard overview
GET /api/admin/dashboard/overview
{
  totalSocieties: number;
  activeSocieties: number;
  pendingOnboarding: number;
  totalManagers: number;
  systemHealth: SystemHealthMetrics;
  recentActivity: ActivityLog[];
}

// Society management data
GET /api/admin/societies?page=1&limit=20&search=&status=active

// Manager performance metrics
GET /api/admin/managers/:managerId/performance
```

## 3. React Native Implementation

### 3.1 Navigation Structure

```typescript
// app/admin/_layout.tsx
export default function AdminLayout() {
  return (
    <AdminProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="societies" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="managers" />
        <Stack.Screen name="settings" />
      </Stack>
    </AdminProvider>
  );
}

// app/admin/dashboard.tsx - Main admin dashboard
// app/admin/societies/index.tsx - Society management
// app/admin/societies/[societyId].tsx - Individual society details
// app/admin/onboarding/index.tsx - Onboarding requests
// app/admin/onboarding/[requestId].tsx - Review onboarding
// app/admin/managers/index.tsx - Manager assignments
```

### 3.2 State Management Extension

```typescript
// contexts/SuperAdminContext.tsx
interface SuperAdminContextType {
  // Dashboard data
  dashboardData: AdminDashboard | null;
  societies: Society[];
  onboardingRequests: OnboardingRequest[];
  managers: CommunityManager[];
  
  // Actions
  loadDashboardData: () => Promise<void>;
  approveSociety: (requestId: string, settings: SocietySettings) => Promise<void>;
  assignManager: (societyId: string, managerId: string, assignment: ManagerAssignment) => Promise<void>;
  reviewOnboardingRequest: (requestId: string, decision: 'approved' | 'rejected', notes?: string) => Promise<void>;
  
  // Filters and pagination
  societyFilters: SocietyFilters;
  onboardingFilters: OnboardingFilters;
  setSocietyFilters: (filters: SocietyFilters) => void;
  setOnboardingFilters: (filters: OnboardingFilters) => void;
}
```

### 3.3 Key Components

```typescript
// components/admin/SuperAdminDashboard.tsx
export const SuperAdminDashboard: React.FC = () => {
  const { dashboardData, loadDashboardData } = useSuperAdmin();
  
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <AdminHeader title="Admin Dashboard" />
      <DashboardMetrics data={dashboardData} />
      <QuickActions />
      <RecentActivity activities={dashboardData?.recentActivity} />
      <SystemHealth metrics={dashboardData?.systemHealth} />
    </ScrollView>
  );
};

// components/admin/SocietyOnboardingList.tsx
export const SocietyOnboardingList: React.FC = () => {
  const { onboardingRequests, reviewOnboardingRequest } = useSuperAdmin();
  
  return (
    <View className="flex-1">
      <FlatList
        data={onboardingRequests}
        renderItem={({ item }) => (
          <OnboardingRequestCard
            request={item}
            onReview={reviewOnboardingRequest}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

// components/admin/ManagerAssignmentForm.tsx
export const ManagerAssignmentForm: React.FC<{
  societyId: string;
  onAssign: (assignment: ManagerAssignment) => void;
}> = ({ societyId, onAssign }) => {
  // Form implementation for manager assignment
};
```

## 4. Security and Permissions Model

### 4.1 Role-Based Access Control

```typescript
// types/admin.ts (extension)
export type SuperAdminPermission = 
  | 'societies.create'
  | 'societies.update'
  | 'societies.delete'
  | 'societies.view_all'
  | 'managers.assign'
  | 'managers.remove'
  | 'managers.view_performance'
  | 'onboarding.review'
  | 'onboarding.approve'
  | 'system.admin'
  | 'reports.view_all';

export interface SuperAdminRole {
  id: string;
  name: string;
  permissions: SuperAdminPermission[];
  description: string;
}
```

### 4.2 Permission Guards

```typescript
// utils/adminPermissions.ts
export const checkSuperAdminPermission = (
  permission: SuperAdminPermission,
  userPermissions: SuperAdminPermission[]
): boolean => {
  return userPermissions.includes(permission) || userPermissions.includes('system.admin');
};

// components/admin/AdminPermissionGate.tsx
export const AdminPermissionGate: React.FC<{
  permission: SuperAdminPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useSuperAdmin();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

## 5. Services Implementation

### 5.1 Admin API Service

```typescript
// services/admin/superAdminService.ts
export class SuperAdminService {
  private baseURL = process.env.EXPO_PUBLIC_API_URL + '/admin';

  async getDashboardData(): Promise<AdminDashboard> {
    const response = await this.authenticatedRequest('/dashboard/overview');
    return response.data;
  }

  async getOnboardingRequests(filters: OnboardingFilters): Promise<OnboardingRequest[]> {
    const response = await this.authenticatedRequest('/societies/onboarding', {
      params: filters
    });
    return response.data;
  }

  async reviewOnboardingRequest(
    requestId: string, 
    decision: 'approved' | 'rejected', 
    notes?: string
  ): Promise<void> {
    await this.authenticatedRequest(`/societies/onboarding/${requestId}`, {
      method: 'PATCH',
      data: { status: decision, notes }
    });
  }

  async approveSocietyCreation(
    requestId: string, 
    settings: SocietySettings
  ): Promise<Society> {
    const response = await this.authenticatedRequest(`/societies/${requestId}/approve`, {
      method: 'POST',
      data: { settings }
    });
    return response.data;
  }

  async assignCommunityManager(
    societyId: string, 
    managerId: string, 
    assignment: ManagerAssignment
  ): Promise<void> {
    await this.authenticatedRequest(`/societies/${societyId}/assign-manager`, {
      method: 'POST',
      data: { managerId, ...assignment }
    });
  }

  private async authenticatedRequest(endpoint: string, options: RequestOptions = {}) {
    const token = await SecureStore.getItemAsync('adminToken');
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
}
```

## 6. UI/UX Implementation

### 6.1 Design System Extension

```typescript
// components/admin/AdminCard.tsx
export const AdminCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, children, actions }) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          {subtitle && <Text className="text-sm text-gray-600">{subtitle}</Text>}
        </View>
        {actions}
      </View>
      {children}
    </View>
  );
};

// components/admin/StatusBadge.tsx
export const StatusBadge: React.FC<{
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, size = 'md' }) => {
  const getStatusStyle = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status as keyof typeof styles];
  };

  return (
    <View className={`px-2 py-1 rounded-full border ${getStatusStyle(status)}`}>
      <Text className={`text-xs font-medium capitalize`}>{status}</Text>
    </View>
  );
};
```

### 6.2 Dashboard Widgets

```typescript
// components/admin/DashboardMetrics.tsx
export const DashboardMetrics: React.FC<{
  data: AdminDashboard | null;
}> = ({ data }) => {
  if (!data) return <LoadingSpinner />;

  const metrics = [
    { 
      title: 'Total Societies', 
      value: data.totalSocieties, 
      change: '+12%', 
      trend: 'up',
      icon: 'building-2'
    },
    { 
      title: 'Active Managers', 
      value: data.totalManagers, 
      change: '+5%', 
      trend: 'up',
      icon: 'users'
    },
    { 
      title: 'Pending Onboarding', 
      value: data.pendingOnboarding, 
      change: '-8%', 
      trend: 'down',
      icon: 'clock'
    },
  ];

  return (
    <View className="px-4 py-2">
      <Text className="text-lg font-semibold mb-4">Overview</Text>
      <View className="flex-row flex-wrap">
        {metrics.map((metric, index) => (
          <View key={index} className="w-1/2 pr-2 mb-4">
            <MetricCard {...metric} />
          </View>
        ))}
      </View>
    </View>
  );
};
```

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// __tests__/services/superAdminService.test.ts
describe('SuperAdminService', () => {
  let service: SuperAdminService;

  beforeEach(() => {
    service = new SuperAdminService();
  });

  it('should fetch dashboard data', async () => {
    const mockData = { totalSocieties: 10, totalManagers: 5 };
    jest.spyOn(service, 'getDashboardData').mockResolvedValue(mockData);

    const result = await service.getDashboardData();
    expect(result).toEqual(mockData);
  });

  it('should review onboarding request', async () => {
    const reviewSpy = jest.spyOn(service, 'reviewOnboardingRequest');
    await service.reviewOnboardingRequest('req-1', 'approved', 'Looks good');
    
    expect(reviewSpy).toHaveBeenCalledWith('req-1', 'approved', 'Looks good');
  });
});
```

### 7.2 Integration Tests

```typescript
// __tests__/admin/adminFlow.test.tsx
describe('Admin Flow Integration', () => {
  it('should complete society onboarding approval flow', async () => {
    const { getByText, getByTestId } = render(
      <AdminProvider>
        <SuperAdminDashboard />
      </AdminProvider>
    );

    // Test approval workflow
    fireEvent.press(getByText('Review Onboarding'));
    fireEvent.press(getByText('Approve'));
    
    await waitFor(() => {
      expect(getByText('Society approved successfully')).toBeTruthy();
    });
  });
});
```

## 8. Deployment and Configuration

### 8.1 Environment Configuration

```typescript
// config/adminConfig.ts
export const adminConfig = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    enableDebugLogs: true,
    mockData: true,
  },
  production: {
    apiUrl: 'https://api.aptly.app/v4',
    enableDebugLogs: false,
    mockData: false,
  }
};
```

### 8.2 Feature Flags

```typescript
// Add to existing FeatureFlagContext.tsx
export const adminFeatureFlags = {
  SOCIETY_ONBOARDING: true,
  MANAGER_ASSIGNMENT: true,
  BULK_OPERATIONS: false,
  ADVANCED_ANALYTICS: true,
  AUTOMATED_APPROVALS: false,
};
```

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema migration
- [ ] Basic admin authentication extension
- [ ] Super admin context setup
- [ ] Admin navigation structure

### Phase 2: Society Onboarding (Week 3-4)
- [ ] Onboarding request form
- [ ] Review and approval workflow
- [ ] Society creation process
- [ ] Email notifications

### Phase 3: Manager Assignment (Week 5-6)
- [ ] Manager assignment interface
- [ ] Performance tracking
- [ ] Assignment history
- [ ] Bulk operations

### Phase 4: Admin Dashboard (Week 7-8)
- [ ] Dashboard metrics and widgets
- [ ] Real-time updates
- [ ] Advanced filtering
- [ ] Export functionality

### Phase 5: Testing and Polish (Week 9-10)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

## 10. Success Metrics

- **Onboarding Efficiency**: Reduce society onboarding time by 60%
- **Manager Productivity**: Track manager assignment and performance metrics
- **System Health**: 99.9% uptime for admin operations
- **User Satisfaction**: >90% satisfaction score from super admins

## 11. File Structure

```
app/
├── admin/
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   ├── societies/
│   │   ├── index.tsx
│   │   └── [societyId].tsx
│   ├── onboarding/
│   │   ├── index.tsx
│   │   └── [requestId].tsx
│   └── managers/
│       └── index.tsx

components/
├── admin/
│   ├── AdminCard.tsx
│   ├── AdminPermissionGate.tsx
│   ├── DashboardMetrics.tsx
│   ├── ManagerAssignmentForm.tsx
│   ├── OnboardingRequestCard.tsx
│   ├── StatusBadge.tsx
│   └── SuperAdminDashboard.tsx

contexts/
└── SuperAdminContext.tsx

services/
└── admin/
    └── superAdminService.ts

types/
└── admin.ts

utils/
└── adminPermissions.ts

__tests__/
├── admin/
│   └── adminFlow.test.tsx
└── services/
    └── superAdminService.test.ts
```

## Notes for Next Session

1. Start with Phase 1: Database schema and basic setup
2. Review existing admin context and authentication patterns
3. Implement SuperAdminContext with basic CRUD operations
4. Set up admin navigation structure in Expo Router
5. Create basic admin dashboard with placeholder components

This comprehensive plan provides the foundation for implementing a robust admin module that integrates seamlessly with your existing Aptly architecture.