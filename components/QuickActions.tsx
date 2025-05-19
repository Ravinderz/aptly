import React from "react";
import { View } from "react-native";
import QuickActionButton from "./ui/QuickActionButton";
import SectionHeading from "./ui/SectionHeading";

const QuickActions = () => {
  return (
    <View className="flex gap-2">
      <SectionHeading heading="Quick Actions" />
      <View className="flex flex-row gap-4 flex-wrap">
        <QuickActionButton label="Add Visitor" icon="visitor-add" />
        <QuickActionButton label="Request Service" icon="service-add" />
        <QuickActionButton label="Request maintenance" icon="maintenance-add" />
        <QuickActionButton label="Raise Compliant" icon="compliant-add" />
      </View>
    </View>
  );
};

export default QuickActions;
