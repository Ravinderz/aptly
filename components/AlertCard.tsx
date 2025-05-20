import React from "react";
import { Text, View } from "react-native";
import { IconRenderer } from "./ui/IconRenderer";
import LinkButton from "./ui/LinkButton";

const AlertCard = () => {
  return (
    <View className="mb-8">
      <View className="flex flex-row justify-between items-center pb-6">
        <Text className="text-xl font-bold">Notices</Text>
        <LinkButton label="View All" />
      </View>
      <View className="flex gap-4 bg-primary h-48 rounded-xl p-4 border-2 border-primary-dark">
        <View className="flex flex-row gap-4 items-center">
          <IconRenderer
            name="alert_icons.alert_circle"
            type="material-community"
            size={40}
            color="black"
          />
          <Text className="text-xl font-bold">Notice Alert</Text>
        </View>
        <View>
          <Text className="text-md font-medium">
            Please note that the community center will be closed on Saturday,
            June 3rd from 8am-1pm for maintenance.
          </Text>
        </View>
        <View>
          <Text>
            {new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date())}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AlertCard;
