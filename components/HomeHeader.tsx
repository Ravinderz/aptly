import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { IconRenderer } from "./ui/IconRenderer";

const HomeHeader = () => {
  return (
    <View className="flex flex-row justify-between px-8 py-4 bg-[#fed0b5]">
      <Text className="text-2xl font-bold">401</Text>
      <View className="flex flex-row gap-6">
        <TouchableOpacity>
          <IconRenderer
            name="notifications"
            size={28}
            color="black"
            type="material-community"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <IconRenderer
            name="messages"
            size={28}
            color="black"
            type="material-community"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
