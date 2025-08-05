import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { AlertCircle, Lock, Shield } from 'lucide-react-native';
import { useDirectAdmin } from '@/hooks/useDirectAdmin';
import { AdminRole, Permission } from '@/types/admin';

interface PermissionGateProps {
  children: ReactNode;
  resource: string;
  action: string;
  societyId?: string;
  role?: AdminRole[];
  fallback?: ReactNode;
  showFallback?: boolean;
  renderEmpty?: boolean;
}

/**
 * PermissionGate component that conditionally renders children based on user permissions
 *
 * Features:
 * - Resource-action based permission checking
 * - Role-based access control
 * - Society-scoped permissions
 * - Customizable fallback UI
 * - Debug mode for development
 */
const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  resource,
  action,
  societyId,
  role,
  fallback,
  showFallback = true,
  renderEmpty = false,
}) => {
  const { checkPermission, adminUser, currentMode } = useDirectAdmin();

  // Check if user is in admin mode
  if (currentMode !== 'admin') {
    return renderEmpty
      ? null
      : showFallback
        ? fallback || <DefaultFallback type="mode" />
        : null;
  }

  // Check role-based access first
  if (role && adminUser) {
    const hasRole = role.includes(adminUser.role);
    if (!hasRole) {
      return renderEmpty
        ? null
        : showFallback
          ? fallback || <DefaultFallback type="role" requiredRoles={role} />
          : null;
    }
  }

  // Check permission-based access
  const hasPermission = checkPermission(resource, action, societyId);

  if (!hasPermission) {
    return renderEmpty
      ? null
      : showFallback
        ? fallback || (
            <DefaultFallback
              type="permission"
              resource={resource}
              action={action}
            />
          )
        : null;
  }

  return <>{children}</>;
};

interface DefaultFallbackProps {
  type: 'mode' | 'role' | 'permission';
  resource?: string;
  action?: string;
  requiredRoles?: AdminRole[];
}

const DefaultFallback: React.FC<DefaultFallbackProps> = ({
  type,
  resource,
  action,
  requiredRoles,
}) => {
  const getMessage = () => {
    switch (type) {
      case 'mode':
        return 'Admin mode required to view this content';
      case 'role':
        return `Required role: ${requiredRoles?.join(', ') || 'Unknown'}`;
      case 'permission':
        return `Permission required: ${action} ${resource}`;
      default:
        return 'Access denied';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'mode':
        return Shield;
      case 'role':
        return AlertCircle;
      case 'permission':
        return Lock;
      default:
        return AlertCircle;
    }
  };

  const Icon = getIcon();

  return (
    <View className="p-4 bg-surface rounded-xl border border-divider items-center">
      <Icon size={24} className="text-text-secondary mb-2" />
      <Text className="text-body-medium text-text-secondary text-center">
        {getMessage()}
      </Text>
    </View>
  );
};

export default PermissionGate;
