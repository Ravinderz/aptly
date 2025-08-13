import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {/* Phone and OTP Verification */}
      <Stack.Screen name="phone-registration" />
      <Stack.Screen name="email-registration" />
      <Stack.Screen name="otp-verification" />

      {/* Society Onboarding Flow */}
      <Stack.Screen name="society-onboarding" />
      <Stack.Screen name="society-search-flow" />
      <Stack.Screen name="society-details-form" />
      <Stack.Screen name="society-completion" />

      {/* Legacy screens (kept for backward compatibility) */}
      <Stack.Screen name="society-verification" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
