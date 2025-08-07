import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';

/**
 * Visitor Management Layout
 * 
 * Features:
 * - Navigation structure for visitor management
 * - Foundation for visitor check-in/out workflows
 * - Security access already protected by parent security layout
 */
const VisitorManagementLayout = () => {
  return (
    <View className="flex-1">
      <Slot />
    </View>
  );
};

VisitorManagementLayout.displayName = 'VisitorManagementLayout';

export default VisitorManagementLayout;