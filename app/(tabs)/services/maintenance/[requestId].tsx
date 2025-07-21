import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Phone, MapPin, Clock, User, CheckCircle, AlertTriangle, Wrench, Calendar } from "lucide-react-native";
import React from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Linking } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function MaintenanceRequestDetail() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  // Mock data - in real app, fetch based on requestId
  const mockRequest = {
    id: requestId || "1",
    title: "Plumbing Issue - Kitchen Sink",
    description: "Kitchen sink is leaking from the bottom. Water is dripping continuously. The issue started yesterday evening and has been getting worse. I've placed a bucket to catch the water but it needs immediate attention.",
    category: "Plumbing",
    priority: "high",
    status: "in_progress",
    date: "2024-03-15",
    assignedTo: "Rajesh Kumar",
    assignedToPhone: "+91 98765 43210",
    estimatedCost: "₹2,500",
    actualCost: null,
    flatNumber: "A-201",
    residentName: "Priya Sharma",
    residentPhone: "+91 98765 43211",
    type: "individual",
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-15T14:20:00Z",
    images: [],
    notes: [
      {
        id: "1",
        message: "Request received and assigned to plumber",
        timestamp: "2024-03-15T10:30:00Z",
        author: "System"
      },
      {
        id: "2", 
        message: "Plumber contacted and will visit today evening",
        timestamp: "2024-03-15T14:20:00Z",
        author: "Maintenance Team"
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-success";
      case "in_progress": return "text-warning";
      case "pending": return "text-primary";
      case "approved": return "text-secondary";
      default: return "text-text-secondary";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/20";
      case "in_progress": return "bg-warning/20";
      case "pending": return "bg-primary/20";
      case "approved": return "bg-secondary/20";
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
    const icons = {
      "Plumbing": "🔧",
      "Electrical": "⚡",
      "Civil": "🏗️",
      "Appliance": "📱",
      "Painting": "🎨",
      "Cleaning": "🧹"
    };
    return icons[category as keyof typeof icons] || "🔧";
  };

  const handleCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl).then((supported) => {
      if (supported) {
        Linking.openURL(phoneUrl);
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-divider bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#212121" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">Request Details</Text>
          <Text className="text-text-secondary text-sm">#{mockRequest.id}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status and Priority */}
        <View className="flex-row items-center justify-between mb-6">
          <View className={`px-4 py-2 rounded-full ${getStatusBgColor(mockRequest.status)}`}>
            <Text className={`font-medium capitalize ${getStatusColor(mockRequest.status)}`}>
              {mockRequest.status.replace('_', ' ')}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full border ${getPriorityColor(mockRequest.priority)}`}>
            <Text className="text-xs font-medium uppercase">{mockRequest.priority} Priority</Text>
          </View>
        </View>

        {/* Main Info Card */}
        <Card className="mb-6">
          <View className="flex-row items-start mb-4">
            <Text className="text-2xl mr-3">{getCategoryIcon(mockRequest.category)}</Text>
            <View className="flex-1">
              <Text className="text-text-secondary text-sm mb-1">{mockRequest.category}</Text>
              <Text className="text-lg font-semibold text-text-primary mb-2">{mockRequest.title}</Text>
            </View>
          </View>
          
          <Text className="text-text-secondary leading-6 mb-4">{mockRequest.description}</Text>
          
          {/* Request Info */}
          <View className="space-y-3">
            <View className="flex-row items-center">
              <MapPin size={16} color="#757575" />
              <Text className="text-text-primary ml-2 font-medium">Flat {mockRequest.flatNumber}</Text>
            </View>
            
            <View className="flex-row items-center">
              <User size={16} color="#757575" />
              <Text className="text-text-primary ml-2">{mockRequest.residentName}</Text>
              <TouchableOpacity
                onPress={() => handleCall(mockRequest.residentPhone)}
                className="ml-2 p-1"
              >
                <Phone size={14} color="#6366f1" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center">
              <Calendar size={16} color="#757575" />
              <Text className="text-text-primary ml-2">{formatDate(mockRequest.createdAt)}</Text>
            </View>
          </View>
        </Card>

        {/* Assignment Card */}
        {mockRequest.assignedTo && (
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-text-primary mb-4">Assigned To</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Wrench size={20} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary font-medium">{mockRequest.assignedTo}</Text>
                  <Text className="text-text-secondary text-sm">{mockRequest.category} Specialist</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleCall(mockRequest.assignedToPhone)}
                className="bg-primary rounded-full p-3"
              >
                <Phone size={16} color="white" />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Cost Information */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">Cost Information</Text>
          <View className="space-y-2">
            {mockRequest.estimatedCost && (
              <View className="flex-row justify-between">
                <Text className="text-text-secondary">Estimated Cost</Text>
                <Text className="text-text-primary font-medium">{mockRequest.estimatedCost}</Text>
              </View>
            )}
            {mockRequest.actualCost && (
              <View className="flex-row justify-between">
                <Text className="text-text-secondary">Actual Cost</Text>
                <Text className="text-success font-medium">{mockRequest.actualCost}</Text>
              </View>
            )}
            {!mockRequest.actualCost && mockRequest.estimatedCost && (
              <Text className="text-text-secondary text-xs mt-2">
                Final cost will be updated after completion
              </Text>
            )}
          </View>
        </Card>

        {/* Activity Timeline */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">Activity Timeline</Text>
          <View className="space-y-4">
            {mockRequest.notes.map((note, index) => (
              <View key={note.id} className="flex-row">
                <View className="items-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-primary" />
                  {index < mockRequest.notes.length - 1 && (
                    <View className="w-px h-6 bg-divider mt-2" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm">{note.message}</Text>
                  <Text className="text-text-secondary text-xs mt-1">
                    {formatDate(note.timestamp)} • {note.author}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="space-y-3">
          {mockRequest.status === "in_progress" && (
            <Button className="bg-success">
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Mark as Completed</Text>
            </Button>
          )}
          
          {mockRequest.status === "pending" && (
            <Button className="bg-warning">
              <AlertTriangle size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Follow Up</Text>
            </Button>
          )}

          <Button variant="outline">
            <Text className="text-primary font-semibold">Add Note</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}