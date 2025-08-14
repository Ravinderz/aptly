import { Stack } from 'expo-router';

function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="support/index" options={{ headerShown: false }} />
      <Stack.Screen name="reports/index" options={{ headerShown: false }} />
      <Stack.Screen name="societies/index" options={{ headerShown: false }} />
      <Stack.Screen name="societies/[societyId]/index" options={{ headerShown: false }} />
    </Stack>
  );
}

// Add proper named export with displayName for React DevTools
ManagerLayout.displayName = 'ManagerLayout';

export default ManagerLayout;