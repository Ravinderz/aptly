import AlertCard from "@/components/AlertCard";
import QuickActions from "@/components/QuickActions";
import Header from "@/components/ui/Header";
import VisitorHorizontalScrollSection from "@/components/VisitorHorizontalScrollSection";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <Header>
      <VisitorHorizontalScrollSection />
      <AlertCard />
      <QuickActions />
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
