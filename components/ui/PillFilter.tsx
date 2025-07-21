import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { CategoryType } from "@/types/community";

interface PillFilterProps {
  label: string;
  category: CategoryType;
  isActive: boolean;
  count?: number;
  onPress: (category: CategoryType) => void;
}

const PillFilter: React.FC<PillFilterProps> = ({ label, category, isActive, count, onPress }) => {
  const handlePress = () => {
    onPress(category);
  };
  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={`px-4 py-3 rounded-full border ${
        isActive 
          ? "bg-primary border-primary" 
          : "bg-background border-divider"
      }`}
      activeOpacity={0.7}
    >
      <Text className={`font-medium text-sm ${
        isActive ? "text-white" : "text-text-secondary"
      }`}>
        {label}{count !== undefined ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default PillFilter;
