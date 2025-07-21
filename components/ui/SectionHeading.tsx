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
    <View className="flex flex-row justify-between items-center pb-2">
      <Text className="text-headline-large font-semibold text-text-primary">{heading}</Text>
      <LinkButton label="View All" handleViewAll={handleViewAll} />
    </View>
  );
};

export default SectionHeading;
