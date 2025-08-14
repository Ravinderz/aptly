import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[requestId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="common-area/create"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="common-area/[requestId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default _layout;
