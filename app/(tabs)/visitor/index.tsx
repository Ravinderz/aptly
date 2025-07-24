import AptlySearchBar from "@/components/ui/AptlySearchBar";
import Header from "@/components/ui/Header";
import VisitorListItem from "@/components/ui/VisitorListItem";
import VisitorQRModal from "@/components/ui/VisitorQRModal";
import { router } from "expo-router";
import { Calendar, Filter, Plus, Users, X, Clock, CalendarDays, Phone, MessageSquare } from "lucide-react-native";
import React, { useEffect, useState, useCallback, startTransition } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput
} from "react-native";
import { DatePickerModal, TimePickerModal } from "@/components/ui/pickers";
import { formatDate } from "@/utils/dateUtils";
import { useAlert } from "@/components/ui/AlertCard";

interface Visitor {
  id: string;
  name: string;
  date: string;
  time: string;
  status: "Pending" | "Approved" | "Pre-approved" | "Rejected" | "Completed";
  category: "Personal" | "Delivery" | "Service" | "Official";
  phone?: string;
  purpose?: string;
}

const FILTER_OPTIONS = [
  { key: "all", label: "All Visitors" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "today", label: "Today" },
];

const CATEGORY_FILTERS = [
  { key: "all", label: "All Categories", icon: Users },
  { key: "Personal", label: "Personal", icon: Users },
  { key: "Delivery", label: "Delivery", icon: Users },
  { key: "Service", label: "Service", icon: Users },
  { key: "Official", label: "Official", icon: Users },
];

export default function VisitorDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Reschedule modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleVisitor, setRescheduleVisitor] = useState<Visitor | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Custom alert hook
  const { showAlert, AlertComponent } = useAlert();

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [visitors, selectedFilter, selectedCategory, searchQuery]);

  const loadVisitors = async () => {
    try {
      // Mock data - in production this would be an API call
      const mockVisitors: Visitor[] = [
        {
          id: "1",
          name: "Nishant Kumar",
          date: "Today",
          time: "10:00 AM",
          status: "Pre-approved",
          category: "Personal",
          phone: "+91 9876543210",
          purpose: "Family visit"
        },
        {
          id: "2",
          name: "Amazon Delivery",
          date: "Today",
          time: "11:00 AM",
          status: "Approved",
          category: "Delivery",
          phone: "+91 9876543211",
          purpose: "Package delivery"
        },
        {
          id: "3",
          name: "Blinkit Delivery",
          date: "Today",
          time: "12:30 PM",
          status: "Pending",
          category: "Delivery",
          phone: "+91 9876543212",
          purpose: "Grocery delivery"
        },
        {
          id: "4",
          name: "Plumber - Raj",
          date: "Tomorrow",
          time: "09:00 AM",
          status: "Approved",
          category: "Service",
          phone: "+91 9876543213",
          purpose: "Pipe repair"
        },
        {
          id: "5",
          name: "Dr. Sharma",
          date: "Yesterday",
          time: "08:00 PM",
          status: "Completed",
          category: "Personal",
          phone: "+91 9876543214",
          purpose: "Home consultation"
        },
        {
          id: "6",
          name: "Unknown Visitor",
          date: "Yesterday",
          time: "02:00 PM", 
          status: "Rejected",
          category: "Personal",
          phone: "+91 9876543215",
          purpose: "Unscheduled visit"
        }
      ];
      
      setVisitors(mockVisitors);
    } catch (error) {
      console.error("Error loading visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisitors = () => {
    let filtered = visitors;

    // Filter by status/time
    if (selectedFilter !== "all") {
      switch (selectedFilter) {
        case "pending":
          filtered = filtered.filter(v => v.status === "Pending");
          break;
        case "approved":
          filtered = filtered.filter(v => v.status === "Approved" || v.status === "Pre-approved");
          break;
        case "today":
          filtered = filtered.filter(v => v.date === "Today");
          break;
      }
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.purpose?.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query)
      );
    }

    // Sort by date and status priority
    filtered.sort((a, b) => {
      const statusOrder = { "Pending": 4, "Pre-approved": 3, "Approved": 2, "Completed": 1, "Rejected": 0 };
      const statusComparison = statusOrder[b.status] - statusOrder[a.status];
      if (statusComparison !== 0) return statusComparison;
      
      // Then sort by date
      const dateOrder = { "Today": 3, "Tomorrow": 2, "Yesterday": 1 };
      return (dateOrder[b.date as keyof typeof dateOrder] || 0) - (dateOrder[a.date as keyof typeof dateOrder] || 0);
    });

    setFilteredVisitors(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisitors();
    setRefreshing(false);
  };

  const handleAddVisitor = () => {
    router.push("/(tabs)/visitor/addVisitor");
  };

  const handleVisitorAction = (visitor: Visitor, action: string) => {
    console.log(`${action} visitor:`, visitor.name);
    
    if (action === "approve") {
      // Update visitor status to approved
      setVisitors(prevVisitors => 
        prevVisitors.map(v => 
          v.id === visitor.id 
            ? { ...v, status: "Approved" as const }
            : v
        )
      );
    } else if (action === "reject") {
      // Update visitor status to rejected
      setVisitors(prevVisitors => 
        prevVisitors.map(v => 
          v.id === visitor.id 
            ? { ...v, status: "Rejected" as const }
            : v
        )
      );
    } else if (action === "view") {
      // Handle reschedule action
      setRescheduleVisitor(visitor);
      setRescheduleDate(null);
      setRescheduleTime("");
      setRescheduleReason("");
      setShowRescheduleModal(true);
    }
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleVisitor || !rescheduleDate || !rescheduleTime) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Please select both date and time for rescheduling',
        primaryAction: {
          label: 'OK',
          onPress: () => {},
        },
      });
      return;
    }

    // Update visitor with new date and time
    setVisitors(prevVisitors => 
      prevVisitors.map(v => 
        v.id === rescheduleVisitor.id 
          ? { 
              ...v, 
              date: formatDate(rescheduleDate),
              time: rescheduleTime
            }
          : v
      )
    );

    const visitorName = rescheduleVisitor.name;

    // Close modal and reset states
    setShowRescheduleModal(false);
    setRescheduleVisitor(null);
    setRescheduleDate(null);
    setRescheduleTime("");
    setRescheduleReason("");

    showAlert({
      type: 'success',
      title: 'Visit Rescheduled',
      message: `${visitorName}'s visit has been rescheduled successfully. They will be notified of the change.`,
      primaryAction: {
        label: 'OK',
        onPress: () => {},
      },
    });
  };

  const handleCancelReschedule = () => {
    setShowRescheduleModal(false);
    setRescheduleVisitor(null);
    setRescheduleDate(null);
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const handleViewQR = useCallback((visitor: Visitor) => {
    // Use startTransition to mark this as a non-urgent update
    startTransition(() => {
      setSelectedVisitor(visitor);
      setShowQRModal(true);
    });
  }, []);

  const handleCloseQRModal = useCallback(() => {
    startTransition(() => {
      setShowQRModal(false);
      setSelectedVisitor(null);
    });
  }, []);

  const getUpcomingCount = () => visitors.filter(v => v.status !== "Completed" && v.status !== "Rejected").length;
  const getPendingCount = () => visitors.filter(v => v.status === "Pending").length;

  return (
    <Header>
      {/* Enhanced Header with Stats */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-display-small font-bold text-text-primary">
            Visitors
          </Text>
          <TouchableOpacity
            onPress={handleAddVisitor}
            className="bg-primary rounded-full w-12 h-12 items-center justify-center shadow-sm"
          >
            <Plus size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Enhanced Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          {/* Upcoming Visitors */}
          <View className="flex-1 bg-primary/10 border border-primary/20 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-display-small font-bold text-primary">
                {getUpcomingCount()}
              </Text>
              <View className="w-2 h-2 bg-primary rounded-full" />
            </View>
            <Text className="text-label-large font-medium text-text-primary">
              Upcoming
            </Text>
            <Text className="text-label-small text-text-secondary">
              Scheduled visits
            </Text>
          </View>

          {/* Pending Approval */}
          <View className="flex-1 bg-warning/10 border border-warning/20 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-display-small font-bold text-warning">
                {getPendingCount()}
              </Text>
              <View className="w-2 h-2 bg-warning rounded-full" />
            </View>
            <Text className="text-label-large font-medium text-text-primary">
              Pending
            </Text>
            <Text className="text-label-small text-text-secondary">
              Need approval
            </Text>
          </View>

          {/* Today's Visits */}
          <View className="flex-1 bg-success/10 border border-success/20 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-display-small font-bold text-success">
                {visitors.filter(v => v.date === "Today").length}
              </Text>
              <View className="w-2 h-2 bg-success rounded-full" />
            </View>
            <Text className="text-label-large font-medium text-text-primary">
              Today
            </Text>
            <Text className="text-label-small text-text-secondary">
              Active visits
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mb-4">
        <AptlySearchBar
          placeholder="Search visitors, purpose..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
      </View>

      {/* Filter Pills - Status */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedFilter === filter.key
                  ? "bg-primary border-primary"
                  : "bg-surface border-divider"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-body-medium font-medium ${
                  selectedFilter === filter.key
                    ? "text-white"
                    : "text-text-primary"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Pills - Category */}
      <View className="mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {CATEGORY_FILTERS.map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedCategory(category.key)}
              className={`mr-3 px-3 py-2 rounded-full border flex-row items-center ${
                selectedCategory === category.key
                  ? "bg-secondary/10 border-secondary"
                  : "bg-surface border-divider"
              }`}
              activeOpacity={0.7}
            >
              <category.icon 
                size={14} 
                className={selectedCategory === category.key ? "text-secondary" : "text-text-secondary"}
                strokeWidth={1.5}
              />
              <Text
                className={`text-label-medium font-medium ml-1 ${
                  selectedCategory === category.key
                    ? "text-secondary"
                    : "text-text-primary"
                }`}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Visitors List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-text-secondary">Loading visitors...</Text>
          </View>
        ) : filteredVisitors.length > 0 ? (
          <>
            {filteredVisitors.map((visitor) => (
              <VisitorListItem
                key={visitor.id}
                name={visitor.name}
                date={visitor.date}
                time={visitor.time}
                status={visitor.status}
                category={visitor.category}
                purpose={visitor.purpose}
                phone={visitor.phone}
                type={visitor.status === "Completed" || visitor.status === "Rejected" ? "past" : "upcoming"}
                onViewQR={() => handleViewQR(visitor)}
                onApprove={() => handleVisitorAction(visitor, "approve")}
                onReject={() => handleVisitorAction(visitor, "reject")}
                handleClick={() => handleVisitorAction(visitor, "view")}
              />
            ))}
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            {/* Empty State Icon */}
            <View className="bg-primary/5 p-6 rounded-full mb-6">
              <Users size={48} className="text-primary" strokeWidth={1.5} />
            </View>
            
            {/* Empty State Content */}
            <Text className="text-text-primary text-headline-medium font-bold mb-3 text-center">
              {searchQuery.trim() || selectedFilter !== "all" || selectedCategory !== "all" 
                ? "No Matching Visitors" 
                : "No Visitors Yet"}
            </Text>
            
            <Text className="text-text-secondary text-center px-8 mb-8 leading-6">
              {searchQuery.trim() || selectedFilter !== "all" || selectedCategory !== "all"
                ? "Try clearing your search or adjusting the filters to see more visitors."
                : "Start managing your visitors by adding your first entry. You can pre-approve guests, track deliveries, and generate QR codes for easy access."
              }
            </Text>

            {/* Action Buttons */}
            <View className="flex-row gap-4">
              {(searchQuery.trim() || selectedFilter !== "all" || selectedCategory !== "all") ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                    setSelectedCategory("all");
                  }}
                  className="bg-surface border border-divider px-6 py-3 rounded-xl flex-row items-center"
                >
                  <X size={16} className="text-text-secondary" strokeWidth={2} />
                  <Text className="text-text-secondary font-semibold ml-2">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              ) : null}
              
              <TouchableOpacity
                onPress={handleAddVisitor}
                className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
              >
                <Plus size={16} color="white" strokeWidth={2} />
                <Text className="text-white font-semibold ml-2">
                  Add Visitor
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Tips */}
            {!searchQuery.trim() && selectedFilter === "all" && selectedCategory === "all" && (
              <View className="mt-8 bg-primary/5 border border-primary/10 rounded-xl p-4 mx-8">
                <Text className="text-primary text-body-medium font-semibold mb-3">
                  💡 Quick Tips
                </Text>
                <View className="space-y-2">
                  <Text className="text-text-secondary text-label-large leading-5">
                    • Pre-approve family and friends for faster entry
                  </Text>
                  <Text className="text-text-secondary text-label-large leading-5">
                    • Track deliveries from Amazon, Flipkart, and food apps
                  </Text>
                  <Text className="text-text-secondary text-label-large leading-5">
                    • Generate QR codes for contactless gate entry
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
      
      {/* Custom Alert Component */}
      {AlertComponent}
      
      {/* QR Code Modal */}
      <VisitorQRModal
        visible={showQRModal}
        visitor={selectedVisitor}
        onClose={handleCloseQRModal}
      />

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelReschedule}
      >
        <View className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-divider bg-surface">
            <Text className="text-headline-large font-semibold text-text-primary">
              Reschedule Visit
            </Text>
            <TouchableOpacity
              onPress={handleCancelReschedule}
              className="w-8 h-8 rounded-full bg-divider/50 items-center justify-center"
            >
              <X size={16} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {rescheduleVisitor && (
              <>
                {/* Visitor Info */}
                <View className="bg-surface rounded-xl p-4 mb-6 border border-divider">
                  <Text className="text-body-medium text-text-secondary mb-2">Rescheduling visit for:</Text>
                  <Text className="text-headline-medium font-semibold text-text-primary mb-1">
                    {rescheduleVisitor.name}
                  </Text>
                  <Text className="text-body-medium text-text-secondary">
                    {rescheduleVisitor.category} Visit • {rescheduleVisitor.purpose}
                  </Text>
                  <View className="bg-warning/10 rounded-lg p-3 mt-3">
                    <Text className="text-warning text-body-small font-medium">
                      Current Schedule: {rescheduleVisitor.date} at {rescheduleVisitor.time}
                    </Text>
                  </View>
                </View>

                {/* New Date Selection */}
                <View className="mb-4">
                  <Text className="text-body-large font-semibold text-text-primary mb-3">
                    Select New Date *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-surface border border-divider rounded-xl p-4 flex-row items-center"
                  >
                    <CalendarDays size={20} color="#6366f1" />
                    <Text className={`ml-3 text-body-large ${
                      rescheduleDate ? "text-text-primary" : "text-text-secondary"
                    }`}>
                      {rescheduleDate ? formatDate(rescheduleDate) : "Select new date"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* New Time Selection */}
                <View className="mb-4">
                  <Text className="text-body-large font-semibold text-text-primary mb-3">
                    Select New Time *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className="bg-surface border border-divider rounded-xl p-4 flex-row items-center"
                  >
                    <Clock size={20} color="#6366f1" />
                    <Text className={`ml-3 text-body-large ${
                      rescheduleTime ? "text-text-primary" : "text-text-secondary"
                    }`}>
                      {rescheduleTime || "Select new time"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Reason (Optional) */}
                <View className="mb-6">
                  <Text className="text-body-large font-semibold text-text-primary mb-3">
                    Reason for Rescheduling <Text className="text-text-secondary font-normal">(Optional)</Text>
                  </Text>
                  <TextInput
                    className="bg-surface border border-divider rounded-xl p-4 text-text-primary text-body-large"
                    placeholder="Enter reason for rescheduling..."
                    placeholderTextColor="#757575"
                    value={rescheduleReason}
                    onChangeText={setRescheduleReason}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    onPress={handleCancelReschedule}
                    className="flex-1 bg-surface border border-divider rounded-xl py-4"
                  >
                    <Text className="text-text-secondary text-center font-semibold text-body-large">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleRescheduleSubmit}
                    className="flex-1 bg-primary rounded-xl py-4"
                    disabled={!rescheduleDate || !rescheduleTime}
                  >
                    <Text className="text-white text-center font-semibold text-body-large">
                      Reschedule Visit
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Info Card */}
                <View className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
                  <Text className="text-secondary text-body-medium font-medium mb-2">
                    📱 Automatic Notifications
                  </Text>
                  <Text className="text-text-secondary text-body-small leading-5">
                    The visitor will be automatically notified about the schedule change via SMS and will receive an updated QR code for the new time slot.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => {
          setRescheduleDate(date);
          setShowDatePicker(false);
        }}
        selectedDate={rescheduleDate || undefined}
        allowPastDates={false}
        maxDaysInAdvance={30}
        showPresets={true}
        title="Select New Visit Date"
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={(time) => {
          setRescheduleTime(time);
          setShowTimePicker(false);
        }}
        selectedTime={rescheduleTime || undefined}
        format="12"
        timeInterval={15}
        restrictedHours={{
          start: "06:00 AM",
          end: "10:00 PM",
        }}
        showPresets={true}
        title="Select New Visit Time"
      />
    </Header>
  );
}