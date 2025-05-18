import React from "react";
import { Text, View } from "react-native";
import QuickActionButton from "./ui/QuickActionButton";

const QuickActions = () => {
  return (
    <View className="flex gap-2">
      <View className="flex flex-row justify-between items-center pb-6">
        <Text className="text-xl font-bold">Quick Actions</Text>
        <Text className="font-bold color-blue-800">View All</Text>
      </View>
      <View className="flex flex-row gap-4 flex-wrap">
        <QuickActionButton label="Add Visitor" />
        <QuickActionButton label="Request Service" />
        <QuickActionButton label="Request maintenance" />
        <QuickActionButton label="Raise Compliant" />
      </View>
    </View>
  );
};

export default QuickActions;
