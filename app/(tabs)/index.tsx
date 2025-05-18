import AlertCard from "@/components/AlertCard";
import HomeHeader from "@/components/HomeHeader";
import QuickActions from "@/components/QuickActions";
import VisitorHorizontalScrollSection from "@/components/VisitorHorizontalScrollSection";
import { ScrollView, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex flex-1 bg-[#fed0b5] border-t-2 border-[#d59f7e]">
      <HomeHeader />
      <ScrollView
        className="flex flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
      >
        <View className="flex h-full p-4 rounded-t-3xl bg-[#fff5ee] mb-8">
          <VisitorHorizontalScrollSection />
          <AlertCard />
          <QuickActions />
        </View>
      </ScrollView>
    </View>
  );
}
