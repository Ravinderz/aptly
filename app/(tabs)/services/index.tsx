import AptlySearchBar from "@/components/ui/AptlySearchBar";
import Header from "@/components/ui/Header";
import ServiceTile from "../../../../components/ui/ServiceTile"; // Adjusted path
import { Text, View } from "react-native";

export default function services() {
  const popularServicesData = [
    { id: "1", iconName: "Sparkles", serviceName: "Cleaning", backgroundColor: "bg-blue-100" },
    { id: "2", iconName: "Wrench", serviceName: "Plumbing", backgroundColor: "bg-green-100" },
    { id: "3", iconName: "Zap", serviceName: "Electrical", backgroundColor: "bg-yellow-100" },
    { id: "4", iconName: "PaintRoller", serviceName: "Painting", backgroundColor: "bg-indigo-100" },
    { id: "5", iconName: "Sprout", serviceName: "Gardening", backgroundColor: "bg-lime-100" },
    { id: "6", iconName: "PackageOpen", serviceName: "Moving", backgroundColor: "bg-purple-100" },
    { id: "7", iconName: "Cog", serviceName: "Appliance Repair", backgroundColor: "bg-sky-100" },
    { id: "8", iconName: "Bug", serviceName: "Pest Control", backgroundColor: "bg-red-100" },
    { id: "9", iconName: "Hammer", serviceName: "Handyman", backgroundColor: "bg-orange-100" },
  ];

  return (
    <Header>
      <AptlySearchBar placeholder="Search Services..." />
      <Text className="text-xl font-bold my-3">Popular Services</Text>
      <View className="flex-row flex-wrap justify-between">
        {popularServicesData.map((item) => (
          <View key={item.id} className="w-[32%] mb-2">
            <ServiceTile
              iconName={item.iconName}
              serviceName={item.serviceName}
              backgroundColor={item.backgroundColor}
            />
          </View>
        ))}
      </View>

      {/* Recently Viewed Services Section */}
      <Text className="text-xl font-bold my-3 mt-5">Recently Viewed Services</Text>
      <View className="h-32 bg-gray-200 rounded-md p-4">
        <Text className="text-gray-500">Content for recently viewed services will go here.</Text>
      </View>

      {/* All Services Section */}
      <Text className="text-xl font-bold my-3 mt-5">All Services</Text>
      <View className="h-32 bg-gray-200 rounded-md p-4">
        <Text className="text-gray-500">Content for all services will go here.</Text>
      </View>
    </Header>
  );
}
