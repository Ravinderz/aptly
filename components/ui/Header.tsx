import React, { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { TabHeader } from "./headers";

interface HeaderProps {
  children: ReactNode;
  onNotificationPress?: () => void;
  onHelpPress?: () => void;
  notificationCount?: number;
}

const Header = ({ 
  children, 
  onNotificationPress, 
  onHelpPress, 
  notificationCount = 3 // Mock notification count - replace with real data
}: HeaderProps) => {
  const handleNotificationPress = () => {
    console.log("Opening notifications...");
    onNotificationPress?.();
    // TODO: Navigate to notifications page
  };

  const handleHelpPress = () => {
    console.log("Opening help...");
    onHelpPress?.();
    // TODO: Open help modal or navigate to help page
  };

  return (
    <View className="flex flex-1">
      <TabHeader 
        onNotificationPress={handleNotificationPress}
        onHelpPress={handleHelpPress}
        notificationCount={notificationCount}
      />
      <ScrollView
        className="flex flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex h-full px-4 py-4 mb-8 bg-background">
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

export default Header;
