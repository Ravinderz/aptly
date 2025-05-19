import Header from "@/components/ui/Header";
import { IconRenderer } from "@/components/ui/IconRenderer";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const visitor = () => {
  return (
    <Header>
      <View className="my-6">
        <TouchableOpacity className="flex flex-row gap-2 justify-center items-center bg-[#fed0b5] h-20 rounded-xl p-4 border-2 border-[#d59f7e]">
          <IconRenderer name="add" size={32} color="black" />
          <Text className="text-lg font-bold">Add Visitor</Text>
        </TouchableOpacity>
      </View>
      <View></View>
    </Header>
  );
};

export default visitor;
