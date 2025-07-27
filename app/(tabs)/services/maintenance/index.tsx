import { useRouter } from "expo-router";
import { ArrowLeft, Building, Search, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MaintenanceRequests() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock maintenance requests data (individual requests)
  const individualRequests = [
    {
      id: "1",
      title: "Plumbing Issue - Kitchen Sink",
      description:
        "Kitchen sink is leaking from the bottom. Water is dripping continuously.",
      category: "Plumbing",
      priority: "high",
      status: "in_progress",
      date: "2024-03-15",
      assignedTo: "Rajesh Kumar",
      estimatedCost: "₹2,500",
      flatNumber: "A-201",
      type: "individual",
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
      flatNumber: "A-201",
      type: "individual",
    },
  ];

  // Mock common area requests
  const commonAreaRequests = [
    {
      id: "demo-request-id",
      title: "Main Lobby Lighting Issue",
      description:
        "Several LED lights in the main lobby are flickering and two have completely stopped working.",
      category: "Electrical",
      priority: "high",
      status: "in_progress",
      date: "2024-01-15",
      assignedTo: "PowerTech Electricians",
      estimatedCost: "₹4,500",
      submittedBy: "Priya Sharma",
      affectedResidents: 25,
      type: "common_area",
    },
    {
      id: "ca-2",
      title: "Garden Irrigation System Repair",
      description:
        "Sprinkler system in the main garden area is not working properly.",
      category: "Plumbing",
      priority: "medium",
      status: "approved",
      date: "2024-01-12",
      estimatedCost: "₹3,200",
      submittedBy: "Amit Kumar",
      affectedResidents: 40,
      type: "common_area",
    },
  ];

  // Combine all requests
  const allRequests = [...commonAreaRequests, ...individualRequests];

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Common Area", value: "common_area" },
    { label: "Individual", value: "individual" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success";
      case "in_progress":
        return "text-warning";
      case "pending":
        return "text-primary";
      case "approved":
        return "text-secondary";
      case "submitted":
        return "text-text-secondary";
      default:
        return "text-text-secondary";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20";
      case "in_progress":
        return "bg-warning/20";
      case "pending":
        return "bg-primary/20";
      case "approved":
        return "bg-secondary/20";
      case "submitted":
        return "bg-text-secondary/20";
      default:
        return "bg-text-secondary/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-error/20 text-error border-error/30";
      case "medium":
        return "bg-warning/20 text-warning border-warning/30";
      case "low":
        return "bg-success/20 text-success border-success/30";
      default:
        return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      Plumbing: "🔧",
      Electrical: "⚡",
      Civil: "🏗️",
      Appliance: "📱",
      Painting: "🎨",
      Cleaning: "🧹",
    };
    return categoryIcons[category] || "🔧";
  };

  const filteredRequests = allRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      request.status === selectedFilter ||
      request.type === selectedFilter;

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
          <Text className="text-xl font-bold text-text-primary">
            Maintenance Requests
          </Text>
          <Text className="text-text-secondary text-sm">
            {filteredRequests.length} requests
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-surface px-6 py-5 border-b border-divider">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() =>
              router.push("/(tabs)/services/maintenance/common-area/create")
            }
            className="flex-1 bg-primary rounded-xl p-5 flex-row items-center justify-center"
          >
            <Building size={20} color="white" />
            <Text className="text-white font-semibold ml-3">
              Common Area Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="px-6 py-5 bg-surface border-b border-divider">
        {/* Search Bar */}
        <View className="flex-row items-center bg-background rounded-xl px-4 py-4 mb-5">
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
                className={`px-4 py-3 rounded-full border ${
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
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredRequests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-text-secondary text-lg mb-2">
              No requests found
            </Text>
            <Text className="text-text-secondary text-center">
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first maintenance request"}
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {filteredRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                className="bg-surface rounded-2xl p-6 border border-divider mb-4"
                onPress={() => {
                  if (request.type === "common_area") {
                    router.push(
                      `/(tabs)/services/maintenance/common-area/${request.id}`
                    );
                  } else {
                    router.push(`/(tabs)/services/maintenance/${request.id}`);
                  }
                }}
              >
                {/* Header with Category and Priority */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">
                      {getCategoryIcon(request.category)}
                    </Text>
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-text-secondary text-sm">
                          {request.category}
                        </Text>
                        {request.type === "common_area" && (
                          <View className="bg-primary/10 rounded-full px-2 py-1 ml-2">
                            <Text className="text-primary text-xs font-medium">
                              Common Area
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-text-secondary text-xs">
                        #{request.id}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full border ${getPriorityColor(
                      request.priority
                    )}`}
                  >
                    <Text className="text-xs font-medium uppercase">
                      {request.priority}
                    </Text>
                  </View>
                </View>

                {/* Title and Description */}
                <Text className="text-lg font-semibold text-text-primary mb-2">
                  {request.title}
                </Text>
                <Text className="text-text-secondary text-sm mb-4 leading-5">
                  {request.description}
                </Text>

                {/* Common Area specific info */}
                {request.type === "common_area" && (
                  <View className="flex-row items-center mb-3">
                    <Users size={14} color="#757575" />
                    <Text className="text-text-secondary text-xs ml-1">
                      Affects {request.affectedResidents} residents
                    </Text>
                    <Text className="text-text-secondary text-xs ml-3">
                      by {request.submittedBy}
                    </Text>
                  </View>
                )}

                {/* Status and Details */}
                <View className="space-y-2">
                  <View className="flex-row items-center justify-between">
                    <View
                      className={`px-3 py-1 rounded-full ${getStatusBgColor(
                        request.status
                      )}`}
                    >
                      <Text
                        className={`text-xs font-medium capitalize ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status.replace("_", " ")}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-text-secondary text-xs">
                        {request.date}
                      </Text>
                      {(request.estimatedCost || request.actualCost) && (
                        <Text className="text-primary font-medium text-sm">
                          {request.actualCost || request.estimatedCost}
                        </Text>
                      )}
                    </View>
                  </View>
                  {request.assignedTo && (
                    <Text
                      className="text-text-secondary text-xs"
                      numberOfLines={1}
                    >
                      Assigned to: {request.assignedTo}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
