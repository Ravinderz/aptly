import AptlySearchBar from "@/components/ui/AptlySearchBar";
import Header from "@/components/ui/Header";
import SectionHeading from "@/components/ui/SectionHeading";
import ServiceTile from "@/components/ui/ServiceTile";
import { View } from "react-native";

export default function services() {
  const popularServicesData = [
    {
      id: "1",
      iconName: "Sparkles",
      serviceName: "Cleaning",
    },
    {
      id: "2",
      iconName: "Wrench",
      serviceName: "Plumbing",
    },
    {
      id: "3",
      iconName: "Zap",
      serviceName: "Electrical",
    },
    {
      id: "4",
      iconName: "PaintRoller",
      serviceName: "Painting",
    },
    {
      id: "5",
      iconName: "Sprout",
      serviceName: "Gardening",
    },
    {
      id: "6",
      iconName: "PackageOpen",
      serviceName: "Moving",
    },
    {
      id: "7",
      iconName: "Cog",
      serviceName: "Appliance Repair",
    },
    {
      id: "8",
      iconName: "Bug",
      serviceName: "Pest Control",
    },
    {
      id: "9",
      iconName: "Hammer",
      serviceName: "Handyman",
    },
  ];

  const utilitiesData = [
    {
      id: "1",
      iconName: "Router",
      serviceName: "Broadband",
    },
    {
      id: "2",
      iconName: "CreditCard",
      serviceName: "Credit Card Bill",
    },
    {
      id: "3",
      iconName: "Zap",
      serviceName: "Electricity",
    },
  ];

  return (
    <Header>
      <AptlySearchBar placeholder="Search Services..." />
      <View className="mt-4">
        <SectionHeading heading="Popular Services" handleViewAll={() => {}} />
      </View>
      <View className="flex-row flex-wrap justify-between">
        {popularServicesData.map((item) => (
          <View key={item.id} className="w-[32%] mb-2">
            <ServiceTile
              iconName={item.iconName}
              serviceName={item.serviceName}
            />
          </View>
        ))}
      </View>
      <View className="mt-4">
        <SectionHeading heading="Utilities" handleViewAll={() => {}} />
      </View>
      <View className="flex-row flex-wrap justify-between">
        {utilitiesData.map((item) => (
          <View key={item.id} className="w-[32%] mb-2">
            <ServiceTile
              iconName={item.iconName}
              serviceName={item.serviceName}
            />
          </View>
        ))}
      </View>
    </Header>
  );
}
