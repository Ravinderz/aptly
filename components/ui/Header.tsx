import React, { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import HomeHeader from "../HomeHeader";

const Header = ({ children }: { children: ReactNode }) => {
  return (
    <View className="flex flex-1 bg-[#fed0b5] border-t-2 border-[#d59f7e]">
      <HomeHeader />
      <ScrollView
        className="flex flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
      >
        <View className="flex h-full p-4 rounded-t-3xl bg-[#fff5ee] mb-8">
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

export default Header;
