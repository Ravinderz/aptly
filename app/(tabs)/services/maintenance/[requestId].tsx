import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Phone, MapPin, Clock, User, CheckCircle, AlertTriangle, Wrench, Calendar, Plus, MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Linking, TextInput, Alert } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { showSuccessAlert, showErrorAlert } from "@/utils/alert";

interface TimelineNote {
  id: string;
  message: string;
  timestamp: string;
  author: string;
  type: 'system' | 'user' | 'admin';
}

export default function MaintenanceRequestDetail() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeline, setTimeline] = useState<TimelineNote[]>([
    {
      id: "1",
      message: "Request received and assigned to plumber",
      timestamp: "2024-03-15T10:30:00Z",
      author: "System",
      type: "system"
    },
    {
      id: "2", 
      message: "Plumber contacted and will visit today evening",
      timestamp: "2024-03-15T14:20:00Z",
      author: "Maintenance Team",
      type: "admin"
    }
  ]);

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
    images: []
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

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showErrorAlert('Error', 'Please enter a note message');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newTimelineEntry: TimelineNote = {
        id: Date.now().toString(),
        message: newNote.trim(),
        timestamp: new Date().toISOString(),
        author: "Priya Sharma", // Current user name - in real app get from auth context
        type: "user"
      };

      // Add to timeline
      setTimeline(prev => [newTimelineEntry, ...prev]);
      
      // In real app, this would save to API
      console.log('Adding timeline entry:', newTimelineEntry);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessAlert('Note Added', 'Timeline entry has been added successfully');
      setNewNote('');
      setShowAddNote(false);
    } catch (error) {
      showErrorAlert('Error', 'Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkCompleted = async () => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure you want to mark this maintenance request as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Completed',
          style: 'default',
          onPress: async () => {
            try {
              const completionEntry: TimelineNote = {
                id: Date.now().toString(),
                message: "Request marked as completed by resident",
                timestamp: new Date().toISOString(),
                author: "Priya Sharma",
                type: "user"
              };
              
              setTimeline(prev => [completionEntry, ...prev]);
              showSuccessAlert('Request Completed', 'Maintenance request has been marked as completed');
              
              // In real app, update request status via API
              console.log('Marking request as completed');
            } catch (error) {
              showErrorAlert('Error', 'Failed to update request status');
            }
          }
        }
      ]
    );
  };

  const getTimelineIcon = (type: 'system' | 'user' | 'admin') => {
    switch (type) {
      case 'system':
        return { color: '#6366f1', icon: '⚙️' };
      case 'admin':
        return { color: '#4CAF50', icon: '👨‍💼' };
      case 'user':
        return { color: '#FF9800', icon: '👤' };
      default:
        return { color: '#6366f1', icon: '📝' };
    }
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
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-text-primary">Activity Timeline</Text>
            <TouchableOpacity
              onPress={() => setShowAddNote(true)}
              className="bg-primary/10 rounded-full p-2"
            >
              <Plus size={16} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {/* Add Note Form */}
          {showAddNote && (
            <View className="bg-primary/5 rounded-lg p-4 mb-4 border border-primary/20">
              <Text className="text-text-primary font-medium mb-2">Add Timeline Entry</Text>
              <TextInput
                className="bg-background rounded-lg p-3 text-text-primary border border-divider mb-3"
                placeholder="Enter your note or update..."
                placeholderTextColor="#757575"
                value={newNote}
                onChangeText={setNewNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowAddNote(false);
                    setNewNote('');
                  }}
                  className="flex-1 bg-background rounded-lg py-2 px-4 border border-divider"
                  disabled={isSubmitting}
                >
                  <Text className="text-text-secondary text-center font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddNote}
                  className="flex-1 bg-primary rounded-lg py-2 px-4"
                  disabled={isSubmitting || !newNote.trim()}
                >
                  <Text className="text-white text-center font-medium">
                    {isSubmitting ? 'Adding...' : 'Add Note'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="space-y-4">
            {timeline.map((note, index) => {
              const iconInfo = getTimelineIcon(note.type);
              return (
                <View key={note.id} className="flex-row">
                  <View className="items-center mr-3">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center" 
                      style={{ backgroundColor: `${iconInfo.color}15` }}
                    >
                      <Text className="text-xs">{iconInfo.icon}</Text>
                    </View>
                    {index < timeline.length - 1 && (
                      <View className="w-px h-6 bg-divider mt-2" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-sm leading-5">{note.message}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-text-secondary text-xs">
                        {formatDate(note.timestamp)}
                      </Text>
                      <View className="w-1 h-1 rounded-full bg-text-secondary mx-2" />
                      <Text className="text-text-secondary text-xs">{note.author}</Text>
                      <View 
                        className="px-2 py-0.5 rounded-full ml-2"
                        style={{ backgroundColor: `${iconInfo.color}15` }}
                      >
                        <Text 
                          className="text-xs font-medium capitalize" 
                          style={{ color: iconInfo.color }}
                        >
                          {note.type}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="space-y-3">
          {mockRequest.status === "in_progress" && (
            <Button className="bg-success" onPress={handleMarkCompleted}>
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Mark as Completed</Text>
            </Button>
          )}
          
          {mockRequest.status === "pending" && (
            <Button 
              className="bg-warning"
              onPress={() => {
                setNewNote('Following up on this request - please provide an update on the status.');
                setShowAddNote(true);
              }}
            >
              <AlertTriangle size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Follow Up</Text>
            </Button>
          )}

          {!showAddNote && (
            <Button 
              variant="outline" 
              onPress={() => setShowAddNote(true)}
            >
              <MessageSquare size={16} color="#6366f1" />
              <Text className="text-primary font-semibold ml-2">Add Note</Text>
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}