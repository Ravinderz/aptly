import { Tabs } from 'expo-router';
import {
    Building2,
    House,
    PencilRuler,
    Settings2,
    Users2,
} from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  const activeColor = '#6366f1';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarStyle: Platform.select({
          ios: {},
          default: {
            marginBottom: 0,
            elevation: 0,
            height: 70,
          },
        }),
        tabBarTestID: 'nav.tab-bar',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarActiveTintColor: activeColor,
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <House size={18} color={focused ? activeColor : color} />
          ),
          tabBarTestID: 'nav.tab.home',
        }}
      />
      <Tabs.Screen
        name="visitor"
        options={{
          tabBarActiveTintColor: activeColor,
          title: 'Visitors',
          tabBarIcon: ({ focused, color }) => (
            <Users2 size={18} color={focused ? activeColor : color} />
          ),
          tabBarTestID: 'nav.tab.visitor',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarActiveTintColor: activeColor,
          title: 'Community',
          tabBarIcon: ({ focused, color }) => (
            <Building2 size={18} color={focused ? activeColor : color} />
          ),
          tabBarTestID: 'nav.tab.community',
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          tabBarActiveTintColor: activeColor,
          title: 'Services',
          tabBarIcon: ({ focused, color }) => (
            <PencilRuler size={18} color={focused ? activeColor : color} />
          ),
          tabBarTestID: 'nav.tab.services',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarActiveTintColor: activeColor,
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Settings2 size={18} color={focused ? activeColor : color} />
          ),
          tabBarTestID: 'nav.tab.settings',
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}
