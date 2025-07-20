import { BellRing, MapPinHouse, MessageSquareMore } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const HomeHeader = () => {
  return (
    <View className="flex flex-row justify-between px-6 py-4 bg-surface border-b border-divider shadow-sm shadow-black/5 z-10">
      <View className="flex flex-row gap-3 items-center">
        <MapPinHouse size={18} color="#6366f1" strokeWidth={2} />
        <Text className="font-medium text-lg text-primary">Flat #401</Text>
      </View>

      <View className="flex flex-row gap-5">
        <TouchableOpacity>
          <BellRing size={18} color="#757575" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity>
          <MessageSquareMore size={18} color="#757575" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
