import React from "react";
import { Text, TouchableOpacity } from "react-native";

const LinkButton = ({ label }: { label: string }) => {
  return (
    <TouchableOpacity>
      <Text className="font-bold color-blue-800">{label}</Text>
    </TouchableOpacity>
  );
};

export default LinkButton;
