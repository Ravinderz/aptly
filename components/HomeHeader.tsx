import { MapPinHouse } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { IconRenderer } from "./ui/IconRenderer";

const HomeHeader = () => {
  return (
    <View className="flex flex-row justify-between px-6 py-4 bg-white border-b border-border-color elevation-sm z-10">
      <View className="flex flex-row gap-3 items-center">
        <MapPinHouse size={18} color="#4b5563" strokeWidth={2} />
        <Text className="font-medium text-lg text-primary">Flat #401</Text>
      </View>

      <View className="flex flex-row gap-5">
        <TouchableOpacity>
          <IconRenderer
            name="notifications"
            size={18}
            color="#4b5563"
            type="material-community"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <IconRenderer
            name="messages"
            size={18}
            color="#4b5563"
            type="material-community"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
