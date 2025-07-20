import { useRouter } from "expo-router";
import { ArrowLeft, Plus, Filter, Search } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function MaintenanceRequests() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock maintenance requests data
  const maintenanceRequests = [
    {
      id: "1",
      title: "Plumbing Issue - Kitchen Sink",
      description: "Kitchen sink is leaking from the bottom. Water is dripping continuously.",
      category: "Plumbing",
      priority: "high",
      status: "in_progress",
      date: "2024-03-15",
      assignedTo: "Rajesh Kumar",
      estimatedCost: "₹2,500",
      flatNumber: "A-201"
    },
    {
      id: "2",
      title: "Electrical Work - Hall Fan",
      description: "Ceiling fan in the hall is making noise and running slow.",
      category: "Electrical",
      priority: "medium",
      status: "completed",
      date: "2024-03-12",
      assignedTo: "Suresh Electricals",
      actualCost: "₹1,200",
      flatNumber: "A-201"
    },
    {
      id: "3",
      title: "Door Lock Repair",
      description: "Main door lock is not working properly. Key gets stuck.",
      category: "Civil",
      priority: "medium",
      status: "pending",
      date: "2024-03-18",
      flatNumber: "A-201"
    },
    {
      id: "4",
      title: "AC Not Cooling",
      description: "Air conditioner in bedroom is not cooling properly.",
      category: "Appliance",
      priority: "low",
      status: "submitted",
      date: "2024-03-20",
      flatNumber: "A-201"
    }
  ];

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Submitted", value: "submitted" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "in_progress": return "text-warning";
      case "pending": return "text-primary";
      case "submitted": return "text-text-secondary";
      default: return "text-text-secondary";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/20";
      case "in_progress": return "bg-warning/20";
      case "pending": return "bg-primary/20";
      case "submitted": return "bg-text-secondary/20";
      default: return "bg-text-secondary/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-error/20 text-error border-error/30";
      case "medium": return "bg-warning/20 text-warning border-warning/30";
      case "low": return "bg-success/20 text-success border-success/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      "Plumbing": "🔧",
      "Electrical": "⚡",
      "Civil": "🏗️",
      "Appliance": "📱",
      "Painting": "🎨",
      "Cleaning": "🧹"
    };
    return categoryIcons[category] || "🔧";
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || request.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Maintenance Requests</Text>
          <Text className="text-text-secondary text-sm">{filteredRequests.length} requests</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/services/maintenance/create")}
          className="bg-primary rounded-full p-2"
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View className="px-4 py-4 bg-surface border-b border-divider">
        {/* Search Bar */}
        <View className="flex-row items-center bg-background rounded-xl px-4 py-3 mb-4">
          <Search size={20} color="#757575" />
          <TextInput
            className="flex-1 ml-3 text-text-primary"
            placeholder="Search requests..."
            placeholderTextColor="#757575"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-full border ${
                  selectedFilter === filter.value
                    ? "bg-primary border-primary"
                    : "bg-background border-divider"
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedFilter === filter.value
                      ? "text-white"
                      : "text-text-secondary"
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView className="flex-1 px-4 py-4">
        {filteredRequests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-text-secondary text-lg mb-2">No requests found</Text>
            <Text className="text-text-secondary text-center">
              {searchQuery ? "Try adjusting your search" : "Create your first maintenance request"}
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              className="bg-surface rounded-2xl p-6 mb-4 border border-divider"
              onPress={() => router.push(`/(tabs)/services/maintenance/${request.id}`)}
            >
              {/* Header with Category and Priority */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{getCategoryIcon(request.category)}</Text>
                  <View>
                    <Text className="text-text-secondary text-sm">{request.category}</Text>
                    <Text className="text-text-secondary text-xs">#{request.id}</Text>
                  </View>
                </View>
                <View className={`px-3 py-1 rounded-full border ${getPriorityColor(request.priority)}`}>
                  <Text className="text-xs font-medium uppercase">{request.priority}</Text>
                </View>
              </View>

              {/* Title and Description */}
              <Text className="text-lg font-semibold text-text-primary mb-2">{request.title}</Text>
              <Text className="text-text-secondary text-sm mb-4 leading-5">{request.description}</Text>

              {/* Status and Details */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`px-3 py-1 rounded-full ${getStatusBgColor(request.status)}`}>
                    <Text className={`text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </Text>
                  </View>
                  {request.assignedTo && (
                    <Text className="text-text-secondary text-xs ml-3">
                      Assigned to: {request.assignedTo}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-text-secondary text-xs">{request.date}</Text>
                  {(request.estimatedCost || request.actualCost) && (
                    <Text className="text-primary font-medium text-sm">
                      {request.actualCost || request.estimatedCost}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}