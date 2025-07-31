// Phase 7: Sub-Admin System & Multi-Society Support - Component Exports

// Core Admin Components (Phase 6)
export { AdminDashboard } from './AdminDashboard';
export { AdminHeader, SimpleAdminHeader } from './AdminHeader';
export { AdminNavigation, QuickAdminNav } from './AdminNavigation';
export {
  AdminLayout,
  AdminDashboardLayout,
  AdminFormLayout,
  AdminListLayout,
} from './AdminLayout';
export { ModeToggle, HeaderModeIndicator } from './ModeToggle';

// Phase 7: Multi-Society Components
export { default as SocietySelector } from './SocietySelector';
export { default as MultiSocietyDashboard } from './MultiSocietyDashboard';

// Phase 7: Role-Specific Components
export { default as FinancialManager } from './FinancialManager';
export { default as SecurityAdmin } from './SecurityAdmin';

// Phase 7: Permission & Role-Based Components
export { default as PermissionGate } from './PermissionGate';
export {
  default as RoleBasedRenderer,
  RoleVariants,
  ConditionalRender,
  SuperAdminOnly,
  CommunityManagerUp,
  SubAdminOnly,
  withRoleContext,
  PermissionButton,
  RoleBadge,
  EscalationPath,
  MultiSocietyRole,
} from './RoleBasedRenderer';

// Phase 7: Adaptive Layout & Navigation
export { default as AdaptiveAdminLayout } from './AdaptiveAdminLayout';
export { default as DynamicNavigation } from './DynamicNavigation';

// Enhanced Widget Components (Phase 6 + Phase 7)
export {
  StatWidget,
  ProgressWidget,
  QuickActionWidget,
  AlertWidget,
  SummaryCard,
  MultiSocietyComparison,
  SocietySelectorWidget,
  CrossSocietyAlert,
  MultiSocietyPerformance,
  default as DashboardWidgets,
} from './DashboardWidgets';

// Context and Utilities
export { useAdmin } from '@/contexts/AdminContext';
export { useSociety } from '@/contexts/SocietyContext';
export { adminTheme, adminStyles } from '@/utils/adminTheme';

// Type Exports for convenience
export type { AdminRole, Permission, Society, AdminUser } from '@/types/admin';

// Component Categories for organized imports
export const Phase7Components = {
  // Multi-Society Management
  SocietySelector,
  MultiSocietyDashboard,
  MultiSocietyComparison,
  SocietySelectorWidget,
  CrossSocietyAlert,
  MultiSocietyPerformance,

  // Role-Specific Dashboards
  FinancialManager,
  SecurityAdmin,

  // Permission-Based UI
  PermissionGate,
  RoleBasedRenderer,
  RoleVariants,
  ConditionalRender,
  SuperAdminOnly,
  CommunityManagerUp,
  SubAdminOnly,
  RoleBadge,
  EscalationPath,
  MultiSocietyRole,

  // Adaptive Layouts
  AdaptiveAdminLayout,
  DynamicNavigation,

  // Utility Components
  PermissionButton,
  withRoleContext,
};

// Quick Access Categories
export const MultiSocietyComponents = {
  SocietySelector,
  MultiSocietyDashboard,
  MultiSocietyComparison,
  SocietySelectorWidget,
  CrossSocietyAlert,
  MultiSocietyPerformance,
};

export const RoleComponents = {
  FinancialManager,
  SecurityAdmin,
  PermissionGate,
  RoleBasedRenderer,
  RoleVariants,
  RoleBadge,
  EscalationPath,
  SuperAdminOnly,
  CommunityManagerUp,
  SubAdminOnly,
};
