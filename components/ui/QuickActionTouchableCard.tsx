import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LucideIcons from "./LucideIcons";

const QuickActionTouchableCard = ({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: "userPlus" | "bookUser" | "wrench" | "phoneCall" | "briefcaseBusiness";
  color?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      className="h-28 flex items-center justify-center rounded-lg bg-white border border-border-color w-full"
      onPress={onPress}
      activeOpacity={0.3}
    >
      <View className="flex gap-2 items-center">
        <View className="rounded-3xl p-3 bg-primary/10">
          <LucideIcons name={icon} size={28} color={color} />
        </View>
        <Text className="text-sm font-semibold">{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default QuickActionTouchableCard;
