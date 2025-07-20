import React, { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import HomeHeader from "../HomeHeader";

const Header = ({ children }: { children: ReactNode }) => {
  return (
    <View className="flex flex-1">
      <HomeHeader />
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
