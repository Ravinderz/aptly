import React from "react";
import { ScrollView, View } from "react-native";
import SectionHeading from "./ui/SectionHeading";
import VisitorListCard from "./ui/VisitorListCard";

const UpcomingVisitorSection = () => {
  return (
    <View className="mt-4 mb-8 gap">
      <SectionHeading heading="Upcoming Visitors" />
      <ScrollView
        contentContainerStyle={{
          gap: 14,
          padding: 2,
        }}
      >
        <VisitorListCard />
        {/* <ElevatedButton label="Amazon Delivery" />
        <ElevatedButton label="Blinkit Delivery" />
        <ElevatedButton label="Nishant" />
        <ElevatedButton label="Swiggy Delivery" />
        <ElevatedButton label="Amazon Delivery" /> */}
      </ScrollView>
    </View>
  );
};

export default UpcomingVisitorSection;
