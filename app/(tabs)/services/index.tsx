import { useRouter } from "expo-router";
import { Wrench, Receipt, Plus, Clock, TrendingUp } from "lucide-react-native";
import React from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/ui/Button";

export default function Services() {
  const router = useRouter();

  // Mock data for recent activities
  const recentRequests = [
    {
      id: "1",
      title: "Plumbing Issue - Kitchen Sink",
      status: "in_progress",
      priority: "high",
      date: "2 hours ago",
      category: "Plumbing"
    },
    {
      id: "2", 
      title: "Electrical Work - Hall Fan",
      status: "completed",
      priority: "medium",
      date: "1 day ago",
      category: "Electrical"
    }
  ];

  const unpaidBills = [
    {
      id: "1",
      title: "Maintenance Bill - March 2024",
      amount: "₹5,250",
      dueDate: "Mar 31, 2024",
      status: "overdue"
    },
    {
      id: "2",
      title: "Water Bill - March 2024", 
      amount: "₹850",
      dueDate: "Apr 5, 2024",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "in_progress": return "text-warning";
      case "pending": return "text-primary";
      case "overdue": return "text-error";
      default: return "text-text-secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-error/20 text-error";
      case "medium": return "bg-warning/20 text-warning";
      case "low": return "bg-success/20 text-success";
      default: return "bg-primary/20 text-primary";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-text-primary mb-2">Services</Text>
          <Text className="text-text-secondary">Manage maintenance requests and billing</Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Quick Actions</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity 
              className="flex-1 bg-primary rounded-2xl p-4 flex-row items-center"
              onPress={() => router.push("/(tabs)/services/maintenance/create")}
            >
              <Plus size={24} color="white" />
              <Text className="text-white font-semibold ml-2">New Request</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-surface border border-divider rounded-2xl p-4 flex-row items-center"
              onPress={() => router.push("/(tabs)/services/billing")}
            >
              <Receipt size={24} color="#6366f1" />
              <Text className="text-primary font-semibold ml-2">View Bills</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Services Grid */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">Services</Text>
          <View className="flex-row gap-4">
            {/* Maintenance Requests Card */}
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push("/(tabs)/services/maintenance")}
            >
              <View className="bg-primary/10 rounded-full w-12 h-12 items-center justify-center mb-4">
                <Wrench size={24} color="#6366f1" />
              </View>
              <Text className="text-lg font-semibold text-text-primary mb-2">Maintenance</Text>
              <Text className="text-text-secondary text-sm mb-3">Submit and track repair requests</Text>
              <View className="flex-row items-center">
                <View className="bg-warning/20 rounded-full px-2 py-1">
                  <Text className="text-warning text-xs font-medium">2 Active</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Billing Card */}
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-6 border border-divider"
              onPress={() => router.push("/(tabs)/services/billing")}
            >
              <View className="bg-success/10 rounded-full w-12 h-12 items-center justify-center mb-4">
                <Receipt size={24} color="#4CAF50" />
              </View>
              <Text className="text-lg font-semibold text-text-primary mb-2">Billing</Text>
              <Text className="text-text-secondary text-sm mb-3">View bills and payment history</Text>
              <View className="flex-row items-center">
                <View className="bg-error/20 rounded-full px-2 py-1">
                  <Text className="text-error text-xs font-medium">₹6,100 Due</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Maintenance Requests */}
        {recentRequests.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-text-primary">Recent Requests</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/services/maintenance")}>
                <Text className="text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            {recentRequests.map((request) => (
              <TouchableOpacity 
                key={request.id}
                className="bg-surface rounded-xl p-4 border border-divider mb-3"
                onPress={() => router.push(`/(tabs)/services/maintenance/${request.id}`)}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-text-primary font-medium flex-1 mr-2">{request.title}</Text>
                  <View className={`rounded-full px-2 py-1 ${getPriorityColor(request.priority)}`}>
                    <Text className="text-xs font-medium uppercase">{request.priority}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Clock size={14} color="#757575" />
                    <Text className="text-text-secondary text-sm ml-1">{request.date}</Text>
                  </View>
                  <Text className={`text-sm font-medium capitalize ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Unpaid Bills */}
        {unpaidBills.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-text-primary">Pending Bills</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/services/billing")}>
                <Text className="text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            {unpaidBills.map((bill) => (
              <TouchableOpacity 
                key={bill.id}
                className="bg-surface rounded-xl p-4 border border-divider mb-3"
                onPress={() => router.push(`/(tabs)/services/billing/${bill.id}`)}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-text-primary font-medium flex-1 mr-2">{bill.title}</Text>
                  <Text className="text-text-primary font-bold">{bill.amount}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-secondary text-sm">Due: {bill.dueDate}</Text>
                  <View className={`rounded-full px-2 py-1 ${
                    bill.status === 'overdue' ? 'bg-error/20' : 'bg-warning/20'
                  }`}>
                    <Text className={`text-xs font-medium ${getStatusColor(bill.status)}`}>
                      {bill.status === 'overdue' ? 'Overdue' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Analytics Overview */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">This Month</Text>
          <View className="bg-surface rounded-2xl p-6 border border-divider">
            <View className="flex-row items-center mb-4">
              <TrendingUp size={20} color="#4CAF50" />
              <Text className="text-text-primary font-medium ml-2">Activity Summary</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">3</Text>
                <Text className="text-text-secondary text-sm">Requests</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-success">2</Text>
                <Text className="text-text-secondary text-sm">Completed</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">₹12,450</Text>
                <Text className="text-text-secondary text-sm">Bills Paid</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
