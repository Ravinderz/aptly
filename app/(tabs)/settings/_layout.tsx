import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="personal-details" options={{ headerShown: false }} />
      <Stack.Screen name="family-members" options={{ headerShown: false }} />
      <Stack.Screen name="vehicles" options={{ headerShown: false }} />
      <Stack.Screen name="documents" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen
        name="emergency-contacts"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="governance-settings"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="analytics-settings"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default _layout;
