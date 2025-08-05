import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { AdminRole } from '@/types/admin';

interface RoleBasedRendererProps {
  children: ReactNode;
  roles: AdminRole[];
  mode?: 'include' | 'exclude';
  fallback?: ReactNode;
  showFallback?: boolean;
}

interface RoleVariantProps {
  [key: string]: ReactNode;
  default?: ReactNode;
}

interface ConditionalRenderProps {
  children: ReactNode;
  condition: (role: AdminRole) => boolean;
  fallback?: ReactNode;
}

/**
 * RoleBasedRenderer - Renders content based on user roles
 */
export const RoleBasedRenderer: React.FC<RoleBasedRendererProps> = ({
  children,
  roles,
  mode = 'include',
  fallback,
  showFallback = false,
}) => {
  const { adminUser, currentMode } = useDirectAdmin();

  if (currentMode !== 'admin' || !adminUser) {
    return showFallback ? fallback || null : null;
  }

  const userRole = adminUser.role;
  const hasAccess =
    mode === 'include' ? roles.includes(userRole) : !roles.includes(userRole);

  if (!hasAccess) {
    return showFallback ? fallback || null : null;
  }

  return <>{children}</>;
};

/**
 * RoleVariants - Renders different content based on specific roles
 */
export const RoleVariants: React.FC<RoleVariantProps> = (props) => {
  const { adminUser, currentMode } = useDirectAdmin();
  const { default: defaultContent, ...roleContent } = props;

  if (currentMode !== 'admin' || !adminUser) {
    return defaultContent ? <>{defaultContent}</> : null;
  }

  const userRole = adminUser.role;
  const content = roleContent[userRole] || defaultContent;

  return content ? <>{content}</> : null;
};

/**
 * ConditionalRender - Renders content based on a condition function
 */
export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  condition,
  fallback,
}) => {
  const { adminUser, currentMode } = useDirectAdmin();

  if (currentMode !== 'admin' || !adminUser) {
    return fallback ? <>{fallback}</> : null;
  }

  const shouldRender = condition(adminUser.role);
  return shouldRender ? <>{children}</> : fallback ? <>{fallback}</> : null;
};

/**
 * SuperAdminOnly - Convenience component for super admin content
 */
export const SuperAdminOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <RoleBasedRenderer roles={['super_admin']} fallback={fallback}>
    {children}
  </RoleBasedRenderer>
);

/**
 * CommunityManagerUp - Content for community manager and above
 */
export const CommunityManagerUp: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <RoleBasedRenderer
    roles={['community_manager', 'super_admin']}
    fallback={fallback}>
    {children}
  </RoleBasedRenderer>
);

/**
 * SubAdminOnly - Content for sub-admin roles only
 */
export const SubAdminOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <RoleBasedRenderer
    roles={['financial_manager', 'security_admin', 'maintenance_admin']}
    fallback={fallback}>
    {children}
  </RoleBasedRenderer>
);

/**
 * RoleAwareComponent - Higher-order component that provides role context
 */
export const withRoleContext = <P extends object>(
  Component: React.ComponentType<P & { userRole: AdminRole; isAdmin: boolean }>,
) => {
  return (props: P) => {
    const { adminUser, currentMode } = useDirectAdmin();

    return (
      <Component
        {...props}
        userRole={adminUser?.role || 'maintenance_admin'}
        isAdmin={currentMode === 'admin' && !!adminUser}
      />
    );
  };
};

/**
 * Permission-aware button component
 */
interface PermissionButtonProps {
  onPress: () => void;
  title: string;
  resource: string;
  action: string;
  roles?: AdminRole[];
  className?: string;
  children?: ReactNode;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  onPress,
  title,
  resource,
  action,
  roles,
  className = '',
  children,
}) => {
  const { checkPermission, adminUser } = useDirectAdmin();

  // Check role requirements
  if (roles && adminUser && !roles.includes(adminUser.role)) {
    return null;
  }

  // Check permission requirements
  if (!checkPermission(resource, action)) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`py-3 px-4 bg-primary rounded-lg ${className}`}
      activeOpacity={0.8}>
      {children || (
        <Text className="text-white font-medium text-center">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Role badge component
 */
interface RoleBadgeProps {
  role?: AdminRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = true,
}) => {
  const { adminUser } = useDirectAdmin();
  const displayRole = role || adminUser?.role;

  if (!displayRole) return null;

  const getRoleConfig = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return {
          label: 'Super Admin',
          color: 'bg-red-100 text-red-600 border-red-200',
          icon: '👑',
        };
      case 'community_manager':
        return {
          label: 'Community Manager',
          color: 'bg-blue-100 text-blue-600 border-blue-200',
          icon: '🏢',
        };
      case 'financial_manager':
        return {
          label: 'Financial Manager',
          color: 'bg-green-100 text-green-600 border-green-200',
          icon: '💰',
        };
      case 'security_admin':
        return {
          label: 'Security Admin',
          color: 'bg-orange-100 text-orange-600 border-orange-200',
          icon: '🛡️',
        };
      case 'maintenance_admin':
        return {
          label: 'Maintenance Admin',
          color: 'bg-purple-100 text-purple-600 border-purple-200',
          icon: '🔧',
        };
      default:
        return {
          label: 'Admin',
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: '👤',
        };
    }
  };

  const config = getRoleConfig(displayRole);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <View
      className={`inline-flex flex-row items-center rounded-full border ${config.color} ${sizeClasses[size]}`}>
      {showIcon && <Text className="mr-1">{config.icon}</Text>}
      <Text className={`font-medium ${config.color.split(' ')[1]}`}>
        {config.label}
      </Text>
    </View>
  );
};

/**
 * Escalation path component
 */
interface EscalationPathProps {
  issue: string;
  currentRole?: AdminRole;
}

export const EscalationPath: React.FC<EscalationPathProps> = ({
  issue,
  currentRole,
}) => {
  const { getEscalationPath, adminUser } = useDirectAdmin();
  const role = currentRole || adminUser?.role;

  if (!role) return null;

  const escalationRoles = getEscalationPath(issue);

  if (escalationRoles.length === 0) {
    return (
      <View className="p-3 bg-green-50 rounded-lg border border-green-200">
        <Text className="text-green-600 text-sm font-medium">
          ✅ You have the highest authority for this issue
        </Text>
      </View>
    );
  }

  return (
    <View className="p-3 bg-orange-50 rounded-lg border border-orange-200">
      <Text className="text-orange-600 text-sm font-medium mb-2">
        Escalation Path:
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {escalationRoles.map((escalationRole, index) => (
          <View key={escalationRole} className="flex-row items-center">
            <RoleBadge role={escalationRole} size="sm" />
            {index < escalationRoles.length - 1 && (
              <Text className="text-orange-400 mx-2">→</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Multi-society role indicator
 */
interface MultiSocietyRoleProps {
  societyId?: string;
}

export const MultiSocietyRole: React.FC<MultiSocietyRoleProps> = ({
  societyId,
}) => {
  const { adminUser, activeSociety } = useDirectAdmin();

  if (!adminUser) return null;

  const targetSocietyId = societyId || activeSociety?.id;
  // Note: AdminUser.assignedSocieties is an array of IDs, not objects
  const hasAccessToSociety = adminUser.assignedSocieties.includes(targetSocietyId || '');

  if (!hasAccessToSociety) return null;

  return (
    <View className="flex-row items-center">
      <RoleBadge role={adminUser.role} size="sm" />
      {adminUser.assignedSocieties.length > 1 && (
        <Text className="text-text-secondary text-xs ml-2">
          in {activeSociety?.name || 'Current Society'}
        </Text>
      )}
    </View>
  );
};

export default RoleBasedRenderer;
