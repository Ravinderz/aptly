import AptlySearchBar from "@/components/ui/AptlySearchBar";
import Header from "@/components/ui/Header";
import { Text, View } from "react-native";

export default function services() {
  return (
    <Header>
      <AptlySearchBar placeholder="Search Services..." />
      <Text>Popular Services</Text>
      <View></View>
    </Header>
  );
}
