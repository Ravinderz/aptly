import AlertCard from "@/components/AlertCard";
import NoticeSection from "@/components/NoticeSection";
import QuickActions from "@/components/QuickActions";
import Header from "@/components/ui/Header";
import UpcomingVisitorSection from "@/components/UpcomingVisitorSection";
import SocietyOverview from "@/components/SocietyOverview";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <Header>
      <NoticeSection />
      <UpcomingVisitorSection />
      <QuickActions />
      <SocietyOverview />
    </Header>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: "100%",
    zIndex: 1,
  },
});
