import React from "react";
import { Text, TouchableOpacity } from "react-native";

const LinkButton = ({
  label,
  handleViewAll,
}: {
  label: string;
  handleViewAll: () => void;
}) => {
  return (
    <TouchableOpacity onPress={handleViewAll}>
      <Text className="text-sm font-semibold text-primary">{label}</Text>
    </TouchableOpacity>
  );
};

export default LinkButton;
