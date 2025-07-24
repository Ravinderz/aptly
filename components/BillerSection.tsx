import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LucideIcons from "./ui/LucideIcons";
import SectionHeading from "./ui/SectionHeading";

interface BillerItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  bgColor: string;
}

const BillerSection = () => {
  const router = useRouter();

  const billers: BillerItem[] = [
    {
      id: "mobile",
      name: "Mobile",
      icon: <LucideIcons name="smartphone" size={24} color="#4CAF50" />,
      route: "/billing/mobile-recharge",
      color: "#4CAF50",
      bgColor: "bg-green-50",
    },
    {
      id: "gas",
      name: "Gas",
      icon: <LucideIcons name="fuel" size={24} color="#FF9800" />,
      route: "/billing/gas-recharge",
      color: "#FF9800",
      bgColor: "bg-orange-50",
    },
    {
      id: "electricity",
      name: "Electricity",
      icon: <LucideIcons name="zap" size={24} color="#2196F3" />,
      route: "/billing/electricity-recharge",
      color: "#2196F3",
      bgColor: "bg-blue-50",
    },
    {
      id: "broadband",
      name: "Broadband",
      icon: <LucideIcons name="wifi" size={24} color="#9C27B0" />,
      route: "/billing/broadband-recharge",
      color: "#9C27B0",
      bgColor: "bg-purple-50",
    },
  ];

  const handleViewAll = () => {
    router.push("/(tabs)/services/billing");
  };

  const handleBillerPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View className="mb-6">
      <SectionHeading
        heading="Quick Bill Pay"
        handleViewAll={handleViewAll}
      />
      
      <View className="flex-row justify-between">
        {billers.map((biller) => (
          <TouchableOpacity
            key={biller.id}
            onPress={() => handleBillerPress(biller.route)}
            className="items-center flex-1"
            activeOpacity={0.7}
          >
            <View className="w-16 h-16 rounded-full bg-surface border border-divider items-center justify-center mb-3 shadow-sm">
              {biller.icon}
            </View>
            <Text className="text-text-primary text-label-large font-medium text-center">
              {biller.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BillerSection;