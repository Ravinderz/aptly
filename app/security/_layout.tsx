import React from 'react';
import { View, Text } from 'react-native';
import { Slot } from 'expo-router';
import { RequireSecurityGuard } from '@/components/auth/RoleGuard';

/**
 * Security Guard Layout
 * 
 * Features:
 * - Role-based access control for security guards only
 * - Foundation for security guard module
 * - Prepared for Phase 2 implementation
 */
const SecurityLayout = () => {
  return (
    <RequireSecurityGuard>
      <View className="flex-1">
        <Slot />
      </View>
    </RequireSecurityGuard>
  );
};

SecurityLayout.displayName = 'SecurityLayout';

export default SecurityLayout;