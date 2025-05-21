import VisitorListItem from "@/components/ui/VisitorListItem";
import React from "react";
import { FlatList, Text, View } from "react-native";

const visitorList = () => {
  const dummyVisitors = [
    {
      name: "John Doe",
      date: "Today",
      time: "2:30 PM",
      status: "Pre-approved",
    },
    {
      name: "Jane Doe",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "Expected",
    },
    {
      name: "Bob Smith",
      date: "Next Wednesday",
      time: "3:00 PM",
      status: "Expected",
    },
  ];

  return (
    <View
      className="flex h-full p-4 mb-8"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <FlatList
        data={dummyVisitors}
        renderItem={({ item }) => (
          <VisitorListItem
            name={item.name}
            date={item.date}
            time={item.time}
            status={item.status}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex items-center justify-center h-full">
            <Text className="text-lg text-gray-500">No visitors found</Text>
          </View>
        }
        ListFooterComponent={
          <View className="flex items-center justify-center h-full">
            <Text className="text-lg text-gray-500">End of List</Text>
          </View>
        }
        style={{
          padding: 2,
          backgroundColor: "#f8fafc",
        }}
      ></FlatList>
    </View>
  );
};

export default visitorList;
