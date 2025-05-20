import { IconRenderer } from "@/components/ui/IconRenderer";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const activeColor = "#f89b7c";
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarActiveTintColor: activeColor,
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <IconRenderer
              size={28}
              name="home"
              color={focused ? activeColor : color}
              type="material-community"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="visitor"
        options={{
          tabBarActiveTintColor: activeColor,
          title: "Visitors",
          tabBarIcon: ({ focused, color }) => (
            <IconRenderer
              size={28}
              name="visitor"
              color={focused ? activeColor : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarActiveTintColor: activeColor,
          title: "Community",
          tabBarIcon: ({ focused, color }) => (
            <IconRenderer
              size={28}
              name="community"
              color={focused ? activeColor : color}
              type="material-community"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarActiveTintColor: activeColor,
          title: "Services",
          tabBarIcon: ({ focused, color }) => (
            <IconRenderer
              size={28}
              name="services"
              color={focused ? activeColor : color}
              type="material"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarActiveTintColor: activeColor,
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <IconRenderer
              size={28}
              name="settings"
              color={focused ? activeColor : color}
              type="material"
            />
          ),
        }}
      />
    </Tabs>
  );
}
