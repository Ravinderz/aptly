import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LucideIcons from "./LucideIcons";

const QuickActionTouchableCard = ({
  label,
  icon,
  color,
}: {
  label: string;
  icon: "userPlus" | "bookUser" | "wrench" | "phoneCall" | "briefcaseBusiness";
  color?: string;
}) => {
  return (
    <TouchableOpacity className="h-28 w-52 flex items-center justify-center rounded-lg bg-white border border-border-color ">
      <View className="flex gap-2 items-center">
        <View className="rounded-3xl p-3 bg-primary/10">
          <LucideIcons name={icon} size={28} color={color} />
        </View>
        <Text className="font-bold">{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default QuickActionTouchableCard;
