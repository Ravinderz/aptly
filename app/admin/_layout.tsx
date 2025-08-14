import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Admin Layout - Navigation structure for admin module
 * 
 * Uses Zustand stores globally - no providers needed
 * Supports nested admin routes with proper screen options
 */
export default function AdminLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="dashboard" 
          options={{
            title: 'Admin Dashboard',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="societies/index" 
          options={{
            title: 'Society Management',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="societies/[societyId]" 
          options={{
            title: 'Society Details',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="onboarding/index" 
          options={{
            title: 'Onboarding Requests',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="onboarding/[requestId]" 
          options={{
            title: 'Review Request',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="managers/index" 
          options={{
            title: 'Manager Assignments',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="analytics/index" 
          options={{
            title: 'Admin Analytics',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="settings/index" 
          options={{
            title: 'Admin Settings',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}