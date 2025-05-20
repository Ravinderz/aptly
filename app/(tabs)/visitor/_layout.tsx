import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "grey" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="addVisitor"
        options={{
          title: "Add Visitor",
          headerTitleAlign: "center",
          headerTitleStyle: { fontSize: 20 },
          headerTintColor: "#f89b7c",
          headerStyle: { backgroundColor: "grey" },
        }}
      />
    </Stack>
  );
};

export default _layout;
