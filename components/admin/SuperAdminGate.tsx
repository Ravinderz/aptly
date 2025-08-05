import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useDirectAuth } from '@/hooks/useDirectAuth';
import { Button } from '@/components/ui/Button';

interface SuperAdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireRole?: 'super_admin' | 'admin' | 'community_manager';
}

/**
 * SuperAdminGate - Access control for admin features
 * 
 * Features:
 * - Role-based access control
 * - Custom fallback UI
 * - Automatic redirection
 */
export const SuperAdminGate: React.FC<SuperAdminGateProps> = ({
  children,
  fallback,
  requireRole = 'super_admin',
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useDirectAuth();

  if (!isAuthenticated || !user) {
    return fallback || (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Shield size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Authentication Required
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Please sign in to access this area.
        </Text>
        <Button
          title="Sign In"
          onPress={() => router.replace('/auth/phone-registration')}
          variant="primary"
          className="mt-6"
        />
      </View>
    );
  }

  // Check role permissions
  const hasRequiredRole = () => {
    switch (requireRole) {
      case 'super_admin':
        return user.role === 'super_admin';
      case 'admin':
        return ['super_admin', 'admin'].includes(user.role);
      case 'community_manager':
        return ['super_admin', 'admin', 'community_manager'].includes(user.role);
      default:
        return false;
    }
  };

  if (!hasRequiredRole()) {
    return fallback || (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Shield size={48} color="#6b7280" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 text-center">
          Access Denied
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          {requireRole === 'super_admin' 
            ? 'Super admin privileges required to access this area.'
            : `${requireRole.replace('_', ' ')} role or higher required.`
          }
        </Text>
        <Text className="text-sm text-gray-500 text-center mt-1">
          Current role: {user.role?.replace('_', ' ') || 'user'}
        </Text>
        <Button
          title="Return to Dashboard"
          onPress={() => router.replace('/(tabs)/')}
          variant="primary"
          className="mt-6"
        />
      </View>
    );
  }

  return <>{children}</>;
};