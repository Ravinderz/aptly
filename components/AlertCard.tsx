import { Ellipsis, Megaphone } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import LinkButton from "./ui/LinkButton";

const AlertCard = () => {
  return (
    <View className="mb-8">
      <View className="flex flex-row justify-between items-center pb-6">
        <Text className="text-xl font-bold">Notices</Text>
        <LinkButton label="View All" />
      </View>
      <View className="flex gap-4 bg-white h-48 rounded-xl p-4 border-2 border-orange-200">
        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-row gap-4 items-center">
            <View className="bg-orange-100 rounded-full p-2">
              <Megaphone size={24} color="#6b7280" strokeWidth={2} />
            </View>
            {/* This should be a dropdown or menu item */}
            <Text className="text-xl font-bold">Water Supply Interruption</Text>
          </View>
          <View>
            <Ellipsis size={24} color="#6b7280" strokeWidth={2} />
            {/* This should be a dropdown or menu item */}
          </View>
        </View>
        <View>
          <Text className="text-md font-medium mt-2">
            Please note that the community center will be closed on Saturday,
            June 3rd from 8am-1pm for maintenance.
          </Text>
        </View>
        <View className="flex flex-row justify-between items-center mt-2">
          <Text>
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date())}
          </Text>
          <TouchableOpacity>
            <Text className="text-md font-semibold text-orange-400 text-center">
              Read More
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AlertCard;
