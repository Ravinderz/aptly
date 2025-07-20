import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  const [firstLaunch, setFirstLaunch] = useState(true);
  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     const isFirstLaunch = await SecureStore.getItemAsync("firstLaunch");
  //     if (isFirstLaunch !== "false") {
  //       setFirstLaunch(true);
  //       SecureStore.setItemAsync("firstLaunch", "true");
  //     } else {
  //       setFirstLaunch(false);
  //     }
  //   };
  //   checkFirstLaunch();
  // }, []);

  // return  firstLaunch ? <Onboarding /> : <Tabs />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}
