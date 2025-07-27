import AppNavigator from "@/components/AppNavigator";
import { useAlert } from "@/components/ui/AlertCard";
import { AuthProvider } from "@/contexts/AuthContext";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { setGlobalAlertHandler } from "@/utils/alert";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    setGlobalAlertHandler(showAlert);
  }, [showAlert]);

  return (
    <FeatureFlagProvider environment={__DEV__ ? 'development' : 'production'}>
      <AuthProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <AppNavigator>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="notifications" 
                options={{ 
                  headerShown: false,
                  presentation: 'modal' // This makes it feel like a modal that can be dismissed
                }} 
              />
            </Stack>
          </AppNavigator>
          {AlertComponent}
        </SafeAreaView>
      </AuthProvider>
    </FeatureFlagProvider>
  );
}
