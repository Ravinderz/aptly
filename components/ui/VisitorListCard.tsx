import { Clock } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const VisitorListCard = () => {
  return (
    <View className="bg-white border border-border-color rounded-lg p-4 elevation-sm flex-1">
      <View className="flex flex-row justify-between items-center">
        <Text className="text-lg font-medium">Delivery - Amazon</Text>
        <Text className="text-md text-center text-primary px-3 py-1 bg-primary/10 rounded-full">
          Expected
        </Text>
      </View>
      <View className="flex flex-row gap-2 items-center mt-1">
        <Clock size={22} color="#6b7280" strokeWidth={2} />
        <Text className="text-md text-gray-500">Today, 2: 30 PM</Text>
      </View>
      <View className="flex flex-row space-x-2 gap-4 mt-3">
        <TouchableOpacity className="py-3 bg-primary rounded-lg w-48">
          <Text className="text-md font-semibold text-white text-center">
            Pre-approve
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 rounded-lg border border-border-color w-48">
          <Text className="text-md font-semibold text-grey-500 text-center">
            Deny
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VisitorListCard;
