import React from "react";
import { ScrollView, Text, View } from "react-native";
import ElevatedButton from "./ui/ElevatedButton";

const VisitorHorizontalScrollSection = () => {
  return (
    <View className="mt-4 mb-8 flex gap-8">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-xl font-bold">Visitor Section</Text>
        <Text className="font-bold color-blue-800">View All</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 14,
          padding: 2,
        }}
        scrollEventThrottle={16}
        alwaysBounceHorizontal
      >
        <ElevatedButton label="Add Visitor" />
        <ElevatedButton label="Amazon Delivery" />
      </ScrollView>
    </View>
  );
};

export default VisitorHorizontalScrollSection;
