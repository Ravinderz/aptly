import React from "react";
import { Text, TouchableOpacity } from "react-native";

const LinkButton = ({ label }: { label: string }) => {
  return (
    <TouchableOpacity>
      <Text className="text-md font-semibold text-primary">{label}</Text>
    </TouchableOpacity>
  );
};

export default LinkButton;
