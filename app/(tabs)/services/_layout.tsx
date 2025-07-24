import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="analytics/index" options={{ headerShown: false }} />
      <Stack.Screen name="billing" options={{ headerShown: false }} />
      <Stack.Screen name="governance/index" options={{ headerShown: false }} />
      <Stack.Screen name="maintenance" options={{ headerShown: false }} />
      <Stack.Screen name="vendors" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
