import { StackHeader } from "@/components/ui/headers";
import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="addVisitor"
        options={{
          headerShown: true,
          header: (props) => (
            <StackHeader
              title="Add Visitor"
              subtitle="Register new visitor for entry approval"
              showBackButton={true}
              contentSpacing={false}
            />
          ),
        }}
      />
      <Stack.Screen
        name="visitorList"
        options={({ route, navigation }) => ({
          headerShown: true,
          header: (props: any) => (
            <StackHeader
              title={(route.params as { title?: string })?.title || "View All"}
              subtitle="Manage visitor entries and approvals"
              showBackButton={true}
              contentSpacing={false}
            />
          ),
        })}
      />
    </Stack>
  );
};

export default _layout;
