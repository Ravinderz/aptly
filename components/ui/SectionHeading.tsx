import React from "react";
import { Text, View } from "react-native";
import LinkButton from "./LinkButton";

const SectionHeading = ({
  heading,
  handleViewAll,
}: {
  heading: string;
  handleViewAll: () => void;
}) => {
  return (
    <View className="flex flex-row justify-between items-center pb-3">
      <Text className="text-lg font-semibold">{heading}</Text>
      <LinkButton label="View All" handleViewAll={handleViewAll} />
    </View>
  );
};

export default SectionHeading;
