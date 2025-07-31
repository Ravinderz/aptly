import { Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[billId]" options={{ headerShown: false }} />
      <Stack.Screen name="analytics" options={{ headerShown: false }} />
      <Stack.Screen name="mobile-recharge" options={{ headerShown: false }} />
      <Stack.Screen name="gas-recharge" options={{ headerShown: false }} />
      <Stack.Screen
        name="electricity-recharge"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="broadband-recharge"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name="payment-success" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="auto-pay" options={{ headerShown: false }} />
      <Stack.Screen name="cylinder-booking" options={{ headerShown: false }} />
      <Stack.Screen name="dishtv-recharge" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
