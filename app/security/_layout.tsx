import React from 'react';
import { View, Text } from 'react-native';
import { Slot } from 'expo-router';
import { RequireSecurityGuard } from '@/components/auth/RoleGuard';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

/**
 * Security Guard Layout
 * 
 * Features:
 * - Role-based access control for security guards only
 * - Error boundary protection for auth component issues
 * - Foundation for security guard module
 * - Prepared for Phase 2 implementation
 */
const SecurityLayout = () => {
  return (
    <AuthErrorBoundary>
      <RequireSecurityGuard>
        <View className="flex-1">
          <Slot />
        </View>
      </RequireSecurityGuard>
    </AuthErrorBoundary>
  );
};

SecurityLayout.displayName = 'SecurityLayout';

export default SecurityLayout;