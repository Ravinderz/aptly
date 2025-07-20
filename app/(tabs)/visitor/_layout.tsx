import AptlyStackHeader from "@/components/ui/AptlyStackHeader";
import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="addVisitor"
        options={{
          headerShown: true, // Show header specifically for this screen
          header: (props) => (
            <AptlyStackHeader
              title="Add Visitor"
              height={20} // Set your desired height here
              tintColor="#f89b7c"
              // You can pass other props like showBackButton={false} if needed
            />
          ),
        }}
      />
      <Stack.Screen
        name="visitorList"
        options={({ route, navigation }) => ({
          headerShown: true, // Show header specifically for this screen
          header: (props: any) => (
            <AptlyStackHeader
              title={(route.params as { title?: string })?.title || "View All"}
              height={20} // Set your desired height here
              tintColor="#f89b7c"
              // You can pass other props like showBackButton={false} if needed
            />
          ),
        })}
      />
    </Stack>
  );
};

export default _layout;
