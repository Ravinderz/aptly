import React from "react";
import { ScrollView, View } from "react-native";
import ElevatedButton from "./ui/ElevatedButton";
import SectionHeading from "./ui/SectionHeading";

const VisitorHorizontalScrollSection = () => {
  return (
    <View className="mt-4 mb-8 flex gap">
      <SectionHeading heading="Visitors" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 14,
          padding: 2,
        }}
      >
        <ElevatedButton label="Amazon Delivery" />
        <ElevatedButton label="Blinkit Delivery" />
        <ElevatedButton label="Nishant" />
        <ElevatedButton label="Swiggy Delivery" />
        <ElevatedButton label="Amazon Delivery" />
      </ScrollView>
    </View>
  );
};

export default VisitorHorizontalScrollSection;
