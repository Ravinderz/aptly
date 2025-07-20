import React from "react";
import { Text, TouchableOpacity } from "react-native";

const PillFilter = ({ label }: { label: string }) => {
  return (
    <TouchableOpacity className="bg-primary/10 px-4 py-2 rounded-full mb-2">
      <Text className="text-md font-semibold text-primary">{label}</Text>
    </TouchableOpacity>
  );
};

export default PillFilter;
