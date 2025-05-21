import Header from "@/components/ui/Header";
import PillFilter from "@/components/ui/PillFilter";
import PostCard from "@/components/ui/PostCard";
import { Search } from "lucide-react-native";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Community() {
  return (
    <Header>
      <View className="flex flex-col gap-3 mb-4">
        <TextInput
          placeholder="What do you want to share with your community?"
          cursorColor={"#6366f1"}
          className="w-full h-32 p-4 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg "
          placeholderTextColor="#9CA3AF"
          multiline={true}
          textAlignVertical="top"
          onChangeText={() => {}}
          numberOfLines={6}
        />
        <TouchableOpacity className="py-3 bg-primary rounded-lg flex flex-row w-full items-center justify-center gap-2">
          <Text className="text-sm font-semibold text-white text-center">
            Share
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <View className="flex-1 relative">
          <View className="absolute right-4 top-3">
            <Search size={18} color="#6366f1" />
          </View>
          <TextInput
            placeholder="Search Posts..."
            cursorColor={"#6366f1"}
            className="w-full p-2 border border-border-color rounded-lg mb-2 bg-primary/10 text-primary text-lg "
            placeholderTextColor="#9CA3AF"
            multiline={true}
            textAlignVertical="top"
            onChangeText={() => {}}
            numberOfLines={6}
          />
        </View>
        <ScrollView
          className="flex flex-row gap-3 mt-4"
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 4,
            gap: 8,
          }}
        >
          <PillFilter label="All" />
          <PillFilter label="My Posts" />
          <PillFilter label="Buy/Sell" />
          <PillFilter label="Events" />
          <PillFilter label="Lost/Found" />
          <PillFilter label="Help" />
          <PillFilter label="Feedback" />
        </ScrollView>
        <ScrollView
          className="mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 2,
          }}
          nestedScrollEnabled={true}
        >
          <PostCard />
          <PostCard />
        </ScrollView>
      </View>
    </Header>
  );
}
