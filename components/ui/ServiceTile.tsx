import {
  Bug,
  Cog,
  CreditCard,
  Hammer,
  Package,
  PackageOpen,
  PaintRoller,
  Router,
  Sparkles,
  Sprout,
  Wrench,
  Zap,
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { cn } from "../../utils/cn";

// Define props interface
interface ServiceTileProps {
  iconName: string;
  serviceName: string;
}

// Styled components for NativeWind

const ServiceTile: React.FC<ServiceTileProps> = ({ iconName, serviceName }) => {
  // Dynamically import the icon based on the iconName prop

  const IconMap = {
    Sparkles: <Sparkles color="#FF6B35" size={28} />,
    Wrench: <Wrench color="#FF6B35" size={28} />,
    Zap: <Zap color="#FF6B35" size={28} />,
    PaintRoller: <PaintRoller color="#FF6B35" size={28} />,
    Sprout: <Sprout color="#FF6B35" size={28} />,
    PackageOpen: <PackageOpen color="#FF6B35" size={28} />,
    Cog: <Cog color="#FF6B35" size={28} />,
    Bug: <Bug color="#FF6B35" size={28} />,
    Hammer: <Hammer color="#FF6B35" size={28} />,
    Router: <Router color="#FF6B35" size={28} />,
    Package: <Package color="#FF6B35" size={28} />,
    CreditCard: <CreditCard color="#FF6B35" size={28} />,
  };

  return (
    <View>
      <View
        className={cn(
          "p-6 rounded-xl items-center justify-center bg-surface border border-divider",
          "shadow-sm shadow-black/5"
        )}
      >
        <View className="flex items-center justify-center bg-primary/10 rounded-full p-4">
          {IconMap[iconName as keyof typeof IconMap]}
        </View>
      </View>
      <Text className="text-sm text-center font-medium mt-2 text-text-primary">
        {serviceName}
      </Text>
    </View>
  );
};

export default ServiceTile;
