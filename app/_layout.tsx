import { Stack } from "expo-router";
import { useState } from "react";

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
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
