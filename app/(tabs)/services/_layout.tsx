import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="maintenance/index" options={{ headerShown: false }} />
      <Stack.Screen name="maintenance/create" options={{ headerShown: false }} />
      <Stack.Screen name="maintenance/common-area/create" options={{ headerShown: false }} />
      <Stack.Screen name="maintenance/common-area/[requestId]" options={{ headerShown: false }} />
      <Stack.Screen name="billing/index" options={{ headerShown: false }} />
      <Stack.Screen name="billing/[billId]" options={{ headerShown: false }} />
      <Stack.Screen name="billing/analytics" options={{ headerShown: false }} />
      <Stack.Screen name="vendors/index" options={{ headerShown: false }} />
      <Stack.Screen name="vendors/[category]" options={{ headerShown: false }} />
      <Stack.Screen name="vendors/[category]/[vendorId]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
