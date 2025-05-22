import { icons } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

// Define props interface
interface ServiceTileProps {
  iconName: string;
  serviceName: string;
}

// Styled components for NativeWind

const ServiceTile: React.FC<ServiceTileProps> = ({ iconName, serviceName }) => {
  // Dynamically import the icon based on the iconName prop
  const LucideIcon = icons[iconName as keyof typeof icons];

  return (
    <View>
      <View
        className={`p-6 rounded-lg items-center justify-center bg-white border border-border-color`}
      >
        <View className="flex items-center justify-center bg-primary/10 rounded-full p-4">
          {LucideIcon && <LucideIcon color="#6366f1" size={28} />}
        </View>
      </View>
      <Text className="text-sm text-center font-medium mt-2">
        {serviceName}
      </Text>
    </View>
  );
};

export default ServiceTile;
