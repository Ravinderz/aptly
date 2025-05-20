import React from "react";
import { View } from "react-native";
import QuickActionTouchableCard from "./ui/QuickActionTouchableCard";
import SectionHeading from "./ui/SectionHeading";

const QuickActions = () => {
  return (
    <View className="flex gap-2">
      <SectionHeading heading="Quick Actions" />
      <View className="flex flex-row gap-4 flex-wrap">
        <QuickActionTouchableCard
          label="Add Visitor"
          icon="bookUser"
          color="#6366f1"
        />
        <QuickActionTouchableCard
          label="Request Service"
          icon="wrench"
          color="#6366f1"
        />
        <QuickActionTouchableCard
          label="Request maintenance"
          icon="briefcaseBusiness"
          color="#6366f1"
        />
        <QuickActionTouchableCard
          label="Raise Compliant"
          icon="phoneCall"
          color="#6366f1"
        />
      </View>
    </View>
  );
};

export default QuickActions;
