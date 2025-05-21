import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import QuickActionTouchableCard from "./ui/QuickActionTouchableCard";
import SectionHeading from "./ui/SectionHeading";

const QuickActions = () => {
  const router = useRouter();

  const handleQuickActionPress = (action: string) => {
    console.log("handleQuickActionPress", action);
    // Handle the quick action press here
    // For example, navigate to a different screen or perform an action
    router.push({
      pathname: "/(tabs)/visitor/addVisitor",
      params: { action: action },
    });
  };

  return (
    <View className="flex gap-2">
      <SectionHeading heading="Quick Actions" handleViewAll={() => {}} />
      <View className="flex flex-row gap-4">
        <View className="flex-1">
          <QuickActionTouchableCard
            label="Add Visitor"
            icon="bookUser"
            color="#6366f1"
            onPress={() => handleQuickActionPress("Add Visitor")}
          />
        </View>
        <View className="flex-1">
          <QuickActionTouchableCard
            label="Request Service"
            icon="wrench"
            color="#6366f1"
          />
        </View>
      </View>
      <View className="flex flex-row gap-4">
        <View className="flex-1">
          <QuickActionTouchableCard
            label="Request maintenance"
            icon="briefcaseBusiness"
            color="#6366f1"
          />
        </View>
        <View className="flex-1">
          <QuickActionTouchableCard
            label="Raise Compliant"
            icon="phoneCall"
            color="#6366f1"
          />
        </View>
      </View>
    </View>
  );
};

export default QuickActions;
