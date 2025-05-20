import React from "react";
import { Text, View } from "react-native";
import LinkButton from "./LinkButton";

const SectionHeading = ({ heading }: { heading: string }) => {
  return (
    <View className="flex flex-row justify-between items-center pb-6">
      <Text className="text-xl font-semibold">{heading}</Text>
      <LinkButton label="View All" />
    </View>
  );
};

export default SectionHeading;
