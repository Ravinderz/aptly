import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "@/contexts/AuthContext";
import AppNavigator from "@/components/AppNavigator";
import { useAlert } from "@/components/ui/AlertCard";
import { setGlobalAlertHandler } from "@/utils/alert";
import { useEffect } from "react";
import "./globals.css";

export default function RootLayout() {
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    setGlobalAlertHandler(showAlert);
  }, [showAlert]);

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </AppNavigator>
        {AlertComponent}
      </SafeAreaView>
    </AuthProvider>
  );
}
