import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import SectionHeading from "./ui/SectionHeading";
import VisitorListCard from "./ui/VisitorListCard";

const UpcomingVisitorSection = () => {
  const router = useRouter();

  const handleViewAll = (title: string) => {
    console.log("handleViewAll", title);
    router.push({
      pathname: "/(tabs)/visitor/visitorList",
      params: { title: title },
    });
  };

  return (
    <View className="mt-2 mb-6 gap">
      <SectionHeading
        heading="Upcoming Visitors"
        handleViewAll={() => handleViewAll("Upcoming Visitors")}
      />
      <ScrollView
        contentContainerStyle={{
          gap: 14,
          padding: 2,
        }}
      >
        <VisitorListCard />
      </ScrollView>
    </View>
  );
};

export default UpcomingVisitorSection;
