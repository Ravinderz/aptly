import { Clock } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { cn } from "../../utils/cn";

const VisitorListCard = () => {
  return (
    <View className={cn(
      "bg-surface border border-divider rounded-xl p-4 flex-1",
      "shadow-sm shadow-black/5"
    )}>
      <View className="flex flex-row justify-between items-center">
        <Text className="text-md font-medium text-text-primary">Delivery - Amazon</Text>
        <Text className="text-sm text-center text-primary px-3 py-1 bg-primary/10 rounded-full">
          Expected
        </Text>
      </View>
      <View className="flex flex-row gap-2 items-center mt-1">
        <Clock size={14} color="#757575" strokeWidth={2} />
        <Text className="text-sm text-text-secondary">Today, 2: 30 PM</Text>
      </View>
      <View className="flex flex-row gap-2 items-center justify-between mt-3">
        <View className="flex-1">
          <TouchableOpacity className="py-3 bg-primary rounded-lg w-full">
            <Text className="text-sm font-semibold text-white text-center">
              Pre-approve
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1">
          <TouchableOpacity className="py-3 rounded-lg border border-divider w-full flex-1">
            <Text className="text-sm font-semibold text-text-secondary text-center">
              Deny
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VisitorListCard;
