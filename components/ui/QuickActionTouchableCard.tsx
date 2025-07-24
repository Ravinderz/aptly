import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LucideIcons from "@/components/ui/LucideIcons";
import { cn } from "@/utils/cn";

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
      className={cn(
        "h-28 flex items-center justify-center rounded-xl bg-surface border border-divider w-full",
        "shadow-sm shadow-black/5"
      )}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex gap-2 items-center">
        <View className="rounded-3xl p-3 bg-primary/10">
          <LucideIcons name={icon} size={28} color={color || "#6366f1"} />
        </View>
        <Text className="text-sm font-semibold text-text-primary">{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default QuickActionTouchableCard;
