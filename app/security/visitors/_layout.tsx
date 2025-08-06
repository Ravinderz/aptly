import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { RequireSecurityGuard } from '@/components/auth/RoleGuard';

/**
 * Visitor Management Layout
 * 
 * Features:
 * - Role-based access control for security guards
 * - Navigation structure for visitor management
 * - Foundation for visitor check-in/out workflows
 */
const VisitorManagementLayout: React.FC = () => {
  return (
    <RequireSecurityGuard>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </RequireSecurityGuard>
  );
};

VisitorManagementLayout.displayName = 'VisitorManagementLayout';

export default VisitorManagementLayout;